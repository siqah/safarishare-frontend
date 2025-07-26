import React, { useState, useEffect } from 'react';
import { Check, X, User, MapPin, Calendar, DollarSign } from 'lucide-react';
import api from '../../lib/api';

const BookingRequests: React.FC = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookingRequests();
  }, []);

  const fetchBookingRequests = async () => {
    try {
      const response = await api.get('/bookings/requests');
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching booking requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (bookingId: string) => {
    try {
      await api.post(`/bookings/${bookingId}/accept`);
      alert('Booking accepted! The passenger will be notified to make payment.');
      fetchBookingRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept booking');
    }
  };

  const handleDecline = async (bookingId: string) => {
    const reason = prompt('Reason for declining (optional):');
    try {
      await api.post(`/bookings/${bookingId}/decline`, { reason });
      alert('Booking declined');
      fetchBookingRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to decline booking');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading booking requests...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Booking Requests</h1>
      
      {requests.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No pending booking requests
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request: any) => (
            <div key={request._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={request.passengerId.avatar || `https://ui-avatars.com/api/?name=${request.passengerId.firstName}+${request.passengerId.lastName}`}
                      alt={`${request.passengerId.firstName} ${request.passengerId.lastName}`}
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold">
                        {request.passengerId.firstName} {request.passengerId.lastName}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>{request.seatsBooked} seat(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{request.rideId.fromLocation} → {request.rideId.toLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(request.rideId.departureDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>KSh {request.totalAmount}</span>
                    </div>
                  </div>

                  {request.message && (
                    <div className="bg-gray-50 rounded p-3 mb-4">
                      <p className="text-sm text-gray-700">"{request.message}"</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleAccept(request._id)}
                    className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleDecline(request._id)}
                    className="flex items-center space-x-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    <X className="w-4 h-4" />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingRequests;