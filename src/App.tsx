import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';

import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import PracticeSession from './pages/PracticeSession';
import Admin from './pages/Admin';
import Diagnostic from './pages/Diagnostic';
import Profile from './pages/Profile';
import PaymentPage from './pages/PaymentPage';
import AdminDailyDrill from './pages/AdminDailyDrill';
import AdminManagement from './pages/AdminManagement';
import AdminSettings from './pages/AdminSettings';
import DailyDrillSession from './pages/DailyDrillSession';
import VerifyEmail from './pages/VerifyEmail';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isEmailVerified } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" />;
  if (!isEmailVerified) return <Navigate to="/verify-email" />;
  
  return <>{children}</>;
};

const PaymentGatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin, isEmailVerified } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" />;
  if (!isEmailVerified) return <Navigate to="/verify-email" />;
  
  // Admins always have access
  if (isAdmin) return <>{children}</>;
  
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

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
            
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/diagnostic" element={<PaymentGatedRoute><Diagnostic /></PaymentGatedRoute>} />
            <Route path="/practice" element={<PaymentGatedRoute><Practice /></PaymentGatedRoute>} />
            <Route path="/practice/:paperId" element={<PrivateRoute><PracticeSession /></PrivateRoute>} />
            <Route path="/daily-drill" element={<PrivateRoute><DailyDrillSession /></PrivateRoute>} />
            <Route path="/profile" element={<PaymentGatedRoute><Profile /></PaymentGatedRoute>} />
            
            <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
            <Route path="/admin/daily-drill" element={<AdminRoute><AdminDailyDrill /></AdminRoute>} />
            <Route path="/admin/resources" element={<AdminRoute><AdminManagement /></AdminRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </SettingsProvider>
  );
}
