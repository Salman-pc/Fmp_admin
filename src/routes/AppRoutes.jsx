import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminLogin } from '../pages/auth/Login';

import { AdminLayout } from '../layouts/AdminLayout';
import { AdminDashboard } from '../pages/Dashboard';
import { AdminUsers } from '../pages/Users';
import { AdminMeetings } from '../pages/Meetings';
import { AdminReports } from '../pages/Reports';
import { AdminGamesManagement } from '../pages/GamesManagement';

import { useAuth } from '../hooks/useAuth';

export const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          !user ? (
            <Navigate to="/auth/login" replace />
          ) : user.role === 'ADMIN' ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/auth/login" replace />
          )
        }
      />

      {/* Public Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<AdminLogin />} />
      </Route>

      {/* Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRole="ADMIN" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="meetings" element={<AdminMeetings />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="games" element={<AdminGamesManagement />} />
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
