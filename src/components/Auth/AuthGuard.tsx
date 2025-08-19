import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: string;
}

export const ProtectedRoute: React.FC<AuthGuardProps> = ({ children, fallback = '/' }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to={fallback} replace />;
  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<AuthGuardProps> = ({ children, fallback = '/dashboard' }) => {
  const { user } = useAuthStore();
  if (user) return <Navigate to={fallback} replace />;
  return <>{children}</>;
};

export const RiderRoute: React.FC<AuthGuardProps> = ({ children, fallback = '/' }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to={fallback} replace />;
  if (user.isDriver) return <Navigate to="/driver/dashboard" replace />;
  return <>{children}</>;
};

export const DriverRoute: React.FC<AuthGuardProps> = ({ children, fallback = '/' }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to={fallback} replace />;
  if (!user.isDriver) return <Navigate to="/rider/dashboard" replace />;
  return <>{children}</>;
};
