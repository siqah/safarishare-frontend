import React, { useState, useEffect } from 'react';
import { Clock, MapPin, DollarSign, User, CreditCard } from 'lucide-react';
import api from '../../lib/api';

const MyBookings: React.FC = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    try {
      const response = await api.get('/bookings/my-bookings');
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (bookingId: string, totalAmount: number) => {
    const phoneNumber = prompt('Enter your M-Pesa phone number (e.g., 0712345678):');
    if (!phoneNumber) return;

    try {
      const response = await api.post(`/bookings/${bookingId}/pay`, {
        phoneNumber
      });
      
      alert('Payment initiated! Please check your phone and enter your M-Pesa PIN.');
      
      // Poll for payment status
      const pollPayment = setInterval(async () => {
        try {
          const statusResponse = await api.get(`/bookings/${bookingId}/payment-status`);
          if (statusResponse.data.paymentStatus === 'paid') {
            clearInterval(pollPayment);
            alert('Payment successful! Your booking is confirmed.');
            fetchMyBookings();
          } else if (statusResponse.data.paymentStatus === 'failed') {
            clearInterval(pollPayment);
            alert('Payment failed. Please try again.');
          }
        } catch (error) {
          // Continue polling
        }
      }, 3000);
      
      // Stop polling after 2 minutes
      setTimeout(() => clearInterval(pollPayment), 120000);
      
    } catch (error: any) {
      alert(error.response?.data?.message || 'Payment initiation failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'declined': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your bookings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No bookings found
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking: any) => (
            <div key={booking._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <img
                      src={booking.rideId.driverId.avatar || `https://ui-avatars.com/api/?name=${booking.rideId.driverId.firstName}+${booking.rideId.driverId.lastName}`}
                      alt="Driver"
                      className="w-12 h-12 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold">
                        {booking.rideId.driverId.firstName} {booking.rideId.driverId.lastName}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <User className="w-4 h-4" />
                        <span>Driver</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{booking.rideId.fromLocation} → {booking.rideId.toLocation}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span>{new Date(booking.rideId.departureDate).toLocaleDateString()} at {booking.rideId.departureTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>KSh {booking.totalAmount} ({booking.seatsBooked} seat(s))</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                  
                  {booking.status === 'accepted' && booking.paymentStatus === 'pending' && (
                    <button
                      onClick={() => handlePayment(booking._id, booking.totalAmount)}
                      className="mt-2 flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Pay Now</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;