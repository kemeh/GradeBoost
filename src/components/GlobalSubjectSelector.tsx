import React, { useState, useEffect, useMemo } from 'react';
import { 
  AcademicStream, 
  AcademicLevel, 
  SyllabusSubject 
} from '../types/academicSyllabus';
import { 
  fetchAcademicStreams, 
  fetchAcademicLevels, 
  fetchSyllabusSubjects 
} from '../services/academicSyllabusService';
import { Search, Filter, BookOpen, Layers, Check } from 'lucide-react';
import { cn } from './ui';

export interface GlobalSubjectSelectorProps {
  selectedSubjectId: string;
  onChange: (subjectId: string, subject: SyllabusSubject | null) => void;
  // Optional outer controls
  streamId?: string;
  onStreamChange?: (streamId: string) => void;
  levelId?: string;
  onLevelChange?: (levelId: string) => void;
  // Options
  showFilters?: boolean;
  className?: string;
  label?: string;
  language?: 'en' | 'fr' | 'bilingual';
}

export default function GlobalSubjectSelector({
  selectedSubjectId,
  onChange,
  streamId: propStreamId,
  onStreamChange,
  levelId: propLevelId,
  onLevelChange,
  showFilters = true,
  className,
  label = "Select Academic Subject",
  language = "en"
}: GlobalSubjectSelectorProps) {
  // Local state falls back if outer props aren't provided
  const [localStreamId, setLocalStreamId] = useState<string>('general');
  const [localLevelId, setLocalLevelId] = useState<string>('advanced_level');

  const streamId = propStreamId || localStreamId;
  const levelId = propLevelId || localLevelId;

  const [streams, setStreams] = useState<AcademicStream[]>([]);
  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [allSubjects, setAllSubjects] = useState<SyllabusSubject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. Initial Load of Streams & All Mapped Subjects
  useEffect(() => {
    async function loadInitial() {
      setLoading(true);
      try {
        const [sList, subList] = await Promise.all([
          fetchAcademicStreams(),
          fetchSyllabusSubjects() // fetch all
        ]);
        setStreams(sList);
        setAllSubjects(subList);

        if (sList.length > 0 && !propStreamId && !localStreamId) {
          setLocalStreamId(sList[0].id);
        }
      } finally {
        setLoading(false);
      }
    }
    loadInitial();
  }, []);

  // 2. Cascade Stream -> Load Levels
  useEffect(() => {
    async function loadLevels() {
      if (!streamId) return;
      const lList = await fetchAcademicLevels(streamId);
      setLevels(lList);
      if (lList.length > 0 && !propLevelId) {
        setLocalLevelId(lList[0].id);
        if (onLevelChange) onLevelChange(lList[0].id);
      }
    }
    loadLevels();
  }, [streamId]);

  // Handle Stream Selection
  const handleStreamSelect = (id: string) => {
    if (onStreamChange) {
      onStreamChange(id);
    } else {
      setLocalStreamId(id);
    }
    setSearchQuery('');
  };

  // Handle Level Selection
  const handleLevelSelect = (id: string) => {
    if (onLevelChange) {
      onLevelChange(id);
    } else {
      setLocalLevelId(id);
    }
    setSearchQuery('');
  };

  // Computed: Filtered list of subjects based on stream, level and search
  const filteredSubjects = useMemo(() => {
    return allSubjects.filter(sub => {
      // 1. Stream filter
      if (streamId && sub.streamId !== streamId) return false;
      // 2. Level filter
      if (levelId && sub.levelId !== levelId) return false;
      // 3. Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesEn = sub.name.toLowerCase().includes(q);
        const matchesFr = sub.nameFr?.toLowerCase().includes(q) || false;
        const matchesCode = sub.code.toLowerCase().includes(q);
        return matchesEn || matchesFr || matchesCode;
      }
      return true;
    });
  }, [allSubjects, streamId, levelId, searchQuery]);

  const selectedSubject = useMemo(() => {
    return allSubjects.find(s => s.id === selectedSubjectId) || null;
  }, [allSubjects, selectedSubjectId]);

  const displaySubjectName = (sub: SyllabusSubject | null) => {
    if (!sub) return "Select a subject...";
    const nameStr = language === 'fr' ? (sub.nameFr || sub.name) : sub.name;
    return `${nameStr} (${sub.code})`;
  };

  return (
    <div className={cn("space-y-1.5 w-full text-left", className)}>
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}

      {/* Reusable Cascade Filters */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* Stream Selector */}
          <div>
            <select
              value={streamId}
              onChange={(e) => handleStreamSelect(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
            >
              {streams.map(s => (
                <option key={s.id} value={s.id}>
                  {language === 'fr' ? (s.nameFr || s.name) : s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Level Selector */}
          <div>
            <select
              value={levelId}
              onChange={(e) => handleLevelSelect(e.target.value)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 outline-none"
            >
              {levels.map(l => (
                <option key={l.id} value={l.id}>
                  {language === 'fr' ? (l.nameFr || l.name) : l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Main Dropdown Picker with Custom Search Input */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-500 transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <BookOpen size={16} className="text-indigo-500 shrink-0" />
            {displaySubjectName(selectedSubject)}
          </span>
          <span className="text-[10px] text-slate-400 font-bold shrink-0">▼</span>
        </button>

        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl p-3 space-y-2.5 max-h-[350px] overflow-y-auto">
            {/* Subject Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search subjects or codes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:ring-1 focus:ring-indigo-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* List */}
            <div className="space-y-1">
              {loading ? (
                <p className="text-xs text-slate-400 py-4 text-center">Loading subjects...</p>
              ) : filteredSubjects.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No subjects mapped to this level.</p>
              ) : (
                filteredSubjects.map(sub => {
                  const isChosen = sub.id === selectedSubjectId;
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        onChange(sub.id, sub);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors cursor-pointer",
                        isChosen 
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" 
                          : "hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300"
                      )}
                    >
                      <span className="truncate">
                        {language === 'fr' ? (sub.nameFr || sub.name) : sub.name}
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold ml-1">
                          ({sub.code})
                        </span>
                      </span>
                      {isChosen && <Check size={14} className="text-indigo-600 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
