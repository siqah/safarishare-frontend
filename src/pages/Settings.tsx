import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';
import { useDriverStore } from '../stores/driverStore';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const { user, setAccountType, updateProfile, isLoading } = useAuthStore();
  const { submitApplication, application, getApplication } = useDriverStore();

  const [actionError, setActionError] = useState<string | null>(null);
  const [driverAppError, setDriverAppError] = useState<string | null>(null);
  const [driverAppSuccess, setDriverAppSuccess] = useState<string | null>(null);

  const [prefs, setPrefs] = useState(() => ({
    chattiness: user?.preferences.chattiness ?? 'moderate',
    music: user?.preferences.music ?? false,
    smoking: user?.preferences.smoking ?? false,
    pets: user?.preferences.pets ?? false,
  }));

  const [driverInfo, setDriverInfo] = useState({
    licenseNumber: '',
    licenseExpiry: '',
    vehicleInfo: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      plateNumber: '',
      seats: 4,
    },
  });

  const roleLabel = useMemo(() => (user?.isDriver ? 'Driver' : 'Rider'), [user?.isDriver]);

  const handleSwitchToDriver = async () => {
    setActionError(null);
    try {
      if (!isSignedIn) {
        setActionError('Authentication required. Please sign in to switch to Driver mode.');
        return;
      }
      await setAccountType(true, () => getToken());
      navigate('/driver/profile', { replace: true });
    } catch (e: any) {
      setActionError(e?.message || 'Failed to switch role');
    }
  };

  const handleSwitchToRider = async () => {
    setActionError(null);
    try {
      if (!isSignedIn) {
        setActionError('Authentication required. Please sign in to switch to Rider mode.');
        return;
      }
      await setAccountType(false, () => getToken());
      navigate('/rider/profile', { replace: true });
    } catch (e: any) {
      setActionError(e?.message || 'Failed to switch role');
    }
  };

  const handleSavePrefs = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ preferences: prefs as any }, () => getToken());
    } catch (e) {
      // noop
    }
  };

  const handleSubmitDriverInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setDriverAppError(null);
    setDriverAppSuccess(null);
    try {
      if (!isSignedIn) {
        setDriverAppError('Authentication required. Please sign in to submit your driver application.');
        return;
      }
      await submitApplication(driverInfo as any, () => getToken());
      setDriverAppSuccess('Application submitted! We will review it within 24-48 hours.');
    } catch (err: any) {
      setDriverAppError(err?.message || 'Failed to submit application');
    }
  };

  useEffect(() => {
    // Load existing application status (if any)
    getApplication(() => getToken());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Account Settings</h1>
        <p className="text-sm text-gray-600">Manage your role and preferences.</p>
      </div>

      <section className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-medium text-gray-900">Role</h2>
        <p className="text-sm text-gray-600">Current role: <span className="font-medium">{roleLabel}</span></p>
        {actionError && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{actionError}</div>
        )}
        {!user?.isDriver ? (
          <button
            onClick={handleSwitchToDriver}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            Switch to Driver
          </button>
        ) : (
          <button
            onClick={handleSwitchToRider}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
          >
            Switch to Rider
          </button>
        )}
        <p className="text-xs text-gray-500">Switching to Driver unlocks driver features and redirects you to the driver profile.</p>
      </section>

      {!user?.isDriver && (
        <>
          {/* Incentives & Sign-up Bonus */}
          <section className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-blue-900">Benefits of Becoming a Driver</h2>
            <ul className="list-disc list-inside text-blue-900/90 space-y-1 text-sm">
              <li>Earn extra income on your schedule</li>
              <li>Meet new people and explore your city</li>
              <li>Flexible hours and full control over your rides</li>
              <li>Keep more with low service fees</li>
            </ul>
            <div className="mt-2 text-sm text-blue-900">
              <span className="inline-block bg-blue-600 text-white px-2 py-1 rounded mr-2 text-xs font-medium">Sign-up Bonus</span>
              Limited-time offer: Earn a bonus after completing your first ride.
            </div>
          </section>

          <section className="bg-white border rounded-xl p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Driver Application (No Images)</h2>
            {application?.status === 'pending' ? (
              <p className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded p-3">Your application is pending review.</p>
            ) : (
              <form onSubmit={handleSubmitDriverInfo} className="space-y-6">
                {driverAppError && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{driverAppError}</div>
                )}
                {driverAppSuccess && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">{driverAppSuccess}</div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Number</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={driverInfo.licenseNumber}
                      onChange={(e) => setDriverInfo((d) => ({ ...d, licenseNumber: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">License Expiry</label>
                    <input
                      type="date"
                      className="w-full border rounded-lg px-3 py-2"
                      value={driverInfo.licenseExpiry}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setDriverInfo((d) => ({ ...d, licenseExpiry: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Make</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={driverInfo.vehicleInfo.make}
                      onChange={(e) => setDriverInfo((d) => ({ ...d, vehicleInfo: { ...d.vehicleInfo, make: e.target.value } }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Model</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={driverInfo.vehicleInfo.model}
                      onChange={(e) => setDriverInfo((d) => ({ ...d, vehicleInfo: { ...d.vehicleInfo, model: e.target.value } }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <input
                      type="number"
                      className="w-full border rounded-lg px-3 py-2"
                      min={2000}
                      max={new Date().getFullYear() + 1}
                      value={driverInfo.vehicleInfo.year}
                      onChange={(e) => setDriverInfo((d) => ({ ...d, vehicleInfo: { ...d.vehicleInfo, year: parseInt(e.target.value || '0') } }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2"
                      value={driverInfo.vehicleInfo.color}
                      onChange={(e) => setDriverInfo((d) => ({ ...d, vehicleInfo: { ...d.vehicleInfo, color: e.target.value } }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Plate Number</label>
                    <input
                      type="text"
                      className="w-full border rounded-lg px-3 py-2 uppercase"
                      value={driverInfo.vehicleInfo.plateNumber}
                      onChange={(e) => setDriverInfo((d) => ({ ...d, vehicleInfo: { ...d.vehicleInfo, plateNumber: e.target.value.toUpperCase() } }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Seats</label>
                    <input
                      type="number"
                      className="w-full border rounded-lg px-3 py-2"
                      min={1}
                      max={8}
                      value={driverInfo.vehicleInfo.seats}
                      onChange={(e) => setDriverInfo((d) => ({ ...d, vehicleInfo: { ...d.vehicleInfo, seats: parseInt(e.target.value || '1') } }))}
                      required
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Submit Driver Application
                  </button>
                </div>
              </form>
            )}
          </section>
        </>
      )}

      <section className="bg-white border rounded-xl p-6">
        <form onSubmit={handleSavePrefs} className="space-y-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Preferences</h2>
            <p className="text-sm text-gray-600">These help match you with better ride experiences.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chattiness</label>
              <select
                className="w-full border rounded-lg px-3 py-2"
                value={prefs.chattiness}
                onChange={(e) => setPrefs((p) => ({ ...p, chattiness: e.target.value as any }))}
              >
                <option value="quiet">Quiet</option>
                <option value="moderate">Moderate</option>
                <option value="chatty">Chatty</option>
              </select>
            </div>

            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Music</p>
                <p className="text-xs text-gray-500">Okay with playing music</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={prefs.music}
                onChange={(e) => setPrefs((p) => ({ ...p, music: e.target.checked }))}
              />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Smoking</p>
                <p className="text-xs text-gray-500">Allow smoking in car</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={prefs.smoking}
                onChange={(e) => setPrefs((p) => ({ ...p, smoking: e.target.checked }))}
              />
            </div>

            <div className="flex items-center justify-between border rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-gray-900">Pets</p>
                <p className="text-xs text-gray-500">Allow pets on rides</p>
              </div>
              <input
                type="checkbox"
                className="h-5 w-5"
                checked={prefs.pets}
                onChange={(e) => setPrefs((p) => ({ ...p, pets: e.target.checked }))}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default Settings;
