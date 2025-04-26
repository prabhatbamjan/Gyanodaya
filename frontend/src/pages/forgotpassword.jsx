import React, { useState } from 'react';
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";
import { Link, useNavigate } from 'react-router-dom';
import authAxios from '../utils/auth';


function ForgotPassword() {
  const [formData, setFormData] = useState({
    email: '',
    code: '',
    newPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Enter Email, 2: Enter Code, 3: Enter New Password
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log("Sending email:", formData.email); // Debugging

    try {
      await authAxios.post('users/forgotPassword', {
        email: formData.email, // Ensure email is correctly sent
      });

      setStep(2); // Move to "Enter Code" step
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log("Verifying code for:", formData.email, "Code:", formData.code); // Debugging

    try {
      await authAxios.post('users/verifyResetCode', {
        email: formData.email, // Ensure email is sent
        resetCode: formData.code, // Send correct reset code
      });

      setStep(3); // Move to "Enter New Password" step
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid reset code.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log("Resetting password for:", formData.email); // Debugging

    try {
      await authAxios.post('users/resetPassword', {
        email: formData.email, // Ensure email is sent
        resetCode: formData.code, // Ensure code is included
        newPassword: formData.newPassword, // Send new password
      });

      navigate('/login'); // Redirect to login after password reset
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setIsLoading(false);
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
            <h1 className="text-3xl font-bold">
              {step === 1 ? "Forgot Password" : step === 2 ? "Enter the Code" : "Enter New Password"}
            </h1>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendEmail} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">Email</label>
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Send Code"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="code" className="block text-sm font-medium">Enter Code</label>
                <input
                  id="code"
                  type="text"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="Enter the code sent to your email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || formData.code.length === 0}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Verify Code"}
              </button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="newPassword" className="block text-sm font-medium">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Reset Password"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;
