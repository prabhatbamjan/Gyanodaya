import React, { useState, useEffect } from 'react';
import { Calendar, Search, Clock, Download } from 'lucide-react';
import Layout from '../../../components/layoutes/adminlayout';
import authAxios from '../../../utils/auth';
import Loader from '../../../components/Loader';

const ViewTeacherAttendance = () => {
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState([]);
  const [filters, setFilters] = useState({
    teacherName: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchAttendance();
  }, [filters.startDate, filters.endDate]);

  const fetchAttendance = async () => {
    try {
      let url = '/api/attendance/teachers';
      if (filters.startDate && filters.endDate) {
        url += `?startDate=${filters.startDate}&endDate=${filters.endDate}`;
      }
      const response = await authAxios.get(url);
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      let url = '/api/attendance/teachers/report';
      if (filters.startDate && filters.endDate) {
        url += `?startDate=${filters.startDate}&endDate=${filters.endDate}`;
      }
      const response = await authAxios.get(url, { responseType: 'blob' });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'teacher-attendance-report.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading report:', error);
    }
  };

  const filteredAttendance = attendance.filter(record => {
    const teacherName = record.teacher?.name?.toLowerCase() || '';
    return !filters.teacherName || teacherName.includes(filters.teacherName.toLowerCase());
  });

  if (loading) return <Loader />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Teacher Attendance Records
          </h1>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Download className="h-5 w-5" />
            Download Report
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 border rounded-lg px-3 py-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by teacher name"
                className="w-full outline-none"
                value={filters.teacherName}
                onChange={(e) => setFilters({ ...filters, teacherName: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                placeholder="Start Date"
                className="w-full border rounded-lg px-3 py-2 outline-none"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <input
                type="date"
                placeholder="End Date"
                className="w-full border rounded-lg px-3 py-2 outline-none"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Teacher Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marked By
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendance.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.teacher?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          record.status === 'present'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.markedBy?.name || 'System'}
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

export default ViewTeacherAttendance;
