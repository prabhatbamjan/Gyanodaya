import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Clock,
  Users,
  BookOpen,
  Edit,
  AlertCircle,
  Eye,
  CheckCircle
} from "lucide-react";
import Layout from "../../components/layoutes/teacherlayout";
import authAxios from "../../utils/auth";
import Loader from "../../components/Loader";

const AssignmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalStudents: 0,
    submittedCount: 0
  });

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch assignment details
        const response = await authAxios.get(`/assignments/${id}`);
        setAssignment(response.data.data);

        // Fetch submission stats
        const statsRes = await authAxios.get(`/assignments/${id}/submissions/stats`);
        if (statsRes.data.data) {
          setStats({
            totalStudents: statsRes.data.data.totalStudents || 0,
            submittedCount: statsRes.data.data.submittedCount || 0
          });
        }
      } catch (err) {
        console.error("Failed to fetch assignment:", err);
        setError("Failed to load assignment. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
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

  // Get assignment status
  const getStatusDetails = () => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (now > dueDate) {
      return { label: "Closed", color: "gray" };
    } else if (assignment.isDraft) {
      return { label: "Draft", color: "yellow" };
    } else {
      return { label: "Active", color: "green" };
    }
  };

  const statusDetails = getStatusDetails();

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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-gray-900">View Assignment</h1>
            <div className="flex space-x-3">
              <Link
                to={`/assignments/edit/${id}`}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
              <Link
                to={`/assignments/grading/${id}`}
                className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                View Submissions
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-lg bg-white p-6 shadow">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-gray-900">{assignment.title}</h2>
                  <span
                    className={`ml-3 inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                      ${
                        statusDetails.color === "green"
                          ? "bg-green-100 text-green-800"
                          : statusDetails.color === "yellow"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {statusDetails.label}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-1 h-4 w-4" />
                    Due: {formatDate(assignment.dueDate)}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <BookOpen className="mr-1 h-4 w-4" />
                    {assignment.subjectName || "Subject"}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Users className="mr-1 h-4 w-4" />
                    {assignment.className || "Class"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{assignment.totalMarks}</div>
                <div className="text-sm text-gray-500">Total Marks</div>
              </div>
            </div>
          </div>

          {/* Description */}
          {assignment.description && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
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

          {/* Attachments */}
          {assignment.attachments && assignment.attachments.length > 0 && (
            <div className="rounded-lg bg-white p-6 shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Attachments</h3>
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

          {/* Submission Stats */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Submission Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-md bg-gray-50 p-4">
                <div className="font-medium text-gray-500">Total Students</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">{stats.totalStudents}</div>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <div className="font-medium text-gray-500">Submissions</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">{stats.submittedCount}</div>
              </div>
              <div className="rounded-md bg-gray-50 p-4">
                <div className="font-medium text-gray-500">Completion Rate</div>
                <div className="mt-1 text-2xl font-bold text-gray-900">
                  {stats.totalStudents > 0 
                    ? `${Math.round((stats.submittedCount / stats.totalStudents) * 100)}%` 
                    : "0%"}
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                  <div
                    className="h-1.5 rounded-full bg-blue-600"
                    style={{
                      width: `${stats.totalStudents > 0 
                        ? (stats.submittedCount / stats.totalStudents) * 100 
                        : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AssignmentView; 