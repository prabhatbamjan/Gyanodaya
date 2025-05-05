import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Info, Calendar } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

function EditTimetable() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [days] = useState(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']);
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const [formData, setFormData] = useState({
    class: '',
    day: 'Monday',
    periods: Array(7).fill().map((_, i) => ({
      periodNumber: i + 1,
      startTime: '',
      endTime: '',
      subject: '',
      teacher: '',
      location: 'Regular Classroom',
      notes: ''
    })),
    academicYear: `${new Date().getFullYear()}`,
    isRecurring: true,
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveUntil: '',
    status: 'active'
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      setError(null);
      try {
        // Fetch classes, teachers, subjects, and the specific timetable
        const [classesRes, teachersRes, subjectsRes, timetableRes] = await Promise.all([
          authAxios.get('classes/'),
          authAxios.get('teachers/'),
          authAxios.get('subjects/'),
          authAxios.get(`timetables/${id}`),
        ]);
      
        const allOk = [classesRes, teachersRes, subjectsRes, timetableRes].every(
          res => res.status === 200
        );
        
        if (!allOk) {
          throw new Error('One or more API responses were not OK');
        }
        console.log(timetableRes.data.data);
        setClasses(classesRes.data.data);
        setTeachers(teachersRes.data.data);
        setSubjects(subjectsRes.data.data);
        
        // Set the form data from the fetched timetable
        const timetable = timetableRes.data.data;
        
        // Format dates from the API response
        let effectiveFrom = '';
        let effectiveUntil = '';
        
        if (timetable.effectiveFrom) {
          effectiveFrom = new Date(timetable.effectiveFrom).toISOString().split('T')[0];
        }
        
        if (timetable.effectiveUntil) {
          effectiveUntil = new Date(timetable.effectiveUntil).toISOString().split('T')[0];
        }
        
        setFormData({
          class: timetable.class._id || timetable.class,
          day: timetable.day,
          periods: timetable.periods.map(period => ({
            periodNumber: period.periodNumber,
            startTime: period.startTime,
            endTime: period.endTime,
            subject: period.subject._id || period.subject,
            teacher: period.teacher._id || period.teacher,
            location: period.location || 'Regular Classroom',
            notes: period.notes || ''
          })),
          academicYear: timetable.academicYear,
          isRecurring: timetable.isRecurring !== undefined ? timetable.isRecurring : true,
          effectiveFrom,
          effectiveUntil,
          status: timetable.status || 'active'
        });
        
        setSelectedDay(timetable.day);
        
        // Show advanced options if they contain non-default values
        if (timetable.status !== 'active' || 
            timetable.isRecurring === false || 
            timetable.effectiveUntil) {
          setShowAdvancedOptions(true);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setIsDataLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handlePeriodChange = (index, field, value) => {
    const updatedPeriods = [...formData.periods];
    const currentPeriod = updatedPeriods[index];
    
    updatedPeriods[index] = {
      ...currentPeriod,
      [field]: value
    };

    // Check for teacher schedule conflicts within the same time slot
    if ((field === 'teacher' || field === 'startTime' || field === 'endTime') && value) {
      const teacherId = updatedPeriods[index].teacher;
      const startTime = updatedPeriods[index].startTime;
      const endTime = updatedPeriods[index].endTime;

      if (teacherId && startTime && endTime) {
        const isDuplicate = updatedPeriods.some((period, i) => 
          i !== index &&
          period.teacher === teacherId && 
          period.startTime === startTime &&
          period.endTime === endTime
        );

        if (isDuplicate) {
          setError('This teacher is already scheduled during this time slot');
          return;
        }
      }
    }
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
    let hasMissingFields = false;
    formData.periods.forEach((period, i) => {
      if (period.startTime && period.endTime) {
        if (!period.teacher || !period.subject) {
          setError(`Please select teacher and subject for Period ${i + 1}`);
          hasMissingFields = true;
        }
      }
    });

    if (hasMissingFields) {
      setIsLoading(false);
      return;
    }

    // Filter out empty periods (where no time is set)
    const filteredPeriods = formData.periods.filter(
      period => period.startTime && period.endTime
    );

    // Ensure effective dates are valid
    if (formData.effectiveFrom && formData.effectiveUntil) {
      const fromDate = new Date(formData.effectiveFrom);
      const untilDate = new Date(formData.effectiveUntil);
      
      if (fromDate > untilDate) {
        setError('Effective from date cannot be after effective until date');
        setIsLoading(false);
        return;
      }
    }

    try {
      // Prepare data to send to API
      const dataToSend = {
        ...formData,
        periods: filteredPeriods
      };
      
      const response = await authAxios.put(`timetables/${id}`, dataToSend);
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
          <Loader size="large" text="Loading timetable data..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin-timetable')}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Timetables
            </button>
          </div>
        </div>

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formData.day}
                onChange={(e) => handleDayChange(e.target.value)}
                required
              >
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
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
            <button 
              type="button"
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              className="text-blue-600 flex items-center text-sm font-medium mb-4"
            >
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options <Info className="ml-1 h-4 w-4" />
            </button>
            
            {showAdvancedOptions && (
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      className="w-full border rounded px-3 py-2"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={formData.isRecurring}
                        onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                      />
                      Is Recurring
                    </label>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective From</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2"
                      value={formData.effectiveFrom}
                      onChange={(e) => setFormData({ ...formData, effectiveFrom: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective Until (optional)</label>
                    <input
                      type="date"
                      className="w-full border rounded px-3 py-2"
                      value={formData.effectiveUntil}
                      onChange={(e) => setFormData({ ...formData, effectiveUntil: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">
              Timetable for {selectedDay}
            </h2>

            <div className="space-y-4">
              {formData.periods.map((period, index) => (
                <div key={index} className="border rounded p-4 bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end mb-3">
                    <div className="font-semibold text-gray-600">
                      Period {period.periodNumber}
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                      <input
                        type="time"
                        className="border rounded px-2 py-1 w-full"
                        value={period.startTime}
                        onChange={(e) => handlePeriodChange(index, 'startTime', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Time</label>
                      <input
                        type="time"
                        className="border rounded px-2 py-1 w-full"
                        value={period.endTime}
                        onChange={(e) => handlePeriodChange(index, 'endTime', e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Teacher</label>
                      <select
                        className="border rounded px-2 py-1 w-full"
                        value={period.teacher}
                        onChange={(e) => handlePeriodChange(index, 'teacher', e.target.value)}
                      >
                        <option value="">Select Teacher</option>
                        {teachers.map((teacher) => (
                          <option key={teacher._id} value={teacher._id}>
                            {teacher.firstName} {teacher.lastName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Subject</label>
                      <select
                    className="border rounded px-2 py-1 w-full"
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
                    </div>

                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Location</label>
                      <input
                        type="text"
                        className="border rounded px-2 py-1 w-full"
                        value={period.location}
                        onChange={(e) => handlePeriodChange(index, 'location', e.target.value)}
                        placeholder="e.g., Room 101"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Notes</label>
                    <input
                      type="text"
                      className="border rounded px-2 py-1 w-full"
                      value={period.notes}
                      onChange={(e) => handlePeriodChange(index, 'notes', e.target.value)}
                      placeholder="Optional notes"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin-timetable')}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Timetable
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default EditTimetable;