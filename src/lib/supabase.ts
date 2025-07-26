// Local storage utilities for data persistence
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
};

// Generate unique IDs
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Database types (kept for compatibility)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url?: string;
          phone?: string;
          date_of_birth?: string;
          bio?: string;
          rating: number;
          total_rides: number;
          is_driver: boolean;
          preferences: {
            chattiness: 'silent' | 'moderate' | 'talkative';
            music: boolean;
            smoking: boolean;
            pets: boolean;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          avatar_url?: string;
          phone?: string;
          date_of_birth?: string;
          bio?: string;
          rating?: number;
          total_rides?: number;
          is_driver?: boolean;
          preferences?: {
            chattiness: 'silent' | 'moderate' | 'talkative';
            music: boolean;
            smoking: boolean;
            pets: boolean;
          };
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          first_name?: string;
          last_name?: string;
          avatar_url?: string;
          phone?: string;
          date_of_birth?: string;
          bio?: string;
          rating?: number;
          total_rides?: number;
          is_driver?: boolean;
          preferences?: {
            chattiness: 'silent' | 'moderate' | 'talkative';
            music: boolean;
            smoking: boolean;
            pets: boolean;
          };
          updated_at?: string;
        };
      };
      rides: {
        Row: {
          id: string;
          driver_id: string;
          from_location: string;
          to_location: string;
          departure_date: string;
          departure_time: string;
          price_per_seat: number;
          available_seats: number;
          total_seats: number;
          description?: string;
          waypoints?: string[];
          vehicle: {
            make: string;
            model: string;
            color: string;
            license_plate: string;
          };
          preferences: {
            chattiness: 'silent' | 'moderate' | 'talkative';
            music: boolean;
            smoking: boolean;
            pets: boolean;
          };
          status: 'active' | 'completed' | 'cancelled';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          driver_id: string;
          from_location: string;
          to_location: string;
          departure_date: string;
          departure_time: string;
          price_per_seat: number;
          available_seats: number;
          total_seats: number;
          description?: string;
          waypoints?: string[];
          vehicle: {
            make: string;
            model: string;
            color: string;
            license_plate: string;
          };
          preferences: {
            chattiness: 'silent' | 'moderate' | 'talkative';
            music: boolean;
            smoking: boolean;
            pets: boolean;
          };
          status?: 'active' | 'completed' | 'cancelled';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          from_location?: string;
          to_location?: string;
          departure_date?: string;
          departure_time?: string;
          price_per_seat?: number;
          available_seats?: number;
          total_seats?: number;
          description?: string;
          waypoints?: string[];
          vehicle?: {
            make: string;
            model: string;
            color: string;
            license_plate: string;
          };
          preferences?: {
            chattiness: 'silent' | 'moderate' | 'talkative';
            music: boolean;
            smoking: boolean;
            pets: boolean;
          };
          status?: 'active' | 'completed' | 'cancelled';
          updated_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          ride_id: string;
          passenger_id: string;
          seats_booked: number;
          status: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
          message?: string;
          total_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ride_id: string;
          passenger_id: string;
          seats_booked: number;
          status?: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
          message?: string;
          total_amount: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          seats_booked?: number;
          status?: 'pending' | 'accepted' | 'declined' | 'completed' | 'cancelled';
          message?: string;
          total_amount?: number;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          sender_id: string;
          receiver_id: string;
          ride_id?: string;
          content: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          sender_id: string;
          receiver_id: string;
          ride_id?: string;
          content: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          content?: string;
          read?: boolean;
        };
      };
      reviews: {
        Row: {
          id: string;
          ride_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          ride_id: string;
          reviewer_id: string;
          reviewee_id: string;
          rating: number;
          comment?: string;
          created_at?: string;
        };
        Update: {
          rating?: number;
          comment?: string;
        };
      };
    };
  };
}