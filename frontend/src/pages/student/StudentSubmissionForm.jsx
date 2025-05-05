import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Upload,
  X,
  AlertCircle,
  Calendar,
  Clock,
  BookOpen,
  Send,
  Download,
  ExternalLink
} from "lucide-react";
import Layout from "../../components/layoutes/studentlayout";
import authAxios, { getUserData } from "../../utils/auth";
import Loader from "../../components/Loader";

const StudentSubmissionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = getUserData();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [formData, setFormData] = useState({
    content: "",
    attachments: []
  });
  const isPastDue = assignment ? new Date() > new Date(assignment.dueDate) : false;

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch assignment details
        const response = await authAxios.get(`/assignments/${id}`);
        setAssignment(response.data.data);

        // Check if already submitted
        try {
          const submissionRes = await authAxios.get(`/assignments/${id}/submissions/student`);
          if (submissionRes.data.data) {
            navigate(`/student/assignments/view-submission/${id}`);
          }
        } catch (err) {
          // No submission exists, which is fine
        }
      } catch (err) {
        console.error("Failed to fetch assignment:", err);
        setError("Failed to load assignment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [id, navigate]);

  const handleContentChange = (e) => {
    setFormData({
      ...formData,
      content: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({
      ...formData,
      attachments: [...formData.attachments, ...files]
    });
  };

  const removeFile = (index) => {
    const updatedFiles = [...formData.attachments];
    updatedFiles.splice(index, 1);
    setFormData({
      ...formData,
      attachments: updatedFiles
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
        
    if (isPastDue) {
      setError("Submissions are no longer accepted as the due date has passed.");
      return;
    }
    
    if (formData.content.trim() === "" && formData.attachments.length === 0) {
      setError("Please provide either text content or upload files for your submission.");
      return;
    }
    
    try {
      setSubmitting(true);
      setError("");
      
      const submissionFormData = new FormData();
      submissionFormData.append("content", formData.content);
      
      formData.attachments.forEach(file => {
        submissionFormData.append("attachments", file);
      });
      
      await authAxios.post(`/assignments/${id}/submit`, submissionFormData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setSuccess("Your assignment has been submitted successfully!");
      setTimeout(() => {
        navigate("/student/assignments");
      }, 2000);
    } catch (err) {
      console.error("Failed to submit assignment:", err);
      setError(err.response?.data?.message || "Failed to submit assignment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate remaining time
  const getRemainingTime = () => {
    if (!assignment) return null;
    
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (now > dueDate) {
      return { text: "Past Due", color: "text-red-600" };
    }
    
    const diff = dueDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return { 
        text: `${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} remaining`, 
        color: days < 2 ? "text-yellow-600" : "text-green-600" 
      };
    } else if (hours > 0) {
      return { 
        text: `${hours} hour${hours !== 1 ? 's' : ''} remaining`, 
        color: "text-yellow-600" 
      };
    } else {
      return { 
        text: "Less than an hour remaining", 
        color: "text-red-600" 
      };
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

  if (!assignment) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="rounded-md bg-red-50 p-4 text-red-600">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              {error || "Assignment not found or you don't have permission to view it."}
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={() => navigate("/student/assignments")}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Assignments
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const remainingTime = getRemainingTime();

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => navigate("/student/assignments")}
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Assignments
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Submit Assignment</h1>
          <p className="mt-1 text-sm text-gray-500">
            Complete and submit your work for "{assignment.title}"
          </p>
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
          <div className="mb-6 rounded-md bg-green-50 p-4 text-green-600">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              {success}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Assignment Details */}
          <div className="lg:col-span-3 rounded-lg bg-white p-6 shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{assignment.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-1 h-4 w-4" />
                    Due: {formatDate(assignment.dueDate)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <BookOpen className="mr-1 h-4 w-4" />
                    {assignment.subjectId?.name || "Subject"}
                  </div>
                  <div className="flex items-center text-sm font-medium">
                    <Clock className="mr-1 h-4 w-4" />
                    <span className={remainingTime.color}>{remainingTime.text}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{assignment.totalMarks}</div>
                <div className="text-sm text-gray-500">Total Marks</div>
              </div>
            </div>
          </div>

          {/* Assignment Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            {assignment.description && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Assignment Description</h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {assignment.description}
                </div>
              </div>
            )}

            {/* Instructions */}
            {assignment.instructions && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Instructions</h3>
                <div className="prose prose-sm max-w-none text-gray-700">
                  {assignment.instructions}
                </div>
              </div>
            )}

            {/* Assignment Resources */}
            {assignment.attachments && assignment.attachments.length > 0 && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Assignment Files</h3>
                <ul className="space-y-2">
                  {assignment.attachments.map((attachment) => (
                    <li
                      key={attachment._id}
                      className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
                    >
                      <div className="flex items-center">
                        <FileText className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-700">
                          {attachment.originalName || attachment.filename}
                        </span>
                      </div>
                      <a
                        href={attachment.path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-600 hover:text-blue-800"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Submission Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Submission</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Your Response
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={handleContentChange}
                    rows={6}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Enter your answer or additional comments here..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Files
                  </label>
                  
                  {formData.attachments.length > 0 && (
                    <ul className="mb-3 space-y-2">
                      {formData.attachments.map((file, index) => (
                        <li
                          key={index}
                          className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2"
                        >
                          <div className="flex items-center overflow-hidden">
                            <FileText className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                            <span className="truncate text-sm text-gray-700">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="ml-2 flex-shrink-0 text-gray-400 hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <div className="mt-1">
                    <label
                      htmlFor="file-upload"
                      className="flex cursor-pointer items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      <span>Add Files</span>
                      <input
                        id="file-upload"
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="sr-only"
                      />
                    </label>
                    <p className="mt-1 text-xs text-gray-500">
                      Max 5 files. PDF, Word, Excel, images, and text files accepted.
                    </p>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    <div className="flex items-center justify-center">
                      <Send className="mr-2 h-4 w-4" />
                      {submitting ? "Submitting..." : "Submit Assignment"}
                    </div>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudentSubmissionForm; 