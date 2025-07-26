import { create } from 'zustand';
import api from '../lib/api';

export interface Ride {
  _id: string;
  driverId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
    totalRides: number;
  };
  fromLocation: string;
  toLocation: string;
  departureDate: string;
  departureTime: string;
  pricePerSeat: number;
  availableSeats: number;
  totalSeats: number;
  description?: string;
  waypoints?: string[];
  vehicle: {
    make: string;
    model: string;
    color: string;
    licensePlate: string;
  };
  preferences: {
    chattiness: 'silent' | 'moderate' | 'talkative';
    music: boolean;
    smoking: boolean;
    pets: boolean;
  };
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface BookingRequest {
  _id: string;
  rideId: string;
  passengerId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
  };
  seatsBooked: number;
  status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
  message?: string;
  totalAmount: number;
  createdAt: string;
}

interface RideState {
  rides: Ride[];
  bookingRequests: BookingRequest[];
  searchResults: Ride[];
  searchFilters: {
    from: string;
    to: string;
    date: string;
    maxPrice?: number;
    minSeats?: number;
  };
  isLoading: boolean;
  error: string | null;
  
  // Actions
  createRide: (ride: any) => Promise<void>;
  searchRides: (filters: Partial<RideState['searchFilters']>) => Promise<void>;
  bookRide: (rideId: string, seats: number, passengerId: string, message?: string) => Promise<void>;
  acceptBooking: (bookingId: string) => Promise<void>;
  declineBooking: (bookingId: string) => Promise<void>;
  getRidesByDriver: (driverId: string) => Promise<Ride[]>;
  getBookingsByPassenger: (passengerId: string) => Promise<BookingRequest[]>;
  fetchRides: () => Promise<void>;
  clearError: () => void;
}

export const useRideStore = create<RideState>((set, get) => ({
  rides: [],
  bookingRequests: [],
  searchResults: [],
  searchFilters: {
    from: '',
    to: '',
    date: '',
  },
  isLoading: false,
  error: null,

  createRide: async (rideData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/rides', rideData);
      const newRide = response.data.ride;
      
      set(state => ({ 
        rides: [...state.rides, newRide], 
        isLoading: false 
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create ride';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  searchRides: async (filters) => {
    set({ isLoading: true, error: null, searchFilters: { ...get().searchFilters, ...filters } });
    
    try {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.date) params.append('date', filters.date);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.minSeats) params.append('minSeats', filters.minSeats.toString());
      
      const response = await api.get(`/rides/search?${params.toString()}`);
      
      set({ 
        searchResults: response.data.rides, 
        isLoading: false 
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to search rides';
      set({ error: message, isLoading: false });
    }
  },

  bookRide: async (rideId, seatsBooked, passengerId, message) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post('/bookings', {
        rideId,
        seatsBooked,
        message
      });
      
      const newBooking = response.data.booking;
      
      set(state => ({ 
        bookingRequests: [...state.bookingRequests, newBooking], 
        isLoading: false 
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to book ride';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  acceptBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.put(`/bookings/${bookingId}/accept`);
      
      set(state => ({
        bookingRequests: state.bookingRequests.map(booking =>
          booking._id === bookingId ? response.data.booking : booking
        ),
        isLoading: false
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to accept booking';
      set({ error: message, isLoading: false });
    }
  },

  declineBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.put(`/bookings/${bookingId}/decline`);
      
      set(state => ({
        bookingRequests: state.bookingRequests.map(booking =>
          booking._id === bookingId ? response.data.booking : booking
        ),
        isLoading: false
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to decline booking';
      set({ error: message, isLoading: false });
    }
  },

  getRidesByDriver: async (driverId) => {
    try {
      const response = await api.get(`/rides/driver/${driverId}`);
      return response.data.rides;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get rides';
      set({ error: message });
      return [];
    }
  },

  getBookingsByPassenger: async (passengerId) => {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data.bookings;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get bookings';
      set({ error: message });
      return [];
    }
  },

  fetchRides: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.get('/rides/search');
      
      set({ 
        rides: response.data.rides, 
        isLoading: false 
      });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch rides';
      set({ error: message, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));