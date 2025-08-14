import React, { useState, useEffect } from 'react';
import { Car, Plus, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useDriverStore } from '../../stores/driverStore';
import DriverApplicationForm from './DriverApplicationForm';
import DriverStatus from './DriverStatus';
import { useAuth } from '@clerk/clerk-react';

const BecomeDriverButton: React.FC = () => {
  const { user } = useAuthStore();
  const { application, getApplication } = useDriverStore();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (user && !user.isDriver) {
      getApplication(() => getToken());
    }
  }, [user, getApplication, getToken]);

  // If user is already a driver, don't show anything
  if (user?.isDriver) {
    return null;
  }

  // If user has an application, show status
  if (application) {
    return <DriverStatus />;
  }

  // If no application, show become driver button
  return (
    <>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Become a Driver</h3>
            <p className="text-sm text-gray-700 mb-4">Start earning by offering rides. Complete your driver application to get started.</p>
            <ul className="list-disc list-inside text-sm text-gray-800 mb-3">
              <li>Earn extra income on your schedule</li>
              <li>Flexible hours and control over your rides</li>
              <li>Low service fees so you keep more</li>
            </ul>
            <div className="mb-4 text-sm">
              <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded mr-2 text-xs font-medium">Sign-up Bonus</span>
              Limited-time: Earn a bonus after your first completed ride.
            </div>
            <button
              onClick={() => {
                setAuthError(null);
                if (!isSignedIn) {
                  setAuthError('Authentication required. Please sign in to apply to become a driver.');
                  return;
                }
                setShowApplicationForm(true);
              }}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Apply to Become a Driver</span>
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

      {showApplicationForm && (
        <DriverApplicationForm
          onClose={() => setShowApplicationForm(false)}
          onSuccess={() => {
            setShowApplicationForm(false);
            getApplication(() => getToken()); // Refresh to show status
          }}
        />
      )}
    </>
  );
};

export default BecomeDriverButton;