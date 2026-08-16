import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export interface UploadProgressInfo {
  progress: number; // 0 to 100
  bytesTransferred: number;
  totalBytes: number;
  speedBps: number; // bytes per second
  formattedProgress: string; // e.g. "2.4 MB / 10.5 MB (450 KB/s)"
  stage: 'preparing' | 'compressing' | 'uploading' | 'verifying' | 'completed' | 'error';
}

export interface UploadResult {
  url: string;
  fileName: string;
  fileSize: string;
  bytes: number;
  contentType: string;
  provider: 'firebase-storage' | 'server-api' | 'data-url';
}

export interface UploadOptions {
  folder?: string;
  maxSizeMB?: number;
  accept?: string;
  optimizeImages?: boolean;
  onProgress?: (info: UploadProgressInfo) => void;
  signal?: AbortSignal;
}

/**
 * Format raw byte count into human readable units (B, KB, MB, GB)
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Sanitize filename to prevent directory traversal, strange unicode, and URI errors
 */
export function sanitizeFileName(name: string): string {
  // Remove path separators
  const baseName = name.replace(/^.*[\\\/]/, '');
  const lastDotIndex = baseName.lastIndexOf('.');
  
  if (lastDotIndex === -1) {
    return baseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 100);
  }
  
  const rawName = baseName.substring(0, lastDotIndex);
  const ext = baseName.substring(lastDotIndex).toLowerCase().replace(/[^a-z0-9.]/g, '');
  const cleanName = rawName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 80);
  
  return `${cleanName}${ext}`;
}

/**
 * Validate file against allowed mime types and maximum file size
 */
export function validateFile(
  file: File,
  options?: { maxSizeMB?: number; accept?: string }
): { valid: boolean; error?: string } {
  const maxSizeMB = options?.maxSizeMB ?? 50;
  const accept = options?.accept ?? '*';

  // Size validation
  if (file.size > maxSizeMB * 1024 * 1024) {
    return {
      valid: false,
      error: `File size (${formatBytes(file.size)}) exceeds maximum limit of ${maxSizeMB} MB.`
    };
  }

  // Type validation
  if (!accept || accept === '*' || accept === '*/*') {
    return { valid: true };
  }

  const allowedRules = accept.split(',').map(r => r.trim().toLowerCase());
  const fileName = file.name.toLowerCase();
  const fileMime = (file.type || '').toLowerCase();

  const matches = allowedRules.some(rule => {
    if (rule.startsWith('.')) {
      return fileName.endsWith(rule);
    }
    if (rule.endsWith('/*')) {
      const prefix = rule.slice(0, -2);
      return fileMime.startsWith(prefix);
    }
    if (rule === 'application/pdf' && fileName.endsWith('.pdf')) {
      return true;
    }
    return fileMime === rule;
  });

  if (!matches) {
    return {
      valid: false,
      error: `File type "${file.type || fileName.split('.').pop()}" is not supported. Allowed: ${accept}`
    };
  }

  return { valid: true };
}

/**
 * Client-side canvas compression for photographic images
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.85
): Promise<Blob | File> {
  const imageTypesToCompress = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!imageTypesToCompress.includes(file.type.toLowerCase())) {
    return file; // Skip SVG, GIF, ICO, or non-images
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          outputMime,
          quality
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

/**
 * Convert file to base64 Data URL
 */
export function fileToDataURL(fileOrBlob: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}

/**
 * Resilient multi-tier upload pipeline:
 * Tier 1: Firebase Storage Resumable Upload with real-time speed & byte tracking
 * Tier 2: Server API endpoint /api/upload
 * Tier 3: Local Data URL fallback for small assets
 */
export async function uploadFilePipeline(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const {
    folder = 'edulpha/uploads',
    maxSizeMB = 50,
    accept = '*',
    optimizeImages = true,
    onProgress,
    signal
  } = options;

  // 1. Validation
  const validation = validateFile(file, { maxSizeMB, accept });
  if (!validation.valid) {
    throw new Error(validation.error || 'File validation failed');
  }

  if (signal?.aborted) {
    throw new Error('Upload cancelled by user');
  }

  // 2. Optimization
  let uploadPayload: Blob | File = file;
  if (optimizeImages && file.type.startsWith('image/')) {
    onProgress?.({
      progress: 5,
      bytesTransferred: 0,
      totalBytes: file.size,
      speedBps: 0,
      formattedProgress: 'Compressing image...',
      stage: 'compressing'
    });
    uploadPayload = await compressImage(file);
  }

  const safeName = sanitizeFileName(file.name);
  const timestamp = Date.now();
  const storagePath = `${folder}/${timestamp}_${safeName}`;
  const totalBytes = uploadPayload.size;

  let lastBytes = 0;
  let lastTime = Date.now();
  let currentSpeed = 0;

  // Tier 1: Try Firebase Storage Client SDK
  try {
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, uploadPayload, {
      contentType: file.type || 'application/octet-stream',
      customMetadata: {
        originalName: file.name,
        uploadedAt: new Date().toISOString()
      }
    });

    if (signal) {
      signal.addEventListener('abort', () => {
        uploadTask.cancel();
      });
    }

    const firebasePromise = new Promise<string>((resolve, reject) => {
      let inactivityTimer: any = null;

      const resetWatchdog = () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        // Watchdog: If zero progress for 45 seconds, abort Tier 1 and fallback to Tier 2
        inactivityTimer = setTimeout(() => {
          uploadTask.cancel();
          reject(new Error('Firebase Storage stalled. Switching to server upload pipeline.'));
        }, 45000);
      };

      resetWatchdog();

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          resetWatchdog();
          const transferred = snapshot.bytesTransferred;
          const total = snapshot.totalBytes || totalBytes || 1;
          const percentage = Math.min(99, Math.round((transferred / total) * 100));

          const now = Date.now();
          const timeDelta = (now - lastTime) / 1000;
          if (timeDelta >= 0.5) {
            currentSpeed = (transferred - lastBytes) / timeDelta;
            lastBytes = transferred;
            lastTime = now;
          }

          const speedFormatted = currentSpeed > 0 ? `(${formatBytes(currentSpeed)}/s)` : '';
          const progressText = `${formatBytes(transferred)} / ${formatBytes(total)} ${speedFormatted}`;

          onProgress?.({
            progress: percentage,
            bytesTransferred: transferred,
            totalBytes: total,
            speedBps: currentSpeed,
            formattedProgress: progressText,
            stage: 'uploading'
          });
        },
        (error) => {
          if (inactivityTimer) clearTimeout(inactivityTimer);
          reject(error);
        },
        async () => {
          if (inactivityTimer) clearTimeout(inactivityTimer);
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (err) {
            reject(err);
          }
        }
      );
    });

    const firebaseUrl = await firebasePromise;
    onProgress?.({
      progress: 100,
      bytesTransferred: totalBytes,
      totalBytes,
      speedBps: 0,
      formattedProgress: 'Completed',
      stage: 'completed'
    });

    return {
      url: firebaseUrl,
      fileName: safeName,
      fileSize: formatBytes(totalBytes),
      bytes: totalBytes,
      contentType: file.type,
      provider: 'firebase-storage'
    };
  } catch (tier1Err: any) {
    if (signal?.aborted) {
      throw new Error('Upload cancelled by user');
    }
    console.warn('[UploadPipeline] Tier 1 (Firebase Client) bypassed, trying Tier 2 (Server API):', tier1Err.message || tier1Err);
  }

  // Tier 2: Server API Upload (/api/upload)
  try {
    onProgress?.({
      progress: 50,
      bytesTransferred: Math.round(totalBytes * 0.5),
      totalBytes,
      speedBps: 0,
      formattedProgress: 'Routing via Server Upload...',
      stage: 'uploading'
    });

    const dataUrl = await fileToDataURL(uploadPayload);
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileData: dataUrl,
        fileName: safeName,
        fileType: file.type || 'application/octet-stream',
        folder
      }),
      signal
    });

    if (response.ok) {
      const data = await response.json();
      if (data.url) {
        onProgress?.({
          progress: 100,
          bytesTransferred: totalBytes,
          totalBytes,
          speedBps: 0,
          formattedProgress: 'Completed',
          stage: 'completed'
        });

        return {
          url: data.url,
          fileName: safeName,
          fileSize: formatBytes(totalBytes),
          bytes: totalBytes,
          contentType: file.type,
          provider: 'server-api'
        };
      }
    }
  } catch (tier2Err: any) {
    if (signal?.aborted) {
      throw new Error('Upload cancelled by user');
    }
    console.warn('[UploadPipeline] Tier 2 (Server API) failed:', tier2Err.message || tier2Err);
  }

  // Tier 3: Data URL fallback (if small)
  if (totalBytes < 4 * 1024 * 1024) {
    const fallbackDataUrl = await fileToDataURL(uploadPayload);
    onProgress?.({
      progress: 100,
      bytesTransferred: totalBytes,
      totalBytes,
      speedBps: 0,
      formattedProgress: 'Saved',
      stage: 'completed'
    });

    return {
      url: fallbackDataUrl,
      fileName: safeName,
      fileSize: formatBytes(totalBytes),
      bytes: totalBytes,
      contentType: file.type,
      provider: 'data-url'
    };
  }

  throw new Error('Failed to upload file. Please check your internet connection and retry.');
}
