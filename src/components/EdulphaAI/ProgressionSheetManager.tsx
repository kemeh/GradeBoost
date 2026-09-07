import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Upload, 
  Globe, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Check, 
  X, 
  FileSpreadsheet, 
  Eye, 
  ShieldCheck, 
  Layers, 
  BookOpen, 
  Download,
  FileCheck
} from 'lucide-react';
import { ProgressionSheet, ProgressionWeek } from '../../types';
import { 
  fetchProgressionSheets, 
  uploadProgressionSheet, 
  importProgressionSheetFromUrl, 
  approveProgressionSheet,
  updateProgressionSheet,
  seedCuratedProgressionSheets
} from '../../services/aiTeacherService';
import { Button, Card, Badge, cn } from '../ui';
import { toast } from 'react-hot-toast';

interface ProgressionSheetManagerProps {
  currentUserId: string;
  currentUserName: string;
  isTeacherOrAdmin: boolean;
}

export const ProgressionSheetManager: React.FC<ProgressionSheetManagerProps> = ({
  currentUserId,
  currentUserName,
  isTeacherOrAdmin
}) => {
  const [sheets, setSheets] = useState<ProgressionSheet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState<boolean>(false);
  const [selectedSheetForView, setSelectedSheetForView] = useState<ProgressionSheet | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Record<number, boolean>>({ 1: true });

  // Upload Form State
  const [uploadSubject, setUploadSubject] = useState('Computer Science');
  const [uploadLevel, setUploadLevel] = useState('Advanced Level');
  const [uploadAcademicYear, setUploadAcademicYear] = useState('2025/2026');
  const [uploadTerm, setUploadTerm] = useState('Term 1');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // URL Import State
  const [importUrl, setImportUrl] = useState('');
  const [urlSubject, setUrlSubject] = useState('ICT');
  const [urlLevel, setUrlLevel] = useState('Ordinary Level');
  const [isImportingUrl, setIsImportingUrl] = useState<boolean>(false);

  useEffect(() => {
    loadSheets();
  }, [selectedSubject, selectedStatus]);

  const loadSheets = async () => {
    setLoading(true);
    try {
      const data = await fetchProgressionSheets({
        subject: selectedSubject,
        status: selectedStatus
      });
      setSheets(data);
    } catch (err) {
      console.error('Error fetching progression sheets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedCurated = async () => {
    try {
      toast.loading('Importing official Cameroon GCE & MINESEC progression templates...', { id: 'seed' });
      const seeded = await seedCuratedProgressionSheets(currentUserId);
      toast.success(`Imported ${seeded.length} official curriculum progression sheets!`, { id: 'seed' });
      loadSheets();
    } catch (err: any) {
      toast.error(err.message || 'Failed to import templates', { id: 'seed' });
    }
  };

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please choose a file (PDF, DOCX, XLSX, CSV, TXT, or Image)');
      return;
    }

    setIsUploading(true);
    toast.loading('Uploading and normalizing with Gemini AI...', { id: 'upload' });

    try {
      const reader = new FileReader();
      reader.readAsDataURL(selectedFile);
      reader.onload = async () => {
        const base64Content = (reader.result as string).split(',')[1];
        try {
          const newSheet = await uploadProgressionSheet({
            subject: uploadSubject,
            classLevel: uploadLevel,
            academicYear: uploadAcademicYear,
            term: uploadTerm,
            fileBase64: base64Content,
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
            createdBy: currentUserId
          });

          toast.success('Progression sheet normalized successfully into 12-week roadmap!', { id: 'upload' });
          setIsUploadModalOpen(false);
          setSelectedFile(null);
          loadSheets();
          setSelectedSheetForView(newSheet);
        } catch (err: any) {
          toast.error(err.message || 'Failed to normalize progression document', { id: 'upload' });
        } finally {
          setIsUploading(false);
        }
      };
    } catch (err: any) {
      toast.error(err.message || 'File read error', { id: 'upload' });
      setIsUploading(false);
    }
  };

  const handleUrlImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl.trim()) {
      toast.error('Please enter a valid document or web URL');
      return;
    }

    setIsImportingUrl(true);
    toast.loading('Fetching document and extracting syllabus roadmap...', { id: 'urlImport' });

    try {
      const newSheet = await importProgressionSheetFromUrl({
        subject: urlSubject,
        classLevel: urlLevel,
        academicYear: '2025/2026',
        term: 'Full Year',
        sourceUrl: importUrl.trim(),
        createdBy: currentUserId
      });

      toast.success('Progression sheet imported and normalized from web!', { id: 'urlImport' });
      setIsUrlModalOpen(false);
      setImportUrl('');
      loadSheets();
      setSelectedSheetForView(newSheet);
    } catch (err: any) {
      toast.error(err.message || 'Failed to import progression sheet from URL', { id: 'urlImport' });
    } finally {
      setIsImportingUrl(false);
    }
  };

  const handleApproveSheet = async (sheetId: string) => {
    try {
      await approveProgressionSheet(sheetId, currentUserId, currentUserName);
      toast.success('Progression sheet approved! Now active for AI Teacher instruction.');
      loadSheets();
      if (selectedSheetForView?.id === sheetId) {
        setSelectedSheetForView(prev => prev ? { ...prev, approvalStatus: 'APPROVED' } : null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Approval failed');
    }
  };

  const toggleWeekExpansion = (wNum: number) => {
    setExpandedWeeks(prev => ({ ...prev, [wNum]: !prev[wNum] }));
  };

  const filteredSheets = sheets.filter(s => {
    if (selectedSubject !== 'All' && s.subject !== selectedSubject) return false;
    if (selectedStatus !== 'All' && s.approvalStatus !== selectedStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return s.title.toLowerCase().includes(term) || s.subject.toLowerCase().includes(term);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto min-w-0 w-full">
      {/* Top Header Card */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl shadow-md shrink-0">
            <Layers size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900">Progression Sheet Manager</h2>
              <Badge variant="indigo" className="text-[10px]">Curriculum Driver</Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload, import, review, and approve structured 12-week progression sheets for AI Teacher instruction.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={handleSeedCurated}
            size="sm"
            variant="outline"
            className="text-xs font-bold rounded-xl gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
          >
            <Sparkles size={14} /> Official Curated Templates
          </Button>

          <Button
            onClick={() => setIsUploadModalOpen(true)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl gap-1.5"
          >
            <Upload size={14} /> Upload File (PDF/DOCX/XLSX)
          </Button>

          <Button
            onClick={() => setIsUrlModalOpen(true)}
            size="sm"
            variant="outline"
            className="text-xs font-bold rounded-xl gap-1.5"
          >
            <Globe size={14} /> Import from URL
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search progression sheets by title, subject..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="All">All Subjects</option>
            <option value="Computer Science">Computer Science</option>
            <option value="ICT">ICT</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="APPROVED">Approved Only</option>
            <option value="REVIEW_REQUIRED">Review Required</option>
            <option value="UNVERIFIED">Unverified</option>
          </select>
        </div>
      </div>

      {/* Sheets Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 space-y-2">
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-bold">Loading progression sheets...</p>
        </div>
      ) : filteredSheets.length === 0 ? (
        <Card className="p-12 text-center space-y-4 border-dashed border-slate-300">
          <FileSpreadsheet className="mx-auto text-slate-300" size={48} />
          <div>
            <h4 className="font-bold text-slate-700 text-sm">No Progression Sheets Found</h4>
            <p className="text-xs text-slate-500 mt-1">
              Import the official Cameroon GCE templates or upload your school's syllabus progression.
            </p>
          </div>
          <Button
            onClick={handleSeedCurated}
            size="sm"
            className="bg-indigo-600 text-white font-bold text-xs rounded-xl"
          >
            Load Official Templates Now
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSheets.map(sheet => {
            const isApproved = sheet.approvalStatus === 'APPROVED';
            return (
              <Card key={sheet.id} className="p-5 space-y-4 border-slate-200 hover:border-indigo-300 transition-all flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="indigo">{sheet.subject}</Badge>
                        <Badge variant="secondary">{sheet.classLevel}</Badge>
                      </div>
                      <h4 className="text-base font-black text-slate-900">{sheet.title}</h4>
                    </div>

                    <Badge variant={isApproved ? 'success' : sheet.approvalStatus === 'REVIEW_REQUIRED' ? 'warning' : 'neutral'}>
                      {sheet.approvalStatus}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2">{sheet.description}</p>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-2 border-t border-slate-100 font-medium">
                    <span>Weeks: <strong>{sheet.weeks?.length || 0}</strong></span>
                    <span>•</span>
                    <span>Year: <strong>{sheet.academicYear}</strong></span>
                    <span>•</span>
                    <span>Source: <strong>{sheet.sourceType}</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <Button
                    onClick={() => setSelectedSheetForView(sheet)}
                    size="sm"
                    variant="outline"
                    className="text-xs font-bold rounded-xl gap-1.5"
                  >
                    <Eye size={14} /> View 12-Week Plan
                  </Button>

                  {!isApproved && isTeacherOrAdmin && (
                    <Button
                      onClick={() => handleApproveSheet(sheet.id)}
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl gap-1.5"
                    >
                      <CheckCircle2 size={14} /> Approve Sheet
                    </Button>
                  )}

                  {isApproved && (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck size={15} /> Active for AI
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* DETAILED 12-WEEK INSPECTOR MODAL */}
      {selectedSheetForView && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="indigo">{selectedSheetForView.subject}</Badge>
                  <Badge variant="secondary">{selectedSheetForView.classLevel}</Badge>
                  <Badge variant={selectedSheetForView.approvalStatus === 'APPROVED' ? 'success' : 'warning'}>
                    {selectedSheetForView.approvalStatus}
                  </Badge>
                </div>
                <h3 className="text-lg font-black text-slate-900">{selectedSheetForView.title}</h3>
                <p className="text-xs text-slate-500">
                  Academic Year: {selectedSheetForView.academicYear} • Term: {selectedSheetForView.term}
                </p>
              </div>

              <button
                onClick={() => setSelectedSheetForView(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                <span>12-Week Syllabus Progression Breakdown ({selectedSheetForView.weeks?.length || 0} Weeks)</span>
                {selectedSheetForView.approvalStatus !== 'APPROVED' && isTeacherOrAdmin && (
                  <Button
                    onClick={() => handleApproveSheet(selectedSheetForView.id)}
                    size="sm"
                    className="bg-emerald-600 text-white text-xs font-bold rounded-xl gap-1"
                  >
                    <CheckCircle2 size={14} /> Approve for Teaching
                  </Button>
                )}
              </div>

              {selectedSheetForView.weeks?.map(week => {
                const isExpanded = expandedWeeks[week.weekNumber];
                return (
                  <div key={week.weekNumber} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                    <button
                      onClick={() => toggleWeekExpansion(week.weekNumber)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-100/70 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                          W{week.weekNumber}
                        </span>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{week.topicTitle}</h4>
                          <span className="text-xs text-slate-500">
                            {week.subtopics?.length || 0} subtopics • {week.learningObjectives?.length || 0} objectives
                          </span>
                        </div>
                      </div>
                      {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </button>

                    {isExpanded && (
                      <div className="p-4 pt-1 space-y-3 bg-white border-t border-slate-200 text-xs">
                        {/* Subtopics */}
                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Subtopics:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {week.subtopics?.map((sub, i) => (
                              <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-[11px] font-medium">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Learning Objectives */}
                        <div>
                          <span className="font-bold text-slate-700 block mb-1">Target Objectives:</span>
                          <ul className="list-disc pl-5 space-y-1 text-slate-600">
                            {week.learningObjectives?.map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>

                        {/* Practical Work */}
                        {week.practicalWork && (
                          <div className="p-3 bg-indigo-50 rounded-xl text-indigo-900 space-y-0.5">
                            <span className="font-bold block text-[10px] uppercase text-indigo-700">Practical Lab Work</span>
                            <p>{week.practicalWork}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 pt-4 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500">
                Created: {new Date(selectedSheetForView.createdAt).toLocaleDateString()}
              </span>
              <Button
                onClick={() => setSelectedSheetForView(null)}
                variant="outline"
                className="text-xs rounded-xl"
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* FILE UPLOAD MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Upload size={20} />
                <h3 className="font-bold text-slate-900 text-base">Upload Progression Document</h3>
              </div>
              <button onClick={() => setIsUploadModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Upload a syllabus file (PDF, DOCX, XLSX, CSV, TXT, or Image). Gemini AI will normalize it automatically into a structured 12-week roadmap.
            </p>

            <form onSubmit={handleFileUploadSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={uploadSubject}
                    onChange={e => setUploadSubject(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="ICT">ICT</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Class / Level</label>
                  <select
                    value={uploadLevel}
                    onChange={e => setUploadLevel(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="Ordinary Level">Ordinary Level</option>
                    <option value="Advanced Level">Advanced Level</option>
                    <option value="Secondary First Cycle">Secondary First Cycle</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Academic Year</label>
                <input
                  type="text"
                  value={uploadAcademicYear}
                  onChange={e => setUploadAcademicYear(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  placeholder="2025/2026"
                />
              </div>

              {/* File Drop Area */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Progression Document File</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 p-5 rounded-2xl text-center bg-slate-50 cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx,.xls,.csv,.txt,image/*"
                    onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="prog-file-input"
                  />
                  <label htmlFor="prog-file-input" className="cursor-pointer space-y-1 block">
                    <Upload className="mx-auto text-slate-400" size={24} />
                    <p className="text-xs font-bold text-slate-700">
                      {selectedFile ? selectedFile.name : 'Click to select or drag and drop file'}
                    </p>
                    <p className="text-[10px] text-slate-400">PDF, Word DOCX, Excel XLSX, CSV, or Syllabus scan</p>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading || !selectedFile}
                  className="bg-indigo-600 text-white font-bold text-xs rounded-xl"
                >
                  {isUploading ? 'Normalizing...' : 'Upload & Normalize'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* URL IMPORT MODAL */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-indigo-600">
                <Globe size={20} />
                <h3 className="font-bold text-slate-900 text-base">Import from Internet URL</h3>
              </div>
              <button onClick={() => setIsUrlModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Provide an official curriculum website or syllabus document link. Our SSRF-safe scraper and Gemini will structure it into weekly units.
            </p>

            <form onSubmit={handleUrlImportSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                  <select
                    value={urlSubject}
                    onChange={e => setUrlSubject(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="ICT">ICT</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Class / Level</label>
                  <select
                    value={urlLevel}
                    onChange={e => setUrlLevel(e.target.value)}
                    className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  >
                    <option value="Ordinary Level">Ordinary Level</option>
                    <option value="Advanced Level">Advanced Level</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Public URL</label>
                <input
                  type="url"
                  placeholder="https://minesec.gov.cm/curriculum/... or document URL"
                  value={importUrl}
                  onChange={e => setImportUrl(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-mono"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUrlModalOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isImportingUrl || !importUrl.trim()}
                  className="bg-indigo-600 text-white font-bold text-xs rounded-xl"
                >
                  {isImportingUrl ? 'Importing...' : 'Fetch & Normalize'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
