import axios from 'axios';

const TOKEN_KEY = 'token';

// Debug environment variables
console.log('🔍 Environment Debug:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('MODE:', import.meta.env.MODE);
console.log('All env:', import.meta.env);

// Get API URL and ensure no trailing slash
const getApiUrl = () => {
  let apiUrl = import.meta.env.VITE_API_URL;
  
  // Fallback for production
  if (!apiUrl && import.meta.env.PROD) {
    apiUrl = 'https://safarshare-backend.onrender.com';
  }
  
  // Fallback for development
  if (!apiUrl && import.meta.env.DEV) {
    apiUrl = 'http://localhost:5001';
  }
  
  // Remove trailing slash
  if (apiUrl) {
    apiUrl = apiUrl.replace(/\/$/, '');
  }
  
  return apiUrl || 'http://localhost:5001';
};

const API_BASE_URL = getApiUrl();
console.log('🔗 Using API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout for Render cold starts
  withCredentials: true, // Important for CORS
});

// Enhanced request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Debug logging
    console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
    console.log('🔗 Full URL:', config.baseURL + config.url);
    console.log('📦 Data:', config.data);
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Enhanced response interceptor
api.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Enhanced error logging
    console.error('❌ API Error Details:');
    console.error('Status:', error.response?.status);
    console.error('Status Text:', error.response?.statusText);
    console.error('Headers:', error.response?.headers);
    console.error('Data:', error.response?.data);
    console.error('URL:', error.config?.url);
    console.error('Method:', error.config?.method);
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    
    // Handle rate limiting with retry
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.warn('Rate limited, retrying in 2 seconds...');
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
    
    return Promise.reject(error);
  }
);

export default api;