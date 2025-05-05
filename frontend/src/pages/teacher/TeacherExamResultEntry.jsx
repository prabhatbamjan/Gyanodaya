import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, CheckCircle, ChevronDown } from 'lucide-react';
import Layout from '../../components/layoutes/teacherlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';
import { getUserData } from '../../utils/auth';
const TeacherExamResultEntry = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Data states
  const [exam, setExam] = useState(null);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassIndex, setSelectedClassIndex] = useState(0);
  const userData = getUserData();

  
  // Fetch exam details and students on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch exam details
        const examResponse = await authAxios.get(`/exams/${examId}`);
        if (!examResponse.data.success) {
          throw new Error('Failed to fetch exam details');
        }
        
        const examData = examResponse.data.data;
        setExam(examData);
        
        // Check if exam can have results added
        if (['Upcoming', 'Cancelled'].includes(examData.status)) {
          setError(`Cannot add results for ${examData.status.toLowerCase()} exams`);
          setLoading(false);
          return;
        }
        
        // If exam has class subjects, use the first one to fetch students
        if (!examData.classSubjects || examData.classSubjects.length === 0) {
          throw new Error('No class found for this exam');
        }
        const classres=await authAxios.get(`/classes/`);
   
        
        loadClassData(examData, selectedClassIndex);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message || 'Failed to load data');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [examId]);

  // Load data for the selected class
  const loadClassData = async (examData, classIndex) => {
    try {
      const classInfo = examData.classSubjects[classIndex].class;
      if (!classInfo || !classInfo._id) {
        throw new Error('Class information is missing');
      }
      
      // Fetch students for the class
      const studentsResponse = await authAxios.get(`/students/class/${classInfo._id}`);
      if (!studentsResponse.data.success && !studentsResponse.data.data) {
        throw new Error('Failed to fetch students');
      }
      
      const studentsData = studentsResponse.data.data || [];
      setStudents(studentsData);
      
      // Get subjects from the selected class's subjects
      const subjects = examData.classSubjects[classIndex].subjects;
      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        throw new Error('No subjects found for this exam');
      }
      
      // Initialize results array with student data and empty marks
      const initialResults = studentsData.map(student => ({
        student: student._id,
        subjectResults: subjects.map(subject => ({
          subject: subject._id || subject,
          marksObtained: '',
          remarks: ''
        })),
        studentName: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber
      }));
      
      setResults(initialResults);
      setLoading(false);
    } catch (err) {
      console.error('Error loading class data:', err);
      setError(err.message || 'Failed to load class data');
      setLoading(false);
    }
  };

  // Handle class selection change
  const handleClassChange = (e) => {
    const newClassIndex = parseInt(e.target.value);
    setSelectedClassIndex(newClassIndex);
    setLoading(true);
    setError(null);
    
    if (exam) {
      loadClassData(exam, newClassIndex);
    }
  };
  
  const handleMarksChange = (studentIndex, subjectIndex, value) => {
    if (!exam) return;
    
    // Validate marks
    const totalMarks = exam.totalMarks;
    const numericMarks = parseFloat(value);
    
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > totalMarks) {
      return; // Invalid marks
    }
    
    const newResults = [...results];
    newResults[studentIndex].subjectResults[subjectIndex].marksObtained = numericMarks;
    setResults(newResults);
  };
  
  const handleRemarksChange = (studentIndex, subjectIndex, value) => {
    const newResults = [...results];
    newResults[studentIndex].subjectResults[subjectIndex].remarks = value;
    setResults(newResults);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!exam) {
      setError('Exam data not available');
      return;
    }
    
    // Validate form - check if any marks are missing
    const invalid = results.some(result =>
      result.subjectResults.some(sr =>
        sr.marksObtained === '' ||
        sr.marksObtained < 0 ||
        sr.marksObtained > exam.totalMarks
      )
    );
    
    if (invalid) {
      setError('Please enter valid marks for all students');
      return;
    }
    
    try {
      setSaving(true);
      
      // Prepare the data with all required fields based on schema
      const formattedResults = results.map(result => {
        // Calculate total marks for this student
        const totalMarksObtained = result.subjectResults.reduce(
          (total, subject) => total + Number(subject.marksObtained), 0
        );
        
        // Calculate overall percentage
        const totalPossibleMarks = exam.totalMarks * result.subjectResults.length;
        const percentage = (totalMarksObtained / totalPossibleMarks) * 100;
        
        // Determine overall pass/fail status
        const overallStatus = percentage >= (exam.passingMarks / exam.totalMarks * 100) ? 'Pass' : 'Fail';
        
        // Format each subject result with required fields
        const formattedSubjectResults = result.subjectResults.map(sr => {
          // Calculate subject percentage
          const subjectPercentage = (Number(sr.marksObtained) / exam.totalMarks) * 100;
          
          // Determine subject pass/fail status
          const status = subjectPercentage >= (exam.passingMarks / exam.totalMarks * 100) ? 'Pass' : 'Fail';
          
          // Calculate grade based on percentage
          let grade;
          if (subjectPercentage >= 90) grade = 'A+';
          else if (subjectPercentage >= 80) grade = 'A';
          else if (subjectPercentage >= 70) grade = 'B+';
          else if (subjectPercentage >= 60) grade = 'B';
          else if (subjectPercentage >= 50) grade = 'C+';
          else if (subjectPercentage >= 40) grade = 'C';
          else grade = 'F';
          
          return {
            subject: sr.subject,
            marksObtained: Number(sr.marksObtained),
            remarks: sr.remarks || '',
            grade,
            status
          };
        });
        
        // Get the class ID from the exam for the currently selected class
        const classId = exam.classSubjects[selectedClassIndex].class._id || exam.classSubjects[selectedClassIndex].class;
        
        // Calculate overall grade
        let overallGrade;
        if (percentage >= 90) overallGrade = 'A+';
        else if (percentage >= 80) overallGrade = 'A';
        else if (percentage >= 70) overallGrade = 'B+';
        else if (percentage >= 60) overallGrade = 'B';
        else if (percentage >= 50) overallGrade = 'C+';
        else if (percentage >= 40) overallGrade = 'C';
        else overallGrade = 'F';
        
        // Return the complete student result object
        return {
          student: result.student,
          class: classId,
          subjectResults: formattedSubjectResults,
          totalMarksObtained,
          percentage,
          grade: overallGrade,
          status: overallStatus,
          remarks: '', // Optional overall remarks
        };
      });
      
      // Submit the properly formatted results to API
      const response = await authAxios.post(`/exams/${examId}/results`, { results: formattedResults });
      
      if (response.data.success) {
        setSuccess('Results submitted successfully!');
        // Navigate back after a delay
        setTimeout(() => {
          navigate('/teacher-exams');
        }, 2000);
      } else {
        throw new Error(response.data.message || 'Failed to submit results');
      }
    } catch (err) {
      console.error('Error submitting results:', err);
      setError(err.response?.data?.message || err.message || 'Failed to submit results. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  // Filter students based on search term
  const filteredResults = searchTerm.trim() ? 
    results.filter(result => 
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      result.rollNumber.toString().includes(searchTerm)
    ) : results;
  
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
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/teacher-exams')} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">
            Add Results: {exam?.name}
          </h1>
        </div>
        
        {error && (
          <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6 flex items-center">
            <AlertCircle className="mr-2" size={20} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 p-4 rounded-md text-green-700 mb-6 flex items-center">
            <CheckCircle className="mr-2" size={20} />
            {success}
          </div>
        )}
        
        {/* Exam details */}
        {exam && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-6">
            <h2 className="text-lg font-medium mb-4">Exam Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-gray-500 text-sm">Exam Type</p>
                <p className="font-medium">{exam.type}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Academic Year</p>
                <p className="font-medium">{exam.academicYear}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Class</p>
                <p className="font-medium">
                  {exam.classSubjects && exam.classSubjects[0]?.class?.name ? exam.classSubjects[0].class.name : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total Marks</p>
                <p className="font-medium">{exam.totalMarks}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Passing Marks</p>
                <p className="font-medium">{exam.passingMarks}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Date</p>
                <p className="font-medium">
                  {new Date(exam.startDate).toLocaleDateString()} to {new Date(exam.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Class Selector */}
        {exam && exam.classSubjects && exam.classSubjects.length > 1 && (
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-medium text-blue-700">Multiple Classes Available</h3>
                <p className="text-sm text-blue-600">You can enter results for each class separately</p>
              </div>
              <div className="w-full md:w-64">
                <label htmlFor="class-select" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Class
                </label>
                <div className="relative">
                  <select
                    id="class-select"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                    onChange={handleClassChange}
                    value={selectedClassIndex}
                  >
                    {exam.classSubjects.map((classSubject, index) => (
                      <option key={index} value={index}>
                        {classSubject.class.name || `Class ${index + 1}`}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Search bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by student name or roll number"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-96 p-2 border border-gray-300 rounded-md"
          />
        </div>
        
        {/* Results form */}
        {students.length > 0 ? (
          <form onSubmit={handleSubmit}>
            {filteredResults.map((result, studentIndex) => (
              <div key={result.student} className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h3 className="text-lg font-semibold mb-4">
                  {result.studentName} (Roll: {result.rollNumber})
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="py-2 px-4 text-left">Subject</th>
                        <th className="py-2 px-4 text-left">Marks (Max: {exam?.totalMarks})</th>
                        <th className="py-2 px-4 text-left">Remarks (Optional)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.subjectResults.map((subjectResult, subjectIndex) => {
                        // Find subject name from exam
                        const subjectObj = exam.classSubjects[0].subjects.find(
                          s => (s._id || s) === subjectResult.subject
                        );
                        const subjectName = subjectObj?.name || 'Subject';
                        
                        return (
                          <tr key={subjectResult.subject} className="border-t">
                            <td className="py-3 px-4">{subjectName}</td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                min={0}
                                max={exam.totalMarks}
                                value={subjectResult.marksObtained}
                                onChange={(e) => handleMarksChange(studentIndex, subjectIndex, e.target.value)}
                                className="border border-gray-300 rounded p-2 w-24"
                                required
                              />
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="text"
                                value={subjectResult.remarks || ''}
                                onChange={(e) => handleRemarksChange(studentIndex, subjectIndex, e.target.value)}
                                className="border border-gray-300 rounded p-2 w-full"
                                placeholder="Any comments..."
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            
            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => navigate('/teacher-exams')}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md mr-4 hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
              >
                {saving ? (
                  <>
                    <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Submit Results
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500">No students found for this exam.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeacherExamResultEntry; 