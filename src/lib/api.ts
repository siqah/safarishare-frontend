import axios from "axios";
import useAuth from "../stores/authStore"; // adjust if it's a named export

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:10000/api",
  withCredentials: false,
});

// Attach token automatically
api.interceptors.request.use((cfg) => {
  const token = useAuth.getState().token;
  if (token) {
    cfg.headers.Authorization = `Bearer ${token}`;
  }
  return cfg;
});

// Handle expired/invalid tokens
api.interceptors.response.use(
  (response) => response, // pass through successful responses
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuth.getState();
      logout(); 
      window.location.href = "/login"; 
    }
    return Promise.reject(error);
  }
);

export default api;
