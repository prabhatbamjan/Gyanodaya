import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft,
  AlertCircle,
  Users,
  BookOpen,
  Calendar,
  Award
} from 'lucide-react';
import Layout from '../../components/layoutes/teacherlayout';
import authAxios from '../../utils/auth';
import { getUserData } from '../../utils/auth';
import Loader from '../../components/Loader';

const TeacherResultForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const userData = getUserData();

  const [formData, setFormData] = useState({
    student: '',
    class: '',
    subject: '',
    academicYear: '',
    term: '',
    examType: '',
    marksObtained: '',
    totalMarks: 100,
    remarks: '',
    status: 'Draft'
  });

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [grade, setGrade] = useState('');
  const [percentage, setPercentage] = useState(0);
  const [selectedClassName, setSelectedClassName] = useState('');
  const [selectedSubjectName, setSelectedSubjectName] = useState('');

  // Get current year for academic year options
  const currentYear = new Date().getFullYear();
  const academicYears = [
    `${currentYear-1}-${currentYear}`,
    `${currentYear}-${currentYear+1}`,
    `${currentYear+1}-${currentYear+2}`
  ];

  useEffect(() => {
    if (isEditMode) {
      fetchResultDetails();
    }
    fetchClassesAndSubjects();
  }, [id]);

  useEffect(() => {
    if (formData.class) {
      fetchStudents();
      // Find the class name for display
      const selectedClass = classes.find(c => c._id === formData.class);
      setSelectedClassName(selectedClass ? selectedClass.name : '');
    }
  }, [formData.class, classes]);

  useEffect(() => {
    if (formData.subject) {
      // Find the subject name for display
      const selectedSubject = subjects.find(s => s._id === formData.subject);
      setSelectedSubjectName(selectedSubject ? selectedSubject.name : '');
    }
  }, [formData.subject, subjects]);

  useEffect(() => {
    // Calculate percentage and grade whenever marks change
    if (formData.marksObtained && formData.totalMarks) {
      const calculatedPercentage = (parseFloat(formData.marksObtained) / parseFloat(formData.totalMarks)) * 100;
      setPercentage(calculatedPercentage);
      
      // Determine grade based on percentage
      let calculatedGrade;
      if (calculatedPercentage >= 90) {
        calculatedGrade = 'A+';
      } else if (calculatedPercentage >= 80) {
        calculatedGrade = 'A';
      } else if (calculatedPercentage >= 75) {
        calculatedGrade = 'B+';
      } else if (calculatedPercentage >= 70) {
        calculatedGrade = 'B';
      } else if (calculatedPercentage >= 65) {
        calculatedGrade = 'C+';
      } else if (calculatedPercentage >= 60) {
        calculatedGrade = 'C';
      } else if (calculatedPercentage >= 50) {
        calculatedGrade = 'D';
      } else {
        calculatedGrade = 'F';
      }
      
      setGrade(calculatedGrade);
    } else {
      setPercentage(0);
      setGrade('');
    }
  }, [formData.marksObtained, formData.totalMarks]);

  const fetchClassesAndSubjects = async () => {
    try {
      setLoading(true);
      // Fetch classes assigned to the teacher
      const teacherId = userData.id;
      
      // Fetch classes assigned to the teacher
      const classesResponse = await authAxios.get(`/teachers/${teacherId}`);
      if (classesResponse.data.success) {
        const classIds = classesResponse.data.data.class || [];
        const classesData = await authAxios.get('/classes');
        
        // Filter classes assigned to the teacher
        const teacherClasses = classesData.data.data.filter(
          cls => classIds.includes(cls._id)
        );
        
        setClasses(teacherClasses);
      }
      
      // Fetch subjects taught by the teacher
      const subjectsResponse = await authAxios.get('/subjects/teacher');
      if (subjectsResponse.data.success) {
        setSubjects(subjectsResponse.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err);
      setServerError('Failed to load classes and subjects. Please try again.');
    } finally {
      if (!isEditMode) {
        setLoading(false);
      }
    }
  };

  const fetchStudents = async () => {
    if (!formData.class) return;
    
    try {
      const response = await authAxios.get(`/classes/${formData.class}`);
      if (response.data.success) {
        setStudents(response.data.data.students || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
    }
  };

  const fetchResultDetails = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/results/${id}`);
      
      if (response.data.success) {
        const result = response.data.data.result;
        
        setFormData({
          student: result.student?._id || '',
          class: result.class?._id || '',
          subject: result.subject?._id || '',
          academicYear: result.academicYear || '',
          term: result.term || '',
          examType: result.examType || '',
          marksObtained: result.marksObtained || '',
          totalMarks: result.totalMarks || 100,
          remarks: result.remarks || '',
          status: result.status || 'Draft'
        });
        
        setGrade(result.grade || '');
        setPercentage(result.percentage || 0);
      } else {
        setServerError('Failed to load result details');
      }
    } catch (err) {
      console.error('Error fetching result details:', err);
      setServerError('Failed to load result details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.student) newErrors.student = 'Student is required';
    if (!formData.class) newErrors.class = 'Class is required';
    if (!formData.subject) newErrors.subject = 'Subject is required';
    if (!formData.academicYear) newErrors.academicYear = 'Academic year is required';
    if (!formData.term) newErrors.term = 'Term is required';
    if (!formData.examType) newErrors.examType = 'Exam type is required';
    
    if (!formData.marksObtained) {
      newErrors.marksObtained = 'Marks obtained is required';
    } else if (isNaN(parseFloat(formData.marksObtained)) || parseFloat(formData.marksObtained) < 0) {
      newErrors.marksObtained = 'Marks must be a positive number';
    } else if (parseFloat(formData.marksObtained) > parseFloat(formData.totalMarks)) {
      newErrors.marksObtained = 'Marks cannot exceed total marks';
    }
    
    if (!formData.totalMarks) {
      newErrors.totalMarks = 'Total marks is required';
    } else if (isNaN(parseFloat(formData.totalMarks)) || parseFloat(formData.totalMarks) <= 0) {
      newErrors.totalMarks = 'Total marks must be a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e, submitStatus = formData.status) => {
    e.preventDefault();
    
    // Set draft status based on button clicked
    const dataToSubmit = { ...formData, status: submitStatus };
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setServerError('');

      const teacherId = userData.id;
      dataToSubmit.teacher = teacherId;
      
      if (isEditMode) {
        await authAxios.put(`/results/${id}`, dataToSubmit);
      } else {
        await authAxios.post('/results', dataToSubmit);
      }

      // Redirect to results page
      navigate('/teacher-results');
    } catch (err) {
      console.error('Failed to save result:', err);
      setServerError(err.response?.data?.message || 'Failed to save result. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A+': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-green-100 text-green-800';
      case 'B+': return 'bg-blue-100 text-blue-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C+': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => navigate('/teacher-results')}
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Results
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Result' : 'Add New Result'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {isEditMode ? 'Update student result details' : 'Record a new student result'}
          </p>
        </div>

        {serverError && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-600">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              {serverError}
            </div>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, formData.status === 'Draft' ? 'Submitted' : formData.status)}>
          <div className="space-y-8">
            {/* Class and Subject Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Class & Subject</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="class"
                      value={formData.class}
                      onChange={handleInputChange}
                      disabled={isEditMode}
                      className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                        errors.class ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isEditMode ? 'bg-gray-100' : ''
                      }`}
                    >
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls._id} value={cls._id}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.class && (
                    <p className="mt-1 text-sm text-red-600">{errors.class}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      disabled={isEditMode}
                      className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                        errors.subject ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        isEditMode ? 'bg-gray-100' : ''
                      }`}
                    >
                      <option value="">Select Subject</option>
                      {subjects.map(subject => (
                        <option key={subject._id} value={subject._id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Student Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Student Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Student <span className="text-red-500">*</span>
                </label>
                <select
                  name="student"
                  value={formData.student}
                  onChange={handleInputChange}
                  disabled={isEditMode || !formData.class}
                  className={`block w-full rounded-md border ${
                    errors.student ? 'border-red-500' : 'border-gray-300'
                  } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    isEditMode ? 'bg-gray-100' : ''
                  } ${!formData.class ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Select Student</option>
                  {students.map(student => (
                    <option key={student._id} value={student._id}>
                      {student.firstName} {student.lastName}
                    </option>
                  ))}
                </select>
                {errors.student && (
                  <p className="mt-1 text-sm text-red-600">{errors.student}</p>
                )}
                {!formData.class && !errors.student && (
                  <p className="mt-1 text-sm text-gray-500">Please select a class first</p>
                )}
              </div>
            </div>

            {/* Exam Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Exam Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Academic Year <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      name="academicYear"
                      value={formData.academicYear}
                      onChange={handleInputChange}
                      className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                        errors.academicYear ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                    >
                      <option value="">Select Academic Year</option>
                      {academicYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                  {errors.academicYear && (
                    <p className="mt-1 text-sm text-red-600">{errors.academicYear}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Term <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="term"
                    value={formData.term}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md border ${
                      errors.term ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Select Term</option>
                    <option value="First Term">First Term</option>
                    <option value="Second Term">Second Term</option>
                    <option value="Final Term">Final Term</option>
                  </select>
                  {errors.term && (
                    <p className="mt-1 text-sm text-red-600">{errors.term}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="examType"
                    value={formData.examType}
                    onChange={handleInputChange}
                    className={`block w-full rounded-md border ${
                      errors.examType ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  >
                    <option value="">Select Exam Type</option>
                    <option value="Midterm">Midterm</option>
                    <option value="Final">Final</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Project">Project</option>
                    <option value="Quiz">Quiz</option>
                  </select>
                  {errors.examType && (
                    <p className="mt-1 text-sm text-red-600">{errors.examType}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Marks and Grade */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Marks & Grading</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marks Obtained <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="marksObtained"
                    value={formData.marksObtained}
                    onChange={handleInputChange}
                    min="0"
                    step="0.5"
                    className={`block w-full rounded-md border ${
                      errors.marksObtained ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.marksObtained && (
                    <p className="mt-1 text-sm text-red-600">{errors.marksObtained}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Marks <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalMarks"
                    value={formData.totalMarks}
                    onChange={handleInputChange}
                    min="1"
                    className={`block w-full rounded-md border ${
                      errors.totalMarks ? 'border-red-500' : 'border-gray-300'
                    } px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  />
                  {errors.totalMarks && (
                    <p className="mt-1 text-sm text-red-600">{errors.totalMarks}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Calculated Grade
                  </label>
                  <div className="h-[42px] flex items-center">
                    {grade ? (
                      <div className="flex items-center">
                        <Award className="h-5 w-5 text-blue-500 mr-2" />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade)}`}>
                          {grade} ({percentage.toFixed(2)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Enter marks to calculate grade</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows="3"
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Optional comments or feedback for the student"
                ></textarea>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
              <div>
                <span className="text-sm text-gray-500">Status: </span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                  formData.status === 'Draft' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : formData.status === 'Submitted' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {formData.status}
                </span>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/teacher-results')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                
                {formData.status === 'Draft' && (
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'Draft')}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={submitting}
                  >
                    Save as Draft
                  </button>
                )}
                
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={submitting}
                >
                  <Save className="h-4 w-4 inline mr-1" />
                  {formData.status === 'Draft' ? 'Submit Result' : 'Update Result'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default TeacherResultForm; 