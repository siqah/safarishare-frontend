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
  bookings?: BookingRequest[];
}

export interface BookingRequest {
  _id: string;
  rideId: {
    _id: string;
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    departureTime: string;
    pricePerSeat: number;
  };
  passengerId: {
    _id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    rating: number;
    phone?: string;
  };
  seatsBooked: number;
  status: 'pending' | 'accepted' | 'declined' | 'confirmed' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';
  message?: string;
  totalAmount: number;
  mpesaReceiptNumber?: string;
  createdAt: string;
}

interface RideState {
  rides: Ride[];
  myRides: Ride[];
  bookingRequests: BookingRequest[];
  confirmedBookings: BookingRequest[];
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
  declineBooking: (bookingId: string, reason?: string) => Promise<void>;
  getRidesByDriver: (driverId: string) => Promise<Ride[]>;
  getBookingsByPassenger: (passengerId: string) => Promise<BookingRequest[]>;
  getBookingRequests: () => Promise<BookingRequest[]>;
  getConfirmedBookings: () => Promise<BookingRequest[]>;
  fetchRides: () => Promise<void>;
  clearError: () => void;
}

export const useRideStore = create<RideState>((set, get) => ({
  rides: [],
  myRides: [],
  bookingRequests: [],
  confirmedBookings: [],
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
        myRides: [...state.myRides, newRide],
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
      const response = await api.post(`/bookings/${bookingId}/accept`);
      
      set(state => ({
        bookingRequests: state.bookingRequests.filter(booking => booking._id !== bookingId),
        isLoading: false
      }));
      
      // Refresh booking requests
      get().getBookingRequests();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to accept booking';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  declineBooking: async (bookingId, reason) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await api.post(`/bookings/${bookingId}/decline`, { reason });
      
      set(state => ({
        bookingRequests: state.bookingRequests.filter(booking => booking._id !== bookingId),
        isLoading: false
      }));
      
      // Refresh booking requests
      get().getBookingRequests();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to decline booking';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  getRidesByDriver: async (driverId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/rides/driver/${driverId}`);
      const rides = response.data.rides || [];
      set({ myRides: rides, isLoading: false });
      return rides;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get rides';
      set({ error: message, isLoading: false });
      return [];
    }
  },

  getBookingsByPassenger: async (passengerId) => {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data.bookings || [];
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get bookings';
      set({ error: message });
      return [];
    }
  },

  getBookingRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/bookings/requests');
      const requests = response.data.requests || [];
      set({ bookingRequests: requests, isLoading: false });
      return requests;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get booking requests';
      set({ error: message, isLoading: false });
      return [];
    }
  },

  getConfirmedBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/bookings/ride-bookings');
      const bookings = response.data.bookings || [];
      set({ confirmedBookings: bookings, isLoading: false });
      return bookings;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get confirmed bookings';
      set({ error: message, isLoading: false });
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