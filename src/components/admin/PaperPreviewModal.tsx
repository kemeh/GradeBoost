import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Printer, CheckCircle, Edit3, Save, Shield, Settings2, RefreshCw } from 'lucide-react';
import { GeneratedPaperData, SchoolBrandingSettings } from '../../types/paperGenerator';
import { useSettings } from '../../contexts/SettingsContext';
import { getEffectivePaperBranding, getCachedSchoolBranding } from '../../services/schoolBrandingService';
import { 
  ExaminationLetterhead, 
  ExaminationWatermark, 
  ExaminationPageFooter 
} from './ExaminationLetterhead';

interface PaperPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: GeneratedPaperData;
  onSave?: () => void;
  onGeneratePDF: () => void;
  onExportWord: () => void;
  onOpenBrandingSettings?: () => void;
  isSaving?: boolean;
}

export const PaperPreviewModal: React.FC<PaperPreviewModalProps> = ({
  isOpen,
  onClose,
  paper,
  onSave,
  onGeneratePDF,
  onExportWord,
  onOpenBrandingSettings,
  isSaving = false
}) => {
  const { appName, logoUrl } = useSettings();
  const [activeBranding, setActiveBranding] = useState<SchoolBrandingSettings>(getCachedSchoolBranding());
  const [useCurrentBranding, setUseCurrentBranding] = useState<boolean>(false);

  useEffect(() => {
    const handleBrandingUpdated = (e: any) => {
      if (e.detail) {
        setActiveBranding(e.detail);
      }
    };
    window.addEventListener('edulpha_school_branding_updated', handleBrandingUpdated);
    return () => {
      window.removeEventListener('edulpha_school_branding_updated', handleBrandingUpdated);
    };
  }, []);

  if (!isOpen) return null;

  // Decide effective branding: if paper has snapshot and user hasn't explicitly toggled to current branding
  const hasSnapshot = Boolean(paper.brandingSnapshot && paper.brandingSnapshot.schoolName);
  const effectiveBranding = useCurrentBranding
    ? activeBranding
    : getEffectivePaperBranding(paper, activeBranding);

  const totalMarks = (paper.questions || []).reduce(
    (sum, q) => sum + (q.subparts || []).reduce((sSum, s) => sSum + (Number(s.marks) || 0), 0),
    0
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[95vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/95 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/60">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Examination Paper Preview</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Official Letterhead & Watermark
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {(paper.subject || 'Subject').toUpperCase()} • {paper.paperType || 'Paper 2'} • {paper.year} • {totalMarks} Total Marks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBrandingSettings && (
              <button
                onClick={onOpenBrandingSettings}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                title="Configure school letterhead and watermark"
              >
                <Settings2 size={14} className="text-slate-500" />
                Edit School Branding
              </button>
            )}
            <button
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
              title="Print document"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition"
              title="Close Preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Action Controls & Branding Snapshot Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-2.5 bg-amber-50/80 border-b border-amber-200/60 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <CheckCircle size={15} className="text-emerald-600 shrink-0" />
            <span className="font-medium">
              School: <strong className="text-slate-900 font-bold">{effectiveBranding.schoolName}</strong>
            </span>
            {hasSnapshot && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full font-mono text-[10px] border border-blue-200">
                Saved Snapshot
              </span>
            )}
            {hasSnapshot && (
              <button
                onClick={() => setUseCurrentBranding(!useCurrentBranding)}
                className="ml-2 text-indigo-700 hover:text-indigo-900 underline font-medium inline-flex items-center gap-1"
                title="Toggle between snapshot and current settings"
              >
                <RefreshCw size={11} />
                {useCurrentBranding ? 'Revert to Paper Snapshot' : 'Preview with Current System Branding'}
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition"
            >
              <Edit3 size={14} />
              Edit Questions
            </button>
            {onSave && (
              <button
                onClick={onSave}
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white font-semibold rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
              >
                <Save size={14} />
                {isSaving ? 'Saving...' : 'Save Paper'}
              </button>
            )}
            <button
              onClick={onGeneratePDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-600 text-white font-semibold rounded-lg hover:bg-rose-700 transition shadow-sm"
            >
              <Download size={14} />
              Download PDF
            </button>
            <button
              onClick={onExportWord}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition shadow-sm"
            >
              <FileText size={14} />
              Export Word (.docx)
            </button>
          </div>
        </div>

        {/* Paper Document Body (Scrollable A4 sheet container) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/80 flex justify-center print:bg-white print:p-0">
          <div className="relative w-full max-w-3xl bg-white shadow-xl rounded-sm border border-slate-300 p-8 sm:p-14 text-slate-900 font-sans print:shadow-none print:border-none print:p-0 overflow-hidden min-h-[900px]">
            
            {/* Background Subtle Academic Watermark */}
            <ExaminationWatermark branding={effectiveBranding} year={paper.year} />

            {/* Official School Letterhead on Page 1 */}
            <ExaminationLetterhead
              branding={effectiveBranding}
              paperInfo={{
                subject: paper.subject,
                paperType: paper.paperType,
                title: paper.title,
                year: paper.year,
                level: paper.level,
                timeAllowed: paper.timeAllowed,
                totalMarks: totalMarks,
                instructions: paper.instructions
              }}
            />

            {/* Questions Section */}
            <div className="relative z-10 space-y-7 mt-4">
              {(paper.questions || []).map((q, qIdx) => {
                const qNumber = q.id || (qIdx + 1);
                const qTotalMarks = (q.subparts || []).reduce((sum, s) => sum + (Number(s.marks) || 0), 0);

                return (
                  <div key={q.id || qIdx} className="break-inside-avoid border-b border-slate-200/80 pb-6 last:border-b-0">
                    
                    {/* Question Header */}
                    <div className="flex items-center justify-between pb-1.5 mb-2.5 bg-slate-100/90 px-3 py-1.5 rounded border border-slate-200">
                      <h4 className="font-bold text-sm text-slate-900 tracking-wide uppercase">
                        QUESTION {qNumber}
                      </h4>
                      {qTotalMarks > 0 && (
                        <span className="text-xs italic font-semibold text-slate-600">
                          [Total: {qTotalMarks} Marks]
                        </span>
                      )}
                    </div>

                    {/* Question Prompt */}
                    {q.text && q.text.trim() && (
                      <p className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line mb-3 font-normal">
                        {q.text}
                      </p>
                    )}

                    {/* Question Code Snippet */}
                    {q.codeSnippet && q.codeSnippet.trim() && (
                      <div className="my-3 p-3 bg-slate-900 text-emerald-400 font-mono text-xs rounded-md overflow-x-auto shadow-inner border border-slate-800">
                        <pre className="whitespace-pre">{q.codeSnippet}</pre>
                      </div>
                    )}

                    {/* Subparts */}
                    <div className="space-y-3 pl-2 sm:pl-4 mt-3">
                      {(q.subparts || []).map((sub, sIdx) => {
                        const subLabel = sub.label || `(${String.fromCharCode(97 + sIdx)})`;
                        const subMarks = Number(sub.marks) || 0;

                        return (
                          <div key={sub.id || sIdx} className="text-xs sm:text-sm text-slate-800">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 leading-relaxed">
                                <span className="font-bold text-slate-950 mr-2">{subLabel}</span>
                                <span className="whitespace-pre-line">{sub.text}</span>
                              </div>
                              <div className="shrink-0 font-bold text-teal-800 text-xs px-2 py-0.5 bg-teal-50 rounded border border-teal-200 font-mono">
                                [{subMarks} mark{subMarks === 1 ? '' : 's'}]
                              </div>
                            </div>

                            {/* Subpart code snippet */}
                            {sub.codeSnippet && sub.codeSnippet.trim() && (
                              <div className="mt-2 ml-5 p-2.5 bg-slate-950 text-slate-200 font-mono text-xs rounded border border-slate-800 overflow-x-auto">
                                <pre className="whitespace-pre">{sub.codeSnippet}</pre>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* End of Examination Marker */}
            <div className="relative z-10 mt-12 pt-6 text-center border-t-2 border-slate-900">
              <p className="font-black text-xs uppercase tracking-widest text-slate-600">
                ★★★  END OF EXAMINATION QUESTION PAPER  ★★★
              </p>
              <p className="text-[11px] text-slate-500 mt-2">
                {effectiveBranding.schoolName}  •  {effectiveBranding.examinationBoardText || 'Cameroon General Certificate of Education'}
              </p>
            </div>

            {/* Page Footer */}
            <ExaminationPageFooter
              branding={effectiveBranding}
              pageNumber={1}
              totalPages={1}
            />

          </div>
        </div>

        {/* Bottom Footer Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            Exported documents contain official letterheads, watermark stamps, and automated pagination.
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 transition"
            >
              Back to Editor
            </button>
            <button
              onClick={onGeneratePDF}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition shadow-sm"
            >
              <Download size={15} />
              Download PDF
            </button>
            <button
              onClick={onExportWord}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              <FileText size={15} />
              Download Word (.docx)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
