import { create } from 'zustand';
import api from '../lib/api';

interface User {
  _id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  role: 'rider' | 'driver' | 'admin';
  isDriver: boolean;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  preferences?: {
    chattiness: 'quiet' | 'moderate' | 'chatty';
    music: boolean;
    smoking: boolean;
    pets: boolean;
  };
  rating: number;
  totalRides: number;
  isActive: boolean;
  emailVerified: boolean;
}

type AuthState = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  syncWithClerk: () => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  selectRole: (role: 'rider' | 'driver') => Promise<boolean>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  loading: false,

  syncWithClerk: async () => {
    try {
      set({ loading: true });
      
      // Get current user profile from backend
      const response = await api.get('/users/me');
      
      if (response.data.success) {
        set({ 
          user: response.data.user, 
          isAuthenticated: true,
          loading: false 
        });
      }
    } catch (error) {
      console.error('Failed to sync with backend:', error);
      set({ 
        user: null, 
        isAuthenticated: false,
        loading: false 
      });
    }
  },

  logout: () => {
    set({ 
      isAuthenticated: false, 
      user: null, 
      loading: false 
    });
  },

  updateUser: (updates: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...updates } });
    }
  },

  selectRole: async (role: 'rider' | 'driver') => {
    try {
      const response = await api.post('/account/select-role', { role });
      
      if (response.data.success) {
        get().updateUser({ 
          role, 
          isDriver: role === 'driver' 
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to select role:', error);
      return false;
    }
  }
}));