import React, { useState, useCallback, useEffect, useId } from 'react';
import { 
  Upload, X, CheckCircle2, AlertCircle, 
  Loader2, FileText, RefreshCw, Trash2 
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { Button, Progress, cn } from './ui';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete: (url: string, fileName: string, fileSize: string) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  onDelete?: () => void;
  accept?: string;
  maxSizeMB?: number;
  folder?: string;
  initialUrl?: string;
  label?: string;
  className?: string;
}

export default function FileUpload({
  onUploadComplete,
  onUploadStart,
  onUploadError,
  onDelete,
  accept = 'application/pdf',
  maxSizeMB = 10,
  folder = 'uploads',
  initialUrl = '',
  label = 'Upload File',
  className
}: FileUploadProps) {
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState(initialUrl);
  const [uploadTask, setUploadTask] = useState<any>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (uploadTask && uploadTask.snapshot.state === 'running') {
        uploadTask.cancel();
      }
    };
  }, [uploadTask]);

  const handleFile = (selectedFile: File) => {
    if (maxSizeMB && selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    startUpload(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) handleFile(selectedFile);
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

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      // Check if file type is accepted
      const isAccepted = accept === '*' || 
        accept.split(',').some(type => {
          const trimmedType = type.trim();
          if (trimmedType.startsWith('.')) {
            return droppedFile.name.toLowerCase().endsWith(trimmedType.toLowerCase());
          }
          return droppedFile.type.match(new RegExp(trimmedType.replace('*', '.*')));
        });

      if (!isAccepted) {
        toast.error(`Invalid file type. Please upload ${accept}`);
        return;
      }

      handleFile(droppedFile);
    }
  };

  const startUpload = useCallback((fileToUpload: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    if (onUploadStart) onUploadStart();

    console.log('Starting upload to bucket:', storage.app.options.storageBucket);
    const storageRef = ref(storage, `${folder}/${Date.now()}_${fileToUpload.name}`);
    const task = uploadBytesResumable(storageRef, fileToUpload);
    setUploadTask(task);

    task.on(
      'state_changed',
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (err: any) => {
        if (!isMounted.current) return;
        
        console.error('Upload error:', err);
        let errorMessage = 'Upload failed. Check your connection.';
        
        if (err.code === 'storage/unauthorized') {
          errorMessage = 'Permission denied. You might not have the right access.';
        } else if (err.code === 'storage/canceled') {
          // If it was canceled, we don't necessarily want to show a scary error toast
          // unless it wasn't expected.
          setUploading(false);
          setProgress(0);
          return; // Skip the toast for cancellation
        } else if (err.code === 'storage/unknown') {
          errorMessage = 'An unknown error occurred. Please try again.';
        } else if (err.message) {
          errorMessage = `Upload failed: ${err.message}`;
        }
        
        setError(errorMessage);
        setUploading(false);
        if (onUploadError) onUploadError(errorMessage);
        toast.error(errorMessage);
      },
      async () => {
        if (!isMounted.current) return;
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          const size = (fileToUpload.size / (1024 * 1024)).toFixed(2) + ' MB';
          setDownloadUrl(url);
          setUploading(false);
          onUploadComplete(url, fileToUpload.name, size);
          toast.success('Upload complete!');
        } catch (err) {
          if (!isMounted.current) return;
          console.error('Error getting download URL:', err);
          const errorMessage = 'Failed to finalize upload.';
          setError(errorMessage);
          setUploading(false);
          if (onUploadError) onUploadError(errorMessage);
        }
      }
    );
  }, [folder, onUploadComplete, onUploadStart, onUploadError]);

  const handleRetry = () => {
    if (file) {
      startUpload(file);
    }
  };

  const handleDelete = async () => {
    if (!downloadUrl) return;
    
    try {
      // If it's a firebase storage URL, try to delete it
      if (downloadUrl?.includes('firebasestorage.googleapis.com')) {
        const fileRef = ref(storage, downloadUrl);
        await deleteObject(fileRef);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      // Even if storage delete fails, we clear local state
    }

    setDownloadUrl('');
    setFile(null);
    setProgress(0);
    if (onDelete) onDelete();
    toast.success('File removed');
  };

  const cancelUpload = () => {
    if (uploadTask) {
      uploadTask.cancel();
      setUploading(false);
      setProgress(0);
      setFile(null);
      toast.error('Upload cancelled');
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {!downloadUrl && !uploading && (
        <div className="relative">
          <input
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            id={inputId}
          />
          <label
            htmlFor={inputId}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-[2rem] bg-slate-50/50 cursor-pointer transition-all group",
              isDragging 
                ? "border-indigo-600 bg-indigo-50/50 scale-[1.02]" 
                : "border-slate-200 hover:bg-slate-50 hover:border-indigo-600"
            )}
          >
            <div className={cn(
              "w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 transition-transform",
              isDragging ? "scale-110 text-indigo-600" : "group-hover:scale-110"
            )}>
              <Upload className={cn(isDragging ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600")} size={24} />
            </div>
            <span className={cn(
              "text-sm font-black uppercase tracking-widest transition-colors",
              isDragging ? "text-indigo-600" : "text-slate-900"
            )}>
              {isDragging ? 'Drop to Upload' : label}
            </span>
            <span className="text-xs font-medium text-slate-400 mt-1">Max size: {maxSizeMB}MB</span>
          </label>
        </div>
      )}

      {uploading && (
        <div className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                <Loader2 className="text-indigo-600 animate-spin" size={20} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">{file?.name}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uploading...</p>
              </div>
            </div>
            <button 
              type="button"
              onClick={cancelUpload}
              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      )}

      {error && !uploading && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-[2rem] space-y-4">
          <div className="flex items-center gap-3 text-rose-600">
            <AlertCircle size={20} />
            <p className="text-sm font-bold">{error}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRetry}
              className="bg-white border-rose-200 text-rose-600 hover:bg-rose-100"
            >
              <RefreshCw className="mr-2" size={14} /> Retry
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => { setError(null); setFile(null); }}
              className="text-slate-500"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {downloadUrl && !uploading && (
        <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[2rem] flex items-center justify-between group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 truncate max-w-[200px]">
                {file?.name || 'File Uploaded'}
              </p>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="text-emerald-600" size={12} />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Ready to save</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href={downloadUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              <Upload className="rotate-180" size={18} />
            </a>
            <button 
              type="button"
              onClick={handleDelete}
              className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
