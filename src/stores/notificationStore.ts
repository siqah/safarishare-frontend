import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { socketService } from '../lib/socket';

export interface Notification {
  _id: string;
  userId: string;
  type: 'booking_request' | 'booking_accepted' | 'booking_declined' | 'booking_cancelled' | 'ride_reminder' | 'payment_success' | 'message_received' | 'driver_approved' | 'driver_rejected';
  title: string;
  message: string;
  data: any;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  updateUnreadCount: () => void;
  clearError: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,

      fetchNotifications: async () => {
        // Prevent multiple simultaneous requests
        const state = get();
        if (state.isLoading) {
          console.log('Already fetching notifications, skipping...');
          return;
        }
        
        set({ isLoading: true, error: null });
        
        try {
          console.log('Fetching notifications...');
          
          const response = await api.get('/notifications');
          const notifications = response.data.notifications || [];
          
          const unreadCount = notifications.filter((n: Notification) => !n.read).length;
          
          set({ 
            notifications,
            unreadCount,
            isLoading: false 
          });
          
          console.log(`Fetched ${notifications.length} notifications (${unreadCount} unread)`);
        } catch (error: any) {
          console.error('Error fetching notifications:', error);
          
          // Don't set error state for rate limiting - just log it
          if (error.response?.status === 429) {
            console.warn('Rate limited while fetching notifications, will retry later');
            set({ isLoading: false });
          } else {
            const message = error.response?.data?.message || 'Failed to fetch notifications';
            set({ error: message, isLoading: false });
          }
        }
      },

      markAsRead: async (notificationId: string) => {
        try {
          await api.put(`/notifications/${notificationId}/read`);
          
          set(state => ({
            notifications: state.notifications.map(n => 
              n._id === notificationId ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1)
          }));
        } catch (error: any) {
          console.error('Error marking notification as read:', error);
        }
      },

      markAllAsRead: async () => {
        try {
          await api.put('/notifications/mark-all-read');
          
          set(state => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0
          }));
        } catch (error: any) {
          console.error('Error marking all notifications as read:', error);
        }
      },

      deleteNotification: async (notificationId: string) => {
        try {
          await api.delete(`/notifications/${notificationId}`);
          
          set(state => {
            const notification = state.notifications.find(n => n._id === notificationId);
            const wasUnread = notification && !notification.read;
            
            return {
              notifications: state.notifications.filter(n => n._id !== notificationId),
              unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
            };
          });
        } catch (error: any) {
          console.error('Error deleting notification:', error);
        }
      },

      clearAll: async () => {
        try {
          console.log('Clearing all notifications...');
          
          const response = await api.delete('/notifications/clear-all');
          
          if (response.data.success) {
            set({ 
              notifications: [],
              unreadCount: 0 
            });
            
            console.log('All notifications cleared successfully');
          } else {
            throw new Error(response.data.message || 'Failed to clear notifications');
          }
        } catch (error: any) {
          console.error('Error clearing all notifications:', error);
          console.error('Error response:', error.response?.data);
          
          // Don't throw the error, just log it so the UI doesn't break
          const message = error.response?.data?.message || error.message || 'Failed to clear notifications';
          set({ error: message });
          
          // Show user-friendly error
          alert(`Failed to clear notifications: ${message}`);
        }
      },

      addNotification: (notification: Notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }));
      },

      updateUnreadCount: () => {
        set(state => ({
          unreadCount: state.notifications.filter(n => !n.read).length
        }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({ 
        notifications: state.notifications.slice(0, 50), // Only persist last 50 notifications
        unreadCount: state.unreadCount 
      }),
    }
  )
);

// Setup real-time notification listener
export const setupNotificationListener = (userId: string) => {
  const socket = socketService.getSocket();
  if (!socket) return;

  socket.on('new-notification', (data: { notification?: Notification; type?: string; title?: string; message?: string; bookingId?: string }) => {
    console.log('Real-time notification received:', data);
    
    // Handle different notification formats
    if (data.notification) {
      // Complete notification object
      useNotificationStore.getState().addNotification(data.notification);
    } else if (data.type && data.title && data.message) {
      // Create notification from event data
      const notification: Notification = {
        _id: Date.now().toString(), // Temporary ID
        userId,
        type: data.type as any,
        title: data.title,
        message: data.message,
        data: { bookingId: data.bookingId },
        read: false,
        createdAt: new Date().toISOString()
      };
      useNotificationStore.getState().addNotification(notification);
    }
    
    // Fetch fresh notifications from server
    setTimeout(() => {
      useNotificationStore.getState().fetchNotifications();
    }, 1000);
  });
};