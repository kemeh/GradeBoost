import React, { useState } from 'react';
import { 
  FileText, Download, Send, Sparkles, CheckCircle2, 
  Info, Paperclip, Check
} from 'lucide-react';
import jsPDF from 'jspdf';
import { PracticalActivity, PracticalReportData } from '../../types';
import { toast } from 'react-hot-toast';

interface PracticalReportFormProps {
  practical: PracticalActivity;
  onSubmitReport: (reportData: PracticalReportData) => void;
  onAskAIFeedback?: (reportData: PracticalReportData) => void;
  isSubmitting?: boolean;
}

export const PracticalReportForm: React.FC<PracticalReportFormProps> = ({
  practical,
  onSubmitReport,
  onAskAIFeedback,
  isSubmitting = false
}) => {
  const [aim, setAim] = useState<string>(`To investigate and evaluate ${practical.title}.`);
  const [apparatus, setApparatus] = useState<string>('');
  const [procedure, setProcedure] = useState<string>('');
  const [observations, setObservations] = useState<string>('');
  const [results, setResults] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [conclusion, setConclusion] = useState<string>('');

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(15, 44, 89); // Deep Royal Blue
      doc.text('EDULPHA VIRTUAL PRACTICAL LAB REPORT', 14, 20);

      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);
      doc.text(`Title: ${practical.title}`, 14, 30);
      doc.text(`Subject: ${practical.subject} (${practical.level})`, 14, 38);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 46);

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 52, 196, 52);

      let y = 60;
      const addSection = (heading: string, content: string) => {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(15, 44, 89);
        doc.text(heading, 14, y);
        y += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        const splitText = doc.splitTextToSize(content || '(Not provided)', 180);
        doc.text(splitText, 14, y);
        y += (splitText.length * 5) + 6;
      };

      addSection('1. AIM & OBJECTIVE', aim);
      addSection('2. APPARATUS & REAGENTS', apparatus);
      addSection('3. EXPERIMENTAL PROCEDURE', procedure);
      addSection('4. OBSERVATIONS', observations);
      addSection('5. RESULTS & CALCULATIONS', results);
      addSection('6. ANALYSIS & DISCUSSION', analysis);
      addSection('7. CONCLUSION', conclusion);

      doc.save(`Edulpha_Lab_Report_${practical.id}.pdf`);
      toast.success('Laboratory Report PDF downloaded successfully!');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to generate PDF report');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aim || !observations) {
      toast.error('Please complete at least the Aim and Observations sections.');
      return;
    }
    onSubmitReport({
      aim,
      apparatus,
      procedure,
      observations,
      results,
      analysis,
      conclusion
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl p-4 md:p-6 text-slate-100">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Standard Practical Report Submission Form
          </h3>
          <p className="text-xs text-slate-400">
            Formal scientific format for GCE / TVEE / Baccalauréat Practical Examinations
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {onAskAIFeedback && (
            <button
              type="button"
              onClick={() => onAskAIFeedback({ aim, apparatus, procedure, observations, results, analysis, conclusion })}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg text-xs flex items-center space-x-1 shadow transition"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Pre-check</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownloadPDF}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-lg text-xs flex items-center space-x-1 border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        <div>
          <label className="block text-slate-300 font-bold mb-1">1. Aim / Objective of Practical:</label>
          <textarea
            value={aim}
            onChange={(e) => setAim(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 font-sans"
            placeholder="State the primary scientific purpose..."
          />
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">2. Apparatus & Reagents Used:</label>
          <textarea
            value={apparatus}
            onChange={(e) => setApparatus(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 font-sans"
            placeholder="List all instruments, chemical reagents, software or hardware materials..."
          />
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">3. Step-by-Step Procedure:</label>
          <textarea
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 font-sans"
            placeholder="Describe the experimental steps executed..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 font-bold mb-1">4. Observations & Raw Data:</label>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 font-sans"
              placeholder="Record exact color changes, readings, console logs..."
            />
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">5. Results & Calculations:</label>
            <textarea
              value={results}
              onChange={(e) => setResults(e.target.value)}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 font-sans"
              placeholder="Detail mathematical formulas, output calculations, table values..."
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">6. Analysis & Discussion:</label>
          <textarea
            value={analysis}
            onChange={(e) => setAnalysis(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 font-sans"
            placeholder="Discuss scientific principles, source of error, accuracy..."
          />
        </div>

        <div>
          <label className="block text-slate-300 font-bold mb-1">7. Scientific Conclusion:</label>
          <textarea
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            rows={2}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500 font-sans"
            placeholder="Summarize whether original aim was achieved..."
          />
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider shadow-lg flex items-center space-x-2 transition disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting Report...' : 'Submit Practical Report for Grading'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
