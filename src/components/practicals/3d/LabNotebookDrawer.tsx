import React, { useState } from 'react';
import { 
  FileText, Save, Download, Plus, Trash2, CheckCircle2, BookOpen, Clock 
} from 'lucide-react';
import { ExperimentNotebook, LabSubject } from './types';
import { Button } from '../../ui';
import { jsPDF } from 'jspdf';
import { toast } from 'react-hot-toast';

interface LabNotebookDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  subject: LabSubject;
  notebook: ExperimentNotebook;
  setNotebook: React.Dispatch<React.SetStateAction<ExperimentNotebook>>;
  onLogCurrentMeasurement: () => void;
  lang: 'en' | 'fr';
}

export const LabNotebookDrawer: React.FC<LabNotebookDrawerProps> = ({
  isOpen,
  onClose,
  subject,
  notebook,
  setNotebook,
  onLogCurrentMeasurement,
  lang
}) => {
  const [activeTab, setActiveTab] = useState<'aim' | 'procedure' | 'data' | 'conclusion'>('aim');

  if (!isOpen) return null;

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42); // slate-900
      doc.text(`Edulpha Practical Laboratory Report (${subject})`, 14, 20);

      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
      doc.line(14, 32, 196, 32);

      let y = 40;
      doc.setFontSize(12);
      doc.setTextColor(30, 41, 59);
      doc.text("1. Experimental Aim", 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(notebook.aim || "Not specified", 14, y);

      y += 12;
      doc.setFontSize(12);
      doc.text("2. Procedure & Steps", 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(notebook.procedure || "Standard GCE practical procedure executed.", 14, y);

      y += 12;
      doc.setFontSize(12);
      doc.text("3. Recorded Data & Observations", 14, y);
      y += 6;
      notebook.dataObservations.forEach((obs, idx) => {
        doc.setFontSize(9);
        doc.text(`- Step ${idx + 1}: ${obs.value} (${obs.notes})`, 18, y);
        y += 5;
      });

      y += 8;
      doc.setFontSize(12);
      doc.text("4. Conclusion & Scientific Findings", 14, y);
      y += 6;
      doc.setFontSize(10);
      doc.text(notebook.conclusion || "Neutralization / Circuit equilibrium verified.", 14, y);

      doc.save(`Edulpha_Lab_Report_${subject}_${Date.now()}.pdf`);
      toast.success(lang === 'fr' ? 'Rapport de laboratoire PDF téléchargé !' : 'Lab Report PDF downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-slate-900 border-l border-slate-800 shadow-2xl p-6 flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-black text-white uppercase tracking-wider">
              {lang === 'fr' ? 'Cahier de Laboratoire Numérique' : 'Digital Lab Notebook'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-slate-800"
          >
            Close
          </button>
        </div>

        {/* Notebook Sub-Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-slate-950 p-1 rounded-xl mb-4 text-xs font-bold">
          {(['aim', 'procedure', 'data', 'conclusion'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 rounded-lg capitalize transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-4">
          {activeTab === 'aim' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Aim & Objectives of Experiment</label>
              <textarea
                rows={4}
                value={notebook.aim}
                onChange={(e) => setNotebook((prev) => ({ ...prev, aim: e.target.value }))}
                placeholder="State the scientific purpose of this practical..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium leading-relaxed"
              />
            </div>
          )}

          {activeTab === 'procedure' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Experimental Procedure Steps</label>
              <textarea
                rows={6}
                value={notebook.procedure}
                onChange={(e) => setNotebook((prev) => ({ ...prev, procedure: e.target.value }))}
                placeholder="Detail the steps taken during apparatus assembly and execution..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium leading-relaxed"
              />
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">Recorded Data Table</label>
                <button
                  onClick={onLogCurrentMeasurement}
                  className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-bold hover:bg-indigo-700 transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Live 3D Measurement</span>
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {notebook.dataObservations.length === 0 ? (
                  <p className="text-xs text-slate-500 italic p-4 text-center">
                    No measurements logged yet. Click "Log Live 3D Measurement" during your experiment.
                  </p>
                ) : (
                  notebook.dataObservations.map((obs, idx) => (
                    <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-mono text-indigo-300 font-bold">{obs.value}</span>
                        <p className="text-[10px] text-slate-400">{obs.notes} • {obs.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'conclusion' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-300">Scientific Conclusion & Calculations</label>
              <textarea
                rows={6}
                value={notebook.conclusion}
                onChange={(e) => setNotebook((prev) => ({ ...prev, conclusion: e.target.value }))}
                placeholder="Summarize your final results, percentage error, and scientific conclusion..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-medium leading-relaxed"
              />
            </div>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
        <Button onClick={handleExportPDF} variant="outline" className="flex-1 border-slate-700 text-xs font-bold">
          <Download className="w-4 h-4 mr-1.5" />
          <span>Export Report PDF</span>
        </Button>

        <Button onClick={onClose} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold">
          <Save className="w-4 h-4 mr-1.5" />
          <span>Save Notebook</span>
        </Button>
      </div>
    </div>
  );
};
