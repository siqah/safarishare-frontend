import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Star, Car, Edit3, Save, X, Camera } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { format } from 'date-fns';

const Profile: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    bio: user?.bio || '',
    isDriver: user?.isDriver || false,
    preferences: user?.preferences || {
      chattiness: 'moderate' as const,
      music: true,
      smoking: false,
      pets: false,
    },
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || '',
      bio: user.bio || '',
      isDriver: user.isDriver,
      preferences: user.preferences,
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-12">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <img
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=ffffff&color=3b82f6&size=128`}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-24 h-24 rounded-full border-4 border-white object-cover"
                  />
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="text-white">
                  <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center space-x-1">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xl font-semibold">{user.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Car className="w-5 h-5" />
                      <span>{user.totalRides} rides</span>
                    </div>
                    {user.isDriver && (
                      <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Driver
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isLoading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{user.firstName}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <p className="text-gray-900">{user.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email
                    </label>
                    <p className="text-gray-900">{user.email}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      Date of Birth
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {user.dateOfBirth ? format(new Date(user.dateOfBirth), 'MMMM d, yyyy') : 'Not provided'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.bio}
                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-gray-900">{user.bio || 'No bio provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferences & Settings */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Preferences & Settings</h2>
                <div className="space-y-6">
                  {/* Driver Status */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={isEditing ? formData.isDriver : user.isDriver}
                        onChange={(e) => isEditing && setFormData({ ...formData, isDriver: e.target.checked })}
                        disabled={!isEditing}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm font-medium text-gray-900">
                        I want to offer rides as a driver
                      </span>
                    </label>
                  </div>

                  {/* Travel Preferences */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Travel Preferences</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Chattiness Level
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.preferences.chattiness}
                            onChange={(e) => setFormData({
                              ...formData,
                              preferences: {
                                ...formData.preferences,
                                chattiness: e.target.value as 'silent' | 'moderate' | 'talkative'
                              }
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="silent">Silent (prefer quiet rides)</option>
                            <option value="moderate">Moderate (some conversation is fine)</option>
                            <option value="talkative">Talkative (enjoy chatting)</option>
                          </select>
                        ) : (
                          <p className="text-gray-900 capitalize">{user.preferences.chattiness}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {[
                          { key: 'music', label: 'Music allowed' },
                          { key: 'smoking', label: 'Smoking allowed' },
                          { key: 'pets', label: 'Pets allowed' },
                        ].map(({ key, label }) => (
                          <label key={key} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={isEditing ? formData.preferences[key as keyof typeof formData.preferences] : user.preferences[key as keyof typeof user.preferences]}
                              onChange={(e) => isEditing && setFormData({
                                ...formData,
                                preferences: {
                                  ...formData.preferences,
                                  [key]: e.target.checked
                                }
                              })}
                              disabled={!isEditing}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-900">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Account Stats */}
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Account Statistics</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Member since:</span>
                        <span className="font-medium">{format(new Date(user.createdAt), 'MMMM yyyy')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total rides:</span>
                        <span className="font-medium">{user.totalRides}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Average rating:</span>
                        <span className="font-medium flex items-center">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                          {user.rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;