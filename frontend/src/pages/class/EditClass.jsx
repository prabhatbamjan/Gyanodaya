import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';

function EditClass() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    roomNumber: '',
    fee: '',
    academicYear: new Date().getFullYear(),
    subjects: [],
    classTeacher: '',
  });

  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClassData = async () => {
      try {
        const res = await authAxios.get(`classes/${id}`);
        const classData = res.data.data;

        setFormData({
          ...classData,
          subjects: classData.subjects || [],
          classTeacher: classData.classTeacher?._id || '',
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load class data.');
      }
    };

    const fetchSubjects = async () => {
      try {
        const res = await authAxios.get('subjects/');
        setSubjects(res.data.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError('Failed to fetch subjects.');
      }
    };

    const fetchTeachers = async () => {
      try {
        const res1 = await authAxios.get(`timetables/class/${id}`);
        const timetable = res1.data.data;
        const res = await authAxios.get('teachers/');
        const allTeachers = res.data.data;

        const teacherIdsInTimetable = new Set();

        timetable.forEach((dayData) => {
          if (Array.isArray(dayData.periods)) {
            dayData.periods.forEach((period) => {
              if (period.teacher && period.teacher._id) {
                teacherIdsInTimetable.add(period.teacher._id);
              }
            });
          }
        });

        let filteredTeachers = allTeachers.filter((teacher) =>
          teacherIdsInTimetable.has(teacher._id)
        );

        const assignedTeacherId = formData.classTeacher;
        if (assignedTeacherId) {
          const assignedTeacher = allTeachers.find(
            (teacher) => teacher._id === assignedTeacherId
          );
          if (
            assignedTeacher &&
            !filteredTeachers.some((t) => t._id === assignedTeacherId)
          ) {
            filteredTeachers = [assignedTeacher, ...filteredTeachers];
          }
        }

        setTeachers(filteredTeachers);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        setError('Failed to fetch teachers.');
      }
    };

    fetchClassData();
    fetchSubjects();
    fetchTeachers();
  }, [id, formData.classTeacher]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if ((name === "fee" || name === "academicYear") && /[^0-9]/.test(value)) return;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubjectToggle = (subjectId) => {
    setFormData(prev => {
      const isSelected = prev.subjects.some(sub => sub._id === subjectId || sub === subjectId);
      if (isSelected) {
        return {
          ...prev,
          subjects: prev.subjects.filter(sub => (sub._id || sub) !== subjectId),
        };
      } else {
        return {
          ...prev,
          subjects: [...prev.subjects, subjectId],
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const { name, grade, section, subjects, academicYear, fee, roomNumber, classTeacher } = formData;

    if (!name || !grade || !section || !academicYear || !fee || !roomNumber || !subjects || !classTeacher) {
      setError('Please fill all required fields.');
      setIsLoading(false);
      return;
    }

    if (subjects.length < 7 || subjects.length > 9) {
      setError('You must select between 7 and 9 subjects.');
      setIsLoading(false);
      return;
    }

    if (name !== grade) {
      setError('Class name must be equal to grade.');
      setIsLoading(false);
      return;
    }

    if (parseFloat(fee) < 0) {
      setError('Fee cannot be negative.');
      setIsLoading(false);
      return;
    }

    try {
      const dataToUpdate = {
        name,
        grade,
        section,
        academicYear,
        fee,
        roomNumber,
        classTeacher,
        subjects: subjects.map(sub => (typeof sub === 'string' ? sub : sub._id)),
      };

      await authAxios.put(`classes/${id}`, dataToUpdate);
      alert('Class updated successfully');
      navigate('/admin-classes');
    } catch (err) {
      console.error('Error updating class:', err);
      setError(err.response?.data?.message || 'Failed to update class');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <Link to="/admin-classes" className="flex items-center text-blue-600 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Classes
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Edit Class</h1>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["name", "grade"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field === "name" ? "Class Name" : "Grade"} <span className="text-red-500">*</span>
                </label>
                <select
                  name={field}
                  value={formData[field]}
                  onChange={handleInputChange}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select {field}</option>
                  {[...Array(12)].map((_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Section</option>
                {["A", "B", "C", "D", "E", "F", "G", "H"].map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Room Number <span className="text-red-500">*</span>
              </label>
              <select
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Room</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={String(i + 1)}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                min={new Date().getFullYear()}
                
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fee <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Teacher <span className="text-red-500">*</span>
              </label>
              <select
                name="classTeacher"
                value={formData.classTeacher}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher._id} value={teacher._id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {subjects.map(subject => {
                const isSelected = formData.subjects.some(sub => (sub._id || sub) === subject._id);
                return (
                  <button
                    key={subject._id}
                    type="button"
                    onClick={() => handleSubjectToggle(subject._id)}
                    className={`px-3 py-1 rounded-md flex items-center space-x-2 ${
                      isSelected
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'border hover:bg-gray-100'
                    }`}
                  >
                    <span>{subject.name}</span>
                  </button>
                );
              })}
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
              {isLoading ? 'Saving...' : 'Update Class'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default EditClass;
