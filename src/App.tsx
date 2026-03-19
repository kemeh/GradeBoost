import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import LessonPage from './pages/LessonPage';
import QuizPage from './pages/QuizPage';
import PaymentPage from './pages/PaymentPage';
import MockExams from './pages/MockExams';
import ExamSession from './pages/ExamSession';
import Layout from './components/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user ? <Layout>{children}</Layout> : <Navigate to="/auth" />;
}

function ExamRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  // Exams don't use the standard Layout to maximize focus
  return user ? <>{children}</> : <Navigate to="/auth" />;
}

import AdminPanel from './pages/AdminPanel';

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return user && user?.role === 'admin' ? <Layout>{children}</Layout> : <Navigate to="/dashboard" />;
}

import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/lessons" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
            <Route path="/lessons/:day" element={<PrivateRoute><LessonPage /></PrivateRoute>} />
            <Route path="/lessons/:day/quiz" element={<PrivateRoute><QuizPage /></PrivateRoute>} />
            <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
            <Route path="/exams" element={<PrivateRoute><MockExams /></PrivateRoute>} />
            <Route path="/exams/:examId" element={<ExamRoute><ExamSession /></ExamRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
