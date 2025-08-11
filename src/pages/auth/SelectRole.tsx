import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from '../../stores/authStore';

const SelectRole: React.FC = () => {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { setAccountType, isLoading, error } = useAuthStore();

  const chooseRole = async (isDriver: boolean) => {
    try {
      await setAccountType(isDriver, () => getToken());
      navigate(isDriver ? '/driver/dashboard' : '/rider/dashboard', { replace: true });
    } catch (e) {
      // error handled in store
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-2xl bg-white border rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-2">Choose your account type</h1>
        <p className="text-gray-600 mb-6">You can switch later from your profile.</p>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => chooseRole(false)}
            disabled={isLoading}
            className="border rounded-lg p-5 text-left hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            <h2 className="font-semibold mb-1">Rider</h2>
            <p className="text-sm text-gray-600">Find rides offered by drivers and make bookings.</p>
          </button>

          <button
            onClick={() => chooseRole(true)}
            disabled={isLoading}
            className="border rounded-lg p-5 text-left hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            <h2 className="font-semibold mb-1">Driver</h2>
            <p className="text-sm text-gray-600">Offer rides, manage requests, and track your trips.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectRole;
