import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ProtectedRoute = ({ allowedRole = 'ADMIN' }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <LoadingSpinner size="lg" label="Verifying administrator session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-center">
        <div className="glass-panel p-6 rounded-2xl max-w-md border border-rose-500/30">
          <h2 className="text-lg font-bold text-rose-400 mb-2">Access Denied</h2>
          <p className="text-xs text-slate-300 mb-4">
            You do not have administrative privileges to access this console.
          </p>
          <a
            href="/"
            className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition"
          >
            Return to Login
          </a>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
