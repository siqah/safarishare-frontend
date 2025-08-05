import React from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useAuthStore } from '../../stores/authStore';

const AuthStatus: React.FC = () => {
  const clerkAuth = useAuth();
  const { user: clerkUser } = useUser();
  const { user: storeUser, syncWithClerk } = useAuthStore();

  // Only show in development
  if (import.meta.env.PROD) return null;

  const handleManualSync = () => {
    if (clerkUser) {
      console.log('🔄 Manual sync triggered');
      syncWithClerk(clerkUser);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-lg text-xs max-w-xs z-50">
      <div className="font-semibold mb-2">🔍 Auth Debug</div>
      <div className="space-y-1">
        <div>Clerk Loaded: {clerkAuth.isLoaded ? '✅' : '❌'}</div>
        <div>Signed In: {clerkAuth.isSignedIn ? '✅' : '❌'}</div>
        <div>User ID: {clerkUser?.id ? clerkUser.id.slice(0, 8) + '...' : 'None'}</div>
        <div>Store User: {storeUser?.firstName || 'None'}</div>
        <div>Persistent: {storeUser ? '✅' : '❌'}</div>
        {clerkUser && (
          <button 
            onClick={handleManualSync}
            className="mt-2 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
          >
            🔄 Manual Sync
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthStatus;
