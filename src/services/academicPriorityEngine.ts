/**
 * Edulpha Academic Priority & Intelligent Revision Recommendation Engine
 * Evidence-based scoring using Cameroon GCE syllabus weights and past examination data.
 */

import { 
  TopicPriority, 
  TopicPriorityBreakdown, 
  SyllabusTopicModel, 
  StudentTopicProgress, 
  StudyRecommendation,
  TopicGapAnalysis
} from '../types/academicSyllabus';

export interface PriorityCalculationWeights {
  curriculumWeight: number; // default 0.25
  gceFrequency: number;     // default 0.30
  gceMarksWeight: number;   // default 0.20
  paperCoverage: number;    // default 0.15
  prerequisiteImportance: number; // default 0.10
}

export const DEFAULT_PRIORITY_WEIGHTS: PriorityCalculationWeights = {
  curriculumWeight: 0.25,
  gceFrequency: 0.30,
  gceMarksWeight: 0.20,
  paperCoverage: 0.15,
  prerequisiteImportance: 0.10
};

export const PRIORITY_THRESHOLDS = {
  CRITICAL: 90,
  HIGH: 75,
  MEDIUM: 50,
  LOW: 0
};

/**
 * Maps a numeric score (0 - 100) to its priority classification
 */
export function scoreToPriority(score: number): TopicPriority {
  if (score >= PRIORITY_THRESHOLDS.CRITICAL) return 'CRITICAL';
  if (score >= PRIORITY_THRESHOLDS.HIGH) return 'HIGH';
  if (score >= PRIORITY_THRESHOLDS.MEDIUM) return 'MEDIUM';
  return 'LOW';
}

/**
 * Returns compliant academic wording that never predicts future exams
 */
export function getPriorityWording(priority: TopicPriority, score: number, pastQuestionsCount: number): string {
  switch (priority) {
    case 'CRITICAL':
      return `High-priority revision topic. This topic carries substantial examination relevance based on ${pastQuestionsCount} verified past GCE sessions and syllabus weighting. (Score: ${Math.round(score)}/100)`;
    case 'HIGH':
      return `Important syllabus focus. Frequently examined across multiple past papers and essential for comprehensive GCE readiness. (Score: ${Math.round(score)}/100)`;
    case 'MEDIUM':
      return `Standard examination topic. Steady representation in past papers with regular multiple-choice and structured sub-questions. (Score: ${Math.round(score)}/100)`;
    case 'LOW':
    default:
      return `Foundational or introductory topic. Provides conceptual groundwork necessary for higher-level syllabus topics. (Score: ${Math.round(score)}/100)`;
  }
}

/**
 * Computes Global Syllabus Priority using evidence from past GCE papers and curriculum structure
 */
export function calculateGlobalTopicPriority(
  breakdown: TopicPriorityBreakdown,
  weights: PriorityCalculationWeights = DEFAULT_PRIORITY_WEIGHTS
): { score: number; priority: TopicPriority } {
  const rawScore = 
    (breakdown.curriculumWeight * weights.curriculumWeight) +
    (breakdown.gceFrequency * weights.gceFrequency) +
    (breakdown.gceMarksWeight * weights.gceMarksWeight) +
    (breakdown.paperCoverage * weights.paperCoverage) +
    (breakdown.prerequisiteImportance * weights.prerequisiteImportance);

  const normalized = Math.min(100, Math.max(0, Math.round(rawScore)));
  return {
    score: normalized,
    priority: scoreToPriority(normalized)
  };
}

/**
 * Computes Personal Study Priority for a specific student.
 * Combines global topic priority with individual student performance and error frequency.
 */
export function calculatePersonalStudyPriority(
  topic: SyllabusTopicModel,
  studentProgress?: StudentTopicProgress
): { personalScore: number; personalPriority: TopicPriority; reason: string } {
  const globalScore = topic.priorityScore;

  if (!studentProgress) {
    return {
      personalScore: globalScore,
      personalPriority: topic.priority,
      reason: `Global syllabus priority based on verified past GCE frequency (${topic.pastQuestionCount} verified questions).`
    };
  }

  const masteryScore = studentProgress.masteryScore || 0;
  const weaknessFactor = Math.max(0, 100 - masteryScore); // 0 to 100
  const mistakeBonus = Math.min(25, (studentProgress.repeatedMistakesCount || 0) * 5); // up to +25 for frequent mistakes

  // Personal score combines global syllabus priority (55%) with student's individual weakness (35%) and mistakes (10%)
  const personalScoreRaw = (globalScore * 0.55) + (weaknessFactor * 0.35) + mistakeBonus;
  const personalScore = Math.min(100, Math.max(0, Math.round(personalScoreRaw)));
  const personalPriority = scoreToPriority(personalScore);

  let reason = '';
  if (masteryScore < 50 && topic.priority === 'CRITICAL') {
    reason = `CRITICAL personal priority: High examination relevance in past GCE papers combined with low student mastery (${masteryScore}%). Immediate revision strongly recommended.`;
  } else if (studentProgress.repeatedMistakesCount > 2) {
    reason = `Elevated personal priority due to repeated errors (${studentProgress.repeatedMistakesCount} detected) in daily drills and practice.`;
  } else if (masteryScore >= 80) {
    reason = `Well-mastered topic (${masteryScore}%). Periodic light revision recommended to maintain retention.`;
  } else {
    reason = `Active study topic based on syllabus progression and standard exam weighting.`;
  }

  return { personalScore, personalPriority, reason };
}

/**
 * Generates intelligent "WHAT TO STUDY TODAY" recommendations with smart topic rotation.
 * Rotates between critical topics, student weaknesses, and unstudied syllabus areas.
 */
export function generateDailyStudyRecommendations(
  topics: SyllabusTopicModel[],
  progressMap: Map<string, StudentTopicProgress>,
  maxRecommendations: number = 4
): StudyRecommendation[] {
  if (!topics || topics.length === 0) return [];

  // Sort topics by Personal Study Priority descending
  const evaluatedTopics = topics.map(t => {
    const prog = progressMap.get(t.id);
    const { personalScore, personalPriority, reason } = calculatePersonalStudyPriority(t, prog);
    const mastery = prog ? prog.masteryScore : 0;
    
    // Check prerequisites
    const prerequisitesMet = t.prerequisites.length === 0 || t.prerequisites.every(preName => {
      const preTopic = topics.find(other => other.topicName.toLowerCase() === preName.toLowerCase() || other.id === preName);
      if (!preTopic) return true;
      const preProg = progressMap.get(preTopic.id);
      return (preProg?.masteryScore || 0) >= 60;
    });

    return {
      topic: t,
      personalScore,
      personalPriority,
      reason,
      mastery,
      prerequisitesMet,
      status: prog?.status || 'not_started'
    };
  });

  // Balanced rotation: Prioritize high-priority topics with unmet mastery, but include rotation across modules
  const chosen: StudyRecommendation[] = [];
  const coveredModules = new Set<string>();

  // Pass 1: Highest priority topics with prerequisites met and mastery < 80%
  const candidatePool = evaluatedTopics
    .filter(item => item.prerequisitesMet && item.mastery < 80)
    .sort((a, b) => b.personalScore - a.personalScore);

  for (const item of candidatePool) {
    if (chosen.length >= maxRecommendations) break;

    // Favor module diversity to avoid boring the student
    if (!coveredModules.has(item.topic.moduleId) || candidatePool.length <= maxRecommendations) {
      coveredModules.add(item.topic.moduleId);
      
      let action: StudyRecommendation['recommendedAction'] = 'practice_past_questions';
      if (item.mastery < 30) action = 'read_notes';
      else if (item.mastery < 65) action = 'daily_drill';
      else action = 'topic_quiz';

      chosen.push({
        topicId: item.topic.id,
        topicName: item.topic.topicName,
        subjectId: item.topic.subjectId,
        subjectName: item.topic.subjectName,
        moduleTitle: item.topic.moduleTitle,
        paper: item.topic.paperRelevance[0] || 'Paper 2',
        priority: item.personalPriority,
        priorityScore: item.personalScore,
        reason: item.reason,
        estimatedMinutes: Math.min(45, Math.max(15, Math.round(item.topic.estimatedStudyTimeMinutes / 4))),
        recommendedAction: action,
        masteryScore: item.mastery,
        prerequisitesMet: item.prerequisitesMet
      });
    }
  }

  // Pass 2: If we still have slots, fill from remaining topics
  if (chosen.length < maxRecommendations) {
    for (const item of evaluatedTopics) {
      if (chosen.length >= maxRecommendations) break;
      if (!chosen.some(c => c.topicId === item.topic.id)) {
        chosen.push({
          topicId: item.topic.id,
          topicName: item.topic.topicName,
          subjectId: item.topic.subjectId,
          subjectName: item.topic.subjectName,
          moduleTitle: item.topic.moduleTitle,
          paper: item.topic.paperRelevance[0] || 'Paper 1',
          priority: item.personalPriority,
          priorityScore: item.personalScore,
          reason: item.reason,
          estimatedMinutes: 20,
          recommendedAction: 'topic_quiz',
          masteryScore: item.mastery,
          prerequisitesMet: item.prerequisitesMet
        });
      }
    }
  }

  return chosen;
}

/**
 * Calculates overall syllabus coverage metrics for a student in a subject
 */
export function calculateSyllabusCoverage(
  topics: SyllabusTopicModel[],
  progressMap: Map<string, StudentTopicProgress>
): {
  totalTopics: number;
  introducedCount: number;
  practicedCount: number;
  masteredCount: number;
  requiresRevisionCount: number;
  neverStudiedCount: number;
  overallCoveragePercent: number;
  averageMasteryPercent: number;
} {
  const totalTopics = topics.length;
  if (totalTopics === 0) {
    return {
      totalTopics: 0,
      introducedCount: 0,
      practicedCount: 0,
      masteredCount: 0,
      requiresRevisionCount: 0,
      neverStudiedCount: 0,
      overallCoveragePercent: 0,
      averageMasteryPercent: 0
    };
  }

  let introduced = 0;
  let practiced = 0;
  let mastered = 0;
  let requiresRevision = 0;
  let neverStudied = 0;
  let totalMastery = 0;

  for (const topic of topics) {
    const prog = progressMap.get(topic.id);
    if (!prog || prog.status === 'not_started') {
      neverStudied++;
    } else {
      introduced++;
      totalMastery += prog.masteryScore;
      if (prog.questionsAttempted > 0) practiced++;
      if (prog.masteryScore >= 75) mastered++;
      else if (prog.masteryScore < 50 || prog.repeatedMistakesCount > 1) requiresRevision++;
    }
  }

  return {
    totalTopics,
    introducedCount: introduced,
    practicedCount: practiced,
    masteredCount: mastered,
    requiresRevisionCount: requiresRevision,
    neverStudiedCount: neverStudied,
    overallCoveragePercent: Math.round((introduced / totalTopics) * 100),
    averageMasteryPercent: introduced > 0 ? Math.round(totalMastery / introduced) : 0
  };
}

/**
 * Generates Topic Gap Analysis for administrators to identify content shortages
 */
export function generateAdminTopicGapAnalysis(
  topics: SyllabusTopicModel[],
  progressList: StudentTopicProgress[] = []
): TopicGapAnalysis[] {
  return topics.map(t => {
    const relevantProgress = progressList.filter(p => p.topicId === t.id);
    const avgMastery = relevantProgress.length > 0
      ? Math.round(relevantProgress.reduce((sum, p) => sum + p.masteryScore, 0) / relevantProgress.length)
      : 50;

    const totalAttempts = relevantProgress.reduce((sum, p) => sum + p.questionsAttempted, 0);
    const totalCorrect = relevantProgress.reduce((sum, p) => sum + p.questionsCorrect, 0);
    const errorRate = totalAttempts > 0 ? Math.round(((totalAttempts - totalCorrect) / totalAttempts) * 100) : 0;

    const missingFlags: string[] = [];
    if (t.questionCount < 10) missingFlags.push('Insufficient Question Bank (< 10 questions)');
    if (t.pastQuestionCount === 0) missingFlags.push('No Past GCE Questions Linked');
    if (!t.revisionNotesSummary && t.learningObjectives.length === 0) missingFlags.push('Missing Learning Objectives');

    return {
      topicId: t.id,
      topicName: t.topicName,
      subjectName: t.subjectName,
      levelName: t.levelId,
      streamName: t.streamId,
      priority: t.priority,
      priorityScore: t.priorityScore,
      questionCount: t.questionCount,
      pastQuestionCount: t.pastQuestionCount,
      hasRevisionNotes: Boolean(t.revisionNotesSummary || t.learningObjectives.length > 0),
      averageStudentMastery: avgMastery,
      studentErrorRate: errorRate,
      missingContentFlags: missingFlags
    };
  });
}
