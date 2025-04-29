import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Download, Filter, RefreshCw } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const AttendanceReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [report, setReport] = useState(null);
  const [filters, setFilters] = useState({
    class: '',
    subject: '',
    startDate: '',
    endDate: '',
    reportType: 'daily'
  });
  const [showFilters, setShowFilters] = useState(true);

  useEffect(() => {
    fetchData();
  }, [filters]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [classesRes, subjectsRes, reportRes] = await Promise.all([
        authAxios.get('classes/'),
        authAxios.get('subjects/'),
        authAxios.get('attendance/report', { params: filters })
      ]);

      if (!classesRes.data.success || !subjectsRes.data.success || !reportRes.data.success) {
        throw new Error('Failed to fetch required data');
      }

      setClasses(classesRes.data.data);
      setSubjects(subjectsRes.data.data);
      setReport(reportRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      class: '',
      subject: '',
      startDate: '',
      endDate: '',
      reportType: 'daily'
    });
  };

  const handleDownloadReport = () => {
    // Create CSV content
    let csvContent = '';
    
    if (filters.reportType === 'daily') {
      csvContent = 'Date,Total,Present,Absent,Late,Excused,Present %,Absent %,Late %,Excused %\n';
      Object.entries(report).forEach(([date, data]) => {
        csvContent += `${date},${data.total},${data.present},${data.absent},${data.late},${data.excused},${data.presentPercentage.toFixed(2)},${data.absentPercentage.toFixed(2)},${data.latePercentage.toFixed(2)},${data.excusedPercentage.toFixed(2)}\n`;
      });
    } else if (filters.reportType === 'weekly') {
      csvContent = 'Week,Total,Present,Absent,Late,Excused,Present %,Absent %,Late %,Excused %\n';
      Object.entries(report).forEach(([week, data]) => {
        csvContent += `${week},${data.total},${data.present},${data.absent},${data.late},${data.excused},${data.presentPercentage.toFixed(2)},${data.absentPercentage.toFixed(2)},${data.latePercentage.toFixed(2)},${data.excusedPercentage.toFixed(2)}\n`;
      });
    } else if (filters.reportType === 'monthly') {
      csvContent = 'Month,Total,Present,Absent,Late,Excused,Present %,Absent %,Late %,Excused %\n';
      Object.entries(report).forEach(([month, data]) => {
        csvContent += `${month},${data.total},${data.present},${data.absent},${data.late},${data.excused},${data.presentPercentage.toFixed(2)},${data.absentPercentage.toFixed(2)},${data.latePercentage.toFixed(2)},${data.excusedPercentage.toFixed(2)}\n`;
      });
    }

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${filters.reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderReportTable = () => {
    if (!report) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {filters.reportType === 'daily' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              )}
              {filters.reportType === 'weekly' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Week
                </th>
              )}
              {filters.reportType === 'monthly' && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Present
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Absent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Late
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Excused
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Present %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Absent %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Late %
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Excused %
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(report).map(([key, data]) => (
              <tr key={key}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {key}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {data.total}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {data.present}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {data.absent}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {data.late}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {data.excused}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {data.presentPercentage.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {data.absentPercentage.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {data.latePercentage.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {data.excusedPercentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/attendance')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Attendance
          </button>
        </div>

        <div className="flex flex-wrap justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Attendance Report</h1>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Filter className="mr-2" size={16} />
              Filters
            </button>
            
            <button
              onClick={handleDownloadReport}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              <Download className="mr-2" size={16} />
              Download Report
            </button>
            
            <button
              onClick={fetchData}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-gray-600 rounded-md hover:bg-gray-700"
            >
              <RefreshCw className="mr-2" size={16} />
              Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                <select
                  name="class"
                  value={filters.class}
                  onChange={handleFilterChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">All Classes</option>
                  {classes.map(cls => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name} - {cls.section}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select
                  name="subject"
                  value={filters.subject}
                  onChange={handleFilterChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                <select
                  name="reportType"
                  value={filters.reportType}
                  onChange={handleFilterChange}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader size="large" text="Loading report..." />
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            {renderReportTable()}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AttendanceReport; 