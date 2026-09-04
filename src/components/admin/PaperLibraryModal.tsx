import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  BookOpen,
  Calendar,
  Clock,
  Download,
  FileText,
  Copy,
  Trash2,
  Eye,
  CheckCircle,
  Archive,
  RefreshCw,
  Plus,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { GeneratedPaperData, PaperStatus } from '../../types/paperGenerator';
import {
  fetchGeneratedPapers,
  duplicatePaper,
  updatePaperStatus,
  deleteGeneratedPaper
} from '../../services/questionPaperService';
import { generateGCEPaper2PDF } from '../../utils/pdfGenerator';
import { downloadGCEPaper2Docx } from '../../utils/docxGenerator';
import { useSettings } from '../../contexts/SettingsContext';
import { toast } from 'react-hot-toast';

interface PaperLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPaper: (paper: GeneratedPaperData) => void;
  onNewPaper: () => void;
  onPreviewPaper: (paper: GeneratedPaperData) => void;
  userId?: string;
  userProfile?: { name?: string; email?: string };
}

export const PaperLibraryModal: React.FC<PaperLibraryModalProps> = ({
  isOpen,
  onClose,
  onOpenPaper,
  onNewPaper,
  onPreviewPaper,
  userId,
  userProfile
}) => {
  const { appName, logoUrl } = useSettings();
  const [papers, setPapers] = useState<GeneratedPaperData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | PaperStatus>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const data = await fetchGeneratedPapers();
      setPapers(data);
    } catch (err) {
      console.error('Failed to load papers:', err);
      toast.error('Failed to load saved papers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPapers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch =
      (paper.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (paper.subject || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(paper.year || '').includes(searchQuery);

    const matchesStatus = statusFilter === 'all' || paper.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDuplicate = async (paperId: string) => {
    if (!userId) {
      toast.error('You must be signed in to duplicate papers.');
      return;
    }
    setActionLoadingId(paperId);
    try {
      const duplicated = await duplicatePaper(paperId, userId, userProfile);
      toast.success(`Created duplicate "${duplicated.title}"`);
      await loadPapers();
    } catch (err) {
      console.error('Duplicate paper error:', err);
      toast.error('Failed to duplicate examination paper.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusChange = async (paperId: string, newStatus: PaperStatus) => {
    setActionLoadingId(paperId);
    try {
      await updatePaperStatus(paperId, newStatus);
      toast.success(`Paper marked as ${newStatus.toUpperCase()}`);
      setPapers((prev) =>
        prev.map((p) => (p.id === paperId ? { ...p, status: newStatus } : p))
      );
    } catch (err) {
      console.error('Update status error:', err);
      toast.error('Failed to update paper status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteConfirm = async (paperId: string) => {
    setActionLoadingId(paperId);
    try {
      await deleteGeneratedPaper(paperId);
      toast.success('Examination paper deleted successfully.');
      setPapers((prev) => prev.filter((p) => p.id !== paperId));
      setDeletingId(null);
    } catch (err) {
      console.error('Delete paper error:', err);
      toast.error('Failed to delete paper.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDirectPDF = async (paper: GeneratedPaperData) => {
    setActionLoadingId(paper.id);
    try {
      await generateGCEPaper2PDF(paper, { appName, logoUrl, branding: paper.brandingSnapshot });
      toast.success('PDF downloaded successfully.');
    } catch (err) {
      console.error('PDF export error:', err);
      toast.error('Failed to generate PDF.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDirectWord = async (paper: GeneratedPaperData) => {
    setActionLoadingId(paper.id);
    try {
      await downloadGCEPaper2Docx(paper, { appName, logoUrl, branding: paper.brandingSnapshot });
      toast.success('Word (.docx) downloaded successfully.');
    } catch (err) {
      console.error('Word export error:', err);
      toast.error('Failed to generate Word document.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status?: PaperStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle size={11} /> Published
          </span>
        );
      case 'ready':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300">
            Ready
          </span>
        );
      case 'archived':
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600 border border-slate-300 flex items-center gap-1">
            <Archive size={11} /> Archived
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
            Draft
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden my-auto animate-in fade-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl border border-blue-200">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900">Paper Library & Saved Examinations</h2>
                <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                  {papers.length} {papers.length === 1 ? 'Paper' : 'Papers'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Manage, edit, export, and publish all structured Cameroon GCE examination papers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onNewPaper}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm"
            >
              <Plus size={15} />
              Create New Paper
            </button>
            <button
              onClick={loadPapers}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 border-b border-slate-200 bg-white">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by subject, title or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            {(['all', 'draft', 'ready', 'published', 'archived'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 font-semibold rounded-lg capitalize transition ${
                  statusFilter === st
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <RefreshCw size={32} className="animate-spin text-blue-600 mb-3" />
              <p className="text-sm font-medium">Loading saved examination papers...</p>
            </div>
          ) : filteredPapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 mb-3">
                <FileText size={28} />
              </div>
              <h4 className="text-base font-bold text-slate-800">No examination papers found</h4>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                {searchQuery || statusFilter !== 'all'
                  ? 'No papers match your search criteria. Try adjusting your filters.'
                  : 'Get started by creating your first Cameroon GCE Paper 2 using the Generator.'}
              </p>
              <button
                onClick={onNewPaper}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition"
              >
                <Plus size={15} />
                Generate New Paper 2
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPapers.map((paper) => {
                const totalQ = paper.questions?.length || 0;
                const totalM = (paper.questions || []).reduce(
                  (sum, q) => sum + (q.subparts || []).reduce((sSum, s) => sSum + (Number(s.marks) || 0), 0),
                  0
                );
                const isWorking = actionLoadingId === paper.id;

                return (
                  <div
                    key={paper.id}
                    className="bg-white rounded-xl border border-slate-200/90 hover:border-slate-300 p-4 sm:p-5 shadow-sm hover:shadow transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left details */}
                    <div className="space-y-1.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(paper.status)}
                        <span className="text-xs font-semibold text-slate-500 uppercase">
                          {paper.subject || 'Subject'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-medium text-slate-500">
                          {paper.paperType || 'Paper 2'}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                          <Calendar size={12} /> {paper.year}
                        </span>
                      </div>

                      <h3
                        onClick={() => onOpenPaper(paper)}
                        className="text-base font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer truncate"
                      >
                        {paper.title || `${paper.subject} Paper 2 (${paper.year})`}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                        <span>
                          <strong className="text-slate-700">{totalQ}</strong> Questions
                        </span>
                        <span>
                          <strong className="text-slate-700">{totalM}</strong> Marks
                        </span>
                        <span>
                          Duration: <strong className="text-slate-700">{paper.timeAllowed || '3 Hours'}</strong>
                        </span>
                        {paper.creatorName && (
                          <span>
                            By: <strong className="text-slate-700">{paper.creatorName}</strong>
                          </span>
                        )}
                        {paper.brandingSnapshot?.schoolName && (
                          <span className="px-2 py-0.5 bg-indigo-50/70 text-indigo-800 rounded font-medium text-[11px] border border-indigo-200/60">
                            {paper.brandingSnapshot.schoolName}
                          </span>
                        )}
                        {paper.updatedAt && (
                          <span className="flex items-center gap-1 text-slate-400">
                            <Clock size={11} /> {new Date(paper.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right action controls */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <button
                        onClick={() => onOpenPaper(paper)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition"
                      >
                        Open Editor
                        <ArrowRight size={13} />
                      </button>

                      <button
                        onClick={() => onPreviewPaper(paper)}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                        title="Preview Paper"
                      >
                        <Eye size={16} />
                      </button>

                      <button
                        onClick={() => handleDirectPDF(paper)}
                        disabled={isWorking}
                        className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition disabled:opacity-50"
                        title="Download PDF"
                      >
                        <Download size={16} />
                      </button>

                      <button
                        onClick={() => handleDirectWord(paper)}
                        disabled={isWorking}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
                        title="Download Word (.docx)"
                      >
                        <FileText size={16} />
                      </button>

                      <button
                        onClick={() => handleDuplicate(paper.id)}
                        disabled={isWorking}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition disabled:opacity-50"
                        title="Duplicate as New Paper"
                      >
                        <Copy size={16} />
                      </button>

                      {paper.status !== 'published' ? (
                        <button
                          onClick={() => handleStatusChange(paper.id, 'published')}
                          disabled={isWorking}
                          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                          title="Publish for Students"
                        >
                          Publish
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(paper.id, 'archived')}
                          disabled={isWorking}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                          title="Archive Paper"
                        >
                          Archive
                        </button>
                      )}

                      {deletingId === paper.id ? (
                        <div className="flex items-center gap-1 bg-rose-50 p-1 rounded-lg border border-rose-200">
                          <button
                            onClick={() => handleDeleteConfirm(paper.id)}
                            disabled={isWorking}
                            className="px-2 py-1 text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 rounded"
                          >
                            Confirm Delete
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-2 py-1 text-[11px] text-slate-600 hover:bg-rose-100 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeletingId(paper.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Paper"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50 text-xs text-slate-500">
          <span>
            Edulpha Examination Engine • Standard Cameroon GCE A-Level & O-Level Formatting
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition"
          >
            Close Library
          </button>
        </div>

      </div>
    </div>
  );
};
