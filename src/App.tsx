import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';

import Dashboard from './pages/Dashboard';
import Practice from './pages/Practice';
import PracticeSession from './pages/PracticeSession';
import Admin from './pages/Admin';
import Diagnostic from './pages/Diagnostic';
import Profile from './pages/Profile';
import PaymentPage from './pages/PaymentPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const PaymentGatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Loading...</div>;
  
  if (!user) return <Navigate to="/auth" />;
  
  // Admins always have access
  if (user.role === 'admin') return <>{children}</>;
  
  // Check payment status
  if (user.paymentStatus !== 'paid') return <Navigate to="/payment" />;
  
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Loading...</div>;
  return user && isAdmin ? <>{children}</> : <Navigate to="/dashboard" />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/payment" element={<PrivateRoute><PaymentPage /></PrivateRoute>} />
          
          <Route path="/dashboard" element={<PaymentGatedRoute><Dashboard /></PaymentGatedRoute>} />
          <Route path="/diagnostic" element={<PaymentGatedRoute><Diagnostic /></PaymentGatedRoute>} />
          <Route path="/practice" element={<PaymentGatedRoute><Practice /></PaymentGatedRoute>} />
          <Route path="/practice/:paperId" element={<PaymentGatedRoute><PracticeSession /></PaymentGatedRoute>} />
          <Route path="/profile" element={<PaymentGatedRoute><Profile /></PaymentGatedRoute>} />
          
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
