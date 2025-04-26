import axios from 'axios';

// Create an axios instance with a base URL
const API_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const authAxios = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token in requests
authAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token refresh or logout on 401 errors
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If the error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Handle token expiration - logout the user
      if (error.response.data.message === 'Invalid token. Please log in again!') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }
      
      // You could implement token refresh logic here if needed
    }
    
    return Promise.reject(error);
  }
);

// Authentication Service Methods
const AuthService = {
  // Register a new user
  register: async (userData) => {
    const response = await authAxios.post('/users/register', userData);
    return response.data;
  },
  
  // Login user
  login: async (email, password) => {
    const response = await authAxios.post('/users/login', { email, password });
    
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  },
  
  // Logout user
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
  
  // Get user profile
  getProfile: async () => {
    const response = await authAxios.get('/users/profile');
    return response.data;
  },
  
  // Update user profile
  updateProfile: async (userData) => {
    const response = await authAxios.patch('/users/profile', userData);
    return response.data;
  },
  
  // Update password
  updatePassword: async (passwordData) => {
    const response = await authAxios.patch('/users/update-password', passwordData);
    return response.data;
  },
  
  // Forgot password
  forgotPassword: async (email) => {
    const response = await authAxios.post('/users/forgotPassword', { email });
    return response.data;
  },
  
  // Verify reset code
  verifyResetCode: async (email, resetCode) => {
    const response = await authAxios.post('/users/verifyResetCode', { email, resetCode });
    return response.data;
  },
  
  // Reset password
  resetPassword: async (email, resetCode, newPassword) => {
    const response = await authAxios.post('/users/resetPassword', { 
      email, 
      resetCode, 
      password: newPassword 
    });
    return response.data;
  }
};

export default AuthService;
export { authAxios }; 