import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Key, AlertTriangle, ArrowLeft, EyeOff, Eye } from "lucide-react";
import Layout from "../components/layoutes/teacherlayout";
import authAxios from "../utils/auth";

const ChangePassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  // Password validation state
  const [validations, setValidations] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
    passwordsMatch: false
  });
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Validate password in real-time if it's new password field
    if (name === 'newPassword') {
      validatePassword(value);
    }
    
    // Check if passwords match
    if (name === 'newPassword' || name === 'confirmPassword') {
      const otherField = name === 'newPassword' ? 'confirmPassword' : 'newPassword';
      setValidations(prev => ({
        ...prev,
        passwordsMatch: value === formData[otherField] && value !== ""
      }));
    }
  };
  
  // Validate password for security criteria
  const validatePassword = (password) => {
    setValidations({
      ...validations,
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      passwordsMatch: password === formData.confirmPassword && password !== ""
    });
  };
  
  // Check if all validations pass
  const isFormValid = () => {
    if (!formData.currentPassword) return false;
    
    const { hasMinLength, hasUppercase, hasLowercase, hasNumber, hasSpecial, passwordsMatch } = validations;
    return hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial && passwordsMatch;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      setError("Please fix all validation errors before submitting.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      await authAxios.put('/api/teachers/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      setSuccess(true);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setLoading(false);
      
      // Redirect back to profile after success
      setTimeout(() => {
        navigate('/teacher/profile');
      }, 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      
      if (error.response && error.response.status === 401) {
        setError("Current password is incorrect.");
      } else {
        setError("Failed to change password. Please try again later.");
      }
      
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
            <button
              onClick={() => navigate('/teacher/profile')}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Profile
            </button>
          </div>
          
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-6">
              Password changed successfully! You'll be redirected to your profile shortly.
            </div>
          )}
          
          {/* Change Password Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  >
                    {showCurrentPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              
              {/* Password Requirements */}
              <div className="mb-6 border border-gray-200 rounded-md p-4 bg-gray-50">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</h3>
                <ul className="text-xs space-y-2">
                  <li className={`flex items-center ${validations.hasMinLength ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`inline-block w-4 h-4 mr-2 rounded-full ${validations.hasMinLength ? 'bg-green-100 border-2 border-green-500' : 'border border-gray-300'}`}></span>
                    At least 8 characters
                  </li>
                  <li className={`flex items-center ${validations.hasUppercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`inline-block w-4 h-4 mr-2 rounded-full ${validations.hasUppercase ? 'bg-green-100 border-2 border-green-500' : 'border border-gray-300'}`}></span>
                    At least one uppercase letter (A-Z)
                  </li>
                  <li className={`flex items-center ${validations.hasLowercase ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`inline-block w-4 h-4 mr-2 rounded-full ${validations.hasLowercase ? 'bg-green-100 border-2 border-green-500' : 'border border-gray-300'}`}></span>
                    At least one lowercase letter (a-z)
                  </li>
                  <li className={`flex items-center ${validations.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`inline-block w-4 h-4 mr-2 rounded-full ${validations.hasNumber ? 'bg-green-100 border-2 border-green-500' : 'border border-gray-300'}`}></span>
                    At least one number (0-9)
                  </li>
                  <li className={`flex items-center ${validations.hasSpecial ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`inline-block w-4 h-4 mr-2 rounded-full ${validations.hasSpecial ? 'bg-green-100 border-2 border-green-500' : 'border border-gray-300'}`}></span>
                    At least one special character (!@#$%^&*...)
                  </li>
                  <li className={`flex items-center ${validations.passwordsMatch ? 'text-green-600' : 'text-gray-500'}`}>
                    <span className={`inline-block w-4 h-4 mr-2 rounded-full ${validations.passwordsMatch ? 'bg-green-100 border-2 border-green-500' : 'border border-gray-300'}`}></span>
                    Passwords match
                  </li>
                </ul>
              </div>
              
              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className={`flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
                    loading || !isFormValid() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={loading || !isFormValid()}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Changing...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ChangePassword; 