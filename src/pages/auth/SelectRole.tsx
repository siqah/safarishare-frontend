import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const SelectRole: React.FC = () => {
  const navigate = useNavigate();
  const { selectRole } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chooseRole = async (role: 'rider' | 'driver') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const success = await selectRole(role);
      
      if (success) {
        navigate(role === 'driver' ? '/driver/dashboard' : '/rider/dashboard', { replace: true });
      } else {
        setError('Failed to set role. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
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
            onClick={() => chooseRole('rider')}
            disabled={isLoading}
            className="border rounded-lg p-5 text-left hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            <h2 className="font-semibold mb-1">Rider</h2>
            <p className="text-sm text-gray-600">Find rides offered by drivers and make bookings.</p>
          </button>

          <button
            onClick={() => chooseRole('driver')}
            disabled={isLoading}
            className="border rounded-lg p-5 text-left hover:shadow focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
          >
            <h2 className="font-semibold mb-1">Driver</h2>
            <p className="text-sm text-gray-600">Offer rides, manage requests, and track your trips.</p>
          </button>
        </div>

        {isLoading && (
          <div className="mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-600">Setting up your account...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectRole;
