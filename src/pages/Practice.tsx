import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, Search, ArrowRight, 
  Calendar, Clock, LayoutDashboard, Lock,
  Download, CheckCircle2, HardDrive, WifiOff, RefreshCw, Trash2
} from 'lucide-react';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import { Button, Card, Badge, cn } from '../components/ui';
import { QuestionPaper } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { getPapersForSubjectName } from '../data/defaultSubjects';
import { fetchSubjectsByCurriculum } from '../services/curriculumService';
import { 
  downloadPracticePaper, 
  getOfflinePracticePapers, 
  removeOfflinePracticePaper, 
  isOnline, 
  DownloadedPracticePaper 
} from '../services/offlineStorageService';
import toast from 'react-hot-toast';

export default function Practice() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [downloadedPapersMap, setDownloadedPapersMap] = useState<Record<string, DownloadedPracticePaper>>({});
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);
  const [filter, setFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [subjectPapers, setSubjectPapers] = useState<{ id: string; name: string }[]>([]);
  const [offlineMode, setOfflineMode] = useState<boolean>(!isOnline());

  useEffect(() => {
    fetchSubjectConfigAndPapers();
  }, [user]);

  const fetchSubjectConfigAndPapers = async () => {
    if (!user) return;
    setLoading(true);
    const path = 'questionPapers';

    // 1. Fetch offline cached papers first
    const offlineList = await getOfflinePracticePapers(user.subject);
    const offlineMap: Record<string, DownloadedPracticePaper> = {};
    offlineList.forEach(p => {
      offlineMap[p.id] = p;
    });
    setDownloadedPapersMap(offlineMap);

    // If device is offline, populate papers from offline storage immediately
    if (!isOnline()) {
      setOfflineMode(true);
      setPapers(offlineList);
      setLoading(false);
      return;
    }

    try {
      const q = query(
        collection(db, path),
        where('subject', '==', user.subject),
        orderBy('year', 'desc')
      );

      const [allSubs, querySnapshot] = await Promise.all([
        fetchSubjectsByCurriculum(),
        getDocs(q)
      ]);
      
      const matched = getPapersForSubjectName(user.subject, user.level, allSubs);
      setSubjectPapers(matched.map(p => ({ id: p.id, name: p.name })));

      const papersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuestionPaper));
      
      if (papersData.length > 0) {
        setPapers(papersData);
      } else if (offlineList.length > 0) {
        setPapers(offlineList);
      }
    } catch (error) {
      console.warn("Firestore fetch failed, falling back to offline cache:", error);
      if (offlineList.length > 0) {
        setPapers(offlineList);
        setOfflineMode(true);
      } else {
        try { handleFirestoreError(error, OperationType.LIST, path); } catch (e) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPaper = async (paper: QuestionPaper) => {
    try {
      setDownloadingId(paper.id);
      const downloaded = await downloadPracticePaper(paper);
      setDownloadedPapersMap(prev => ({ ...prev, [paper.id]: downloaded }));
      toast.success(`Downloaded "${paper.title}" for offline study!`);
    } catch (err) {
      console.error("Failed to download paper for offline use:", err);
      toast.error("Failed to download paper for offline study.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRemoveOffline = async (paperId: string, title: string) => {
    try {
      await removeOfflinePracticePaper(paperId);
      setDownloadedPapersMap(prev => {
        const next = { ...prev };
        delete next[paperId];
        return next;
      });
      toast.success(`Removed "${title}" from offline downloads.`);
    } catch (err) {
      toast.error("Failed to remove offline paper.");
    }
  };

  const handleDownloadAllPapers = async () => {
    if (papers.length === 0) return;
    setDownloadingAll(true);
    let count = 0;
    try {
      for (const p of papers) {
        if (!downloadedPapersMap[p.id]) {
          await downloadPracticePaper(p);
          count++;
        }
      }
      const refreshedList = await getOfflinePracticePapers(user?.subject);
      const offlineMap: Record<string, DownloadedPracticePaper> = {};
      refreshedList.forEach(p => { offlineMap[p.id] = p; });
      setDownloadedPapersMap(offlineMap);
      toast.success(`Downloaded ${count} papers for offline study!`);
    } catch (err) {
      toast.error("Error during bulk download.");
    } finally {
      setDownloadingAll(false);
    }
  };

  const downloadedCount = Object.keys(downloadedPapersMap).length;
  const filterTabs = [
    'All', 
    ...(downloadedCount > 0 ? [`Downloaded (${downloadedCount})`] : []),
    ...subjectPapers.map(sp => sp.name)
  ];

  const filteredPapers = papers.filter(p => {
    const matchesSearch = searchQuery.trim() === '' || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.paperType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(p.year).includes(searchQuery);

    if (!matchesSearch) return false;

    if (filter === 'All') return true;
    if (filter.startsWith('Downloaded')) return Boolean(downloadedPapersMap[p.id]);
    return p.paperType === filter || p.title.toLowerCase().includes(filter.toLowerCase());
  });

  if (!user) return null;

  return (
    <ModernDashboardLayout role="student" activeTab="practice">
      <div className="space-y-6 max-w-7xl mx-auto w-full min-w-0">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shrink-0"
              title={t('common.backToDashboard', 'Go to Dashboard')}
            >
              <LayoutDashboard size={20} />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {t('nav.practice', 'Practice Papers')}
                </h1>
                {offlineMode && (
                  <Badge variant="warning" className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-bold">
                    <WifiOff size={10} className="mr-1" /> Offline Active
                  </Badge>
                )}
              </div>
              <p className="text-slate-500 font-medium text-sm">
                {t('practice.subtitle', 'Browse and practice real GCE A-Level & HND papers')} ({user.subject})
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Bulk Download button for offline resilience */}
            {papers.length > 0 && user.paymentStatus === 'paid' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadAllPapers}
                loading={downloadingAll}
                className="rounded-xl border-indigo-200 text-indigo-700 bg-indigo-50/70 hover:bg-indigo-100 font-bold text-xs shrink-0"
              >
                <Download size={14} className="mr-1.5" />
                {downloadedCount === papers.length ? 'All Downloaded (Offline Ready)' : `Download All (${papers.length})`}
              </Button>
            )}

            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('search.placeholder', 'Search papers...')} 
                className="w-full pl-12 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900 text-sm"
              />
            </div>
          </div>
        </header>

        {/* Offline Cache Info Banner */}
        {downloadedCount > 0 && (
          <div className="p-4 bg-indigo-900 text-white rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-800 rounded-xl">
                <HardDrive size={18} className="text-indigo-300" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-indigo-300">
                  Service Worker Offline Storage
                </p>
                <p className="text-sm font-bold text-white">
                  {downloadedCount} Practice {downloadedCount === 1 ? 'Paper' : 'Papers'} Cached for Offline Study
                </p>
              </div>
            </div>
            <div className="text-xs text-indigo-200 font-medium flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
              Available without active internet connection
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2.5 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          {filterTabs.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-1.5",
                filter === f 
                  ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              )}
            >
              {f.startsWith('Downloaded') && <HardDrive size={13} className="text-emerald-500" />}
              {f === 'All' ? t('common.all', 'All') : f}
            </button>
          ))}
        </div>

        {/* Papers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-64 animate-pulse bg-slate-100 rounded-3xl" />
            ))}
          </div>
        ) : filteredPapers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPapers.map((paper) => {
              const isDownloaded = Boolean(downloadedPapersMap[paper.id]);
              const isDownloading = downloadingId === paper.id;

              return (
                <Card key={paper.id} className="p-6 sm:p-7 flex flex-col group hover:border-indigo-600 transition-all rounded-3xl shadow-xs relative">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                      <FileText size={24} />
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isDownloaded && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={11} /> Offline Ready
                        </span>
                      )}
                      <Badge variant={paper.paperType === 'Paper 1' ? 'primary' : paper.paperType === 'Paper 2' ? 'info' : 'success'}>
                        {paper.paperType}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 mb-4">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {paper.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar size={12} /> {paper.year}</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> 3 {t('lms.hours', 'Hours')}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">
                    {paper.description}
                  </p>

                  <div className="mt-auto space-y-2 pt-2 border-t border-slate-100">
                    {user.paymentStatus === 'paid' ? (
                      <div className="flex items-center gap-2">
                        <Link to={`/practice/${paper.id}`} className="flex-1">
                          <Button className="w-full group/btn font-bold text-xs py-2.5 rounded-xl">
                            {t('practice.startPractice', 'Start Practice')} <ArrowRight className="ml-1.5 group-hover/btn:translate-x-1 transition-transform" size={14} />
                          </Button>
                        </Link>

                        {/* Download for Offline Button */}
                        {isDownloaded ? (
                          <button
                            onClick={() => handleRemoveOffline(paper.id, paper.title)}
                            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                            title="Remove offline copy"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadPaper(paper)}
                            loading={isDownloading}
                            className="rounded-xl border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-300 shrink-0 px-3"
                            title="Save for offline study"
                          >
                            <Download size={14} />
                          </Button>
                        )}
                      </div>
                    ) : (
                      <Button 
                        className="w-full group/btn bg-slate-100 text-slate-400 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all font-bold text-xs rounded-xl"
                        onClick={() => navigate('/payment')}
                      >
                        <Lock className="mr-1.5" size={14} /> {t('common.upgradeToPro', 'Unlock Paper')} <ArrowRight className="ml-1.5 group-hover/btn:translate-x-1 transition-transform" size={14} />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto">
              <FileText size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{t('common.noRecordsFound', 'No papers found')}</h3>
              <p className="text-slate-500 font-medium">{t('common.tryAdjustingFilters', 'Try adjusting your filters or check back later.')}</p>
            </div>
            <Button variant="outline" onClick={() => setFilter('All')}>{t('common.clearFilters', 'Clear Filters')}</Button>
          </div>
        )}
      </div>
    </ModernDashboardLayout>
  );
}
