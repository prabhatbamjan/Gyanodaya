import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  Upload,
  AlertCircle,
  BookOpen,
  Users,
  Send,
  X
} from "lucide-react";
import Layout from "../components/layoutes/layout";
import authAxios from "../utils/auth";
import Loader from "../components/Loader";
import FileUploader from "../components/FileUploader";

const StudentSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [formData, setFormData] = useState({
    answer: "",
  });
  const [attachments, setAttachments] = useState([]);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch assignment details
        const assignmentRes = await authAxios.get(`/assignments/${id}`);
        setAssignment(assignmentRes.data.data);

        // Check if student already has a submission for this assignment
        const submissionRes = await authAxios.get(`/submissions/assignment/${id}/student`);
        if (submissionRes.data.data) {
          const submission = submissionRes.data.data;
          setExistingSubmission(submission);
          setFormData({
            answer: submission.answer || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load assignment details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments([...attachments, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.answer.trim() && attachments.length === 0) {
      setError("Please provide an answer or attach a file");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      
      const formDataObj = new FormData();
      formDataObj.append("answer", formData.answer);
      formDataObj.append("assignment", id);
      
      // Add attachments
      attachments.forEach(file => {
        formDataObj.append("attachments", file);
      });

      if (existingSubmission) {
        // Update existing submission
        await authAxios.put(`/submissions/${existingSubmission._id}`, formDataObj, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setSuccess("Your submission has been updated successfully!");
      } else {
        // Create new submission
        await authAxios.post("/submissions", formDataObj, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        setSuccess("Your assignment has been submitted successfully!");
      }
      
      // Reset attachments after successful submission
      setAttachments([]);
      
      // Refresh submission data
      const submissionRes = await authAxios.get(`/submissions/assignment/${id}/student`);
      if (submissionRes.data.data) {
        setExistingSubmission(submissionRes.data.data);
      }
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      setError(err.response?.data?.message || "Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const isLate = () => {
    if (!assignment) return false;
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    return now > dueDate;
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

  if (error && !assignment) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="rounded-md bg-red-50 p-4 text-red-600">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              {error}
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!assignment) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-lg font-medium text-gray-900">Assignment not found</h2>
            <p className="mt-2 text-gray-500">The assignment you're looking for doesn't exist or you don't have permission to view it.</p>
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
        <button
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </button>

        {/* Assignment Details */}
        <div className="mb-6 rounded-lg bg-white p-6 shadow">
          <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
          
          {isLate() && !existingSubmission && (
            <div className="mt-2 rounded-md bg-yellow-50 px-4 py-2 text-sm text-yellow-800">
              <span className="font-medium">Note:</span> This assignment is past its due date. Your submission will be marked as late.
            </div>
          )}

          {existingSubmission && (
            <div className="mt-2 rounded-md bg-green-50 px-4 py-2 text-sm text-green-800">
              <span className="font-medium">Status:</span> {existingSubmission.status === 'graded' ? 'Graded' : 'Submitted'}
              {existingSubmission.lateSubmission && ' (Late submission)'}
            </div>
          )}
          
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Subject</p>
                <p className="font-medium text-gray-900">{assignment.subjectId?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-2 mr-3">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Class</p>
                <p className="font-medium text-gray-900">{assignment.classId?.name || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-amber-100 p-2 mr-3">
                <Calendar className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(assignment.dueDate)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <FileText className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Max Marks</p>
                <p className="font-medium text-gray-900">{assignment.totalMarks}</p>
              </div>
            </div>
          </div>

          {/* Assignment Description */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900">Description</h2>
            <div className="mt-2 text-gray-700">
              {assignment.description}
            </div>
          </div>

          {/* Instructions */}
          {assignment.instructions && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900">Instructions</h2>
              <div className="mt-2 text-gray-700">
                {assignment.instructions}
              </div>
            </div>
          )}

          {/* Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
              <div className="mt-2 space-y-2">
                {assignment.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center space-x-2 rounded-md border border-gray-200 px-3 py-2">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <a 
                      href={attachment.filePath} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 text-blue-600 hover:text-blue-800"
                    >
                      {attachment.fileName}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Submission Form */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-xl font-medium text-gray-900">
            {existingSubmission ? 'Update Your Submission' : 'Submit Your Work'}
          </h2>
          
          {success && (
            <div className="mt-3 rounded-md bg-green-50 p-4 text-green-800">
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                {success}
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-3 rounded-md bg-red-50 p-4 text-red-600">
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5" />
                {error}
              </div>
            </div>
          )}
          
          {/* Show previous grade and feedback if available */}
          {existingSubmission && existingSubmission.status === 'graded' && (
            <div className="mt-4 space-y-3 rounded-md bg-gray-50 p-4">
              <div>
                <p className="font-medium text-gray-700">Marks:</p>
                <p className="text-gray-800">{existingSubmission.marks} / {assignment.totalMarks}</p>
              </div>
              {existingSubmission.feedback && (
                <div>
                  <p className="font-medium text-gray-700">Teacher Feedback:</p>
                  <p className="text-gray-800">{existingSubmission.feedback}</p>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <div className="space-y-6">
              {/* Answer */}
              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-gray-700">
                  Your Answer
                </label>
                <textarea
                  id="answer"
                  name="answer"
                  rows="8"
                  value={formData.answer}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Type your answer here..."
                ></textarea>
              </div>

              {/* File Upload */}
              <div>
                <FileUploader
                  files={attachments}
                  onFilesChange={setAttachments}
                  maxFiles={5}
                  maxSize={10}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.zip"
                  label="Attachments"
                  note="Add up to 5 files (10MB max per file). Supported formats: PDF, Word, PowerPoint, Excel, images, and zip files."
                  error={error && error.includes("file") ? error : null}
                />

                {/* Show existing attachments */}
                {existingSubmission && existingSubmission.attachments && existingSubmission.attachments.length > 0 && (
                  <div className="mt-4">
                    <h3 className="mb-2 text-sm font-medium text-gray-700">Previously Submitted Files</h3>
                    <div className="space-y-2">
                      {existingSubmission.attachments.map((attachment, index) => (
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
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center rounded-md ${
                    submitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                  } px-4 py-2 text-sm font-medium text-white`}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitting 
                    ? 'Submitting...' 
                    : existingSubmission 
                      ? 'Update Submission' 
                      : 'Submit Assignment'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default StudentSubmission; 