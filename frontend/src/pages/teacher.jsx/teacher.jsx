import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Eye, Trash } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const teachersPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [teachersResponse, classesResponse, subjectsResponse] = await Promise.all([
          authAxios.get('teachers/', {
            params: { page: currentPage, limit: teachersPerPage, search: searchTerm }
          }),

          authAxios.get('classes/'),
          authAxios.get('subjects/')
        ]);
        console.log(teachersResponse.data.data);
        setTeachers(teachersResponse.data.data);
        setTotalTeachers(teachersResponse.data.total || teachersResponse.data.data.length);
        setClasses(classesResponse.data.data);
        setSubjects(subjectsResponse.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch teachers data');
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      try {
        await authAxios.delete(`teachers/${id}`);
        setTeachers(teachers.filter(teacher => teacher._id !== id));
        setTotalTeachers(prev => prev - 1);
      } catch (err) {
        console.error('Error deleting teacher:', err);
        setError('Failed to delete teacher');
      }
    }
  };

// Get subject names from teacher.subjects (which are just IDs)
const getSubjectNames = (subjectIds) => {
  if (!Array.isArray(subjectIds) || subjectIds.length === 0) return 'No Subjects Assigned';
  return subjectIds.map(id => {
    const subjectObj = subjects.find(sub => sub._id === id);
    return subjectObj ? subjectObj.name : 'Unknown Subject';
  }).join(', ');
};

// Get class names from teacher.class (which are just IDs too)
const getClassNames = (classIds) => {
  if (!Array.isArray(classIds) || classIds.length === 0) return 'No Classes Assigned';
  return classIds.map(id => {
    const classObj = classes.find(cls => cls._id === id);
    return classObj ? `Grade ${classObj.grade}-${classObj.section}` : 'Unknown Class';
  }).join(', ');
};


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const totalPages = Math.ceil(totalTeachers / teachersPerPage);

  const handlePageChange = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Teachers</h1>
          <Link
            to="/admin-teachers/addTeacher"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="mr-2" size={16} /> Add Teacher
          </Link>
        </div>

        {/* Search */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search teachers by name, email, phone or subject..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Loader */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <Loader size="large" text="Loading teachers..." />
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
        )}

        {/* Empty */}
        {!loading && !error && teachers.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No teachers found</h3>
            <p className="text-gray-600 mb-4">There are no teachers matching your search criteria.</p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && !error && teachers.length > 0 && (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classes</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teachers.map((teacher) => (
                    <tr key={teacher._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            {teacher.firstName?.charAt(0)}{teacher.lastName?.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {teacher.firstName} {teacher.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{teacher.qualification}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{teacher.email}</div>
                        <div className="text-sm text-gray-500">{teacher.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {getSubjectNames(teacher.subjects)}
</td>
<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
  {getClassNames(teacher.class)}
</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(teacher.joinDate)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          teacher.isActive ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {teacher.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link to={`/admin-teachers/edit/${teacher._id}`} className="text-blue-600 hover:text-blue-800">
                            <Pencil size={16} />
                          </Link>
                          <Link to={`/admin-teachers/view/${teacher._id}`} className="text-green-600 hover:text-green-800">
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(teacher._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * teachersPerPage + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * teachersPerPage, totalTeachers)}
                  </span>{' '}
                  of <span className="font-medium">{totalTeachers}</span> teachers
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-300'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-blue-600 hover:bg-blue-50 border border-gray-300'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Teachers;
