import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Filter, Plus, Eye, Edit, Search } from 'lucide-react';
import Layout from '../../components/layoutes/teacherlayout';
import Loader from '../../components/Loader';
import authAxios, { getUserData } from '../../utils/auth';

const TeacherAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    date: '',
    status: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const userData = getUserData();

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await authAxios.get(`attendance/teacher/${userData.id}`);
      setAttendance(response.data.data);
    } catch (err) {
      console.error('Error fetching attendance data:', err);
      setError(err.response?.data?.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ date: '', status: '' });
  };

  const handleMarkAttendance = () => {
    navigate('/teacher-attendance/mark');
  };

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = searchTerm
      ? (
          new Date(record.date).toLocaleDateString().includes(searchTerm.toLowerCase()) ||
          record.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          String(record.period).includes(searchTerm.toLowerCase())
        )
      : true;

    const matchesDate = filters.date ? record.date.startsWith(filters.date) : true;
    const matchesStatus = filters.status ? record.status === filters.status : true;

    return matchesSearch && matchesDate && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
            <p className="text-gray-600">Manage your attendance records</p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>

            <button
              onClick={handleMarkAttendance}
              className="flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Mark Attendance
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search attendance records..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-medium text-gray-700 mb-4">Filter Attendance Records</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={filters.date}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Attendance Records</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filteredAttendance.length} record(s) found
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700">{error}</div>
          ) : filteredAttendance.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No attendance records found.
              {searchTerm && <div className="mt-2">Try changing your search or filters.</div>}
              {!searchTerm && (
                <button
                  onClick={handleMarkAttendance}
                  className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Mark New Attendance
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.subject.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Period {record.period}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link to={`/teacher-attendance/view/${record._id}`} className="text-blue-600 hover:text-blue-900">
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link to={`/teacher-attendance/edit/${record._id}`} className="text-green-600 hover:text-green-900">
                            <Edit className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TeacherAttendance;
