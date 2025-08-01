import { create } from 'zustand';
import api from '../lib/api';

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
  documents: {
    license: File | string;
    registration: File | string;
    insurance: File | string;
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
  submitApplication: (applicationData: Omit<DriverApplication, '_id' | 'userId' | 'status'>) => Promise<void>;
  getApplication: () => Promise<void>;
  updateApplication: (updates: Partial<DriverApplication>) => Promise<void>;
  clearError: () => void;
}

export const useDriverStore = create<DriverState>((set, get) => ({
  application: null,
  isLoading: false,
  error: null,

  submitApplication: async (applicationData) => {
    set({ isLoading: true, error: null });
    
    try {
      const formData = new FormData();
      
      // Add basic info
      formData.append('licenseNumber', applicationData.licenseNumber);
      formData.append('licenseExpiry', applicationData.licenseExpiry);
      
      // Add vehicle info
      formData.append('vehicleInfo', JSON.stringify(applicationData.vehicleInfo));
      
      // Add documents
      if (applicationData.documents.license instanceof File) {
        formData.append('license', applicationData.documents.license);
      }
      if (applicationData.documents.registration instanceof File) {
        formData.append('registration', applicationData.documents.registration);
      }
      if (applicationData.documents.insurance instanceof File) {
        formData.append('insurance', applicationData.documents.insurance);
      }

      const response = await api.post('/driver/apply', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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

  getApplication: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/driver/application');
      
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

  updateApplication: async (updates) => {
    const { application } = get();
    if (!application?._id) return;

    set({ isLoading: true, error: null });

    try {
      const response = await api.put(`/driver/application/${application._id}`, updates);
      
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