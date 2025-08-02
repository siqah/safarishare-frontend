import { useAuth } from '@clerk/clerk-react';
import api from './api';

// Helper function to create authenticated API calls
export const createAuthenticatedApi = () => {
  const { getToken } = useAuth();
  
  // Create a wrapper around the api instance
  const authenticatedApi = {
    get: async (url: string, config: any = {}) => {
      const token = await getToken();
      return api.get(url, {
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
    },
    
    post: async (url: string, data?: any, config: any = {}) => {
      const token = await getToken();
      return api.post(url, data, {
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
    },
    
    put: async (url: string, data?: any, config: any = {}) => {
      const token = await getToken();
      return api.put(url, data, {
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
    },
    
    delete: async (url: string, config: any = {}) => {
      const token = await getToken();
      return api.delete(url, {
        ...config,
        headers: {
          ...(config.headers || {}),
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
    },
  };
  
  return authenticatedApi;
};

// Export default API for non-authenticated calls
export default api;
