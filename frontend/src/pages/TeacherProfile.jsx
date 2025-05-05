import React, { useState, useEffect } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap,
  Calendar,
  Edit,
  Key
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/layoutes/teacherlayout";
import { getUserData } from "../utils/auth";
import authAxios from "../utils/auth";

const TeacherProfile = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({});
  const [error, setError] = useState(null);
  
  // Fetch teacher profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Get user data from localStorage as fallback
        const localUserData = getUserData();
        
        // Try to fetch the latest data from API
        const response = await authAxios.get('/api/teachers/profile');
        setProfileData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError("Failed to load profile data");
        
        // Use localStorage data as fallback
        const userData = getUserData();
        if (userData) {
          setProfileData({
            ...userData,
            // Add mock data for development if needed
            phone: userData.phone || "+1 (555) 123-4567",
            address: userData.address || "123 Education Lane, Teaching City",
            department: userData.department || "Mathematics",
            joinDate: userData.joinDate || "2022-08-15",
            qualification: userData.qualification || "M.Sc. Mathematics",
            bio: userData.bio || "Experienced mathematics teacher with a passion for making complex concepts easy to understand.",
            subjects: userData.subjects || ["Mathematics", "Statistics"]
          });
        }
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  if (error && !profileData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }
  
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
            <div className="flex flex-col md:flex-row items-center">
              <div className="h-32 w-32 md:h-40 md:w-40 rounded-full bg-white flex items-center justify-center border-4 border-white overflow-hidden">
                {profileData.profileImage ? (
                  <img 
                    src={profileData.profileImage} 
                    alt={`${profileData.firstName} ${profileData.lastName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full bg-blue-200 flex items-center justify-center text-blue-600 text-4xl font-bold">
                    {profileData.firstName && profileData.firstName.charAt(0)}
                    {profileData.lastName && profileData.lastName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left">
                <h1 className="text-3xl font-bold text-white">
                  {profileData.firstName} {profileData.lastName}
                </h1>
                <p className="text-blue-100 text-lg">{profileData.department} Teacher</p>
                <p className="text-blue-100">
                  <span className="bg-blue-400 bg-opacity-30 px-3 py-1 rounded-full text-sm mt-2 inline-block">
                    Teacher ID: {profileData.teacherId || profileData._id}
                  </span>
                </p>
              </div>
              <div className="md:ml-auto mt-6 md:mt-0 flex space-x-3">
                <Link 
                  to="/teacher/profile/edit" 
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-white"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Link>
                <Link 
                  to="/teacher/change-password" 
                  className="flex items-center px-4 py-2 bg-blue-100 text-blue-600 rounded-md hover:bg-white"
                >
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Personal Information */}
              <div className="md:col-span-1 space-y-6">
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-800">{profileData.email || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-800">{profileData.phone || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-800">{profileData.address || "Not provided"}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Professional Details</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Briefcase className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Department</p>
                        <p className="text-gray-800">{profileData.department || "Not assigned"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <GraduationCap className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Qualification</p>
                        <p className="text-gray-800">{profileData.qualification || "Not provided"}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Calendar className="w-5 h-5 text-blue-500 mt-0.5 mr-3" />
                      <div>
                        <p className="text-sm text-gray-500">Join Date</p>
                        <p className="text-gray-800">{formatDate(profileData.joinDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio and Subjects */}
              <div className="md:col-span-2">
                <div className="bg-gray-50 p-5 rounded-lg mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">About Me</h2>
                  <p className="text-gray-700 leading-relaxed">
                    {profileData.bio || "No bio information provided yet."}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Subjects</h2>
                  
                  {profileData.subjects && profileData.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {profileData.subjects.map((subject, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No subjects assigned yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TeacherProfile; 