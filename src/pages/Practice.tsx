import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FileText, Search, Filter, ArrowRight, 
  Calendar, BookOpen, Clock, ChevronRight,
  LayoutDashboard, LogOut, Target, Trophy, Settings, TrendingUp, Lock
} from 'lucide-react';
import { db, auth } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from '../components/Sidebar';
import { Button, Card, Badge, cn } from '../components/ui';
import { QuestionPaper, PaperType, SubjectModel } from '../types';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrors';
import { getPapersForSubjectName } from '../data/defaultSubjects';

export default function Practice() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [papers, setPapers] = useState<QuestionPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [subjectPapers, setSubjectPapers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const fetchSubjectConfigAndPapers = async () => {
      if (!user) return;
      const path = 'questionPapers';
      try {
        // Fetch all active subjects to resolve dynamic paper tabs
        const subSnap = await getDocs(query(collection(db, 'subjects'), where('isActive', '==', true)));
        const allSubs = subSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as SubjectModel[];
        
        const matched = getPapersForSubjectName(user.subject, user.level, allSubs);
        setSubjectPapers(matched.map(p => ({ id: p.id, name: p.name })));

        const q = query(
          collection(db, path),
          where('subject', '==', user.subject),
          orderBy('year', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const papersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuestionPaper));
        setPapers(papersData);
      } catch (error) {
        handleFirestoreError(error, OperationType.LIST, path);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectConfigAndPapers();
  }, [user]);

  const filterTabs = ['All', ...subjectPapers.map(sp => sp.name)];

  const filteredPapers = filter === 'All' 
    ? papers 
    : papers.filter(p => {
        // Match either paperType directly or paper name (e.g. Paper 1, Paper 2, Paper 3)
        return p.paperType === filter || p.title.toLowerCase().includes(filter.toLowerCase());
      });

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800 w-full max-w-full overflow-x-hidden">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 lg:pl-72 p-3 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full min-w-0 pb-28 sm:pb-8">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => navigate('/dashboard')}
              className="rounded-xl border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
              title="Go to Dashboard"
            >
              <LayoutDashboard size={20} />
            </Button>
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">Practice Papers</h1>
              <p className="text-slate-500 font-medium">Browse and practice real GCE A-Level papers for {user.subject}.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="Search papers..." 
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none transition-all font-bold text-slate-900"
              />
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-12 overflow-x-auto pb-2 custom-scrollbar">
          {filterTabs.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap",
                filter === f 
                  ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
                  : "bg-white text-slate-400 border border-slate-100 hover:border-slate-300"
              )}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Papers Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-64 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : filteredPapers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPapers.map((paper) => (
              <Card key={paper.id} className="p-8 flex flex-col group hover:border-indigo-600 transition-all">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                    <FileText size={24} />
                  </div>
                  <Badge variant={paper.paperType === 'Paper 1' ? 'primary' : paper.paperType === 'Paper 2' ? 'info' : 'success'}>
                    {paper.paperType}
                  </Badge>
                </div>
                
                <div className="space-y-2 mb-8">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                    {paper.title}
                  </h3>
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {paper.year}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> 3 Hours</span>
                  </div>
                </div>

                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8 line-clamp-2">
                  {paper.description}
                </p>

                {user.paymentStatus === 'paid' ? (
                  <Link to={`/practice/${paper.id}`} className="mt-auto">
                    <Button className="w-full group/btn">
                      Start Practice <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={16} />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    className="w-full group/btn bg-slate-100 text-slate-400 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all"
                    onClick={() => navigate('/payment')}
                  >
                    <Lock className="mr-2" size={16} /> Unlock Paper <ArrowRight className="ml-2 group-hover/btn:translate-x-1 transition-transform" size={16} />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 space-y-6">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto">
              <FileText size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">No papers found</h3>
              <p className="text-slate-500 font-medium">Try adjusting your filters or check back later.</p>
            </div>
            <Button variant="outline" onClick={() => setFilter('All')}>Clear Filters</Button>
          </div>
        )}
      </main>
    </div>
  );
}
