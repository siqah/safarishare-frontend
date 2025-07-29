import axios from 'axios';

const TOKEN_KEY = 'token';

// Only log in development
if (import.meta.env.DEV) {
  console.log('🔍 Environment Debug:');
  console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
  console.log('MODE:', import.meta.env.MODE);
}

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

// Only log in development
if (import.meta.env.DEV) {
  console.log('🔗 Using API URL:', API_BASE_URL);
}

// Wake up function for Render cold starts
const wakeUpBackend = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  try {
    if (import.meta.env.DEV) {
      console.log('🌅 Attempting to wake up backend...');
    }
    
    const response = await fetch(`${API_BASE_URL}/wake-up`, {
      method: 'GET',
      signal: controller.signal
    });
    
    if (response.ok) {
      const data = await response.json();
      if (import.meta.env.DEV) {
        console.log('✅ Backend wake-up successful:', data);
      }
      return true;
    }
  } catch (error) {
    // Only log in development
    if (import.meta.env.DEV) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.log('⚠️ Backend wake-up timed out, but continuing.');
        } else {
          console.log('⚠️ Backend wake-up failed, but continuing:', error.message);
        }
      }
    }
  } finally {
    clearTimeout(timeoutId);
  }
  return false;
};

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
  withCredentials: true,
});

// Enhanced request interceptor - minimal logging in production
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Only log in development
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', config.method?.toUpperCase(), config.url);
      console.log('🔗 Full URL:', (config.baseURL ?? '') + (config.url ?? ''));
      console.log('📦 Data:', config.data);
    }
    
    return config;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.error('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Enhanced response interceptor - minimal logging in production
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log('✅ API Success:', response.status, response.config.url);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Only detailed logging in development
    if (import.meta.env.DEV) {
      console.error('❌ API Error Details:');
      console.error('Status:', error.response?.status);
      console.error('Status Text:', error.response?.statusText);
      console.error('URL:', error.config?.url);
      console.error('Method:', error.config?.method);
      console.error('Error Code:', error.code);
      console.error('Error Message:', error.message);
    }
    
    // Handle network errors (likely cold start)
    if (error.code === 'ERR_NETWORK' && !originalRequest._retryCount) {
      originalRequest._retryCount = 1;
      
      if (import.meta.env.DEV) {
        console.log('🔄 Network error detected, attempting backend wake-up...');
      }
      
      await wakeUpBackend();
      
      if (import.meta.env.DEV) {
        console.log('⏳ Waiting for backend to start...');
      }
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      if (import.meta.env.DEV) {
        console.log('🔄 Retrying original request...');
      }
      return api(originalRequest);
    }
    
    // Handle timeout errors
    if (error.code === 'ECONNABORTED' && !originalRequest._retryCount) {
      originalRequest._retryCount = 1;
      
      if (import.meta.env.DEV) {
        console.log('⏰ Timeout detected, retrying with longer timeout...');
      }
      originalRequest.timeout = 90000;
      
      return api(originalRequest);
    }
    
    // Handle rate limiting
    if (error.response?.status === 429 && !originalRequest._retry) {
      originalRequest._retry = true;
      await new Promise(resolve => setTimeout(resolve, 2000));
      return api(originalRequest);
    }
    
    // Handle auth errors
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;