import React, { useState, useEffect } from 'react';
import { Car, Plus } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useDriverStore } from '../../stores/driverStore';
import DriverApplicationForm from './DriverApplicationForm';
import DriverStatus from './DriverStatus';

const BecomeDriverButton: React.FC = () => {
  const { user } = useAuthStore();
  const { application, getApplication } = useDriverStore();
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (user && !user.isDriver) {
      getApplication();
    }
  }, [user]);

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
        <div className="flex items-center space-x-4">
          <div className="bg-blue-600 p-3 rounded-lg">
            <Car className="w-6 h-6 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Become a Driver</h3>
            <p className="text-sm text-gray-600 mb-3">
              Start earning by offering rides to passengers. Complete your driver application to get started.
            </p>
            
            <button
              onClick={() => setShowApplicationForm(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Apply to Become a Driver</span>
            </button>
          </div>
        </div>
      </div>

      {showApplicationForm && (
        <DriverApplicationForm
          onClose={() => setShowApplicationForm(false)}
          onSuccess={() => {
            setShowApplicationForm(false);
            getApplication(); // Refresh to show status
          }}
        />
      )}
    </>
  );
};

export default BecomeDriverButton;