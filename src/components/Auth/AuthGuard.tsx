import React, { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { setAuthTokenGetter } from '../../lib/api';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'driver' | 'rider';
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requiredRole }) => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user: dbUser } = useAuthStore();

  // Set up API token getter when component mounts
  useEffect(() => {
    if (isSignedIn && getToken) {
      setAuthTokenGetter(() => getToken());
    }
  }, [isSignedIn, getToken]);

  // Show loading while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!isSignedIn) {
    return <Navigate to="/sign-in" replace />;
  }

  // If no role is required, just check authentication
  if (!requiredRole) {
    return <>{children}</>;
  }

  // If user doesn't have a role yet, redirect to role selection
  if (!dbUser?.role) {
    return <Navigate to="/select-role" replace />;
  }

  // Check role permissions
  if (requiredRole && dbUser.role !== requiredRole) {
    // Redirect based on user's actual role
    switch (dbUser.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'driver':
        return <Navigate to="/driver/dashboard" replace />;
      case 'rider':
        return <Navigate to="/rider/dashboard" replace />;
      default:
        return <Navigate to="/select-role" replace />;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
