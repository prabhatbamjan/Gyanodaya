import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';

function AddClass() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    section: '',
    roomNumber: '',
    fee: '',
    subjects: [],
   
    academicYear: '', // Added academic year
  });

  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await authAxios.get('subjects/');
        console.log(res.data.data);
        setSubjects(res.data.data);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        setError(error.response?.data?.message);
      }
    };

    fetchSubjects();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "fee") {
      if (/[^0-9]/.test(value)) {
        return; // Ignore any non-numeric input
      }
    }
    if (name === "academicYear") {
      if (/[^0-9]/.test(value)) {
        return; // Ignore any non-numeric input
      }
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubjectToggle = (subjectId) => {
    setFormData(prev => {
      const isSelected = prev.subjects.some(sub => sub._id === subjectId);
      if (isSelected) {
        return {
          ...prev,
          subjects: prev.subjects.filter(sub => sub._id !== subjectId)
        };
      } else {
        const subjectToAdd = subjects.find(sub => sub._id === subjectId);
        return {
          ...prev,
          subjects: [...prev.subjects, subjectToAdd]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    

    const { name, grade, section, subjects, academicYear, fee, roomNumber } = formData;

    if (!name || !grade || !section || !academicYear || !fee || !roomNumber || !subjects) {
      setError('Please fill all required fields.');
      setIsLoading(false);
      return;
    }
    if (subjects.length < 7 || subjects.length > 9) {
      setError('You must select between 7 and 9 subjects');
      setIsLoading(false);
      return;
    }
    if(name !== grade){
      setError('Class name must be equal to grade');
      setIsLoading(false);
      return;
    }
    if (parseFloat(formData.fee) < 0) {
      setError("Fee cannot be negative");
      setIsLoading(false);
      return;
    }
    const currentYear= new Date().getFullYear();
    console.log(currentYear)
    if(parseInt(academicYear) !== currentYear){
      setError('Academic year must be equal to current year');
      setIsLoading(false);
      return;
    }

    try {
      const dataToSend = {
        name,
        grade,
        section,
        academicYear,
        fee,
        roomNumber,
        subjects: subjects.map(sub => sub._id),
      };

      const response = await authAxios.post('classes/', dataToSend);
      console.log('Class created:', response.data);
      alert('Class created successfully');
      navigate('/admin-classes');
    } catch (err) {
      
      console.error('Error creating class:', err);
      setError(err.response?.data?.message);;
    } finally {
      setIsLoading(false);
    }
  };
;


  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <Link to="/admin-classes" className="flex items-center text-blue-600 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Classes
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Add Class</h1>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Name <span className="text-red-500">*</span>
              </label>
              <select
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Class </option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade <span className="text-red-500">*</span>
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Select Grade</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

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
                <option value="">Select Room Number</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Academic Year <span className="text-red-500">*</span>
  </label>
  <select
  name="academicYear"
  value={formData.academicYear}
  onChange={handleInputChange}
  className="w-full border rounded px-3 py-2"
  required
>
  <option value="">Select Year</option>
  {Array.from({ length: 10 }, (_, i) => 2024 + i).map((year) => (
    <option key={year} value={year}>
      {year}
    </option>
  ))}
</select>
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
                placeholder="e.g. 1000"
                min="100"
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>
          
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subjects</label>
            <div className="flex flex-wrap gap-2 mb-4">
              {subjects.map(subject => {
                const isSelected = formData.subjects.some(sub => sub._id === subject._id);
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
                    {isSelected && (
                      <X size={14} className="text-blue-500 hover:text-blue-700" />
                    )}
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
              {isLoading ? 'Saving...' : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddClass;
