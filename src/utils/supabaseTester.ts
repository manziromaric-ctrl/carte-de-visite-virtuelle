import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSavedSupabaseConfig, getSupabaseClient, SupabaseConfig } from '../lib/supabase';

export interface SupabaseTestStep {
  id: 'init' | 'select' | 'write' | 'read_back' | 'delete' | 'realtime';
  name: string;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  details?: string;
  durationMs?: number;
}

export interface SupabaseTestReport {
  overallSuccess: boolean;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  realtimeReady: boolean;
  steps: SupabaseTestStep[];
  error?: string;
  suggestedFix?: string;
  suggestedSql?: string;
  testedAt: string;
}

export const SUPABASE_FIX_SQL = `-- 1. Création ou vérification de la table 'digital_cards'
CREATE TABLE IF NOT EXISTS public.digital_cards (
  id TEXT PRIMARY KEY,
  profile_data JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Activation du Row Level Security (RLS)
ALTER TABLE public.digital_cards ENABLE ROW LEVEL SECURITY;

-- 3. Politique pour autoriser la LECTURE publique (tous les visiteurs)
DROP POLICY IF EXISTS "Lecture publique pour tous les visiteurs" ON public.digital_cards;
CREATE POLICY "Lecture publique pour tous les visiteurs" 
ON public.digital_cards FOR SELECT USING (true);

-- 4. Politique pour autoriser l'ÉCRITURE / MODIFICATION publique
DROP POLICY IF EXISTS "Mise à jour autorisée" ON public.digital_cards;
CREATE POLICY "Mise à jour autorisée" 
ON public.digital_cards FOR ALL USING (true);

-- 5. Activation du Temps Réel (Realtime Broadcast)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'digital_cards'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.digital_cards;
  END IF;
END $$;`;

/**
 * Executes an end-to-end read, write, verify, delete, and realtime test
 * to ensure that Supabase table permissions and policies are correctly configured.
 */
export async function runSupabasePermissionsTest(
  customConfig?: Partial<SupabaseConfig>,
  onStepChange?: (steps: SupabaseTestStep[]) => void
): Promise<SupabaseTestReport> {
  const cfg = { ...getSavedSupabaseConfig(), ...(customConfig || {}) };
  const tableName = cfg.tableName?.trim() || 'digital_cards';

  const steps: SupabaseTestStep[] = [
    { id: 'init', name: 'Initialisation du client Supabase', status: 'pending' },
    { id: 'select', name: `Permissions de lecture (SELECT) sur "${tableName}"`, status: 'pending' },
    { id: 'write', name: `Permissions d'écriture (INSERT / UPSERT) sur "${tableName}"`, status: 'pending' },
    { id: 'read_back', name: 'Vérification de persistance (Lecture de contrôle)', status: 'pending' },
    { id: 'delete', name: 'Nettoyage sécurisé (DELETE test probe)', status: 'pending' },
    { id: 'realtime', name: 'Canal temps réel (Realtime WebSocket)', status: 'pending' },
  ];

  const updateStep = (
    id: SupabaseTestStep['id'],
    status: SupabaseTestStep['status'],
    details?: string,
    durationMs?: number
  ) => {
    const s = steps.find((step) => step.id === id);
    if (s) {
      s.status = status;
      if (details !== undefined) s.details = details;
      if (durationMs !== undefined) s.durationMs = durationMs;
      onStepChange?.([...steps]);
    }
  };

  let client: SupabaseClient | null = null;
  let canRead = false;
  let canWrite = false;
  let canDelete = false;
  let realtimeReady = false;
  let testError: string | undefined;
  let suggestedFix: string | undefined;

  // STEP 1: INITIALIZE CLIENT
  updateStep('init', 'running', 'Vérification des identifiants URL et clé publique...');
  const t0 = performance.now();

  if (!cfg.url || !cfg.anonKey) {
    updateStep('init', 'error', 'URL ou clé anonyme manquante.', Math.round(performance.now() - t0));
    return {
      overallSuccess: false,
      canRead: false,
      canWrite: false,
      canDelete: false,
      realtimeReady: false,
      steps,
      error: 'Veuillez saisir votre URL de projet Supabase et votre clé "anon".',
      suggestedFix: 'Rendez-vous dans Supabase > Project Settings > API pour copier votre Project URL et clé anon.',
      testedAt: new Date().toLocaleTimeString(),
    };
  }

  if (!cfg.url.startsWith('https://')) {
    updateStep('init', 'error', 'L\'URL doit débuter par https://', Math.round(performance.now() - t0));
    return {
      overallSuccess: false,
      canRead: false,
      canWrite: false,
      canDelete: false,
      realtimeReady: false,
      steps,
      error: 'Format d\'URL invalide. Doit être https://xxxx.supabase.co',
      testedAt: new Date().toLocaleTimeString(),
    };
  }

  try {
    client = createClient(cfg.url, cfg.anonKey, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } },
    });
    updateStep('init', 'success', `Connecté à ${new URL(cfg.url).hostname}`, Math.round(performance.now() - t0));
  } catch (err: any) {
    updateStep('init', 'error', err?.message || 'Échec d\'initialisation', Math.round(performance.now() - t0));
    return {
      overallSuccess: false,
      canRead: false,
      canWrite: false,
      canDelete: false,
      realtimeReady: false,
      steps,
      error: `Erreur d'initialisation du client : ${err?.message}`,
      testedAt: new Date().toLocaleTimeString(),
    };
  }

  // STEP 2: TEST READ (SELECT)
  updateStep('select', 'running', `Interrogation SELECT sur la table "${tableName}"...`);
  const t1 = performance.now();

  try {
    const { data, error } = await client.from(tableName).select('id, updated_at').limit(1);

    if (error) {
      // Analyze error
      if (error.code === '42P01' || error.message?.includes('does not exist')) {
        updateStep('select', 'error', `La table "${tableName}" n'existe pas encore dans Supabase.`, Math.round(performance.now() - t1));
        testError = `La table "${tableName}" n'a pas encore été créée dans votre base Supabase.`;
        suggestedFix = `Ouvrez la console Supabase > SQL Editor, collez le script ci-dessous et cliquez sur "Run".`;
      } else if (error.code === '42501' || error.message?.includes('permission denied') || error.message?.includes('violates row-level security')) {
        updateStep('select', 'error', `Permission SELECT refusée par les politiques de sécurité RLS.`, Math.round(performance.now() - t1));
        testError = `Les permissions de lecture (RLS) bloquent l'accès aux cartes.`;
        suggestedFix = `Ajoutez la politique "SELECT" publique sur la table "${tableName}".`;
      } else if (error.message?.includes('JWT') || error.message?.includes('API key') || error.code === '401') {
        updateStep('select', 'error', `Clé "anon" invalide ou expirée pour ce projet.`, Math.round(performance.now() - t1));
        testError = `La clé anonyme n'est pas autorisée par Supabase.`;
        suggestedFix = `Vérifiez la clé publique "anon" dans Project Settings > API.`;
      } else {
        updateStep('select', 'error', `Erreur code ${error.code}: ${error.message}`, Math.round(performance.now() - t1));
        testError = error.message;
      }
    } else {
      canRead = true;
      updateStep('select', 'success', `Lecture autorisée (${data?.length ?? 0} ligne(s) scannée(s))`, Math.round(performance.now() - t1));
    }
  } catch (err: any) {
    updateStep('select', 'error', err?.message || 'Erreur réseau', Math.round(performance.now() - t1));
    testError = err?.message;
  }

  // STEP 3: TEST WRITE (INSERT / UPSERT)
  const probeId = `__probe_perm_test_${Date.now()}__`;
  const probePayload = {
    id: probeId,
    profile_data: {
      tester: 'Kongo Digital Card Permissions Check',
      timestamp: new Date().toISOString(),
      probe: true,
    },
    updated_at: new Date().toISOString(),
  };

  updateStep('write', 'running', `Tentative d'écriture (UPSERT probe ${probeId})...`);
  const t2 = performance.now();

  try {
    const { error: writeError } = await client.from(tableName).upsert(probePayload);

    if (writeError) {
      if (writeError.code === '42501' || writeError.message?.includes('row-level security') || writeError.message?.includes('policy')) {
        updateStep('write', 'error', `Écriture bloquée par Row-Level Security (politique d'écriture manquante)`, Math.round(performance.now() - t2));
        testError = testError || `Le Row-Level Security (RLS) bloque les écritures anonymes sur "${tableName}".`;
        suggestedFix = suggestedFix || `Activez la politique INSERT/UPDATE publique avec le script SQL ci-dessous.`;
      } else if (writeError.code === '42P01') {
        updateStep('write', 'error', `Table introuvable.`, Math.round(performance.now() - t2));
      } else {
        updateStep('write', 'error', `Erreur d'écriture: ${writeError.message}`, Math.round(performance.now() - t2));
        testError = testError || writeError.message;
      }
    } else {
      canWrite = true;
      updateStep('write', 'success', `Écriture / UPSERT autorisée avec succès`, Math.round(performance.now() - t2));
    }
  } catch (err: any) {
    updateStep('write', 'error', err?.message || 'Erreur écriture', Math.round(performance.now() - t2));
    testError = testError || err?.message;
  }

  // STEP 4: READ BACK VERIFICATION
  if (canWrite) {
    updateStep('read_back', 'running', `Vérification de persistance du document de test...`);
    const t3 = performance.now();
    try {
      const { data: readData, error: readError } = await client
        .from(tableName)
        .select('id, profile_data, updated_at')
        .eq('id', probeId)
        .single();

      if (readError || !readData) {
        updateStep('read_back', 'warning', `Écriture réussie mais lecture du document impossible (${readError?.message || 'non trouvé'})`, Math.round(performance.now() - t3));
      } else {
        updateStep('read_back', 'success', `Donnée vérifiée et persistée dans Supabase`, Math.round(performance.now() - t3));
      }
    } catch (err: any) {
      updateStep('read_back', 'warning', `Contrôle de lecture en échec: ${err?.message}`, Math.round(performance.now() - t3));
    }
  } else {
    updateStep('read_back', 'warning', `Ignorée car l'écriture n'a pas pu être effectuée`);
  }

  // STEP 5: CLEANUP (DELETE PROBE)
  if (canWrite) {
    updateStep('delete', 'running', `Suppression du document de test pour garder la table propre...`);
    const t4 = performance.now();
    try {
      const { error: delError } = await client.from(tableName).delete().eq('id', probeId);
      if (!delError) {
        canDelete = true;
        updateStep('delete', 'success', `Nettoyage terminé (document probe supprimé)`, Math.round(performance.now() - t4));
      } else {
        updateStep('delete', 'warning', `Nettoyage impossible (Politique DELETE restrictive) : ${delError.message}`, Math.round(performance.now() - t4));
      }
    } catch (err: any) {
      updateStep('delete', 'warning', `Erreur lors de la suppression: ${err?.message}`, Math.round(performance.now() - t4));
    }
  } else {
    updateStep('delete', 'warning', `Ignorée (aucun document de test injecté)`);
  }

  // STEP 6: REALTIME SUBSCRIPTION TEST
  updateStep('realtime', 'running', `Test de connexion au canal Realtime WebSocket...`);
  const t5 = performance.now();

  try {
    const channelName = `probe_realtime_${Date.now()}`;
    const testChannel = client.channel(channelName);

    const realtimePromise = new Promise<boolean>((resolve) => {
      const timeout = setTimeout(() => {
        resolve(false);
      }, 3500);

      testChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout);
          resolve(true);
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timeout);
          resolve(false);
        }
      });
    });

    realtimeReady = await realtimePromise;
    try {
      client.removeChannel(testChannel);
    } catch {
      // ignore
    }

    if (realtimeReady) {
      updateStep('realtime', 'success', `Canal Realtime connecté et actif (SUBSCRIBED)`, Math.round(performance.now() - t5));
    } else {
      updateStep('realtime', 'warning', `Délai d'attente Realtime dépassé (>3.5s) ou publication postgres non activée`, Math.round(performance.now() - t5));
    }
  } catch (err: any) {
    updateStep('realtime', 'warning', `Realtime non joignable: ${err?.message}`, Math.round(performance.now() - t5));
  }

  const overallSuccess = canRead && canWrite;

  return {
    overallSuccess,
    canRead,
    canWrite,
    canDelete,
    realtimeReady,
    steps,
    error: overallSuccess ? undefined : testError,
    suggestedFix: overallSuccess ? undefined : suggestedFix,
    suggestedSql: overallSuccess ? undefined : SUPABASE_FIX_SQL,
    testedAt: new Date().toLocaleTimeString(),
  };
}
