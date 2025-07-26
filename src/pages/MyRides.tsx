import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useRideStore } from '../stores/rideStore';
import RideCard from '../components/Rides/RideCard';
import { Car, Users, Clock, AlertCircle, MessageCircle, Check, X, Phone } from 'lucide-react';
import api from '../lib/api';

const MyRides: React.FC = () => {
  const { user } = useAuthStore();
  const { getRidesByDriver, error, clearError } = useRideStore();
  const [myRides, setMyRides] = useState<any[]>([]);
  const [bookingRequests, setBookingRequests] = useState<any[]>([]);
  const [confirmedBookings, setConfirmedBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showMessaging, setShowMessaging] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setIsLoading(true);
      clearError();
      
      try {
        // Fetch your rides
        const rides = await getRidesByDriver(user._id);
        setMyRides(Array.isArray(rides) ? rides : []);

        // Fetch booking requests for your rides
        const requestsResponse = await api.get('/bookings/requests');
        setBookingRequests(requestsResponse.data.requests || []);

        // Fetch confirmed bookings for your rides
        const confirmedResponse = await api.get('/bookings/ride-bookings');
        setConfirmedBookings(confirmedResponse.data.bookings || []);

      } catch (error) {
        console.error('Error fetching data:', error);
        setMyRides([]);
        setBookingRequests([]);
        setConfirmedBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      await api.post(`/bookings/${bookingId}/accept`);
      alert('Booking accepted! The passenger will be notified to make payment.');
      
      // Refresh data
      const requestsResponse = await api.get('/bookings/requests');
      setBookingRequests(requestsResponse.data.requests || []);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to accept booking');
    }
  };

  const handleDeclineBooking = async (bookingId: string) => {
    const reason = prompt('Reason for declining (optional):');
    try {
      await api.post(`/bookings/${bookingId}/decline`, { reason });
      alert('Booking declined');
      
      // Refresh data
      const requestsResponse = await api.get('/bookings/requests');
      setBookingRequests(requestsResponse.data.requests || []);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to decline booking');
    }
  };

  const handleStartMessaging = (booking: any) => {
    setSelectedBooking(booking);
    setShowMessaging(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please log in</h2>
          <p className="text-gray-600">You need to be logged in to view your rides.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your rides...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Rides</h1>
          <p className="text-gray-600">Manage your rides and bookings</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Rides Offered</p>
                <p className="text-2xl font-bold text-gray-900">{myRides.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Car className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Pending Requests</p>
                <p className="text-2xl font-bold text-gray-900">{bookingRequests.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Confirmed Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{confirmedBookings.length}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Rating</p>
                <p className="text-2xl font-bold text-gray-900">{user?.rating?.toFixed(1) || '0.0'}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Booking Requests */}
        {bookingRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pending Booking Requests</h2>
            <div className="space-y-4">
              {bookingRequests.map((request) => (
                <div key={request._id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-400">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={request.passengerId?.avatar || `https://ui-avatars.com/api/?name=${request.passengerId?.firstName}+${request.passengerId?.lastName}&background=3b82f6&color=fff`}
                          alt={`${request.passengerId?.firstName} ${request.passengerId?.lastName}`}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">
                            {request.passengerId?.firstName} {request.passengerId?.lastName}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Wants to book {request.seatsBooked} seat(s) for KSh {request.totalAmount}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Route:</span>
                            <p className="text-gray-600">{request.rideId?.fromLocation} → {request.rideId?.toLocation}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Date:</span>
                            <p className="text-gray-600">{new Date(request.rideId?.departureDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>

                      {request.message && (
                        <div className="bg-blue-50 rounded-lg p-3 mb-4">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Message:</span> "{request.message}"
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAcceptBooking(request._id)}
                        className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleDeclineBooking(request._id)}
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
          </div>
        )}

        {/* Confirmed Bookings (Passengers you can message) */}
        {confirmedBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Confirmed Passengers</h2>
            <div className="space-y-4">
              {confirmedBookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-400">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={booking.passengerId?.avatar || `https://ui-avatars.com/api/?name=${booking.passengerId?.firstName}+${booking.passengerId?.lastName}&background=10b981&color=fff`}
                          alt={`${booking.passengerId?.firstName} ${booking.passengerId?.lastName}`}
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-lg">
                            {booking.passengerId?.firstName} {booking.passengerId?.lastName}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {booking.seatsBooked} seat(s) • KSh {booking.totalAmount} • Paid
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Route:</span>
                            <p className="text-gray-600">{booking.rideId?.fromLocation} → {booking.rideId?.toLocation}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Date:</span>
                            <p className="text-gray-600">{new Date(booking.rideId?.departureDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                        {booking.mpesaReceiptNumber && (
                          <div className="mt-2">
                            <span className="font-medium text-gray-700">Receipt:</span>
                            <p className="text-gray-600 text-xs">{booking.mpesaReceiptNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStartMessaging(booking)}
                        className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Message</span>
                      </button>
                      {booking.passengerId?.phone && (
                        <a
                          href={`tel:${booking.passengerId.phone}`}
                          className="flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Call</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* My Offered Rides */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Offered Rides</h2>
          {myRides.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {myRides.map((ride, index) => (
                <RideCard 
                  key={ride?.id || ride?._id || `ride-${index}`} 
                  ride={ride} 
                  showActions={false} 
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No rides offered yet</h3>
              <p className="text-gray-600 mb-4">Start offering rides to help others and earn money!</p>
              <a
                href="/offer"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Offer a ride
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Messaging Modal */}
      {showMessaging && selectedBooking && (
        <MessagingModal
          booking={selectedBooking}
          currentUser={user}
          onClose={() => {
            setShowMessaging(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
};

// Messaging Modal Component
const MessagingModal: React.FC<{
  booking: any;
  currentUser: any;
  onClose: () => void;
}> = ({ booking, currentUser, onClose }) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // Fetch existing messages
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/messages/conversation/${booking.passengerId._id}`);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const response = await api.post('/messages', {
        receiverId: booking.passengerId._id,
        content: newMessage.trim(),
        bookingId: booking._id
      });

      setMessages(prev => [...prev, response.data.message]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-2xl mx-4 h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <img
              src={booking.passengerId?.avatar || `https://ui-avatars.com/api/?name=${booking.passengerId?.firstName}+${booking.passengerId?.lastName}`}
              alt={`${booking.passengerId?.firstName} ${booking.passengerId?.lastName}`}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <h3 className="font-semibold">
                {booking.passengerId?.firstName} {booking.passengerId?.lastName}
              </h3>
              <p className="text-sm text-gray-500">
                {booking.rideId?.fromLocation} → {booking.rideId?.toLocation}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div
                key={message._id || index}
                className={`flex ${
                  message.senderId === currentUser._id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === currentUser._id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === currentUser._id ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={2}
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyRides;