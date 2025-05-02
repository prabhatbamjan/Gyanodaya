import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, X } from 'lucide-react';
import Layout from '../../../components/layoutes/adminlayout';
import authAxios from '../../../utils/auth';
import Loader from '../../../components/Loader';

const MarkTeacherAttendance = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (date) {
      fetchAttendance();
    }
  }, [date]);

  const fetchTeachers = async () => {
    try {
      const response = await authAxios.get('/api/teachers');
      setTeachers(response.data.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await authAxios.get(`/api/attendance/teachers?date=${date}`);
      const attendanceMap = {};
      response.data.data.forEach(record => {
        attendanceMap[record.teacher] = record.status;
      });
      setAttendanceData(attendanceMap);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const markAttendance = async (teacherId, status) => {
    try {
      await authAxios.post('/api/attendance/teachers', {
        teacher: teacherId,
        date,
        status
      });
      setAttendanceData(prev => ({
        ...prev,
        [teacherId]: status
      }));
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  if (loading) return <Loader />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Mark Teacher Attendance
          </h1>
          <div className="flex items-center gap-4">
            <Clock className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teachers.map((teacher) => (
                <tr key={teacher._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {teacher.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {teacher.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${
                          attendanceData[teacher._id] === 'present'
                            ? 'bg-green-100 text-green-800'
                            : attendanceData[teacher._id] === 'absent'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {attendanceData[teacher._id]
                        ? attendanceData[teacher._id].charAt(0).toUpperCase() +
                          attendanceData[teacher._id].slice(1)
                        : 'Not Marked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => markAttendance(teacher._id, 'present')}
                        className={`p-1.5 rounded-full ${
                          attendanceData[teacher._id] === 'present'
                            ? 'bg-green-100 text-green-600'
                            : 'hover:bg-green-100 text-gray-400 hover:text-green-600'
                        }`}
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => markAttendance(teacher._id, 'absent')}
                        className={`p-1.5 rounded-full ${
                          attendanceData[teacher._id] === 'absent'
                            ? 'bg-red-100 text-red-600'
                            : 'hover:bg-red-100 text-gray-400 hover:text-red-600'
                        }`}
                      >
                        <X className="h-4 w-4" />
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

export default MarkTeacherAttendance;
