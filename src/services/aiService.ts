import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  AIConversation, 
  AIMessage, 
  AIStudyPlan, 
  AIQuiz, 
  AIFlashcard, 
  AISummary, 
  AISettings, 
  AIUsageLog,
  AIRecommendation 
} from '../types';

// ===============================================================
// Edulpha AI Service API
// ===============================================================

// 1. Conversation & Chat History
export const fetchUserConversations = async (userId: string): Promise<AIConversation[]> => {
  try {
    const q = query(
      collection(db, 'ai_conversations'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AIConversation));
  } catch (err) {
    console.warn("Error fetching AI conversations:", err);
    return [];
  }
};

export const createConversation = async (
  userId: string, 
  subject: string = 'Computer Science', 
  educationLevel: string = 'Ordinary Level',
  title: string = 'New AI Study Session'
): Promise<string> => {
  const ref = await addDoc(collection(db, 'ai_conversations'), {
    userId,
    title,
    subject,
    educationLevel,
    lastMessage: 'Session started',
    messageCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return ref.id;
};

export const fetchMessages = async (conversationId: string): Promise<AIMessage[]> => {
  try {
    const q = query(
      collection(db, 'ai_messages'),
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AIMessage));
  } catch (err) {
    console.warn("Error fetching AI messages:", err);
    return [];
  }
};

export const sendAIMessage = async (
  conversationId: string,
  userId: string,
  text: string,
  subject: string = 'Computer Science',
  topic: string = 'General',
  educationLevel: string = 'Ordinary Level',
  historyMessages: AIMessage[] = [],
  language?: string
): Promise<{ userMessage: AIMessage; aiMessage: AIMessage }> => {
  // 1. Save User Message
  const userMsgRef = await addDoc(collection(db, 'ai_messages'), {
    conversationId,
    userId,
    sender: 'user',
    text,
    createdAt: serverTimestamp()
  });

  const userMessage: AIMessage = {
    id: userMsgRef.id,
    conversationId,
    userId,
    sender: 'user',
    text,
    createdAt: new Date().toISOString()
  };

  // 2. Call Express AI Endpoint
  let aiReplyText = '';
  let source: 'gemini' | 'fallback' | 'error' = 'fallback';

  const userLang = language || localStorage.getItem('edulpha_lang') || 'en';

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: text,
        subject,
        topic,
        educationLevel,
        conversationHistory: historyMessages,
        language: userLang
      })
    });
    const data = await res.json();
    aiReplyText = data.reply || 'No response returned.';
    source = data.source || 'gemini';
  } catch (err) {
    aiReplyText = `[Edulpha AI]\nHere is guidance regarding your question:\n- Key Concept: Focus on foundational definitions required by the Cameroon GCE marking scheme.\n- Advice: Break your answer into bullet points and underline technical terms!`;
    source = 'fallback';
  }

  // 3. Save AI Message
  const aiMsgRef = await addDoc(collection(db, 'ai_messages'), {
    conversationId,
    userId,
    sender: 'ai',
    text: aiReplyText,
    source,
    createdAt: serverTimestamp()
  });

  const aiMessage: AIMessage = {
    id: aiMsgRef.id,
    conversationId,
    userId,
    sender: 'ai',
    text: aiReplyText,
    source,
    createdAt: new Date().toISOString()
  };

  // 4. Update Conversation Header
  const convRef = doc(db, 'ai_conversations', conversationId);
  await updateDoc(convRef, {
    lastMessage: text.slice(0, 50),
    updatedAt: serverTimestamp()
  }).catch(() => {});

  return { userMessage, aiMessage };
};

// 2. Explain Quiz/Exam Answer
export const explainAnswerWithAI = async (
  questionText: string,
  options?: string[] | Record<string, string>,
  selectedAnswer?: string,
  correctAnswer?: string,
  existingExplanation?: string
): Promise<string> => {
  try {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionText,
        options,
        selectedAnswer,
        correctAnswer,
        explanation: existingExplanation
      })
    });
    const data = await res.json();
    return data.explanation || existingExplanation || 'No detailed explanation available.';
  } catch (err) {
    return existingExplanation || `Correct Answer: ${correctAnswer}. Focus on key definitions according to GCE marking schemes.`;
  }
};

// 3. AI Quiz Generator & Persistence
export const generateAIQuiz = async (
  userId: string,
  subject: string,
  topic: string,
  subtopic: string,
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced',
  questionType: 'MCQ' | 'Essay' | 'Programming' | 'Practical' | 'TrueFalse' | 'Matching',
  count: number = 5
): Promise<AIQuiz> => {
  let questions = [];
  try {
    const res = await fetch('/api/ai/generate-quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, subtopic, difficulty, questionType, count })
    });
    const data = await res.json();
    questions = data.questions || [];
  } catch (err) {
    console.warn("API generate-quiz failed, using fallback:", err);
  }

  if (!questions || questions.length === 0) {
    questions = [
      {
        id: 'q1',
        type: questionType,
        questionText: `Which option accurately describes a fundamental concept in ${topic}?`,
        options: ['A. Primary Concept Definition', 'B. Irrelevant Factor', 'C. Secondary Auxiliary', 'D. Out of syllabus'],
        correctAnswer: 'A',
        explanation: 'Primary concept definition matches GCE syllabus guidelines.',
        examTip: 'Check technical terminology carefully.'
      }
    ];
  }

  const quizData = {
    userId,
    subject,
    topic,
    subtopic,
    difficulty,
    questionType,
    questions,
    totalQuestions: questions.length,
    createdAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'ai_quizzes'), quizData);
  return { id: ref.id, ...quizData, createdAt: new Date().toISOString() };
};

// 4. AI Revision Planner
export const generateAIStudyPlan = async (
  userId: string,
  subject: string,
  paper: string,
  durationDays: number,
  targetExamDate?: string
): Promise<AIStudyPlan> => {
  let dailyTasks = [];
  try {
    const res = await fetch('/api/ai/generate-study-plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, paper, durationDays, targetExamDate })
    });
    const data = await res.json();
    dailyTasks = data.dailyTasks || [];
  } catch (err) {
    console.warn("Study plan API failed:", err);
  }

  const planData = {
    userId,
    subject,
    paper,
    durationDays,
    startDate: new Date().toISOString().slice(0, 10),
    targetExamDate,
    dailyTasks,
    createdAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'ai_study_plans'), planData);
  return { id: ref.id, ...planData, createdAt: new Date().toISOString() };
};

export const fetchUserStudyPlans = async (userId: string): Promise<AIStudyPlan[]> => {
  try {
    const q = query(
      collection(db, 'ai_study_plans'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AIStudyPlan));
  } catch (err) {
    return [];
  }
};

// 5. AI Lesson Summarizer & Flashcards
export const generateAISummary = async (
  userId: string,
  textContent: string,
  subject: string,
  title: string
): Promise<AISummary> => {
  let result = null;
  try {
    const res = await fetch('/api/ai/summarize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ textContent, subject, title })
    });
    result = await res.json();
  } catch (err) {
    console.warn("Summarize API failed:", err);
  }

  const shortSummary = result?.shortSummary || `Summary of ${title}: Key GCE definitions and paper 2 guidelines.`;
  const detailedSummary = result?.detailedSummary || textContent.slice(0, 300) + '...';
  const revisionPoints = result?.revisionPoints || ['Understand key definitions', 'Practice past questions'];
  const flashcardsData = result?.flashcards || [
    { frontText: `What is the core definition of ${title}?`, backText: 'Refer to textbook standard definitions.' }
  ];

  const summaryPayload = {
    userId,
    title,
    sourceType: 'text' as const,
    subject,
    shortSummary,
    detailedSummary,
    revisionPoints,
    createdAt: serverTimestamp()
  };

  const ref = await addDoc(collection(db, 'ai_summaries'), summaryPayload);

  // Also save flashcards to ai_flashcards collection
  for (const fc of flashcardsData) {
    await addDoc(collection(db, 'ai_flashcards'), {
      userId,
      subject,
      topic: title,
      frontText: fc.frontText,
      backText: fc.backText,
      mastered: false,
      createdAt: serverTimestamp()
    }).catch(() => {});
  }

  return { id: ref.id, ...summaryPayload, flashcards: flashcardsData, createdAt: new Date().toISOString() };
};

export const fetchUserFlashcards = async (userId: string): Promise<AIFlashcard[]> => {
  try {
    const q = query(
      collection(db, 'ai_flashcards'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AIFlashcard));
  } catch (err) {
    return [];
  }
};

export const toggleFlashcardMastery = async (flashcardId: string, currentStatus: boolean): Promise<void> => {
  const ref = doc(db, 'ai_flashcards', flashcardId);
  await updateDoc(ref, { mastered: !currentStatus });
};

// 6. AI Programming Assistant
export const analyzeCodeWithAI = async (
  code: string,
  language: string,
  mode: 'explain' | 'debug' | 'improve' | 'compiler',
  compilerError?: string
): Promise<string> => {
  try {
    const res = await fetch('/api/ai/programming-help', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language, mode, compilerError })
    });
    const data = await res.json();
    return data.analysis || 'Code analysis complete.';
  } catch (err) {
    return `**[Code Analysis Error]**\nCould not reach server. Verify programming syntax manually.`;
  }
};

// 7. AI Recommendations & Weakness Analysis
export const fetchAIRecommendations = async (userId: string, subject: string): Promise<{ weaknesses: string[]; recommendations: AIRecommendation[] }> => {
  try {
    const res = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userSubject: subject })
    });
    const data = await res.json();
    return {
      weaknesses: data.weaknesses || ['Past Paper 2 Calculations', 'Database Normalization'],
      recommendations: data.recommendations || []
    };
  } catch (err) {
    return {
      weaknesses: ['Algorithms', 'Data Structures'],
      recommendations: [
        {
          id: 'rec1',
          userId,
          type: 'lesson',
          title: 'Mastering Flowcharts & Pseudocode',
          description: 'High-frequency paper 2 topic in GCE.',
          subject,
          reason: 'Recommended based on study syllabus',
          priority: 'high',
          createdAt: new Date().toISOString()
        }
      ]
    };
  }
};

// 8. Admin AI Settings Management
export const fetchAISettings = async (): Promise<AISettings> => {
  try {
    const docRef = doc(db, 'ai_settings', 'config');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AISettings;
    }
  } catch (err) {
    console.warn("Settings fetch failed, using default:", err);
  }

  return {
    enabled: true,
    provider: 'gemini-2.5-flash',
    dailyLimitPerUser: 50,
    systemPromptTutor: 'You are Edulpha AI, an encouraging and expert GCE Tutor.',
    systemPromptQuiz: 'Generate clear, standard GCE questions with answer keys.',
    systemPromptCode: 'Provide clear code explanations and GCE practical tips.',
    moderateConversations: true,
    allowPublicAI: true
  };
};

export const saveAISettings = async (settings: AISettings): Promise<void> => {
  const docRef = doc(db, 'ai_settings', 'config');
  await setDoc(docRef, {
    ...settings,
    updatedAt: serverTimestamp()
  }, { merge: true });
};
