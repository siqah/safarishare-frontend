import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { socketService } from '../lib/socket';

export interface User {
  _id: string;
  clerkId: string;
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
  isLoading: boolean;
  error: string | null;
 
  updateProfile: (updates: Partial<User>) => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
  syncWithClerk: (clerkUser: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      syncWithClerk: async (clerkUser: any) => {
        if (!clerkUser) {
          set({ user: null });
          socketService.disconnect();
          return;
        }

        set({ isLoading: true, error: null });

        try {
          // Sync user data with our backend
          const response = await api.post('/users/sync', {
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress,
            firstName: clerkUser.firstName,
            lastName: clerkUser.lastName,
            avatar: clerkUser.imageUrl,
          });

          const user = response.data.user;
          set({ user, isLoading: false });

          // Connect to socket
          socketService.connect(user._id);
        } catch (error: any) {
          console.error('Sync with Clerk error:', error);
          const message = error.response?.data?.message || 'Failed to sync user data';
          set({ error: message, isLoading: false });
        }
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
          const response = await api.put('/users/profile', updates);
          
          const updatedUser = response.data.user;
          
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
        set({ isLoading: true });

        try {
          const response = await api.get('/users/profile');
          const { user } = response.data;
          
          set({ 
            user,
            isLoading: false 
          });

          // Connect to socket
          socketService.connect(user._id);
        } catch (error) {
          console.error('Fetch user error:', error);
          set({ 
            user: null,
            isLoading: false 
          });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user
      }),
    }
  )
);