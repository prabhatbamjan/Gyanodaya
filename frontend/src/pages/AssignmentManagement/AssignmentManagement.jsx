import React, { useState, useEffect } from "react";
import {
  Plus,
  FileText,
  Calendar,
  Clock,
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle,
  Download,
  BookOpen,
  Eye
} from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "../../components/layoutes/teacherlayout";
import authAxios, { getUserData } from "../../utils/auth";
import Loader from "../../components/Loader";

const AssignmentManagement = () => {
  const userData = getUserData();
  
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [teacherTimetables, setTeacherTimetables] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState(null);
  const [deleteAssignmentTitle, setDeleteAssignmentTitle] = useState("");

  useEffect(() => {
    fetchData();
  }, [page, activeTab, classFilter, subjectFilter, statusFilter, searchTerm, dateRange]);
  
  // Update subjects when class filter changes
  useEffect(() => {
    if (classFilter) {
      updateSubjectsForClass(classFilter);
    } else {
      setSubjects(allSubjects);
    }
  }, [classFilter, teacherTimetables, allSubjects]);

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
      if (dateRange.from) params.append("fromDate", dateRange.from);
      if (dateRange.to) params.append("toDate", dateRange.to);
      
      // Status based on active tab or selected filter
      const status = statusFilter || (activeTab !== "all" ? activeTab : "");
      if (status) params.append("status", status);

      // Fetch assignments
      const assignmentsRes = await authAxios.get(`/assignments/teacher?${params}`);
      console.log(assignmentsRes.data.data);
      
      setAssignments(assignmentsRes.data.data || []);
      setTotalPages(assignmentsRes.data.totalPages || 1);

      // Fetch classes, subjects and timetables for the teacher
      const [classesRes, subjectsRes, timetablesRes] = await Promise.all([
        authAxios.get("/classes"),
        authAxios.get("/subjects"),
        authAxios.get(`/timetables/teacher/class/${userData.id}`)
      ]);

      const allClasses = classesRes.data.data || [];
      const subjectsData = subjectsRes.data.data || [];
      const teacherData = timetablesRes.data.data || [];

      setTeacherTimetables(teacherData);
      setAllSubjects(subjectsData);

      // Filter classes that teacher is assigned to
      const classIds = new Set();
      teacherData.forEach(timetable => {
        if (timetable.class?._id) classIds.add(timetable.class._id);
      });

      const filteredClasses = allClasses.filter(cls => classIds.has(cls._id));
      setClasses(filteredClasses);

      // Set subjects based on current class filter or all subjects if no filter
      if (classFilter) {
        updateSubjectsForClass(classFilter);
      } else {
        setSubjects(subjectsData);
      }
    } catch (err) {
      console.error("Failed to fetch assignments:", err);
      setError("Failed to load assignments. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateSubjectsForClass = (classId) => {
    // First try to find subjects through timetable
    const classSubjects = teacherTimetables
      .filter(t => t.class?._id === classId)
      .flatMap(t => t.periods || [])
      .map(p => p.subject)
      .filter((subj, index, self) => 
        subj && self.findIndex(s => s?._id === subj?._id) === index
      );

    // If no subjects found through timetable, try using all subjects that match the class
    if (classSubjects.length === 0) {
      const filteredSubjects = allSubjects.filter(
        subject => subject.class === classId || subject.class?._id === classId
      );
      setSubjects(filteredSubjects);
    } else {
      setSubjects(classSubjects);
    }

    // Reset subject filter if previously selected subject is not available for the new class
    if (subjectFilter) {
      const subjectStillValid = classSubjects.some(
        s => s?._id === subjectFilter
      ) || allSubjects.some(
        s => (s.class === classId || s.class?._id === classId) && s._id === subjectFilter
      );
      
      if (!subjectStillValid) {
        setSubjectFilter("");
      }
    }
  };

  const handleDeleteClick = (assignment) => {
    setDeleteAssignmentId(assignment._id);
    setDeleteAssignmentTitle(assignment.title);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      await authAxios.delete(`/assignments/${deleteAssignmentId}`);
      setAssignments(assignments.filter(a => a._id !== deleteAssignmentId));
      setShowDeleteModal(false);
      setDeleteAssignmentId(null);
      setDeleteAssignmentTitle("");
    } catch (err) {
      console.error("Failed to delete assignment:", err);
      setError("Failed to delete assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSubmissions = async (assignmentId) => {
    try {
      setLoading(true);
      // Ideally this would initiate a file download through the browser
      const response = await authAxios.get(`/assignments/${assignmentId}/submissions/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `submissions-${assignmentId}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Failed to download submissions:", err);
      setError("Failed to download submissions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setClassFilter("");
    setSubjectFilter("");
    setStatusFilter("");
    setDateRange({ from: "", to: "" });
    setPage(1);
  };

  // Helper to format due date with time
  const formatDueDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status label and color
  const getStatusDetails = (assignment) => {
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

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
            <p className="mt-1 text-sm text-gray-500">Create, manage, and grade student assignments</p>
          </div>
          <div className="mt-4 lg:mt-0">
            <Link
              to="/assignments/create"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <ul className="flex space-x-8">
            <li>
              <button
                className={`pb-4 text-sm font-medium ${
                  activeTab === "all"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab("all");
                  setStatusFilter("");
                  setPage(1);
                }}
              >
                All Assignments
              </button>
            </li>
            <li>
              <button
                className={`pb-4 text-sm font-medium ${
                  activeTab === "active"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab("active");
                  setStatusFilter("active");
                  setPage(1);
                }}
              >
                Active
              </button>
            </li>
            <li>
              <button
                className={`pb-4 text-sm font-medium ${
                  activeTab === "draft"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab("draft");
                  setStatusFilter("draft");
                  setPage(1);
                }}
              >
                Drafts
              </button>
            </li>
            <li>
              <button
                className={`pb-4 text-sm font-medium ${
                  activeTab === "closed"
                    ? "border-b-2 border-blue-600 text-blue-600"
                    : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700"
                }`}
                onClick={() => {
                  setActiveTab("closed");
                  setStatusFilter("closed");
                  setPage(1);
                }}
              >
                Closed
              </button>
            </li>
          </ul>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-lg bg-white p-4 shadow">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
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
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="block w-full rounded-md border border-gray-200 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.section ? `- ${c.section}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="block w-full rounded-md border border-gray-200 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                disabled={classFilter && subjects.length === 0}
              >
                <option value="">All Subjects</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
                {subjects.length === 0 && classFilter && (
                  <option value="" disabled>
                    No subjects available for this class
                  </option>
                )}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange({ ...dateRange, from: e.target.value })
                }
                className="rounded-md border border-gray-200 py-1 px-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="From"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange({ ...dateRange, to: e.target.value })
                }
                className="rounded-md border border-gray-200 py-1 px-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="To"
              />
            </div>
            <button
              onClick={resetFilters}
              className="rounded-md border border-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-50"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader />
          </div>
        ) : assignments.length === 0 ? (
          <div className="mt-12 flex flex-col items-center">
            <FileText className="h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm || classFilter || subjectFilter || dateRange.from
                ? "Try adjusting your filters to see more results"
                : "Get started by creating your first assignment"}
            </p>
            <Link
              to="/assignments/create"
              className="mt-4 inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Assignment
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Class & Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Submissions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {assignments.map((assignment) => {
                    const statusDetails = getStatusDetails(assignment);
                    return (
                      <tr key={assignment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FileText className="mr-3 h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium text-gray-900">
                                {assignment.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {assignment.description?.substring(0, 60)}
                                {assignment.description?.length > 60 ? "..." : ""}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                            Class {assignment.classId.name} -{assignment.classId.section}
                            </span>
                            <span className="text-sm text-gray-500">
                              {assignment.subjectId.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900">
                              {new Date(assignment.dueDate).toLocaleDateString()}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(assignment.dueDate).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {assignment.submittedCount} / {assignment.totalStudents}
                          </div>
                          <div className="mt-1 h-1.5 w-full rounded-full bg-gray-200">
                            <div
                              className="h-1.5 rounded-full bg-blue-600"
                              style={{
                                width: `${
                                  assignment.totalStudents
                                    ? (assignment.submittedCount / assignment.totalStudents) * 100
                                    : 0
                                }%`,
                              }}
                            ></div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
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
                        </td>
                        <td className="relative px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            
                            <Link
                              to={`/assignments/edit/${assignment._id}`}
                              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                              title="Edit Assignment"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/assignments/grading/${assignment._id}`}
                              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-blue-600"
                              title="View Submissions"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(assignment)}
                              className="rounded p-1 text-gray-500 hover:bg-gray-100 hover:text-red-600"
                              title="Delete Assignment"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(page - 1) * 10 + 1}</span> to{" "}
                  <span className="font-medium">
                    {Math.min(page * 10, (page - 1) * 10 + assignments.length)}
                  </span>{" "}
                  of <span className="font-medium">{totalPages * 10}</span> assignments
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className={`rounded-md border px-3 py-1 text-sm ${
                      page === 1
                        ? "cursor-not-allowed border-gray-200 text-gray-300"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className={`rounded-md border px-3 py-1 text-sm ${
                      page === totalPages
                        ? "cursor-not-allowed border-gray-200 text-gray-300"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="w-full max-w-md rounded-lg bg-white p-6">
              <h3 className="text-lg font-medium text-gray-900">Delete Assignment</h3>
              <p className="mt-2 text-gray-500">
                Are you sure you want to delete "{deleteAssignmentTitle}"? This action cannot be undone.
              </p>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteAssignmentId(null);
                    setDeleteAssignmentTitle("");
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AssignmentManagement; 