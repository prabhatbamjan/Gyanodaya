
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
  baseURL: 'http://localhost:5000/api', // adjust this as needed
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


export default authAxios;