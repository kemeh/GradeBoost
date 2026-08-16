import React, { useState, useCallback, useEffect, useRef, useId } from 'react';
import { 
  Upload, X, CheckCircle2, AlertCircle, 
  Loader2, FileText, RefreshCw, Trash2,
  FileSpreadsheet, FileCode, FileVideo, FileAudio,
  FileImage, Eye, Download, ShieldCheck
} from 'lucide-react';
import { ref, deleteObject } from 'firebase/storage';
import { storage, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Button, Progress, Badge, cn } from './ui';
import { toast } from 'react-hot-toast';
import { 
  uploadFilePipeline, 
  formatBytes, 
  validateFile, 
  UploadProgressInfo, 
  UploadResult 
} from '../utils/uploadPipeline';

export interface FileUploadProps {
  onUploadComplete: (url: string, fileName: string, fileSize: string) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  onDelete?: () => void;
  accept?: string;
  maxSizeMB?: number;
  folder?: string;
  initialUrl?: string;
  label?: string;
  description?: string;
  adminOnly?: boolean;
  className?: string;
  compact?: boolean;
}

export default function FileUpload({
  onUploadComplete,
  onUploadStart,
  onUploadError,
  onDelete,
  accept = 'application/pdf,.pdf,image/*,.png,.jpg,.jpeg,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt',
  maxSizeMB = 50,
  folder = 'edulpha/uploads',
  initialUrl = '',
  label = 'Upload Educational File',
  description,
  adminOnly = false,
  className,
  compact = false
}: FileUploadProps) {
  const { isAdmin } = useAuth();
  const inputId = useId();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progressInfo, setProgressInfo] = useState<UploadProgressInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileUrl, setFileUrl] = useState<string>(initialUrl || '');
  const [fileNameDisplay, setFileNameDisplay] = useState<string>('');
  const [fileSizeDisplay, setFileSizeDisplay] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    if (initialUrl && !fileUrl) {
      setFileUrl(initialUrl);
      const urlParts = initialUrl.split('/');
      const rawName = urlParts[urlParts.length - 1]?.split('?')[0] || 'Uploaded File';
      setFileNameDisplay(decodeURIComponent(rawName));
    }
  }, [initialUrl]);

  const getFileIcon = (mimeOrName: string) => {
    const lower = mimeOrName.toLowerCase();
    if (lower.includes('pdf')) return <FileText className="text-rose-500" size={24} />;
    if (lower.includes('image') || lower.match(/\.(png|jpg|jpeg|webp|gif|svg)$/)) return <FileImage className="text-indigo-500" size={24} />;
    if (lower.includes('sheet') || lower.includes('excel') || lower.match(/\.(xls|xlsx|csv)$/)) return <FileSpreadsheet className="text-emerald-500" size={24} />;
    if (lower.includes('video') || lower.match(/\.(mp4|webm|mov|mkv)$/)) return <FileVideo className="text-purple-500" size={24} />;
    if (lower.includes('audio') || lower.match(/\.(mp3|wav|ogg)$/)) return <FileAudio className="text-amber-500" size={24} />;
    if (lower.match(/\.(js|ts|tsx|jsx|py|java|c|cpp|html|css|json)$/)) return <FileCode className="text-blue-500" size={24} />;
    return <FileText className="text-slate-500" size={24} />;
  };

  const startUpload = useCallback(async (fileToUpload: File) => {
    if (!auth.currentUser) {
      const msg = 'Please sign in to upload files.';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (adminOnly && !isAdmin) {
      const msg = 'Administrator privileges required for this upload.';
      setError(msg);
      toast.error(msg);
      return;
    }

    const validation = validateFile(fileToUpload, { maxSizeMB, accept });
    if (!validation.valid) {
      setError(validation.error || 'Invalid file');
      toast.error(validation.error || 'Invalid file');
      return;
    }

    // Initialize state
    setError(null);
    setUploading(true);
    setProgressInfo({
      progress: 0,
      bytesTransferred: 0,
      totalBytes: fileToUpload.size,
      speedBps: 0,
      formattedProgress: `0 B / ${formatBytes(fileToUpload.size)}`,
      stage: 'preparing'
    });

    if (onUploadStart) onUploadStart();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result: UploadResult = await uploadFilePipeline(fileToUpload, {
        folder,
        maxSizeMB,
        accept,
        optimizeImages: true,
        signal: controller.signal,
        onProgress: (info) => {
          if (isMountedRef.current) {
            setProgressInfo(info);
          }
        }
      });

      if (!isMountedRef.current) return;

      setFileUrl(result.url);
      setFileNameDisplay(result.fileName);
      setFileSizeDisplay(result.fileSize);
      setUploading(false);
      setProgressInfo(null);

      onUploadComplete(result.url, result.fileName, result.fileSize);
      toast.success('Upload completed successfully!');
    } catch (err: any) {
      if (!isMountedRef.current) return;
      if (controller.signal.aborted) {
        toast('Upload cancelled.');
      } else {
        const errorMsg = err.message || 'Upload failed. Please check connection.';
        setError(errorMsg);
        if (onUploadError) onUploadError(errorMsg);
        toast.error(errorMsg);
      }
      setUploading(false);
    } finally {
      abortControllerRef.current = null;
    }
  }, [folder, maxSizeMB, accept, adminOnly, isAdmin, onUploadStart, onUploadComplete, onUploadError]);

  const handleFile = (file: File) => {
    setSelectedFile(file);
    startUpload(file);
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setUploading(false);
    setProgressInfo(null);
    setSelectedFile(null);
  };

  const handleRetry = () => {
    if (selectedFile) {
      startUpload(selectedFile);
    }
  };

  const handleDelete = async () => {
    if (fileUrl && fileUrl.includes('firebasestorage.googleapis.com')) {
      try {
        const fileRef = ref(storage, fileUrl);
        await deleteObject(fileRef);
      } catch (err) {
        console.warn('Storage delete exception (handled):', err);
      }
    }

    setFileUrl('');
    setSelectedFile(null);
    setFileNameDisplay('');
    setFileSizeDisplay('');
    setError(null);
    setProgressInfo(null);

    if (onDelete) onDelete();
    onUploadComplete('', '', '');
    toast.success('File removed.');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className={cn('w-full space-y-3 font-sans', className)}>
      {/* Header Info */}
      {(label || description) && (
        <div className="flex items-center justify-between">
          <div>
            {label && <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">{label}</label>}
            {description && <p className="text-[11px] text-slate-500 font-medium mt-0.5">{description}</p>}
          </div>
          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
            Max {maxSizeMB} MB
          </span>
        </div>
      )}

      {/* Upload Zone (Idle State) */}
      {!fileUrl && !uploading && (
        <div className="relative">
          <input
            id={inputId}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="hidden"
          />
          <label
            htmlFor={inputId}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center w-full border-2 border-dashed rounded-2xl cursor-pointer transition-all group select-none',
              compact ? 'p-4' : 'p-6 sm:p-8',
              isDragging
                ? 'border-indigo-600 bg-indigo-50/50 scale-[1.01]'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70 hover:border-indigo-400'
            )}
          >
            <div className={cn(
              'bg-white rounded-2xl flex items-center justify-center shadow-xs mb-3 transition-transform group-hover:scale-110',
              compact ? 'w-10 h-10' : 'w-12 h-12',
              isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
            )}>
              <Upload size={compact ? 20 : 24} />
            </div>
            <div className="text-center space-y-1">
              <p className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">
                {isDragging ? 'Drop File Here to Upload' : 'Click or Drag & Drop File'}
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Supports PDF, Images, Word, Excel, Code & Video (up to {maxSizeMB} MB)
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Uploading / Progress State */}
      {uploading && (
        <div className="p-4 bg-white border border-indigo-100 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <Loader2 className="animate-spin" size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {selectedFile?.name || 'Processing file...'}
                </p>
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  {progressInfo?.formattedProgress || 'Uploading...'}
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancelUpload}
              className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200 rounded-xl shrink-0"
            >
              <X size={14} className="mr-1" /> Cancel
            </Button>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>{progressInfo?.stage === 'compressing' ? 'Optimizing Image...' : 'Uploading'}</span>
              <span>{progressInfo?.progress || 0}%</span>
            </div>
            <Progress value={progressInfo?.progress || 5} className="h-2 bg-slate-100" />
          </div>
        </div>
      )}

      {/* Error Alert with Retry */}
      {error && !uploading && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl space-y-2 text-rose-700">
          <div className="flex items-start gap-2.5">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-rose-900">{error}</p>
              <p className="text-[11px] text-rose-600 mt-0.5">Please check network or file format and retry.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="bg-white border-rose-200 text-rose-700 hover:bg-rose-100 text-xs rounded-xl font-bold"
            >
              <RefreshCw size={12} className="mr-1.5" /> Retry Upload
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setError(null); setSelectedFile(null); }}
              className="text-xs text-slate-600 hover:bg-rose-100/50 rounded-xl"
            >
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Completed Active File Card */}
      {fileUrl && !uploading && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0">
              {getFileIcon(fileNameDisplay || fileUrl)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-0.5">
                <CheckCircle2 size={14} />
                <span className="text-[10px] font-black uppercase tracking-wider">Ready / Saved</span>
              </div>
              <p className="text-xs font-bold text-slate-900 truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                {fileNameDisplay || 'Educational Resource File'}
              </p>
              {fileSizeDisplay && (
                <p className="text-[10px] font-medium text-slate-400">{fileSizeDisplay}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
              title="Open / View file"
            >
              <Eye size={18} />
            </a>

            <label
              htmlFor={inputId}
              className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={12} />
              <span className="hidden sm:inline">Replace</span>
            </label>
            <input
              id={inputId}
              type="file"
              accept={accept}
              onChange={handleInputChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete file"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
