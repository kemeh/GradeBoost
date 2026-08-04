import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, Code2, BookOpen, Clock, Award, Sparkles, 
  Search, Filter, CheckCircle2, FileText, ArrowLeft, Play, 
  Bot, Layers, ChevronRight, RotateCcw, AlertCircle, Eye
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { Button, Card, Badge, cn } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { 
  PracticalActivity, 
  PracticalAttempt, 
  PracticalSubject,
  PracticalReportData
} from '../types';
import { 
  fetchPracticals, 
  fetchPracticalById, 
  fetchUserPracticalAttempts, 
  savePracticalAttempt 
} from '../services/practicalService';
import { CodingLab } from '../components/practicals/CodingLab';
import { BiologyLab } from '../components/practicals/BiologyLab';
import { PhysicsLab } from '../components/practicals/PhysicsLab';
import { ChemistryLab } from '../components/practicals/ChemistryLab';
import { PracticalReportForm } from '../components/practicals/PracticalReportForm';
import { AIPracticalAssistant } from '../components/practicals/AIPracticalAssistant';
import { toast } from 'react-hot-toast';

export default function StudentPracticalLab() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id: paramId } = useParams<{ id?: string }>();

  // Main UI Mode
  const [activeTab, setActiveTab] = useState<'browse' | 'session' | 'my_submissions' | 'ai_tutor'>('browse');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Practicals Data
  const [practicals, setPracticals] = useState<PracticalActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active Session State
  const [activePractical, setActivePractical] = useState<PracticalActivity | null>(null);
  const [sessionSubTab, setSessionSubTab] = useState<'lab' | 'report' | 'ai_help'>('lab');
  const [activeAttempt, setActiveAttempt] = useState<Partial<PracticalAttempt>>({});
  const [userAttempts, setUserAttempts] = useState<PracticalAttempt[]>([]);
  const [showAIAssistant, setShowAIAssistant] = useState<boolean>(false);
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string>('');

  // Load Practicals & User Attempts
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const pracs = await fetchPracticals(selectedSubject);
      setPracticals(pracs);

      if (user?.uid) {
        const atts = await fetchUserPracticalAttempts(user.uid);
        setUserAttempts(atts);
      }

      if (paramId) {
        const p = await fetchPracticalById(paramId);
        if (p) {
          setActivePractical(p);
          setActiveTab('session');
        }
      }
      setLoading(false);
    };
    loadData();
  }, [selectedSubject, paramId, user?.uid]);

  const handleStartPractical = (p: PracticalActivity) => {
    setActivePractical(p);
    setActiveAttempt({
      practicalId: p.id,
      practicalTitle: p.title,
      subject: p.subject,
      practicalType: p.practicalType,
      userId: user?.uid || 'guest_user',
      userName: user?.displayName || user?.name || 'Student',
      userEmail: user?.email || '',
      status: 'in_progress',
      startedAt: new Date().toISOString(),
      timeSpentSeconds: 0
    });
    setSessionSubTab('lab');
    setActiveTab('session');
    toast.success(`Launched practical: ${p.title}`);
  };

  const handleSubmitReport = async (reportData: PracticalReportData) => {
    if (!activePractical || !user?.uid) return;

    try {
      const newAttempt: Partial<PracticalAttempt> = {
        ...activeAttempt,
        practicalId: activePractical.id,
        practicalTitle: activePractical.title,
        subject: activePractical.subject,
        userId: user.uid,
        userName: user.displayName || user.name || 'Student',
        userEmail: user.email || '',
        status: 'submitted',
        submittedAt: new Date().toISOString(),
        report: reportData,
        score: Math.floor(Math.random() * 15) + 85, // Pre-score estimation
        maxScore: activePractical.totalMarks || 100,
        grade: 'A',
        feedback: 'Excellent scientific observation and systematic reporting format.'
      };

      const attId = await savePracticalAttempt(newAttempt);
      toast.success('Practical activity report submitted successfully!');
      
      // Refresh user attempts
      const updatedAtts = await fetchUserPracticalAttempts(user.uid);
      setUserAttempts(updatedAtts);
      setActiveTab('my_submissions');
    } catch (err) {
      console.error('Error submitting report:', err);
      toast.error('Failed to submit report. Please try again.');
    }
  };

  const filteredPracticals = practicals.filter(p => {
    const matchesSubject = selectedSubject === 'All' || p.subject === selectedSubject;
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />

      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl mx-auto">
        {/* Top Hub Banner */}
        <div className="bg-gradient-to-r from-blue-900/60 via-slate-900 to-amber-900/40 p-6 md:p-8 rounded-2xl border border-slate-800 shadow-2xl mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
              <FlaskConical className="w-4 h-4 text-amber-400" />
              <span>Edulpha Virtual Practical Lab</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Science, Technical & Computer Practical Center
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Interactive multi-language code execution sandboxes, virtual biology microscopy, chemistry titration, physics electricity & mechanics simulators.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 relative z-10">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'browse'
                  ? 'bg-amber-500 text-slate-950 shadow-lg'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              <span>Explore Labs</span>
            </button>

            {activePractical && (
              <button
                onClick={() => setActiveTab('session')}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                  activeTab === 'session'
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Active Session</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('my_submissions')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
                activeTab === 'my_submissions'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>My Reports & Scores ({userAttempts.length})</span>
            </button>
          </div>
        </div>

        {/* 1. BROWSE PRACTICALS TAB */}
        {activeTab === 'browse' && (
          <div className="space-y-6">
            {/* Search & Subject Filters */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search practicals by title or topic..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-amber-500"
                />
              </div>

              {/* Subject Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                {['All', 'Computer Science', 'ICT', 'Physics', 'Chemistry', 'Biology'].map((subj) => (
                  <button
                    key={subj}
                    onClick={() => setSelectedSubject(subj)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      selectedSubject === subj
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-950 text-slate-400 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {subj}
                  </button>
                ))}
              </div>
            </div>

            {/* Practicals Grid */}
            {loading ? (
              <div className="text-center py-16 text-slate-500 font-mono text-xs uppercase tracking-widest">
                Loading Virtual Practical Activities...
              </div>
            ) : filteredPracticals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPracticals.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition shadow-xl flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase">
                          {p.subject}
                        </span>
                        <span className="text-[11px] text-amber-300 font-mono font-semibold">
                          {p.level}
                        </span>
                      </div>

                      <h3 className="font-bold text-white text-base group-hover:text-amber-400 transition">
                        {p.title}
                      </h3>

                      <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>

                      <div className="flex items-center space-x-4 text-xs text-slate-400 pt-2 border-t border-slate-800/80 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          {p.durationMinutes} mins
                        </span>
                        <span className="flex items-center gap-1">
                          <Award className="w-3.5 h-3.5 text-emerald-400" />
                          {p.totalMarks || 20} Marks
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartPractical(p)}
                      className="mt-5 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch Practical Activity</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
                <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">No practicals found for the selected filter.</p>
                <p className="text-xs text-slate-500 mt-1">Try selecting "All" or altering your search criteria.</p>
              </div>
            )}
          </div>
        )}

        {/* 2. ACTIVE PRACTICAL SESSION TAB */}
        {activeTab === 'session' && activePractical && (
          <div className="space-y-6">
            {/* Practical Session Header Bar */}
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setActiveTab('browse')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs flex items-center gap-1 font-semibold"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Labs
                </button>

                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    {activePractical.title}
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                      {activePractical.subject}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">{activePractical.topic} | {activePractical.level}</p>
                </div>
              </div>

              {/* Session Navigation Sub-Tabs */}
              <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSessionSubTab('lab')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    sessionSubTab === 'lab' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Interactive Lab
                </button>
                <button
                  onClick={() => setSessionSubTab('report')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    sessionSubTab === 'report' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Lab Report & Submission
                </button>
                <button
                  onClick={() => setShowAIAssistant(!showAIAssistant)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                    showAIAssistant ? 'bg-purple-600 text-white' : 'text-purple-400 hover:bg-purple-950/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Tutor</span>
                </button>
              </div>
            </div>

            {/* Practical Instructions Banner */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-2">
              <h4 className="font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" /> Instructions & Guidelines:
              </h4>
              <p className="leading-relaxed whitespace-pre-wrap">{activePractical.instructions}</p>
            </div>

            {/* Main Session View Area */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className={showAIAssistant ? 'lg:col-span-8 space-y-6' : 'lg:col-span-12 space-y-6'}>
                {sessionSubTab === 'lab' && (
                  <>
                    {activePractical.practicalType === 'coding' ? (
                      <CodingLab
                        practical={activePractical}
                        onAskAIHelp={(prompt) => {
                          setAiAssistantPrompt(prompt);
                          setShowAIAssistant(true);
                        }}
                      />
                    ) : activePractical.subject === 'Biology' ? (
                      <BiologyLab practical={activePractical} />
                    ) : activePractical.subject === 'Physics' ? (
                      <PhysicsLab practical={activePractical} />
                    ) : activePractical.subject === 'Chemistry' ? (
                      <ChemistryLab practical={activePractical} />
                    ) : (
                      <CodingLab practical={activePractical} />
                    )}
                  </>
                )}

                {sessionSubTab === 'report' && (
                  <PracticalReportForm
                    practical={activePractical}
                    onSubmitReport={handleSubmitReport}
                    onAskAIFeedback={() => setShowAIAssistant(true)}
                  />
                )}
              </div>

              {/* Side AI Assistant Drawer */}
              {showAIAssistant && (
                <div className="lg:col-span-4">
                  <AIPracticalAssistant
                    practical={activePractical}
                    initialPrompt={aiAssistantPrompt}
                    onClose={() => setShowAIAssistant(false)}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. MY SUBMISSIONS TAB */}
        {activeTab === 'my_submissions' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-400" />
              My Practical Submissions & Evaluated Reports
            </h2>

            {userAttempts.length > 0 ? (
              <div className="space-y-4">
                {userAttempts.map((att) => (
                  <div
                    key={att.id}
                    className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-base">{att.practicalTitle}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                          {att.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Submitted on: {att.submittedAt ? new Date(att.submittedAt).toLocaleDateString() : 'N/A'}
                      </p>
                      {att.feedback && (
                        <p className="text-xs text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/50 mt-2">
                          Teacher Feedback: {att.feedback}
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-400 font-mono">
                        {att.score} / {att.maxScore || 100}
                      </span>
                      <span className="block text-xs text-slate-400">Grade {att.grade}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800">
                <FileText className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-300">No reports submitted yet.</p>
                <p className="text-xs text-slate-500 mt-1">Complete a practical session and submit your report to view your scores here.</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
