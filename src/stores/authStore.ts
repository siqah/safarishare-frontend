import { create } from "zustand";
import axios from "axios";



axios.defaults.withCredentials = true;

const API_URL = "http://localhost:10000/api/auth";

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean }>;
  login: (email: string, password: string) => Promise<{ success: boolean }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
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

    return { success: true };
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

    return { success: true };
  } catch (err: any) {
    set({
      loading: false,
      error: err.response?.data?.message || "Login failed",
    });
    return { success: false };
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

  // Refresh (get a new access token if expired)
  refresh: async () => {
    try {
      const res = await axios.post(`${API_URL}/refresh`);
      const { accessToken } = res.data;
      localStorage.setItem("token", accessToken);
      set({ token: accessToken });
    } catch (err) {
      set({ token: null, user: null, error: "Session expired" });
    }
  },
}));

export default useAuthStore;

export const useAuth = () => {
  const { user, token, loading, error, register, login, logout, refresh } = useAuthStore();
  return { user, token, loading, error, register, login, logout, refresh };
};
