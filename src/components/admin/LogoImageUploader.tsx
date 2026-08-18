import React, { useState, useCallback, useRef, useId, useEffect } from 'react';
import { 
  Upload, X, CheckCircle2, AlertCircle, Loader2, 
  RefreshCw, Trash2, Image as ImageIcon, Eye, Link, 
  Save, RotateCcw, Check
} from 'lucide-react';
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
  defaultUrl?: string;
  onUploadComplete: (url: string) => void;
  onSave?: (url: string) => Promise<void> | void;
  onDelete?: () => void;
  folder?: string;
  maxSizeMB?: number;
  accept?: string;
  aspectRatioHint?: string;
  className?: string;
  autoSave?: boolean;
}

/**
 * High-reliability logo and image uploader.
 * Features:
 * - Drag-and-drop & Click-to-upload
 * - Image type & size validation
 * - Client-side HTML Canvas image compression & optimization
 * - Real-time progress indicator & bytes tracking
 * - Multi-tier upload pipeline (Firebase Storage -> Server API -> Data URL)
 * - Direct URL input with instant preview & validation
 * - Instant Individual "Save & Apply" button
 * - Immediate image preview, replace, reset to default, and delete actions
 */
export default function LogoImageUploader({
  label,
  description,
  initialUrl = '',
  defaultUrl = '',
  onUploadComplete,
  onSave,
  onDelete,
  folder = 'edulpha/logos',
  maxSizeMB = 10,
  accept = 'image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon,image/gif',
  aspectRatioHint,
  className,
  autoSave = true
}: LogoImageUploaderProps) {
  const { isAdmin } = useAuth();
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [isSavingDirect, setIsSavingDirect] = useState(false);
  const [progressInfo, setProgressInfo] = useState<UploadProgressInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const [customUrlInput, setCustomUrlInput] = useState<string>(initialUrl);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isSavedInDb, setIsSavedInDb] = useState(true);
  
  const isMounted = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setImageUrl(initialUrl || '');
    setCustomUrlInput(initialUrl || '');
    setIsSavedInDb(true);
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

  const persistLogoChange = async (url: string) => {
    onUploadComplete(url);
    if (onSave) {
      setIsSavingDirect(true);
      try {
        await onSave(url);
        setIsSavedInDb(true);
      } catch (err: any) {
        console.error('Failed to auto-save logo:', err);
      } finally {
        if (isMounted.current) {
          setIsSavingDirect(false);
        }
      }
    }
  };

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
      setCustomUrlInput(result.url);
      setUploading(false);
      setProgressInfo(null);

      if (autoSave) {
        await persistLogoChange(result.url);
        toast.success(`${label} uploaded and applied!`);
      } else {
        onUploadComplete(result.url);
        setIsSavedInDb(false);
        toast.success(`${label} uploaded. Click Save to persist.`);
      }
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
  }, [folder, label, isAdmin, maxSizeMB, accept, autoSave, onUploadComplete, onSave]);

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

  const handleApplyUrl = async () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) {
      toast.error('Please enter a valid image URL or upload a file.');
      return;
    }
    setImageUrl(trimmed);
    await persistLogoChange(trimmed);
    toast.success(`${label} updated!`);
  };

  const handleResetDefault = async () => {
    const fallback = defaultUrl || '/edulpha-logo.png';
    setImageUrl(fallback);
    setCustomUrlInput(fallback);
    await persistLogoChange(fallback);
    toast.success(`${label} reset to default.`);
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
    setCustomUrlInput('');
    setProgressInfo(null);
    setError(null);
    if (onDelete) onDelete();
    await persistLogoChange('');
    toast.success(`${label} removed.`);
  };

  return (
    <div className={cn('space-y-3 font-sans', className)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            {label}
          </label>
          {description && (
            <p className="text-[11px] text-slate-500 font-medium">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {aspectRatioHint && (
            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {aspectRatioHint}
            </span>
          )}
        </div>
      </div>

      {/* Mode toggle (Upload vs Direct URL) */}
      <div className="flex items-center justify-between text-[11px] font-bold border-b border-slate-100 pb-1.5">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInputMode('upload')}
            className={cn(
              'px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1',
              inputMode === 'upload' ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Upload size={12} /> File Upload
          </button>
          <button
            type="button"
            onClick={() => setInputMode('url')}
            className={cn(
              'px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1',
              inputMode === 'url' ? 'bg-indigo-50 text-indigo-700 font-black' : 'text-slate-500 hover:text-slate-800'
            )}
          >
            <Link size={12} /> Direct URL
          </button>
        </div>

        {defaultUrl && (
          <button
            type="button"
            onClick={handleResetDefault}
            className="text-[10px] text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-1"
            title="Reset to default brand asset"
          >
            <RotateCcw size={10} /> Reset Default
          </button>
        )}
      </div>

      {/* Direct URL Input Mode */}
      {inputMode === 'url' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => {
                setCustomUrlInput(e.target.value);
                setIsSavedInDb(false);
              }}
              placeholder="e.g. /edulpha-logo.png or https://example.com/logo.svg"
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white focus:outline-none font-medium"
            />
            <Button
              type="button"
              size="sm"
              onClick={handleApplyUrl}
              loading={isSavingDirect}
              className="rounded-xl text-xs px-3 font-bold shrink-0"
            >
              <Check size={14} className="mr-1" /> Apply & Save
            </Button>
          </div>
        </div>
      )}

      {/* Upload Zone (When inputMode === 'upload' and no image or uploading) */}
      {inputMode === 'upload' && !imageUrl && !uploading && (
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
              'flex flex-col items-center justify-center w-full p-5 border-2 border-dashed rounded-2xl cursor-pointer transition-all group bg-slate-50/60',
              isDragging
                ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                : 'border-slate-200 hover:bg-slate-100/70 hover:border-indigo-500'
            )}
          >
            <div
              className={cn(
                'w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-xs mb-2 transition-transform group-hover:scale-110',
                isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
              )}
            >
              <Upload size={18} />
            </div>
            <span
              className={cn(
                'text-xs font-black uppercase tracking-wider transition-colors',
                isDragging ? 'text-indigo-600' : 'text-slate-900'
              )}
            >
              {isDragging ? 'Drop Image Here' : `Upload ${label}`}
            </span>
            <span className="text-[10px] font-bold text-slate-400 mt-0.5">
              PNG, SVG, JPG, WEBP, ICO • Max {maxSizeMB}MB
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
                {progressInfo?.formattedProgress || 'Processing image...'}
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>{progressInfo?.stage === 'compressing' ? 'Optimizing & Compressing' : 'Uploading'}</span>
              <span>{progressInfo?.progress || 0}%</span>
            </div>
            <Progress value={progressInfo?.progress || 5} className="h-1.5 bg-slate-100" />
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !uploading && (
        <div className="p-3 bg-rose-50 border border-rose-100 rounded-2xl space-y-2 text-rose-700">
          <div className="flex items-center gap-2 text-xs font-bold">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setError(null)}
            className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100 text-xs rounded-xl"
          >
            Dismiss & Try Again
          </Button>
        </div>
      )}

      {/* Image Preview & Controls */}
      {imageUrl && !uploading && (
        <div className="p-3.5 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 group shadow-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-14 h-14 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-1 overflow-hidden shrink-0 relative">
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
                <CheckCircle2 size={13} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {isSavedInDb ? 'Saved & Active' : 'Ready to Save'}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate">{label}</p>
              <a
                href={imageUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-indigo-600 hover:underline truncate block"
              >
                View full asset
              </a>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <label
              htmlFor={inputId}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1"
            >
              <RefreshCw size={12} />
              <span className="hidden sm:inline">Replace</span>
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
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Remove image"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
