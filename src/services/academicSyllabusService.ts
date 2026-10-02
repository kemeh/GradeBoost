/**
 * Edulpha Academic Syllabus & Curriculum Service
 * Full persistence, offline fallback, seed bootstrapping, AI parsing, and admin overrides.
 */

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
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { 
  AcademicStream, 
  AcademicLevel, 
  SyllabusSubject, 
  SyllabusModule, 
  SyllabusTopicModel, 
  StudentTopicProgress,
  TopicPriority
} from '../types/academicSyllabus';
import { 
  SEEDED_ACADEMIC_STREAMS, 
  SEEDED_ACADEMIC_LEVELS, 
  SEEDED_SYLLABUS_SUBJECTS, 
  SEEDED_SYLLABUS_MODULES, 
  SEEDED_SYLLABUS_TOPICS 
} from '../data/authoritativeSyllabusSeed';
import { GoogleGenAI } from '@google/genai';

// In-memory runtime cache for snappy client performance
const syllabusCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes

function getCached<T>(key: string): T | null {
  const item = syllabusCache.get(key);
  if (item && item.expiry > Date.now()) {
    return item.data as T;
  }
  return null;
}

function setCached(key: string, data: any) {
  syllabusCache.set(key, { data, expiry: Date.now() + CACHE_TTL });
}

export function clearSyllabusCache() {
  syllabusCache.clear();
}

// ===============================================================
// 1. ACADEMIC STREAMS
// ===============================================================

export async function fetchAcademicStreams(): Promise<AcademicStream[]> {
  const cached = getCached<AcademicStream[]>('streams');
  if (cached) return cached;

  try {
    const snap = await getDocs(query(collection(db, 'academic_streams')));
    if (snap.empty) {
      // Bootstrap with seed data
      for (const s of SEEDED_ACADEMIC_STREAMS) {
        try {
          await setDoc(doc(db, 'academic_streams', s.id), s);
        } catch (e) {
          console.warn('Could not write seed stream:', e);
        }
      }
      setCached('streams', SEEDED_ACADEMIC_STREAMS);
      return SEEDED_ACADEMIC_STREAMS;
    }
    const streams = snap.docs.map(d => ({ id: d.id, ...d.data() } as AcademicStream));
    streams.sort((a, b) => a.order - b.order);
    setCached('streams', streams);
    return streams;
  } catch (err) {
    console.warn('Error fetching academic_streams, using seeds:', err);
    return SEEDED_ACADEMIC_STREAMS;
  }
}

export async function saveAcademicStream(stream: AcademicStream): Promise<void> {
  clearSyllabusCache();
  await setDoc(doc(db, 'academic_streams', stream.id), {
    ...stream,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteAcademicStream(id: string): Promise<void> {
  clearSyllabusCache();
  await deleteDoc(doc(db, 'academic_streams', id));
}

// ===============================================================
// 2. ACADEMIC LEVELS
// ===============================================================

export async function fetchAcademicLevels(streamId?: string): Promise<AcademicLevel[]> {
  const cacheKey = `levels_${streamId || 'all'}`;
  const cached = getCached<AcademicLevel[]>(cacheKey);
  if (cached) return cached;

  try {
    let q = query(collection(db, 'academic_levels'));
    if (streamId) {
      q = query(collection(db, 'academic_levels'), where('streamId', '==', streamId));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      const filteredSeeds = streamId 
        ? SEEDED_ACADEMIC_LEVELS.filter(l => l.streamId === streamId)
        : SEEDED_ACADEMIC_LEVELS;

      for (const l of SEEDED_ACADEMIC_LEVELS) {
        try {
          await setDoc(doc(db, 'academic_levels', l.id), l);
        } catch (e) {
          console.warn('Could not write seed level:', e);
        }
      }
      setCached(cacheKey, filteredSeeds);
      return filteredSeeds;
    }
    const levels = snap.docs.map(d => ({ id: d.id, ...d.data() } as AcademicLevel));
    levels.sort((a, b) => a.order - b.order);
    setCached(cacheKey, levels);
    return levels;
  } catch (err) {
    console.warn('Error fetching academic_levels, using seeds:', err);
    const fallback = streamId 
      ? SEEDED_ACADEMIC_LEVELS.filter(l => l.streamId === streamId)
      : SEEDED_ACADEMIC_LEVELS;
    return fallback;
  }
}

export async function saveAcademicLevel(level: AcademicLevel): Promise<void> {
  clearSyllabusCache();
  await setDoc(doc(db, 'academic_levels', level.id), {
    ...level,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteAcademicLevel(id: string): Promise<void> {
  clearSyllabusCache();
  await deleteDoc(doc(db, 'academic_levels', id));
}

// ===============================================================
// 3. SYLLABUS SUBJECTS
// ===============================================================

export async function fetchSyllabusSubjects(streamId?: string, levelId?: string): Promise<SyllabusSubject[]> {
  const cacheKey = `subjects_${streamId || 'all'}_${levelId || 'all'}`;
  const cached = getCached<SyllabusSubject[]>(cacheKey);
  if (cached) return cached;

  try {
    let q = query(collection(db, 'syllabus_subjects'));
    if (streamId && levelId) {
      q = query(collection(db, 'syllabus_subjects'), where('streamId', '==', streamId), where('levelId', '==', levelId));
    } else if (streamId) {
      q = query(collection(db, 'syllabus_subjects'), where('streamId', '==', streamId));
    } else if (levelId) {
      q = query(collection(db, 'syllabus_subjects'), where('levelId', '==', levelId));
    }

    const snap = await getDocs(q);
    if (snap.empty) {
      let filtered = SEEDED_SYLLABUS_SUBJECTS;
      if (streamId) filtered = filtered.filter(s => s.streamId === streamId);
      if (levelId) filtered = filtered.filter(s => s.levelId === levelId);

      for (const s of SEEDED_SYLLABUS_SUBJECTS) {
        try {
          await setDoc(doc(db, 'syllabus_subjects', s.id), s);
        } catch (e) {
          console.warn('Could not write seed subject:', e);
        }
      }
      setCached(cacheKey, filtered);
      return filtered;
    }

    const subjects = snap.docs.map(d => ({ id: d.id, ...d.data() } as SyllabusSubject));
    subjects.sort((a, b) => (a.order || 0) - (b.order || 0));
    setCached(cacheKey, subjects);
    return subjects;
  } catch (err) {
    console.warn('Error fetching syllabus_subjects, using seeds:', err);
    let fallback = SEEDED_SYLLABUS_SUBJECTS;
    if (streamId) fallback = fallback.filter(s => s.streamId === streamId);
    if (levelId) fallback = fallback.filter(s => s.levelId === levelId);
    return fallback;
  }
}

export async function saveSyllabusSubject(subject: SyllabusSubject): Promise<void> {
  clearSyllabusCache();
  await setDoc(doc(db, 'syllabus_subjects', subject.id), {
    ...subject,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteSyllabusSubject(id: string): Promise<void> {
  clearSyllabusCache();
  await deleteDoc(doc(db, 'syllabus_subjects', id));
}

// ===============================================================
// 4. SYLLABUS MODULES
// ===============================================================

export async function fetchSyllabusModules(subjectId?: string): Promise<SyllabusModule[]> {
  const cacheKey = `modules_${subjectId || 'all'}`;
  const cached = getCached<SyllabusModule[]>(cacheKey);
  if (cached) return cached;

  try {
    let q = query(collection(db, 'syllabus_modules'));
    if (subjectId) {
      q = query(collection(db, 'syllabus_modules'), where('subjectId', '==', subjectId));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      const filtered = subjectId 
        ? SEEDED_SYLLABUS_MODULES.filter(m => m.subjectId === subjectId)
        : SEEDED_SYLLABUS_MODULES;

      for (const m of SEEDED_SYLLABUS_MODULES) {
        try {
          await setDoc(doc(db, 'syllabus_modules', m.id), m);
        } catch (e) {
          console.warn('Could not write seed module:', e);
        }
      }
      setCached(cacheKey, filtered);
      return filtered;
    }

    const modules = snap.docs.map(d => ({ id: d.id, ...d.data() } as SyllabusModule));
    modules.sort((a, b) => a.order - b.order);
    setCached(cacheKey, modules);
    return modules;
  } catch (err) {
    console.warn('Error fetching syllabus_modules, using seeds:', err);
    const fallback = subjectId 
      ? SEEDED_SYLLABUS_MODULES.filter(m => m.subjectId === subjectId)
      : SEEDED_SYLLABUS_MODULES;
    return fallback;
  }
}

export async function saveSyllabusModule(mod: SyllabusModule): Promise<void> {
  clearSyllabusCache();
  await setDoc(doc(db, 'syllabus_modules', mod.id), {
    ...mod,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteSyllabusModule(id: string): Promise<void> {
  clearSyllabusCache();
  await deleteDoc(doc(db, 'syllabus_modules', id));
}

// ===============================================================
// 5. SYLLABUS TOPICS
// ===============================================================

export async function fetchSyllabusTopics(subjectId?: string, moduleId?: string): Promise<SyllabusTopicModel[]> {
  const cacheKey = `topics_${subjectId || 'all'}_${moduleId || 'all'}`;
  const cached = getCached<SyllabusTopicModel[]>(cacheKey);
  if (cached) return cached;

  try {
    let q = query(collection(db, 'syllabus_topics'));
    if (subjectId && moduleId) {
      q = query(collection(db, 'syllabus_topics'), where('subjectId', '==', subjectId), where('moduleId', '==', moduleId));
    } else if (subjectId) {
      q = query(collection(db, 'syllabus_topics'), where('subjectId', '==', subjectId));
    } else if (moduleId) {
      q = query(collection(db, 'syllabus_topics'), where('moduleId', '==', moduleId));
    }

    const snap = await getDocs(q);
    if (snap.empty) {
      let filtered = SEEDED_SYLLABUS_TOPICS;
      if (subjectId) filtered = filtered.filter(t => t.subjectId === subjectId);
      if (moduleId) filtered = filtered.filter(t => t.moduleId === moduleId);

      for (const t of SEEDED_SYLLABUS_TOPICS) {
        try {
          await setDoc(doc(db, 'syllabus_topics', t.id), t);
        } catch (e) {
          console.warn('Could not write seed topic:', e);
        }
      }
      setCached(cacheKey, filtered);
      return filtered;
    }

    const topics = snap.docs.map(d => ({ id: d.id, ...d.data() } as SyllabusTopicModel));
    topics.sort((a, b) => a.order - b.order);
    setCached(cacheKey, topics);
    return topics;
  } catch (err) {
    console.warn('Error fetching syllabus_topics, using seeds:', err);
    let fallback = SEEDED_SYLLABUS_TOPICS;
    if (subjectId) fallback = fallback.filter(t => t.subjectId === subjectId);
    if (moduleId) fallback = fallback.filter(t => t.moduleId === moduleId);
    return fallback;
  }
}

export async function saveSyllabusTopic(topic: SyllabusTopicModel): Promise<void> {
  clearSyllabusCache();
  await setDoc(doc(db, 'syllabus_topics', topic.id), {
    ...topic,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function deleteSyllabusTopic(id: string): Promise<void> {
  clearSyllabusCache();
  await deleteDoc(doc(db, 'syllabus_topics', id));
}

export async function reorderSyllabusTopics(topicIds: string[]): Promise<void> {
  clearSyllabusCache();
  for (let i = 0; i < topicIds.length; i++) {
    const id = topicIds[i];
    await updateDoc(doc(db, 'syllabus_topics', id), {
      order: i + 1,
      updatedAt: serverTimestamp()
    });
  }
}

/**
 * Admin manual priority override for a topic
 */
export async function adminOverrideTopicPriority(
  topicId: string,
  newPriority: TopicPriority,
  newScore: number,
  reason: string
): Promise<void> {
  clearSyllabusCache();
  await updateDoc(doc(db, 'syllabus_topics', topicId), {
    priority: newPriority,
    priorityScore: newScore,
    prioritySource: 'ADMIN',
    priorityReason: `[Admin Override]: ${reason}`,
    lastReviewed: new Date().toISOString(),
    updatedAt: serverTimestamp()
  });
}

// ===============================================================
// 6. STUDENT TOPIC PROGRESS
// ===============================================================

export async function fetchStudentTopicProgress(userId: string, subjectId?: string): Promise<StudentTopicProgress[]> {
  try {
    let q = query(collection(db, 'student_topic_progress'), where('userId', '==', userId));
    if (subjectId) {
      q = query(collection(db, 'student_topic_progress'), where('userId', '==', userId), where('subjectId', '==', subjectId));
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as StudentTopicProgress));
  } catch (err) {
    console.warn('Error fetching student_topic_progress:', err);
    return [];
  }
}

export async function updateStudentTopicProgress(
  userId: string,
  topicId: string,
  subjectId: string,
  updates: Partial<StudentTopicProgress>
): Promise<void> {
  const docId = `${userId}_${topicId}`;
  const ref = doc(db, 'student_topic_progress', docId);
  const snap = await getDoc(ref);

  if (snap.exists()) {
    await updateDoc(ref, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } else {
    await setDoc(ref, {
      id: docId,
      userId,
      topicId,
      subjectId,
      masteryScore: 0,
      personalPriority: 'HIGH',
      personalPriorityScore: 75,
      personalPriorityReason: 'Newly initiated topic',
      status: 'in_progress',
      questionsAttempted: 0,
      questionsCorrect: 0,
      repeatedMistakesCount: 0,
      notesRead: false,
      studyTimeSpentMinutes: 0,
      ...updates,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  }
}

// ===============================================================
// 7. BULK SYLLABUS IMPORT & AI EXTRACTION
// ===============================================================

export interface ExtractedSyllabusDraft {
  streamName: string;
  levelName: string;
  subjectName: string;
  modules: Array<{
    moduleNumber: string;
    title: string;
    topics: Array<{
      topicName: string;
      description: string;
      subtopics: string[];
      learningObjectives: string[];
      paperRelevance: ('Paper 1' | 'Paper 2' | 'Paper 3')[];
      difficulty: 'Introductory' | 'Standard' | 'Advanced' | 'Challenging';
      estimatedStudyTimeMinutes: number;
    }>;
  }>;
}

/**
 * Parses raw curriculum content using structured heuristics or Gemini
 */
export async function parseBulkSyllabusDocument(
  fileContent: string,
  fileName: string
): Promise<ExtractedSyllabusDraft> {
  // If JSON format
  if (fileName.endsWith('.json')) {
    try {
      const parsed = JSON.parse(fileContent);
      if (parsed.subjectName && Array.isArray(parsed.modules)) {
        return parsed as ExtractedSyllabusDraft;
      }
    } catch (e) {
      // Continue to AI parsing
    }
  }

  // Use Gemini SDK for intelligent extraction if available
  const apiKey = process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? (window as any).__GEMINI_API_KEY__ : '');
  
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a Cameroon GCE Curriculum and Syllabus Extraction Specialist.
Extract the academic syllabus structure from the provided text into a valid JSON object strictly matching this TypeScript structure:
{
  "streamName": "General Education" | "Technical Education" | "Commercial Education",
  "levelName": "Ordinary Level" | "Advanced Level",
  "subjectName": string,
  "modules": [
    {
      "moduleNumber": "Module 1",
      "title": string,
      "topics": [
        {
          "topicName": string,
          "description": string,
          "subtopics": ["subtopic 1", "subtopic 2"],
          "learningObjectives": ["objective 1", "objective 2"],
          "paperRelevance": ["Paper 1", "Paper 2"],
          "difficulty": "Standard",
          "estimatedStudyTimeMinutes": 120
        }
      ]
    }
  ]
}

Document Content:
${fileContent.slice(0, 15000)}

Respond with ONLY the JSON object, no Markdown backticks or commentary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson) as ExtractedSyllabusDraft;
    } catch (err) {
      console.warn('AI syllabus parsing failed, using fallback rule-based parser:', err);
    }
  }

  // Fallback rule-based parser for text / CSV
  const lines = fileContent.split('\n').map(l => l.trim()).filter(Boolean);
  const draft: ExtractedSyllabusDraft = {
    streamName: 'General Education',
    levelName: 'Advanced Level',
    subjectName: fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
    modules: [
      {
        moduleNumber: 'Module 1',
        title: 'Core Syllabus Concepts',
        topics: lines.slice(0, 8).map((line, idx) => ({
          topicName: line.replace(/^[0-9.-]+\s*/, ''),
          description: `Extracted syllabus content from ${fileName}.`,
          subtopics: ['Core concept', 'Application', 'Problem solving'],
          learningObjectives: [`Understand ${line}`, `Apply ${line} in GCE-style problems`],
          paperRelevance: ['Paper 1', 'Paper 2'],
          difficulty: 'Standard',
          estimatedStudyTimeMinutes: 120
        }))
      }
    ]
  };

  return draft;
}

/**
 * Commits approved draft topics into authoritative Firestore collections
 * Automatically labels provisional if unapproved, or authoritative if approved
 */
export async function commitImportedSyllabus(
  draft: ExtractedSyllabusDraft,
  streamId: string,
  levelId: string,
  subjectId: string,
  approvedByAdmin: boolean
): Promise<{ importedTopicsCount: number; moduleIdList: string[] }> {
  clearSyllabusCache();
  let count = 0;
  const moduleIds: string[] = [];

  for (let mIdx = 0; mIdx < draft.modules.length; mIdx++) {
    const mod = draft.modules[mIdx];
    const modId = `${subjectId}_mod_${mIdx + 1}`;
    moduleIds.push(modId);

    const moduleRecord: SyllabusModule = {
      id: modId,
      subjectId,
      streamId,
      levelId,
      moduleNumber: mod.moduleNumber || `Module ${mIdx + 1}`,
      title: mod.title,
      order: mIdx + 1
    };
    await setDoc(doc(db, 'syllabus_modules', modId), moduleRecord, { merge: true });

    for (let tIdx = 0; tIdx < mod.topics.length; tIdx++) {
      const top = mod.topics[tIdx];
      const topId = `${modId}_top_${tIdx + 1}`;

      const topicRecord: SyllabusTopicModel = {
        id: topId,
        subjectId,
        subjectName: draft.subjectName,
        streamId,
        levelId,
        moduleId: modId,
        moduleTitle: mod.title,
        topicName: top.topicName,
        code: `${draft.subjectName.substring(0, 3).toUpperCase()}-T${mIdx + 1}.${tIdx + 1}`,
        description: top.description || `Syllabus topic for ${top.topicName}`,
        subtopics: (top.subtopics || []).map((s, sIdx) => ({ id: `sub_${topId}_${sIdx}`, name: s })),
        learningObjectives: top.learningObjectives || [],
        importantConcepts: [],
        paperRelevance: top.paperRelevance || ['Paper 1', 'Paper 2'],
        priority: 'MEDIUM',
        priorityScore: 65,
        prioritySource: approvedByAdmin ? 'ADMIN' : 'AI_SUGGESTED',
        priorityReason: approvedByAdmin 
          ? 'Approved from imported curriculum syllabus.' 
          : 'AI-generated syllabus classification — Review required',
        priorityBreakdown: {
          curriculumWeight: 70,
          gceFrequency: 60,
          gceMarksWeight: 60,
          paperCoverage: 70,
          prerequisiteImportance: 65
        },
        difficulty: top.difficulty || 'Standard',
        prerequisites: [],
        estimatedStudyTimeMinutes: top.estimatedStudyTimeMinutes || 120,
        pastQuestionCount: 0,
        pastQuestionsList: [],
        questionCount: 0,
        order: tIdx + 1,
        status: approvedByAdmin ? 'active' : 'provisional',
        isOfficialSyllabus: approvedByAdmin,
        lastReviewed: new Date().toISOString()
      };

      await setDoc(doc(db, 'syllabus_topics', topId), topicRecord, { merge: true });
      count++;
    }
  }

  return { importedTopicsCount: count, moduleIdList: moduleIds };
}
