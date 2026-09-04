import React from 'react';
import { X, Download, FileText, Printer, CheckCircle, Edit3, Save } from 'lucide-react';
import { GeneratedPaperData } from '../../types/paperGenerator';
import { useSettings } from '../../contexts/SettingsContext';

interface PaperPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: GeneratedPaperData;
  onSave?: () => void;
  onGeneratePDF: () => void;
  onExportWord: () => void;
  isSaving?: boolean;
}

export const PaperPreviewModal: React.FC<PaperPreviewModalProps> = ({
  isOpen,
  onClose,
  paper,
  onSave,
  onGeneratePDF,
  onExportWord,
  isSaving = false
}) => {
  const { appName, logoUrl } = useSettings();

  if (!isOpen) return null;

  const totalMarks = (paper.questions || []).reduce(
    (sum, q) => sum + (q.subparts || []).reduce((sSum, s) => sSum + (Number(s.marks) || 0), 0),
    0
  );

  const defaultInstructions = [
    'Answer ALL questions or as specified in your syllabus examination instructions.',
    'All questions carry equal marks unless otherwise indicated.',
    'Write your answers clearly and orderly in the spaces provided or standard answer booklet.',
    'Credit will be given for clear diagrams, concise reasoning, and neat presentation.',
    'Mathematical and non-programmable calculators may be used where appropriate.'
  ];

  const candidateInstructions = (paper.instructions && paper.instructions.length > 0)
    ? paper.instructions
    : defaultInstructions;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[94vh] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Sticky Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/90 backdrop-blur sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200/60">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Examination Paper Preview</h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                  A4 Print Simulation
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {(paper.subject || 'Subject').toUpperCase()} • {paper.paperType || 'Paper 2'} • {paper.year} • {totalMarks} Total Marks
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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

        {/* Action Controls Bar inside Modal */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 bg-amber-50/70 border-b border-amber-200/60 text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <CheckCircle size={15} className="text-emerald-600" />
            <span>Official Examination Layout • Exact replica of generated PDF & Word document</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-700 font-semibold rounded-lg border border-slate-300 hover:bg-slate-50 transition"
            >
              <Edit3 size={14} />
              Edit Paper
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
              Generate PDF
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-100/80 flex justify-center">
          <div className="w-full max-w-3xl bg-white shadow-lg rounded-sm border border-slate-200 p-8 sm:p-14 text-slate-900 font-sans print:shadow-none print:border-none print:p-0">
            
            {/* Examination Header */}
            <div className="text-center pb-6 border-b-2 border-slate-900">
              {logoUrl && (
                <div className="flex justify-center mb-3">
                  <img
                    src={logoUrl}
                    alt={appName || 'Edulpha Logo'}
                    className="h-10 w-auto object-contain"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              )}
              <h1 className="text-2xl font-black tracking-wider text-[#0F2C59] uppercase">
                {appName || 'EDULPHA'}
              </h1>
              <h2 className="text-sm sm:text-base font-bold tracking-wide text-slate-800 uppercase mt-1">
                CAMEROON GENERAL CERTIFICATE OF EDUCATION BOARD
              </h2>
              <div className="inline-block mt-1 px-3 py-0.5 bg-amber-500/10 text-amber-700 font-bold text-xs uppercase tracking-widest rounded">
                {(paper.level || 'ADVANCED LEVEL').toUpperCase()} EXAMINATION
              </div>

              {/* Meta Grid Box */}
              <div className="mt-5 grid grid-cols-2 gap-y-2 gap-x-6 text-left p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs sm:text-sm">
                <div>
                  <span className="font-bold text-slate-900">SUBJECT: </span>
                  <span className="font-semibold text-slate-700 uppercase">{paper.subject}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">EXAMINATION YEAR: </span>
                  <span className="font-semibold text-slate-700">{paper.year}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-900">PAPER: </span>
                  <span className="font-semibold text-slate-700 uppercase">{paper.paperType || 'Paper 2'}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">TIME ALLOWED: </span>
                  <span className="font-semibold text-slate-700 uppercase">{paper.timeAllowed}</span>
                </div>
              </div>
            </div>

            {/* Candidate Instructions */}
            <div className="my-6 pb-6 border-b border-slate-300">
              <h3 className="font-black text-xs uppercase tracking-wider text-slate-900 mb-2.5">
                INSTRUCTIONS TO CANDIDATES
              </h3>
              <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed">
                {candidateInstructions.map((instruction, idx) => (
                  <li key={idx} className="pl-1">
                    <span>{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Questions Section */}
            <div className="space-y-8">
              {(paper.questions || []).map((q, qIdx) => {
                const qNumber = q.id || (qIdx + 1);
                const qTotalMarks = (q.subparts || []).reduce((sum, s) => sum + (Number(s.marks) || 0), 0);

                return (
                  <div key={q.id || qIdx} className="break-inside-avoid border-b border-slate-200/80 pb-6 last:border-b-0">
                    
                    {/* Question Header */}
                    <div className="flex items-center justify-between pb-2 mb-2.5 bg-slate-50 px-3 py-1.5 rounded border border-slate-100">
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
                    <div className="space-y-3.5 pl-2 sm:pl-4 mt-3">
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
                              <div className="shrink-0 font-bold text-emerald-700 text-xs px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
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

            {/* End of Examination Footer */}
            <div className="mt-12 pt-6 text-center border-t-2 border-slate-900">
              <p className="font-black text-xs uppercase tracking-widest text-slate-600">
                ★★★  END OF EXAMINATION QUESTION PAPER  ★★★
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                © {appName || 'Edulpha'} Smart Exam Practice System  •  Cameroon General Certificate of Education
              </p>
            </div>

          </div>
        </div>

        {/* Bottom Footer Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <div className="text-xs text-slate-500">
            Clicking <strong className="text-slate-800">Generate PDF</strong> or <strong className="text-slate-800">Export Word</strong> will download publication-ready files formatted for A4 printing.
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
