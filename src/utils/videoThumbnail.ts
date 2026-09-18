/**
 * Utility to extract a poster thumbnail frame and duration from an uploaded video file
 */
export function extractVideoMetadata(file: File): Promise<{ posterUrl: string; duration: string }> {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      video.onloadedmetadata = () => {
        // Format duration mm:ss
        const totalSeconds = Math.floor(video.duration || 0);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const formattedDuration = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        // Seek to 1 second or 10% to capture representative frame
        video.currentTime = Math.min(1.5, (video.duration || 2) / 4);

        video.onseeked = () => {
          let posterUrl = '';
          try {
            const canvas = document.createElement('canvas');
            canvas.width = Math.min(video.videoWidth || 1280, 1280);
            canvas.height = Math.min(video.videoHeight || 720, 720);
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              posterUrl = canvas.toDataURL('image/jpeg', 0.85);
            }
          } catch {
            // Ignore canvas taint errors if any
          }
          URL.revokeObjectURL(objectUrl);
          resolve({ posterUrl, duration: formattedDuration });
        };
      };

      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve({ posterUrl: '', duration: '00:00' });
      };
    } catch {
      resolve({ posterUrl: '', duration: '00:00' });
    }
  });
}
