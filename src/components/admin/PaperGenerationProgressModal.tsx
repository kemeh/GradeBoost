import React from 'react';
import { Check, Loader2, AlertCircle, Download, FileText, Eye, X } from 'lucide-react';

export type ProgressStage = 'validating' | 'calculating' | 'formatting' | 'creating_pages' | 'finalizing' | 'completed' | 'error';

interface StepDef {
  key: ProgressStage;
  label: string;
}

const STEPS: StepDef[] = [
  { key: 'validating', label: 'Validating questions & paper structure' },
  { key: 'calculating', label: 'Calculating question & subpart marks' },
  { key: 'formatting', label: 'Formatting typography & code blocks' },
  { key: 'creating_pages', label: 'Creating A4 pages, headers & footers' },
  { key: 'finalizing', label: 'Finalizing document file' },
];

interface PaperGenerationProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentStage: ProgressStage;
  exportType: 'pdf' | 'docx' | 'both';
  errorMessage?: string;
  onDownloadPDF?: () => void;
  onDownloadWord?: () => void;
  onPreview?: () => void;
  filename?: string;
}

export const PaperGenerationProgressModal: React.FC<PaperGenerationProgressModalProps> = ({
  isOpen,
  onClose,
  currentStage,
  exportType,
  errorMessage,
  onDownloadPDF,
  onDownloadWord,
  onPreview,
  filename
}) => {
  if (!isOpen) return null;

  const getStepStatus = (stepKey: ProgressStage) => {
    if (currentStage === 'error') return 'error';
    if (currentStage === 'completed') return 'completed';

    const stageOrder: ProgressStage[] = ['validating', 'calculating', 'formatting', 'creating_pages', 'finalizing', 'completed'];
    const currentIndex = stageOrder.indexOf(currentStage);
    const stepIndex = stageOrder.indexOf(stepKey);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  const isComplete = currentStage === 'completed';
  const isError = currentStage === 'error';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 sm:p-8 overflow-hidden">
        
        {/* Top bar with close if complete or error */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {isComplete
                ? 'Examination Paper Ready'
                : isError
                ? 'Document Generation Error'
                : `Preparing ${exportType === 'pdf' ? 'PDF' : exportType === 'docx' ? 'Word Document' : 'Paper'}...`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isComplete
                ? 'Your file has been compiled with professional Cameroon GCE styling.'
                : isError
                ? 'We encountered an issue during document export.'
                : 'Compiling structured examination paper with strict layout rules.'}
            </p>
          </div>

          {(isComplete || isError) && (
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Steps List */}
        <div className="py-5 space-y-3.5">
          {STEPS.map((step) => {
            const status = getStepStatus(step.key);

            return (
              <div key={step.key} className="flex items-center gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all shrink-0">
                  {status === 'completed' ? (
                    <span className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center border border-emerald-300">
                      <Check size={15} strokeWidth={2.5} />
                    </span>
                  ) : status === 'active' ? (
                    <span className="w-7 h-7 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center border border-indigo-300 animate-pulse">
                      <Loader2 size={15} className="animate-spin" />
                    </span>
                  ) : (
                    <span className="w-7 h-7 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center border border-slate-200">
                      •
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <p
                    className={`text-xs font-medium transition-colors ${
                      status === 'completed'
                        ? 'text-slate-700'
                        : status === 'active'
                        ? 'text-indigo-900 font-semibold'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Error message */}
        {isError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs mb-4">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
            <div>
              <p className="font-bold">Generation failed</p>
              <p className="mt-0.5 text-rose-700">{errorMessage || 'An unexpected error occurred during document generation.'}</p>
            </div>
          </div>
        )}

        {/* Success completion banner */}
        {isComplete && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-xs mb-4">
            <div className="w-8 h-8 rounded-full bg-emerald-200/70 text-emerald-800 flex items-center justify-center shrink-0">
              <Check size={18} strokeWidth={2.5} />
            </div>
            <div>
              <p className="font-bold">Paper generated successfully!</p>
              <p className="text-emerald-700 mt-0.5">
                {filename ? `Saved as: ${filename}` : 'Your examination document is ready for download.'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-end gap-2.5">
          {isComplete ? (
            <>
              {onPreview && (
                <button
                  onClick={onPreview}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  <Eye size={14} />
                  Preview
                </button>
              )}
              {onDownloadPDF && (
                <button
                  onClick={onDownloadPDF}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-sm"
                >
                  <Download size={14} />
                  Download PDF
                </button>
              )}
              {onDownloadWord && (
                <button
                  onClick={onDownloadWord}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm"
                >
                  <FileText size={14} />
                  Download Word
                </button>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Close
              </button>
            </>
          ) : isError ? (
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
            >
              Dismiss
            </button>
          ) : (
            <p className="text-[11px] text-slate-400 italic">Please wait while the document is compiled...</p>
          )}
        </div>

      </div>
    </div>
  );
};
