import { getSupabaseClient, getSavedSupabaseConfig } from '../lib/supabase';

export interface VideoUploadProgress {
  status: 'idle' | 'extracting' | 'uploading' | 'success' | 'error';
  progress?: number;
  message?: string;
  publicUrl?: string;
}

export const SUPABASE_STORAGE_SQL = `-- 1. Création du bucket public 'videos'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('videos', 'videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Politiques de stockage pour permettre le téléversement et le streaming
CREATE POLICY "Public Videos Read" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'videos');

CREATE POLICY "Public Videos Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'videos');

CREATE POLICY "Public Videos Update" 
ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'videos');`;

/**
 * Uploads a video file to Supabase Storage and returns its permanent public HTTPS URL.
 * Works across all devices (phones, tablets, PCs).
 */
export async function uploadVideoToSupabase(
  videoId: 'video-1' | 'video-2',
  file: File,
  onProgress?: (status: VideoUploadProgress) => void
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {
      success: false,
      error: 'Supabase n\'est pas encore initialisé. Vérifiez vos identifiants dans la section Backend Cloud.',
    };
  }

  onProgress?.({
    status: 'uploading',
    message: 'Téléversement vers votre Cloud Supabase Storage en cours...',
  });

  const bucketName = 'videos';
  const fileExt = file.name.split('.').pop() || 'mp4';
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9_-]/g, '_');
  const filePath = `${videoId}_${Date.now()}_${sanitizedName}.${fileExt}`;

  try {
    // 1. Attempt to create bucket if it doesn't exist
    try {
      await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 104857600, // 100MB
      });
    } catch {
      // Bucket might already exist or need dashboard policy, continue
    }

    // 2. Upload video file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type || 'video/mp4',
      });

    if (uploadError) {
      console.warn('Supabase storage upload error:', uploadError);
      
      // If error is bucket not found or row-level security policy
      if (
        uploadError.message?.includes('Bucket not found') ||
        uploadError.message?.includes('bucket') ||
        uploadError.message?.includes('row-level security') ||
        uploadError.message?.includes('policy')
      ) {
        return {
          success: false,
          error: `Le bucket Supabase "videos" nécessite d'être créé en mode public dans votre console Supabase Storage. (Voir script SQL ci-dessous)`,
        };
      }

      return {
        success: false,
        error: `Échec du téléversement : ${uploadError.message}`,
      };
    }

    // 3. Obtain permanent public HTTPS URL
    const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    const publicUrl = urlData.publicUrl;

    if (!publicUrl) {
      return {
        success: false,
        error: 'Impossible d\'obtenir l\'URL publique de la vidéo.',
      };
    }

    onProgress?.({
      status: 'success',
      message: 'Vidéo téléversée avec succès sur le Cloud Supabase !',
      publicUrl,
    });

    return { success: true, url: publicUrl };
  } catch (err: any) {
    console.error('Error during Supabase video upload:', err);
    return {
      success: false,
      error: err?.message || 'Erreur inattendue lors de l\'envoi vers Supabase Storage.',
    };
  }
}

/**
 * Uploads video poster thumbnail to Supabase Storage
 */
export async function uploadPosterToSupabase(
  videoId: string,
  dataUrl: string
): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !dataUrl.startsWith('data:image/')) return null;

  try {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const filePath = `posters/${videoId}_${Date.now()}.jpg`;

    const { error } = await supabase.storage.from('videos').upload(filePath, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

    if (!error) {
      const { data } = supabase.storage.from('videos').getPublicUrl(filePath);
      return data.publicUrl;
    }
  } catch {
    // Non-blocking fallback
  }

  return null;
}
