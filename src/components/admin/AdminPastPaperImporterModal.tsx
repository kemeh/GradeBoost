import React, { useState } from 'react';
import { 
  Globe, Search, Download, AlertCircle, CheckCircle2, ShieldCheck, 
  FileText, Sparkles, Upload, RefreshCw, X, Eye, HelpCircle, 
  Check, Lock, ExternalLink, Layers, FileCheck, Hash
} from 'lucide-react';
import { Button, Card, Badge, cn } from '../ui';
import { PermissionStatus, PastPaperStatus, PastPaperItem } from '../../types';
import FileUpload from '../FileUpload';
import toast from 'react-hot-toast';

interface AdminPastPaperImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaperImported?: (paper: PastPaperItem) => void;
}

export default function AdminPastPaperImporterModal({
  isOpen,
  onClose,
  onPaperImported
}: AdminPastPaperImporterModalProps) {
  const [importMode, setActiveImportMode] = useState<'url' | 'file'>('url');
  
  // Step 1: Input & Analysis
  const [sourceUrl, setSourceUrl] = useState('https://camerongcevision.com/');
  const [examination, setExamination] = useState('Cameroon GCE');
  const [level, setLevel] = useState('Advanced Level');
  const [subject, setSubject] = useState('Computer Science');
  const [year, setYear] = useState<number>(2024);
  const [paperNumber, setPaperNumber] = useState('Paper 1');
  const [language, setLanguage] = useState<'English' | 'French'>('English');
  const [session, setSession] = useState('June Examination');
  const [description, setDescription] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus>('Publicly Available');

  // Manual Upload State
  const [uploadedFileData, setUploadedFileData] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Source Crawl Discovered Resources
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [discoveredResources, setDiscoveredResources] = useState<any[]>([]);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);

  // Import State
  const [isImporting, setIsImporting] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<{ isDuplicate: boolean; message: string; existingTitle?: string } | null>(null);
  const [importedPaperResult, setImportedPaperResult] = useState<PastPaperItem | null>(null);

  if (!isOpen) return null;

  // 1. Analyze Source URL
  const handleAnalyzeUrl = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sourceUrl.trim()) {
      toast.error('Please enter a valid source URL');
      return;
    }

    setIsAnalyzing(true);
    setDiscoveredResources([]);
    setDuplicateWarning(null);

    try {
      const res = await fetch('/api/admin/past-paper/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceUrl: sourceUrl.trim(),
          subject,
          level,
          examination
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || 'Unable to access the source website at this time.');
        return;
      }

      setDiscoveredResources(data.discoveredResources || []);
      if (data.discoveredResources && data.discoveredResources.length > 0) {
        setSelectedResource(data.discoveredResources[0]);
        toast.success(`Discovered ${data.discoveredResources.length} downloadable examination resource(s)!`);
      } else {
        toast.error('No direct past paper links found on page. You can proceed with reference import.');
      }
    } catch (err: any) {
      toast.error('Unable to access source website. Check connection or try manual upload.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // 2. Perform Import with Permission Check & Duplicate Hash Check
  const handleExecuteImport = async () => {
    setIsImporting(true);
    setDuplicateWarning(null);

    try {
      const targetFileUrl = selectedResource?.fileUrl || sourceUrl;
      const targetFileName = selectedResource?.title || `${year}_${subject}_${paperNumber}.pdf`;

      const payload = {
        sourceUrl: sourceUrl.trim(),
        fileUrl: targetFileUrl,
        fileData: uploadedFileData,
        fileName: uploadedFileName || targetFileName,
        subject,
        examination,
        level,
        year: Number(year),
        paperNumber,
        language,
        session,
        description,
        permissionStatus,
        licenseStatus: permissionStatus === 'Authorized' ? 'Edulpha Licensed Copy' : 'Standard Public Reference',
        importedBy: 'Admin Inspector'
      };

      const res = await fetch('/api/admin/past-paper/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.status === 409 && data.isDuplicate) {
        setDuplicateWarning({
          isDuplicate: true,
          message: 'This paper already exists in Edulpha.',
          existingTitle: data.existingTitle
        });
        toast.error('Duplicate paper detected! File hash already exists in database.');
        setIsImporting(false);
        return;
      }

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to import paper');
        setIsImporting(false);
        return;
      }

      setImportedPaperResult(data.paper);
      toast.success(data.message || 'Paper imported successfully!');

      if (onPaperImported) {
        onPaperImported(data.paper);
      }
    } catch (err: any) {
      toast.error('Import failed: ' + (err.message || 'Server connection error'));
    } finally {
      setIsImporting(false);
    }
  };

  // 3. Extract Questions via AI
  const handleExtractQuestions = async () => {
    if (!importedPaperResult) return;
    try {
      toast.loading('Extracting individual questions via Gemini AI...', { id: 'extract' });
      const res = await fetch('/api/admin/past-paper/extract-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: importedPaperResult.id })
      });
      const data = await res.json();
      toast.dismiss('extract');

      if (data.success) {
        toast.success(`Extracted ${data.extractedCount} structured questions!`);
        setImportedPaperResult(prev => prev ? { ...prev, extractedQuestionsCount: data.extractedCount } : null);
      } else {
        toast.error('Question extraction failed');
      }
    } catch (e) {
      toast.dismiss('extract');
      toast.error('Question extraction error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <Card className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl border border-indigo-500/20">
              <Globe size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                Past Paper Import System
                <Badge className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider">
                  ADMIN ONLY
                </Badge>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Crawl authorized examination repos (e.g. camerongcevision.com) or upload past papers with legal rights enforcement.
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Import Mode Toggle */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-fit">
          <button
            onClick={() => setActiveImportMode('url')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all",
              importMode === 'url'
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            )}
          >
            <Globe size={15} /> URL Source Crawlers
          </button>
          <button
            onClick={() => setActiveImportMode('file')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all",
              importMode === 'file'
                ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            )}
          >
            <Upload size={15} /> Manual File Upload Fallback
          </button>
        </div>

        {/* Success / Result Screen */}
        {importedPaperResult ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-6 space-y-4 text-emerald-900 dark:text-emerald-200">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={28} className="text-emerald-600 dark:text-emerald-400" />
              <div>
                <h3 className="text-base font-bold">Paper Imported Successfully!</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Paper registered in Firestore and queued for Admin Verification.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/60 dark:bg-slate-900/60 p-4 rounded-xl text-xs font-medium border border-emerald-200/60 dark:border-emerald-900/40">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Title</span>
                <span className="font-bold text-slate-900 dark:text-white">{importedPaperResult.title}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Permission</span>
                <Badge className="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[10px]">
                  {importedPaperResult.permissionStatus}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                <Badge className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 text-[10px]">
                  {importedPaperResult.status}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Extracted Questions</span>
                <span className="font-bold text-slate-900 dark:text-white">{importedPaperResult.extractedQuestionsCount || 0}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button 
                onClick={handleExtractQuestions}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Sparkles size={14} /> AI Extract Individual Questions
              </Button>

              <Button 
                onClick={() => setImportedPaperResult(null)}
                variant="outline"
                className="text-xs font-bold px-4 py-2 rounded-xl"
              >
                Import Another Paper
              </Button>

              <Button 
                onClick={onClose}
                className="bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Close Importer
              </Button>
            </div>
          </div>
        ) : (
          /* Main Import Form */
          <div className="space-y-6">
            
            {/* Source URL & Crawler Section */}
            {importMode === 'url' ? (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  Source Website URL
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe size={16} className="absolute left-3 top-3 text-slate-400" />
                    <input 
                      type="url"
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://camerongcevision.com/..."
                      className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <Button 
                    onClick={handleAnalyzeUrl}
                    disabled={isAnalyzing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shrink-0"
                  >
                    {isAnalyzing ? <RefreshCw size={15} className="animate-spin" /> : <Search size={15} />}
                    {isAnalyzing ? 'Analyzing Page...' : 'Inspect Web Page'}
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Target site example: <code className="text-indigo-600 dark:text-indigo-400">https://camerongcevision.com/</code> — System inspects page links without bypassing paywalls or protections.
                </p>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                  Upload Past Paper Document (PDF, DOC, DOCX, JPG, PNG)
                </label>
                <FileUpload 
                  onUploadComplete={(url, name) => {
                    setUploadedFileData(url);
                    setUploadedFileName(name);
                    toast.success(`Uploaded file: ${name}`);
                  }}
                  accept=".pdf,.doc,.docx,.jpg,.png"
                />
                {uploadedFileName && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                    <FileCheck size={14} /> Selected: {uploadedFileName}
                  </p>
                )}
              </div>
            )}

            {/* Discovered Resources List from URL Analysis */}
            {discoveredResources.length > 0 && (
              <div className="space-y-3 bg-indigo-50/50 dark:bg-indigo-950/20 p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={15} /> Discovered Resources ({discoveredResources.length})
                  </h3>
                  <Badge className="bg-indigo-600 text-white text-[10px]">
                    Select file to import
                  </Badge>
                </div>

                <div className="grid grid-cols-1 gap-2 max-h-44 overflow-y-auto pr-1">
                  {discoveredResources.map((resItem, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedResource(resItem)}
                      className={cn(
                        "p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-3",
                        selectedResource?.fileUrl === resItem.fileUrl
                          ? "bg-indigo-600 text-white border-indigo-700 shadow-sm"
                          : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-800 hover:border-indigo-300"
                      )}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText size={16} className={selectedResource?.fileUrl === resItem.fileUrl ? "text-white" : "text-indigo-600"} />
                        <span className="font-bold truncate">{resItem.title}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge className={selectedResource?.fileUrl === resItem.fileUrl ? "bg-white/20 text-white text-[10px]" : "bg-slate-100 text-slate-700 text-[10px]"}>
                          {resItem.fileType || 'pdf'}
                        </Badge>
                        {selectedResource?.fileUrl === resItem.fileUrl && <Check size={16} />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Duplicate File Hash Warning */}
            {duplicateWarning && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 p-4 rounded-2xl flex items-center gap-3 text-rose-900 dark:text-rose-200 text-xs">
                <AlertCircle size={20} className="text-rose-600 shrink-0" />
                <div>
                  <span className="font-bold block">{duplicateWarning.message}</span>
                  {duplicateWarning.existingTitle && (
                    <span className="text-[11px] text-rose-700 dark:text-rose-300">
                      Existing Entry: "{duplicateWarning.existingTitle}"
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Paper Metadata Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Examination Board
                </label>
                <select
                  value={examination}
                  onChange={(e) => setExamination(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-bold outline-none"
                >
                  <option value="Cameroon GCE">Cameroon GCE</option>
                  <option value="BEPC">BEPC (Ministère de l'Éducation)</option>
                  <option value="Probatoire">Probatoire (OBC)</option>
                  <option value="Baccalauréat">Baccalauréat (OBC)</option>
                  <option value="HND/BTS">HND / BTS Higher Education</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Academic Level
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-bold outline-none"
                >
                  <option value="Advanced Level">Advanced Level (A-Level / Upper Sixth)</option>
                  <option value="Ordinary Level">Ordinary Level (O-Level / Form 5)</option>
                  <option value="Terminale">Terminale (BAC)</option>
                  <option value="Première">Première (Probatoire)</option>
                  <option value="Troisième">Troisième (BEPC)</option>
                  <option value="HND Level 1 & 2">HND Level 1 & 2</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Computer Science, Mathematics"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Examination Year
                </label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  min={1990}
                  max={2030}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Paper Number
                </label>
                <select
                  value={paperNumber}
                  onChange={(e) => setPaperNumber(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-bold outline-none"
                >
                  <option value="Paper 1">Paper 1 (MCQ)</option>
                  <option value="Paper 2">Paper 2 (Structural Essay)</option>
                  <option value="Paper 3">Paper 3 (Practical / Problem Solving)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white font-bold outline-none"
                >
                  <option value="English">English</option>
                  <option value="French">French</option>
                </select>
              </div>

            </div>

            {/* Permission & Legal Protection Section (CRITICAL RULE) */}
            <div className="p-5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                <ShieldCheck size={18} className="text-amber-600 dark:text-amber-400" />
                <span>Legal Rights & Content Redistribution Permission</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider block mb-1">
                    Permission Status
                  </label>
                  <select
                    value={permissionStatus}
                    onChange={(e) => setPermissionStatus(e.target.value as PermissionStatus)}
                    className="w-full bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-800 rounded-xl p-2 text-xs font-bold text-slate-900 dark:text-white outline-none"
                  >
                    <option value="Authorized">Authorized (Explicit license to rebrand & watermark)</option>
                    <option value="Licensed">Licensed (Written agreement / Partner school)</option>
                    <option value="Publicly Available">Publicly Available (Reference link only)</option>
                    <option value="Unknown">Unknown (Save as Draft; Do NOT publish)</option>
                    <option value="Not Authorized">Not Authorized (Do NOT publish or redistribute)</option>
                  </select>
                </div>

                <div className="text-[11px] text-amber-900/80 dark:text-amber-300/80 leading-relaxed flex items-center">
                  {permissionStatus === 'Authorized' || permissionStatus === 'Licensed' ? (
                    <span className="text-emerald-700 dark:text-emerald-300 font-bold">
                      ✓ Subtle EDULPHA watermark will be generated while retaining full original author & publisher copyright notices.
                    </span>
                  ) : (
                    <span className="text-amber-800 dark:text-amber-300">
                      ⚠️ Document will be saved as reference link or Draft. Watermarking and public redistribution remain disabled.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Import Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button 
                onClick={onClose}
                variant="outline"
                className="text-xs font-bold px-4 py-2.5 rounded-xl"
              >
                Cancel
              </Button>

              <Button
                onClick={handleExecuteImport}
                disabled={isImporting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl flex items-center gap-2"
              >
                {isImporting ? <RefreshCw size={15} className="animate-spin" /> : <Download size={15} />}
                {isImporting ? 'Processing Import...' : 'Confirm & Import Past Paper'}
              </Button>
            </div>

          </div>
        )}

      </Card>
    </div>
  );
}
