import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  FileText,
  User,
  Calendar,
  Clock,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../components/layoutes/teacherlayout";
import authAxios from "../utils/auth";
import Loader from "../components/Loader";

const Submissions = () => {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchData();
  }, [page]);

  // When filters change, reset to page 1
  useEffect(() => {
    setPage(1);
    fetchData();
  }, [classFilter, subjectFilter, statusFilter, searchTerm, dateRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare query parameters
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", 10);
      
      if (searchTerm) params.append("search", searchTerm);
      if (classFilter) params.append("class", classFilter);
      if (subjectFilter) params.append("subject", subjectFilter);
      if (statusFilter) params.append("status", statusFilter);
      if (dateRange.from) params.append("fromDate", dateRange.from);
      if (dateRange.to) params.append("toDate", dateRange.to);

      // Fetch submissions
      const submissionsRes = await authAxios.get(`/submissions/teacher?${params}`);
      
      setSubmissions(submissionsRes.data.data || []);
      setTotalPages(submissionsRes.data.totalPages || 1);

      // Fetch classes and subjects for filters
      const [classesRes, subjectsRes] = await Promise.all([
        authAxios.get("/classes/teacher"),
        authAxios.get("/subjects/teacher")
      ]);

      setClasses(classesRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      setError("Failed to load submissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setClassFilter("");
    setSubjectFilter("");
    setStatusFilter("");
    setDateRange({ from: "", to: "" });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchData();
  };

  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Student Submissions</h1>
          <p className="mt-1 text-sm text-gray-500">View and grade submissions from your students</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <form onSubmit={handleSearch} className="flex mb-4 md:mb-0">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search student or assignment..."
                />
              </div>
              <button
                type="submit"
                className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Search
              </button>
            </form>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md px-3 py-2"
            >
              <Filter className="mr-2 h-4 w-4" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Class
                  </label>
                  <select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Classes</option>
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    value={subjectFilter}
                    onChange={(e) => setSubjectFilter(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject._id} value={subject._id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="submitted">Submitted (Not Graded)</option>
                    <option value="graded">Graded</option>
                    <option value="late">Late Submissions</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md px-3 py-2"
                >
                  Clear Filters
                </button>
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
        ) : submissions.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No submissions found</h3>
            <p className="text-gray-500">
              There are no submissions matching your search criteria.
            </p>
          </div>
        ) : (
          <>
            {/* Submissions Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Assignment
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marks
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {submissions.map((submission) => (
                      <tr key={submission._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold">
                              {submission.student?.firstName?.charAt(0) || "S"}
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {submission.student?.firstName} {submission.student?.lastName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {submission.student?.class?.name || "No class"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-medium">
                            {submission.assignment?.title || "Unknown assignment"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {submission.assignment?.subjectId?.name || "No subject"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(submission.submittedAt || submission.createdAt)}
                          </div>
                          {submission.lateSubmission && (
                            <span className="px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                              Late
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            submission.status === 'graded' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {submission.marks !== undefined ? (
                            <div className="text-sm text-gray-900">
                              {submission.marks} / {submission.assignment?.totalMarks || '?'}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">Not graded</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link 
                            to={`/submissions/${submission._id}`} 
                            className="text-blue-600 hover:text-blue-900"
                          >
                            {submission.status === 'graded' ? 'View Details' : 'Grade'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

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
          </>
        )}
      </div>
    </Layout>
  );
};

export default Submissions; 