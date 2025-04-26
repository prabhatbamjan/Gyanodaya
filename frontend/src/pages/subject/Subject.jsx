import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import authAxios from '../../utils/auth'; 
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
} from "lucide-react";
import Layout from '../../components/layoutes/adminlayout';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]); // Ensure it's an empty array by default
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");

  // Updated departments array
  const departments = [
    "Science",
    "Nepali",
    "Mathematics",
    "Social Studies",
    "Health and Physical Education",
    "Moral Education",
    "Optional/Additional Subjects"
  ];

  // Fetch subjects when the component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await authAxios.get('subjects/');
        setSubjects(response.data.data); // Update the state with the fetched data
        setLoading(false); // Set loading to false after data is fetched
      } catch (error) {
        setError(error); // Handle any error that occurs during fetching
        setLoading(false);
      }
    };

    fetchData(); // Call the async function
  }, []);

  const handleDeleteSubject = async (subjectId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this subject?");
    if (!isConfirmed) {
      return; // Exit the function if the user cancels
    }
    try {
      setLoading(true);
      await authAxios.delete(`subjects/${subjectId}`); // Delete the subject
      setSubjects(subjects.filter(subject => subject._id !== subjectId));
      alert("subject deleted") // Update the state
    } catch (error) {
      setError(error.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = Array.isArray(subjects) ? subjects.filter(subject => {
    return (
      (subject.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       subject.code.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterDepartment === "" || subject.department === filterDepartment)
    );
  }) : [];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Layout>
        <main className="p-4 md:p-6">
          <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-gray-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">All Subjects</h2>
                <p className="text-sm text-gray-500">Manage all academic subjects</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search subjects..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <select
                    className="pl-4 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                  >
                    <option value="">All Departments</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <Filter className="h-4 w-4 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
                <div className="mt-4 md:mt-0">
                  <Link
                    to="/admin-subjects/addSubject"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Subject
                  </Link>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubjects.length > 0 ? (
                    filteredSubjects.map((subject) => (
                      <tr key={subject._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{subject.code}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subject.department}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{subject.description}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/admin-subjects/edit/${subject._id}`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit subject"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDeleteSubject(subject._id)} // Directly delete the subject
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                        No subjects found. Try adjusting your search criteria or add a new subject.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </Layout>
    </div>
  );
};

export default SubjectManagement;
