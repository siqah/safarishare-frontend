import axios from 'axios';

const TOKEN_KEY = 'token';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and retries
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle rate limiting with retry
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      console.warn('Rate limited, retrying in 2 seconds...');
      
      // Wait 2 seconds and retry
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return api(originalRequest);
    }
    
    // Handle auth errors
    if (error.response?.status === 401) {
      console.warn('Token expired or invalid, clearing localStorage');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('user');
      
      // Import auth store to clear state
      import('../stores/authStore').then(({ useAuthStore }) => {
        useAuthStore.getState().logout();
      });
      
      window.location.href = '/login';
    }
    
    // Log other errors
    console.error('API Response error:', error.response?.status, error.response?.data);
    
    return Promise.reject(error);
  }
);

export default api;