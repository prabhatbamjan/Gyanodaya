import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Eye, Trash } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const TimeTable = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    setLoading(true);
    try {
      const response = await authAxios.get('timetables');
      if (response.data.success) {
        setTimetables(response.data.data);
      } else {
        setError('Failed to fetch timetable data');
      }
    } catch (err) {
      console.error('Error fetching timetables:', err);
      setError('Failed to fetch timetable data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        const response = await authAxios.delete(`timetables/${id}`);
        if (response.data.success) {
          // Refresh the data after successful deletion
          fetchTimetables();
        } else {
          setError('Failed to delete timetable entry');
        }
      } catch (err) {
        console.error('Error deleting timetable:', err);
        setError('Failed to delete timetable entry');
      }
    }
  };

  // Filter timetables based on search term
  const filteredTimetables = timetables.filter((entry) => {
    if (!searchTerm) return true;
    
    const className = entry.class?.name || '';
    const grade = entry.class?.grade || '';
    const section = entry.class?.section || '';
    const day = entry.day || '';
    
    return `${className} ${grade} ${section} ${day}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredTimetables.length / itemsPerPage);
  const paginatedData = filteredTimetables.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Class Timetable</h1>
          <Link
            to="/admin-timetable/add"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus className="mr-2" size={16} /> Add Timetable Entry
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
              placeholder="Search by class or day..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {/* Loader */}
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader size="large" text="Loading timetable..." />
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="text-center text-gray-600">No timetable entries found.</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periods</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((entry) => (
                    <tr key={entry._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {entry.class?.name || 'N/A'} {entry.class?.grade || ''} {entry.class?.section || ''}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.day}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.academicYear}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{entry.periods?.length || 0} periods</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link to={`/admin-timetable/edit/${entry._id}`} className="text-blue-600 hover:text-blue-800">
                            <Pencil size={16} />
                          </Link>
                          <Link to={`/admin-timetable/view/${entry.class?._id}`} className="text-green-600 hover:text-green-800">
                            <Eye size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(entry._id)}
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
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredTimetables.length)} of{' '}
                  {filteredTimetables.length} entries
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
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

export default TimeTable;
