import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Trash } from 'lucide-react';
import Layout from '../../components/layoutes/teacherlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';
import { getUserData } from '../../utils/auth';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [classes, setClasses] = useState([]);

  const userdata = getUserData();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);

        // 1. Get the teacher's class IDs
        const teacherRes = await authAxios.get(`/teachers/${userdata.id}`);
        const classIds = teacherRes.data.data.class; // Array of class _ids
        console.log(classIds)
        // 2. Get all students
        const response = await authAxios.get(`/students`);
        const allStudents = response.data.data;
        console.log(allStudents)
        // 3. Filter students that belong to the teacher's classes
        const filteredStudents = allStudents.filter(student =>
          classIds.includes(student.class._id)
        );

        setStudents(filteredStudents);

        // 4. Fetch classes and filter them
        const classesRes = await authAxios.get('/classes');
        setClasses(classesRes.data.data.filter(cls => classIds.includes(cls._id)));

      } catch (err) {
        console.error(err);
        setError('Failed to load students');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [currentPage, userdata.id]);

  // Reset to first page on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Helper to get class name from class ID


  // Handle student delete
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      try {
        await authAxios.delete(`/students/${id}`);
        setStudents(prev => prev.filter(s => s._id !== id));
      } catch (err) {
        console.error("Failed to delete student", err);
        alert("Failed to delete student.");
      }
    }
  };

  // Filter students based on search term
  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Loader />
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* Students Table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentStudents.length > 0 ? (
                    currentStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {student.class.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <Link to={`/admin-students/${student._id}`} className="text-green-600 hover:text-green-800 mr-2">
                              <Eye className="inline" size={16} />
                            </Link>
                          
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No students found. {searchTerm && "Try a different search term."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredStudents.length > studentsPerPage && (
              <div className="flex justify-center mt-6">
                <nav className="flex items-center">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`mx-1 px-3 py-1 rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  {Array.from({ length: Math.ceil(filteredStudents.length / studentsPerPage) }, (_, i) => i + 1)
                    .filter(
                      (number) =>
                        number === 1 ||
                        number === Math.ceil(filteredStudents.length / studentsPerPage) ||
                        (number >= currentPage - 1 && number <= currentPage + 1)
                    )
                    .map((number, index, array) => {
                      if (index > 0 && array[index - 1] !== number - 1) {
                        return (
                          <React.Fragment key={`ellipsis-${number}`}>
                            <span className="mx-1 px-3 py-1">...</span>
                            <button
                              key={number}
                              onClick={() => paginate(number)}
                              className={`mx-1 px-3 py-1 rounded-md ${
                                currentPage === number
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {number}
                            </button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`mx-1 px-3 py-1 rounded-md ${
                            currentPage === number
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {number}
                        </button>
                      );
                    })}
                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === Math.ceil(filteredStudents.length / studentsPerPage)}
                    className={`mx-1 px-3 py-1 rounded-md ${
                      currentPage === Math.ceil(filteredStudents.length / studentsPerPage)
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Students;
