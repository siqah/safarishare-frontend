import React from 'react';
import { Car, Plus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useAuth } from '@clerk/clerk-react';

const BecomeDriverButton: React.FC = () => {
  const { user, setAccountType } = useAuthStore();
  const { getToken, isSignedIn } = useAuth();
  const [authError, setAuthError] = React.useState<string | null>(null);

  if (user?.isDriver) return null;

  const handleBecomeDriver = async () => {
    setAuthError(null);
    if (!isSignedIn) {
      setAuthError('Please sign in to switch to Driver.');
      return;
    }
    try {
      await setAccountType(true, () => getToken());
      window.location.href = '/driver/profile';
    } catch (e: any) {
      setAuthError(e?.message || 'Failed to switch role');
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
      <div className="flex items-start space-x-4">
        <div className="bg-blue-600 p-3 rounded-lg">
          <Car className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">Become a Driver</h3>
          <p className="text-sm text-gray-700 mb-4">Switch your role to Driver and start offering rides.</p>
          <button
            onClick={handleBecomeDriver}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Switch to Driver</span>
          </button>
          {authError && (
            <div className="mt-3 inline-flex items-start text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
              <AlertCircle className="w-4 h-4 mr-2 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BecomeDriverButton;