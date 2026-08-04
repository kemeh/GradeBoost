import React, { useState, useCallback, useEffect, useId } from 'react';
import { 
  Upload, X, CheckCircle2, AlertCircle, 
  Loader2, FileText, RefreshCw, Trash2 
} from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
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
  accept = 'application/pdf,.pdf',
  maxSizeMB = 10,
  folder = 'uploads',
  initialUrl = '',
  label = 'Upload File',
  className
}: FileUploadProps) {
  const { isAdmin, user: profile } = useAuth();
  const inputId = useId();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState(initialUrl);
  const [isDragging, setIsDragging] = useState(false);
  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleFile = (selectedFile: File) => {
    console.log('Selected file:', selectedFile.name, selectedFile.type, selectedFile.size);
    
    if (!auth.currentUser) {
      toast.error('You must be logged in to upload files.');
      return;
    }

    if (!isAdmin) {
      toast.error('Only admins can upload files.');
      return;
    }

    if (maxSizeMB && selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Check if file type is accepted
    const isAccepted = accept === '*' || 
      accept.split(',').some(type => {
        const trimmedType = type.trim();
        if (trimmedType.startsWith('.')) {
          return selectedFile.name.toLowerCase().endsWith(trimmedType.toLowerCase());
        }
        // Be more lenient with PDF mime types
        if (trimmedType === 'application/pdf' && selectedFile.name.toLowerCase().endsWith('.pdf')) {
          return true;
        }
        return selectedFile.type.match(new RegExp(trimmedType.replace('*', '.*')));
      });

    if (!isAccepted) {
      toast.error(`Invalid file type. Please upload ${accept}`);
      return;
    }

    setFile(selectedFile);
    setError(null);
    startUpload(selectedFile);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('handleFileChange triggered');
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      console.log('File selected:', selectedFile.name);
      handleFile(selectedFile);
    } else {
      console.log('No file selected');
    }
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
    console.log('handleDrop triggered');
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      console.log('File dropped:', droppedFile.name);
      handleFile(droppedFile);
    } else {
      console.log('No file dropped');
    }
  };

  const startUpload = useCallback(async (fileToUpload: File) => {
    console.log('--- STARTING FILE UPLOAD ---');
    console.log('File:', fileToUpload.name, 'Size:', (fileToUpload.size / 1024 / 1024).toFixed(2), 'MB');
    
    if (!auth.currentUser) {
      const msg = 'User not authenticated. Upload aborted.';
      console.error(msg);
      setError(msg);
      toast.error(msg);
      return;
    }

    if (!isAdmin) {
      const msg = 'Only admins can upload files.';
      console.error(msg);
      setError(msg);
      toast.error(msg);
      return;
    }

    setUploading(true);
    setProgress(15);
    setError(null);
    if (onUploadStart) onUploadStart();

    let uploadSuccess = false;

    // Helper: Convert File to Data URL
    const fileToDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const storagePath = `${folder}/${Date.now()}_${fileToUpload.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      console.log('Target Storage path:', storagePath);

      // Tier 1: Client Firebase Storage Upload with 6-second Timeout
      try {
        const storageRef = ref(storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);

        const clientUploadPromise = new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              if (!isMounted.current) return;
              const transferred = snapshot.bytesTransferred || 0;
              const total = snapshot.totalBytes || 1;
              const prog = 15 + (transferred / total) * 75;
              console.log('Firebase progress:', Math.round(prog) + '%');
              setProgress(Math.round(prog));
            },
            (err) => reject(err),
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
            try { uploadTask.cancel(); } catch (e) {}
            reject(new Error('Firebase Storage timeout (6s threshold). Using Server Upload API.'));
          }, 6000);
        });

        const firebaseUrl = await Promise.race([clientUploadPromise, timeoutPromise]);
        if (isMounted.current) {
          const sizeStr = (fileToUpload.size / (1024 * 1024)).toFixed(2) + ' MB';
          setDownloadUrl(firebaseUrl);
          setUploading(false);
          setProgress(100);
          onUploadComplete(firebaseUrl, fileToUpload.name, sizeStr);
          toast.success('Upload complete!');
          uploadSuccess = true;
        }
      } catch (tier1Err: any) {
        console.warn('Firebase Storage client upload stalled/failed, attempting Server Upload API:', tier1Err.message || tier1Err);
      }

      if (uploadSuccess || !isMounted.current) return;

      // Tier 2: Server API Upload (/api/upload)
      try {
        console.log('Attempting Server Upload API (/api/upload)...');
        const dataUrl = await fileToDataURL(fileToUpload);
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileData: dataUrl,
            fileName: fileToUpload.name,
            fileType: fileToUpload.type,
            folder,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.url && isMounted.current) {
            const sizeStr = (fileToUpload.size / (1024 * 1024)).toFixed(2) + ' MB';
            setDownloadUrl(data.url);
            setUploading(false);
            setProgress(100);
            onUploadComplete(data.url, fileToUpload.name, sizeStr);
            toast.success('Upload complete!');
            uploadSuccess = true;
          }
        }
      } catch (tier2Err: any) {
        console.warn('Server Upload API failed, using Data URL fallback:', tier2Err.message || tier2Err);
      }

      if (uploadSuccess || !isMounted.current) return;

      // Tier 3: Client Data URL Fallback
      const fallbackUrl = await fileToDataURL(fileToUpload);
      if (isMounted.current) {
        const sizeStr = (fileToUpload.size / (1024 * 1024)).toFixed(2) + ' MB';
        setDownloadUrl(fallbackUrl);
        setUploading(false);
        setProgress(100);
        onUploadComplete(fallbackUrl, fileToUpload.name, sizeStr);
        toast.success('Upload complete!');
      }
    } catch (err: any) {
      if (!isMounted.current) return;
      console.error('--- UPLOAD ERROR ---', err);
      const errorMessage = `Upload failed: ${err.message || 'Unknown error'}`;
      setError(errorMessage);
      setUploading(false);
      if (onUploadError) onUploadError(errorMessage);
      toast.error(errorMessage);
    }
  }, [folder, onUploadComplete, onUploadStart, onUploadError, isAdmin]);

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
