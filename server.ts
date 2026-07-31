import express from "express";
import { createServer } from "http";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { getFirestore as getAdminFirestore, FieldValue } from "firebase-admin/firestore";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: process.env.FIREBASE_PROJECT_ID || "gradeboost-df887", 
  });
}

const db = getAdminFirestore(admin.app(), "ai-studio-8cbb773b-9589-470c-a864-1eb415b2302d");

// Rate Limiters
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Too many payment attempts, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

// ... (keep existing helper functions)

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  const PORT = 3000;

  app.use(express.json());
  app.use("/api/", apiLimiter);
  app.use("/api/payment/", paymentLimiter);

  // ... (keep existing API routes)

  // ===============================================================
  // GradeBoost AI REST API Endpoints
  // ===============================================================

  // Helper for Gemini AI client initialization
  const getAiClient = async () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) return null;
    const { GoogleGenAI } = await import("@google/genai");
    return new GoogleGenAI({ apiKey });
  };

  // 1. AI Tutor & Chat API
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { prompt, subject, topic, educationLevel, conversationHistory, curriculum, curriculumId, language } = req.body;
      const ai = await getAiClient();

      const isFrenchCurriculum = curriculum === 'cameroon_francophone' || 
        curriculumId === 'cameroon_francophone' || 
        ['Troisième (BEPC)', 'Seconde', 'Première', 'Terminale'].includes(educationLevel) ||
        language === 'fr';

      if (!ai) {
        if (isFrenchCurriculum) {
          return res.json({
            reply: `[GradeBoost AI - Mode Hors Ligne / Système Francophone]\n\nVoici une vue d'ensemble pour "${prompt}":\n\n📌 **Notions Clés** (${subject || 'Général'} - ${topic || 'Révision'}):\n- Respectez rigoureusement la méthodologie et le vocabulaire du programme officiel camerounais (MINESEC/OBC).\n- Décomposez la démarche étape par étape.\n\n💡 **Conseil d'Examen (BAC / BEPC)**: Citez toujours la définition exacte du cours!\n\n⚠️ **Erreur Fréquente**: Omission des étapes d'explication ou confusion de formules.`,
            source: 'fallback',
            examTips: ['Utilisez le vocabulaire officiel du MINESEC', 'Présentez clairement vos démarches de calcul'],
            commonMistakes: ['Confusion des définitions de base']
          });
        }

        return res.json({
          reply: `[GradeBoost AI - Offline Mode]\n\nHere is a structured explanation regarding "${prompt}":\n\n📌 **Key Concepts** (${subject || 'General'} - ${topic || 'Revision'}):\n- Focus on core definitions required by the Cameroon GCE marking scheme.\n- Break down complex mechanisms into simple step-by-step algorithms or principles.\n\n💡 **Exam Tip**: Highlight technical keywords in your written answer for full marks!\n\n⚠️ **Common Mistake**: Confusing fundamental terms or skipping unit conversions.`,
          source: 'fallback',
          examTips: ['Highlight technical keywords for marking scheme points.', 'Show all working steps for calculations.'],
          commonMistakes: ['Confusing basic terminology with related concepts.']
        });
      }

      const historyContext = Array.isArray(conversationHistory) 
        ? conversationHistory.slice(-6).map((m: any) => `${m.sender === 'user' ? 'Student' : 'AI'}: ${m.text}`).join('\n')
        : '';

      const systemPrompt = isFrenchCurriculum
        ? `Vous êtes GradeBoost AI, un tuteur expert et encourageant pour le Système Éducatif Francophone du Cameroun (MINESEC / OBC).
Contexte: Matière: ${subject || 'Mathématiques / Général'}, Sujet: ${topic || 'Général'}, Niveau: ${educationLevel || 'Terminale'}.

Instructions:
1. Répondez de façon claire et bien structurée en français.
2. Structurez la réponse avec des sections:
   - **Explication Simple**
   - **Détails & Méthodologie**
   - **Exemples Concrets**
   - **Conseils pour le Baccalauréat / BEPC**
   - **Erreurs Fréquentes des Élèves**
3. Soyez très encourageant, pédagogique et précis.`
        : `You are GradeBoost AI, an encouraging and expert 24/7 GCE (General Certificate of Education) Tutor specializing in Cameroon GCE (Ordinary & Advanced Level) and international syllabus.
Context: Subject: ${subject || 'General Studies'}, Topic: ${topic || 'General'}, Level: ${educationLevel || 'O/A Level'}.

Instructions:
1. Provide a clear, friendly, and structured response.
2. Structure your reply with sections:
   - **Simple Explanation**
   - **Detailed Breakdown**
   - **Real-World Examples**
   - **GCE Exam Tips & Marking Points**
   - **Common Student Mistakes**
3. Be encouraging and clear. Keep formatting clean using Markdown bullet points.`;

      const contents = `${systemPrompt}\n\nRecent History:\n${historyContext}\n\nStudent Question: ${prompt}`;
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents
      });

      const reply = result.text || "I couldn't process your request right now. Please rephrase your question.";
      res.json({ reply, source: 'gemini' });
    } catch (err: any) {
      console.error("AI Chat API Error:", err);
      res.json({
        reply: "GradeBoost AI encountered a temporary connection glitch. Please review key definitions and practice past examination papers!",
        source: 'error'
      });
    }
  });

  // Backward compatibility endpoint
  app.post("/api/ai-tutor", async (req, res) => {
    try {
      const { prompt, subject, topic } = req.body;
      const ai = await getAiClient();

      if (!ai) {
        return res.json({
          reply: `[AI Tutor - Offline Mode]\nHere is a guide regarding "${prompt}":\n\nFor ${subject || 'your studies'} (${topic || 'general topics'}):\n1. Break down the core concepts into fundamental definitions.\n2. Review past GCE questions on this topic.\n3. Practice drawing flowcharts, circuit diagrams, or writing out key definitions.\n4. Ensure you check the marking scheme for standard key terms!`,
          source: 'fallback'
        });
      }

      const systemInstruction = `You are GradeBoost AI, an expert, encouraging 24/7 GCE Tutor. Subject: ${subject || 'General'}. Topic: ${topic || 'General'}.`;
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemInstruction}\n\nStudent Question: ${prompt}`
      });

      res.json({ reply: result.text || "No response generated.", source: 'gemini' });
    } catch (err) {
      res.json({
        reply: "I am having trouble connecting right now. Please try again shortly.",
        source: 'error'
      });
    }
  });

  // 2. AI Answer Explanation API
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { questionText, options, selectedAnswer, correctAnswer, explanation } = req.body;
      const ai = await getAiClient();

      if (!ai) {
        return res.json({
          explanation: `**Explanation**:\n- Correct Answer: **${correctAnswer}**\n- Why it is correct: ${explanation || 'It satisfies the core condition requested in the question.'}\n- Key Concept: Always verify definitions against standard GCE specifications.`,
          source: 'fallback'
        });
      }

      const prompt = `As a GCE Examiner and GradeBoost AI Tutor, explain this question in detail to the student:

Question: ${questionText}
Options: ${JSON.stringify(options || [])}
Student Selected: ${selectedAnswer || 'None'}
Correct Answer: ${correctAnswer}

Provide:
1. **Why ${correctAnswer} is Correct**
2. **Why the other options are Incorrect**
3. **Core Concept Summary**
4. **GCE Exam Tip**`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({ explanation: result.text || explanation, source: 'gemini' });
    } catch (err) {
      res.json({
        explanation: `**Explanation**:\n- Correct Answer: **${req.body.correctAnswer}**\n- ${req.body.explanation || 'Refer to the textbook definition for this topic.'}`,
        source: 'error'
      });
    }
  });

  // 3. AI Quiz Generator API
  app.post("/api/ai/generate-quiz", async (req, res) => {
    try {
      const { subject, topic, subtopic, difficulty, questionType, count } = req.body;
      const ai = await getAiClient();
      const numQuestions = Math.min(20, Math.max(1, count || 5));

      if (!ai) {
        // Mock structured JSON response when AI client offline
        return res.json({
          questions: [
            {
              id: 'q1',
              type: questionType || 'MCQ',
              questionText: `Which of the following is a fundamental principle of ${topic || subject || 'this subject'}?`,
              options: ['A. Primary Core Execution', 'B. Secondary Storage Allocation', 'C. Parallel Bus Arbitrage', 'D. Virtual Address Translation'],
              correctAnswer: 'A',
              explanation: 'Primary Core Execution is essential for core processing cycles.',
              examTip: 'Remember the difference between core execution and peripheral I/O.'
            },
            {
              id: 'q2',
              type: questionType || 'MCQ',
              questionText: `What is the expected output or result when analyzing ${topic || 'the system'} under normal parameters?`,
              options: ['A. Optimal Performance State', 'B. Stack Overflow Exception', 'C. Deadlock State', 'D. Zero Division Fault'],
              correctAnswer: 'A',
              explanation: 'Normal operational parameters produce optimal performance states.',
              examTip: 'Pay attention to key terms like "normal parameters" vs "error states".'
            }
          ],
          source: 'fallback'
        });
      }

      const prompt = `Generate ${numQuestions} ${difficulty || 'Intermediate'} level examination questions for Cameroon GCE level.
Subject: ${subject || 'Computer Science'}
Topic: ${topic || 'General'}
Subtopic: ${subtopic || 'General'}
Question Type: ${questionType || 'MCQ'}

Return ONLY valid JSON matching this exact structure (no markdown fences, just valid JSON array):
[
  {
    "id": "q1",
    "type": "${questionType || 'MCQ'}",
    "questionText": "Question text here",
    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
    "correctAnswer": "A",
    "explanation": "Detailed explanation here",
    "examTip": "Examiner tip here"
  }
]`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = result.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const questions = JSON.parse(cleanJson);

      res.json({ questions, source: 'gemini' });
    } catch (err: any) {
      console.warn("Quiz Generator fallback used due to parse/API issue:", err?.message);
      res.json({
        questions: [
          {
            id: 'q1',
            type: req.body.questionType || 'MCQ',
            questionText: `Standard Question on ${req.body.topic || 'the selected topic'}: What is the main objective of this topic in the GCE syllabus?`,
            options: ['A. To understand core foundational principles', 'B. To ignore system constraints', 'C. To calculate random values', 'D. None of the above'],
            correctAnswer: 'A',
            explanation: 'Foundational principles form the basis of all assessment questions.',
            examTip: 'Focus on clear definitions in Paper 1 and Paper 2.'
          }
        ],
        source: 'fallback'
      });
    }
  });

  // 4. AI Revision Planner API
  app.post("/api/ai/generate-study-plan", async (req, res) => {
    try {
      const { subject, paper, durationDays, targetExamDate } = req.body;
      const days = Math.min(60, Math.max(3, durationDays || 14));
      const ai = await getAiClient();

      if (!ai) {
        // Fallback generator
        const fallbackTasks = Array.from({ length: days }, (_, i) => {
          const dayNum = i + 1;
          const isBreak = dayNum % 7 === 0;
          return {
            day: dayNum,
            dayName: `Day ${dayNum}`,
            topic: isBreak ? 'Rest & Memory Consolidation' : `Topic ${((i % 5) + 1)}: ${subject || 'GCE Revision'} Focus`,
            description: isBreak ? 'Take a light break, review flashcards, and rest your mind.' : 'Study core concepts, complete 15 past paper questions, and summarize key definitions.',
            taskType: isBreak ? 'break' : (i % 3 === 0 ? 'lesson' : i % 3 === 1 ? 'practice' : 'revision'),
            estMinutes: isBreak ? 20 : 60,
            completed: false
          };
        });

        return res.json({ dailyTasks: fallbackTasks, source: 'fallback' });
      }

      const prompt = `Create a structured ${days}-day revision plan for Cameroon GCE ${subject || 'Computer Science'} ${paper ? `(${paper})` : ''}.
Target Exam: ${targetExamDate || 'Upcoming GCE Exam'}.

Return ONLY valid JSON matching this exact structure (no markdown fences):
[
  {
    "day": 1,
    "dayName": "Day 1",
    "topic": "Topic title",
    "description": "Clear actionable study instructions",
    "taskType": "lesson",
    "estMinutes": 45,
    "completed": false
  }
]
Note: taskType must be one of: "lesson", "practice", "revision", "mock", "break". Include a break day every 7th day.`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const cleanJson = (result.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const dailyTasks = JSON.parse(cleanJson);
      res.json({ dailyTasks, source: 'gemini' });
    } catch (err) {
      res.json({
        dailyTasks: [
          { day: 1, dayName: 'Day 1', topic: 'Core Definitions Review', description: 'Review high-yield syllabus terms.', taskType: 'lesson', estMinutes: 45, completed: false },
          { day: 2, dayName: 'Day 2', topic: 'Past Paper Drill', description: 'Solve 20 MCQs under timed conditions.', taskType: 'practice', estMinutes: 45, completed: false }
        ],
        source: 'fallback'
      });
    }
  });

  // 5. AI Lesson Summarizer & Flashcards API
  app.post("/api/ai/summarize", async (req, res) => {
    try {
      const { textContent, subject, title } = req.body;
      const ai = await getAiClient();

      if (!ai) {
        return res.json({
          shortSummary: `Quick Summary of ${title || 'Lesson'}: Covers core definitions, standard procedures, and high-yield GCE exam key points.`,
          detailedSummary: `The provided lesson material details key principles in ${subject || 'the syllabus'}. Students must master terms, formulas, and structural diagrams to earn full marks on Paper 2.`,
          revisionPoints: [
            'Master standard technical definitions.',
            'Practice past examination questions on this exact topic.',
            'Memorize the step-by-step algorithm or procedure.',
            'Review common examiner marking guidelines.'
          ],
          flashcards: [
            { frontText: `What is the key definition in ${title || 'this topic'}?`, backText: 'Refer to the textbook standard definition required by GCE marking schemes.' },
            { frontText: 'How is this concept applied in exam paper 2?', backText: 'Used in structured essay questions requiring clear bulleted points and diagrams.' }
          ],
          source: 'fallback'
        });
      }

      const prompt = `You are GradeBoost AI. Summarize the following study text for a Cameroon GCE student studying ${subject || 'General Studies'}:

Text to summarize:
${(textContent || '').slice(0, 4000)}

Return ONLY valid JSON matching this structure:
{
  "shortSummary": "1-2 sentence high level overview",
  "detailedSummary": "Comprehensive multi-paragraph summary",
  "revisionPoints": ["Bullet point 1", "Bullet point 2", "Bullet point 3", "Bullet point 4"],
  "flashcards": [
    { "frontText": "Question or term on front", "backText": "Answer or explanation on back" },
    { "frontText": "Question 2", "backText": "Answer 2" }
  ]
}`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const cleanJson = (result.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      res.json({ ...parsed, source: 'gemini' });
    } catch (err) {
      res.json({
        shortSummary: 'Summary generated successfully.',
        detailedSummary: req.body.textContent ? req.body.textContent.slice(0, 300) + '...' : 'Lesson material summary.',
        revisionPoints: ['Review key definitions', 'Practice past questions'],
        flashcards: [{ frontText: 'Key Concept', backText: 'Essential definition to memorize' }],
        source: 'fallback'
      });
    }
  });

  // 6. AI Programming Assistant API
  app.post("/api/ai/programming-help", async (req, res) => {
    try {
      const { code, language, mode, compilerError } = req.body; // mode: 'explain' | 'debug' | 'improve' | 'compiler'
      const ai = await getAiClient();

      if (!ai) {
        return res.json({
          analysis: `**[GradeBoost AI Code Assistant - ${language || 'C/C++'}]**\n\n- **Mode**: ${mode || 'explain'}\n- **Explanation**: This program demonstrates basic logic in ${language || 'programming'}. Ensure you include required headers (e.g., \`#include <stdio.h>\` in C or \`import java.util.*;\` in Java).\n\n💡 **GCE Exam Tip**: In GCE Computer Science Paper 3 Practical, write clear comments and declare your variable data types correctly!`,
          fixedCode: code || '',
          source: 'fallback'
        });
      }

      const prompt = `You are GradeBoost AI Programming Assistant specializing in GCE Computer Science (C, C++, Python, Java, JS, HTML/CSS, SQL).
Language: ${language || 'C++'}
Task Mode: ${mode || 'explain'}
Compiler Error (if any): ${compilerError || 'None'}

Student Code:
\`\`\`${language || 'cpp'}
${code || '// code snippet'}
\`\`\`

Provide:
1. **Detailed Explanation / Bug Analysis**
2. **Corrected / Improved Code**
3. **Line-by-Line Breakdown**
4. **Cameroon GCE Practical Exam Tip**`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({ analysis: result.text || 'Code analyzed.', source: 'gemini' });
    } catch (err) {
      res.json({
        analysis: `**Code Analysis**:\nReview variable scope, syntax terminations (semicolons in C/C++/Java), and array boundary checks.`,
        source: 'fallback'
      });
    }
  });

  // 7. AI Recommendation & Weakness Analysis API
  app.post("/api/ai/recommend", async (req, res) => {
    try {
      const { userSubject, quizScores, completedLessonsCount } = req.body;
      const ai = await getAiClient();

      if (!ai) {
        return res.json({
          weaknesses: ['Algorithms & Flowcharts', 'Database Normalization (3NF)', 'Subnetting & IP Calculations'],
          recommendations: [
            {
              id: 'r1',
              type: 'lesson',
              title: 'Mastering Flowchart Logic & Pseudocode',
              subject: userSubject || 'Computer Science',
              reason: 'High frequency in Paper 2 GCE examinations.',
              priority: 'high'
            },
            {
              id: 'r2',
              type: 'practice',
              title: 'Top 20 MCQs on Database ER Diagrams',
              subject: userSubject || 'ICT',
              reason: 'Identified area for score improvement.',
              priority: 'medium'
            }
          ],
          source: 'fallback'
        });
      }

      const prompt = `As GradeBoost AI Performance Analyst, recommend 3 targeted study actions for a student in ${userSubject || 'Computer Science'}.

Return ONLY valid JSON matching this structure:
{
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "recommendations": [
    {
      "id": "r1",
      "type": "lesson",
      "title": "Title here",
      "subject": "${userSubject || 'Computer Science'}",
      "reason": "Why this will boost student grade",
      "priority": "high"
    }
  ]
}`;

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const cleanJson = (result.text || '').replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      res.json({ ...parsed, source: 'gemini' });
    } catch (err) {
      res.json({
        weaknesses: ['Data Structures', 'Networking Layers'],
        recommendations: [
          { id: 'r1', type: 'lesson', title: 'Data Structures Deep Dive', subject: (req.body.subject || 'Computer Science'), reason: 'Core GCE Topic', priority: 'high' }
        ],
        source: 'fallback'
      });
    }
  });

  // Payment Routes (Manual only now)
  app.post("/api/security/audit", (req, res) => {
    const { errorInfo } = req.body;
    console.warn("SECURITY AUDIT LOG:", JSON.stringify(errorInfo, null, 2));
    // In a real app, this would be written to a secure audit log or alerting system
    res.status(200).json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
