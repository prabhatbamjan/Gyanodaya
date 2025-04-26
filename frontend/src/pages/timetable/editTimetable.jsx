import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';

function EditTimetable() {
  const { id } = useParams(); // Get timetable ID from URL
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [days] = useState(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [selectedDay, setSelectedDay] = useState('Sunday');

  // Initialize with default values
  const [formData, setFormData] = useState({
    class: '',
    day: 'Sunday',
    periods: Array(7).fill().map((_, i) => ({
      periodNumber: i + 1,
      startTime: '',
      endTime: '',
      subject: '',
      teacher: ''
    })),
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        // Fetch classes, teachers, subjects, and the specific timetable
        const [classesRes, teachersRes, subjectsRes, timetableRes] = await Promise.all([
          authAxios.get('classes/'),
          authAxios.get('teachers/'),
          authAxios.get('subjects/'),
          authAxios.get(`timetables/${id}`),
        ]);
      
        setClasses(classesRes.data.data);
        setTeachers(teachersRes.data.data);
        setSubjects(subjectsRes.data.data);
        
        // Set the form data from the fetched timetable
        const timetable = timetableRes.data.data;
        setFormData({
          class: timetable.class._id || timetable.class,
          day: timetable.day,
          periods: timetable.periods.map(period => ({
            periodNumber: period.periodNumber,
            startTime: period.startTime,
            endTime: period.endTime,
            subject: period.subject._id || period.subject,
            teacher: period.teacher._id || period.teacher
          })),
          academicYear: timetable.academicYear
        });
        
        setSelectedDay(timetable.day);
      } catch (err) {
        console.error(err);
        setError('Failed to load data');
      } finally {
        setIsDataLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handlePeriodChange = (index, field, value) => {
    const updatedPeriods = [...formData.periods];
    const currentPeriod = updatedPeriods[index];
    
    if (field === 'teacher') {
      // Clear subject when teacher changes
      currentPeriod.subject = '';
    }

    updatedPeriods[index] = {
      ...currentPeriod,
      [field]: value
    };

    // Check for teacher-subject conflicts
    if ((field === 'teacher' || field === 'subject') && value) {
      const teacherId = field === 'teacher' ? value : updatedPeriods[index].teacher;
      const subjectId = field === 'subject' ? value : updatedPeriods[index].subject;

      if (teacherId && subjectId) {
        const isDuplicate = updatedPeriods.some((period, i) => 
          i !== index &&
          period.teacher === teacherId && 
          period.subject === subjectId
        );

        if (isDuplicate) {
          setError('This teacher is already assigned to this subject on this timetable');
          return;
        }
      }
    }

    setError(null);
    setFormData(prev => ({
      ...prev,
      periods: updatedPeriods
    }));
  };

  const handleDayChange = (day) => {
    setSelectedDay(day);
    setFormData(prev => ({
      ...prev,
      day
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (!formData.class) {
      setError('Please select a class');
      setIsLoading(false);
      return;
    }

    // Check all periods have teacher and subject
    for (let i = 0; i < formData.periods.length; i++) {
      const period = formData.periods[i];
      if (!period.teacher || !period.subject) {
        setError(`Please select teacher and subject for Period ${i + 1}`);
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await authAxios.put(`timetables/${id}`, formData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update timetable');
      }

      alert('Timetable updated successfully!');
      navigate('/admin-timetable');
    } catch (err) {
      console.error('Error updating timetable:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center h-full">
          <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <Link to="/admin-timetable" className="flex items-center text-blue-600 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Timetables
        </Link>
        <h1 className="text-2xl font-bold mb-4">Edit Timetable</h1>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formData.class}
                onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                required
              >
                <option value="">-- Select Class --</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} - {cls.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Day</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={selectedDay}
                onChange={(e) => handleDayChange(e.target.value)}
                required
              >
                {days.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Timetable for {selectedDay}
            </h2>

            <div className="space-y-4">
              {formData.periods.map((period, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="font-semibold text-gray-600">
                    Period {period.periodNumber}
                  </div>

                  <select
                    className="border rounded px-2 py-1"
                    value={period.teacher}
                    onChange={(e) => handlePeriodChange(index, 'teacher', e.target.value)}
                    required
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher._id} value={teacher._id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>

                  <select
                    className="border rounded px-2 py-1"
                    value={period.subject}
                    onChange={(e) => handlePeriodChange(index, 'subject', e.target.value)}
                    disabled={!period.teacher}
                    required
                  >
                    <option value="">Select Subject</option>
                    {period.teacher && 
                      teachers
                        .find(t => t._id === period.teacher)
                        ?.subjects
                        .map(subId => {
                          const sub = subjects.find(s => s._id === subId);
                          return sub ? (
                            <option key={sub._id} value={sub._id}>
                              {sub.name}
                            </option>
                          ) : null;
                        })
                        .filter(Boolean)
                    }
                  </select>

                  <input
                    type="time"
                    className="border rounded px-2 py-1"
                    value={period.startTime}
                    onChange={(e) => handlePeriodChange(index, 'startTime', e.target.value)}
                    required
                  />
                  <input
                    type="time"
                    className="border rounded px-2 py-1"
                    value={period.endTime}
                    onChange={(e) => handlePeriodChange(index, 'endTime', e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="flex items-center bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {isLoading ? 'Saving...' : 'Update Timetable'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default EditTimetable;