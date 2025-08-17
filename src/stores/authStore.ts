import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { makeAuthenticatedRequest } from '../lib/api';
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
 
  updateProfile: (updates: Partial<User>, getToken?: () => Promise<string | null>) => Promise<void>;
  fetchUser: (getToken?: () => Promise<string | null>) => Promise<void>;
  clearError: () => void;
  syncWithClerk: (clerkUser: any, getToken?: () => Promise<string | null>) => Promise<void>;
  setAccountType: (isDriver: boolean, getToken?: () => Promise<string | null>) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,

      syncWithClerk: async (clerkUser: any, getToken?: () => Promise<string | null>) => {
        if (!clerkUser) {
          set({ user: null });
          socketService.disconnect();
          return;
        }

        console.log('🔄 Syncing with Clerk user:', clerkUser);
        set({ isLoading: true, error: null });

        try {
          const response = await makeAuthenticatedRequest('post', '/clerkUsers/sync', {}, getToken);

          const user = response.data.user as User;
          console.log('✅ User synced with backend:', user);
          set({ user, isLoading: false });

          socketService.connect(user._id);
        } catch (error: any) {
          console.error('❌ Backend sync failed:', error);
          
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
          } as User;
          
          console.log('🔄 Using fallback user data:', fallbackUser);
          set({ user: fallbackUser, isLoading: false });
        }
      },

      setAccountType: async (isDriver, getToken) => {
        const current = get().user;
        if (!current) return;
        set({ isLoading: true, error: null });
        try {
          // Use new account role selection endpoint
          const role = isDriver ? 'driver' : 'rider';
          const response = await makeAuthenticatedRequest('post', '/account/select-role', { role }, getToken);
          const updatedUser = response.data.user as User;
          set({ user: updatedUser, isLoading: false });
        } catch (error: any) {
          const message = error?.response?.data?.message || 'Failed to update account type';
          set({ error: message, isLoading: false });
          throw new Error(message);
        }
      },

      updateProfile: async (updates, getToken) => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });

        try {
          const response = getToken
            ? await makeAuthenticatedRequest('put', '/clerkUsers/profile', updates, getToken)
            : await api.put('/clerkUsers/profile', updates);
          
          const updatedUser = response.data.user as User;
          
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

      fetchUser: async (getToken) => {
        set({ isLoading: true });

        try {
          const response = getToken
            ? await makeAuthenticatedRequest('get', '/clerkUsers/profile', undefined, getToken)
            : await api.get('/clerkUsers/profile');
          const { user } = response.data as { user: User };
          
          set({ 
            user,
            isLoading: false,
          });

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
        user: state.user,
      }),
    }
  )
);