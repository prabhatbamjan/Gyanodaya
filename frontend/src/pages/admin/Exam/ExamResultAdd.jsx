import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, AlertCircle, Search } from 'lucide-react';
import Layout from '../../../components/layoutes/adminlayout';
import Loader from '../../../components/Loader';
import authAxios, { getUserData } from '../../../utils/auth';

const ExamResultAdd = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const userData = getUserData();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Data states
  const [exam, setExam] = useState(null);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form states
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [resultsData, setResultsData] = useState([]);
  
  // Fetch exam details on component mount
  useEffect(() => {
    const fetchExamData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch exam details
        const response = await authAxios.get(`/exams/${examId}`);
        const examData = response.data.data;
        setExam(examData);
        
        // Extract available classes from exam data
        const availableClasses = examData.classSubjects || [];
        
        // Fetch complete class details
        const classPromises = availableClasses.map(cs => 
          authAxios.get(`/classes/${cs.class._id || cs.class}`)
        );
        
        const classResponses = await Promise.all(classPromises);
        const classesData = classResponses.map(res => res.data.data);
        setClasses(classesData);
        
      } catch (err) {
        console.error("Failed to fetch exam data:", err);
        setError("Failed to load exam data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchExamData();
  }, [examId]);
  
  // When class is selected, update subjects
  useEffect(() => {
    if (selectedClass && exam) {
      // Find subjects for the selected class
      const classSubject = exam.classSubjects.find(cs => 
        (cs.class._id || cs.class) === selectedClass
      );
      
      if (classSubject) {
        // Fetch complete subject details
        const fetchSubjects = async () => {
          try {
            const subjectIds = classSubject.subjects.map(s => s._id || s);
            const promises = subjectIds.map(id => authAxios.get(`/subjects/${id}`));
            const responses = await Promise.all(promises);
            const subjectsData = responses.map(res => res.data.data);
            setSubjects(subjectsData);
          } catch (err) {
            console.error("Failed to fetch subjects:", err);
            setError("Failed to load subjects. Please try again.");
          }
        };
        
        fetchSubjects();
      }
    } else {
      setSubjects([]);
    }
    
    // Reset subject selection when class changes
    setSelectedSubject('');
    setStudents([]);
    setResultsData([]);
  }, [selectedClass, exam]);
  
  // When subject is selected, fetch students
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      fetchStudents();
    }
  }, [selectedClass, selectedSubject]);
  
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/students/class/${selectedClass}`);
      const studentsData = response.data.data || [];
      setStudents(studentsData);
      
      // Initialize results data for all students
      const initialResults = studentsData.map(student => ({
        student: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        rollNumber: student.rollNumber,
        marks: '',
        grade: '',
        status: 'pending',
        remarks: '',
        exam: examId,
        subject: selectedSubject,
        class: selectedClass
      }));
      
      setResultsData(initialResults);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch students:", err);
      setError("Failed to load students. Please try again.");
      setLoading(false);
    }
  };
  
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };
  
  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };
  
  const handleMarksChange = (studentId, marks) => {
    // Validate marks
    const totalMarks = exam?.totalMarks || 100;
    const numericMarks = parseFloat(marks);
    
    if (isNaN(numericMarks) || numericMarks < 0 || numericMarks > totalMarks) {
      return; // Invalid marks
    }
    
    const updatedResults = resultsData.map(result => {
      if (result.student === studentId) {
        // Calculate grade based on marks
        const percentage = (numericMarks / totalMarks) * 100;
        let grade;
        let status;
        
        if (percentage >= 90) grade = 'A+';
        else if (percentage >= 80) grade = 'A';
        else if (percentage >= 70) grade = 'B';
        else if (percentage >= 60) grade = 'C';
        else if (percentage >= 50) grade = 'D';
        else grade = 'F';
        
        status = percentage >= (exam?.passingMarks / totalMarks * 100) ? 'pass' : 'fail';
        
        return { 
          ...result, 
          marks: numericMarks, 
          grade, 
          status,
          percentage
        };
      }
      return result;
    });
    
    setResultsData(updatedResults);
  };
  
  const handleRemarksChange = (studentId, remarks) => {
    const updatedResults = resultsData.map(result => {
      if (result.student === studentId) {
        return { ...result, remarks };
      }
      return result;
    });
    
    setResultsData(updatedResults);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedClass || !selectedSubject) {
      setError("Please select both class and subject");
      return;
    }
    
    if (resultsData.some(result => result.marks === '')) {
      setError("Please enter marks for all students");
      return;
    }
    
    try {
      setSaving(true);
      setError(null);
      
      // Format the data as expected by the API
      const payload = {
        results: resultsData.map(result => ({
          student: result.student,
          marks: result.marks,
          grade: result.grade,
          status: result.status,
          remarks: result.remarks,
          subject: result.subject,
          class: result.class
        }))
      };
      
      const response = await authAxios.post(`/exams/${examId}/results`, payload);
      
      if (response.data.success) {
        setSuccess("Exam results saved successfully!");
        setTimeout(() => {
          navigate('/admin-exams');
        }, 2000);
      } else {
        throw new Error(response.data.message || "Failed to save results");
      }
    } catch (err) {
      console.error("Failed to submit results:", err);
      setError(err.message || "Failed to save exam results. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  
  // Filter students based on search term
  const filteredStudents = resultsData.filter(student => 
    student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toString().includes(searchTerm)
  );
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <Loader />
        </div>
      </Layout>
    );
  }
  
  if (!exam) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="bg-red-100 p-4 rounded-md text-red-700 mb-4">
            <AlertCircle className="inline-block mr-2" size={20} />
            Exam not found or you don't have access to it.
          </div>
          <button 
            onClick={() => navigate('/admin-exams')} 
            className="text-blue-600 flex items-center"
          >
            <ArrowLeft className="mr-2" size={18} /> Back to Exams
          </button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Add Exam Results</h1>
          <button 
            onClick={() => navigate('/admin-exams')} 
            className="text-blue-600 flex items-center"
          >
            <ArrowLeft className="mr-2" size={18} /> Back to Exams
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 p-4 rounded-md text-red-700 mb-4">
            <AlertCircle className="inline-block mr-2" size={20} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 p-4 rounded-md text-green-700 mb-4">
            {success}
          </div>
        )}
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h2 className="text-lg font-medium mb-4">Exam Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-gray-500 text-sm">Exam Name</p>
              <p className="font-medium">{exam.name}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Exam Type</p>
              <p className="font-medium">{exam.type}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Academic Year</p>
              <p className="font-medium">{exam.academicYear}</p>
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
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium mb-4">Enter Results</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={handleClassChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Class</option>
                {classes.map(classItem => (
                  <option key={classItem._id} value={classItem._id}>
                    {classItem.name} {classItem.section && `- ${classItem.section}`}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={handleSubjectChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={!selectedClass}
              >
                <option value="">Select Subject</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedClass && selectedSubject && (
            <>
              <div className="mb-4 flex items-center">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Search student by name or roll number..."
                    className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
                <div className="ml-4 text-gray-600">
                  Showing {filteredStudents.length} of {resultsData.length} students
                </div>
              </div>
              
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
                        Marks Obtained (of {exam.totalMarks})
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
                    {filteredStudents.map(result => (
                      <tr key={result.student}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.rollNumber}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {result.studentName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="number"
                            min="0"
                            max={exam.totalMarks}
                            value={result.marks}
                            onChange={(e) => handleMarksChange(result.student, e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 w-24 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium px-2.5 py-0.5 rounded-full text-sm ${
                            result.grade === 'A+' ? 'bg-green-100 text-green-800' :
                            result.grade === 'A' ? 'bg-green-100 text-green-800' :
                            result.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                            result.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                            result.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                            result.grade === 'F' ? 'bg-red-100 text-red-800' : ''
                          }`}>
                            {result.grade || '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`font-medium px-2.5 py-0.5 rounded-full text-sm ${
                            result.status === 'pass' ? 'bg-green-100 text-green-800' :
                            result.status === 'fail' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {result.status === 'pass' ? 'Pass' : 
                             result.status === 'fail' ? 'Fail' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <input
                            type="text"
                            value={result.remarks}
                            onChange={(e) => handleRemarksChange(result.student, e.target.value)}
                            className="border border-gray-300 rounded-md px-3 py-2 w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Any comments..."
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md flex items-center disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2" size={18} />
                      Save Results
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ExamResultAdd; 