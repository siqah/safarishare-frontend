import { create } from "zustand";
import axios from "axios";



axios.defaults.withCredentials = true;

const API_URL = "http://localhost:10000/api/auth";
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  driverProfile: any;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean }>;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  getUser: () => Promise<{ id: string; email: string; name: string; role: string; driverProfile: any } | null>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: false,
  error: null,



  // Register
register: async (name, email, password) => {
  set({ loading: true, error: null });
  try {
    const res = await axios.post(`${API_URL}/register`, {
      name,
      email,
      password,
    });

    const { token, user } = res.data;
    localStorage.setItem("token", token);
    set({ token, user, loading: false });

    return { success: true, user, token };
  } catch (err: any) {
    set({
      loading: false,
      error: err.response?.data?.message || "Registration failed",
    });
    return { success: false };
  }
},

// Login
login: async (email, password) => {
  set({ loading: true, error: null });
  try {
    const res = await axios.post(`${API_URL}/login`, { email, password });

    const { token, user } = res.data;
    localStorage.setItem("token", token);
    set({ token, user, loading: false });

    return { success: true, user, token }; // ✅ user has role
  } catch (err: any) {
    set({
      loading: false,
      error: err.response?.data?.message || "Login failed",
    });
    return { success: false, user: null, token: null }; // ✅ consistent
  }
},



// Logout
  logout: async () => {
    localStorage.removeItem("token");
    set({ token: null, user: null });
    try {
      await axios.post(`${API_URL}/logout`);
    } catch (err) {
      // Ignore errors on logout
    }
  },

  // Refresh (attempt to refresh token/user data)
  refresh: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(`${API_URL}/refresh`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { token: newToken, user } = res.data;
      if (newToken) {
        localStorage.setItem("token", newToken);
        set({ token: newToken, user });
      } else if (user) {
        set({ user });
      }
    } catch (err) {
      localStorage.removeItem("token");
      set({ user: null, token: null });
    }
  },

  checkAuth: async () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  try {
    const res = await axios.get(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    set({ user: res.data, token });
  } catch (err) {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  }
},
   getUser: async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const res = await axios.get(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: res.data });
      return res.data;
    } catch (err) {
      localStorage.removeItem("token");
      set({ user: null, token: null });
      return null;
    }
  }

  
}));


export default useAuthStore;

export const useAuth = () => {
  const { user, token, loading, error, register, login, logout, refresh, getUser, checkAuth } = useAuthStore();
  return { user, token, loading, error, register, login, logout, refresh, getUser, checkAuth };
};
