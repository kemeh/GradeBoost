import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import { Upload, X, CheckCircle2, AlertCircle, Loader2, RefreshCw, Trash2, Image as ImageIcon, Eye } from 'lucide-react';
import { ref, deleteObject } from 'firebase/storage';
import { storage, auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Progress, cn } from '../ui';
import { toast } from 'react-hot-toast';
import { uploadFilePipeline, UploadProgressInfo, UploadResult } from '../../utils/uploadPipeline';

export interface LogoImageUploaderProps {
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
 * - Real-time progress indicator & bytes tracking
 * - Multi-tier upload pipeline (Firebase Storage -> Server API -> Data URL)
 * - Immediate image preview, replace, and delete actions
 */
export default function LogoImageUploader({
  label,
  description,
  initialUrl = '',
  onUploadComplete,
  onDelete,
  folder = 'edulpha/logos',
  maxSizeMB = 10,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/gif',
  aspectRatioHint,
  className
}: LogoImageUploaderProps) {
  const { isAdmin } = useAuth();
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [progressInfo, setProgressInfo] = useState<UploadProgressInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const [isDragging, setIsDragging] = useState(false);
  
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setImageUrl(initialUrl || '');
  }, [initialUrl]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const startUpload = useCallback(async (selectedFile: File) => {
    if (!auth.currentUser) {
      const msg = 'Please sign in to upload branding assets.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!isAdmin) {
      const msg = 'Administrator privileges required for branding updates.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setUploading(true);
    setProgressInfo({
      progress: 0,
      bytesTransferred: 0,
      totalBytes: selectedFile.size,
      speedBps: 0,
      formattedProgress: 'Preparing image...',
      stage: 'preparing'
    });
    setError(null);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result: UploadResult = await uploadFilePipeline(selectedFile, {
        folder,
        maxSizeMB,
        accept,
        optimizeImages: true,
        signal: controller.signal,
        onProgress: (info) => {
          if (isMounted.current) {
            setProgressInfo(info);
          }
        }
      });

      if (!isMounted.current) return;

      setImageUrl(result.url);
      setUploading(false);
      setProgressInfo(null);
      onUploadComplete(result.url);
      toast.success(`${label} saved successfully!`);
    } catch (err: any) {
      if (!isMounted.current) return;
      if (controller.signal.aborted) {
        toast('Upload cancelled.');
      } else {
        const errorMsg = err.message || 'Image upload failed.';
        setError(errorMsg);
        toast.error(errorMsg);
      }
      setUploading(false);
    } finally {
      abortControllerRef.current = null;
    }
  }, [folder, label, isAdmin, maxSizeMB, accept, onUploadComplete]);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      const msg = `Image exceeds maximum allowed size of ${maxSizeMB} MB.`;
      setError(msg);
      toast.error(msg);
      return;
    }

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
        console.warn('Storage deletion notice (handled):', err);
      }
    }
    setImageUrl('');
    setProgressInfo(null);
    setError(null);
    if (onDelete) onDelete();
    onUploadComplete('');
    toast.success(`${label} removed.`);
  };

  return (
    <div className={cn('space-y-3 font-sans', className)}>
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
        <div className="p-4 bg-white border border-indigo-100 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
              <Loader2 className="animate-spin" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {label}
              </p>
              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                {progressInfo?.formattedProgress || 'Uploading image...'}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>{progressInfo?.stage === 'compressing' ? 'Optimizing Image' : 'Uploading'}</span>
              <span>{progressInfo?.progress || 0}%</span>
            </div>
            <Progress value={progressInfo?.progress || 5} className="h-1.5 bg-slate-100" />
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
