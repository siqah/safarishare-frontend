import { create } from 'zustand';
import api from '../lib/api';
import { socketService } from '../lib/socket';

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  rideId?: string;
  content: string;
  read: boolean;
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  otherUser: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
}

interface ChatState {
  messages: Message[];
  chatRooms: ChatRoom[];
  activeChat: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  sendMessage: (receiverId: string, content: string, rideId?: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  getMessagesForChat: (userId: string) => Promise<Message[]>;
  getChatRooms: (userId: string) => Promise<ChatRoom[]>;
  setActiveChat: (chatId: string | null) => void;
  subscribeToMessages: (userId: string) => () => void;
  clearError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  chatRooms: [],
  activeChat: null,
  isLoading: false,
  error: null,

  sendMessage: async (receiverId, content, rideId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/messages', {
        receiverId,
        content,
        rideId
      });
      
      const newMessage = response.data.data;
      
      set(state => ({ 
        messages: [...state.messages, newMessage], 
        isLoading: false 
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to send message';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  markAsRead: async (messageId) => {
    try {
      await api.put(`/messages/${messageId}/read`);

      set(state => ({
        messages: state.messages.map(msg =>
          msg._id === messageId ? { ...msg, read: true } : msg
        ),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to mark as read';
      set({ error: message });
    }
  },

  getMessagesForChat: async (userId) => {
    try {
      const response = await api.get(`/messages/conversation/${userId}`);
      return response.data.messages;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get messages';
      set({ error: message });
      return [];
    }
  },

  getChatRooms: async (userId) => {
    try {
      const response = await api.get('/messages/conversations');
      const conversations = response.data.conversations;
      
      set({ chatRooms: conversations });
      return conversations;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get conversations';
      set({ error: message });
      return [];
    }
  },

  setActiveChat: (chatId) => {
    set({ activeChat: chatId });
  },

  subscribeToMessages: (userId) => {
    const socket = socketService.getSocket();
    if (!socket) return () => {};

    const handleNewMessage = (data: any) => {
      set(state => ({
        messages: [...state.messages, data.message]
      }));
    };

    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('new-message', handleNewMessage);
    };
  },

  clearError: () => set({ error: null }),
}));