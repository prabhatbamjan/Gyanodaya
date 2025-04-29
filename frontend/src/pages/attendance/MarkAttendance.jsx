import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Check, X, Clock, Info } from 'lucide-react';
import Layout from '../../components/layoutes/teacherlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const TeacherMarkAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({
    class: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    period: 1,
    records: [],
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  });

  useEffect(() => {
    fetchTeacherData();
  }, [formData.class]);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const [classesRes, subjectsRes] = await Promise.all([
        authAxios.get('classes/'),
        authAxios.get('subjects/')
      ]);
      console.log(classesRes.data.data);
      console.log(subjectsRes.data.data);
      setClasses(classesRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);

      if (formData.class) {
        const studentsRes = await authAxios.get(`class/${formData.class}`);
        setStudents(studentsRes.data.data || []);

        setFormData(prev => ({
          ...prev,
          records: studentsRes.data.data.map(student => ({
            student: student._id,
            status: 'present',
            remarks: ''
          }))
        }));
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      if (!formData.class || !formData.subject || !formData.date || !formData.period) {
        throw new Error('Please fill in all required fields');
      }

      const res = await authAxios.post('attendance/', formData);
      if (!res.data.success) throw new Error(res.data.message);
      alert('Attendance saved!');
      navigate('/teacher/attendance');
    } catch (err) {
      setError(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <Check className="text-green-500" />;
      case 'absent': return <X className="text-red-500" />;
      case 'late': return <Clock className="text-yellow-500" />;
      case 'excused': return <Info className="text-blue-500" />;
      default: return null;
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => navigate('/teacher/attendance')} className="text-blue-600 mb-4">
          <ArrowLeft className="inline mr-1" /> Back
        </button>
        <h1 className="text-2xl font-semibold mb-4">Mark Attendance</h1>

        {error && <div className="bg-red-100 p-4 rounded text-red-700">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select name="class" value={formData.class} onChange={handleInputChange} required className="border p-2 rounded">
              <option value="">Select Class</option>
              {classes.map(cls => (
                <option key={cls._id} value={cls._id}>{cls.name} - {cls.section}</option>
              ))}
            </select>

            <select name="subject" value={formData.subject} onChange={handleInputChange} required className="border p-2 rounded">
              <option value="">Select Subject</option>
              {subjects.map(sub => (
                <option key={sub._id} value={sub._id}>{sub.name}</option>
              ))}
            </select>

            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="border p-2 rounded"
              required
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <input type="number" name="period" value={formData.period} onChange={handleInputChange} min="1" max="8" className="border p-2 rounded" />
            <input type="text" name="academicYear" value={formData.academicYear} onChange={handleInputChange} className="border p-2 rounded" />
          </div>

          {loading ? (
            <Loader size="large" text="Loading students..." />
          ) : (
            <>
              <h2 className="text-lg font-semibold mt-6">Students</h2>
              <ul className="divide-y">
                {students.map(student => {
                  const record = formData.records.find(r => r.student === student._id);
                  return (
                    <li key={student._id} className="py-3 flex justify-between items-center">
                      <div>
                        <p>{student.firstName} {student.lastName}</p>
                        <p className="text-sm text-gray-500">Roll No: {student.rollNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {['present', 'absent', 'late', 'excused'].map(status => (
                          <button
                            type="button"
                            key={status}
                            onClick={() => handleStudentStatusChange(student._id, status)}
                            className={`p-2 rounded-full ${record?.status === status ? 'bg-gray-200' : 'bg-gray-50'}`}
                          >
                            {getStatusIcon(status)}
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

export default TeacherMarkAttendance;
