import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import authAxios from '../../utils/auth';
import {
  ChevronLeft,
  X,
  Save,
  Trash2
} from "lucide-react";

const EditSubject = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get the subject ID from URL
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  const [subjectData, setSubjectData] = useState({
    code: "",
    name: "",
    description: "",
    department: ""
  });

  const departments = ["Science", "Nepali", "Mathematics", "Social Studies", "Health and Physical Education","Moral Education","Optional/Additional Subjects"];

  // Fetch subject data when component mounts
  useEffect(() => {
    const fetchSubject = async () => {
      setIsLoading(true);
      try {
        // Corrected to use GET request
        const response = await authAxios.get(`subjects/${id}`);
        setSubjectData(response.data.data); // Assuming response.data.data contains the subject data
      } catch (error) {
        console.error("Error fetching subject:", error);
        setFormErrors({
          form: "Failed to load subject data. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchSubject();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubjectData({
      ...subjectData,
      [name]: value
    });
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ""
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!subjectData.code.trim()) {
      errors.code = "Subject code is required";
    }
    if(!subjectData.code.trim().match(/^[A-Z]{3}\d{3}$/)){
      errors.code = "Invalid subject code format. Please use the format 'ABC123'";
    }
    if (!subjectData.name.trim()) {
      errors.name = "Subject name is required";
    }
    
    if (!subjectData.department) {
      errors.department = "Department is required";
    }
    if(!subjectData.description.trim()){
      errors.description = "Description is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      // Update the subject data with a PUT request
      const response = await axios.put(`http://localhost:5000/api/subjects/${id}`, subjectData);
      
      // Show success notification
      alert("Subject updated successfully!");
      
      // Redirect back to the main subjects page
      navigate("/admin-subjects");
    } catch (error) {
      console.error("Error updating subject:", error);
      setFormErrors({
        ...formErrors,
        form: "Failed to update subject. Please try again."
      });
    }
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete this subject?");
    if (!isConfirmed) {
      return; // Exit the function if the user cancels
    }
    try {
      // Delete the subject with a DELETE request
      await axios.delete(`http://localhost:5000/api/subjects/${id}`);
      // Show success notification
      alert("Subject deleted successfully!");
      
      // Redirect back to the main subjects page
      navigate("/admin-subjects");
    } catch (error) {
      console.error("Error deleting subject:", error);
      setFormErrors({
        ...formErrors,
        form: "Failed to delete subject. Please try again."
      });
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading subject data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header section */}
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <Link 
              to="/admin-subjects" 
              className="text-blue-600 hover:text-blue-800 flex items-center mr-4"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              <span>Back to Subjects</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Edit Subject</h1>
          </div>
          <p className="text-gray-600">Update subject information</p>
        </div>

        {/* Form section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            {formErrors.form && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {formErrors.form}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code*
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  className={`w-full px-3 py-2 border ${formErrors.code ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  value={subjectData.code}
                  onChange={handleChange}
                />
                {formErrors.code && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.code}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name*
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className={`w-full px-3 py-2 border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  value={subjectData.name}
                  onChange={handleChange}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department*
                </label>
                <select
                  id="department"
                  name="department"
                  className={`w-full px-3 py-2 border ${formErrors.department ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                  value={subjectData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                {formErrors.department && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.department}</p>
                )}
              </div>
              
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={subjectData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>
            
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete (subjectData._id)} 
                className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <span className="flex items-center">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete Subject
                </span>
              </button>
              
              <div className="flex items-center gap-3">
                <Link
                  to="/admin-subjects"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </span>
                </Link>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <span className="flex items-center">
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <div className="p-2 bg-red-100 rounded-full">
                  <Trash2 className="h-5 w-5" />
                </div>
                <p className="font-medium">Delete Subject</p>
              </div>
              <p className="text-gray-700">
                Are you sure you want to delete the subject <span className="font-medium">{subjectData.name}</span>? This action cannot be undone.
              </p>
            </div>
            <div className="px-4 py-3 bg-gray-50 flex justify-end gap-2 border-t border-gray-200">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditSubject;
