import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';
import { socketService } from '../lib/socket';
import { setApiUserId } from '../lib/api';

export interface User {
  _id: string;
  // clerkId removed; using header-based identification now
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
  setAccountType: (isDriver: boolean) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      setAccountType: async (isDriver) => {
        const current = get().user;
        if (!current) return;
        set({ isLoading: true, error: null });
        try {
          const role = isDriver ? 'driver' : 'rider';
          const response = await api.post('/account/select-role', { role });
          const updatedUser = response.data.user as User;
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          const message = error?.response?.data?.message || 'Failed to update account type';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      updateProfile: async (updates) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
          const response = await api.put('/users/me', updates);
          const updatedUser = response.data.user as User;
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          const message = error.response?.data?.message || 'Profile update failed';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/users/me');
          const { user } = response.data as { user: User };

          // Set X-User-Id for subsequent API calls and connect socket
          setApiUserId(user._id);
          set({ user, isLoading: false });
          socketService.connect(user._id);
        } catch (error) {
          console.error('Fetch user error:', error);
          set({ user: null, isLoading: false });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user,
      }),
    }
  )
);