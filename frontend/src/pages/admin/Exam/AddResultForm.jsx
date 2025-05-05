import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';
import Layout from '../../../components/layoutes/adminlayout';
import Loader from '../../../components/Loader';
import authAxios, { getUserData } from '../../../utils/auth';

const AddResultForm = () => {
  const navigate = useNavigate();
  const userData = getUserData();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacherTimetables, setTeacherTimetables] = useState([]);
  
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;
  
  const [formData, setFormData] = useState({
    class: '',
    subject: '',
    exam: '',
    academicYear: academicYear,
    results: []
  });
  
  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        
        // // Fetch classes and teacher timetables
        // const [classesRes, teacherRes] = await Promise.all([
        //   authAxios.get('/classes/'),
        //   authAxios.get(`/timetables/teacher/class/${userData.id}`)
        // ]);
        
        // const allClasses = classesRes.data.data || [];
        // const teacherData = teacherRes.data.data || [];
        
        // setTeacherTimetables(teacherData);
        
        // Filter classes assigned to the teacher
        const classIds = new Set();
        teacherData.forEach(timetable => {
          if (timetable.class?._id) classIds.add(timetable.class._id);
        });
        
        const filteredClasses = allClasses.filter(cls => classIds.has(cls._id));
        setClasses(filteredClasses);
        
        // Fetch available exams
        const examsRes = await authAxios.get('/exams/teacher');
        const examsData = examsRes.data.data || [];
        setExams(examsData.filter(exam => exam.status !== 'Cancelled'));
        console.loge(examsRes.data.data)
        
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Failed to load classes and exams data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);
  
  // Update subjects when class changes
  useEffect(() => {
    if (formData.class) {
      updateSubjectsForClass(formData.class);
      updateExamsForClass(formData.class);
    }
  }, [formData.class, teacherTimetables]);
  
  // Fetch students when class and subject are selected
  useEffect(() => {
    if (formData.class && formData.subject && formData.exam) {
      fetchStudentsForClass(formData.class);
    }
  }, [formData.class, formData.subject, formData.exam]);
  
  const updateSubjectsForClass = (classId) => {
    // Get subjects for this class from teacher's timetable
    const classSubjects = teacherTimetables
      .filter(t => t.class?._id === classId)
      .flatMap(t => t.periods || [])
      .map(p => p.subject)
      .filter((subj, index, self) => 
        subj && self.findIndex(s => s?._id === subj?._id) === index
      );
    
    setSubjects(classSubjects);
    
    // Reset subject and results
    setFormData(prev => ({
      ...prev,
      subject: '',
      exam: '',
      results: []
    }));
  };
  
  const updateExamsForClass = (classId) => {
    // Filter exams for this class
    const filteredExams = exams.filter(exam => 
      exam.classSubjects.some(cs => 
        (cs.class._id || cs.class) === classId
      )
    );
    setExams(filteredExams);
  };
  
  const fetchStudentsForClass = async (classId) => {
    try {
      setLoading(true);
      
      const studentsRes = await authAxios.get(`/students/class/${classId}`);
      const studentsData = studentsRes.data.data || [];
      setStudents(studentsData);
      
      // Initialize results array with student data
      setFormData(prev => ({
        ...prev,
        results: studentsData.map(student => ({
          student: student._id,
          marks: '',
          grade: '',
          status: 'pending',
          remarks: '',
          firstName: student.firstName,
          lastName: student.lastName,
          rollNumber: student.rollNumber
        }))
      }));
      
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    } finally {
      setLoading(false);
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleMarksChange = (studentId, marks) => {
    const selectedExam = exams.find(e => e._id === formData.exam);
    const totalMarks = selectedExam?.totalMarks || 100;
    const passingMarks = selectedExam?.passingMarks || 40;
    
    // Validate marks
    const numericMarks = parseFloat(marks);
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > totalMarks) {
      return; // Invalid marks
    }
    
    // Calculate grade and status
    const percentage = (numericMarks / totalMarks) * 100;
    let grade;
    let status;
    
    if (percentage >= 90) grade = 'A+';
    else if (percentage >= 80) grade = 'A';
    else if (percentage >= 70) grade = 'B';
    else if (percentage >= 60) grade = 'C';
    else if (percentage >= 50) grade = 'D';
    else grade = 'F';
    
    status = percentage >= (passingMarks / totalMarks * 100) ? 'pass' : 'fail';
    
    // Update student result
    setFormData(prev => ({
      ...prev,
      results: prev.results.map(result =>
        result.student === studentId
          ? { ...result, marks: numericMarks, grade, status, percentage }
          : result
      )
    }));
  };
  
  const handleRemarksChange = (studentId, remarks) => {
    setFormData(prev => ({
      ...prev,
      results: prev.results.map(result =>
        result.student === studentId
          ? { ...result, remarks }
          : result
      )
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.class || !formData.subject || !formData.exam) {
      setError('Please select class, subject, and exam');
      return;
    }
    
    if (formData.results.some(r => r.marks === '')) {
      setError('Please enter marks for all students');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare payload
      const payload = {
        results: formData.results.map(result => ({
          student: result.student,
          marks: result.marks,
          grade: result.grade,
          status: result.status,
          remarks: result.remarks,
          subject: formData.subject,
          class: formData.class
        }))
      };
      
      // Submit results
      const response = await authAxios.post(`/exams/${formData.exam}/results`, payload);
      
      if (response.data.success) {
        setSuccess('Results saved successfully!');
        setTimeout(() => {
          navigate('/admin-exams');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to save results');
      }
    } catch (err) {
      console.error('Error submitting results:', err);
      setError(err.message || 'Failed to save results. Please try again.');
    } finally {
      setSaving(false);
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
  
  const selectedExam = exams.find(e => e._id === formData.exam);
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => navigate('/admin-exams')} className="text-blue-600 mb-4 flex items-center">
          <ArrowLeft className="mr-2" size={18} />
          Back to Exams
        </button>
        
        <h1 className="text-2xl font-semibold mb-6">Add Exam Results</h1>
        
        {error && (
          <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 p-4 rounded-md text-green-700 mb-6">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Class selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select 
                name="class"
                value={formData.class}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name}{cls.section ? ` - ${cls.section}` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Subject selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select 
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!formData.class}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Exam selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam
              </label>
              <select 
                name="exam"
                value={formData.exam}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={!formData.subject}
              >
                <option value="">Select Exam</option>
                {exams.filter(exam => 
                  exam.classSubjects.some(cs => 
                    (cs.class._id || cs.class) === formData.class && 
                    cs.subjects.some(s => 
                      (s._id || s) === formData.subject
                    )
                  )
                ).map(exam => (
                  <option key={exam._id} value={exam._id}>
                    {exam.name} ({exam.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Exam details if exam is selected */}
          {selectedExam && (
            <div className="mb-6 p-4 bg-gray-50 rounded-md">
              <h3 className="text-md font-medium text-gray-700 mb-2">Exam Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Marks:</span> {selectedExam.totalMarks}
                </div>
                <div>
                  <span className="text-gray-500">Passing Marks:</span> {selectedExam.passingMarks}
                </div>
                <div>
                  <span className="text-gray-500">Start Date:</span> {new Date(selectedExam.startDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-gray-500">End Date:</span> {new Date(selectedExam.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
          
          {/* Students results table */}
          {formData.class && formData.subject && formData.exam && formData.results.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.results.map((result) => (
                    <tr key={result.student}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {result.rollNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {result.firstName} {result.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="number"
                          min="0"
                          max={selectedExam?.totalMarks}
                          value={result.marks}
                          onChange={(e) => handleMarksChange(result.student, e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-1 w-20 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                        <span className="ml-1 text-xs text-gray-500">/ {selectedExam?.totalMarks}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.grade === 'A+' ? 'bg-green-100 text-green-800' :
                          result.grade === 'A' ? 'bg-green-100 text-green-800' :
                          result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                          result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                          result.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                          result.grade === 'F' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.grade || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          result.status === 'pass' ? 'bg-green-100 text-green-800' :
                          result.status === 'fail' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {result.status === 'pass' ? 'Pass' :
                           result.status === 'fail' ? 'Fail' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="text"
                          value={result.remarks || ''}
                          onChange={(e) => handleRemarksChange(result.student, e.target.value)}
                          className="border border-gray-300 rounded-md px-3 py-1 w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Any comments..."
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Submit button */}
          {formData.results.length > 0 && (
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Results
                  </>
                )}
              </button>
            </div>
          )}
        </form>
      </div>
    </Layout>
  );
};

export default AddResultForm; 