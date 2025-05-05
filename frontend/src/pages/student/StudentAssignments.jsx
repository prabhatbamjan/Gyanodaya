import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Calendar,
  Clock,
  BookOpen,
  Upload,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Layout from "../../components/layoutes/studentlayout";
import authAxios, { getUserData } from "../../utils/auth";
import Loader from "../../components/Loader";

const StudentAssignments = () => {
  const navigate = useNavigate();
  const userData = getUserData();
  
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [expandedAssignment, setExpandedAssignment] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, [subjectFilter, statusFilter]);

  const fetchAssignments = async () => {
   
    try {
      setLoading(true);
      setError("");

      // Build query params
      const params = new URLSearchParams();
      if (subjectFilter) params.append("subject", subjectFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);

      // Fetch assignments for student's class
      const studentid= await authAxios.get(`/students/${userData.id}`);

      const classid =studentid.data.data.student.class._id
     
      const assignmentsRes = await authAxios.get(`assignments/class/${classid}`);
      const assignmentsData = assignmentsRes.data.data || [];
      setAssignments(assignmentsData);

      // Fetch subjects for filter
      const subjectsRes = await authAxios.get(`/classes/${classid}`);
      
      setSubjects(subjectsRes.data.data.subjects || []);

      // Fetch submission status for each assignment
      const submissionsData = {};
      for (const assignment of assignmentsData) {
        try {
          const submissionRes = await authAxios.get(`/assignments/${assignment._id}/submission`);
          console.log(submissionRes.data.data)
          submissionsData[assignment._id] = submissionRes.data.data;
        } catch (err) {
          console.log(`No submission for assignment ${assignment._id}`);
          submissionsData[assignment._id] = null;
        }
      }
      setSubmissions(submissionsData);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setError("Failed to load assignments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAssignments();
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSubjectFilter("");
    setStatusFilter("");
    fetchAssignments();
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

  const getSubmissionStatus = (assignment) => {
    const submission = submissions[assignment._id];
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isPastDue = now > dueDate;

    if (!submission) {
      return {
        status: isPastDue ? "Overdue" : "Not Submitted",
        color: isPastDue ? "red" : "gray",
        showSubmit: !isPastDue
      };
    }

    if (submission.status === "graded") {
      return {
        status: `Graded: ${submission.marks}/${assignment.totalMarks}`,
        color: "green",
        showSubmit: false
      };
    }

    if (submission.isLate) {
      return {
        status: "Submitted Late",
        color: "yellow",
        showSubmit: false
      };
    }

    return {
      status: "Submitted",
      color: "blue",
      showSubmit: false
    };
  };

  const toggleAssignmentExpand = (assignmentId) => {
    if (expandedAssignment === assignmentId) {
      setExpandedAssignment(null);
    } else {
      setExpandedAssignment(assignmentId);
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Assignments </h1>
          <p className="mt-1 text-sm text-gray-500">
            View and submit your class assignments
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <form onSubmit={handleSearch} className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search assignments"
                  className="block w-full rounded-md border border-gray-200 pl-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="block w-full rounded-md border border-gray-200 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>{subject.name}</option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full rounded-md border border-gray-200 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="pending">Not Submitted</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
              </select>
            </div>

            <div className="md:col-span-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Reset
              </button>
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
            <div className="flex items-center">
              <AlertCircle className="mr-2 h-5 w-5" />
              {error}
            </div>
          </div>
        )}

        {/* Assignments List */}
        {assignments.length === 0 ? (
          <div className="mt-12 flex flex-col items-center rounded-lg bg-white p-8 shadow">
            <FileText className="h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm || subjectFilter || statusFilter
                ? "Try adjusting your filters to see more results"
                : "There are no assignments for your class yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((assignment) => {
              const submissionStatus = getSubmissionStatus(assignment);
              const isExpanded = expandedAssignment === assignment._id;

              return (
                <div
                  key={assignment._id}
                  className="overflow-hidden rounded-lg bg-white shadow transition-all duration-200"
                >
                  <div
                    className="flex cursor-pointer items-center justify-between p-4"
                    onClick={() => toggleAssignmentExpand(assignment._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          submissionStatus.color === "green"
                            ? "bg-green-100 text-green-600"
                            : submissionStatus.color === "yellow"
                            ? "bg-yellow-100 text-yellow-600"
                            : submissionStatus.color === "blue"
                            ? "bg-blue-100 text-blue-600"
                            : submissionStatus.color === "red"
                            ? "bg-red-100 text-red-600"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{assignment.title}</h3>
                        <div className="mt-0.5 flex items-center text-xs text-gray-500">
                          <BookOpen className="mr-1 h-3.5 w-3.5" />
                          <span>{assignment.subjectId?.name || 'Subject'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            submissionStatus.color === "green"
                              ? "bg-green-100 text-green-800"
                              : submissionStatus.color === "yellow"
                              ? "bg-yellow-100 text-yellow-800"
                              : submissionStatus.color === "blue"
                              ? "bg-blue-100 text-blue-800"
                              : submissionStatus.color === "red"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {submissionStatus.status}
                        </div>
                        <div className="mt-1 text-xs text-gray-500">
                          Due: {formatDate(assignment.dueDate)}
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded View */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4">
                      {/* Description */}
                      {assignment.description && (
                        <div className="mb-4">
                          <h4 className="mb-1 text-sm font-medium text-gray-700">Description:</h4>
                          <p className="text-sm text-gray-600">{assignment.description}</p>
                        </div>
                      )}

                      {/* Instructions */}
                      {assignment.instructions && (
                        <div className="mb-4">
                          <h4 className="mb-1 text-sm font-medium text-gray-700">Instructions:</h4>
                          <p className="text-sm text-gray-600">{assignment.instructions}</p>
                        </div>
                      )}

                      {/* Attachments */}
                      {assignment.attachments && assignment.attachments.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-sm font-medium text-gray-700">Attachments:</h4>
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
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Submission Status */}
                      <div className="mb-4 flex items-center">
                        <div className="mr-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700">
                          <span className="font-medium">Total Marks:</span> {assignment.totalMarks}
                        </div>
                        {submissions[assignment._id] && (
                          <div className="mr-2 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700">
                            <span className="font-medium">Your Submission:</span>{" "}
                            {formatDate(submissions[assignment._id].submittedAt)}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end space-x-2">
                        {submissionStatus.showSubmit && (
                          <Link
                            to={`/student/assignments/submit/${assignment._id}`}
                            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Submit Assignment
                          </Link>
                        )}

                        {!submissionStatus.showSubmit && (
                          <Link
                            to={`/student/assignments/submit/${assignment._id}`}
                            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            View Your Submission
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentAssignments;