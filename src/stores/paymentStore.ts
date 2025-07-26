import { create } from 'zustand';

export interface PaymentMethod {
  id: string;
  type: 'mpesa';
  mpesa: {
    phoneNumber: string;
    accountName: string;
  };
  isDefault: boolean;
}

export interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  rideId: string;
  passengerId: string;
  driverId: string;
  platformFee: number;
  driverPayout: number;
  createdAt: string;
  mpesaTransactionId?: string;
  mpesaReceiptNumber?: string;
}

export interface DriverAccount {
  id: string;
  driverId: string;
  mpesaPhoneNumber: string;
  accountName: string;
  isVerified: boolean;
  payoutsEnabled: boolean;
  requirements: string[];
  createdAt: string;
}

interface PaymentState {
  paymentMethods: PaymentMethod[];
  payments: Payment[];
  driverAccounts: DriverAccount[];
  isLoading: boolean;
  error: string | null;
  
  // Payment Methods
  addPaymentMethod: (paymentMethod: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (paymentMethodId: string) => void;
  setDefaultPaymentMethod: (paymentMethodId: string) => void;
  
  // Payments
  createPayment: (rideId: string, amount: number, passengerId: string, driverId: string) => Promise<string>;
  processPayment: (paymentId: string, paymentMethodId: string) => Promise<boolean>;
  refundPayment: (paymentId: string, amount?: number) => Promise<boolean>;
  
  // Driver Accounts
  createDriverAccount: (driverId: string, mpesaPhoneNumber: string, accountName: string) => Promise<string>;
  getDriverAccount: (driverId: string) => DriverAccount | null;
  
  // Utils
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  paymentMethods: [],
  payments: [],
  driverAccounts: [],
  isLoading: false,
  error: null,

  addPaymentMethod: (paymentMethod) => {
    const newPaymentMethod: PaymentMethod = {
      ...paymentMethod,
      id: Date.now().toString(),
    };
    
    set(state => ({
      paymentMethods: [...state.paymentMethods, newPaymentMethod]
    }));
  },

  removePaymentMethod: (paymentMethodId) => {
    set(state => ({
      paymentMethods: state.paymentMethods.filter(pm => pm.id !== paymentMethodId)
    }));
  },

  setDefaultPaymentMethod: (paymentMethodId) => {
    set(state => ({
      paymentMethods: state.paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId
      }))
    }));
  },

  createPayment: async (rideId, amount, passengerId, driverId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Calculate platform fee (5% commission)
      const platformFee = Math.round(amount * 0.05 * 100) / 100;
      const driverPayout = amount - platformFee;
      
      const newPayment: Payment = {
        id: Date.now().toString(),
        amount,
        currency: 'KES',
        status: 'pending',
        rideId,
        passengerId,
        driverId,
        platformFee,
        driverPayout,
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({
        payments: [...state.payments, newPayment],
        isLoading: false
      }));
      
      return newPayment.id;
    } catch (error) {
      set({ error: 'Failed to create payment', isLoading: false });
      throw error;
    }
  },

  processPayment: async (paymentId, paymentMethodId) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate M-Pesa STK Push
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Generate mock M-Pesa transaction details
      const mpesaTransactionId = `MPT${Date.now()}`;
      const mpesaReceiptNumber = `RCP${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Update payment status
      set(state => ({
        payments: state.payments.map(payment =>
          payment.id === paymentId
            ? { 
                ...payment, 
                status: 'succeeded' as const,
                mpesaTransactionId,
                mpesaReceiptNumber
              }
            : payment
        ),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'M-Pesa payment failed', isLoading: false });
      return false;
    }
  },

  refundPayment: async (paymentId, amount) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simulate M-Pesa refund process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      set(state => ({
        payments: state.payments.map(payment =>
          payment.id === paymentId
            ? { ...payment, status: 'refunded' as const }
            : payment
        ),
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      set({ error: 'Refund failed', isLoading: false });
      return false;
    }
  },

  createDriverAccount: async (driverId, mpesaPhoneNumber, accountName) => {
    set({ isLoading: true, error: null });
    
    try {
      const newAccount: DriverAccount = {
        id: Date.now().toString(),
        driverId,
        mpesaPhoneNumber,
        accountName,
        isVerified: false,
        payoutsEnabled: false,
        requirements: ['phone_verification', 'identity_verification'],
        createdAt: new Date().toISOString(),
      };
      
      set(state => ({
        driverAccounts: [...state.driverAccounts, newAccount],
        isLoading: false
      }));
      
      return newAccount.id;
    } catch (error) {
      set({ error: 'Failed to create driver account', isLoading: false });
      throw error;
    }
  },

  getDriverAccount: (driverId) => {
    return get().driverAccounts.find(account => account.driverId === driverId) || null;
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));