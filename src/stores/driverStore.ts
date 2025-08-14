import { create } from 'zustand';
import { makeAuthenticatedRequest } from '../lib/api';

export interface DriverApplication {
  _id?: string;
  userId: string;
  licenseNumber: string;
  licenseExpiry: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    color: string;
    plateNumber: string;
    seats: number;
  };
  status: 'pending' | 'approved' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

interface DriverState {
  application: DriverApplication | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  submitApplication: (applicationData: Omit<DriverApplication, '_id' | 'userId' | 'status'>, getToken?: (options?: any) => Promise<string | null>) => Promise<void>;
  getApplication: (getToken?: (options?: any) => Promise<string | null>) => Promise<void>;
  updateApplication: (updates: Partial<DriverApplication>, getToken?: (options?: any) => Promise<string | null>) => Promise<void>;
  clearError: () => void;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  application: null,
  isLoading: false,
  error: null,

  submitApplication: async (applicationData, getToken) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await makeAuthenticatedRequest('post', '/driver/apply', {
        licenseNumber: applicationData.licenseNumber,
        licenseExpiry: applicationData.licenseExpiry,
        vehicleInfo: applicationData.vehicleInfo,
      }, getToken);

      set({ 
        application: response.data.application,
        isLoading: false 
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to submit application';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  getApplication: async (getToken) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await makeAuthenticatedRequest('get', '/driver/application', undefined, getToken);
      
      set({ 
        application: response.data.application,
        isLoading: false 
      });
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No application found
        set({ application: null, isLoading: false });
      } else {
        const message = error.response?.data?.message || 'Failed to fetch application';
        set({ error: message, isLoading: false });
      }
    }
  },

  updateApplication: async (updates, getToken) => {
    const { application } = get();
    if (!application?._id) return;

    set({ isLoading: true, error: null });

    try {
      const response = await makeAuthenticatedRequest('put', `/driver/application/${application._id}`, updates, getToken);
      
      set({ 
        application: response.data.application,
        isLoading: false 
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update application';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  clearError: () => set({ error: null }),
}));