import {create} from zustand;
import {persist} from 'zustand/middleware';
import api from '../lib/api'
import { socketService} from '../lib/socket';


export interface Notification {
    _id:string;
    userId: string;
    type: 'booking' | 'boooking_accepted' |'booking_declined' | 'booking_cancelled' | 'ride_reminder' | 'payment_success' | 'message_received';
    title:string;
    message:string;
    data:any;
    actionUrl?: string;
    createdAt: string
}

interface NotificationState {
    notification: Notification[];
    unreadCount: number;
    isloading:boolean;
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

