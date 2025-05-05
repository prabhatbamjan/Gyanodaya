import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Save, ArrowLeft } from "lucide-react";
import Layout from "../components/layoutes/teacherlayout";
import { getUserData } from "../utils/auth";
import authAxios from "../utils/auth";

const EditTeacherProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    department: "",
    qualification: "",
    joinDate: "",
    bio: "",
    subjects: []
  });
  
  // New subject input (for adding subjects)
  const [newSubject, setNewSubject] = useState("");
  
  // Profile image state
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Fetch existing profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Try to fetch data from API
        const response = await authAxios.get('/api/teachers/profile');
        const profileData = response.data;
        
        // Update form with profile data
        setFormData({
          firstName: profileData.firstName || "",
          lastName: profileData.lastName || "",
          email: profileData.email || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          department: profileData.department || "",
          qualification: profileData.qualification || "",
          joinDate: profileData.joinDate ? new Date(profileData.joinDate).toISOString().split('T')[0] : "",
          bio: profileData.bio || "",
          subjects: profileData.subjects || []
        });
        
        // Set image preview if available
        if (profileData.profileImage) {
          setImagePreview(profileData.profileImage);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to load profile data");
        
        // Use localStorage data as fallback
        const userData = getUserData();
        if (userData) {
          setFormData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            department: userData.department || "Mathematics",
            qualification: userData.qualification || "",
            joinDate: userData.joinDate ? new Date(userData.joinDate).toISOString().split('T')[0] : "",
            bio: userData.bio || "",
            subjects: userData.subjects || []
          });
        }
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);
  
  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Handle image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle adding a new subject
  const handleAddSubject = () => {
    if (newSubject.trim() && !formData.subjects.includes(newSubject.trim())) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, newSubject.trim()]
      });
      setNewSubject("");
    }
  };
  
  // Handle removing a subject
  const handleRemoveSubject = (subjectToRemove) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(subject => subject !== subjectToRemove)
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Create form data object for API
      const profileFormData = new FormData();
      
      // Add profile data
      Object.keys(formData).forEach(key => {
        if (key === 'subjects') {
          // Handle subjects array
          profileFormData.append('subjects', JSON.stringify(formData.subjects));
        } else {
          profileFormData.append(key, formData[key]);
        }
      });
      
      // Add profile image if it exists
      if (profileImage) {
        profileFormData.append('profileImage', profileImage);
      }
      
      // Send data to API
      await authAxios.put('/api/teachers/profile', profileFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess(true);
      setSaving(false);
      
      // Navigate back to profile page after a delay
      setTimeout(() => {
        navigate('/teacher/profile');
      }, 2000);
    } catch (error) {
      console.error("Error updating profile:", error);
      setError("Failed to update profile. Please try again.");
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Profile</h1>
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
              Profile updated successfully! Redirecting to profile page...
            </div>
          )}
          
          {/* Profile Edit Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Profile Image Section */}
            <div className="bg-blue-50 p-6 flex flex-col items-center justify-center border-b border-blue-100">
              <div className="h-32 w-32 rounded-full bg-white flex items-center justify-center border-4 border-white overflow-hidden mb-4">
                {imagePreview ? (
                  <img 
                    src={imagePreview}
                    alt="Profile Preview" 
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-blue-200 flex items-center justify-center text-blue-600 text-4xl font-bold">
                    {formData.firstName.charAt(0)}
                    {formData.lastName.charAt(0)}
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <label htmlFor="profileImage" className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Upload Profile Picture
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            
            {/* Form Fields */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
                      readOnly
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact administration for assistance.</p>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    ></textarea>
                  </div>
                </div>
                
                {/* Professional Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h2>
                  
                  <div className="mb-4">
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="qualification" className="block text-sm font-medium text-gray-700 mb-1">
                      Qualification
                    </label>
                    <input
                      type="text"
                      id="qualification"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Join Date
                    </label>
                    <input
                      type="date"
                      id="joinDate"
                      name="joinDate"
                      value={formData.joinDate}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="subjects" className="block text-sm font-medium text-gray-700 mb-1">
                      Subjects
                    </label>
                    <div className="flex">
                      <input
                        type="text"
                        id="newSubject"
                        value={newSubject}
                        onChange={(e) => setNewSubject(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add a subject"
                      />
                      <button
                        type="button"
                        onClick={handleAddSubject}
                        className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.subjects.map((subject, index) => (
                        <div key={index} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm flex items-center">
                          {subject}
                          <button
                            type="button"
                            onClick={() => handleRemoveSubject(subject)}
                            className="ml-2 text-blue-700 hover:text-blue-900 focus:outline-none"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              <div className="mt-6">
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  About Me
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself, your teaching philosophy, interests, etc."
                ></textarea>
              </div>
              
              {/* Submit Button */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className={`flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${saving ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
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

export default EditTeacherProfile; 