import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import authAxios from '../../../utils/auth';
import Layout from '../../../components/layoutes/adminlayout';

function EditExam() {
  const { id } = useParams();
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

  const [classes, setClasses] = useState([]);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [classSubjectMap, setClassSubjectMap] = useState({}); // { classId: [subjectId] }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, classRes] = await Promise.all([
          authAxios.get(`exams/${id}`),
          authAxios.get('classes'),
        ]);

        const exam = examRes.data.data;
        const allClasses = classRes.data.data;

        const selectedClassIds = exam.classSubjects.map(cs => cs.class);
        const subjectMap = {};
        exam.classSubjects.forEach(cs => {
          subjectMap[cs.class] = cs.subjects;
        });

        setFormData({
          ...exam,
          startDate: exam.startDate?.split('T')[0] || '',
          endDate: exam.endDate?.split('T')[0] || '',
        });
        setSelectedClassIds(selectedClassIds);
        setClassSubjectMap(subjectMap);
        setClasses(allClasses);
      } catch (error) {
        console.error('Error fetching exam or class data:', error);
        alert('Failed to load exam data');
      }
    };

    fetchData();
  }, [id]);

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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const {
      name,
      type,
      totalMarks,
      passingMarks,
      startDate,
      endDate,
      description,
      academicYear
    } = formData;

    if (!name.trim()) return alert('Name is required.') || false;
    if (!type) return alert('Exam type is required.') || false;
    if (!startDate || !endDate) return alert('Start and End dates are required.') || false;
    if (new Date(startDate) > new Date(endDate)) return alert('Start date cannot be after end date.') || false;
    if (Number(totalMarks) < 0) return alert('Total marks cannot be negative.') || false;
    if (Number(passingMarks) < 0) return alert('Passing marks cannot be negative.') || false;
    if (Number(totalMarks) < Number(passingMarks)) return alert('Total marks cannot be less than passing marks.') || false;
    if (!academicYear) return alert('Academic year is required.') || false;
    if (!description.trim()) return alert('Description is required.') || false;
    if (selectedClassIds.length === 0) return alert('Please select at least one class.') || false;

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const classSubjects = selectedClassIds.map(classId => ({
      class: classId,
      subjects: classSubjectMap[classId] || [],
    }));

    const payload = {
      ...formData,
      classSubjects,
    };

    try {
      await authAxios.put(`exams/${id}`, payload);
      alert('Exam updated successfully!');
      navigate('/admin-exams');
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('Failed to update exam');
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <Link to="/admin-exams" className="text-blue-600 mb-4 block">← Back</Link>
        <h1 className="text-2xl font-bold mb-6">Edit Exam</h1>

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
                <option>Unit Test</option>
                <option>Mid Term</option>
                <option>Final Term</option>
                <option>Practice Test</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium"> Total Marks</label>
              <input
                type="number"
                name="totalMarks"
                value={formData.totalMarks}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
                min={0}
                max={100}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium"> Passing Marks</label>
              <input
                type="number"
                name="passingMarks"
                value={formData.passingMarks}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
                min={0}
                max={100}
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
              rows={3}
              className="w-full border rounded p-2"
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Update Exam
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default EditExam;
