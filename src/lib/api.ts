import axios from "axios";
import useAuth from "../stores/authStore"; // adjust if it's a named export

const api = axios.create({
  // Prefer env var; fallback to deployed backend; final fallback to localhost for local dev
  baseURL: import.meta.env.VITE_API_URL || "https://safarshare-backend.onrender.com" || "http://localhost:3000",
  withCredentials: false,
  // Avoid hanging UI on unreachable hosts (e.g., wrong base URL in prod)
  timeout: 15000,
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
