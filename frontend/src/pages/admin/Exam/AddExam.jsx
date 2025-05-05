import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authAxios from '../../../utils/auth';
import Layout from '../../../components/layoutes/adminlayout';

function AddExam() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    type: '',
    startDate: '',
    endDate: '',
    totalMarks: '',
    passingMarks: '',
    description: '',
    academicYear: new Date().getFullYear(),
    classSubjects: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [classes, setClasses] = useState([]);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [classSubjectMap, setClassSubjectMap] = useState({}); // { classId: [subjectId] }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resClasses = await authAxios.get('/classes'); // classes should have subjects populated
        const classData = resClasses.data.data || [];

        const subjectMap = {};
        classData.forEach(cls => {
          subjectMap[cls._id] = [];
        });

        setClasses(classData);
        setClassSubjectMap(subjectMap);
      } catch (error) {
        console.error('Error fetching classes:', error);
        setError('Failed to load classes. Please try again.');
      }
    };

    fetchData();
  }, []);

  const handleClassSelection = (classId) => {
    if (selectedClassIds.includes(classId)) {
      setSelectedClassIds(selectedClassIds.filter(id => id !== classId));
      const updatedMap = { ...classSubjectMap };
      delete updatedMap[classId];
      setClassSubjectMap(updatedMap);
    } else {
      setSelectedClassIds([...selectedClassIds, classId]);
      setClassSubjectMap({ ...classSubjectMap, [classId]: [] });
    }
  };

  const handleSubjectToggle = (classId, subjectId) => {
    const currentSubjects = classSubjectMap[classId] || [];
    const newSubjects = currentSubjects.includes(subjectId)
      ? currentSubjects.filter(id => id !== subjectId)
      : [...currentSubjects, subjectId];
    setClassSubjectMap({ ...classSubjectMap, [classId]: newSubjects });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['totalMarks', 'passingMarks', 'duration'].includes(name) ? 
        parseInt(value) || '' : value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Exam name is required.');
      return false;
    }

    if (!formData.type) {
      setError('Please select an exam type.');
      return false;
    }

    if (!formData.startDate) {
      setError('Start date is required.');
      return false;
    }

    if (!formData.endDate) {
      setError('End date is required.');
      return false;
    }

    // Create Date objects with proper time components to ensure reliable comparison
    const startDate = new Date(formData.startDate + 'T00:00:00');
    const endDate = new Date(formData.endDate + 'T23:59:59');
    
    if (startDate >= endDate) {
      setError('End date must be after start date.');
      return false;
    }


    if (!formData.totalMarks || formData.totalMarks < 1) {
      setError('Total marks must be at least 1.');
      return false;
    }

    if (!formData.passingMarks || formData.passingMarks < 0) {
      setError('Passing marks must be 0 or greater.');
      return false;
    }

    if (parseInt(formData.passingMarks) > parseInt(formData.totalMarks)) {
      setError('Passing marks cannot be greater than total marks.');
      return false;
    }

    if (!formData.description.trim()) {
      setError('Description is required.');
      return false;
    }

    if (selectedClassIds.length === 0) {
      setError('Please select at least one class.');
      return false;
    }

    // Check if subjects are selected for each selected class
    for (const classId of selectedClassIds) {
      if (!classSubjectMap[classId] || classSubjectMap[classId].length === 0) {
        setError('Please select at least one subject for each selected class.');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const classSubjects = selectedClassIds.map(classId => ({
        class: classId,
        subjects: classSubjectMap[classId] || [],
      }));

      // Format dates properly to ensure they're correctly interpreted by MongoDB
      const startDateObj = new Date(formData.startDate + 'T00:00:00');
      const endDateObj = new Date(formData.endDate + 'T23:59:59');
      
      const payload = {
        ...formData,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        classSubjects,
        totalMarks: parseInt(formData.totalMarks),
        passingMarks: parseInt(formData.passingMarks),
        duration: parseInt(formData.duration) || 60 // Ensure duration is a number and has a fallback
      };

      console.log('Submitting exam data:', payload);
      const response = await authAxios.post('/exams', payload);
      
      console.log('Exam created successfully:', response.data);
      alert('Exam created successfully!');
      navigate('/admin-exams');
    } catch (error) {
      console.error('Error creating exam:', error);
      // Display the specific validation error from the backend
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to create exam. Please try again.';
      setError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <Link to="/admin-exams" className="text-blue-600 mb-4 block">← Back</Link>
        <h1 className="text-2xl font-bold mb-6">Add Exam</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
          <div>
              <label className="block mb-1 font-medium"> Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Exam Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              >
                <option value="">Select Type</option>
                <option value="Unit Test">Unit Test</option>
                <option value="Mid Term">Mid Term</option>
                <option value="Final Term">Final Term</option>
                <option value="Practice Test">Practice Test</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Total Marks</label>
              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
                min={1}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Passing Marks</label>
              <input
                type="number"
                name="passingMarks"
                value={formData.passingMarks}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
                min={0}
              />
            </div>

           

            <div>
              <label className="block mb-1 font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>
          </div>

          {/* Class and Subject Mapping */}
          <div className="space-y-4">
            <label className="block font-medium">Select Classes and Subjects:</label>
            {classes.map(cls => (
              <div key={cls._id} className="border p-4 rounded">
                <label className="flex items-center space-x-2 mb-2">
                  <input
                    type="checkbox"
                    checked={selectedClassIds.includes(cls._id)}
                    onChange={() => handleClassSelection(cls._id)}
                  />
                  <span className="font-semibold">{cls.name} - {cls.section}</span>
                </label>

                {selectedClassIds.includes(cls._id) && (
                  <div className="ml-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(cls.subjects || []).map(sub => (
                      <label key={sub._id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={classSubjectMap[cls._id]?.includes(sub._id) || false}
                          onChange={() => handleSubjectToggle(cls._id, sub._id)}
                        />
                        <span>{sub.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="border p-2 rounded w-full h-24"
              required
            />
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddExam;
