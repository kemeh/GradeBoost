import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, X, BookOpen, Sparkles, Award, FileText, 
  HelpCircle, UserCheck, ChevronRight, Layers, ArrowRight
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { NavSearchResult } from '../../types/navigation';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SEARCH_DATABASE: NavSearchResult[] = [
  // Subjects
  { id: 'sub-1', title: 'Mathematics (GCE O/A Level)', category: 'Subject', href: '/practice?subject=Mathematics', subtitle: 'Pure & Applied Maths, Calculus, Geometry' },
  { id: 'sub-2', title: 'Physics & Electromagnetism', category: 'Subject', href: '/practice?subject=Physics', subtitle: 'Mechanics, Thermodynamics, Optics' },
  { id: 'sub-3', title: 'Electrical Technology (TVEE)', category: 'Subject', href: '/practice?subject=Electrical', subtitle: 'AC/DC Circuits, Machines, Power Systems' },
  { id: 'sub-4', title: 'Financial Accounting & Ledgers', category: 'Subject', href: '/practice?subject=Accounting', subtitle: 'Double Entry, Trial Balance, Cash Flow' },
  { id: 'sub-5', title: 'Computer Science & Python', category: 'Subject', href: '/practice?subject=ComputerScience', subtitle: 'Algorithms, Data Structures, Coding' },
  { id: 'sub-6', title: 'Littérature Française & Dissertation', category: 'Subject', href: '/practice?subject=French', subtitle: 'Commentaire Composé, Textes Choisis' },

  // Lessons
  { id: 'les-1', title: 'Calculus: Derivatives & Integration Techniques', category: 'Lesson', href: '/lms', subtitle: 'GCE A-Level Mathematics Chapter 4' },
  { id: 'les-2', title: 'Ohms Law & Kirchoffs Electrical Rules', category: 'Lesson', href: '/lms', subtitle: 'TVEE Technical Specialty Module 2' },
  { id: 'les-3', title: 'Python Loops & Object Oriented Basics', category: 'Lesson', href: '/lms', subtitle: 'Computer Science Form 5' },
  { id: 'les-4', title: 'Méthodologie du Commentaire Composé', category: 'Lesson', href: '/lms', subtitle: 'Terminale A & C Français' },

  // Mock Exams
  { id: 'exam-1', title: 'Official 2025 MINESEC General Mock Examination', category: 'Mock Exam', href: '/exams', subtitle: 'All Series A, C, D, TI' },
  { id: 'exam-2', title: 'National GCE Board Practice Examination 2024', category: 'Mock Exam', href: '/exams', subtitle: 'O-Level & A-Level Paper 1 & Paper 2' },
  { id: 'exam-3', title: 'TVEE Industrial & Commercial Specialty Mock', category: 'Mock Exam', href: '/exams', subtitle: 'CAP & Technical Baccalaureate' },

  // AI Tutor
  { id: 'ai-1', title: 'Ask Edulpha AI Step-by-Step Solver', category: 'AI Tutor', href: '/diagnostic', subtitle: '24/7 AI tutor for instant past paper help' },
  { id: 'ai-2', title: 'AI Exam Readiness Diagnostic Test', category: 'AI Tutor', href: '/diagnostic', subtitle: 'Analyze your weak topics across 10 years of exams' },

  // Help Articles
  { id: 'help-1', title: 'How to download past papers for offline revision', category: 'Help Article', href: '/docs', subtitle: 'Edulpha Mobile App Guide' },
  { id: 'help-2', title: 'Understanding your Exam Readiness Score', category: 'Help Article', href: '/docs', subtitle: 'Analytics and score calculation' },
  { id: 'help-3', title: 'MTN & Orange Money Subscription Guide', category: 'Help Article', href: '/payment', subtitle: 'Mobile payment instructions' }
];

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<NavSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(SEARCH_DATABASE.slice(0, 5));
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(SEARCH_DATABASE.slice(0, 5));
      setSelectedIndex(0);
      return;
    }

    const q = query.toLowerCase();
    const filtered = SEARCH_DATABASE.filter(item => 
      item.title.toLowerCase().includes(q) || 
      item.category.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q))
    );
    setResults(filtered);
    setSelectedIndex(0);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (item: NavSearchResult) => {
    onClose();
    if (item.href.startsWith('#')) {
      const el = document.getElementById(item.href.replace('#', ''));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(item.href);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(1, results.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    }
  };

  const getCategoryIcon = (cat: NavSearchResult['category']) => {
    switch (cat) {
      case 'Subject': return <Layers size={14} className="text-indigo-600" />;
      case 'Lesson': return <BookOpen size={14} className="text-emerald-600" />;
      case 'Mock Exam': return <Award size={14} className="text-amber-600" />;
      case 'AI Tutor': return <Sparkles size={14} className="text-rose-600" />;
      case 'Help Article': return <HelpCircle size={14} className="text-sky-600" />;
      default: return <FileText size={14} className="text-slate-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/70">
          <Search size={20} className="text-indigo-600 shrink-0 ml-2" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              language === 'fr' 
                ? 'Rechercher des épreuves, cours, matières, examens ou tuteur IA...' 
                : 'Search subjects, lessons, teachers, mock exams, past papers or AI tutor...'
            }
            className="w-full bg-transparent text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-bold text-slate-500 hover:text-slate-900 bg-slate-200/60 rounded-xl transition-colors shrink-0"
          >
            ESC
          </button>
        </div>

        {/* Suggestions / Results Area */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {!query.trim() && (
            <div className="px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-slate-400">
              {language === 'fr' ? 'Recherches populaires :' : 'Popular Suggestions:'}
            </div>
          )}

          {results.length === 0 ? (
            <div className="py-12 text-center space-y-2 text-slate-400">
              <Search size={32} className="mx-auto text-slate-300 stroke-[1.5]" />
              <p className="text-sm font-bold text-slate-600">
                {language === 'fr' ? 'Aucun résultat trouvé' : 'No results found'}
              </p>
              <p className="text-xs">
                {language === 'fr' ? 'Essayez de rechercher avec un autre mot-clé' : 'Try searching for Math, Physics, GCE, or Baccalauréat'}
              </p>
            </div>
          ) : (
            results.map((item, idx) => (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`p-3 rounded-2xl cursor-pointer flex items-center justify-between transition-all ${
                  idx === selectedIndex 
                    ? 'bg-indigo-50/80 border border-indigo-200 shadow-2xs' 
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-900">{item.title}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[9px] font-bold uppercase text-slate-600">
                        {item.category}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-[11px] text-slate-500 font-medium leading-tight">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>

                <ChevronRight size={16} className={`shrink-0 transition-transform ${idx === selectedIndex ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <div className="flex items-center gap-4">
            <span><strong className="text-slate-700">↑↓</strong> {language === 'fr' ? 'Naviguer' : 'Navigate'}</span>
            <span><strong className="text-slate-700">↵</strong> {language === 'fr' ? 'Sélectionner' : 'Select'}</span>
          </div>
          <span className="text-indigo-600 font-bold">Edulpha Global Search</span>
        </div>
      </div>
    </div>
  );
}
