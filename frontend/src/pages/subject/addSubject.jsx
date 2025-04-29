import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronLeft, X, Check } from "lucide-react";
import authAxios from '../../utils/auth';

const AddSubject = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  
  const [subjectData, setSubjectData] = useState({
    code: "",
    name: "",
    description: "",
    department: ""
  });

  const departments = ["Science", "Nepali", "Mathematics", "Social Studies", 
                      "Health and Physical Education", "Moral Education", 
                      "Optional/Additional Subjects"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSubjectData({
      ...subjectData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();
    if(!validateForm()){
      return;
    }

    try {
      const response = await authAxios.post('subjects/', subjectData);
      console.log(response);
      navigate('/admin-subjects'); // Redirect after successful creation
    } catch (error) {
      console.error("Error creating subject:", error);
      setError(error.response?.data?.message);
    }
  };
  const validateForm = () => {
    if(!subjectData.code.trim()){
      setError("Subject code is required");
      return;
    }
    if(!subjectData.code.trim().match(/^[A-Z]{3}\d{3}$/)){
      setError("Invalid subject code format. Please use the format 'ABC123'");
      return;
    }
    if(!subjectData.name.trim()){
      setError("Subject name is required");
      return;
    }
    if(!subjectData.department.trim()){
      setError("Department is required");
      return;
    }
    if(!subjectData.description.trim()){
      setError("Description is required");
      return;
    }
    return true;
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
            <h1 className="text-2xl font-bold text-gray-900">Add New Subject</h1>
          </div>
          <p className="text-gray-600">Create a new subject in the system</p>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
            {typeof error === 'string' ? error : JSON.stringify(error)}
          </div>
        )}
        
        {/* Form section */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code
                </label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., MATH101"
                  value={subjectData.code}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Mathematics"
                  value={subjectData.name}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={subjectData.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
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
                  placeholder="Enter subject description..."
                  value={subjectData.description}
                  onChange={handleChange}
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
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
                  <Check className="h-4 w-4 mr-1" />
                  Create Subject
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddSubject;