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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (maxSizeMB && selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    startUpload(selectedFile);
  };

  const startUpload = useCallback((fileToUpload: File) => {
    setUploading(true);
    setProgress(0);
    setError(null);
    if (onUploadStart) onUploadStart();

    const storageRef = ref(storage, `${folder}/${Date.now()}_${fileToUpload.name}`);
    const task = uploadBytesResumable(storageRef, fileToUpload);
    setUploadTask(task);

    task.on(
      'state_changed',
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(p);
      },
      (err) => {
        console.error('Upload error:', err);
        const errorMessage = 'Upload failed. Check your connection.';
        setError(errorMessage);
        setUploading(false);
        if (onUploadError) onUploadError(errorMessage);
        toast.error('Upload failed');
      },
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          const size = (fileToUpload.size / (1024 * 1024)).toFixed(2) + ' MB';
          setDownloadUrl(url);
          setUploading(false);
          onUploadComplete(url, fileToUpload.name, size);
          toast.success('Upload complete!');
        } catch (err) {
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
      if (downloadUrl.includes('firebasestorage.googleapis.com')) {
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
            className="flex flex-col items-center justify-center w-full p-8 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 hover:border-indigo-600 cursor-pointer transition-all group"
          >
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <Upload className="text-indigo-600" size={24} />
            </div>
            <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{label}</span>
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
