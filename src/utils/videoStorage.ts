// IndexedDB storage for video files (supports large MP4/WebM files without localStorage limits)

const DB_NAME = 'kongo_digital_video_db';
const DB_VERSION = 1;
const STORE_NAME = 'showcase_videos';

export interface StoredVideoRecord {
  id: string; // 'video-1' | 'video-2'
  blob: Blob;
  name: string;
  type: string;
  size: number;
  updatedAt: number;
}

// In-memory cache of created object URLs to prevent memory leaks and redundant creations
const objectUrlCache: Map<string, string> = new Map();

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB non supporté'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Save a video file to IndexedDB and return an Object URL
 */
export async function saveVideoFile(videoId: string, file: File): Promise<string> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    const record: StoredVideoRecord = {
      id: videoId,
      blob: file,
      name: file.name,
      type: file.type || 'video/mp4',
      size: file.size,
      updatedAt: Date.now(),
    };

    const request = store.put(record);

    request.onsuccess = () => {
      // Revoke old object URL if exists
      if (objectUrlCache.has(videoId)) {
        try {
          URL.revokeObjectURL(objectUrlCache.get(videoId)!);
        } catch {
          // ignore
        }
      }

      // Create and cache new object URL
      const objectUrl = URL.createObjectURL(file);
      objectUrlCache.set(videoId, objectUrl);
      resolve(objectUrl);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Get stored video object URL by videoId, or null if none stored
 */
export async function getStoredVideoUrl(videoId: string): Promise<string | null> {
  // Return cached URL if valid
  if (objectUrlCache.has(videoId)) {
    return objectUrlCache.get(videoId)!;
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(videoId);

      request.onsuccess = () => {
        const record = request.result as StoredVideoRecord | undefined;
        if (record && record.blob) {
          const objectUrl = URL.createObjectURL(record.blob);
          objectUrlCache.set(videoId, objectUrl);
          resolve(objectUrl);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Get stored video record including the raw Blob from IndexedDB
 */
export async function getStoredVideoRecord(videoId: string): Promise<StoredVideoRecord | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(videoId);

      request.onsuccess = () => {
        const record = request.result as StoredVideoRecord | undefined;
        resolve(record || null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

/**
 * Delete a stored video from IndexedDB
 */
export async function deleteStoredVideo(videoId: string): Promise<void> {
  if (objectUrlCache.has(videoId)) {
    try {
      URL.revokeObjectURL(objectUrlCache.get(videoId)!);
    } catch {
      // ignore
    }
    objectUrlCache.delete(videoId);
  }

  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(videoId);

      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
    });
  } catch {
    // ignore
  }
}
