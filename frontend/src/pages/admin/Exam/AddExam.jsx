import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import authAxios from '../../../utils/auth';
import Layout from '../../../components/layoutes/adminlayout';
import { Link, useNavigate } from 'react-router-dom';

function AddExam() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
        // Add loading state
        setClasses([]);
        setSubjects([]);
        
        // Use explicit API endpoints with /api prefix
        const resClasses = await authAxios.get('classes');
        const resSubjects = await authAxios.get('subjects');
        
        console.log('Classes response:', resClasses.data);
        console.log('Subjects response:', resSubjects.data);
        
        // Make sure we access the correct data structure
        const classesData = resClasses.data.data || [];
        const subjectsData = resSubjects.data.data || [];
        
        if(classesData.length === 0) {
          console.warn('No classes found in response');
        }
        
        if(subjectsData.length === 0) {
          console.warn('No subjects found in response');
        }
        
        setClasses(classesData);
        setSubjects(subjectsData);
      } catch (error) {
        console.error('Error fetching classes or subjects:', error);
        alert('Failed to load classes or subjects: ' + (error.response?.data?.message || 'Unknown error'));
      }
    };
    fetchData();
  }, []);

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (selectedClassIds.length === 0 || selectedSubjects.length === 0) {
      alert('Please select at least one class and subject');
      return;
    }
    
    const payload = {
      ...formData,
      class: selectedClassIds,
      subjects: selectedSubjects,
    };

    try {
      console.log('Sending exam payload:', payload);
      const response = await authAxios.post('exams', payload);
      console.log('Create exam response:', response.data);
      alert('Exam created successfully');
      navigate('/admin-exams');
    } catch (error) {
      console.error('Error creating exam:', error);
      alert('Failed to create exam: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto">
        <Link to="/admin-exams" className="text-blue-600 mb-4 block">
          ← Back
        </Link>
        <h1 className="text-2xl font-bold mb-6">Add Exam</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium">Exam Name</label>
              <input
                name="name"
                placeholder="Exam Name"
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

            <div>
              <label className="block mb-1 font-medium">Duration (min)</label>
              <input
                type="number"
                name="duration"
                placeholder="Duration"
                value={formData.duration}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Total Marks</label>
              <input
                type="number"
                name="totalMarks"
                placeholder="Total Marks"
                value={formData.totalMarks}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Passing Marks</label>
              <input
                type="number"
                name="passingMarks"
                placeholder="Passing Marks"
                value={formData.passingMarks}
                onChange={handleChange}
                className="border p-2 rounded w-full"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Academic Year</label>
              <input
                type="text"
                name="academicYear"
                placeholder="Academic Year"
                value={formData.academicYear}
                onChange={handleChange}
                className="border p-2 rounded w-full"
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
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full border rounded p-2"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Create Exam
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default AddExam;
