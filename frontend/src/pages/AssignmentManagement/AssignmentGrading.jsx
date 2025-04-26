import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Download,
  Check,
  X,
  User,
  Clock,
  Calendar,
  AlertCircle,
  ExternalLink,
  Send,
  MessageSquare,
  Save
} from "lucide-react";
import Layout from "../../components/layoutes/teacherlayout";
import authAxios from "../../utils/auth";
import Loader from "../../components/Loader";

const AssignmentGrading = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSubmission, setActiveSubmission] = useState(null);
  const [savingFeedback, setSavingFeedback] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    marks: "",
    comments: "",
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch assignment details
        const assignmentRes = await authAxios.get(`/assignments/${id}`);
        const assignment = assignmentRes.data.data;
        setAssignment(assignment);

        // Fetch submissions
        const submissionsRes = await authAxios.get(`/assignments/${id}/submissions`);
        const submissions = submissionsRes.data.data || [];
        setSubmissions(submissions);

        // Set first submission as active if available
        if (submissions.length > 0) {
          setActiveSubmission(submissions[0]);
          
          // Pre-fill feedback form if marks/comments exist
          setFeedbackForm({
            marks: submissions[0].marks?.toString() || "",
            comments: submissions[0].feedback || "",
          });
        }
      } catch (err) {
        console.error("Failed to fetch assignment data:", err);
        setError("Failed to load assignment data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmissionSelect = (submission) => {
    setActiveSubmission(submission);
    
    // Reset feedback form with this submission's data
    setFeedbackForm({
      marks: submission.marks?.toString() || "",
      comments: submission.feedback || "",
    });
    
    // Clear any success message
    setSuccessMessage("");
  };

  const handleFeedbackChange = (e) => {
    const { name, value } = e.target;
    
    // If marks, validate that it's a number and within range
    if (name === "marks") {
      if (value === "" || (!isNaN(value) && parseInt(value) >= 0 && parseInt(value) <= assignment.totalMarks)) {
        setFeedbackForm({ ...feedbackForm, [name]: value });
      }
    } else {
      setFeedbackForm({ ...feedbackForm, [name]: value });
    }
  };

  const handleSaveFeedback = async () => {
    if (!activeSubmission) return;
    
    try {
      setSavingFeedback(true);
      setError("");
      setSuccessMessage("");

      const payload = {
        marks: feedbackForm.marks === "" ? null : parseInt(feedbackForm.marks),
        feedback: feedbackForm.comments,
      };

      // Save feedback for the submission
      await authAxios.put(`/assignments/${id}/submissions/${activeSubmission._id}/grade`, payload);

      // Update submission in state
      const updatedSubmissions = submissions.map(sub => {
        if (sub._id === activeSubmission._id) {
          return {
            ...sub,
            marks: payload.marks,
            feedback: payload.feedback,
            status: "graded",
          };
        }
        return sub;
      });

      // Update active submission
      const updatedActiveSubmission = {
        ...activeSubmission,
        marks: payload.marks,
        feedback: payload.feedback,
        status: "graded",
      };

      setSubmissions(updatedSubmissions);
      setActiveSubmission(updatedActiveSubmission);
      setSuccessMessage("Feedback saved successfully!");
    } catch (err) {
      console.error("Failed to save feedback:", err);
      setError("Failed to save feedback. Please try again.");
    } finally {
      setSavingFeedback(false);
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

  const getStatusColor = (status, isLate) => {
    if (status === "graded") return "green";
    if (isLate) return "yellow";
    return "blue";
  };

  const getStatusLabel = (status, isLate) => {
    if (status === "graded") return "Graded";
    if (isLate) return "Late";
    return "Submitted";
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

  if (error) {
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
              onClick={() => navigate("/assignments")}
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

  if (!assignment) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <h2 className="text-lg font-medium text-gray-900">Assignment not found</h2>
            <p className="mt-2 text-gray-500">The assignment you're looking for doesn't exist or you don't have permission to view it.</p>
            <Link
              to="/assignments"
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Assignments
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <button
            onClick={() => navigate("/assignments")}
            className="mb-4 inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Assignments
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Grade Submissions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and grade student submissions for "{assignment.title}"
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Assignment Info */}
          <div className="lg:col-span-3 rounded-lg bg-white p-6 shadow">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="md:col-span-2">
                <h2 className="text-lg font-medium text-gray-900">{assignment.title}</h2>
                <p className="mt-1 text-sm text-gray-500">{assignment.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="inline-flex items-center text-sm text-gray-700">
                    <Calendar className="mr-1.5 h-4 w-4 text-gray-500" />
                    Due: {formatDate(assignment.dueDate)}
                  </div>
                  <div className="inline-flex items-center text-sm text-gray-700">
                    <FileText className="mr-1.5 h-4 w-4 text-gray-500" />
                    {assignment.attachments?.length || 0} Attachments
                  </div>
                  <div className="inline-flex items-center text-sm text-gray-700">
                    <User className="mr-1.5 h-4 w-4 text-gray-500" />
                    {submissions.length} Submissions
                  </div>
                </div>
              </div>
              
              <div className="md:col-span-2 flex flex-col md:items-end justify-between">
                <div className="mb-4 md:mb-0 text-right">
                  <span className="block text-sm text-gray-500">Total Marks</span>
                  <span className="text-xl font-bold text-gray-900">{assignment.totalMarks}</span>
                </div>
                <div className="flex space-x-3">
                  <Link
                    to={`/assignments/${id}`}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Assignment
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Submissions List */}
          <div className="lg:col-span-1 rounded-lg bg-white shadow">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-900">
                Submissions ({submissions.length})
              </h2>
            </div>
            <div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
              {submissions.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">No submissions yet</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {submissions.map((submission) => {
                    const isActive = activeSubmission?._id === submission._id;
                    const isLate = new Date(submission.submittedAt) > new Date(assignment.dueDate);
                    const statusColor = getStatusColor(submission.status, isLate);
                    const statusLabel = getStatusLabel(submission.status, isLate);
                    
                    return (
                      <li
                        key={submission._id}
                        className={`cursor-pointer hover:bg-gray-50 ${
                          isActive ? "bg-blue-50" : ""
                        }`}
                        onClick={() => handleSubmissionSelect(submission)}
                      >
                        <div className="px-4 py-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">
                              {submission.student?.name || "Student"}
                            </span>
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                statusColor === "green"
                                  ? "bg-green-100 text-green-800"
                                  : statusColor === "yellow"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {statusLabel}
                            </span>
                          </div>
                          <div className="mt-1 flex justify-between text-sm">
                            <span className="text-gray-500">
                              {formatDate(submission.submittedAt)}
                            </span>
                            {submission.status === "graded" && (
                              <span className="font-medium text-gray-900">
                                {submission.marks}/{assignment.totalMarks}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Submission Details & Grading */}
          <div className="lg:col-span-2">
            {activeSubmission ? (
              <div className="space-y-6">
                {/* Submission Details */}
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-lg font-medium text-gray-900">
                      {activeSubmission.student?.name || "Student"}'s Submission
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        new Date(activeSubmission.submittedAt) > new Date(assignment.dueDate)
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {new Date(activeSubmission.submittedAt) > new Date(assignment.dueDate)
                        ? "Late Submission"
                        : "On Time"}
                    </span>
                  </div>
                  
                  <div className="mb-4 text-sm">
                    <div className="mb-2 flex items-center text-gray-500">
                      <Clock className="mr-1.5 h-4 w-4" />
                      Submitted: {formatDate(activeSubmission.submittedAt)}
                    </div>
                    
                    {activeSubmission.answer && (
                      <div className="mt-4">
                        <h3 className="font-medium text-gray-900 mb-2">Answer:</h3>
                        <div className="prose prose-sm max-w-none bg-gray-50 p-4 rounded-md">
                          {activeSubmission.answer}
                        </div>
                      </div>
                    )}
                    
                    {activeSubmission.attachments && activeSubmission.attachments.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-medium text-gray-900 mb-2">Attachments:</h3>
                        <ul className="space-y-2">
                          {activeSubmission.attachments.map((attachment) => (
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
                                href={`/api/assignments/submissions/download/${attachment._id}`}
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
                </div>

                {/* Grading Form */}
                <div className="rounded-lg bg-white p-6 shadow">
                  <h2 className="mb-4 text-lg font-medium text-gray-900">
                    Add Feedback & Grades
                  </h2>
                  
                  {successMessage && (
                    <div className="mb-4 rounded-md bg-green-50 p-4 text-green-800">
                      <div className="flex items-center">
                        <Check className="mr-2 h-5 w-5" />
                        {successMessage}
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Marks (out of {assignment.totalMarks})
                      </label>
                      <input
                        type="number"
                        name="marks"
                        min="0"
                        max={assignment.totalMarks}
                        value={feedbackForm.marks}
                        onChange={handleFeedbackChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Feedback & Comments
                      </label>
                      <textarea
                        name="comments"
                        rows={4}
                        value={feedbackForm.comments}
                        onChange={handleFeedbackChange}
                        className="mt-1 block w-full rounded-md border border-gray-300 py-2 px-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Provide feedback to the student about their submission..."
                      ></textarea>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveFeedback}
                        disabled={savingFeedback}
                        className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {savingFeedback ? "Saving..." : "Save Feedback"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg bg-white p-12 shadow">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-10 w-10 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No submission selected
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {submissions.length === 0
                      ? "There are no submissions for this assignment yet."
                      : "Select a submission from the list to grade it."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssignmentGrading; 