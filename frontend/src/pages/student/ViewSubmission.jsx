import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Calendar,
  Clock,
  BookOpen,
  Check,
  AlertCircle,
  Download,
  ExternalLink,
  MessageSquare,
  Award
} from "lucide-react";
import Layout from "../../components/layoutes/studentlayout";
import authAxios, { getUserData } from "../../utils/auth";
import Loader from "../../components/Loader";

const ViewSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const userData = getUserData();

  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // Get assignment details
        const assignmentRes = await authAxios.get(`/assignments/${id}`);
        setAssignment(assignmentRes.data.data);

        // Get submission details
        const submissionRes = await authAxios.get(`/assignments/${id}/submission`);
        setSubmission(submissionRes.data.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError(err.response?.data?.message || "Failed to load submission data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = () => {
    if (!submission) return { label: "Not Submitted", color: "gray" };

    if (submission.status === "graded") {
      return { 
        label: "Graded", 
        color: "green",
        details: `${submission.marks}/${assignment.totalMarks} marks`
      };
    }

    if (submission.isLate) {
      return {
        label: "Submitted Late",
        color: "yellow",
        details: `on ${formatDate(submission.submittedAt)}`
      };
    }

    return {
      label: "Submitted",
      color: "blue",
      details: `on ${formatDate(submission.submittedAt)}`
    };
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

  if (!assignment || !submission) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-6">
          <div className="rounded-md bg-red-50 p-4 text-red-600">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              {error || "Submission not found or you don't have permission to view it."}
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

  const statusInfo = getStatusInfo();

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
          <h1 className="text-2xl font-bold text-gray-900">Assignment Submission</h1>
          <p className="mt-1 text-sm text-gray-500">
            Your submission for "{assignment.title}"
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

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Status Banner */}
          <div className="lg:col-span-3 rounded-lg p-6 shadow" 
            style={{
              background: statusInfo.color === 'green' 
                ? 'linear-gradient(to right, #d1fae5, #ecfdf5)' 
                : statusInfo.color === 'yellow'
                ? 'linear-gradient(to right, #fef3c7, #fffbeb)'
                : 'linear-gradient(to right, #dbeafe, #eff6ff)'
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between">
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
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="mr-1 h-4 w-4" />
                    Submitted: {formatDate(submission.submittedAt)}
                  </div>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex items-center">
                <div
                  className={`mr-3 flex h-10 w-10 items-center justify-center rounded-full ${
                    statusInfo.color === 'green'
                      ? 'bg-green-100 text-green-600'
                      : statusInfo.color === 'yellow'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-blue-100 text-blue-600'
                  }`}
                >
                  {statusInfo.color === 'green' ? (
                    <Award className="h-5 w-5" />
                  ) : (
                    <Check className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <div className="font-medium text-gray-900">{statusInfo.label}</div>
                  <div className="text-sm text-gray-500">{statusInfo.details}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment and Submission Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Your Submission */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Your Submission</h3>

              {submission.content && (
                <div className="mb-6">
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Your Response:</h4>
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                    {submission.content}
                  </div>
                </div>
              )}

              {submission.attachments && submission.attachments.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Your Files:</h4>
                  <ul className="space-y-2">
                    {submission.attachments.map((attachment) => (
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
                          className="ml-2 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Original Assignment */}
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assignment Details</h3>
              
              {assignment.description && (
                <div className="mb-4">
                  <h4 className="mb-1 text-sm font-medium text-gray-700">Description:</h4>
                  <p className="text-sm text-gray-600">{assignment.description}</p>
                </div>
              )}

              {assignment.instructions && (
                <div className="mb-4">
                  <h4 className="mb-1 text-sm font-medium text-gray-700">Instructions:</h4>
                  <p className="text-sm text-gray-600">{assignment.instructions}</p>
                </div>
              )}

              {assignment.attachments && assignment.attachments.length > 0 && (
                <div>
                  <h4 className="mb-2 text-sm font-medium text-gray-700">Assignment Files:</h4>
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
                          className="ml-2 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-blue-600"
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

          {/* Feedback and Grades */}
          <div className="lg:col-span-1 space-y-6">
            {/* Grade Information */}
            {submission.status === "graded" && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Grade Information</h3>
                
                <div className="mb-4 flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute text-5xl font-bold text-gray-900">
                        {submission.marks}
                      </div>
                      <svg className="h-32 w-32" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-200"
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="none"
                        />
                        <circle
                          className="text-green-500"
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="10"
                          fill="none"
                          strokeDasharray={2 * Math.PI * 40}
                          strokeDashoffset={
                            2 * Math.PI * 40 *
                            (1 - submission.marks / assignment.totalMarks)
                          }
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      out of {assignment.totalMarks} marks
                    </p>
                  </div>
                </div>

                {submission.gradedAt && (
                  <div className="text-center text-sm text-gray-500">
                    Graded on {formatDate(submission.gradedAt)}
                  </div>
                )}
              </div>
            )}

            {/* Feedback */}
            {submission.feedback && (
              <div className="rounded-lg bg-white p-6 shadow">
                <h3 className="flex items-center text-lg font-medium text-gray-900 mb-4">
                  <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
                  Teacher Feedback
                </h3>
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800">
                  {submission.feedback}
                </div>
              </div>
            )}

            {/* Status Box for Submitted but Not Graded */}
            {submission.status !== "graded" && (
              <div className="rounded-lg bg-white p-6 shadow">
                <div className="text-center">
                  <Check className="mx-auto h-12 w-12 text-blue-500" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">Submission Received</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your assignment has been submitted and is pending review from your teacher.
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

export default ViewSubmission; 