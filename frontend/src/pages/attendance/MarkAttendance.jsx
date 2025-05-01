import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Layout from '../../components/layoutes/teacherlayout';
import Loader from '../../components/Loader';
import authAxios, { getUserData } from '../../utils/auth';

const TeacherMarkAttendance = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacherTimetables, setTeacherTimetables] = useState([]);
  
  const userdata = getUserData();
  const [formData, setFormData] = useState({
    class: '',
    subject: '',
    date: new Date().toISOString().split('T')[0],
    period: '',
    records: [],
    teacher:userdata.id,
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  });
 



  useEffect(() => {
    fetchTeacherData();
  }, []);

  useEffect(() => {
    if (formData.class) {
      updateSubjectsForClass(formData.class);
      fetchStudentsForClass(formData.class);
    }
  }, [formData.class]);

  const fetchTeacherData = async () => {
    setLoading(true);
    try {
      const [classesRes, teacherRes] = await Promise.all([
        authAxios.get('classes/'),
        authAxios.get(`timetables/teacher/class/${userdata.id}`)
      ]);

      const allClasses = classesRes.data.data || [];
      const teacherData = teacherRes.data.data || [];
  console.log(allClasses)
      setTeacherTimetables(teacherData);

      const classIds = new Set();
      teacherData.forEach(timetable => {
        if (timetable.class?._id) classIds.add(timetable.class._id);
      });

      const filteredClasses = allClasses.filter(cls => classIds.has(cls._id));
      setClasses(filteredClasses);
    } catch (err) {
      console.error('Error fetching teacher data:', err);
      setError('Failed to load teacher data');
    } finally {
      setLoading(false);
    }
  };

  const updateSubjectsForClass = (classId) => {
    const classSubjects = teacherTimetables
      .filter(t => t.class?._id === classId)
      .flatMap(t => t.periods || [])
      .map(p => p.subject)
      .filter((subj, index, self) => subj && self.findIndex(s => s._id === subj._id) === index);

    setSubjects(classSubjects);
    setFormData(prev => ({
      ...prev,
      subject: '',
      period: '',
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
    }));
  };

  const fetchStudentsForClass = async (classId) => {
    try {
      const studentsRes = await authAxios.get(`students/class/${classId}`);
      if (studentsRes.status === 200) {
        const studentData = studentsRes.data.data || [];
        setStudents(studentData);
        setFormData(prev => ({
          ...prev,
          records: studentData.map(student => ({
            student: student._id,
            status: 'present',
            remarks: '',
            markedBy:userdata.id
          }))
        }));
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = e => {
    const subjectId = e.target.value;

    // Find timetable with matching class and subject
    const matchingTimetable = teacherTimetables.find(t =>
      t.class?._id === formData.class &&
      t.periods?.some(p => p.subject?._id === subjectId)
    );

    const matchingPeriod = matchingTimetable?.periods?.find(p => p.subject?._id === subjectId);

    // Get academic year from class if it exists
    const selectedClass = classes.find(cls => cls._id === formData.class);
    const academicYearFromClass = selectedClass?.academicYear || formData.academicYear;

    setFormData(prev => ({
      ...prev,
      subject: subjectId,
      period: matchingPeriod?.periodNumber || '',
      academicYear: academicYearFromClass
    }));
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
      const today = new Date().toISOString().split('T')[0];
      if (formData.date !== today) {
        throw new Error('You can only mark attendance for today.');
      }
      const res = await authAxios.post('attendance/', formData);
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

            <select name="subject" value={formData.subject} onChange={handleSubjectChange} required className="border p-2 rounded">
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
            <Loader size="large" text="Loading students..." />
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
                        <p className="text-sm text-gray-500">Roll No: {student.rollNumber}</p>
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
