import React, { useState } from 'react';
import authAxios from '../utils/auth';
import { BookOpen, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authAxios.post('users/login', {
        email: formData.email,
        password: formData.password
      });

      // Store the token and user role in localStorage
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('userRole', response.data.data.user.role);
      localStorage.setItem('userData', JSON.stringify({
        id: response.data.data.user.id,
        firstName: response.data.data.user.firstName,
        lastName: response.data.data.user.lastName,
        email: response.data.data.user.email,
        role: response.data.data.user.role
      }));
      
      // Redirect based on user role
      navigateByRole(response.data.data.user.role);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Navigate to appropriate dashboard based on role
  const navigateByRole = (role) => {
    switch(role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'teacher':
        navigate('/teacher-dashboard');
        break;
      case 'student':
        navigate('/student-dashboard');
        break;
      case 'parent':
        navigate('/parent-dashboard');
        break;
      default:
        navigate('/ ');
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
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-8">
          <Link to="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 mb-6">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">Welcome back</h1>
            <p className="text-gray-600 mt-2">Log in to your Gyanodaya account</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Link to="/forgotpassword" className="text-sm text-blue-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember" className="text-sm font-normal">
                Remember me for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Logging in...
                </>
              ) : 'Log in'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-600 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;