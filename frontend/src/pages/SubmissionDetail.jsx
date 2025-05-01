import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  Clock,
  Check,
  X,
  Download,
  AlertCircle,
  Save,
  MessageSquare
} from "lucide-react";
import Layout from "../components/layoutes/teacherlayout";
import authAxios from "../utils/auth";
import Loader from "../components/Loader";

const SubmissionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [submission, setSubmission] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [feedback, setFeedback] = useState({
    marks: "",
    comments: ""
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch submission details
        const submissionRes = await authAxios.get(`/submissions/${id}`);
        const submission = submissionRes.data.data;
        setSubmission(submission);

        // Pre-fill feedback form if marks/comments exist
        if (submission) {
          setFeedback({
            marks: submission.marks?.toString() || "",
            comments: submission.feedback || ""
          });

          // Fetch assignment details
          if (submission.assignment) {
            const assignmentRes = await authAxios.get(`/assignments/${submission.assignment}`);
            setAssignment(assignmentRes.data.data);
          }

          // Fetch student details
          if (submission.student) {
            const studentRes = await authAxios.get(`/students/${submission.student}`);
            setStudent(studentRes.data.data);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load submission details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFeedback({ ...feedback, [name]: value });
  };

  const validateFeedback = () => {
    if (!feedback.marks) {
      setError("Please enter marks");
      return false;
    }

    const marks = Number(feedback.marks);
    if (isNaN(marks) || marks < 0) {
      setError("Marks must be a positive number");
      return false;
    }

    if (assignment && marks > assignment.totalMarks) {
      setError(`Marks cannot exceed maximum marks (${assignment.totalMarks})`);
      return false;
    }

    return true;
  };

  const handleSubmitFeedback = async () => {
    if (!validateFeedback()) return;

    try {
      setSavingFeedback(true);
      setError("");

      await authAxios.post(`/submissions/${id}/grade`, {
        marks: feedback.marks,
        feedback: feedback.comments
      });

      // Update submission data
      const updatedSubmission = await authAxios.get(`/submissions/${id}`);
      setSubmission(updatedSubmission.data.data);
      
      setSuccess("Feedback saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Failed to save feedback:", err);
      setError(err.response?.data?.message || "Failed to save feedback. Please try again.");
    } finally {
      setSavingFeedback(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
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

  if (!submission) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-lg font-medium text-gray-900">Submission not found</h2>
            <p className="mt-2 text-gray-500">The submission you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="mb-2 inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to submissions
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
          </div>
          {assignment && (
            <Link
              to={`/assignments/grading/${assignment._id}`}
              className="mt-2 sm:mt-0 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              View all submissions for this assignment
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4 text-red-600">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              {error}
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4 text-green-700">
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5" />
              {success}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Left side - Submission details */}
          <div className="md:col-span-2 space-y-6">
            {/* Assignment Info */}
            {assignment && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{assignment.title}</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-4">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Due Date</p>
                      <p className="text-sm font-medium text-gray-800">
                        {formatDate(assignment.dueDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Max Marks</p>
                      <p className="text-sm font-medium text-gray-800">{assignment.totalMarks}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-600">{assignment.description}</p>
                </div>
              </div>
            )}

            {/* Student Submission */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Student Answer</h2>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    submission.lateSubmission 
                      ? 'bg-orange-100 text-orange-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {submission.lateSubmission ? 'Late Submission' : 'On Time'}
                  </span>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Submitted on</p>
                <p className="text-sm font-medium text-gray-800">
                  {formatDate(submission.submittedAt || submission.createdAt)}
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="prose max-w-none text-gray-800">
                  {submission.answer}
                </div>
              </div>

              {/* Attachments */}
              {submission.attachments && submission.attachments.length > 0 && (
                <div>
                  <h3 className="text-md font-medium text-gray-800 mb-2">Attachments</h3>
                  <div className="space-y-2">
                    {submission.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 rounded-md border border-gray-200 px-3 py-2">
                        <FileText className="h-5 w-5 text-gray-500" />
                        <a 
                          href={attachment.path} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex-1 text-blue-600 hover:text-blue-800"
                        >
                          {attachment.originalName || attachment.name}
                        </a>
                        <a 
                          href={attachment.path} 
                          download
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right side - Student info and grading */}
          <div className="space-y-6">
            {/* Student Info */}
            {student && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h2>
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-lg mr-4">
                    {student.firstName?.charAt(0) || "S"}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{student.firstName} {student.lastName}</p>
                    <p className="text-sm text-gray-500">
                      {student.class?.name || "No class assigned"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Roll Number</span>
                    <span className="text-sm font-medium text-gray-900">{student.rollNumber || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Email</span>
                    <span className="text-sm font-medium text-gray-900">{student.email || "N/A"}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Grading Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Grade Submission</h2>
              
              {submission.status === 'graded' && (
                <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">Last graded:</span> {formatDate(submission.gradedAt)}
                  </p>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marks
                    {assignment && (
                      <span className="text-gray-500 font-normal"> (out of {assignment.totalMarks})</span>
                    )}
                  </label>
                  <input
                    type="number"
                    name="marks"
                    value={feedback.marks}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter marks"
                    min="0"
                    max={assignment?.totalMarks || 100}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback
                  </label>
                  <textarea
                    name="comments"
                    value={feedback.comments}
                    onChange={handleInputChange}
                    rows="5"
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Provide feedback to the student..."
                  ></textarea>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSubmitFeedback}
                    disabled={savingFeedback}
                    className={`inline-flex items-center rounded-md ${
                      savingFeedback ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                    } px-4 py-2 text-sm font-medium text-white`}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {savingFeedback ? 'Saving...' : 'Save Feedback'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SubmissionDetail; 