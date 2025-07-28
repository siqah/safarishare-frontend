import React from 'react';
import { Bell, Car, MessageSquare, CreditCard, X, Trash2 } from 'lucide-react';
import { useNotificationStore, type Notification } from '../../stores/notificationStore';
import { formatDistanceToNow } from 'date-fns';

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();

  if (!isOpen) return null;

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'booking_request':
      case 'booking_accepted':
      case 'booking_declined':
      case 'booking_cancelled':
        return <Car className="w-4 h-4" />;
      case 'message_received':
        return <MessageSquare className="w-4 h-4" />;
      case 'payment_success':
        return <CreditCard className="w-4 h-4" />;
      case 'ride_reminder':
        return <Bell className="w-4 h-4" />;
      case 'driver_approved':
      case 'driver_rejected':
        return <Car className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'booking_request':
        return 'text-blue-600 bg-blue-100';
      case 'booking_accepted':
      case 'driver_approved':
        return 'text-green-600 bg-green-100';
      case 'booking_declined':
      case 'booking_cancelled':
      case 'driver_rejected':
        return 'text-red-600 bg-red-100';
      case 'message_received':
        return 'text-purple-600 bg-purple-100';
      case 'payment_success':
        return 'text-green-600 bg-green-100';
      case 'ride_reminder':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      await markAsRead(notification._id);
    }
    
    // Navigate to relevant page if actionUrl exists
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    await clearAll();
  };

  const handleDeleteNotification = async (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteNotification(notificationId);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown */}
      <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
        {/* Header */}
        <div className="px-4 py-2 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="px-4 py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
          </div>
        )}

        {/* Notifications List */}
        {!isLoading && (
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-l-4 transition-colors relative group ${
                    notification.read 
                      ? 'border-transparent' 
                      : 'border-blue-500 bg-blue-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-1.5 rounded-full ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium ${
                        notification.read ? 'text-gray-700' : 'text-gray-900'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className={`text-sm mt-0.5 ${
                        notification.read ? 'text-gray-500' : 'text-gray-700'
                      }`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Delete Button */}
                    <button
                      onClick={(e) => handleDeleteNotification(notification._id, e)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-4 py-12 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="font-medium">No notifications</p>
                <p className="text-sm">You're all caught up!</p>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {notifications.length > 0 && !isLoading && (
          <div className="px-4 py-2 border-t border-gray-200 flex items-center justify-between">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors ml-auto"
            >
              Clear all
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationDropdown;
