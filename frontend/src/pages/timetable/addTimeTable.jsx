import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';

function AddTimetable() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [days] = useState(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [selectedDay, setSelectedDay] = useState('Sunday');

  // Initialize with exactly 7 periods
  const [formData, setFormData] = useState({
    class: '',
    day: 'Sunday', // Directly initialized to Sunday
    periods: Array(7).fill().map((_, i) => ({
      periodNumber: i + 1,
      startTime: calculatePeriodTime(i).startTime,
      endTime: calculatePeriodTime(i).endTime,
      subject: '',
      teacher: ''
    })),
    academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`
  });

  // Helper function to calculate period times
  function calculatePeriodTime(periodIndex) {
    const startHour = 8; // School starts at 8:00 AM
    const periodDuration = 45; // Each period is 45 minutes
    const breakDuration = 5; // 5 minutes between periods

    const startMinutes = startHour * 60 + periodIndex * (periodDuration + breakDuration);
    const endMinutes = startMinutes + periodDuration;

    return {
      startTime: `${Math.floor(startMinutes / 60).toString().padStart(2, '0')}:${(startMinutes % 60).toString().padStart(2, '0')}`,
      endTime: `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`
    };
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [classesRes, teachersRes, subjectsRes] = await Promise.all([
          authAxios.get('classes/'),
          authAxios.get('teachers/'),
          authAxios.get('subjects/')
        ]);
        setClasses(classesRes.data.data);
        setTeachers(teachersRes.data.data);
        setSubjects(subjectsRes.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  const handlePeriodChange = (index, field, value) => {
    setError(null); // Reset error immediately
    const updatedPeriods = [...formData.periods];
    const currentPeriod = updatedPeriods[index];
    if (!formData.class) {
      setError('Please select a class');
      setIsLoading(false);
      return;
    }
    if (field === 'teacher') {
      currentPeriod.subject = ''; // Clear subject when teacher changes
    }

    updatedPeriods[index] = {
      ...currentPeriod,
      [field]: value
    };

    if ((field === 'teacher' || field === 'subject') && value) {
      const teacherId = field === 'teacher' ? value : updatedPeriods[index].teacher;
      const subjectId = field === 'subject' ? value : updatedPeriods[index].subject;

      if (teacherId && subjectId) {
        const isDuplicateTeacherSubject = updatedPeriods.some((period, i) =>
          i !== index &&
          period.teacher === teacherId &&
          period.subject === subjectId
        );

        const isDuplicateSubject = updatedPeriods.some((period, i) =>
          i !== index &&
          period.subject === subjectId
        );

        if (isDuplicateTeacherSubject) {
          setError('This teacher is already assigned to this subject in another period.');
          return;
        }

        if (isDuplicateSubject) {
          setError('This subject is already assigned to another period.');
          return;
        }
      }
    }
    if (field === 'subject') {
      const selectedClass = classes.find(c => c._id === formData.class);
      if (selectedClass && !selectedClass.subjects.includes(value)) {
        setError('Selected subject is not available for this class.');
        return;
      }
    }
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

   

    for (let i = 0; i < formData.periods.length; i++) {
      const period = formData.periods[i];
      if (!period.teacher || !period.subject) {
        setError(`Please select teacher and subject for Period ${i + 1}`);
        setIsLoading(false);
        return;
      }
    }

    try {
      const response = await authAxios.post('timetables', formData);
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create timetable');
      }
      alert('Timetable created successfully!');
      navigate('/admin-timetable');
    } catch (err) {
      console.error('Error creating timetable:', err);
      setError(err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <Link to="/admin-timetable" className="flex items-center text-blue-600 mb-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Timetables
        </Link>
        <h1 className="text-2xl font-bold mb-4">Add Timetable</h1>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Timetable for {selectedDay} (7 Periods)
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
                    {period.teacher && teachers
                      .find(t => t._id === period.teacher)
                      ?.subjects
                      .map(subId => {
                        const sub = subjects.find(s => s._id === subId);
                        return sub ? (
                          <option key={sub._id} value={sub._id}>
                            {sub.name}
                          </option>
                        ) : null;
                      })}
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
              {isLoading ? 'Saving...' : 'Create Timetable'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddTimetable;
