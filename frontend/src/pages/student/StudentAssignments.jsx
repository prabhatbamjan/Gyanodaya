import React, { useState, useEffect } from "react";
import {
  FileText,
  Calendar,
  Clock,
  Search,
  Filter,
  AlertCircle,
  Check,
  Send,
  CheckCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../../components/layoutes/layout";
import authAxios from "../../utils/auth";
import Loader from "../../components/Loader";

const StudentAssignments = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [page, activeTab]);

  // When filters change, reset to page 1
  useEffect(() => {
    setPage(1);
    fetchData();
  }, [subjectFilter, searchTerm, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare query parameters
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 10);
      params.append("status", activeTab);
      
      if (searchTerm) params.append("search", searchTerm);
      if (subjectFilter) params.append("subject", subjectFilter);
      if (dateRange.from) params.append("fromDate", dateRange.from);
      if (dateRange.to) params.append("toDate", dateRange.to);

      // Fetch assignments
      const assignmentsRes = await authAxios.get(`/assignments/student?${params}`);
      
      setAssignments(assignmentsRes.data.data || []);
      setTotalPages(assignmentsRes.data.totalPages || 1);

      // Fetch subjects for filters
      const subjectsRes = await authAxios.get("/subjects/student");
      setSubjects(subjectsRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setError("Failed to load assignments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSubjectFilter("");
    setDateRange({ from: "", to: "" });
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Overdue";
    if (diffDays === 0) return "Due today";
    if (diffDays === 1) return "Due tomorrow";
    return `${diffDays} days remaining`;
  };

  const getStatusBadge = (assignment) => {
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    
    if (assignment.status === 'graded') {
      return {
        label: "Graded",
        color: "bg-green-100 text-green-800"
      };
    } else if (assignment.status === 'submitted') {
      return {
        label: "Submitted",
        color: "bg-blue-100 text-blue-800"
      };
    } else if (now > dueDate) {
      return {
        label: "Overdue",
        color: "bg-red-100 text-red-800"
      };
    } else {
      return {
        label: "Pending",
        color: "bg-yellow-100 text-yellow-800"
      };
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
          <p className="mt-1 text-sm text-gray-500">View and submit your assignments</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <ul className="flex space-x-8">
            <li>
              <button
                className={`pb-4 text-sm font-medium ${
                  activeTab === "pending"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab("pending");
                  setPage(1);
                }}
              >
                Pending
              </button>
            </li>
            <li>
              <button
                className={`pb-4 text-sm font-medium ${
                  activeTab === "submitted"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab("submitted");
                  setPage(1);
                }}
              >
                Submitted
              </button>
            </li>
            <li>
              <button
                className={`pb-4 text-sm font-medium ${
                  activeTab === "graded"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab("graded");
                  setPage(1);
                }}
              >
                Graded
              </button>
            </li>
          </ul>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search assignments..."
              />
            </div>
            
            <div className="mt-3 md:mt-0 flex items-center">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="mr-2 block w-full md:w-auto border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md px-3 py-2"
              >
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? "Hide Date Filter" : "Date Filter"}
              </button>
            </div>
          </div>

          {/* Date Filter */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="w-full md:w-auto">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="self-end w-full md:w-auto md:ml-auto">
                  <button
                    onClick={clearFilters}
                    className="w-full md:w-auto mt-6 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md px-4 py-2"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content Area */}
        {error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800 mb-6">
            <div className="flex">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : assignments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No {activeTab} assignments found</h3>
            <p className="text-gray-500">
              {activeTab === "pending" 
                ? "You don't have any pending assignments at the moment." 
                : activeTab === "submitted" 
                ? "You haven't submitted any assignments yet."
                : "You don't have any graded assignments yet."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assignments.map((assignment) => {
              const status = getStatusBadge(assignment);
              return (
                <div key={assignment._id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                      <span className="text-sm text-gray-500">
                        {assignment.totalMarks} marks
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {assignment.title}
                    </h3>
                    
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <span>{assignment.subjectId?.name || 'No subject'}</span>
                      <span className="mx-2">•</span>
                      <span>{assignment.classId?.name || 'No class'}</span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm">
                        <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">
                          Due: {formatDate(assignment.dueDate)}
                        </span>
                      </div>
                      
                      {activeTab === 'pending' && (
                        <div className="flex items-center text-sm">
                          <Clock className="mr-2 h-4 w-4 text-gray-400" />
                          <span className={`${
                            getDaysRemaining(assignment.dueDate) === 'Overdue' 
                              ? 'text-red-600 font-medium' 
                              : getDaysRemaining(assignment.dueDate) === 'Due today' 
                              ? 'text-orange-600 font-medium'
                              : 'text-gray-600'
                          }`}>
                            {getDaysRemaining(assignment.dueDate)}
                          </span>
                        </div>
                      )}
                      
                      {activeTab === 'graded' && assignment.submission && (
                        <div className="flex items-center text-sm">
                          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          <span className="text-gray-600 font-medium">
                            Marks: {assignment.submission.marks} / {assignment.totalMarks}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                      {assignment.description}
                    </p>
                  </div>
                  
                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100">
                    <Link
                      to={`/assignments/submit/${assignment._id}`}
                      className={`flex items-center justify-center w-full rounded-md py-2 px-4 text-sm font-medium ${
                        activeTab === 'pending'
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : activeTab === 'submitted'
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-300'
                          : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-300'
                      }`}
                    >
                      {activeTab === 'pending' ? (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Submit Assignment
                        </>
                      ) : activeTab === 'submitted' ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          View Submission
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          View Feedback
                        </>
                      )}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page <span className="font-medium">{page}</span> of{" "}
              <span className="font-medium">{totalPages}</span>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                  page === 1
                    ? "border-gray-300 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                  page === totalPages
                    ? "border-gray-300 text-gray-300 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default StudentAssignments; 