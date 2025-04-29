import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Check, X, Clock, Info } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const EditAttendance = () => {
  const { id } = useParams();
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
    date: '',
    period: 1,
    records: [],
    academicYear: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [classesRes, subjectsRes, attendanceRes] = await Promise.all([
        authAxios.get('classes/'),
        authAxios.get('subjects/'),
        authAxios.get(`attendance/${id}`)
      ]);

      if (!classesRes.data.success || !subjectsRes.data.success || !attendanceRes.data.success) {
        throw new Error('Failed to fetch required data');
      }

      setClasses(classesRes.data.data);
      setSubjects(subjectsRes.data.data);

      const attendance = attendanceRes.data.data;
      
      // Fetch students for the class
      const studentsRes = await authAxios.get(`students/class/${attendance.class._id}`);
      if (!studentsRes.data.success) {
        throw new Error('Failed to fetch students');
      }
      setStudents(studentsRes.data.data);

      // Set form data
      setFormData({
        class: attendance.class._id,
        subject: attendance.subject._id,
        date: new Date(attendance.date).toISOString().split('T')[0],
        period: attendance.period,
        records: attendance.records.map(record => ({
          student: record.student._id,
          status: record.status,
          remarks: record.remarks || ''
        })),
        academicYear: attendance.academicYear,
        status: attendance.status
      });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStudentStatusChange = (studentId, status) => {
    setFormData(prev => ({
      ...prev,
      records: prev.records.map(record => 
        record.student === studentId 
          ? { ...record, status, remarks: '' }
          : record
      )
    }));
  };

  const handleStudentRemarksChange = (studentId, remarks) => {
    setFormData(prev => ({
      ...prev,
      records: prev.records.map(record => 
        record.student === studentId 
          ? { ...record, remarks }
          : record
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.class || !formData.subject || !formData.date || !formData.period) {
        throw new Error('Please fill in all required fields');
      }

      // Validate at least one student is marked
      if (formData.records.length === 0) {
        throw new Error('No students to mark attendance for');
      }

      const response = await authAxios.put(`attendance/${id}`, formData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update attendance');
      }

      alert('Attendance updated successfully!');
      navigate('/attendance');
    } catch (err) {
      console.error('Error updating attendance:', err);
      setError(err.message || 'Failed to update attendance');
    } finally {
      setSaving(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <Check className="h-5 w-5 text-green-500" />;
      case 'absent':
        return <X className="h-5 w-5 text-red-500" />;
      case 'late':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'excused':
        return <Info className="h-5 w-5 text-blue-500" />;
      default:
        return null;
    }
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

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Attendance</h1>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
              <select
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
                disabled
              >
                <option value="">Select Class</option>
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
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
                disabled
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <input
                type="number"
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                min="1"
                max="8"
                className="w-full border rounded px-3 py-2"
                required
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input
                type="text"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader size="large" text="Loading students..." />
            </div>
          ) : (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700 mb-4">Student Attendance</h2>
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {students.map((student) => {
                    const record = formData.records.find(r => r.student === student._id);
                    return (
                      <li key={student._id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">
                                {student.firstName} {student.lastName}
                              </p>
                              <p className="text-sm text-gray-500">
                                Roll No: {student.rollNumber}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex space-x-2">
                              <button
                                type="button"
                                onClick={() => handleStudentStatusChange(student._id, 'present')}
                                className={`p-2 rounded-full ${
                                  record?.status === 'present' ? 'bg-green-100' : 'bg-gray-100'
                                }`}
                              >
                                <Check className="h-5 w-5 text-green-500" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStudentStatusChange(student._id, 'absent')}
                                className={`p-2 rounded-full ${
                                  record?.status === 'absent' ? 'bg-red-100' : 'bg-gray-100'
                                }`}
                              >
                                <X className="h-5 w-5 text-red-500" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStudentStatusChange(student._id, 'late')}
                                className={`p-2 rounded-full ${
                                  record?.status === 'late' ? 'bg-yellow-100' : 'bg-gray-100'
                                }`}
                              >
                                <Clock className="h-5 w-5 text-yellow-500" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStudentStatusChange(student._id, 'excused')}
                                className={`p-2 rounded-full ${
                                  record?.status === 'excused' ? 'bg-blue-100' : 'bg-gray-100'
                                }`}
                              >
                                <Info className="h-5 w-5 text-blue-500" />
                              </button>
                            </div>
                            <input
                              type="text"
                              placeholder="Remarks"
                              value={record?.remarks || ''}
                              onChange={(e) => handleStudentRemarksChange(student._id, e.target.value)}
                              className="border rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
              disabled={saving}
            >
              {saving ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Update Attendance
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditAttendance; 