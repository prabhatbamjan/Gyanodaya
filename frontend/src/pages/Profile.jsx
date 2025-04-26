import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Calendar, Lock, Edit2, Save, X } from 'lucide-react';
import Layout from '../components/layoutes/adminlayout';
import authAxios from '../utils/auth';

const Profile = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: ''
,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
     
      const response = await authAxios.get(`users/profile`);
      setUserData(response.data.data.user);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await authAxios.put('users/profile', userData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchUserProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    try {
      await authAxios.patch('users/update-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setSuccessMessage('Password updated successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordError(error.response?.data?.message || 'Failed to update password');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>

          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
              {successMessage}
            </div>
          )}

          {/* Profile Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <span className="text-4xl font-bold text-blue-600">
                    {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                  </span>
                </div>
                {isEditing && (
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Change Photo
                  </button>
                )}
              </div>

              {/* Profile Information */}
              <div className="flex-1">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="firstName"
                          value={userData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{userData.firstName}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="lastName"
                          value={userData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{userData.lastName}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Email</label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={userData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <p className="text-gray-900">{userData.email}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Role</label>
                      <p className="text-gray-900 capitalize">{userData.role}</p>
                    </div>

                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Member Since</label>
                      <p className="text-gray-900">
                        {new Date(userData.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex justify-end gap-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Change Password Section */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Change Password</h2>
            {passwordError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {passwordError}
              </div>
            )}
            <form className="space-y-4" onSubmit={handlePasswordSubmit}>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 