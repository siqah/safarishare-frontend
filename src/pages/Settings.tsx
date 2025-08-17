import React, { useMemo, useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from '../stores/authStore';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();
  const { user, setAccountType, updateProfile, isLoading } = useAuthStore();

  const [actionError, setActionError] = useState<string | null>(null);

  const [prefs, setPrefs] = useState(() => ({
    chattiness: user?.preferences.chattiness ?? 'moderate',
    music: user?.preferences.music ?? false,
    smoking: user?.preferences.smoking ?? false,
    pets: user?.preferences.pets ?? false,
  }));

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
        <p className="text-xs text-gray-500">Switching updates your role instantly.</p>
      </section>

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
