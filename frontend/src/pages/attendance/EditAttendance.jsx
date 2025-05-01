import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '../../components/layoutes/teacherlayout';
import Loader from '../../components/Loader';
import authAxios, { getUserData } from '../../utils/auth';

const TeacherEditAttendance = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // attendance ID from URL
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [students, setStudents] = useState([]);
  const userdata = getUserData();

  const [formData, setFormData] = useState({
    class: '',
    subject: '',
    date: '',
    period: '',
    records: [],
    teacher: userdata.id,
    academicYear: ''
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res = await authAxios.get(`attendance/${id}`);
      const data = res.data.data;

      setFormData({
        class: data.class.name + data.class.section,
        subject: data.subject.name,
        date: data.date.split('T')[0],
        period: data.period,
        records: data.records.map(r => ({
          ...r,
          student: r.student._id,
          markedBy: r.markedBy?._id || userdata.id
        })),
        teacher: data.teacher?._id || userdata.id,
        academicYear: data.academicYear
      });

      const studentsRes = await authAxios.get(`students/class/${data.class._id}`);
      setStudents(studentsRes.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load attendance record.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentStatusChange = (studentId, status) => {
    setFormData(prev => ({
      ...prev,
      records: prev.records.map(r =>
        r.student === studentId ? { ...r, status, remarks: '' } : r
      )
    }));
  };

  const handleStudentRemarksChange = (studentId, remarks) => {
    setFormData(prev => ({
      ...prev,
      records: prev.records.map(r =>
        r.student === studentId ? { ...r, remarks } : r
      )
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAxios.put(`attendance/${id}`, formData);
      if (!res.data.success) throw new Error(res.data.message);
      alert('Attendance updated!');
      navigate('/teacher-attendance');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to update attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => navigate('/teacher-attendance')} className="text-blue-600 mb-4">
          <ArrowLeft className="inline mr-1" /> Back
        </button>
        <h1 className="text-2xl font-semibold mb-4">Edit Attendance</h1>

        {error && <div className="bg-red-100 p-4 rounded text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" value={formData.class} readOnly className="border p-2 rounded bg-gray-100" />
            <input type="text" value={formData.subject} readOnly className="border p-2 rounded bg-gray-100" />
            <input type="date" value={formData.date} readOnly className="border p-2 rounded bg-gray-100" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input
              type="number"
              name="period"
              value={formData.period}
              readOnly
              className="border p-2 rounded bg-gray-100"
            />
            <input
              type="text"
              name="academicYear"
              value={formData.academicYear}
              readOnly
              className="border p-2 rounded bg-gray-100"
            />
          </div>

          {loading ? (
            <Loader size="large" text="Loading attendance..." />
          ) : (
            <>
              <h2 className="text-lg font-semibold mt-6">Students</h2>
              <ul className="divide-y">
                {students.map(student => {
                  const record = formData.records.find(r => r.student === student._id);
                  return (
                    <li key={student._id} className="py-3 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                      <div>
                        <p>{student.firstName} {student.lastName}</p>
                        
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {['present', 'absent', 'late', 'excused'].map(status => (
                          <button
                            type="button"
                            key={status}
                            onClick={() => handleStudentStatusChange(student._id, status)}
                            className={`px-3 py-1 rounded-full text-white font-medium ${
                              record?.status === status
                                ? status === 'present' ? 'bg-green-600' :
                                  status === 'absent' ? 'bg-red-600' :
                                  status === 'late' ? 'bg-yellow-500' :
                                  'bg-blue-600'
                                : 'bg-gray-300 text-black'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                        <input
                          type="text"
                          placeholder="Remarks"
                          value={record?.remarks || ''}
                          onChange={(e) => handleStudentRemarksChange(student._id, e.target.value)}
                          className="border rounded px-2 py-1"
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}

          <div className="flex justify-end">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded flex items-center" disabled={saving}>
              {saving ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Update Attendance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TeacherEditAttendance;
