import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import Layout from '../../components/layoutes/teacherlayout';
import authAxios from '../../utils/auth';
import { getUserData } from '../../utils/auth';
const ExamResults = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const userData = getUserData();
  const fetchExams = async () => {
    try {
      setLoading(true);
  
      // Get all exams relevant to the teacher
      const response = await authAxios.get('/exams/teacher');
      const examsData = response.data?.data || [];
  
      // Get all timetables for this teacher
      const timetableRes = await authAxios.get(`timetables/teacher/${userData.id}`);
      const timetables = timetableRes.data?.data || [];
  
      // Extract unique class IDs from the teacher's timetable
      const classIds = [...new Set(timetables.map(t => t.class._id))];
  
      // Get all classes to use full class info if needed (not strictly required here)
      const classesRes = await authAxios.get('classes');
      const allClasses = classesRes.data?.data || [];
      console.log("All classes:", allClasses);
  
      // Filter only the classes assigned to this teacher
      const filteredClasses = allClasses.filter(cls => classIds.includes(cls._id));
      const teacherClassIds = filteredClasses.map(cls => cls._id);
      console.log("Teacher classes:", teacherClassIds); 
  
      // Validate and filter exams
      const validExams = examsData.filter(exam => {
        const isValid = exam && exam._id && exam.name && exam.type && Array.isArray(exam.classSubjects);
        if (!isValid) {
          console.warn('Found invalid exam object:', exam);
        }
        return isValid;
      });
  
      // Now filter exams that include any of the teacher's classes
      const filteredExams = validExams.filter(exam =>
        exam.classSubjects.some(cs => teacherClassIds.includes(cs.class?._id))
      );
  
      console.log('Filtered exams for teacher:', filteredExams);
      setExams(filteredExams);
  
    } catch (error) {
      console.error('Error fetching exams:', error);
      alert('Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchExams();
  }, []);
  ;
  

  useEffect(() => {
    fetchExams();
  }, []);

  const handleExamSelect = (examId) => {
    // Navigate to the dedicated page for entering results
    navigate(`/teacher-exams/${examId}/results`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Ongoing': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-purple-100 text-purple-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto">
        <Link to="/teacher-exams/add" className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300">
          Add Result
        </Link>
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-2xl font-bold">Enter Exam Results</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100 text-gray-600">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Type</th>
                <th className="p-3 text-left">Class</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
                {exams.length > 0 ? (
                  exams.map((exam) => (
                <tr key={exam._id} className="border-t">
                  <td className="p-3">{exam.name}</td>
                  <td className="p-3">{exam.type}</td>
                  <td className="p-3">
                    {exam.classSubjects && exam.classSubjects.length > 0 
                      ? (
                        <div>
                          {exam.classSubjects.map((cs, index) => (
                            <span key={index} className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                              {cs.class && cs.class.name ? cs.class.name : 'Unknown'}
                            </span>
                          ))}
                        </div>
                      ) 
                      : 'N/A'}
                  </td>
                  <td className="p-3">
                    {format(new Date(exam.startDate), 'dd/MM/yyyy')} - {format(new Date(exam.endDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(exam.status)}`}>
                      {exam.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleExamSelect(exam._id)}
                      disabled={exam.status === 'Upcoming' || exam.status === 'Cancelled'}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm disabled:bg-gray-300"
                    >
                      Enter Results
                    </button>
                  </td>
                </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="p-4 text-center text-gray-500">
                      No exams found
                            </td>
                          </tr>
                )}
                      </tbody>
                    </table>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ExamResults;
