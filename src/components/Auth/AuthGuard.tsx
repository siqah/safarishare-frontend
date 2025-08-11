import React from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: string;
}

export const ProtectedRoute: React.FC<AuthGuardProps> = ({ children, fallback = '/sign-in' }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<AuthGuardProps> = ({ children, fallback = '/dashboard' }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isSignedIn) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
};

export const RiderRoute: React.FC<AuthGuardProps> = ({ children, fallback = '/sign-in' }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useAuthStore();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to={fallback} replace />;
  }

  if (user?.isDriver) {
    return <Navigate to="/driver/dashboard" replace />;
  }

  return <>{children}</>;
};

export const DriverRoute: React.FC<AuthGuardProps> = ({ children, fallback = '/sign-in' }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useAuthStore();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <Navigate to={fallback} replace />;
  }

  if (!user?.isDriver) {
    return <Navigate to="/rider/dashboard" replace />;
  }

  return <>{children}</>;
};
