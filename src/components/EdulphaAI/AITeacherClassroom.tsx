import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  HelpCircle, 
  Lightbulb, 
  ChevronRight, 
  RotateCcw, 
  AlertTriangle, 
  Flag, 
  Send, 
  Volume2, 
  ArrowRight, 
  Flame, 
  Award, 
  Calendar, 
  FlaskConical, 
  Check, 
  FileText, 
  Clock, 
  RefreshCw, 
  MessageSquare, 
  Languages, 
  ShieldCheck, 
  UserCheck, 
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Bot
} from 'lucide-react';
import { 
  ProgressionSheet, 
  AITeacherAssignment, 
  StudentLearningProgress, 
  AILessonSession,
  ProgressionWeek
} from '../../types';
import { 
  generateAILesson, 
  sendSocraticMessage, 
  recordQuizProgress, 
  submitContentFlag,
  fetchProgressionSheets
} from '../../services/aiTeacherService';
import { Button, Card, Badge, cn } from '../ui';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface AITeacherClassroomProps {
  studentId: string;
  studentName: string;
  defaultSubject?: string;
  defaultClassLevel?: string;
}

export const AITeacherClassroom: React.FC<AITeacherClassroomProps> = ({
  studentId,
  studentName,
  defaultSubject = 'Computer Science',
  defaultClassLevel = 'Advanced Level'
}) => {
  const navigate = useNavigate();

  // Subject and Class Selection
  const [selectedSubject, setSelectedSubject] = useState<string>(defaultSubject);
  const [selectedClassLevel, setSelectedClassLevel] = useState<string>(defaultClassLevel);
  const [currentWeekNum, setCurrentWeekNum] = useState<number>(1);
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'fr'>('en');

  // Active Lesson Data
  const [session, setSession] = useState<AILessonSession | null>(null);
  const [progressionSheet, setProgressionSheet] = useState<ProgressionSheet | null>(null);
  const [assignment, setAssignment] = useState<AITeacherAssignment | null>(null);
  const [studentProgress, setStudentProgress] = useState<StudentLearningProgress | null>(null);
  const [isCurriculumFallback, setIsCurriculumFallback] = useState<boolean>(false);

  // UI States
  const [isLoadingLesson, setIsLoadingLesson] = useState<boolean>(false);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<'overview' | 'concept' | 'example' | 'practice' | 'quiz' | 'chat'>('overview');
  
  // Socratic Chat & Interaction
  const [userChatInput, setUserChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'teacher' | 'student' | 'system'; text: string; timestamp: string }>>([]);
  
  // Hint ladder state for guided practice
  const [revealedHintLevel, setRevealedHintLevel] = useState<number>(0);

  // Diagnostic Quiz State
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState<boolean>(false);

  // Content Flag Modal
  const [isFlagModalOpen, setIsFlagModalOpen] = useState<boolean>(false);
  const [flagReason, setFlagReason] = useState<'INCORRECT_INFORMATION' | 'CURRICULUM_MISMATCH' | 'INAPPROPRIATE_DIFFICULTY' | 'SAFETY_CONCERN' | 'OTHER'>('INCORRECT_INFORMATION');
  const [flagFeedback, setFlagFeedback] = useState<string>('');
  const [isSubmittingFlag, setIsSubmittingFlag] = useState<boolean>(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Load lesson on change of subject, classLevel, or week
  useEffect(() => {
    loadLesson(currentWeekNum);
  }, [selectedSubject, selectedClassLevel, currentWeekNum, preferredLanguage]);

  const loadLesson = async (week: number) => {
    setIsLoadingLesson(true);
    setRevealedHintLevel(0);
    setSelectedQuizAnswers({});
    setQuizSubmitted({});
    try {
      const data = await generateAILesson({
        studentId,
        studentName,
        subject: selectedSubject,
        classLevel: selectedClassLevel,
        weekNumber: week,
        preferredLanguage
      });

      setSession(data.session);
      setProgressionSheet(data.progressionSheet);
      setAssignment(data.assignment);
      setStudentProgress(data.studentProgress);
      setIsCurriculumFallback(data.isCurriculumFallback);

      // Initialize chat messages with welcome and dialogue
      const initialMessages = data.session.chatDialogue.length > 0 
        ? data.session.chatDialogue 
        : [{
            role: 'teacher' as const,
            text: `Welcome to Week ${data.session.weekNumber}: **${data.session.topicTitle}**! I am your AI Teacher. Let's start with a quick look at prerequisites, or ask me anything to begin.`,
            timestamp: new Date().toISOString()
          }];
      setChatMessages(initialMessages);
    } catch (err: any) {
      console.error('Failed to load AI Lesson:', err);
      toast.error(err.message || 'Could not load AI Teacher lesson. Please retry.');
    } finally {
      setIsLoadingLesson(false);
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const textToSend = customMessage || userChatInput;
    if (!textToSend.trim() || !session || isSendingMessage) return;

    const newMsg = {
      role: 'student' as const,
      text: textToSend.trim(),
      timestamp: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMsg]);
    if (!customMessage) setUserChatInput('');
    setIsSendingMessage(true);

    try {
      const response = await sendSocraticMessage({
        sessionId: session.id,
        studentId,
        userMessage: textToSend.trim(),
        preferredLanguage
      });

      setChatMessages(response.messages);
    } catch (err: any) {
      console.error('Error sending message:', err);
      toast.error('AI Teacher could not respond. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleQuickPrompt = (promptType: 'TEACH_ME' | 'DONT_UNDERSTAND' | 'HINT' | 'SIMPLIFY' | 'EXAMPLE' | 'REVIEW' | 'NEXT_STEP') => {
    if (!session) return;
    setActiveStep('chat');

    let text = '';
    switch (promptType) {
      case 'TEACH_ME':
        text = `Please teach me Week ${session.weekNumber} topic: ${session.topicTitle}. Start from the ground up!`;
        break;
      case 'DONT_UNDERSTAND':
        text = `I don't understand this explanation of "${session.topicTitle}". Could you use a simpler everyday real-world analogy and break it down into smaller micro-steps?`;
        break;
      case 'HINT':
        text = `I am attempting the practice question on ${session.topicTitle}. Could you give me a small pedagogical clue or hint without revealing the final answer?`;
        break;
      case 'SIMPLIFY':
        text = `Can you explain this again in very plain and straightforward language for a beginner?`;
        break;
      case 'EXAMPLE':
        text = `Can you show me another concrete solved example with clear step-by-step working for GCE Paper 2 examination?`;
        break;
      case 'REVIEW':
        text = `Can you give me a 2-minute quick review of what we covered in the previous week before we continue?`;
        break;
      case 'NEXT_STEP':
        text = `What should I do next to master this topic?`;
        break;
    }

    handleSendMessage(text);
  };

  const handleRevealNextHint = () => {
    if (revealedHintLevel < 4) {
      setRevealedHintLevel(prev => prev + 1);
    }
  };

  const handleQuizOptionSelect = async (questionId: string, selectedOpt: string) => {
    if (quizSubmitted[questionId] || !session) return;

    setSelectedQuizAnswers(prev => ({ ...prev, [questionId]: selectedOpt }));
    setQuizSubmitted(prev => ({ ...prev, [questionId]: true }));

    const question = session.diagnosticQuiz.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = selectedOpt === question.correctOption;
    if (isCorrect) {
      toast.success('Correct! Well done!');
    } else {
      toast.error(`Not quite. The correct answer is Option ${question.correctOption}. See explanation below.`);
    }

    // Record progress to backend
    try {
      const res = await recordQuizProgress({
        studentId,
        subject: selectedSubject,
        classLevel: selectedClassLevel,
        weekNumber: session.weekNumber,
        questionId,
        selectedOption: selectedOpt,
        isCorrect,
        scoreDelta: isCorrect ? 20 : 5
      });
      setStudentProgress(res.progress);
    } catch (err) {
      console.warn('Failed to record quiz progress:', err);
    }
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagFeedback.trim()) {
      toast.error('Please provide details about what needs review.');
      return;
    }
    setIsSubmittingFlag(true);
    try {
      await submitContentFlag({
        sessionId: session?.id,
        progressionSheetId: progressionSheet?.id,
        subject: selectedSubject,
        classLevel: selectedClassLevel,
        weekNumber: session?.weekNumber,
        topicTitle: session?.topicTitle,
        flagReason,
        userFeedback: flagFeedback.trim(),
        reportedBy: studentId,
        reporterRole: 'student'
      });
      toast.success('Thank you! Content flag sent to teachers and curriculum reviewers.');
      setIsFlagModalOpen(false);
      setFlagFeedback('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit flag');
    } finally {
      setIsSubmittingFlag(false);
    }
  };

  const activeWeekData: ProgressionWeek | undefined = progressionSheet?.weeks?.find(w => w.weekNumber === currentWeekNum);
  const totalWeeks = progressionSheet?.weeks?.length || 12;
  const isBehind = studentProgress && assignment && studentProgress.currentWeek < assignment.currentWeek;

  return (
    <div className="space-y-6 max-w-6xl mx-auto min-w-0 w-full" id="edulpha-ai-teacher-classroom">
      
      {/* 1. TOP HEADER & METADATA BAR */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-2xl shadow-md shrink-0">
              <GraduationCap size={28} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Edulpha AI Teacher</h2>
                <Badge variant="indigo" className="text-[10px] font-bold">
                  {preferredLanguage === 'fr' ? 'MINESEC / Enseignement Secondaire' : 'Cameroon GCE / MINESEC'}
                </Badge>
                {assignment?.mode === 'AI_ONLY' && (
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-700 border border-amber-500/20 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <Sparkles size={11} /> AI-Only Teacher (Active Fallback)
                  </span>
                )}
                {assignment?.mode === 'AI_HUMAN_COMBINED' && (
                  <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 text-[10px] font-bold rounded-full flex items-center gap-1">
                    <UserCheck size={11} /> AI + Human Combined
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Progression-sheet-driven Socratic digital teacher for students, beginners, and unsupported subjects.
              </p>
            </div>
          </div>

          {/* Subject & Language Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              aria-label="Select Subject"
              value={selectedSubject}
              onChange={e => {
                setSelectedSubject(e.target.value);
                setCurrentWeekNum(1);
              }}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Computer Science">Computer Science</option>
              <option value="ICT">ICT</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Physics">Physics</option>
              <option value="Chemistry">Chemistry</option>
            </select>

            <select
              aria-label="Select Education Level"
              value={selectedClassLevel}
              onChange={e => {
                setSelectedClassLevel(e.target.value);
                setCurrentWeekNum(1);
              }}
              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="Ordinary Level">Ordinary Level (Form 4 - 5)</option>
              <option value="Advanced Level">Advanced Level (Lower - Upper 6th)</option>
              <option value="Secondary First Cycle">First Cycle (Form 1 - 3)</option>
            </select>

            {/* Language switch */}
            <button
              onClick={() => setPreferredLanguage(p => p === 'en' ? 'fr' : 'en')}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 transition-colors"
              title="Toggle English / French curriculum terminology"
            >
              <Languages size={14} className="text-indigo-600" />
              <span>{preferredLanguage === 'en' ? 'EN' : 'FR'}</span>
            </button>

            {/* Report Content Flag */}
            <button
              onClick={() => setIsFlagModalOpen(true)}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="Report content or pedagogical issue"
            >
              <Flag size={16} />
            </button>
          </div>
        </div>

        {/* HUMAN TEACHER OVERRIDE / CURRICULUM STATUS NOTICE */}
        {isCurriculumFallback ? (
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200/80 flex items-center justify-between text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <Info size={16} className="text-amber-600 shrink-0" />
              <span>
                <strong>Curriculum Fallback Active:</strong> AI Teacher is currently using approved Cameroon GCE curriculum topics. An official progression plan has not yet been assigned by your school administrator.
              </span>
            </div>
            <Badge variant="warning" className="text-[10px]">Curriculum Mode</Badge>
          </div>
        ) : (
          <div className="p-3 bg-indigo-50/70 rounded-2xl border border-indigo-100 flex flex-wrap items-center justify-between gap-2 text-xs text-indigo-950">
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-600 shrink-0" />
              <span>
                <strong>Approved Progression:</strong> Following <em>{progressionSheet?.title || 'Approved Progression Sheet'}</em> (Academic Year {progressionSheet?.academicYear || '2025/2026'}).
              </span>
            </div>
            {assignment?.assignedHumanTeacherId && (
              <span className="text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                <UserCheck size={13} /> Supervised by School Human Teacher
              </span>
            )}
          </div>
        )}

        {/* BEHIND SCHEDULE ALERT & CATCH-UP ADVICE */}
        {isBehind && (
          <div className="p-3.5 bg-orange-50 rounded-2xl border border-orange-200 flex items-start justify-between gap-3 text-xs text-orange-950">
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={18} className="text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-orange-900">
                  Catch-up Recommended: You are currently on Week {studentProgress?.currentWeek || 1}, while class target is Week {assignment?.currentWeek || 1}.
                </p>
                <p className="text-orange-800 mt-0.5">
                  Do not worry! Follow today's micro-steps and use the <strong>"Teach Me This Topic"</strong> button to master the core concepts in 15 minutes.
                </p>
              </div>
            </div>
            <Button
              onClick={() => handleQuickPrompt('DONT_UNDERSTAND')}
              size="sm"
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shrink-0"
            >
              Get Fast Track
            </Button>
          </div>
        )}
      </div>

      {/* 2. PROGRESSION SHEET TIMELINE BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
          <span className="flex items-center gap-1.5">
            <Calendar size={15} className="text-indigo-600" />
            12-Week Academic Progression Roadmap
          </span>
          <span className="text-slate-500 font-medium">
            Viewing Week <span className="text-indigo-600 font-bold">{currentWeekNum}</span> of {totalWeeks}
          </span>
        </div>

        {/* Scrollable Horizontal Week Picker */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
          {Array.from({ length: totalWeeks }, (_, idx) => {
            const wNum = idx + 1;
            const isCurrent = wNum === currentWeekNum;
            const isCompleted = studentProgress?.completedWeeks?.includes(wNum);
            const isClassTarget = assignment?.currentWeek === wNum;

            return (
              <button
                key={wNum}
                onClick={() => setCurrentWeekNum(wNum)}
                className={cn(
                  "flex-shrink-0 px-3 py-2 rounded-2xl border text-xs font-bold transition-all flex flex-col items-center min-w-[72px] relative",
                  isCurrent 
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105" 
                    : isCompleted
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                )}
              >
                {isClassTarget && !isCurrent && (
                  <span className="absolute -top-1.5 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white" title="Class Current Target Week" />
                )}
                <span className="text-[10px] uppercase tracking-wider opacity-80">Wk {wNum}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  {isCompleted ? (
                    <CheckCircle2 size={13} className={isCurrent ? "text-white" : "text-emerald-600"} />
                  ) : (
                    <span className="text-[11px]">{wNum}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. ACTIVE TOPIC HERO CARD */}
      <Card className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <span>Week {session?.weekNumber || currentWeekNum}</span>
              <span>•</span>
              <span>{selectedSubject}</span>
              <span>•</span>
              <span>{selectedClassLevel}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {isLoadingLesson ? 'Preparing Lesson...' : session?.topicTitle || activeWeekData?.topicTitle || 'Curriculum Topic'}
            </h3>
            {activeWeekData?.subtopics && activeWeekData.subtopics.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {activeWeekData.subtopics.map((sub, i) => (
                  <span key={i} className="px-2 py-0.5 bg-white/10 text-white/90 text-[11px] font-medium rounded-lg">
                    {sub}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Quick Mastery Status Badge */}
          <div className="bg-white/10 border border-white/20 p-3 rounded-2xl flex items-center gap-3 shrink-0">
            <div className="p-2 bg-amber-500/20 text-amber-300 rounded-xl">
              <Award size={22} />
            </div>
            <div>
              <span className="text-[10px] text-indigo-200 block font-bold uppercase tracking-wider">Topic Mastery</span>
              <span className="text-lg font-black text-white">
                {studentProgress?.masteryScore || 0}%
              </span>
            </div>
          </div>
        </div>

        {/* Socratic Quick Action Prompts Bar */}
        <div className="pt-1">
          <span className="text-[11px] font-bold text-indigo-200 block mb-2">Socratic Learning Shortcuts:</span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleQuickPrompt('TEACH_ME')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Sparkles size={13} /> Teach Me This Topic
            </button>
            <button
              onClick={() => handleQuickPrompt('DONT_UNDERSTAND')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <RotateCcw size={13} /> I Don't Understand
            </button>
            <button
              onClick={() => handleQuickPrompt('HINT')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <Lightbulb size={13} /> Give Me a Hint
            </button>
            <button
              onClick={() => handleQuickPrompt('SIMPLIFY')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <HelpCircle size={13} /> Explain Again Simply
            </button>
            <button
              onClick={() => handleQuickPrompt('EXAMPLE')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <BookOpen size={13} /> Show Another Example
            </button>
            <button
              onClick={() => handleQuickPrompt('NEXT_STEP')}
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 flex items-center gap-1.5 transition-all"
            >
              <ArrowRight size={13} /> What Should I Do Next?
            </button>
          </div>
        </div>
      </Card>

      {/* 4. LESSON PEDAGOGICAL ROADMAP NAVIGATION */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveStep('overview')}
          className={cn(
            "px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0",
            activeStep === 'overview' ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <FileText size={15} />
          1. Prerequisites & Objectives
        </button>

        <button
          onClick={() => setActiveStep('concept')}
          className={cn(
            "px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0",
            activeStep === 'concept' ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <Lightbulb size={15} />
          2. Real-World Analogy
        </button>

        <button
          onClick={() => setActiveStep('example')}
          className={cn(
            "px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0",
            activeStep === 'example' ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <BookOpen size={15} />
          3. Solved Model Example
        </button>

        <button
          onClick={() => setActiveStep('practice')}
          className={cn(
            "px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0",
            activeStep === 'practice' ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <FlaskConical size={15} />
          4. Guided Practice & Hints
        </button>

        <button
          onClick={() => setActiveStep('quiz')}
          className={cn(
            "px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0",
            activeStep === 'quiz' ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <Award size={15} />
          5. Diagnostic Quiz ({session?.diagnosticQuiz?.length || 0})
        </button>

        <button
          onClick={() => setActiveStep('chat')}
          className={cn(
            "px-4 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0",
            activeStep === 'chat' ? "bg-indigo-600 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          )}
        >
          <MessageSquare size={15} />
          Socratic AI Classroom Chat
        </button>
      </div>

      {/* 5. MAIN CONTENT AREA */}
      {isLoadingLesson ? (
        <Card className="p-12 text-center space-y-4 border-slate-200">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin mx-auto" />
          <div>
            <h4 className="font-bold text-slate-900 text-base">Edulpha AI Teacher is preparing Week {currentWeekNum}...</h4>
            <p className="text-xs text-slate-500 mt-1">Grounding explanations in the approved progression sheet and GCE standards.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-6">

          {/* STEP 1: PREREQUISITES & OBJECTIVES */}
          {activeStep === 'overview' && session && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6 space-y-4 border-slate-200">
                <div className="flex items-center gap-2.5 text-indigo-600 font-bold text-sm border-b border-slate-100 pb-3">
                  <CheckCircle2 size={18} />
                  <span>Target Learning Objectives</span>
                </div>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  {session.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6 space-y-4 border-slate-200">
                <div className="flex items-center gap-2.5 text-amber-600 font-bold text-sm border-b border-slate-100 pb-3">
                  <RotateCcw size={18} />
                  <span>Prerequisite Knowledge Check</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Before learning <strong>{session.topicTitle}</strong>, make sure you are comfortable with:
                </p>
                <div className="space-y-2">
                  {session.prerequisites.map((req, i) => (
                    <div key={i} className="p-3 bg-amber-50/70 rounded-xl border border-amber-100 text-xs text-amber-900 font-medium flex items-center justify-between">
                      <span>• {req}</span>
                      <button
                        onClick={() => handleSendMessage(`Can you test my understanding of "${req}" before we start?`)}
                        className="text-[10px] font-bold text-amber-700 hover:underline"
                      >
                        Check my knowledge →
                      </button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Practical / Virtual Lab link */}
              {activeWeekData?.practicalWork && (
                <Card className="p-5 md:col-span-2 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">Prescribed Practical Work</span>
                    <h4 className="text-sm font-bold text-white">{activeWeekData.practicalWork}</h4>
                    <p className="text-xs text-slate-300">Hands-on practical training required for GCE Paper 3 / Continuous Assessment.</p>
                  </div>
                  <Button
                    onClick={() => navigate('/virtual-labs')}
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-4 py-2 rounded-xl shrink-0"
                  >
                    Open Virtual Lab
                  </Button>
                </Card>
              )}

              <div className="md:col-span-2 flex justify-end">
                <Button
                  onClick={() => setActiveStep('concept')}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl gap-2 text-xs"
                >
                  <span>Continue to Real-World Analogy</span>
                  <ChevronRight size={15} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: REAL-WORLD ANALOGY & INTUITIVE CONCEPT */}
          {activeStep === 'concept' && session && (
            <Card className="p-6 md:p-8 space-y-6 border-slate-200">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <Badge variant="indigo">Step 2 of 5</Badge>
                <h3 className="text-lg font-black text-slate-900">Real-World Analogy & Everyday Context</h3>
                <p className="text-xs text-slate-500">
                  How <strong>{session.topicTitle}</strong> works in real life before looking at technical definitions.
                </p>
              </div>

              {/* Analogy Box */}
              <div className="p-5 bg-gradient-to-br from-indigo-50/80 to-slate-50 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                  <Lightbulb size={16} className="text-indigo-600" />
                  <span>The Mental Anchor (Everyday Analogy)</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                  {session.realWorldAnalogy}
                </p>
              </div>

              {/* Technical Concept Breakdown */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-900">Socratic Breakdown</h4>
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap font-mono">
                  {typeof session.conceptBreakdown === 'string' ? session.conceptBreakdown : (session.conceptBreakdown?.overview || '')}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  onClick={() => handleQuickPrompt('DONT_UNDERSTAND')}
                  variant="outline"
                  className="text-xs rounded-xl gap-1.5"
                >
                  <RotateCcw size={14} /> Explain with another analogy
                </Button>

                <Button
                  onClick={() => setActiveStep('example')}
                  className="bg-indigo-600 text-white font-bold rounded-xl gap-1.5 text-xs"
                >
                  <span>Next: Solved Model Example</span>
                  <ChevronRight size={15} />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3: SOLVED MODEL EXAMPLE */}
          {activeStep === 'example' && session && (
            <Card className="p-6 md:p-8 space-y-6 border-slate-200">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <Badge variant="indigo">Step 3 of 5</Badge>
                <h3 className="text-lg font-black text-slate-900">Step-by-Step Solved Problem</h3>
                <p className="text-xs text-slate-500">
                  Standard Cameroon GCE examination model question with complete working out.
                </p>
              </div>

              {/* Problem Prompt */}
              <div className="p-4 bg-slate-100 rounded-2xl text-xs font-bold text-slate-900 border border-slate-200">
                <span className="text-indigo-600 block text-[10px] uppercase font-black mb-1">Examination Prompt</span>
                {session.stepByStepExample.problemPrompt}
              </div>

              {/* Step By Step Solutions */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Methodical Walkthrough</h4>
                <div className="space-y-2.5">
                  {session.stepByStepExample.steps.map((st, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px]">
                          {i + 1}
                        </span>
                        <span className="font-bold text-slate-900">Step {i + 1}</span>
                      </div>
                      <p className="text-slate-700 pl-7 leading-relaxed">{st}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Answer & Examination Tip */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1 text-emerald-950">
                  <span className="font-black uppercase tracking-wider text-[10px] text-emerald-700 block">Final Answer</span>
                  <p className="font-mono font-bold text-emerald-900">{session.stepByStepExample.finalAnswer}</p>
                </div>

                {session.stepByStepExample.examTip && (
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-200 text-xs space-y-1 text-indigo-950">
                    <span className="font-black uppercase tracking-wider text-[10px] text-indigo-700 block">GCE Examiner's Note</span>
                    <p className="text-indigo-900">{session.stepByStepExample.examTip}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  onClick={() => handleQuickPrompt('EXAMPLE')}
                  variant="outline"
                  className="text-xs rounded-xl gap-1.5"
                >
                  <RefreshCw size={14} /> Show another variation
                </Button>

                <Button
                  onClick={() => setActiveStep('practice')}
                  className="bg-indigo-600 text-white font-bold rounded-xl gap-1.5 text-xs"
                >
                  <span>Next: Guided Practice</span>
                  <ChevronRight size={15} />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4: GUIDED PRACTICE WITH 4-TIER HINT LADDER */}
          {activeStep === 'practice' && session && (
            <Card className="p-6 md:p-8 space-y-6 border-slate-200">
              <div className="space-y-2 border-b border-slate-100 pb-4">
                <Badge variant="indigo">Step 4 of 5</Badge>
                <h3 className="text-lg font-black text-slate-900">Guided Socratic Practice Exercise</h3>
                <p className="text-xs text-slate-500">
                  Try solving this yourself first! Use the 4-Level Hint Ladder if you get stuck.
                </p>
              </div>

              {/* Practice Problem */}
              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Practice Task</span>
                <p className="text-sm font-bold text-slate-900">
                  {session.guidedPractice.problemText}
                </p>
              </div>

              {/* 4-TIER HINT LADDER */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Lightbulb size={15} className="text-amber-500" />
                    Progressive Hint Ladder (Level {revealedHintLevel} of 4)
                  </h4>
                  {revealedHintLevel < 4 && (
                    <Button
                      onClick={handleRevealNextHint}
                      size="sm"
                      className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl gap-1"
                    >
                      <Lightbulb size={13} />
                      {revealedHintLevel === 0 ? 'Need a Hint?' : `Reveal Hint ${revealedHintLevel + 1}`}
                    </Button>
                  )}
                </div>

                <div className="space-y-2.5">
                  {/* Hint 1: Clue */}
                  {revealedHintLevel >= 1 && (
                    <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1 animate-fadeIn">
                      <span className="text-[10px] font-bold uppercase text-amber-800">Level 1: Conceptual Clue</span>
                      <p>{session.guidedPractice.hints.level1Clue}</p>
                    </div>
                  )}

                  {/* Hint 2: Direction */}
                  {revealedHintLevel >= 2 && (
                    <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1 animate-fadeIn">
                      <span className="text-[10px] font-bold uppercase text-amber-800">Level 2: Method / Formula Direction</span>
                      <p>{session.guidedPractice.hints.level2Direction}</p>
                    </div>
                  )}

                  {/* Hint 3: Partial Step */}
                  {revealedHintLevel >= 3 && (
                    <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-950 space-y-1 animate-fadeIn">
                      <span className="text-[10px] font-bold uppercase text-amber-800">Level 3: Partial Calculation</span>
                      <p>{session.guidedPractice.hints.level3PartialStep}</p>
                    </div>
                  )}

                  {/* Hint 4: Full Solution */}
                  {revealedHintLevel >= 4 && (
                    <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1 animate-fadeIn">
                      <span className="text-[10px] font-bold uppercase text-emerald-800">Level 4: Complete Socratic Walkthrough</span>
                      <p>{session.guidedPractice.hints.level4FullWalkthrough}</p>
                    </div>
                  )}

                  {revealedHintLevel === 0 && (
                    <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-500">
                      No hints revealed yet. Give it your best shot first, or click "Need a Hint?" above.
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <Button
                  onClick={() => handleSendMessage(`I am working on the practice task: "${session.guidedPractice.problemText}". Here is my attempt: `)}
                  variant="outline"
                  className="text-xs rounded-xl gap-1.5"
                >
                  <MessageSquare size={14} /> Submit Attempt in Chat
                </Button>

                <Button
                  onClick={() => setActiveStep('quiz')}
                  className="bg-indigo-600 text-white font-bold rounded-xl gap-1.5 text-xs"
                >
                  <span>Next: Take Diagnostic Quiz</span>
                  <ChevronRight size={15} />
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 5: DIAGNOSTIC QUIZ */}
          {activeStep === 'quiz' && session && (
            <div className="space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <Badge variant="indigo">Step 5 of 5</Badge>
                  <h3 className="text-base font-black text-slate-900 mt-1">Diagnostic Mastery Quiz</h3>
                  <p className="text-xs text-slate-500">
                    Test your understanding of Week {session.weekNumber} to update your curriculum mastery score.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-500 block">Topic Mastery</span>
                  <span className="text-xl font-black text-indigo-600">{studentProgress?.masteryScore || 0}%</span>
                </div>
              </div>

              <div className="space-y-4">
                {session.diagnosticQuiz.map((q, qIndex) => {
                  const isSubmitted = quizSubmitted[q.id];
                  const selectedOpt = selectedQuizAnswers[q.id];
                  const isCorrect = selectedOpt === q.correctOption;

                  return (
                    <Card key={q.id} className="p-6 space-y-4 border-slate-200">
                      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                            Question {qIndex + 1} of {session.diagnosticQuiz.length}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900">{q.questionText}</h4>
                        </div>
                        {isSubmitted && (
                          <Badge variant={isCorrect ? 'success' : 'danger'}>
                            {isCorrect ? 'Correct (+20)' : 'Incorrect'}
                          </Badge>
                        )}
                      </div>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt, i) => {
                          const optKey = ['A', 'B', 'C', 'D'][i];
                          const isSelected = selectedOpt === optKey;
                          const isCorrectOption = q.correctOption === optKey;

                          return (
                            <button
                              key={i}
                              disabled={isSubmitted}
                              onClick={() => handleQuizOptionSelect(q.id, optKey)}
                              className={cn(
                                "p-3.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center justify-between",
                                isSubmitted && isCorrectOption
                                  ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold"
                                  : isSubmitted && isSelected && !isCorrect
                                    ? "bg-red-50 border-red-500 text-red-950 font-bold"
                                    : isSelected
                                      ? "bg-indigo-50 border-indigo-500 text-indigo-950"
                                      : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                              )}
                            >
                              <span>
                                <strong className="mr-2 font-mono text-slate-400">[{optKey}]</strong> {opt}
                              </span>
                              {isSubmitted && isCorrectOption && <Check size={16} className="text-emerald-600 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      {isSubmitted && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
                          <span className="font-bold text-slate-900 block">Socratic Explanation:</span>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>

              {/* End of Quiz Roadmap Actions */}
              <Card className="p-6 bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">Finished Week {session.weekNumber} Practice?</h4>
                  <p className="text-xs text-indigo-200">
                    Advance to Week {session.weekNumber + 1} or continue asking questions to cement your understanding.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => setActiveStep('chat')}
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 text-xs rounded-xl"
                  >
                    Ask AI Teacher
                  </Button>
                  <Button
                    onClick={() => setCurrentWeekNum(prev => Math.min(totalWeeks, prev + 1))}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl"
                  >
                    Go to Week {session.weekNumber + 1} →
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* STEP 6: SOCRATIC CHAT WINDOW */}
          {activeStep === 'chat' && session && (
            <Card className="p-0 overflow-hidden rounded-3xl border-slate-200 shadow-sm flex flex-col h-[640px]">
              {/* Chat Header */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-600 rounded-xl text-white">
                    <Bot size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Edulpha AI Teacher (Socratic Mode)</h4>
                    <span className="text-[11px] text-indigo-300">
                      Adhering to Week {session.weekNumber}: {session.topicTitle}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="indigo" className="text-[10px]">
                    {session.teachingStyle} Style
                  </Badge>
                </div>
              </div>

              {/* Message Transcript */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/50">
                {chatMessages.map((msg, i) => {
                  const isTeacher = msg.role === 'teacher';
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex gap-3 max-w-[85%]",
                        isTeacher ? "mr-auto" : "ml-auto flex-row-reverse"
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold",
                          isTeacher ? "bg-indigo-600 text-white" : "bg-slate-800 text-white"
                        )}
                      >
                        {isTeacher ? <Bot size={16} /> : studentName.charAt(0) || 'S'}
                      </div>
                      <div
                        className={cn(
                          "p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                          isTeacher 
                            ? "bg-white border border-slate-200 text-slate-800" 
                            : "bg-indigo-600 text-white font-medium"
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                {isSendingMessage && (
                  <div className="flex gap-3 mr-auto max-w-[85%]">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                      <Bot size={16} />
                    </div>
                    <div className="p-4 bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                      <span>AI Teacher is formulating Socratic response...</span>
                    </div>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input & Fast Prompts */}
              <div className="p-4 bg-white border-t border-slate-200 space-y-3">
                {/* Fast Action Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px] font-bold text-slate-600 scrollbar-none">
                  <button
                    onClick={() => handleQuickPrompt('DONT_UNDERSTAND')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0"
                  >
                    I don't get it
                  </button>
                  <button
                    onClick={() => handleQuickPrompt('HINT')}
                    className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg shrink-0"
                  >
                    Give me a hint
                  </button>
                  <button
                    onClick={() => handleQuickPrompt('SIMPLIFY')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0"
                  >
                    Explain simply
                  </button>
                  <button
                    onClick={() => handleQuickPrompt('EXAMPLE')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0"
                  >
                    Another example
                  </button>
                  <button
                    onClick={() => handleQuickPrompt('NEXT_STEP')}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg shrink-0"
                  >
                    What next?
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Ask your AI Teacher about this topic..."
                    value={userChatInput}
                    onChange={e => setUserChatInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <Button
                    onClick={() => handleSendMessage()}
                    disabled={!userChatInput.trim() || isSendingMessage}
                    className="bg-indigo-600 text-white rounded-xl px-4 py-2.5 text-xs font-bold gap-1.5"
                  >
                    <Send size={15} />
                    <span className="hidden sm:inline">Send</span>
                  </Button>
                </div>
              </div>
            </Card>
          )}

        </div>
      )}

      {/* 6. CONTENT REPORT / FLAG MODAL */}
      {isFlagModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <Flag size={20} />
                <h3 className="font-bold text-slate-900 text-base">Report AI Teacher Content</h3>
              </div>
              <button
                onClick={() => setIsFlagModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Help us maintain curriculum accuracy and high pedagogical standards. Your report will be reviewed by teachers and curriculum administrators.
            </p>

            <form onSubmit={handleFlagSubmit} className="space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Report</label>
                <select
                  value={flagReason}
                  onChange={e => setFlagReason(e.target.value as any)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="INCORRECT_INFORMATION">Factually Incorrect Information / Working</option>
                  <option value="CURRICULUM_MISMATCH">Does Not Match Cameroon GCE / MINESEC Syllabus</option>
                  <option value="INAPPROPRIATE_DIFFICULTY">Too Difficult or Too Simple for Level</option>
                  <option value="SAFETY_CONCERN">Safety or Moderation Concern</option>
                  <option value="OTHER">Other Pedagogical Issue</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Details & Context</label>
                <textarea
                  rows={4}
                  placeholder="Describe what was incorrect or mismatched..."
                  value={flagFeedback}
                  onChange={e => setFlagFeedback(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50 p-3 focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFlagModalOpen(false)}
                  className="text-xs rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingFlag}
                  className="bg-red-600 text-white font-bold text-xs rounded-xl"
                >
                  {isSubmittingFlag ? 'Submitting...' : 'Submit Report'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
