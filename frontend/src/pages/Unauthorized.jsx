import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Shield, ArrowLeft } from 'lucide-react';
import { getUserRole } from '../utils/auth';

function Unauthorized() {
  const userRole = getUserRole();
  
  // Determine where to redirect based on user role
  const getRedirectPath = () => {
    switch(userRole) {
      case 'admin':
        return '/dashboard';
      case 'teacher':
        return '/dashboardteacher';
      case 'student':
        return '/dashboardstu';
      case 'parent':
        return '/dashboardparent';
      default:
        return '/';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 flex h-16 items-center">
          <Link to="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold">Gyanodaya</span>
          </Link>
        </div>
      </header>
      
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="flex justify-center mb-6">
            <Shield className="h-20 w-20 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Unauthorized Access</h1>
          <p className="text-gray-600 mb-8">
            You don't have permission to access this page. This area is restricted to authorized users only.
          </p>
          <Link 
            to={getRedirectPath()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}

export default Unauthorized;
