import React, { useState } from 'react';
import { Clock, MapPin, Users, Star, MessageCircle, Navigation } from 'lucide-react';
import { format } from 'date-fns';
import { Ride } from '../../stores/rideStore';
import RideMap from '../Map/RideMap';
import { makeAuthenticatedRequest } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

interface RideCardProps {
  ride: Ride;
  onMessage?: (driverId: string) => void;
  showActions?: boolean;
}

const RideCard: React.FC<RideCardProps> = ({ ride, onMessage, showActions = true }) => {
  const [showMap, setShowMap] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const { user } = useAuthStore();

  // Handle both driver and driverId properties
  const driver = ride.driverId || {};
  const driverName = `${driver.firstName || 'Unknown'} ${driver.lastName || 'Driver'}`;
  const driverRating = driver.rating || 0;
  const driverTotalRides = driver.totalRides || 0;
  const driverAvatar = driver.avatar || `https://ui-avatars.com/api/?name=${driver.firstName || 'U'}+${driver.lastName || 'D'}&background=3b82f6&color=fff`;

  const formatTime = (time: string) => {
    if (!time) return 'N/A';
    const [hours, minutes] = time.split(':');
    return format(new Date(0, 0, 0, parseInt(hours), parseInt(minutes)), 'h:mm a');
  };

  const getChattinessColor = (chattiness: string) => {
    switch (chattiness) {
      case 'silent':
        return 'bg-gray-100 text-gray-700';
      case 'moderate':
        return 'bg-blue-100 text-blue-700';
      case 'talkative':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const handleBookClick = async () => {
    if (!user) {
      alert('Please log in to book a ride');
      return;
    }

    try {
      await makeAuthenticatedRequest('post', '/bookings', {
        rideId: ride._id,
        seatsBooked: selectedSeats,
        message: 'Looking forward to the ride!'
      });

      alert('Booking request sent! The driver will review your request.');
      // Optionally redirect to bookings page
      
    } catch (error: any) {
      console.error('Booking error:', error);
      alert(error.response?.data?.message || 'Booking failed. Please try again.');
    }
  };

  // Safety checks for ride data
  const fromLocation = ride.fromLocation || 'Unknown';
  const toLocation = ride.toLocation || 'Unknown';
  const price = ride.pricePerSeat || 0;
  const availableSeats = ride.availableSeats || 0;
  const totalSeats = ride.totalSeats || 0;
  const preferences = ride.preferences || {};
  const vehicle = ride.vehicle || {};

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img
                src={driverAvatar}
                alt={driverName}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = `https://ui-avatars.com/api/?name=${driver.firstName || 'U'}+${driver.lastName || 'D'}&background=3b82f6&color=fff`;
                }}
              />
              <div>
                <h3 className="font-semibold text-gray-900">
                  {driverName}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{driverRating.toFixed(1)}</span>
                  <span>•</span>
                  <span>{driverTotalRides} rides</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">${price}</div>
              <div className="text-sm text-gray-500">per seat</div>
            </div>
          </div>

          {/* Route */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-gray-900 font-medium">{fromLocation}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-red-600" />
              <span className="text-gray-900 font-medium">{toLocation}</span>
            </div>
          </div>

          {/* Date and Time */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {ride.departureDate ? format(new Date(ride.departureDate), 'MMM d, yyyy') : 'Date TBD'} at {formatTime(ride.departureTime)}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-gray-700">
                {availableSeats} of {totalSeats} seats available
              </span>
            </div>
          </div>

          {/* Preferences */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getChattinessColor(preferences.chattiness || 'moderate')}`}>
              {preferences.chattiness || 'moderate'} chat
            </span>
            {preferences.music && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                Music OK
              </span>
            )}
            {!preferences.smoking && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                No smoking
              </span>
            )}
            {preferences.pets && (
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                Pets OK
              </span>
            )}
          </div>

          {/* Vehicle Info */}
          {vehicle.make && (
            <div className="text-sm text-gray-500 mb-4">
              {vehicle.color} {vehicle.make} {vehicle.model} • {vehicle.licensePlate}
            </div>
          )}

          {/* Description */}
          {ride.description && (
            <p className="text-gray-700 text-sm mb-4">
              {ride.description}
            </p>
          )}

          {/* Map Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowMap(!showMap)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Navigation className="w-4 h-4" />
              <span>{showMap ? 'Hide' : 'Show'} route</span>
            </button>
          </div>

          {/* Map */}
          {showMap && (
            <div className="mb-4">
              <RideMap
                from={fromLocation}
                to={toLocation}
                waypoints={ride.waypoints || []}
                className="border border-gray-200"
              />
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="space-y-3">
              {availableSeats > 0 && (
                <div className="flex items-center space-x-3">
                  <select
                    value={selectedSeats}
                    onChange={(e) => setSelectedSeats(parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Array.from({ length: Math.min(availableSeats, 4) }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} seat{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="text-sm text-gray-600">
                    Total: ${(price * selectedSeats).toFixed(2)}
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                {/* Update the booking button */}
                <button
                  onClick={handleBookClick}
                  disabled={availableSeats === 0}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {availableSeats === 0 ? 'Fully booked' : 'Request Booking'}
                </button>
                <button
                  onClick={() => onMessage?.((driver as any).id || driver._id)}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    
    </>
  );
};

export default RideCard;