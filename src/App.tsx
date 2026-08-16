import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { lazyWithRetry as lazy } from './utils/lazyWithRetry';

// Eagerly loaded components (critical path)
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';

// Lazy loaded components (load balanced with automated retry recovery)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Practice = lazy(() => import('./pages/Practice'));
const PracticeSession = lazy(() => import('./pages/PracticeSession'));
const Admin = lazy(() => import('./pages/Admin'));
const Diagnostic = lazy(() => import('./pages/Diagnostic'));
const Profile = lazy(() => import('./pages/Profile'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));
const AdminDailyDrill = lazy(() => import('./pages/AdminDailyDrill'));
const AdminManagement = lazy(() => import('./pages/AdminManagement'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminPaperGenerator = lazy(() => import('./pages/AdminPaperGenerator'));
const DailyDrillSession = lazy(() => import('./pages/DailyDrillSession'));
const VerifyEmail = lazy(() => import('./pages/VerifyEmail'));
const DuelBattle = lazy(() => import('./pages/DuelBattle'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const DailyDrill = lazy(() => import('./pages/DailyDrill'));
const RandomPractice = lazy(() => import('./pages/RandomPractice'));
const LearningChallenges = lazy(() => import('./pages/LearningChallenges'));
const AdminChallenges = lazy(() => import('./pages/AdminChallenges'));
const StudentLMSPortal = lazy(() => import('./pages/StudentLMSPortal'));
const AdminLMSStudio = lazy(() => import('./pages/AdminLMSStudio'));
const TeacherDashboard = lazy(() => import('./pages/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const DiscussionForum = lazy(() => import('./pages/DiscussionForum'));
const NotificationCenterPage = lazy(() => import('./pages/NotificationCenterPage'));
const AdminNotificationManagement = lazy(() => import('./pages/AdminNotificationManagement'));
const AdminAnalyticsDashboard = lazy(() => import('./pages/AdminAnalyticsDashboard'));
const StudentAnalyticsPage = lazy(() => import('./pages/StudentAnalyticsPage'));
const TeacherAnalyticsPage = lazy(() => import('./pages/TeacherAnalyticsPage'));
const EdulphaMobileHub = lazy(() => import('./pages/EdulphaMobileHub'));
const AdminSecurityPerformanceHub = lazy(() => import('./pages/AdminSecurityPerformanceHub'));

const AdminQuestionBank = lazy(() => import('./pages/AdminQuestionBank'));
const AdminBulkImport = lazy(() => import('./pages/AdminBulkImport'));
const AdminExamBuilder = lazy(() => import('./pages/AdminExamBuilder'));
const StudentExamPortal = lazy(() => import('./pages/StudentExamPortal'));
const ExamSession = lazy(() => import('./pages/ExamSession'));
const ExamResultScreen = lazy(() => import('./pages/ExamResultScreen'));
const ExamAnalyticsDashboard = lazy(() => import('./pages/ExamAnalyticsDashboard'));
const DocumentationHub = lazy(() => import('./pages/DocumentationHub'));
const PublicDocumentView = lazy(() => import('./pages/PublicDocumentView'));
const StudentPracticalLab = lazy(() => import('./pages/StudentPracticalLab'));
const AdminPracticalManager = lazy(() => import('./pages/AdminPracticalManager'));
const AlumniProgramPage = lazy(() => import('./pages/AlumniProgramPage'));
const StudentAmbassadorPage = lazy(() => import('./pages/StudentAmbassadorPage'));

// Dedicated Landing Section Pages
const AboutPage = lazy(() => import('./pages/AboutPage'));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage'));
const SubjectsPage = lazy(() => import('./pages/SubjectsPage'));
const CurriculumPage = lazy(() => import('./pages/CurriculumPage'));
const VirtualLabsPage = lazy(() => import('./pages/VirtualLabsPage'));
const EdulphaAIPage = lazy(() => import('./pages/EdulphaAIPage'));
const MockExamsPage = lazy(() => import('./pages/MockExamsPage'));
const PricingPage = lazy(() => import('./pages/PricingPage'));
const PartnersPage = lazy(() => import('./pages/PartnersPage'));
const TeachersPage = lazy(() => import('./pages/TeachersPage'));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'));
const SuccessStoriesPage = lazy(() => import('./pages/SuccessStoriesPage'));
const NewsBlogPage = lazy(() => import('./pages/NewsBlogPage'));
const FAQsPage = lazy(() => import('./pages/FAQsPage'));
const SupportContactPage = lazy(() => import('./pages/SupportContactPage'));
const CareersPage = lazy(() => import('./pages/CareersPage'));
const DownloadAppPage = lazy(() => import('./pages/DownloadAppPage'));

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">
    Loading...
  </div>
);

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isEmailVerified } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" />;
  if (!isEmailVerified) return <Navigate to="/verify-email" />;
  
  return <>{children}</>;
};

const PaymentGatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin, isTeacher, isEmailVerified } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" />;
  if (!isEmailVerified) return <Navigate to="/verify-email" />;
  
  // Admins & Teachers always have full access
  if (isAdmin || isTeacher) return <>{children}</>;
  
  // Check payment status and expiry
  const isPaid = user.paymentStatus === 'paid';
  const hasExpired = user.paymentExpiryDate && new Date(user.paymentExpiryDate) < new Date();
  
  if (!isPaid || hasExpired) return <Navigate to="/payment" />;
  
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Loading...</div>;
  return isAdmin ? <>{children}</> : <Navigate to="/dashboard" />;
};

const TeacherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin, isTeacher } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  return (isAdmin || isTeacher) ? <>{children}</> : <Navigate to="/dashboard" />;
};

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <LanguageProvider>
          <Router>
            <Toaster position="top-right" />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/curriculum" element={<CurriculumPage />} />
              <Route path="/virtual-labs" element={<VirtualLabsPage />} />
              <Route path="/edulpha-ai" element={<EdulphaAIPage />} />
              <Route path="/mock-exams" element={<MockExamsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/partners" element={<PartnersPage />} />
              <Route path="/teachers" element={<TeachersPage />} />
              <Route path="/testimonials" element={<TestimonialsPage />} />
              <Route path="/success-stories" element={<SuccessStoriesPage />} />
              <Route path="/news" element={<NewsBlogPage />} />
              <Route path="/blog" element={<NewsBlogPage />} />
              <Route path="/faqs" element={<FAQsPage />} />
              <Route path="/support" element={<SupportContactPage />} />
              <Route path="/contact" element={<SupportContactPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/download-app" element={<DownloadAppPage />} />

              <Route path="/student-ambassadors" element={<StudentAmbassadorPage />} />
              <Route path="/alumni" element={<AlumniProgramPage />} />
              <Route path="/docs" element={<DocumentationHub />} />
              <Route path="/documentation" element={<DocumentationHub />} />
              
              {/* Public Platform Documents & Legal Routes */}
              <Route path="/privacy-policy" element={<PublicDocumentView fixedSlug="privacy-policy" />} />
              <Route path="/terms-and-conditions" element={<PublicDocumentView fixedSlug="terms-and-conditions" />} />
              <Route path="/cookie-policy" element={<PublicDocumentView fixedSlug="cookie-policy" />} />
              <Route path="/data-protection" element={<PublicDocumentView fixedSlug="data-protection" />} />
              <Route path="/user-agreement" element={<PublicDocumentView fixedSlug="user-agreement" />} />
              <Route path="/community-guidelines" element={<PublicDocumentView fixedSlug="community-guidelines" />} />
              <Route path="/refund-policy" element={<PublicDocumentView fixedSlug="refund-policy" />} />
              <Route path="/disclaimer" element={<PublicDocumentView fixedSlug="disclaimer" />} />
              <Route path="/intellectual-property" element={<PublicDocumentView fixedSlug="intellectual-property" />} />
              <Route path="/user-guide" element={<PublicDocumentView fixedSlug="user-guide" />} />
              <Route path="/partner-guide" element={<PublicDocumentView fixedSlug="partner-guide" />} />
              <Route path="/security-policy" element={<PublicDocumentView fixedSlug="security-policy" />} />
              <Route path="/doc/:slug" element={<PublicDocumentView />} />

              <Route path="/auth" element={<AuthPage />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
              
              <Route path="/dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
              <Route path="/student-dashboard" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
              <Route path="/forum" element={<PrivateRoute><DiscussionForum /></PrivateRoute>} />
              <Route path="/notifications" element={<PrivateRoute><NotificationCenterPage /></PrivateRoute>} />
              <Route path="/admin/notifications" element={<AdminRoute><AdminNotificationManagement /></AdminRoute>} />
              <Route path="/analytics" element={<PrivateRoute><StudentAnalyticsPage /></PrivateRoute>} />
              <Route path="/teacher/analytics" element={<TeacherRoute><TeacherAnalyticsPage /></TeacherRoute>} />
              <Route path="/admin/analytics" element={<AdminRoute><AdminAnalyticsDashboard /></AdminRoute>} />
              <Route path="/admin/security" element={<AdminRoute><AdminSecurityPerformanceHub /></AdminRoute>} />
              <Route path="/mobile-app" element={<PrivateRoute><EdulphaMobileHub /></PrivateRoute>} />
              <Route path="/diagnostic" element={<PaymentGatedRoute><Diagnostic /></PaymentGatedRoute>} />
              <Route path="/practice" element={<PaymentGatedRoute><Practice /></PaymentGatedRoute>} />
              <Route path="/practice/:paperId" element={<PrivateRoute><PracticeSession /></PrivateRoute>} />
              <Route path="/daily-drill" element={<PrivateRoute><DailyDrillSession /></PrivateRoute>} />
              <Route path="/daily-drill-new" element={<PrivateRoute><DailyDrill /></PrivateRoute>} />
              <Route path="/random-practice" element={<PrivateRoute><RandomPractice /></PrivateRoute>} />
              <Route path="/challenges" element={<PrivateRoute><LearningChallenges /></PrivateRoute>} />
              <Route path="/practicals" element={<PrivateRoute><StudentPracticalLab /></PrivateRoute>} />
              <Route path="/practicals/:id" element={<PrivateRoute><StudentPracticalLab /></PrivateRoute>} />
              <Route path="/lms" element={<PrivateRoute><StudentLMSPortal /></PrivateRoute>} />
              <Route path="/exams" element={<PrivateRoute><StudentExamPortal /></PrivateRoute>} />
              <Route path="/exams/:examId/take" element={<PrivateRoute><ExamSession /></PrivateRoute>} />
              <Route path="/exams/result/:attemptId" element={<PrivateRoute><ExamResultScreen /></PrivateRoute>} />
              <Route path="/exam-analytics" element={<PrivateRoute><ExamAnalyticsDashboard /></PrivateRoute>} />
              <Route path="/duel" element={<PrivateRoute><DuelBattle /></PrivateRoute>} />
              <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
              <Route path="/profile" element={<PaymentGatedRoute><Profile /></PaymentGatedRoute>} />
              
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/teacher" element={<TeacherRoute><TeacherDashboard /></TeacherRoute>} />
              <Route path="/admin/lms" element={<TeacherRoute><AdminLMSStudio /></TeacherRoute>} />
              <Route path="/admin/questions" element={<TeacherRoute><AdminQuestionBank /></TeacherRoute>} />
              <Route path="/admin/bulk-import" element={<TeacherRoute><AdminBulkImport /></TeacherRoute>} />
              <Route path="/admin/exam-builder" element={<TeacherRoute><AdminExamBuilder /></TeacherRoute>} />
              <Route path="/admin/challenges" element={<TeacherRoute><AdminChallenges /></TeacherRoute>} />
              <Route path="/admin/practicals" element={<TeacherRoute><AdminPracticalManager /></TeacherRoute>} />
              <Route path="/admin/daily-drill" element={<TeacherRoute><AdminDailyDrill /></TeacherRoute>} />
              <Route path="/admin/resources" element={<TeacherRoute><AdminManagement /></TeacherRoute>} />
              <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
              <Route path="/admin/paper-generator" element={<TeacherRoute><AdminPaperGenerator /></TeacherRoute>} />
              
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Suspense>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  </SettingsProvider>
  );
}
