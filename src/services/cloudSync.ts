import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { getSupabaseClient, getSavedSupabaseConfig } from '../lib/supabase';
import { BusinessCardProfile } from '../types';

export const CARD_DOC_ID = 'kongo_main_profile';

export type SyncBackendType = 'firebase' | 'supabase' | 'dual' | 'offline';

export interface CloudSyncStatus {
  backend: SyncBackendType;
  isConnected: boolean;
  lastSyncedAt: Date | null;
  supabaseConfigured: boolean;
}

/**
 * Strips huge binary blobs (> 750KB) that could exceed Firestore's 1MB limit.
 * Instead, advises using cloud URL or Supabase storage.
 */
function sanitizeProfileForCloud(profile: BusinessCardProfile): Record<string, any> {
  const clean = { ...profile };

  // Check avatar URL size
  if (clean.avatarUrl && clean.avatarUrl.length > 750000) {
    console.warn('Avatar base64 image exceeds 750KB limit for cloud sync. Keeping previous or please use URL.');
  }

  // Ensure showcaseVideos don't include gigabyte base64 strings in Firestore doc
  if (clean.showcaseVideos) {
    clean.showcaseVideos = clean.showcaseVideos.map((v) => {
      if (v.videoUrl && v.videoUrl.startsWith('data:') && v.videoUrl.length > 500000) {
        return {
          ...v,
          videoUrl: '', // Keep metadata, omit massive data URI to prevent Firestore 1MB reject
          description: `${v.description || ''} (Fichier lourd local)`,
        };
      }
      return v;
    });
  }

  return {
    ...clean,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Subscribes to real-time changes across readers.
 * Triggers callback whenever the card profile is updated on the cloud.
 */
export function subscribeToProfileChanges(
  onUpdate: (profile: Partial<BusinessCardProfile>) => void,
  onStatusChange?: (status: CloudSyncStatus) => void
): () => void {
  let unsubFirestore: (() => void) | null = null;
  let supabaseChannel: any = null;

  const currentStatus: CloudSyncStatus = {
    backend: 'firebase',
    isConnected: false,
    lastSyncedAt: null,
    supabaseConfigured: !!getSupabaseClient(),
  };

  // 1. Firebase Firestore Real-time Listener (Universal & Active by default)
  try {
    const profileRef = doc(db, 'profiles', CARD_DOC_ID);
    unsubFirestore = onSnapshot(
      profileRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const cloudData = snapshot.data() as Partial<BusinessCardProfile>;
          currentStatus.isConnected = true;
          currentStatus.lastSyncedAt = new Date();
          onStatusChange?.({ ...currentStatus });
          onUpdate(cloudData);
        } else {
          currentStatus.isConnected = true;
          onStatusChange?.({ ...currentStatus });
        }
      },
      (error) => {
        console.warn('Firestore snapshot error:', error);
        currentStatus.isConnected = false;
        onStatusChange?.({ ...currentStatus });
      }
    );
  } catch (err) {
    console.error('Failed to attach Firestore listener:', err);
  }

  // 2. Supabase Real-time Channel (if configured)
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      currentStatus.backend = 'dual';
      currentStatus.supabaseConfigured = true;
      const config = getSavedSupabaseConfig();
      const tableName = config.tableName || 'digital_cards';

      supabaseChannel = supabase
        .channel('kongo_card_realtime')
        .on('broadcast', { event: 'profile_updated' }, (payload: any) => {
          if (payload?.payload?.profile) {
            currentStatus.lastSyncedAt = new Date();
            onStatusChange?.({ ...currentStatus });
            onUpdate(payload.payload.profile);
          }
        })
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tableName },
          (payload: any) => {
            if (payload?.new?.profile_data) {
              currentStatus.lastSyncedAt = new Date();
              onStatusChange?.({ ...currentStatus });
              onUpdate(payload.new.profile_data);
            }
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            currentStatus.isConnected = true;
            onStatusChange?.({ ...currentStatus });
          }
        });
    } catch (e) {
      console.warn('Supabase real-time subscribe failed:', e);
    }
  }

  return () => {
    if (unsubFirestore) {
      unsubFirestore();
    }
    if (supabase && supabaseChannel) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}

/**
 * Saves profile updates to Cloud backends in real time.
 */
export async function saveProfileToCloud(profile: BusinessCardProfile): Promise<{ success: boolean; error?: string }> {
  let firestoreSuccess = false;
  let supabaseSuccess = false;
  const sanitized = sanitizeProfileForCloud(profile);

  // 1. Save to Firebase Firestore
  try {
    const profileRef = doc(db, 'profiles', CARD_DOC_ID);
    await setDoc(profileRef, sanitized, { merge: true });
    firestoreSuccess = true;
  } catch (err: any) {
    console.warn('Could not save to Firestore:', err);
  }

  // 2. Save / Broadcast to Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const config = getSavedSupabaseConfig();
      const tableName = config.tableName || 'digital_cards';

      // Broadcast event for zero-latency cross-tab/cross-user updates
      await supabase.channel('kongo_card_realtime').send({
        type: 'broadcast',
        event: 'profile_updated',
        payload: { profile: sanitized, timestamp: Date.now() },
      });

      // Also upsert into table if table exists
      try {
        await supabase
          .from(tableName)
          .upsert({ id: CARD_DOC_ID, profile_data: sanitized, updated_at: new Date().toISOString() });
      } catch {
        // Table might not exist yet, broadcast is sufficient for real-time
      }
      supabaseSuccess = true;
    } catch (err: any) {
      console.warn('Supabase save failed:', err);
    }
  }

  if (firestoreSuccess || supabaseSuccess) {
    return { success: true };
  }

  return { success: false, error: 'La sauvegarde cloud a échoué. Le cache local reste préservé.' };
}

/**
 * Fetches the initial profile from Firestore on first load.
 */
export async function fetchInitialCloudProfile(): Promise<Partial<BusinessCardProfile> | null> {
  try {
    const profileRef = doc(db, 'profiles', CARD_DOC_ID);
    const snap = await getDoc(profileRef);
    if (snap.exists()) {
      return snap.data() as Partial<BusinessCardProfile>;
    }
  } catch (err) {
    console.warn('Failed to fetch initial cloud profile:', err);
  }

  // Fallback to Supabase if configured
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const config = getSavedSupabaseConfig();
      const { data } = await supabase
        .from(config.tableName || 'digital_cards')
        .select('profile_data')
        .eq('id', CARD_DOC_ID)
        .single();
      if (data?.profile_data) {
        return data.profile_data as Partial<BusinessCardProfile>;
      }
    } catch {
      // ignore
    }
  }

  return null;
}
