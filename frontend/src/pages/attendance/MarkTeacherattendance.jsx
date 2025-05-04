import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout'; // assuming admin marks teacher attendance
import Loader from '../../components/Loader';
import authAxios, { getUserData } from '../../utils/auth';

const MarkTeacherAttendance = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    records: [],
    user: getUserData().id
  });

  const [selectedTeachers, setSelectedTeachers] = useState([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await authAxios.get('teachers/');
      setTeachers(res.data.data || []);
    } catch (err) {
      setError('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (!formData.teacher || !formData.date || !formData.status) {
        throw new Error('Please fill in all required fields.');
      }

      const today = new Date().toISOString().split('T')[0];
      if (formData.date !== today) {
        throw new Error('You can only mark attendance for today.');
      }

      // Create records array from selected teachers
      const records = selectedTeachers.map(teacher => ({
        teacher: teacher._id,
        status: teacher.status || 'present',
        remarks: teacher.remarks || '',
        markedBy: getUserData().id
      }));

      const dataToSubmit = {
        ...formData,
        records
      };

      const res = await authAxios.post('/api/attendance/teacher', dataToSubmit);
      if (!res.data.success) throw new Error(res.data.message);

      alert('Attendance saved!');
      navigate('/teacher-attendance');
    } catch (err) {
      setError(err.message || 'Failed to save attendance');
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
        <h1 className="text-2xl font-semibold mb-4">Mark Teacher Attendance</h1>

        {error && <div className="bg-red-100 p-4 rounded text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
          {loading ? (
            <Loader size="large" text="Loading teachers..." />
          ) : (
            <>
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Select Teachers</h3>
                {teachers.map(teacher => (
                  <div key={teacher._id} className="flex items-center gap-4 p-2 border-b">
                    <div className="flex-1">
                      <input
                        type="checkbox"
                        id={`teacher-${teacher._id}`}
                        checked={selectedTeachers.some(t => t._id === teacher._id)}
                        onChange={() => {
                          setSelectedTeachers(prev => {
                            if (prev.some(t => t._id === teacher._id)) {
                              return prev.filter(t => t._id !== teacher._id);
                            } else {
                              return [...prev, { ...teacher, status: 'present', remarks: '' }];
                            }
                          });
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`teacher-${teacher._id}`}>
                        {teacher.firstName} {teacher.lastName}
                      </label>
                    </div>
                    {selectedTeachers.some(t => t._id === teacher._id) && (
                      <div className="flex gap-4">
                        <select
                          value={selectedTeachers.find(t => t._id === teacher._id)?.status || 'present'}
                          onChange={(e) => {
                            setSelectedTeachers(prev =>
                              prev.map(t =>
                                t._id === teacher._id
                                  ? { ...t, status: e.target.value }
                                  : t
                              )
                            );
                          }}
                          className="border p-1 rounded"
                        >
                          {['present', 'absent', 'late', 'excused'].map(status => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Remarks"
                          value={selectedTeachers.find(t => t._id === teacher._id)?.remarks || ''}
                          onChange={(e) => {
                            setSelectedTeachers(prev =>
                              prev.map(t =>
                                t._id === teacher._id
                                  ? { ...t, remarks: e.target.value }
                                  : t
                              )
                            );
                          }}
                          className="border p-1 rounded"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                required
              />

              <div className="flex gap-2">
                {['present', 'absent', 'late', 'excused'].map(status => (
                  <label key={status} className="flex items-center gap-1">
                    <input
                      type="radio"
                      name="status"
                      value={status}
                      checked={formData.status === status}
                      onChange={handleChange}
                    />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </label>
                ))}
              </div>

              <input
                type="text"
                name="remarks"
                placeholder="Remarks (optional)"
                value={formData.remarks}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />

              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                readOnly
                className="w-full border p-2 rounded bg-gray-100"
              />
            </>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Attendance
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default MarkTeacherAttendance;
