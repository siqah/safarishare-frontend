import React, { useState } from 'react';
import { MapPin, Calendar, Clock, DollarSign, Users, Car, MessageSquare, AlertCircle } from 'lucide-react';
import { useRideStore } from '../../stores/rideStore';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const OfferRide: React.FC = () => {
  const { createRide, isLoading, error, clearError } = useRideStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: '',
    time: '',
    price: '',
    totalSeats: '3',
    description: '',
    waypoints: '',
    vehicle: {
      make: '',
      model: '',
      color: '',
      licensePlate: '',
    },
    preferences: {
      chattiness: 'moderate' as 'silent' | 'moderate' | 'talkative',
      music: true,
      smoking: false,
      pets: false,
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!user) {
      alert('Please log in to offer a ride');
      return;
    }

    try {
      await createRide({
        fromLocation: formData.from,
        toLocation: formData.to,
        departureDate: formData.date,
        departureTime: formData.time,
        pricePerSeat: parseInt(formData.price),
        availableSeats: parseInt(formData.totalSeats),
        totalSeats: parseInt(formData.totalSeats),
        description: formData.description,
        waypoints: formData.waypoints ? formData.waypoints.split(',').map(w => w.trim()) : [],
        vehicle: formData.vehicle,
        preferences: formData.preferences,
      });
      
      alert('Ride offer created successfully!');
      navigate('/my-rides');
    } catch (error) {
      // Error is handled by the store
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Offer a Ride</h1>
          <p className="text-gray-600">Share your journey and help others reach their destination</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Route Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      placeholder="Departure city"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.from}
                      onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      required
                      placeholder="Destination city"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.to}
                      onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Waypoints (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hartford, New Haven (comma-separated)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.waypoints}
                  onChange={(e) => setFormData({ ...formData, waypoints: e.target.value })}
                />
              </div>
            </div>

            {/* Date & Time Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Date & Time</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Departure Time
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Seats Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price & Capacity</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price per seat ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="25"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available seats
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <select
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.totalSeats}
                      onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                    >
                      <option value="1">1 seat</option>
                      <option value="2">2 seats</option>
                      <option value="3">3 seats</option>
                      <option value="4">4 seats</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Make
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Toyota"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.vehicle.make}
                    onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, make: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Camry"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.vehicle.model}
                    onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, model: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Silver"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.vehicle.color}
                    onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, color: e.target.value } })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    License Plate
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ABC-123"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.vehicle.licensePlate}
                    onChange={(e) => setFormData({ ...formData, vehicle: { ...formData.vehicle, licensePlate: e.target.value } })}
                  />
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Ride Preferences</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chattiness level
                  </label>
                  <select
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.preferences.chattiness}
                    onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, chattiness: e.target.value as 'silent' | 'moderate' | 'talkative' } })}
                  >
                    <option value="silent">Silent (prefer quiet rides)</option>
                    <option value="moderate">Moderate (some conversation is fine)</option>
                    <option value="talkative">Talkative (enjoy chatting)</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="music"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.preferences.music}
                      onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, music: e.target.checked } })}
                    />
                    <label htmlFor="music" className="ml-2 block text-sm text-gray-900">
                      Music allowed
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="smoking"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.preferences.smoking}
                      onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, smoking: e.target.checked } })}
                    />
                    <label htmlFor="smoking" className="ml-2 block text-sm text-gray-900">
                      Smoking allowed
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="pets"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      checked={formData.preferences.pets}
                      onChange={(e) => setFormData({ ...formData, preferences: { ...formData.preferences, pets: e.target.checked } })}
                    />
                    <label htmlFor="pets" className="ml-2 block text-sm text-gray-900">
                      Pets allowed
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Information (optional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <textarea
                  rows={4}
                  placeholder="Any additional information about your ride..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Creating ride...' : 'Offer this ride'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfferRide;