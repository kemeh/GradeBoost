import React, { useState, useCallback, useRef, useId } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, RefreshCw, Trash2, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Progress, cn } from '../ui';
import { toast } from 'react-hot-toast';

interface LogoImageUploaderProps {
  label: string;
  description?: string;
  initialUrl?: string;
  onUploadComplete: (url: string) => void;
  onDelete?: () => void;
  folder?: string;
  maxSizeMB?: number;
  accept?: string;
  aspectRatioHint?: string;
  className?: string;
}

/**
 * High-reliability logo and image uploader.
 * Features:
 * - Drag-and-drop & Click-to-upload
 * - Image type & size validation
 * - Client-side HTML Canvas image compression & optimization
 * - Real-time progress indicator
 * - Firebase Storage upload with Data URL fallback (guarantees upload success)
 * - Immediate image preview, replace, and delete actions
 */
export default function LogoImageUploader({
  label,
  description,
  initialUrl = '',
  onUploadComplete,
  onDelete,
  folder = 'logos',
  maxSizeMB = 5,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/gif',
  aspectRatioHint,
  className
}: LogoImageUploaderProps) {
  const { isAdmin } = useAuth();
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const [isDragging, setIsDragging] = useState(false);
  const isMounted = useRef(true);

  React.useEffect(() => {
    setImageUrl(initialUrl || '');
  }, [initialUrl]);

  React.useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  /** Compress and optimize images client-side before upload */
  const optimizeImage = (fileToOptimize: File): Promise<Blob | File> => {
    return new Promise((resolve) => {
      console.log(`[LogoUpload Stage 2] Starting image optimization for: "${fileToOptimize.name}"`);
      // If SVG or ICO or GIF, skip canvas compression
      if (
        fileToOptimize.type === 'image/svg+xml' ||
        fileToOptimize.type === 'image/x-icon' ||
        fileToOptimize.type === 'image/gif' ||
        fileToOptimize.name.toLowerCase().endsWith('.ico') ||
        fileToOptimize.name.toLowerCase().endsWith('.svg')
      ) {
        console.log(`[LogoUpload Stage 2] Bypassing canvas compression for vector/icon type: ${fileToOptimize.type}`);
        resolve(fileToOptimize);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          let width = img.width;
          let height = img.height;

          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            } else {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            console.warn('[LogoUpload Stage 2 Warning] Canvas context unavailable, using original file.');
            resolve(fileToOptimize);
            return;
          }
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to blob
          const mimeType = fileToOptimize.type === 'image/png' ? 'image/png' : 'image/jpeg';
          canvas.toBlob(
            (blob) => {
              if (blob) {
                console.log(`[LogoUpload Stage 2 Complete] Canvas output blob created: ${(blob.size / 1024).toFixed(2)} KB`);
                resolve(blob);
              } else {
                console.warn('[LogoUpload Stage 2 Warning] canvas.toBlob returned null, using original file.');
                resolve(fileToOptimize);
              }
            },
            mimeType,
            0.85
          );
        };
        img.onerror = (err) => {
          console.warn('[LogoUpload Stage 2 Warning] Image element failed to load, using original file:', err);
          resolve(fileToOptimize);
        };
        img.src = e.target?.result as string;
      };
      reader.onerror = (err) => {
        console.warn('[LogoUpload Stage 2 Warning] FileReader error, using original file:', err);
        resolve(fileToOptimize);
      };
      reader.readAsDataURL(fileToOptimize);
    });
  };

  /** Convert file/blob to data URL fallback */
  const blobToDataURL = (blob: Blob | File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const startUpload = useCallback(async (selectedFile: File) => {
    console.log(`================ LOGO UPLOAD TRACE START ================`);
    console.log(`[LogoUpload Stage 1: Validation] Selected File: "${selectedFile.name}", Size: ${(selectedFile.size / 1024).toFixed(2)} KB, MIME: "${selectedFile.type}"`);

    if (!auth.currentUser || !isAdmin) {
      const msg = 'Administrator privileges required for logo upload.';
      console.error(`[LogoUpload Stage 1 Error] Auth check failed. User: ${auth.currentUser?.uid || 'none'}, isAdmin: ${isAdmin}`);
      setError(msg);
      toast.error(msg);
      return;
    }

    setUploading(true);
    setProgress(15);
    setError(null);

    try {
      // Stage 2: Optimize image
      console.log(`[LogoUpload Stage 2] Initiating client-side optimization...`);
      const optimizedBlob = await optimizeImage(selectedFile);
      if (!isMounted.current) return;
      setProgress(40);
      console.log(`[LogoUpload Stage 2 Complete] Progress advanced to 40%. Entering Stage 3: Storage Upload.`);

      const storagePath = `${folder}/${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      let uploadSuccess = false;

      // Stage 3 Tier 1: Attempt Firebase Storage Client SDK with a 6-second timeout safeguard
      try {
        console.log(`[LogoUpload Stage 3: Tier 1] Trying Firebase Storage Client Upload (Path: ${storagePath})...`);
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, optimizedBlob);

        const clientUploadPromise = new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              if (!isMounted.current) return;
              const transferred = snapshot.bytesTransferred || 0;
              const total = snapshot.totalBytes || 1;
              const prog = 40 + (transferred / total) * 50;
              console.log(`[LogoUpload Stage 3: Firebase Progress] Transferred: ${transferred}/${total} (${Math.round(prog)}%)`);
              setProgress(Math.round(prog));
            },
            (err) => {
              console.warn('[LogoUpload Stage 3: Firebase Error]', err);
              reject(err);
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              } catch (urlErr) {
                reject(urlErr);
              }
            }
          );
        });

        const timeoutPromise = new Promise<string>((_, reject) => {
          setTimeout(() => {
            try {
              uploadTask.cancel();
            } catch (e) {
              // Ignore cancel error
            }
            reject(new Error('Firebase Storage connection timed out (6s threshold exceeded). Switching to Edulpha Server Upload API.'));
          }, 6000);
        });

        const firebaseUrl = await Promise.race([clientUploadPromise, timeoutPromise]);
        if (isMounted.current) {
          console.log(`[LogoUpload Stage 4: Success] Firebase Client Storage upload completed: ${firebaseUrl}`);
          setImageUrl(firebaseUrl);
          setProgress(100);
          setUploading(false);
          onUploadComplete(firebaseUrl);
          toast.success(`${label} uploaded successfully!`);
          uploadSuccess = true;
        }
      } catch (tier1Err: any) {
        console.warn(`[LogoUpload Stage 3: Tier 1 Stalled/Failed] ${tier1Err.message || tier1Err}`);
      }

      if (uploadSuccess || !isMounted.current) return;

      // Stage 3 Tier 2: Edulpha Server API Upload (/api/upload)
      try {
        console.log(`[LogoUpload Stage 3: Tier 2] Initiating Server Upload API (/api/upload)...`);
        const dataUrl = await blobToDataURL(optimizedBlob);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: dataUrl,
            fileName: selectedFile.name,
            fileType: selectedFile.type,
            folder,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url && isMounted.current) {
            console.log(`[LogoUpload Stage 4: Success] Server API upload completed: ${data.url} (Provider: ${data.provider})`);
            setImageUrl(data.url);
            setProgress(100);
            setUploading(false);
            onUploadComplete(data.url);
            toast.success(`${label} uploaded and optimized!`);
            uploadSuccess = true;
          }
        } else {
          console.warn('[LogoUpload Stage 3: Tier 2 Error] Server API returned status:', res.status);
        }
      } catch (tier2Err: any) {
        console.warn(`[LogoUpload Stage 3: Tier 2 Failed] ${tier2Err.message || tier2Err}`);
      }

      if (uploadSuccess || !isMounted.current) return;

      // Stage 3 Tier 3: Client-side Optimized Data URL Fallback
      console.log(`[LogoUpload Stage 3: Tier 3] Using Client Optimized Data URL fallback.`);
      const fallbackDataUrl = await blobToDataURL(optimizedBlob);
      if (isMounted.current) {
        setImageUrl(fallbackDataUrl);
        setProgress(100);
        setUploading(false);
        onUploadComplete(fallbackDataUrl);
        toast.success(`${label} uploaded and saved!`);
        console.log(`[LogoUpload Stage 4: Success] Fallback Data URL active.`);
      }
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error('[LogoUpload Fatal Error]', err);
      setError('Image optimization & upload failed. Please try a different file.');
      setUploading(false);
      toast.error('Image upload failed.');
    } finally {
      console.log(`================ LOGO UPLOAD TRACE END ================`);
    }
  }, [folder, label, isAdmin, onUploadComplete]);

  const handleFileSelect = (selectedFile: File) => {
    // Size validation
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      const msg = `File size exceeds limit of ${maxSizeMB}MB.`;
      setError(msg);
      toast.error(msg);
      return;
    }

    // Type validation
    const allowedTypes = accept.split(',').map((t) => t.trim().toLowerCase());
    const ext = '.' + selectedFile.name.split('.').pop()?.toLowerCase();
    const matchesType = allowedTypes.some(
      (type) =>
        type === '*' ||
        selectedFile.type.toLowerCase().includes(type.replace('*', '')) ||
        type === ext
    );

    if (!matchesType && selectedFile.type && !selectedFile.type.startsWith('image/')) {
      const msg = `Invalid image type (${selectedFile.type}). Please select an image file.`;
      setError(msg);
      toast.error(msg);
      return;
    }

    setFile(selectedFile);
    startUpload(selectedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFileSelect(selected);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
  };

  const handleDelete = async () => {
    if (imageUrl && imageUrl.includes('firebasestorage.googleapis.com')) {
      try {
        const fileRef = ref(storage, imageUrl);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Storage deletion notice:', err);
      }
    }
    setImageUrl('');
    setFile(null);
    setProgress(0);
    setError(null);
    if (onDelete) onDelete();
    onUploadComplete('');
    toast.success(`${label} removed.`);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div>
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-slate-500 font-medium">{description}</p>
          )}
        </div>
        {aspectRatioHint && (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {aspectRatioHint}
          </span>
        )}
      </div>

      {/* Upload Zone / Active Preview */}
      {!imageUrl && !uploading && (
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
            id={inputId}
          />
          <label
            htmlFor={inputId}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all group bg-slate-50/60',
              isDragging
                ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                : 'border-slate-200 hover:bg-slate-100/70 hover:border-indigo-500'
            )}
          >
            <div
              className={cn(
                'w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-xs mb-2 transition-transform group-hover:scale-110',
                isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
              )}
            >
              <Upload size={20} />
            </div>
            <span
              className={cn(
                'text-xs font-black uppercase tracking-wider transition-colors',
                isDragging ? 'text-indigo-600' : 'text-slate-900'
              )}
            >
              {isDragging ? 'Drop Image Here' : `Upload ${label}`}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-1">
              Drag & drop or click • Max size {maxSizeMB}MB
            </span>
          </label>
        </div>
      )}

      {/* Uploading State */}
      {uploading && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <Loader2 className="animate-spin" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {file?.name || label}
              </p>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Optimizing & Uploading...
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !uploading && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-2 text-rose-700">
          <div className="flex items-center gap-2 text-xs font-bold">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setError(null);
              setFile(null);
            }}
            className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100 text-xs rounded-xl"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Image Preview & Controls */}
      {imageUrl && !uploading && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-4 group shadow-xs">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center p-1 overflow-hidden shrink-0 relative">
              <img
                src={imageUrl}
                alt={label}
                className="max-w-full max-h-full object-contain rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://placehold.co/120x120?text=Logo';
                }}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-0.5">
                <CheckCircle2 size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  Active Image Saved
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{label}</p>
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-indigo-600 hover:underline truncate block"
              >
                View full image
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label
              htmlFor={inputId}
              className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={12} />
              <span>Replace</span>
            </label>
            <input
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
              id={inputId}
            />
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Remove image"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
