import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Layout from '../../components/layoutes/teacherlayout';
import authAxios from '../../utils/auth';
import {getUserData} from '../../utils/auth';

function AdminClasses() {
 
  const [classes, setClasses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
 
  const  userdata=getUserData();
  const classesPerPage = 10;
  const totalPages = Math.ceil(classes.length / classesPerPage);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoading(true);
      try {
        const response = await authAxios.get(`teachers/${userdata.id}`);       
        console.log(response.data.data);
  
        const response2 = await authAxios.get(`classes`);
  
        const classIds = response.data.data.class; // corrected here
        const filteredClasses = response2.data.data.filter((cls) => classIds.includes(cls._id));
  
        setClasses(filteredClasses);
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
    cls.classTeacher?.firstName?.toLowerCase().includes(searchLower) ||
    cls.classTeacher?.lastName?.toLowerCase().includes(searchLower)
    
  );
});

  const paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * classesPerPage,
    currentPage * classesPerPage
  );


  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6 md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Classes</h1>
            <p className="text-gray-600">My classes and sections</p>
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
                  placeholder="Search by class, section"
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

     
      </div>
    </Layout>
  );
}

export default AdminClasses;
