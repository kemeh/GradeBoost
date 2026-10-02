import React, { useState, useEffect, useMemo } from 'react';
import { 
  AcademicStream, 
  AcademicLevel, 
  SyllabusSubject, 
  SyllabusModule, 
  SyllabusTopicModel, 
  StudentTopicProgress,
  StudyRecommendation 
} from '../../types/academicSyllabus';
import { 
  fetchAcademicStreams, 
  fetchAcademicLevels, 
  fetchSyllabusSubjects, 
  fetchSyllabusModules, 
  fetchSyllabusTopics, 
  fetchStudentTopicProgress,
  updateStudentTopicProgress 
} from '../../services/academicSyllabusService';
import { 
  generateDailyStudyRecommendations, 
  calculateSyllabusCoverage, 
  getPriorityWording 
} from '../../services/academicPriorityEngine';
import { Card, Button, Badge } from '../ui';
import { 
  BookOpen, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  Search, 
  Filter, 
  Zap, 
  Target, 
  Layers, 
  RotateCw, 
  ArrowUpRight,
  TrendingUp,
  FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import TopicRevisionNoteModal from './TopicRevisionNoteModal';

export default function StudentSyllabusDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Cascade Selection States
  const [streams, setStreams] = useState<AcademicStream[]>([]);
  const [selectedStreamId, setSelectedStreamId] = useState<string>('general');
  const [levels, setLevels] = useState<AcademicLevel[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string>('advanced_level');
  const [subjects, setSubjects] = useState<SyllabusSubject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('gen_al_cs');

  // Syllabus Data States
  const [modules, setModules] = useState<SyllabusModule[]>([]);
  const [topics, setTopics] = useState<SyllabusTopicModel[]>([]);
  const [progressMap, setProgressMap] = useState<Map<string, StudentTopicProgress>>(new Map());
  const [loading, setLoading] = useState(true);

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [selectedPaperFilter, setSelectedPaperFilter] = useState<string>('ALL');

  // Active Note Modal
  const [activeModalTopic, setActiveModalTopic] = useState<SyllabusTopicModel | null>(null);

  // 1. Initial Load of Streams
  useEffect(() => {
    async function initStreams() {
      const sList = await fetchAcademicStreams();
      setStreams(sList);
      if (sList.length > 0 && !selectedStreamId) {
        setSelectedStreamId(sList[0].id);
      }
    }
    initStreams();
  }, []);

  // 2. Cascade Stream -> Levels
  useEffect(() => {
    async function loadLevels() {
      if (!selectedStreamId) return;
      const lList = await fetchAcademicLevels(selectedStreamId);
      setLevels(lList);
      if (lList.length > 0 && !lList.some(l => l.id === selectedLevelId)) {
        setSelectedLevelId(lList[0].id);
      }
    }
    loadLevels();
  }, [selectedStreamId]);

  // 3. Cascade Level -> Subjects
  useEffect(() => {
    async function loadSubjects() {
      if (!selectedStreamId || !selectedLevelId) return;
      const subList = await fetchSyllabusSubjects(selectedStreamId, selectedLevelId);
      setSubjects(subList);
      if (subList.length > 0 && !subList.some(s => s.id === selectedSubjectId)) {
        setSelectedSubjectId(subList[0].id);
      }
    }
    loadSubjects();
  }, [selectedStreamId, selectedLevelId]);

  // 4. Cascade Subject -> Modules & Topics
  useEffect(() => {
    async function loadSyllabus() {
      if (!selectedSubjectId) return;
      setLoading(true);
      try {
        const [modList, topList, progList] = await Promise.all([
          fetchSyllabusModules(selectedSubjectId),
          fetchSyllabusTopics(selectedSubjectId),
          user?.uid ? fetchStudentTopicProgress(user.uid, selectedSubjectId) : Promise.resolve([])
        ]);

        setModules(modList);
        setTopics(topList);

        const pMap = new Map<string, StudentTopicProgress>();
        progList.forEach(p => pMap.set(p.topicId, p));
        setProgressMap(pMap);
      } finally {
        setLoading(false);
      }
    }
    loadSyllabus();
  }, [selectedSubjectId, user?.uid]);

  // Computed Metrics
  const coverageMetrics = useMemo(() => {
    return calculateSyllabusCoverage(topics, progressMap);
  }, [topics, progressMap]);

  const dailyRecommendations = useMemo(() => {
    return generateDailyStudyRecommendations(topics, progressMap, 4);
  }, [topics, progressMap]);

  // Filtered Topics
  const filteredTopics = useMemo(() => {
    return topics.filter(t => {
      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.topicName.toLowerCase().includes(q);
        const matchesModule = t.moduleTitle.toLowerCase().includes(q);
        const matchesSubtopics = t.subtopics.some(s => s.name.toLowerCase().includes(q));
        const matchesObjectives = t.learningObjectives.some(o => o.toLowerCase().includes(q));
        if (!matchesName && !matchesModule && !matchesSubtopics && !matchesObjectives) {
          return false;
        }
      }

      // Priority match
      if (selectedPriorityFilter !== 'ALL' && t.priority !== selectedPriorityFilter) {
        return false;
      }

      // Paper match
      if (selectedPaperFilter !== 'ALL' && !t.paperRelevance.includes(selectedPaperFilter as any)) {
        return false;
      }

      return true;
    });
  }, [topics, searchQuery, selectedPriorityFilter, selectedPaperFilter]);

  // Group topics by module
  const groupedModules = useMemo(() => {
    return modules.map(m => {
      const modTopics = filteredTopics.filter(t => t.moduleId === m.id);
      return {
        ...m,
        topics: modTopics
      };
    }).filter(m => m.topics.length > 0 || !searchQuery);
  }, [modules, filteredTopics, searchQuery]);

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-2 sm:px-4 py-4">
      {/* Top Banner & Hierarchy Navigator */}
      <div className="p-4 sm:p-8 bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl shadow-xl border border-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="px-3 py-1 bg-indigo-500/30 text-indigo-300 border border-indigo-400/30 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" />
              Cameroon GCE Academic Syllabus & Priority Engine
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/daily-challenge')}
                className="bg-indigo-600/40 hover:bg-indigo-600 border-indigo-400/40 text-white text-xs font-bold"
              >
                <Zap size={14} className="mr-1 text-amber-300" />
                Today's Daily Challenge
              </Button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Curriculum Knowledge & Study Priority
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Every topic is cataloged from approved syllabus specifications and evaluated with verified Cameroon GCE past examinations. Discover exactly what is most important to revise today based on exam frequency and personal mastery.
          </p>

          {/* Academic Selectors (Cascade) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-indigo-800/40">
            {/* Stream */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-indigo-300 mb-1">
                Academic Stream
              </label>
              <select
                value={selectedStreamId}
                onChange={(e) => setSelectedStreamId(e.target.value)}
                className="w-full p-2.5 bg-slate-900/90 text-white border border-indigo-400/30 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {streams.map(str => (
                  <option key={str.id} value={str.id} className="bg-slate-900 text-white">
                    {str.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-indigo-300 mb-1">
                Level / Class
              </label>
              <select
                value={selectedLevelId}
                onChange={(e) => setSelectedLevelId(e.target.value)}
                className="w-full p-2.5 bg-slate-900/90 text-white border border-indigo-400/30 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {levels.map(lvl => (
                  <option key={lvl.id} value={lvl.id} className="bg-slate-900 text-white">
                    {lvl.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-indigo-300 mb-1">
                Syllabus Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full p-2.5 bg-slate-900/90 text-white border border-indigo-400/30 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-400"
              >
                {subjects.map(sub => (
                  <option key={sub.id} value={sub.id} className="bg-slate-900 text-white">
                    {sub.name} ({sub.examinationType})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* "WHAT SHOULD I STUDY TODAY?" SMART RECOMMENDATIONS */}
      {dailyRecommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Target className="text-indigo-600 dark:text-indigo-400" size={20} />
                WHAT SHOULD I STUDY TODAY?
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Personalized priority based on past GCE exam weight, recent student activity, and knowledge mastery.
              </p>
            </div>

            <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800">
              Balanced Topic Rotation Active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dailyRecommendations.map((rec, rIdx) => {
              const matchingTopic = topics.find(t => t.id === rec.topicId);
              return (
                <Card 
                  key={rec.topicId || rIdx}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 hover:shadow-md transition shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        rec.priority === 'CRITICAL' ? 'bg-rose-500 text-white' :
                        rec.priority === 'HIGH' ? 'bg-amber-500 text-slate-900' :
                        rec.priority === 'MEDIUM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white'
                      }`}>
                        {rec.priority} ({rec.priorityScore}/100)
                      </span>

                      <span className="text-[11px] text-slate-500 flex items-center gap-1 font-semibold">
                        <Clock size={12} /> {rec.estimatedMinutes} mins
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-2">
                      {rec.topicName}
                    </h3>
                    
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                      {rec.moduleTitle} • {rec.paper}
                    </p>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-100 dark:border-slate-800/60">
                      "{rec.reason}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => matchingTopic && setActiveModalTopic(matchingTopic)}
                      className="w-full text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white py-1.5 flex items-center justify-center gap-1"
                    >
                      <BookOpen size={13} />
                      <span>Study Notes</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/daily-challenge?subject=${encodeURIComponent(rec.subjectName)}&topic=${encodeURIComponent(rec.topicName)}`)}
                      className="text-xs font-bold px-2 py-1.5 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Practice Daily Challenge on this topic"
                    >
                      <Zap size={14} className="text-amber-500" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* SYLLABUS COVERAGE TRACKER */}
      <Card className="p-4 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" />
              Syllabus Coverage: {selectedSubject?.name || 'Selected Subject'}
            </h3>
            <p className="text-xs text-slate-500">
              {coverageMetrics.introducedCount} of {coverageMetrics.totalTopics} syllabus topics started • {coverageMetrics.masteredCount} mastered
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {coverageMetrics.overallCoveragePercent}%
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
          <div 
            style={{ width: `${(coverageMetrics.masteredCount / Math.max(1, coverageMetrics.totalTopics)) * 100}%` }}
            className="bg-emerald-500 h-full transition-all duration-500"
            title={`Mastered: ${coverageMetrics.masteredCount}`}
          />
          <div 
            style={{ width: `${((coverageMetrics.introducedCount - coverageMetrics.masteredCount) / Math.max(1, coverageMetrics.totalTopics)) * 100}%` }}
            className="bg-indigo-500 h-full transition-all duration-500"
            title={`In Progress: ${coverageMetrics.introducedCount - coverageMetrics.masteredCount}`}
          />
          <div 
            style={{ width: `${(coverageMetrics.neverStudiedCount / Math.max(1, coverageMetrics.totalTopics)) * 100}%` }}
            className="bg-slate-200 dark:bg-slate-700 h-full transition-all duration-500"
            title={`Not Yet Studied: ${coverageMetrics.neverStudiedCount}`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300 pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            <span>Mastered ({coverageMetrics.masteredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />
            <span>In Progress ({coverageMetrics.introducedCount - coverageMetrics.masteredCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700 inline-block" />
            <span>Not Yet Studied ({coverageMetrics.neverStudiedCount})</span>
          </div>
          {coverageMetrics.requiresRevisionCount > 0 && (
            <div className="flex items-center gap-1.5 text-rose-500 font-bold">
              <AlertCircle size={13} />
              <span>Requires Revision ({coverageMetrics.requiresRevisionCount})</span>
            </div>
          )}
        </div>
      </Card>

      {/* FILTER & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic, subtopic, learning objective, or past question..."
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs sm:text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Clear
            </button>
          )}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={15} className="text-slate-400 hidden sm:block" />
          <select
            value={selectedPriorityFilter}
            onChange={(e) => setSelectedPriorityFilter(e.target.value as any)}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="CRITICAL">Critical Priority (90-100)</option>
            <option value="HIGH">High Priority (75-89)</option>
            <option value="MEDIUM">Medium Priority (50-74)</option>
            <option value="LOW">Low Priority (0-49)</option>
          </select>

          <select
            value={selectedPaperFilter}
            onChange={(e) => setSelectedPaperFilter(e.target.value)}
            className="p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold outline-none"
          >
            <option value="ALL">All Papers</option>
            <option value="Paper 1">Paper 1 (MCQ)</option>
            <option value="Paper 2">Paper 2 (Theory)</option>
            <option value="Paper 3">Paper 3 (Practical)</option>
          </select>
        </div>
      </div>

      {/* SYLLABUS MODULES & TOPICS TREE */}
      {loading ? (
        <div className="text-center py-12 space-y-3">
          <RotateCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading syllabus modules and topic knowledge units...</p>
        </div>
      ) : groupedModules.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-2">
          <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No topics match your filters</h3>
          <p className="text-xs text-slate-500">Try modifying your search keywords or priority filter.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedModules.map((moduleItem, mIdx) => (
            <div key={moduleItem.id || mIdx} className="space-y-3">
              {/* Module Header */}
              <div className="flex items-center justify-between gap-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white text-xs font-black flex items-center justify-center">
                    {mIdx + 1}
                  </span>
                  <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                    {moduleItem.moduleNumber}: {moduleItem.title}
                  </h3>
                </div>
                <span className="text-xs text-slate-500 font-semibold">
                  {moduleItem.topics.length} Topics
                </span>
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 gap-3">
                {moduleItem.topics.map((tItem) => {
                  const prog = progressMap.get(tItem.id);
                  const mastery = prog?.masteryScore || 0;

                  return (
                    <Card
                      key={tItem.id}
                      className="p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-600 transition shadow-xs space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Priority Badge */}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              tItem.priority === 'CRITICAL' ? 'bg-rose-500 text-white' :
                              tItem.priority === 'HIGH' ? 'bg-amber-500 text-slate-900' :
                              tItem.priority === 'MEDIUM' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-white'
                            }`}>
                              {tItem.priority} • {tItem.priorityScore}/100
                            </span>

                            {/* Paper Tags */}
                            {tItem.paperRelevance.map((paperName) => (
                              <span 
                                key={paperName}
                                className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-[10px] font-bold border border-slate-200 dark:border-slate-700"
                              >
                                {paperName}
                              </span>
                            ))}

                            {tItem.isOfficialSyllabus ? (
                              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                                <CheckCircle2 size={12} /> Official Syllabus
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                                Edulpha AI Suggested
                              </span>
                            )}
                          </div>

                          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {tItem.topicName}
                          </h4>

                          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 max-w-3xl leading-relaxed">
                            {tItem.description}
                          </p>
                        </div>

                        {/* Action Buttons & Mastery */}
                        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          {mastery > 0 && (
                            <div className="text-right pr-2">
                              <span className="block text-[10px] text-slate-400 font-bold uppercase">Mastery</span>
                              <span className={`text-xs font-black ${
                                mastery >= 75 ? 'text-emerald-500' :
                                mastery >= 50 ? 'text-amber-500' : 'text-rose-500'
                              }`}>
                                {mastery}%
                              </span>
                            </div>
                          )}

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setActiveModalTopic(tItem)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2 px-3 flex items-center gap-1.5"
                          >
                            <BookOpen size={14} />
                            <span>Revision Note</span>
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/daily-challenge?subject=${encodeURIComponent(tItem.subjectName)}&topic=${encodeURIComponent(tItem.topicName)}`)}
                            className="text-xs font-bold py-2 px-3 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center gap-1"
                          >
                            <Zap size={14} className="text-amber-500" />
                            <span>Challenge</span>
                          </Button>
                        </div>
                      </div>

                      {/* Subtopics Pill List */}
                      {tItem.subtopics.length > 0 && (
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                            Subtopics:
                          </span>
                          {tItem.subtopics.map((s, sIdx) => (
                            <span 
                              key={s.id || sIdx}
                              className="px-2 py-0.5 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800/80 rounded-md text-[11px] font-medium"
                            >
                              {s.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Past GCE Questions Snippet Tag */}
                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-1">
                        <span className="italic text-slate-500">
                          {tItem.priorityReason}
                        </span>
                        {tItem.pastQuestionCount > 0 && (
                          <span className="font-bold text-indigo-600 dark:text-indigo-400">
                            {tItem.pastQuestionCount} Past Exam Questions Available
                          </span>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TOPIC REVISION NOTE MODAL */}
      {activeModalTopic && (
        <TopicRevisionNoteModal
          topic={activeModalTopic}
          progress={progressMap.get(activeModalTopic.id)}
          onClose={() => setActiveModalTopic(null)}
          onStartPractice={(t) => {
            navigate(`/daily-challenge?subject=${encodeURIComponent(t.subjectName)}&topic=${encodeURIComponent(t.topicName)}`);
          }}
        />
      )}
    </div>
  );
}
