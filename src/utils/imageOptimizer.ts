/**
 * Image optimization utility for fast mobile loading and reliable Cloud/Firestore sync.
 * Resizes large camera photos (e.g. 5MB - 15MB) into lightweight, high-definition images (~60KB - 120KB)
 * that comply with Firestore's 1MB document size limit and load instantaneously on smartphones.
 */

export async function optimizeImageForWeb(
  source: File | Blob | string,
  maxWidth = 1280,
  maxHeight = 720,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    let srcUrl = '';
    let shouldRevoke = false;

    if (typeof source === 'string') {
      srcUrl = source;
    } else {
      srcUrl = URL.createObjectURL(source);
      shouldRevoke = true;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width <= 0 || height <= 0) {
          if (shouldRevoke) URL.revokeObjectURL(srcUrl);
          resolve(srcUrl);
          return;
        }

        // Calculate aspect-ratio preserving dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight * 1.5) {
          width = Math.round((width * (maxHeight * 1.5)) / height);
          height = Math.round(maxHeight * 1.5);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          if (shouldRevoke) URL.revokeObjectURL(srcUrl);
          resolve(srcUrl);
          return;
        }

        // Smooth image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized JPEG format
        const optimizedDataUrl = canvas.toDataURL('image/jpeg', quality);

        if (shouldRevoke) URL.revokeObjectURL(srcUrl);
        resolve(optimizedDataUrl);
      } catch (err) {
        if (shouldRevoke) URL.revokeObjectURL(srcUrl);
        // Fallback to original
        if (typeof source === 'string') resolve(source);
        else resolve(srcUrl);
      }
    };

    img.onerror = () => {
      if (shouldRevoke) URL.revokeObjectURL(srcUrl);
      if (typeof source === 'string') resolve(source);
      else reject(new Error('Impossible de charger le fichier image.'));
    };

    img.src = srcUrl;
  });
}
