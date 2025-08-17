import { create } from 'zustand';

export interface DriverApplication {}

interface DriverState {
  application: null;
  isLoading: boolean;
  error: string | null;
  submitApplication: (...args: any[]) => Promise<void>;
  getApplication: (...args: any[]) => Promise<void>;
  updateApplication: (...args: any[]) => Promise<void>;
  clearError: () => void;
}

export const useDriverStore = create<DriverState>(() => ({
  application: null,
  isLoading: false,
  error: null,
  submitApplication: async () => { throw new Error('Driver applications are no longer supported.'); },
  getApplication: async () => { /* no-op */ },
  updateApplication: async () => { throw new Error('Driver applications are no longer supported.'); },
  clearError: () => {}
}));