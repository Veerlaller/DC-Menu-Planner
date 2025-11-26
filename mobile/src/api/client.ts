import axios from 'axios';
import { supabase } from '../lib/supabase';

// Backend API URL
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:4000/api' 
  : 'https://your-production-api.com/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding authentication
apiClient.interceptors.request.use(
  async (config) => {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      // Add JWT token for backend verification
      config.headers['Authorization'] = `Bearer ${session.access_token}`;
      // Add user ID for convenience
      config.headers['x-user-id'] = session.user.id;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

