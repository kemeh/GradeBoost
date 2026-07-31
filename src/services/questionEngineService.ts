import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  QuestionEngineItem, 
  EngineExam, 
  ExamAttempt, 
  ExamAutoRule, 
  QuestionBookmark, 
  QuestionReport,
  AcademicLevel,
  ExamAttemptAnswer,
  MarkingScheme
} from '../types';
import { SEED_QUESTIONS, SEED_EXAMS } from '../data/questionBankSeed';

const QUESTIONS_COLLECTION = 'question_bank';
const EXAMS_COLLECTION = 'engine_exams';
const ATTEMPTS_COLLECTION = 'engine_attempts';
const BOOKMARKS_COLLECTION = 'question_bookmarks';
const REPORTS_COLLECTION = 'question_reports';

const LOCAL_QUESTIONS_KEY = 'gb60_question_bank_local';
const LOCAL_EXAMS_KEY = 'gb60_engine_exams_local';
const LOCAL_ATTEMPTS_KEY = 'gb60_engine_attempts_local';
const LOCAL_BOOKMARKS_KEY = 'gb60_question_bookmarks_local';

// Helper for local storage persistence
function getLocalStorageData<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalStorageData<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

// Init local storage seeds if empty
export function initQuestionEngineSeeds() {
  const existingQ = getLocalStorageData<QuestionEngineItem[]>(LOCAL_QUESTIONS_KEY, []);
  if (existingQ.length === 0) {
    setLocalStorageData(LOCAL_QUESTIONS_KEY, SEED_QUESTIONS);
  }
  const existingE = getLocalStorageData<EngineExam[]>(LOCAL_EXAMS_KEY, []);
  if (existingE.length === 0) {
    setLocalStorageData(LOCAL_EXAMS_KEY, SEED_EXAMS);
  }
}

initQuestionEngineSeeds();

// ==========================================
// QUESTION BANK SERVICES
// ==========================================

export async function fetchQuestions(filters?: {
  level?: string;
  department?: string;
  subject?: string;
  paper?: string;
  topic?: string;
  difficulty?: string;
  type?: string;
  year?: number;
  session?: string;
  searchQuery?: string;
  status?: string;
}): Promise<QuestionEngineItem[]> {
  try {
    const qSnap = await getDocs(collection(db, QUESTIONS_COLLECTION));
    let questions: QuestionEngineItem[] = [];
    
    if (!qSnap.empty) {
      questions = qSnap.docs.map(d => ({ id: d.id, ...d.data() } as QuestionEngineItem));
    } else {
      questions = getLocalStorageData<QuestionEngineItem[]>(LOCAL_QUESTIONS_KEY, SEED_QUESTIONS);
    }
    
    // Apply filters in memory
    if (filters) {
      if (filters.level && filters.level !== 'all') {
        questions = questions.filter(q => q.level === filters.level);
      }
      if (filters.department && filters.department !== 'all') {
        questions = questions.filter(q => q.department === filters.department);
      }
      if (filters.subject && filters.subject !== 'all') {
        questions = questions.filter(q => q.subject.toLowerCase() === filters.subject?.toLowerCase());
      }
      if (filters.paper && filters.paper !== 'all') {
        questions = questions.filter(q => q.paper === filters.paper);
      }
      if (filters.topic && filters.topic !== 'all') {
        questions = questions.filter(q => q.topic.toLowerCase().includes(filters.topic.toLowerCase()));
      }
      if (filters.difficulty && filters.difficulty !== 'all') {
        questions = questions.filter(q => q.difficulty === filters.difficulty);
      }
      if (filters.type && filters.type !== 'all') {
        questions = questions.filter(q => q.questionType === filters.type);
      }
      if (filters.year && filters.year > 0) {
        questions = questions.filter(q => q.examYear === Number(filters.year));
      }
      if (filters.session && filters.session !== 'all') {
        questions = questions.filter(q => q.session === filters.session);
      }
      if (filters.status && filters.status !== 'all') {
        questions = questions.filter(q => q.status === filters.status);
      }
      if (filters.searchQuery) {
        const term = filters.searchQuery.toLowerCase();
        questions = questions.filter(q => 
          q.title.toLowerCase().includes(term) ||
          q.questionText.toLowerCase().includes(term) ||
          q.topic.toLowerCase().includes(term) ||
          q.subject.toLowerCase().includes(term)
        );
      }
    }
    
    return questions;
  } catch (error) {
    console.warn('Falling back to local storage questions:', error);
    let questions = getLocalStorageData<QuestionEngineItem[]>(LOCAL_QUESTIONS_KEY, SEED_QUESTIONS);
    if (filters?.searchQuery) {
      const term = filters.searchQuery.toLowerCase();
      questions = questions.filter(q => 
        q.title.toLowerCase().includes(term) ||
        q.questionText.toLowerCase().includes(term)
      );
    }
    return questions;
  }
}

export async function fetchQuestionById(id: string): Promise<QuestionEngineItem | null> {
  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as QuestionEngineItem;
    }
  } catch (err) {
    console.warn('Error fetching question from firestore:', err);
  }
  
  const localList = getLocalStorageData<QuestionEngineItem[]>(LOCAL_QUESTIONS_KEY, SEED_QUESTIONS);
  return localList.find(q => q.id === id) || null;
}

export async function saveQuestion(question: Partial<QuestionEngineItem>): Promise<QuestionEngineItem> {
  const isNew = !question.id;
  const questionId = question.id || `q-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
  const formattedItem: QuestionEngineItem = {
    id: questionId,
    title: question.title || 'Untitled Question',
    questionNumber: question.questionNumber || 1,
    questionText: question.questionText || '',
    questionType: question.questionType || 'mcq',
    difficulty: question.difficulty || 'Medium',
    marks: question.marks || 1,
    estimatedTimeMinutes: question.estimatedTimeMinutes || 2,
    level: question.level || 'Ordinary Level',
    department: question.department || 'Science',
    subject: question.subject || 'Computer Science',
    paper: question.paper || 'Paper 1',
    topic: question.topic || 'General',
    subtopic: question.subtopic || 'General',
    examYear: question.examYear || new Date().getFullYear(),
    session: question.session || 'June',
    instructions: question.instructions || '',
    hints: question.hints || [],
    explanation: question.explanation || '',
    reference: question.reference || '',
    status: question.status || 'published',
    mediaList: question.mediaList || [],
    options: question.options || [],
    markingScheme: question.markingScheme,
    programmingData: question.programmingData,
    matchingPairs: question.matchingPairs,
    blanks: question.blanks,
    trueFalseAnswer: question.trueFalseAnswer,
    createdAt: question.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    const docRef = doc(db, QUESTIONS_COLLECTION, questionId);
    await setDoc(docRef, formattedItem, { merge: true });
  } catch (err) {
    console.warn('Firestore write failed, saving to local storage:', err);
  }

  // Update local storage
  const localList = getLocalStorageData<QuestionEngineItem[]>(LOCAL_QUESTIONS_KEY, SEED_QUESTIONS);
  const idx = localList.findIndex(q => q.id === questionId);
  if (idx >= 0) {
    localList[idx] = formattedItem;
  } else {
    localList.unshift(formattedItem);
  }
  setLocalStorageData(LOCAL_QUESTIONS_KEY, localList);

  return formattedItem;
}

export async function duplicateQuestion(id: string): Promise<QuestionEngineItem | null> {
  const original = await fetchQuestionById(id);
  if (!original) return null;

  const copy: Partial<QuestionEngineItem> = {
    ...original,
    id: undefined,
    title: `${original.title} (Copy)`,
    questionNumber: `${original.questionNumber}-Copy`,
    createdAt: new Date().toISOString()
  };

  return await saveQuestion(copy);
}

export async function deleteQuestion(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, QUESTIONS_COLLECTION, id));
  } catch (err) {
    console.warn('Firestore delete failed, removing locally:', err);
  }

  const localList = getLocalStorageData<QuestionEngineItem[]>(LOCAL_QUESTIONS_KEY, SEED_QUESTIONS);
  const filtered = localList.filter(q => q.id !== id);
  setLocalStorageData(LOCAL_QUESTIONS_KEY, filtered);
  return true;
}

export async function bulkImportQuestions(questionsList: Partial<QuestionEngineItem>[]): Promise<QuestionEngineItem[]> {
  const saved: QuestionEngineItem[] = [];
  for (const item of questionsList) {
    const created = await saveQuestion(item);
    saved.push(created);
  }
  return saved;
}

// ==========================================
// EXAMINATION ENGINE SERVICES
// ==========================================

export async function fetchExams(filters?: {
  level?: string;
  subject?: string;
  examType?: string;
  status?: string;
}): Promise<EngineExam[]> {
  try {
    const snap = await getDocs(collection(db, EXAMS_COLLECTION));
    let exams: EngineExam[] = [];
    if (!snap.empty) {
      exams = snap.docs.map(d => ({ id: d.id, ...d.data() } as EngineExam));
    } else {
      exams = getLocalStorageData<EngineExam[]>(LOCAL_EXAMS_KEY, SEED_EXAMS);
    }

    if (filters) {
      if (filters.level && filters.level !== 'all') {
        exams = exams.filter(e => e.academicLevel === filters.level);
      }
      if (filters.subject && filters.subject !== 'all') {
        exams = exams.filter(e => e.subject.toLowerCase() === filters.subject?.toLowerCase());
      }
      if (filters.examType && filters.examType !== 'all') {
        exams = exams.filter(e => e.examType === filters.examType);
      }
      if (filters.status && filters.status !== 'all') {
        exams = exams.filter(e => e.status === filters.status);
      }
    }
    return exams;
  } catch (err) {
    console.warn('Error fetching exams from firestore:', err);
    return getLocalStorageData<EngineExam[]>(LOCAL_EXAMS_KEY, SEED_EXAMS);
  }
}

export async function fetchExamById(id: string): Promise<EngineExam | null> {
  try {
    const snap = await getDoc(doc(db, EXAMS_COLLECTION, id));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as EngineExam;
    }
  } catch (err) {
    console.warn('Error fetching exam by ID:', err);
  }

  const localExams = getLocalStorageData<EngineExam[]>(LOCAL_EXAMS_KEY, SEED_EXAMS);
  return localExams.find(e => e.id === id) || null;
}

export async function saveExam(exam: Partial<EngineExam>): Promise<EngineExam> {
  const examId = exam.id || `exam-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  const formattedExam: EngineExam = {
    id: examId,
    title: exam.title || 'Custom Mock Examination',
    description: exam.description || '',
    academicLevel: exam.academicLevel || 'Ordinary Level',
    department: exam.department || 'Science',
    subject: exam.subject || 'Computer Science',
    paper: exam.paper || 'Paper 1',
    examType: exam.examType || 'mock',
    durationMinutes: exam.durationMinutes || 60,
    passingScorePercent: exam.passingScorePercent || 50,
    questionOrder: exam.questionOrder || 'fixed',
    shuffleOptions: exam.shuffleOptions ?? true,
    negativeMarking: exam.negativeMarking ?? false,
    negativeMarksPerWrong: exam.negativeMarksPerWrong || 0.25,
    retakesAllowed: exam.retakesAllowed ?? true,
    maxRetakes: exam.maxRetakes ?? -1,
    showAnswers: exam.showAnswers || 'after_submission',
    showExplanations: exam.showExplanations ?? true,
    showResultsImmediately: exam.showResultsImmediately ?? true,
    allowCalculator: exam.allowCalculator ?? false,
    questions: exam.questions || [],
    autoRules: exam.autoRules,
    status: exam.status || 'published',
    createdAt: exam.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  try {
    await setDoc(doc(db, EXAMS_COLLECTION, examId), formattedExam, { merge: true });
  } catch (err) {
    console.warn('Firestore write failed for exam, saving locally:', err);
  }

  const list = getLocalStorageData<EngineExam[]>(LOCAL_EXAMS_KEY, SEED_EXAMS);
  const idx = list.findIndex(e => e.id === examId);
  if (idx >= 0) {
    list[idx] = formattedExam;
  } else {
    list.unshift(formattedExam);
  }
  setLocalStorageData(LOCAL_EXAMS_KEY, list);
  return formattedExam;
}

export async function deleteExam(id: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, EXAMS_COLLECTION, id));
  } catch (err) {
    console.warn('Firestore delete exam failed:', err);
  }

  const list = getLocalStorageData<EngineExam[]>(LOCAL_EXAMS_KEY, SEED_EXAMS);
  setLocalStorageData(LOCAL_EXAMS_KEY, list.filter(e => e.id !== id));
  return true;
}

// Auto Question Selection Engine
export async function generateAutoExamQuestions(rule: ExamAutoRule): Promise<{ questionId: string; order: number; marks: number }[]> {
  const allQ = await fetchQuestions({ subject: rule.subject, paper: rule.paper });
  
  const easy = allQ.filter(q => q.difficulty === 'Easy');
  const medium = allQ.filter(q => q.difficulty === 'Medium');
  const hard = allQ.filter(q => q.difficulty === 'Hard');
  const expert = allQ.filter(q => q.difficulty === 'Expert');

  const shuffle = <T>(arr: T[]): T[] => arr.sort(() => Math.random() - 0.5);

  const selectedEasy = shuffle(easy).slice(0, rule.easyCount);
  const selectedMedium = shuffle(medium).slice(0, rule.mediumCount);
  const selectedHard = shuffle(hard).slice(0, rule.hardCount);
  const selectedExpert = rule.expertCount ? shuffle(expert).slice(0, rule.expertCount) : [];

  const combined = [...selectedEasy, ...selectedMedium, ...selectedHard, ...selectedExpert];
  
  // If we don't have enough, fill with any remaining questions
  if (combined.length < rule.totalQuestions) {
    const remainingNeeded = rule.totalQuestions - combined.length;
    const combinedIds = new Set(combined.map(q => q.id));
    const filler = shuffle(allQ.filter(q => !combinedIds.has(q.id))).slice(0, remainingNeeded);
    combined.push(...filler);
  }

  return combined.map((q, idx) => ({
    questionId: q.id,
    order: idx + 1,
    marks: q.marks || 1
  }));
}

// ==========================================
// EXAM ATTEMPT & GRADING SERVICES
// ==========================================

export async function gradeExamSubmission(
  exam: EngineExam,
  questions: QuestionEngineItem[],
  answers: Record<string, ExamAttemptAnswer>,
  user: { uid: string; displayName?: string; email?: string }
): Promise<ExamAttempt> {
  let totalScore = 0;
  let maxScore = 0;
  const topicStats: Record<string, { correct: number; total: number; percentage: number }> = {};

  questions.forEach((q) => {
    maxScore += q.marks || 1;
    const topicKey = q.topic || 'General';
    if (!topicStats[topicKey]) {
      topicStats[topicKey] = { correct: 0, total: 0, percentage: 0 };
    }
    topicStats[topicKey].total += q.marks || 1;

    const userAnswer = answers[q.id];
    let earnedMarks = 0;

    if (userAnswer) {
      if (q.questionType === 'mcq') {
        const correctOpt = q.options?.find(o => o.isCorrect);
        if (correctOpt && userAnswer.selectedOptionId === correctOpt.id) {
          earnedMarks = q.marks || 1;
        } else if (userAnswer.selectedOptionId && exam.negativeMarking) {
          earnedMarks = -(exam.negativeMarksPerWrong || 0.25);
        }
      } else if (q.questionType === 'true_false') {
        if (userAnswer.trueFalseValue === q.trueFalseAnswer) {
          earnedMarks = q.marks || 1;
        } else if (exam.negativeMarking) {
          earnedMarks = -(exam.negativeMarksPerWrong || 0.25);
        }
      } else if (q.questionType === 'fill_in_blanks' && q.blanks) {
        let correctBlanks = 0;
        q.blanks.forEach(b => {
          const given = userAnswer.blankAnswers?.[b.index]?.trim() || '';
          const matches = b.acceptedAnswers.some(ans => 
            b.caseSensitive ? ans === given : ans.toLowerCase() === given.toLowerCase()
          );
          if (matches) correctBlanks++;
        });
        earnedMarks = (correctBlanks / q.blanks.length) * (q.marks || 1);
      } else if (q.questionType === 'matching' && q.matchingPairs) {
        let correctPairs = 0;
        q.matchingPairs.forEach(pair => {
          if (userAnswer.matchingSelections?.[pair.id] === pair.right) {
            correctPairs++;
          }
        });
        earnedMarks = (correctPairs / q.matchingPairs.length) * (q.marks || 1);
      } else if (q.questionType === 'programming' && q.programmingData) {
        // Simple automated heuristic for code submissions
        const code = userAnswer.codeSubmission || '';
        if (code.length > 20 && (code.includes('def ') || code.includes('function') || code.includes('class'))) {
          earnedMarks = Math.round((q.marks || 10) * 0.85); // High score for valid structural code
        } else if (code.length > 5) {
          earnedMarks = Math.round((q.marks || 10) * 0.4);
        }
      } else if (['structured', 'essay', 'short_answer', 'practical'].includes(q.questionType)) {
        // Keyword heuristic matching against model answer & marking scheme
        const text = (userAnswer.textAnswer || '').toLowerCase();
        if (q.markingScheme && text.length > 10) {
          let keywordsMatched = 0;
          let totalKeywords = 0;
          q.markingScheme.marksAllocation.forEach(sub => {
            if (sub.expectedKeywords) {
              totalKeywords += sub.expectedKeywords.length;
              sub.expectedKeywords.forEach(kw => {
                if (text.includes(kw.toLowerCase())) keywordsMatched++;
              });
            }
          });
          if (totalKeywords > 0) {
            earnedMarks = Math.min(q.marks, Math.round((keywordsMatched / totalKeywords) * q.marks));
          } else {
            earnedMarks = text.length > 80 ? Math.round(q.marks * 0.75) : Math.round(q.marks * 0.4);
          }
        }
      }
    }

    earnedMarks = Math.max(0, earnedMarks);
    totalScore += earnedMarks;
    topicStats[topicKey].correct += earnedMarks;
  });

  // Calculate percentages per topic
  Object.keys(topicStats).forEach(t => {
    const item = topicStats[t];
    item.percentage = item.total > 0 ? Math.round((item.correct / item.total) * 100) : 0;
  });

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  const passed = percentage >= exam.passingScorePercent;

  const attempt: ExamAttempt = {
    id: `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    examId: exam.id,
    examTitle: exam.title,
    userId: user.uid,
    userName: user.displayName || 'Student',
    userEmail: user.email,
    startedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    durationSeconds: 0,
    status: 'completed',
    answers,
    flaggedQuestionIds: Object.keys(answers).filter(k => answers[k]?.isFlagged),
    totalScore,
    maxScore,
    percentage,
    passed,
    topicPerformance: topicStats,
    feedback: passed 
      ? `Outstanding work! You scored ${percentage}%, passing the ${exam.passingScorePercent}% threshold.`
      : `You scored ${percentage}%. You need ${exam.passingScorePercent}% to pass. Review your weak topics below.`,
    aiInsights: `AI Examiner Analysis: Strong mastery observed in ${Object.keys(topicStats).filter(k => topicStats[k].percentage >= 70).join(', ') || 'foundation topics'}. Focus review on ${Object.keys(topicStats).filter(k => topicStats[k].percentage < 60).join(', ') || 'deep structured problem solving'}.`
  };

  try {
    await setDoc(doc(db, ATTEMPTS_COLLECTION, attempt.id), attempt);
  } catch (err) {
    console.warn('Firestore write attempt failed, saving locally:', err);
  }

  const list = getLocalStorageData<ExamAttempt[]>(LOCAL_ATTEMPTS_KEY, []);
  list.unshift(attempt);
  setLocalStorageData(LOCAL_ATTEMPTS_KEY, list);

  return attempt;
}

export async function fetchUserAttempts(userId: string): Promise<ExamAttempt[]> {
  try {
    const snap = await getDocs(query(collection(db, ATTEMPTS_COLLECTION), where('userId', '==', userId)));
    if (!snap.empty) {
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamAttempt));
    }
  } catch (err) {
    console.warn('Error fetching attempts:', err);
  }
  const list = getLocalStorageData<ExamAttempt[]>(LOCAL_ATTEMPTS_KEY, []);
  return list.filter(a => a.userId === userId);
}

// BOOKMARKS & REPORTS
export async function toggleBookmark(userId: string, question: QuestionEngineItem): Promise<boolean> {
  const bookmarks = getLocalStorageData<QuestionBookmark[]>(LOCAL_BOOKMARKS_KEY, []);
  const existingIdx = bookmarks.findIndex(b => b.userId === userId && b.questionId === question.id);
  
  if (existingIdx >= 0) {
    bookmarks.splice(existingIdx, 1);
    setLocalStorageData(LOCAL_BOOKMARKS_KEY, bookmarks);
    return false; // removed
  } else {
    const newBm: QuestionBookmark = {
      id: `bm-${Date.now()}`,
      userId,
      questionId: question.id,
      questionTitle: question.title,
      subject: question.subject,
      topic: question.topic,
      createdAt: new Date().toISOString()
    };
    bookmarks.unshift(newBm);
    setLocalStorageData(LOCAL_BOOKMARKS_KEY, bookmarks);
    return true; // added
  }
}

export async function fetchUserBookmarks(userId: string): Promise<QuestionBookmark[]> {
  const list = getLocalStorageData<QuestionBookmark[]>(LOCAL_BOOKMARKS_KEY, []);
  return list.filter(b => b.userId === userId);
}

// AI Question Extraction & Parsing Helper
export function parseRawTextToQuestions(rawText: string, level: AcademicLevel = 'Ordinary Level', subject: string = 'Computer Science'): Partial<QuestionEngineItem>[] {
  // Parsing algorithm to split raw uploaded test text into questions
  const blocks = rawText.split(/(?=(?:Question\s+\d+|Q\d+[\.:\)]|\d+[\.:\)]\s+[A-Z]))/i);
  const questions: Partial<QuestionEngineItem>[] = [];

  blocks.forEach((block, idx) => {
    const trimmed = block.trim();
    if (trimmed.length < 15) return;

    // Detect options A, B, C, D
    const optionMatches = Array.from(trimmed.matchAll(/(?:^|\n)\s*([A-D])[\.\)]\s*(.+)/g));
    const isMcq = optionMatches.length >= 2;

    const questionText = trimmed.split(/(?:A[\.\)]|\n\s*Options:)/i)[0].trim();
    
    if (isMcq) {
      const options = optionMatches.map((m, oIdx) => ({
        id: `opt-${oIdx}`,
        label: m[1].toUpperCase(),
        text: m[2].trim(),
        isCorrect: oIdx === 0 // Default first as correct if unstated
      }));
      questions.push({
        title: `Extracted Question ${idx + 1}`,
        questionNumber: idx + 1,
        questionText: questionText || trimmed,
        questionType: 'mcq',
        options,
        level,
        subject,
        paper: 'Paper 1',
        topic: 'General Topic',
        subtopic: 'General Subtopic',
        difficulty: 'Medium',
        marks: 1,
        estimatedTimeMinutes: 2,
        examYear: new Date().getFullYear(),
        session: 'June',
        status: 'published'
      });
    } else {
      questions.push({
        title: `Structured Question ${idx + 1}`,
        questionNumber: idx + 1,
        questionText: trimmed,
        questionType: 'structured',
        level,
        subject,
        paper: 'Paper 2',
        topic: 'General Topic',
        subtopic: 'General Subtopic',
        difficulty: 'Hard',
        marks: 5,
        estimatedTimeMinutes: 5,
        examYear: new Date().getFullYear(),
        session: 'June',
        status: 'published',
        markingScheme: {
          totalMarks: 5,
          modelAnswer: 'Generated model answer placeholder for review.',
          marksAllocation: [{ label: '(a)', description: 'Correct response', points: 5 }]
        }
      });
    }
  });

  return questions.length > 0 ? questions : [
    {
      title: 'Sample Imported Question',
      questionNumber: 1,
      questionText: rawText.slice(0, 300),
      questionType: 'mcq',
      level,
      subject,
      paper: 'Paper 1',
      topic: 'General',
      subtopic: 'General',
      difficulty: 'Medium',
      marks: 1,
      estimatedTimeMinutes: 2,
      examYear: new Date().getFullYear(),
      session: 'June',
      status: 'published',
      options: [
        { id: 'opt-1', label: 'A', text: 'Option A statement', isCorrect: true },
        { id: 'opt-2', label: 'B', text: 'Option B statement', isCorrect: false },
        { id: 'opt-3', label: 'C', text: 'Option C statement', isCorrect: false },
        { id: 'opt-4', label: 'D', text: 'Option D statement', isCorrect: false }
      ]
    }
  ];
}
