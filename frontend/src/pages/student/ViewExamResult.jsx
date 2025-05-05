import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  BookOpen,
  Award,
  Check,
  X,
  AlertCircle,
  Download,
  Calendar,
  BarChart3,
  Percent,
  User,
} from "lucide-react";
import Layout from "../../components/layoutes/studentlayout";
import authAxios, { getUserData } from "../../utils/auth";

const ViewExamResult = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exam, setExam] = useState(null);
  const [result, setResult] = useState(null);
  const [classRank, setClassRank] = useState(null);
  const userData = getUserData();

  useEffect(() => {
    const fetchExamResult = async () => {
      try {
        setLoading(true);
        
        // Fetch the exam details
        const examResponse = await authAxios.get(`/exams/${examId}/results`);
        if (examResponse.data.success) {
          setExam(examResponse.data.data);
        } else {
          setError("Failed to fetch exam details");
          setLoading(false);
          return;
        }
        console.log(examResponse.data)

      

        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching exam result:", err);
        setError(err.response?.data?.message || "An error occurred while fetching your exam result");
        setLoading(false);
      }
    };
    
    fetchExamResult();
  }, []);

  // Calculate grade color
  const getGradeColor = (grade) => {
    if (!grade) return "text-gray-500";
    
    switch (grade[0]) {
      case "A":
        return "text-green-600";
      case "B":
        return "text-blue-600";
      case "C":
        return "text-yellow-600";
      case "D":
        return "text-orange-600";
      default:
        return "text-red-600";
    }
  };

  // Calculate status color
  const getStatusColor = (status) => {
    return status === 'Pass' 
      ? "bg-green-100 text-green-800 border-green-200" 
      : "bg-red-100 text-red-800 border-red-200";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Calculate percentage
  const calculatePercentage = (obtained, total) => {
    if (!obtained || !total) return 0;
    return ((obtained / total) * 100).toFixed(2);
  };

  // Download result as PDF
  const downloadResult = () => {
    // This would typically call a backend endpoint to generate a PDF
    console.log("Downloading result for", examId);
    // Example implementation would be:
    // window.open(`/api/exam-results/${examId}/download`, '_blank');
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto">
          {/* Header with Back Button */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/student/results')}
                className="p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-800">Exam Result</h1>
            </div>
            <button
              onClick={downloadResult}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Download PDF</span>
            </button>
          </div>

          {loading ? (
            <div className="bg-white rounded-lg shadow p-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <p className="text-gray-700">{error}</p>
              <button
                onClick={() => navigate("/student/results")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Exams
              </button>
            </div>
          ) : !result ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-700">No result found for this exam</p>
              <button
                onClick={() => navigate("/student/results")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Exams
              </button>
            </div>
          ) : (
            <>
              {/* Exam Details */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    {exam?.name || "Exam Details"}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2 text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        <p className="text-sm">Exam Date</p>
                      </div>
                      <p className="font-medium text-gray-700">
                        {formatDate(exam?.startDate)} - {formatDate(exam?.endDate)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2 text-gray-500">
                        <FileText className="h-4 w-4 mr-2" />
                        <p className="text-sm">Exam Type</p>
                      </div>
                      <p className="font-medium text-gray-700">
                        {exam?.type || "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2 text-gray-500">
                        <BookOpen className="h-4 w-4 mr-2" />
                        <p className="text-sm">Academic Year</p>
                      </div>
                      <p className="font-medium text-gray-700">
                        {exam?.academicYear || "N/A"}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center mb-2 text-gray-500">
                        <User className="h-4 w-4 mr-2" />
                        <p className="text-sm">Class</p>
                      </div>
                      <p className="font-medium text-gray-700">
                        {result?.class?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Overall Result */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    Overall Result
                  </h2>
                </div>
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`h-16 w-16 rounded-full flex items-center justify-center ${result.status === 'Pass' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {result.status === 'Pass' ? (
                            <Check className="h-8 w-8 text-green-600" />
                          ) : (
                            <X className="h-8 w-8 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-gray-500 text-sm">Final Result</p>
                          <p className={`text-xl font-bold ${result.status === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                            {result.status}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Total Marks</div>
                          <div className="text-xl font-bold">
                            {result.totalMarksObtained} <span className="text-sm text-gray-500">/ {exam?.totalMarks * (result.subjectResults?.length || 1)}</span>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Percentage</div>
                          <div className="text-xl font-bold flex items-center justify-center">
                            <Percent className="h-4 w-4 mr-1" />
                            {result.percentage ? result.percentage.toFixed(2) : '0.00'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Grade</div>
                          <div className={`text-xl font-bold ${getGradeColor(result.grade)}`}>
                            {result.grade || 'N/A'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Class Rank</div>
                          <div className="text-xl font-bold">
                            {classRank?.rank || 'N/A'}{classRank?.rank ? <span className="text-sm text-gray-500">/{classRank?.totalStudents}</span> : ''}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subject-wise Results */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject Results</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 border rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Subject
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Marks
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Percentage
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Grade
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {result.subjectResults && result.subjectResults.map((subjectResult, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="text-sm font-medium text-gray-900">
                                    {subjectResult.subject?.name || `Subject ${index + 1}`}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {subjectResult.marksObtained} / {exam?.totalMarks || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {calculatePercentage(subjectResult.marksObtained, exam?.totalMarks)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-sm font-medium ${getGradeColor(subjectResult.grade)}`}>
                                  {subjectResult.grade || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subjectResult.status)}`}>
                                  {subjectResult.status || 'N/A'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teacher's Remarks */}
              {result.remarks && (
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                      Teacher's Remarks
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{result.remarks}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Performance Comparison */}
              {classRank && (
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">
                      Class Performance
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2 text-gray-500">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          <p className="text-sm">Class Average</p>
                        </div>
                        <p className="font-bold text-gray-700 text-xl">
                          {classRank.classAverage ? classRank.classAverage.toFixed(2) : '0.00'}%
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2 text-gray-500">
                          <Award className="h-4 w-4 mr-2" />
                          <p className="text-sm">Highest Marks</p>
                        </div>
                        <p className="font-bold text-gray-700 text-xl">
                          {classRank.highestMarks || 0}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center mb-2 text-gray-500">
                          <Check className="h-4 w-4 mr-2" />
                          <p className="text-sm">Pass Percentage</p>
                        </div>
                        <p className="font-bold text-gray-700 text-xl">
                          {classRank.passPercentage ? classRank.passPercentage.toFixed(2) : '0.00'}%
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ViewExamResult; 