import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';

function AdminClasses() {
 
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  const classesPerPage = 10;
  const totalPages = Math.ceil(classes.length / classesPerPage);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const response = await authAxios.get('classes/');
        
        setClasses(response.data.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching classes:', err);
        setError('Failed to fetch classes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, []);

 const filteredClasses = classes.filter(cls => {
  const searchLower = searchTerm.toLowerCase();

  // Handle search term as a number when possible
  const isNumericSearch = !isNaN(searchTerm);

  return (
    (cls.name && (isNumericSearch ? cls.name === Number(searchTerm) : cls.name.toString().toLowerCase().includes(searchLower))) ||
    cls.section?.toLowerCase().includes(searchLower) ||
    `Grade ${cls.grade}`.toLowerCase().includes(searchLower) ||
    cls.classTeacher?.firstNamename?.toLowerCase().includes(searchLower) ||
    cls.classTeacher?.lastName?.toLowerCase().includes(searchLower) 
 
  );
});

  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * classesPerPage,
    currentPage * classesPerPage
  );

  const handleDelete = async () => {
    if (!classToDelete) return;

    try {
      setIsLoading(true); // Set loading state to true before making the request
      await authAxios.delete(`classes/${classToDelete._id}`); // Delete the class
      setClasses(classes.filter(classItem => classItem._id !== classToDelete._id)); // Update the state after deletion
      setShowDeleteModal(false); // Close the modal after deletion
    } catch (err) {
      console.error("Error deleting class:", err.response?.data || err.message);
  alert(err.response?.data?.message || "Error deleting class");
    } finally {
      setIsLoading(false); // Always set loading state to false, whether success or failure
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
            <p className="text-gray-600">Manage school classes and sections</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link
              to="/admin-classes/add"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add New Class
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-4 border-b">
            <div className="flex items-center">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by class, section, classteacher..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class & Section</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class Teacher</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subjects & Teachers</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">Loading classes...</p>
                    </td>
                  </tr>
                ) : paginatedClasses.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No classes match your search.' : 'No classes available.'}
                    </td>
                  </tr>
                ) : (
                  paginatedClasses.map((cls) => (
                    <tr key={cls._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{cls.name}</div>
                        <div className="text-sm text-gray-500">Grade {cls.grade}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
  {cls.classTeacher ? `${cls.classTeacher.firstName} ${cls.classTeacher.lastName}` : 'N/A'}
</div>
                        
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{cls.students.length} students</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{cls.roomNumber || 'Not assigned'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {cls.subjects?.length || 0} Subjects{' '}
                          
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/classes/view/${cls._id}`} className="text-blue-600 hover:text-blue-900" title="View Details">
                            <Eye size={18} />
                          </Link>
                          
                          <Link to={`/admin-classes/edit/${cls._id}`} className="text-indigo-600 hover:text-indigo-900" title="Edit Class">
                            <Edit size={18} />
                          </Link>
                          <button 
                            onClick={() => {
                              setClassToDelete(cls); // Set the class to delete
                              setShowDeleteModal(true); // Show delete confirmation modal
                            }} 
                            className="text-red-600 hover:text-red-900" title="Delete Class">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredClasses.length > classesPerPage && (
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                Showing {Math.min((currentPage - 1) * classesPerPage + 1, filteredClasses.length)} to{' '}
                {Math.min(currentPage * classesPerPage, filteredClasses.length)} of {filteredClasses.length} classes
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:text-gray-400"
                >
                  <ChevronLeft />
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`px-3 py-1 border rounded ${currentPage === idx + 1 ? 'bg-blue-100 text-blue-700' : ''}`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:text-gray-400"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Trash2 className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Class</h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete "{classToDelete?.name}"? This action cannot be undone.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isLoading}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AdminClasses;
