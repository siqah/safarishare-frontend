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
  syncWithClerk: (clerkUser: any, getToken?: () => Promise<string | null>) => Promise<void>;
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

        console.log('🔄 Syncing with Clerk user:', clerkUser);
        set({ isLoading: true, error: null });

        try {
          // First, try to sync with backend
          const response = await api.post('/api/users/sync', {});

          const user = response.data.user;
          console.log('✅ User synced with backend:', user);
          set({ user, isLoading: false });

          // Connect to socket
          socketService.connect(user._id);
        } catch (error: any) {
          console.error('❌ Backend sync failed:', error);
          
          // Fallback: create a minimal user object from Clerk data
          const fallbackUser = {
            _id: 'temp-' + clerkUser.id,
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            firstName: clerkUser.firstName || '',
            lastName: clerkUser.lastName || '',
            avatar: clerkUser.imageUrl || '',
            phone: '',
            dateOfBirth: '',
            bio: '',
            rating: 0,
            totalRides: 0,
            isDriver: false,
            preferences: {
              chattiness: 'moderate' as const,
              music: false,
              smoking: false,
              pets: false,
            },
            createdAt: new Date().toISOString(),
          };
          
          console.log('🔄 Using fallback user data:', fallbackUser);
          set({ user: fallbackUser, isLoading: false });
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