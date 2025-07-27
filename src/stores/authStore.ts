import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { socketService } from '../lib/socket';

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  dateOfBirth?: string;
  bio?: string;
  rating: number;
  totalRides: number;
  isDriver: boolean;
  preferences: {
    chattiness: 'silent' | 'moderate' | 'talkative';
    music: boolean;
    smoking: boolean;
    pets: boolean;
  };
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

const TOKEN_KEY = 'token'; // Use consistent key

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          console.log('Attempting login for:', email);
          
          const response = await api.post('/auth/login', { email, password });
          console.log('Login response:', response.data);
          
          const { token, user } = response.data;
          
          if (!token) {
            throw new Error('No token received from server');
          }
          
          // Store token and user data with consistent key
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem('user', JSON.stringify(user));
          
          console.log('Token stored in localStorage:', !!localStorage.getItem(TOKEN_KEY));
          
          set({ 
            user, 
            token, 
            isAuthenticated: true, 
            isLoading: false 
          });
          
          // Connect to socket
          socketService.connect(user._id);
          
          return { success: true };
        } catch (error: any) {
          console.error('Login error:', error);
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false });
          return { success: false, error: message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await api.post('/auth/register', userData);
          const { token, user } = response.data;
          
          // Use consistent token key
          localStorage.setItem(TOKEN_KEY, token);
          localStorage.setItem('user', JSON.stringify(user));
          
          set({ 
            user, 
            token,
            isAuthenticated: true,
            isLoading: false 
          });

          // Connect to socket
          socketService.connect(user._id);
        } catch (error: any) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear consistent token key
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('user');
          socketService.disconnect();
          
          set({ 
            user: null, 
            token: null,
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
          const response = await api.put('/users/profile', updates);
          
          const updatedUser = response.data.user;
          localStorage.setItem('user', JSON.stringify(updatedUser));
          
          set({
            user: updatedUser,
            isLoading: false
          });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Profile update failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      fetchUser: async () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) {
          set({ isAuthenticated: false, user: null, token: null });
          return;
        }

        set({ isLoading: true });

        try {
          const response = await api.get('/auth/me');
          const { user } = response.data;
          
          set({ 
            user, 
            token,
            isAuthenticated: true,
            isLoading: false 
          });

          // Connect to socket
          socketService.connect(user._id);
        } catch (error) {
          console.error('Fetch user error:', error);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('user');
          set({ 
            user: null, 
            token: null,
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);

// Initialize auth on app start
const token = localStorage.getItem(TOKEN_KEY);
if (token) {
  useAuthStore.getState().fetchUser();
}