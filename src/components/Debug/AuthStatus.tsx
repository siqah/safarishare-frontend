import React from 'react';
import { useAuthStore } from '../../stores/authStore';

const AuthStatus: React.FC = () => {
  const { user } = useAuthStore();

  // Only show in development
  if (import.meta.env.PROD) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-semibold mb-2">🔍 User Debug</div>
      <div className="space-y-1">
        <div>User Loaded: {user ? '✅' : '❌'}</div>
        <div>User ID: {user?._id || 'None'}</div>
        <div>Name: {user ? `${user.firstName} ${user.lastName}` : 'None'}</div>
        <div>Role: {user ? (user.isDriver ? 'Driver' : 'Rider') : 'N/A'}</div>
      </div>
    </div>
  );
};

export default AuthStatus;
