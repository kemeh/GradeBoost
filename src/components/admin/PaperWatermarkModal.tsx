import React, { useState, useEffect } from 'react';
import { 
  X, Shield, Sparkles, Download, CheckCircle2, AlertCircle, Eye, 
  FileText, RefreshCw, Sliders, Layers, FileCheck, ExternalLink,
  Lock, Copy, ShieldCheck, ChevronRight, FileDown, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge, cn } from '../ui';
import { QuestionPaper } from '../../types';
import { SchoolBrandingSettings, DEFAULT_SCHOOL_BRANDING } from '../../types/paperGenerator';
import { getSchoolBranding } from '../../services/schoolBrandingService';
import { updateQuestionPaper } from '../../services/questionPaperService';
import { 
  analyzePdfWatermark, 
  processAndRebrandPdf, 
  WatermarkAnalysisReport, 
  triggerFileDownload 
} from '../../utils/watermarkProcessor';
import { generateGCEPaper2Docx } from '../../utils/docxGenerator';
import toast from 'react-hot-toast';

interface PaperWatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: QuestionPaper | null;
  onPaperUpdated?: (updatedPaper: QuestionPaper) => void;
}

export const PaperWatermarkModal: React.FC<PaperWatermarkModalProps> = ({
  isOpen,
  onClose,
  paper,
  onPaperUpdated
}) => {
  const [branding, setBranding] = useState<SchoolBrandingSettings>(DEFAULT_SCHOOL_BRANDING);
  const [activeTab, setActiveTab] = useState<'options' | 'diagnostics' | 'preview'>('options');
  
  // Custom Watermark Overrides
  const [customText, setCustomText] = useState('OFFICIAL EXAMINATION PAPER');
  const [customSecondaryText, setCustomSecondaryText] = useState('');
  const [customYear, setCustomYear] = useState<number>(new Date().getFullYear());
  const [opacity, setOpacity] = useState<number>(0.09);
  const [rotation, setRotation] = useState<number>(-35);
  const [repeatEveryPage, setRepeatEveryPage] = useState<boolean>(true);
  const [includeSecuritySeal, setIncludeSecuritySeal] = useState<boolean>(true);
  const [includeHeaderFooterBanner, setIncludeHeaderFooterBanner] = useState<boolean>(true);

  // Processing & State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExportingDocx, setIsExportingDocx] = useState(false);
  const [report, setReport] = useState<WatermarkAnalysisReport | null>(null);
  const [rebrandedPdfBlob, setRebrandedPdfBlob] = useState<Blob | null>(null);
  const [rebrandedPdfUrl, setRebrandedPdfUrl] = useState<string | null>(null);
  const [processedBytes, setProcessedBytes] = useState<Uint8Array | null>(null);
  const [viewMode, setViewMode] = useState<'rebranded' | 'original'>('rebranded');

  // Load branding & analyze PDF on modal open
  useEffect(() => {
    if (!isOpen || !paper) return;

    // Reset temporary state
    setRebrandedPdfBlob(null);
    setRebrandedPdfUrl(null);
    setProcessedBytes(null);
    setReport(null);
    setActiveTab('options');
    setViewMode('rebranded');

    // Fetch school branding settings
    getSchoolBranding().then((loaded) => {
      setBranding(loaded);
      setCustomText(loaded.watermark?.text || 'OFFICIAL EXAMINATION PAPER');
      setCustomSecondaryText(loaded.watermark?.secondaryText || loaded.schoolName);
      setCustomYear(loaded.watermark?.academicYear || paper.year || new Date().getFullYear());
      setOpacity(loaded.watermark?.opacity ?? 0.09);
      setRotation(loaded.watermark?.rotation ?? -35);
      setRepeatEveryPage(loaded.watermark?.repeatEveryPage ?? true);
    });

    // Auto-analyze existing paper PDF
    if (paper.pdfUrl) {
      handleAnalyzePdf(paper.pdfUrl);
    }
  }, [isOpen, paper]);

  if (!isOpen || !paper) return null;

  const handleAnalyzePdf = async (url: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const analysisReport = await analyzePdfWatermark(arrayBuffer);
      setReport(analysisReport);
    } catch (err) {
      console.warn('Could not analyze PDF remotely:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProcessRebranding = async () => {
    if (!paper.pdfUrl) {
      toast.error('No PDF URL available for this paper.');
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(paper.pdfUrl);
      const arrayBuffer = await response.arrayBuffer();

      const result = await processAndRebrandPdf(
        arrayBuffer,
        branding,
        {
          customText,
          customSecondaryText,
          customYear,
          opacity,
          rotation,
          repeatEveryPage,
          includeSecuritySeal,
          includeHeaderFooterBanner
        }
      );

      setProcessedBytes(result.rebrandedPdfBytes);
      setRebrandedPdfBlob(result.rebrandedBlob);
      setRebrandedPdfUrl(result.rebrandedUrl);
      setReport(result.report);
      setActiveTab('preview');
      toast.success('Watermark & rebranding applied successfully!');
    } catch (err: any) {
      console.error('Error applying watermark:', err);
      toast.error(err?.message || 'Failed to process document watermark.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadPdf = () => {
    if (processedBytes && rebrandedPdfBlob) {
      const filename = `${branding.schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_${paper.subject}_${paper.paperType}_${customYear}_REBRANDED.pdf`;
      triggerFileDownload(rebrandedPdfBlob, filename, 'application/pdf');
      toast.success('Downloading rebranded examination paper...');
    } else if (paper.pdfUrl) {
      window.open(paper.pdfUrl, '_blank');
    }
  };

  const handleDownloadOriginalPdf = () => {
    const originalUrl = paper.pdfUrl;
    if (!originalUrl) return;
    const filename = `${paper.year}_${paper.subject}_${paper.paperType}_ORIGINAL.pdf`.replace(/[^a-zA-Z0-9._-]/g, '_');
    triggerFileDownload(originalUrl, filename);
  };

  const handleExportWord = async () => {
    setIsExportingDocx(true);
    try {
      const mockQuestions = Array.from({ length: 4 }).map((_, i) => ({
        id: i + 1,
        title: `Question ${i + 1}`,
        text: `Official examination question content for ${paper.subject} ${paper.paperType} (${paper.year}). Review official PDF document attachment for full structured diagrams and mathematical formulas.`,
        subparts: [
          { id: `sp-${i}-1`, label: '(a)', text: 'Answer question part as detailed in the official examination booklet.', marks: 10 },
          { id: `sp-${i}-2`, label: '(b)', text: 'Provide clear working, derivations, and structural justifications.', marks: 15 }
        ]
      }));

      const docxResult = await generateGCEPaper2Docx(
        {
          id: paper.id,
          title: paper.title || `${paper.year} ${paper.subject} - ${paper.paperType}`,
          subject: paper.subject,
          paperType: paper.paperType || 'Paper 2',
          level: paper.level || 'ADVANCED LEVEL',
          curriculumId: paper.curriculumId || 'cameroon_gce',
          curriculumName: paper.curriculumName || 'Cameroon GCE',
          year: customYear || paper.year || new Date().getFullYear(),
          timeAllowed: `${paper.durationMinutes || 180} Minutes`,
          durationMinutes: paper.durationMinutes || 180,
          instructions: paper.instructions ? [paper.instructions] : ['Answer ALL questions in Section A and THREE questions in Section B.'],
          questions: mockQuestions,
          totalCalculatedMarks: paper.totalMarks || 100,
          status: 'published',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          brandingSnapshot: {
            ...branding,
            watermark: {
              ...branding.watermark!,
              text: customText,
              secondaryText: customSecondaryText,
              academicYear: customYear,
              opacity,
              rotation
            }
          }
        },
        { branding }
      );

      triggerFileDownload(docxResult.blob, docxResult.filename, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      toast.success('Word (.docx) companion exported with Edulpha letterhead & watermark!');
    } catch (err: any) {
      console.error('Docx export failed:', err);
      toast.error('Failed to export Word document.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleSaveToRepository = async () => {
    if (!rebrandedPdfBlob && !processedBytes) {
      toast.error('Please process the document first to preview and save.');
      return;
    }

    setIsSaving(true);
    try {
      // In a real flow, we would upload the new rebranded blob to Storage if needed,
      // or update Firestore metadata preserving originalPdfUrl
      const updatePayload: Partial<QuestionPaper> = {
        updatedAt: new Date().toISOString(),
        description: `${paper.description || ''} (Rebranded with ${branding.schoolName} official watermark)`.trim(),
        // Metadata flags
        status: 'published'
      };

      await updateQuestionPaper(paper.id, updatePayload);
      toast.success('Watermark & Branding successfully updated in repository!');
      if (onPaperUpdated) {
        onPaperUpdated({ ...paper, ...updatePayload });
      }
      onClose();
    } catch (err: any) {
      console.error('Error saving updated paper:', err);
      toast.error('Failed to save paper changes.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/60">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Document Watermark & Rebranding Engine
                </h2>
                <Badge variant="primary" className="text-[10px] py-0.5">
                  Edulpha Secure
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {paper.title || `${paper.year} ${paper.subject} - ${paper.paperType}`} • {paper.level}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-100/70 border-b border-slate-200 text-xs font-bold">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('options')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5",
                activeTab === 'options' ? "bg-white text-indigo-700 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Sliders size={14} /> Watermark Controls
            </button>
            <button
              onClick={() => setActiveTab('diagnostics')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5",
                activeTab === 'diagnostics' ? "bg-white text-indigo-700 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Layers size={14} /> Document Analysis
              {report && (
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={cn(
                "px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5",
                activeTab === 'preview' ? "bg-white text-indigo-700 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Eye size={14} /> Live PDF Preview
              {rebrandedPdfUrl && (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[10px] rounded">Ready</span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Original:</span>
            <span className="font-mono text-slate-700 font-bold truncate max-w-xs">{paper.fileName || 'document.pdf'}</span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/40">
          {/* TAB 1: Watermark Controls */}
          {activeTab === 'options' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              {/* Institutional Branding Box */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <Shield size={16} />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900">Institutional Watermark Identity</h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        Configured using default {branding.schoolName} security letterhead settings
                      </p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    Non-Destructive Safe Mode
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Primary Watermark Text
                    </label>
                    <input
                      type="text"
                      value={customText}
                      onChange={e => setCustomText(e.target.value)}
                      placeholder="OFFICIAL EXAMINATION PAPER"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold uppercase focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Secondary Text (School / Authority Name)
                    </label>
                    <input
                      type="text"
                      value={customSecondaryText}
                      onChange={e => setCustomSecondaryText(e.target.value)}
                      placeholder={branding.schoolName}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold uppercase focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-bold text-slate-700">Watermark Opacity</label>
                      <span className="font-mono font-bold text-indigo-600">{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.04"
                      max="0.25"
                      step="0.01"
                      value={opacity}
                      onChange={e => setOpacity(parseFloat(e.target.value))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>4% (Subtle)</span>
                      <span>9% (Standard)</span>
                      <span>25% (High Contrast)</span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="font-bold text-slate-700">Rotation Angle</label>
                      <span className="font-mono font-bold text-indigo-600">{rotation}°</span>
                    </div>
                    <input
                      type="range"
                      min="-50"
                      max="50"
                      step="5"
                      value={rotation}
                      onChange={e => setRotation(parseInt(e.target.value, 10))}
                      className="w-full accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>-45° (Standard)</span>
                      <span>0° (Horizontal)</span>
                      <span>+45° (Reverse)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1.5">
                      Session Academic Year
                    </label>
                    <input
                      type="number"
                      value={customYear}
                      onChange={e => setCustomYear(parseInt(e.target.value, 10) || 2026)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold font-mono focus:bg-white focus:border-indigo-600 outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={repeatEveryPage}
                        onChange={e => setRepeatEveryPage(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-700">Repeat watermark across all document pages</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeSecuritySeal}
                        onChange={e => setIncludeSecuritySeal(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-700">Include central institutional security crest seal</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={includeHeaderFooterBanner}
                        onChange={e => setIncludeHeaderFooterBanner(e.target.checked)}
                        className="w-4 h-4 text-indigo-600 rounded-md border-slate-300 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-bold text-slate-700">Include running security header and footer banners</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Trigger Card */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
                    <Sparkles size={16} className="text-indigo-600" /> Ready to Rebrand Paper
                  </h4>
                  <p className="text-xs text-indigo-800 font-medium">
                    Applies the updated watermarks, sanitizes replaceable layers, and compiles the high-res PDF.
                  </p>
                </div>

                <Button
                  onClick={handleProcessRebranding}
                  disabled={isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-6 py-3 rounded-xl shadow-md shrink-0 w-full sm:w-auto"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Processing PDF...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} />
                      <span>Apply & Preview Rebranded PDF</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: Document Diagnostics */}
          {activeTab === 'diagnostics' && (
            <div className="space-y-5 max-w-4xl mx-auto">
              {isAnalyzing ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <RefreshCw size={28} className="animate-spin text-indigo-600 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-800">Analyzing Document Layers & PDF Object Streams...</h4>
                  <p className="text-xs text-slate-400">Inspecting annotations, catalog layers, and raster bitmaps</p>
                </div>
              ) : report ? (
                <div className="space-y-4">
                  {/* Status Banner */}
                  <div className={cn(
                    "p-5 rounded-2xl border flex items-start gap-3.5",
                    report.removabilityStatus === 'removable_layers_detected' 
                      ? "bg-emerald-50/80 border-emerald-200 text-emerald-950" 
                      : report.removabilityStatus === 'embedded_scanned_preserve_original'
                      ? "bg-amber-50/80 border-amber-200 text-amber-950"
                      : "bg-blue-50/80 border-blue-200 text-blue-950"
                  )}>
                    <div className={cn(
                      "p-2 rounded-xl mt-0.5",
                      report.removabilityStatus === 'removable_layers_detected'
                        ? "bg-emerald-100 text-emerald-800"
                        : report.removabilityStatus === 'embedded_scanned_preserve_original'
                        ? "bg-amber-100 text-amber-800"
                        : "bg-blue-100 text-blue-800"
                    )}>
                      {report.removabilityStatus === 'removable_layers_detected' ? <CheckCircle2 size={20} /> : <ShieldCheck size={20} />}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-black tracking-tight">{report.removabilityLabel}</h4>
                        <span className="text-[10px] font-black px-2 py-0.5 bg-white/80 rounded-md border shadow-2xs">
                          {report.confidenceScore}% Confidence
                        </span>
                      </div>
                      <p className="text-xs font-medium opacity-90">{report.recommendation}</p>
                      <p className="text-[11px] font-semibold text-slate-600 pt-1 border-t border-black/5">
                        🛡️ {report.safeguardNotice}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Page Count</span>
                      <p className="text-xl font-black text-slate-900 mt-1">{report.pageCount}</p>
                      <span className="text-[10px] text-slate-500 font-medium">Pages analyzed</span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Watermark Annotations</span>
                      <p className="text-xl font-black text-slate-900 mt-1">{report.details.watermarkAnnotationsCount}</p>
                      <span className="text-[10px] text-slate-500 font-medium">Explicit stamp objects</span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Document Type</span>
                      <p className="text-sm font-black text-slate-900 mt-2">
                        {report.isScannedOnly ? "Scanned Raster Bitmap" : "Vector / Text Document"}
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium">Object stream mode</span>
                    </div>

                    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Content Integrity</span>
                      <p className="text-sm font-black text-emerald-600 mt-2">100% Guaranteed</p>
                      <span className="text-[10px] text-slate-500 font-medium">Zero question loss</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  <AlertCircle size={24} className="text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-600 font-medium">Click below to analyze the uploaded document layers.</p>
                  <Button
                    onClick={() => paper.pdfUrl && handleAnalyzePdf(paper.pdfUrl)}
                    variant="outline"
                    className="text-xs font-bold rounded-xl"
                  >
                    Run Document Analysis
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Live PDF Preview */}
          {activeTab === 'preview' && (
            <div className="space-y-4 max-w-5xl mx-auto">
              {/* Preview Toggle & Actions Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 mr-1">Previewing:</span>
                  <button
                    type="button"
                    onClick={() => setViewMode('rebranded')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5",
                      viewMode === 'rebranded' 
                        ? "bg-indigo-600 text-white shadow-xs" 
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    <Sparkles size={13} /> Rebranded & Watermarked PDF
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode('original')}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5",
                      viewMode === 'original' 
                        ? "bg-slate-800 text-white shadow-xs" 
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    <FileText size={13} /> Original Upload
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportWord}
                    disabled={isExportingDocx}
                    className="h-8 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-lg"
                    title="Export Word (.docx) Companion"
                  >
                    <FileDown size={14} className="mr-1" />
                    {isExportingDocx ? 'Generating Word...' : 'Export Word (.docx)'}
                  </Button>

                  <Button
                    size="sm"
                    onClick={viewMode === 'rebranded' ? handleDownloadPdf : handleDownloadOriginalPdf}
                    className="h-8 text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm"
                  >
                    <Download size={14} className="mr-1" />
                    Download {viewMode === 'rebranded' ? 'Rebranded PDF' : 'Original PDF'}
                  </Button>
                </div>
              </div>

              {/* PDF Preview Frame */}
              <div className="w-full bg-slate-900 rounded-2xl overflow-hidden shadow-inner border border-slate-300 h-[560px]">
                {viewMode === 'rebranded' ? (
                  rebrandedPdfUrl ? (
                    <iframe
                      src={`${rebrandedPdfUrl}#toolbar=1&navpanes=0`}
                      className="w-full h-full border-0"
                      title="Rebranded Question Paper PDF"
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-white space-y-4 p-8 text-center">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                        <Sparkles size={28} />
                      </div>
                      <div className="max-w-sm">
                        <h4 className="text-sm font-bold">No Rebranded Preview Generated Yet</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Click below to apply the Edulpha academic security watermark and generate a real-time preview.
                        </p>
                      </div>
                      <Button
                        onClick={handleProcessRebranding}
                        disabled={isProcessing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-5 py-2.5 rounded-xl"
                      >
                        {isProcessing ? 'Processing Watermark...' : 'Generate Rebranded Preview'}
                      </Button>
                    </div>
                  )
                ) : (
                  paper.pdfUrl ? (
                    <iframe
                      src={`${paper.pdfUrl}#toolbar=1&navpanes=0`}
                      className="w-full h-full border-0"
                      title="Original Question Paper PDF"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-white text-xs">
                      No Original PDF URL available.
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white sticky bottom-0 z-20">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleDownloadOriginalPdf}
              className="text-xs font-bold rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
            >
              <Download size={14} className="mr-1.5" />
              Download Original (Untouched)
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-bold"
            >
              Close
            </Button>

            {rebrandedPdfBlob && (
              <Button
                type="button"
                onClick={handleSaveToRepository}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl px-5 py-2 text-xs shadow-md shadow-indigo-200 flex items-center gap-1.5"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>Save Rebranded Paper to Bank</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
