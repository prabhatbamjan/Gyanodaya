
import axios from 'axios';
// Get the authentication token
export const getToken = () => localStorage.getItem('authToken');

// Check if the user is authenticated
export const isAuthenticated = () => !!getToken();

// Get the user role
export const getUserRole = () => localStorage.getItem('userRole');

// Get user data
export const getUserData = () => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

// Log out the user
export const logout = () => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userData');
  // Redirect to home page or login page
  window.location.href = '/';
};

// Check if user has required role
export const hasRole = (requiredRoles = []) => {
  const userRole = getUserRole();
  
  if (!userRole) return false;
  
  // If no specific roles are required, or user is admin, allow access
  if (requiredRoles.length === 0 || userRole === 'admin') return true;
  
  // Check if user's role is in the list of required roles
  return requiredRoles.includes(userRole);
};

const authAxios = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add Authorization header if token exists
authAxios.interceptors.request.use(config => {
  const token = getToken();
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// Intercept 401 errors to auto-logout
authAxios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      alert('Session expired. Please log in again.');
      logout();
    }
    return Promise.reject(error);
  }
);
export const isValidPassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter.' };
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter.' };
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number.' };
  }

  if (!/[\W_]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one special character.' };
  }

  return { valid: true, message: 'Password is valid.' };
};


export default authAxios;