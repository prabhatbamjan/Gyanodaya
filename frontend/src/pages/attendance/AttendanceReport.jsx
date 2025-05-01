import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '../../components/layoutes/teacherlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const TeacherViewAttendance = () => {
  const { id } = useParams(); // get attendance ID from URL
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await authAxios.get(`/attendance/${id}`);
      if (!res.data.success) throw new Error(res.data.message);
      setAttendance(res.data.data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch attendance');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <Loader size="large" text="Loading attendance..." />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-red-600 bg-red-100 p-4 rounded m-4">{error}</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => navigate('/teacher-attendance')} className="text-blue-600 mb-4">
          <ArrowLeft className="inline mr-1" /> Back
        </button>

        <h1 className="text-2xl font-semibold mb-4">Attendance Details</h1>

        <div className="bg-white p-6 rounded shadow mb-6">
          <p><strong>Date:</strong> {attendance.date}</p>
          <p><strong>Class:</strong> {attendance.class?.name} - {attendance.class?.section}</p>
          <p><strong>Subject:</strong> {attendance.subject?.name}</p>
          <p><strong>Period:</strong> {attendance.period}</p>
          <p><strong>Academic Year:</strong> {attendance.academicYear}</p>
          <p><strong>Marked By:</strong> {attendance.teacher?.firstName} {attendance.teacher?.lastName}</p>
        </div>

        <h2 className="text-lg font-semibold mb-2">Students</h2>
        <ul className="divide-y bg-white rounded shadow">
          {attendance.records.map((record, index) => (
            <li key={index} className="p-4 flex justify-between items-center">
              <div>
                <p>{record.student?.firstName} {record.student?.lastName}</p>
                <p className="text-sm text-gray-500">Roll No: {record.student?.rollNumber}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  record.status === 'present' ? 'text-green-600' :
                  record.status === 'absent' ? 'text-red-600' :
                  record.status === 'late' ? 'text-yellow-600' :
                  'text-blue-600'
                }`}>
                  {record.status.toUpperCase()}
                </p>
                {record.remarks && <p className="text-sm text-gray-500 italic">{record.remarks}</p>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default TeacherViewAttendance;
