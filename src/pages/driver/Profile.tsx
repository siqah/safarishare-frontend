import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useAuthStore } from '../../stores/authStore';

const DriverProfile: React.FC = () => {
  const { getToken } = useAuth();
  const { user: appUser, updateProfile } = useAuthStore();
  const [bio, setBio] = useState(appUser?.bio || '');

  const onSave = async () => {
    await updateProfile({ bio }, async () => getToken() );
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Driver Profile</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea className="w-full border rounded p-2" rows={4} value={bio} onChange={e => setBio(e.target.value)} />
        </div>
        <button onClick={onSave} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </div>
    </div>
  );
};

export default DriverProfile;
