import axios from 'axios';

const TOKEN_KEY = 'token'; // Use same key as auth store

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log('API Request - Token found:', !!token);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request - Authorization header set');
    } else {
      console.warn('API Request - No token found in localStorage');
    }
    
    return config;
  },
  (error) => {
    console.error('API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      console.warn('Token expired or invalid, clearing localStorage');
      // Token expired or invalid
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('user');
      
      // Import auth store to clear state
      import('../stores/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
      });
      
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;