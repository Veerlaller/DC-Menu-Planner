import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';

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

// Generate a proper UUID for testing (in production this would come from auth)
const getUserId = async (): Promise<string> => {
  let userId = await AsyncStorage.getItem('tempUserId');
  if (!userId) {
    // Generate a proper UUID v4 format
    userId = uuid.v4() as string;
    await AsyncStorage.setItem('tempUserId', userId);
  }
  return userId;
};

// Request interceptor for adding user ID header
apiClient.interceptors.request.use(
  async (config) => {
    // Add user ID header (for authentication)
    const userId = await getUserId();
    config.headers['x-user-id'] = userId;
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

