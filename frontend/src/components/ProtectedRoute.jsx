import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole } from '../utils/auth';

// Protected route component that checks authentication and role
const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const location = useLocation();
  
  // First check if user is authenticated
  if (!isAuthenticated()) {
    // Redirect to login page, but save the attempted URL
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  // Then check if user has the required role
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    // User doesn't have the required role
    return <Navigate to="/unauthorized" replace />;
  }
  
  // User is authenticated and has the required role
  return children;
};

export default ProtectedRoute; 