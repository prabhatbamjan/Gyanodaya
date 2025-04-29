import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Eye, Trash } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(10);
  const [totalStudents, setTotalStudents] = useState(0);
  const [classes, setClasses] = useState([]);
  useEffect(() => {
    // For demonstration, using mock data
    // In production, you would fetch from backend: axios.get('/api/students')
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const response = await authAxios.get('students/');
        if(response.status === 200){
          setStudents(response.data.data);
          setTotalStudents(response.data.length);
          setLoading(false);
        }
        console.log(response.data.data);
        const response2=await authAxios.get('classes/');
        if(response2.status === 200){
          console.log(response2.data.data);
          setClasses(response2.data.data);
        }
      
        
        
        setLoading(false);
      } catch (err) {
        setError(err.response.data.message);
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search term
  const filteredStudents = students.filter(student => 
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get current students
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
 
   
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Delete student handler (mock implementation)
  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        const response = await authAxios.delete(`students/${id}`);
        if(response.status === 200){
          setStudents(students.filter(student => student._id !== id));
          setTotalStudents(totalStudents - 1);
          alert('Student deleted successfully');
        }
      
        alert('Student deleted successfully');
      } catch (err) {
        setError('Failed to delete student. Please try again.');
      }
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Student Management</h1>
          <Link
            to="/admin-students/addStudent"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="mr-2" size={16} /> Add Student
          </Link>
        </div>

        {/* Search and filter */}
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
            {/* Students table */}
            <div className="overflow-x-auto bg-white rounded-lg shadow overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Class
                    </th>
                   
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
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
  {student.class ? `Class ${student.class.name} ${student.class.section}` : 'No class assigned'}
</td>
                        
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <Link to={`/admin-students/edit/${student._id}`} className="text-blue-600 hover:text-blue-800 mr-2">
                              <Pencil className="inline" size={16} />
                            </Link>
                            <Link to={`/admin-students/${student._id}`} className="text-green-600 hover:text-green-800 mr-2">
                              <Eye className="inline" size={16} />
                            </Link>
                            <button
                              onClick={() => handleDeleteStudent(student._id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash className="inline" size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
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