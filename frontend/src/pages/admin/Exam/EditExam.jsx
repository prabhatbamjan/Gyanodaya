import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Layout from '../../../components/layoutes/adminlayout';
import authAxios from '../../../utils/auth';
import { ChevronDown } from 'lucide-react';

const EditExam = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState({
    name: '',
    type: '',
    startDate: '',
    endDate: '',
    duration: '',
    totalMarks: '',
    passingMarks: '',
    description: '',
    academicYear: '',
  });

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedClassIds, setSelectedClassIds] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [dropdownOpenClass, setDropdownOpenClass] = useState(false);
  const [dropdownOpenSubject, setDropdownOpenSubject] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch exam data
        const examResponse = await authAxios.get(`/api/exams/${id}`);
        console.log('Exam response:', examResponse.data);
        const exam = examResponse.data.data || examResponse.data;
        
        // Fetch classes and subjects
        const [classesRes, subjectsRes] = await Promise.all([
          authAxios.get('/api/classes'),
          authAxios.get('/api/subjects')
        ]);
        
        console.log('Classes response:', classesRes.data);
        console.log('Subjects response:', subjectsRes.data);
        
        // Make sure we access the correct data structure
        const classesData = classesRes.data.data || [];
        const subjectsData = subjectsRes.data.data || [];
        
        if(classesData.length === 0) {
          console.warn('No classes found in response');
        }
        
        if(subjectsData.length === 0) {
          console.warn('No subjects found in response');
        }
        
        setClasses(classesData);
        setSubjects(subjectsData);
        
        // Format dates for input fields
        const formattedStartDate = new Date(exam.startDate).toISOString().split('T')[0];
        const formattedEndDate = new Date(exam.endDate).toISOString().split('T')[0];
        
        setExamData({
          ...exam,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        });
        
        // Set selected classes and subjects
        setSelectedClassIds(exam.class || []);
        setSelectedSubjects(exam.subjects || []);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load exam data: ' + (error.response?.data?.message || 'Unknown error'));
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const toggleSelection = (id, selectedList, setSelectedList, allItems) => {
    if (id === 'all') {
      if (selectedList.length === allItems.length) {
        setSelectedList([]);
      } else {
        setSelectedList(allItems.map((item) => item._id));
      }
    } else {
      const newSelected = selectedList.includes(id)
        ? selectedList.filter((item) => item !== id)
        : [...selectedList, id];

      setSelectedList(newSelected);
    }
  };

  const isAllSelected = (selectedList, allItems) =>
    selectedList.length === allItems.length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExamData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedClassIds.length === 0 || selectedSubjects.length === 0) {
      alert('Please select at least one class and subject');
      return;
    }
    
    try {
      const payload = {
        ...examData,
        class: selectedClassIds,
        subjects: selectedSubjects
      };
      
      console.log('Sending update payload:', payload);
      const response = await authAxios.put(`/api/exams/${id}`, payload);
      console.log('Update exam response:', response.data);
      alert('Exam updated successfully');
      navigate('/admin-exams');
    } catch (error) {
      console.error('Error updating exam:', error);
      alert('Failed to update exam: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-10">
          <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <Link to="/admin-exams" className="text-blue-600 mb-4 block">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold mb-6">Edit Exam</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Exam Name</label>
              <input
                name="name"
                value={examData.name}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Exam Type</label>
              <select
                name="type"
                value={examData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="" disabled>Select Exam Type</option>
                <option value="Unit Test">Unit Test</option>
                <option value="Mid Term">Mid Term</option>
                <option value="Final Term">Final Term</option>
                <option value="Practice Test">Practice Test</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={examData.startDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">End Date</label>
              <input
                type="date"
                name="endDate"
                value={examData.endDate}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Duration (min)</label>
              <input
                type="number"
                name="duration"
                value={examData.duration}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Total Marks</label>
              <input
                type="number"
                name="totalMarks"
                value={examData.totalMarks}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Passing Marks</label>
              <input
                type="number"
                name="passingMarks"
                value={examData.passingMarks}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium">Academic Year</label>
              <input
                type="text"
                name="academicYear"
                value={examData.academicYear}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              />
            </div>
          </div>

          {/* Class Multi-Select */}
          <div className="relative">
            <label className="block mb-1 font-medium">Select Class(es)</label>
            <div
              className="border rounded px-4 py-2 cursor-pointer flex justify-between items-center"
              onClick={() => setDropdownOpenClass((prev) => !prev)}
            >
              <span>
                {isAllSelected(selectedClassIds, classes)
                  ? 'All Classes Selected'
                  : `${selectedClassIds.length} selected`}
              </span>
              <ChevronDown size={16} />
            </div>
            {dropdownOpenClass && (
              <div className="absolute bg-white shadow border rounded w-full mt-1 z-10 max-h-60 overflow-y-auto">
                <label className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllSelected(selectedClassIds, classes)}
                    onChange={() =>
                      toggleSelection('all', selectedClassIds, setSelectedClassIds, classes)
                    }
                    className="mr-2"
                  />
                  All Classes
                </label>
                {classes.map((cls) => (
                  <label
                    key={cls._id}
                    className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClassIds.includes(cls._id)}
                      onChange={() =>
                        toggleSelection(cls._id, selectedClassIds, setSelectedClassIds, classes)
                      }
                      className="mr-2"
                    />
                    {cls.name} - {cls.section}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Subject Multi-Select */}
          <div className="relative">
            <label className="block mb-1 font-medium">Select Subject(s)</label>
            <div
              className="border rounded px-4 py-2 cursor-pointer flex justify-between items-center"
              onClick={() => setDropdownOpenSubject((prev) => !prev)}
            >
              <span>
                {isAllSelected(selectedSubjects, subjects)
                  ? 'All Subjects Selected'
                  : `${selectedSubjects.length} selected`}
              </span>
              <ChevronDown size={16} />
            </div>
            {dropdownOpenSubject && (
              <div className="absolute bg-white shadow border rounded w-full mt-1 z-10 max-h-60 overflow-y-auto">
                <label className="block px-4 py-2 hover:bg-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isAllSelected(selectedSubjects, subjects)}
                    onChange={() =>
                      toggleSelection('all', selectedSubjects, setSelectedSubjects, subjects)
                    }
                    className="mr-2"
                  />
                  All Subjects
                </label>
                {subjects.map((sub) => (
                  <label
                    key={sub._id}
                    className="block px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(sub._id)}
                      onChange={() =>
                        toggleSelection(sub._id, selectedSubjects, setSelectedSubjects, subjects)
                      }
                      className="mr-2"
                    />
                    {sub.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block mb-1 font-medium">Description</label>
            <textarea
              name="description"
              value={examData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/admin-exams')}
              className="px-4 py-2 border border-gray-400 text-gray-700 rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Update Exam
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default EditExam;
