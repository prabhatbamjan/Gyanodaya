import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  BookOpen,
  Award,
  Check,
  X,
  Percent,
  Download,
  AlertCircle,
} from "lucide-react";
import Layout from "../../components/layoutes/studentlayout";
import authAxios, { getUserData } from "../../utils/auth";

const ExamResultsView = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [examResult, setExamResult] = useState(null);
  const [exam, setExam] = useState(null);
  const userData = getUserData();
  const resultRef = useRef(null);

  useEffect(() => {
    const fetchExamResult = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get student ID from user data
        const studentId = userData?.id;
        
        if (!studentId) {
          setError("Student information not found. Please log in again.");
          setLoading(false);
          return;
        }
        
        // Fetch the exam details
        const examResponse = await authAxios.get(`/exams/${examId}`);
        
        if (!examResponse.data.success) {
          setError("Failed to fetch exam details");
          setLoading(false);
          return;
        }
        
        setExam(examResponse.data.data);
        
        // Fetch the result for this specific exam and student
        const resultResponse = await authAxios.get(`/exams/${examId}/results?student=${studentId}`);
        
        if (!resultResponse.data.success || !resultResponse.data.data || resultResponse.data.data.length === 0) {
          setError("No results found for this exam");
          setLoading(false);
          return;
        }
        
        console.log("Exam Result:", resultResponse.data);
        setExamResult(resultResponse.data.data[0]);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching exam result:", err);
        setError(err.response?.data?.message || "An error occurred while fetching your result");
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
      ? "bg-green-100 text-green-800" 
      : "bg-red-100 text-red-800";
  };

  // Download result as PDF
  const downloadResult = () => {
    const printContent = resultRef.current;
    const originalContents = document.body.innerHTML;
    
    const printCSS = `
      @page { margin: 15mm; }
      body { font-family: Arial, sans-serif; }
      .print-header { text-align: center; margin-bottom: 20px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .status-pass { color: #15803d; background-color: #dcfce7; padding: 4px 8px; border-radius: 9999px; font-weight: 500; }
      .status-fail { color: #b91c1c; background-color: #fee2e2; padding: 4px 8px; border-radius: 9999px; font-weight: 500; }
      .grade-a { color: #15803d; font-weight: bold; }
      .grade-b { color: #1d4ed8; font-weight: bold; }
      .grade-c { color: #ca8a04; font-weight: bold; }
      .grade-d { color: #ea580c; font-weight: bold; }
      .grade-f { color: #b91c1c; font-weight: bold; }
    `;
    
    // Create student name 
    const studentName = userData?.firstName && userData?.lastName 
      ? `${userData.firstName} ${userData.lastName}`
      : 'Student';
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Exam Result - ${exam?.name || 'Exam'}</title>
          <style>${printCSS}</style>
        </head>
        <body>
          <div class="print-header">
            <h1>Exam Result Certificate</h1>
            <h2>${exam?.name || 'Exam'}</h2>
            <p>Student: ${studentName}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div>
            <h3>Exam Information</h3>
            <table>
              <tr>
                <th>Exam Type</th>
                <td>${exam?.type || 'N/A'}</td>
                <th>Academic Year</th>
                <td>${examResult?.academicYear || 'N/A'}</td>
              </tr>
              <tr>
                <th>Status</th>
                <td class="${examResult?.status === 'Pass' ? 'status-pass' : 'status-fail'}">${examResult?.status || 'N/A'}</td>
                <th>Grade</th>
                <td class="grade-${examResult?.grade && examResult.grade[0].toLowerCase()}">${examResult?.grade || 'N/A'}</td>
              </tr>
              <tr>
                <th>Total Marks</th>
                <td>${examResult?.totalMarksObtained || '0'} / ${exam?.totalMarks * (examResult?.subjectResults?.length || 0) || 'N/A'}</td>
                <th>Percentage</th>
                <td>${examResult?.percentage?.toFixed(1) || '0'}%</td>
              </tr>
            </table>
            
            <h3>Subject Results</h3>
            <table>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks Obtained</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${examResult?.subjectResults?.map((subject) => `
                  <tr>
                    <td>${subject.subject?.name || 'Unknown Subject'}</td>
                    <td>${subject.marksObtained || '0'} / ${exam?.totalMarks || '100'}</td>
                    <td class="grade-${subject.grade && subject.grade[0].toLowerCase()}">${subject.grade || 'N/A'}</td>
                    <td class="${subject.status === 'Pass' ? 'status-pass' : 'status-fail'}">${subject.status || 'N/A'}</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
            
            ${examResult?.remarks ? `
              <h3>Teacher's Remarks</h3>
              <p>${examResult.remarks}</p>
            ` : ''}
            
            <div style="margin-top: 40px; display: flex; justify-content: space-between;">
              <div>
                <p>___________________</p>
                <p>Examiner Signature</p>
              </div>
              <div>
                <p>___________________</p>
                <p>Principal Signature</p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto" ref={resultRef}>
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
                Back to Results
              </button>
            </div>
          ) : !examResult ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-700">No result found for this exam</p>
              <button
                onClick={() => navigate("/student/results")}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Back to Results
              </button>
            </div>
          ) : (
            <>
              {/* Exam Information */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    {exam?.name || "Exam Details"}
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Exam Type</p>
                      <p className="font-medium">{exam?.type || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Academic Year</p>
                      <p className="font-medium">{examResult.academicYear || "N/A"}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500 mb-1">Date</p>
                      <p className="font-medium">
                        {exam?.startDate && new Date(exam.startDate).toLocaleDateString()} - 
                        {exam?.endDate && new Date(exam.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Result Summary */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Result Summary</h2>
                </div>
                <div className="p-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center gap-4">
                      <div className={`h-16 w-16 rounded-full flex items-center justify-center ${examResult.status === 'Pass' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {examResult.status === 'Pass' ? (
                          <Check className="h-8 w-8 text-green-600" />
                        ) : (
                          <X className="h-8 w-8 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Final Result</p>
                        <p className={`text-xl font-bold ${examResult.status === 'Pass' ? 'text-green-600' : 'text-red-600'}`}>
                          {examResult.status}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Total Marks</div>
                        <div className="text-xl font-bold">
                          {examResult.totalMarksObtained} <span className="text-sm text-gray-500">/ {exam?.totalMarks * examResult.subjectResults.length}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Percentage</div>
                        <div className="text-xl font-bold flex items-center justify-center">
                          <Percent className="h-4 w-4 mr-1" />
                          {examResult.percentage.toFixed(1)}%
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Grade</div>
                        <div className={`text-xl font-bold ${getGradeColor(examResult.grade)}`}>
                          {examResult.grade || 'N/A'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Marked By</div>
                        <div className="text-md">
                          {examResult.markedBy?.firstName} {examResult.markedBy?.lastName}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subject Results */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Subject Results</h2>
                </div>
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 border">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Subject
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Marks Obtained
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
                        {examResult.subjectResults.map((subject, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="text-sm font-medium text-gray-900">
                                  {subject.subject?.name || 'Unknown Subject'}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {subject.marksObtained} / {exam?.totalMarks || 100}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${getGradeColor(subject.grade)}`}>
                                {subject.grade || 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subject.status)}`}>
                                {subject.status || 'N/A'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Remarks (if any) */}
              {examResult.remarks && (
                <div className="bg-white rounded-lg shadow mb-6">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">Teacher's Remarks</h2>
                  </div>
                  <div className="p-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{examResult.remarks}</p>
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

export default ExamResultsView; 