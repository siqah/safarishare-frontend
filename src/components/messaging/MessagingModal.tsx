import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, Phone, User } from 'lucide-react';
import api from '../../lib/api';
import { Message } from '../../stores/chatStore';
import {socketService} from '../../lib/socket';

interface PassengerUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  rating?: number;
  phone?: string;
}

interface DriverUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  rating?: number;
  phone?: string;
}

interface RideInfo {
  _id: string;
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  pricePerSeat: number;
  driverId?: DriverUser;
}

interface Booking {
  _id: string;
  rideId: RideInfo;
  passengerId: PassengerUser;
  seatsBooked: number;
  status: 'pending' | 'accepted' | 'declined' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  message?: string;
  totalAmount: number;
  mpesaReceiptNumber?: string;
  createdAt: string;
}

interface CurrentUser {
  _id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  email: string;
  phone?: string;
  rating?: number;
}

interface MessagingModalProps {
  booking: Booking;
  currentUser: CurrentUser;
  onClose: () => void;
}

const MessagingModal: React.FC<MessagingModalProps> = ({ booking, currentUser, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (booking?.passengerId?._id) {
      fetchMessages();
    }
  }, [booking]);

  const fetchMessages = async (): Promise<void> => {
    try {
      setLoading(true);
      const otherUserId = isDriver ? booking.passengerId._id : booking.rideId.driverId?._id;
      const response = await api.get(`/messages/conversation/${otherUserId}`);
      const fetchedMessages: Message[] = response.data.messages || [];
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (): Promise<void> => {
    if (!newMessage.trim() || sending) return;

    const messageContent = newMessage.trim();
    setSending(true);
    
    try {
      const response = await api.post('/messages', {
        receiverId: isDriver ? booking.passengerId._id : booking.rideId.driverId?._id,
        content: messageContent,
        bookingId: booking._id,
        rideId: booking.rideId._id
      });

      const sentMessage: Message = response.data.message;
      
      // Add message to local state
      setMessages(prev => [...prev, sentMessage]);
      
      // Emit via socket for real-time delivery
      const socket = socketService.getSocket();
      if (socket?.connected) {
        socket.emit('send-message', {
          receiverId: isDriver ? booking.passengerId._id : booking.rideId.driverId?._id,
          message: sentMessage,
          sender: currentUser
        });
      }
      
      setNewMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || 'Failed to send message. Please try again.';
      alert(errorMessage);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!booking || !currentUser) return null;

  const isDriver: boolean = currentUser._id !== booking.passengerId._id;
  const otherUser: PassengerUser | DriverUser | undefined = isDriver 
    ? booking.passengerId 
    : booking.rideId?.driverId;

  if (!otherUser) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-md">
          <p className="text-center text-gray-600">Unable to load user information.</p>
          <button 
            onClick={onClose}
            className="mt-4 w-full bg-gray-500 text-white py-2 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl h-[600px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50 rounded-t-xl">
          <div className="flex items-center space-x-4">
            <img
              src={
                otherUser.avatar || 
                `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}&background=3b82f6&color=fff`
              }
              alt={`${otherUser.firstName} ${otherUser.lastName}`}
              className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
            />
            <div>
              <h3 className="font-semibold text-lg text-gray-900">
                {otherUser.firstName} {otherUser.lastName}
              </h3>
              <p className="text-sm text-gray-500 flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{isDriver ? 'Passenger' : 'Driver'}</span>
                {otherUser.rating && (
                  <>
                    <span className="mx-1">•</span>
                    <span>⭐ {otherUser.rating.toFixed(1)}</span>
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {otherUser.phone && (
              <a
                href={`tel:${otherUser.phone}`}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Call"
              >
                <Phone className="w-5 h-5" />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Ride Info */}
        <div className="px-6 py-3 bg-blue-50 border-b border-blue-100">
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="font-medium text-blue-900">
                {booking.rideId.fromLocation} → {booking.rideId.toLocation}
              </span>
              <span className="ml-2 text-blue-700">
                {new Date(booking.rideId.departureDate).toLocaleDateString()} at {booking.rideId.departureTime}
              </span>
            </div>
            <div className="text-blue-700">
              {booking.seatsBooked} seat(s) • KSh {booking.totalAmount}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500 text-sm">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h4>
                <p className="text-gray-500 text-sm max-w-sm">
                  Send a message to {otherUser.firstName} about your ride plans or any questions you might have.
                </p>
              </div>
            </div>
          ) : (
            messages.map((message: Message, index: number) => {
              const isCurrentUser: boolean = message.senderId === currentUser._id;
              return (
                <div
                  key={message._id || index}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-end space-x-2 max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    {!isCurrentUser && (
                      <img
                        src={
                          otherUser.avatar || 
                          `https://ui-avatars.com/api/?name=${otherUser.firstName}+${otherUser.lastName}&background=6b7280&color=fff`
                        }
                        alt={otherUser.firstName}
                        className="w-6 h-6 rounded-full"
                      />
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl shadow-sm ${
                        isCurrentUser
                          ? 'bg-blue-600 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.createdAt)}
                        {!message.read && isCurrentUser && (
                          <span className="ml-1">✓</span>
                        )}
                        {message.read && isCurrentUser && (
                          <span className="ml-1 text-blue-200">✓✓</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={`Message ${otherUser.firstName}...`}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-gray-50 focus:bg-white transition-colors"
                rows={2}
                maxLength={1000}
                disabled={sending}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {newMessage.length}/1000
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                !newMessage.trim() || sending
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-105 active:scale-95'
              }`}
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span className="hidden sm:block">
                {sending ? 'Sending...' : 'Send'}
              </span>
            </button>
          </div>
          
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>Press Enter to send, Shift+Enter for new line</span>
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span>Secure messaging</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingModal;