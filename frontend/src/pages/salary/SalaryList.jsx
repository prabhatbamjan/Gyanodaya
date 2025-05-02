import React, { useState, useEffect } from 'react';
import { DollarSign, Plus, Search, Filter, Trash2, Edit2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';
import Loader from '../../components/Loader';

const SalaryList = () => {
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    teacherName: '',
    month: '',
    year: '',
    status: ''
  });

  useEffect(() => {
    fetchSalaries();
  }, []);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get('/api/salaries');
      setSalaries(response.data.data);
    } catch (error) {
      console.error('Error fetching salaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      try {
        await authAxios.delete(`/api/salaries/${id}`);
        console.log('Salary record deleted successfully');
        fetchSalaries();
      } catch (error) {
        console.error('Error deleting salary record:', error);
      }
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredSalaries = salaries.filter(salary => {
    return (
      salary.teacherName.toLowerCase().includes(filters.teacherName.toLowerCase()) &&
      (filters.month === '' || salary.month === filters.month) &&
      (filters.year === '' || salary.year === filters.year) &&
      (filters.status === '' || salary.status === filters.status)
    );
  });

  if (loading) return <Loader />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Salary Management</h1>
          <Link
            to="/admin-salary/add"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add New Salary
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                name="teacherName"
                placeholder="Search by teacher name"
                className="w-full p-2 border rounded"
                value={filters.teacherName}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <select
                name="month"
                className="w-full p-2 border rounded"
                value={filters.month}
                onChange={handleFilterChange}
              >
                <option value="">Select Month</option>
                {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div>
              <input
                type="number"
                name="year"
                placeholder="Year"
                className="w-full p-2 border rounded"
                value={filters.year}
                onChange={handleFilterChange}
              />
            </div>
            <div>
              <select
                name="status"
                className="w-full p-2 border rounded"
                value={filters.status}
                onChange={handleFilterChange}
              >
                <option value="">Select Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Salary List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Month</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSalaries.map((salary) => (
                <tr key={salary._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{salary.teacherName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{salary.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{salary.year}</td>
                  <td className="px-6 py-4 whitespace-nowrap">Rs. {salary.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      salary.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {salary.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <Link
                        to={`/admin-salary/edit/${salary._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <Edit2 className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(salary._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  );
};

export default SalaryList;
