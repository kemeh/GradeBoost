import {
  AnalyticsEvent,
  PlatformOverviewMetrics,
  CurriculumAnalyticsItem,
  StudentAnalyticsData,
  TeacherAnalyticsData,
  ContentAnalyticsData,
  AIAnalyticsData,
  PaymentAnalyticsData,
  GeneratedReport,
  AnalyticsFilter,
} from '../types';

// Storage Key for Analytics Events
const ANALYTICS_EVENTS_KEY = 'edulpha_analytics_events';
const GENERATED_REPORTS_KEY = 'edulpha_generated_reports';

export class AnalyticsService {
  // Track an analytics event
  static logEvent(
    action: string,
    category: AnalyticsEvent['category'],
    metadata?: Record<string, any>,
    userRole?: 'student' | 'teacher' | 'admin',
    language: 'en' | 'fr' = 'en',
    curriculum?: string,
    level?: string
  ): AnalyticsEvent {
    const events = this.getLoggedEvents();
    const newEvent: AnalyticsEvent = {
      id: 'event_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId: metadata?.userId || 'guest',
      userRole: userRole || 'student',
      action,
      category,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      language,
      curriculum: curriculum || 'GCE Ordinary Level',
      level: level || 'O-Level',
    };
    events.unshift(newEvent);
    if (events.length > 500) events.pop();
    try {
      localStorage.setItem(ANALYTICS_EVENTS_KEY, JSON.stringify(events));
    } catch (e) {
      console.error('Failed to save analytics event', e);
    }
    return newEvent;
  }

  static getLoggedEvents(): AnalyticsEvent[] {
    try {
      const stored = localStorage.getItem(ANALYTICS_EVENTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  }

  // Get Platform Overview Analytics
  static getPlatformOverview(filter?: AnalyticsFilter): PlatformOverviewMetrics {
    return {
      totalUsers: 14850,
      activeUsers: 8420,
      newRegistrations: 1240,
      studentsCount: 13200,
      teachersCount: 1450,
      adminsCount: 200,
      premiumUsers: 9150,
      freeUsers: 5700,
      dau: 4320,
      wau: 9180,
      mau: 13450,
      userRetentionRate: 84.6,
      englishUsersCount: 8900,
      frenchUsersCount: 5950,
    };
  }

  // Get Curriculum Analytics (English vs French, Sub-levels)
  static getCurriculumAnalytics(filter?: AnalyticsFilter): CurriculumAnalyticsItem[] {
    return [
      {
        curriculum: 'GCE Ordinary Level (English)',
        activeUsers: 4850,
        completedLessons: 34200,
        avgScore: 74.5,
        popularSubjects: ['Mathematics', 'Physics', 'Biology', 'English Language', 'Chemistry'],
      },
      {
        curriculum: 'GCE Advanced Level (English)',
        activeUsers: 3950,
        completedLessons: 28900,
        avgScore: 71.2,
        popularSubjects: ['Pure Maths', 'Further Maths', 'Physics', 'Economics', 'Chemistry'],
      },
      {
        curriculum: 'BEPC (French)',
        activeUsers: 2450,
        completedLessons: 18400,
        avgScore: 76.8,
        popularSubjects: ['Mathématiques', 'Physique-Chimie-Technologie', 'SVT', 'Français'],
      },
      {
        curriculum: 'Seconde (French)',
        activeUsers: 1120,
        completedLessons: 9100,
        avgScore: 69.4,
        popularSubjects: ['Mathématiques', 'Sciences Physiques', 'SVT', 'Histoire-Géo'],
      },
      {
        curriculum: 'Première (French)',
        activeUsers: 1380,
        completedLessons: 11500,
        avgScore: 72.1,
        popularSubjects: ['Mathématiques', 'Physique-Chimie', 'Français', 'Philosophie'],
      },
      {
        curriculum: 'Terminale (French)',
        activeUsers: 1100,
        completedLessons: 14200,
        avgScore: 68.9,
        popularSubjects: ['Mathématiques C/D', 'Physique-Chimie', 'SVT', 'Philosophie'],
      },
    ];
  }

  // Get Student Specific Analytics
  static getStudentAnalytics(userId: string): StudentAnalyticsData {
    return {
      userId,
      studyTimeMinutes: 1840,
      lessonsCompleted: 42,
      quizAvgScore: 82.4,
      examAvgScore: 78.5,
      strongSubjects: ['Mathematics', 'Physics', 'Chemistry'],
      weakSubjects: ['Organic Chemistry II', 'Vector Algebra', 'Complex Numbers'],
      learningStreak: 14,
      progressPercentage: 68.5,
      achievementsUnlocked: 18,
      ranking: 42,
      totalStudentsInCohort: 1250,
      recommendedTopics: [
        'Mechanics & Dynamics Revision',
        'Reaction Kinetics Practice Paper',
        'Calculus Integration Techniques',
      ],
      suggestedPractice: [
        '2024 GCE A-Level Physics Paper 2 - Q4 to Q8',
        'Terminale Mathématiques - Probabilités & Logarithmes',
      ],
      performanceHistory: [
        { date: 'Mon', score: 72, studyMinutes: 45 },
        { date: 'Tue', score: 85, studyMinutes: 90 },
        { date: 'Wed', score: 78, studyMinutes: 60 },
        { date: 'Thu', score: 91, studyMinutes: 120 },
        { date: 'Fri', score: 88, studyMinutes: 75 },
        { date: 'Sat', score: 94, studyMinutes: 140 },
        { date: 'Sun', score: 84, studyMinutes: 80 },
      ],
    };
  }

  // Get Teacher Specific Analytics
  static getTeacherAnalytics(teacherId: string): TeacherAnalyticsData {
    return {
      teacherId,
      totalStudentsReached: 1840,
      totalLessonViews: 14250,
      lessonCompletionRate: 88.2,
      avgQuizPerformance: 76.5,
      assignmentSubmissions: 412,
      topicDifficultyMap: [
        { topic: 'Electromagnetism & Induction', subject: 'Physics', avgScore: 54.2, failCount: 142 },
        { topic: 'Stereochemistry & Enantiomers', subject: 'Chemistry', avgScore: 58.7, failCount: 118 },
        { topic: 'Integration by Parts', subject: 'Mathematics', avgScore: 61.0, failCount: 95 },
        { topic: 'Matrices & Transformations', subject: 'Mathematics', avgScore: 84.5, failCount: 22 },
      ],
      frequentlyAskedQuestions: [
        { question: 'How to calculate magnetic flux density in solenoid coils?', count: 68 },
        { question: 'What is the key difference between Sn1 and Sn2 reactions?', count: 54 },
        { question: 'When should integration by substitution vs by parts be used?', count: 49 },
      ],
    };
  }

  // Get Content Performance Analytics
  static getContentAnalytics(): ContentAnalyticsData {
    return {
      totalLessons: 450,
      lessonViews: 184500,
      lessonCompletions: 142000,
      lessonDownloads: 28400,
      avgRating: 4.8,
      bookmarksCount: 38900,
      videoViews: 98400,
      avgWatchDurationMinutes: 18.5,
      documentDownloads: 45200,
      topLessons: [
        { id: 'les_1', title: 'Calculus: Fundamental Theorem & Derivatives', views: 18400, rating: 4.9 },
        { id: 'les_2', title: 'GCE Physics: Electric Fields & Capacitance', views: 16200, rating: 4.8 },
        { id: 'les_3', title: 'Terminale C/D: Logarithmes et Exponentielles', views: 14900, rating: 4.9 },
        { id: 'les_4', title: 'BEPC: Circuits Électriques et Puissance', views: 12800, rating: 4.7 },
      ],
    };
  }

  // Get AI Analytics
  static getAIAnalytics(): AIAnalyticsData {
    return {
      totalConversations: 48900,
      questionsAsked: 142800,
      mostRequestedSubjects: [
        { subject: 'Mathematics', count: 45200 },
        { subject: 'Physics', count: 34100 },
        { subject: 'Chemistry', count: 28900 },
        { subject: 'Biology', count: 18400 },
        { subject: 'SVT / French', count: 16200 },
      ],
      aiUsageByCurriculum: [
        { curriculum: 'GCE Ordinary Level', queries: 48900 },
        { curriculum: 'GCE Advanced Level', queries: 41200 },
        { curriculum: 'Terminale', queries: 24500 },
        { curriculum: 'BEPC', queries: 18200 },
        { curriculum: 'Première & Seconde', queries: 10000 },
      ],
      tokenConsumption: 18450000,
      avgResponseRating: 4.85,
      popularFeatures: [
        { feature: 'Instant Step-by-Step Solver', usageCount: 54200 },
        { feature: 'Bilingual Explanations (EN/FR)', usageCount: 38900 },
        { feature: 'Past Paper Marking & Feedback', usageCount: 29400 },
        { feature: 'Exam Readiness Quiz Generator', usageCount: 20300 },
      ],
    };
  }

  // Get Payment & Revenue Analytics
  static getPaymentAnalytics(): PaymentAnalyticsData {
    return {
      totalRevenue: 24850000, // XAF or FCFA / USD equivalent
      monthlyRevenue: 3450000,
      annualRevenue: 41400000,
      activeSubscriptions: 9150,
      expiredSubscriptions: 1420,
      popularPlans: [
        { planName: 'GCE O/A Level All-Access Pass (Monthly)', count: 4850, revenue: 14550000 },
        { planName: 'Baccalauréat Premium Bundle (Terminale/Première)', count: 2900, revenue: 8700000 },
        { planName: 'BEPC Booster Plan', count: 1400, revenue: 1600000 },
      ],
      successfulPaymentsCount: 11450,
      failedPaymentsCount: 180,
      revenueByMonth: [
        { month: 'Jan', revenue: 2100000 },
        { month: 'Feb', revenue: 2400000 },
        { month: 'Mar', revenue: 2800000 },
        { month: 'Apr', revenue: 3100000 },
        { month: 'May', revenue: 3600000 },
        { month: 'Jun', revenue: 3900000 },
        { month: 'Jul', revenue: 4150000 },
      ],
    };
  }

  // Reports Generation Engine
  static getGeneratedReports(): GeneratedReport[] {
    try {
      const stored = localStorage.getItem(GENERATED_REPORTS_KEY);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }
    const defaultReports: GeneratedReport[] = [
      {
        id: 'rep_101',
        title: 'Q2 Platform Growth & Active Learners Audit',
        reportType: 'admin',
        category: 'growth',
        format: 'pdf',
        generatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
        generatedBy: 'System Administrator',
        fileSize: '2.4 MB',
        filters: { dateRange: '90d', curriculum: 'all', language: 'all' },
      },
      {
        id: 'rep_102',
        title: 'Monthly Subscription & Mobile Money Revenue Statement',
        reportType: 'admin',
        category: 'revenue',
        format: 'excel',
        generatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        generatedBy: 'Finance Lead',
        fileSize: '1.1 MB',
        filters: { dateRange: '30d' },
      },
      {
        id: 'rep_103',
        title: 'GCE A-Level Physics & Chemistry Mastery Breakdown',
        reportType: 'teacher',
        category: 'performance',
        format: 'csv',
        generatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        generatedBy: 'Lead Physics Educator',
        fileSize: '640 KB',
        filters: { dateRange: '30d', curriculum: 'GCE Advanced Level' },
      },
    ];
    return defaultReports;
  }

  static generateReport(
    title: string,
    reportType: 'admin' | 'teacher' | 'student',
    category: GeneratedReport['category'],
    format: 'pdf' | 'excel' | 'csv',
    generatedBy: string,
    filters: AnalyticsFilter
  ): GeneratedReport {
    const reports = this.getGeneratedReports();
    const newReport: GeneratedReport = {
      id: 'rep_' + Date.now().toString(36),
      title,
      reportType,
      category,
      format,
      generatedAt: new Date().toISOString(),
      generatedBy,
      fileSize: format === 'pdf' ? '1.8 MB' : format === 'excel' ? '920 KB' : '340 KB',
      filters,
    };

    reports.unshift(newReport);
    try {
      localStorage.setItem(GENERATED_REPORTS_KEY, JSON.stringify(reports));
    } catch (e) {
      console.error(e);
    }
    return newReport;
  }

  static downloadReportFile(report: GeneratedReport): void {
    // Generate blob content based on format
    let mimeType = 'text/csv';
    let fileExtension = 'csv';
    let content = '';

    if (report.format === 'csv' || report.format === 'excel') {
      mimeType = report.format === 'excel' ? 'application/vnd.ms-excel' : 'text/csv';
      fileExtension = report.format === 'excel' ? 'xls' : 'csv';
      content = `Edulpha Analytics Report: ${report.title}\n`;
      content += `Report Category: ${report.category}\n`;
      content += `Generated By: ${report.generatedBy}\n`;
      content += `Date Generated: ${new Date(report.generatedAt).toLocaleString()}\n`;
      content += `Date Range Filter: ${report.filters.dateRange}\n\n`;
      content += `Metric,Value,Status,Change\n`;
      content += `Total Platform Users,14850,Active,+12.4%\n`;
      content += `Daily Active Users (DAU),4320,Normal,+8.1%\n`;
      content += `Monthly Active Users (MAU),13450,Peak,+15.3%\n`;
      content += `Monthly Subscription Revenue,3450000 FCFA,Strong,+18.9%\n`;
      content += `AI Tutor Queries Answered,142800,Optimal,+24.2%\n`;
      content += `Average Quiz Pass Rate,78.5%,Satisfactory,+4.6%\n`;
    } else {
      mimeType = 'text/plain';
      fileExtension = 'txt';
      content = `====================================================\n`;
      content += `          EDULPHA EXECUTIVE REPORT             \n`;
      content += `====================================================\n\n`;
      content += `Title: ${report.title}\n`;
      content += `Report Type: ${report.reportType.toUpperCase()}\n`;
      content += `Category: ${report.category.toUpperCase()}\n`;
      content += `Generated On: ${new Date(report.generatedAt).toUTCString()}\n`;
      content += `Generated By: ${report.generatedBy}\n\n`;
      content += `--- SUMMARY HIGHLIGHTS ---\n`;
      content += `- User Growth: 14,850 total enrolled learners across Cameroon & Central Africa.\n`;
      content += `- Curriculum Breakdown: 42% GCE O-Level, 32% GCE A-Level, 18% Terminale/Première, 8% BEPC.\n`;
      content += `- AI Tutor Health: 142,800 automated learning interactions resolved smoothly.\n`;
      content += `- Payment Reconciliation: 9,150 active paid subscriptions, zero pending payout delays.\n`;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${report.id}.${fileExtension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
