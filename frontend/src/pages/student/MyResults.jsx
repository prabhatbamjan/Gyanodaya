import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Calendar,
  ArrowUpDown,
  ChevronDown,
  FileText,
  BookOpen,
  Award,
  Download,
  AlertCircle,
  Clock,
} from "lucide-react";
import Layout from "../../components/layoutes/studentlayout";
import authAxios, { getUserData } from "../../utils/auth";

const MyResults = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExamType, setSelectedExamType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const userData = getUserData();
  
  const navigate = useNavigate();

  // Fetch exams data
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        const response1 = await authAxios.get(`students/${userData.id}`);
       
        const classId = response1.data.data.student.class._id; 
        console.log("Class ID:", classId);
         
        const getExamByClass = await authAxios.get(`exams/class/${classId}`);
 
        console.log("Exams by class:", getExamByClass.data);
         
        if (getExamByClass.data.success) {
          setExams(getExamByClass.data.data);
          setFilteredExams(getExamByClass.data.data);
        } else {
          setError("Failed to fetch exam data");
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching exams:", err);
        setError(err.response?.data?.message || "An error occurred while fetching your exams");
        setLoading(false);
      }
    };
    
    fetchExams();
  },[]);

  // Filter exams
  useEffect(() => {
    let filtered = [...exams];
    
    if (searchTerm) {
      filtered = filtered.filter(
        (exam) =>
          (exam.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (exam.type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
          (exam.academicYear || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedExamType) {
      filtered = filtered.filter(
        (exam) => exam.type === selectedExamType
      );
    }
    
    if (selectedStatus) {
      filtered = filtered.filter(
        (exam) => exam.status === selectedStatus
      );
    }
    
    if (selectedAcademicYear) {
      filtered = filtered.filter(
        (exam) => exam.academicYear === selectedAcademicYear
      );
    }
    
    setFilteredExams(filtered);
  }, [exams, searchTerm, selectedExamType, selectedStatus, selectedAcademicYear]);

  // Extract unique values for filters
  const examTypes = [...new Set(exams.map((exam) => exam.type).filter(Boolean))];
  const statuses = [...new Set(exams.map((exam) => exam.status).filter(Boolean))];
  const academicYears = [...new Set(exams.map((exam) => exam.academicYear).filter(Boolean))];

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedExamType("");
    setSelectedStatus("");
    setSelectedAcademicYear("");
  };

  // View exam details
  const viewExamDetail = (exam) => {
    setSelectedExam(exam);
    setShowModal(true);
  };

  // Calculate status color
  const getStatusColor = (status) => {
    switch (status) {
      case "Upcoming":
        return "bg-blue-100 text-blue-800";
      case "Ongoing":
        return "bg-green-100 text-green-800";
      case "Completed":
        return "bg-purple-100 text-purple-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">My Examinations</h1>
            <p className="text-gray-600">
              View your scheduled exams and check results when available
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-lg shadow mb-6 p-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              {/* Search */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Search by exam name, type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filter Button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                  <ChevronDown
                    className={`h-4 w-4 transform transition-transform ${
                      isFilterOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {(selectedExamType || selectedStatus || selectedAcademicYear) && (
                  <button
                    onClick={resetFilters}
                    className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Filter Panel */}
            {isFilterOpen && (
              <div className="mt-4 p-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Exam Type Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Exam Type
                    </label>
                    <select
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={selectedExamType}
                      onChange={(e) => setSelectedExamType(e.target.value)}
                    >
                      <option value="">All Exam Types</option>
                      {examTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">All Statuses</option>
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Academic Year Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Academic Year
                    </label>
                    <select
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      value={selectedAcademicYear}
                      onChange={(e) => setSelectedAcademicYear(e.target.value)}
                    >
                      <option value="">All Academic Years</option>
                      {academicYears.map((year) => (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Exams List */}
          <div className="bg-white rounded-lg shadow">
            {loading ? (
              <div className="p-8 flex justify-center items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-gray-700">{error}</p>
                <button
                  onClick={() => navigate("/student-dashboard")}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : filteredExams.length === 0 ? (
              <div className="p-8 text-center">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-700">No exams found</p>
                {(searchTerm || selectedExamType || selectedStatus || selectedAcademicYear) && (
                  <button
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          Exam Name
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          Type
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          Dates
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center">
                          Status
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExams.map((exam) => (
                      <tr
                        key={exam._id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => viewExamDetail(exam)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
                            <div className="text-sm font-medium text-gray-900">
                              {exam.name || "Unnamed Exam"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {exam.type || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {formatDate(exam.startDate)} - {formatDate(exam.endDate)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                            {exam.status || "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {exam.status === 'Completed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/student/exam-results/${exam._id}`);
                                }}
                                className="text-blue-600 hover:text-blue-900 px-2 py-1 border border-blue-300 rounded-md"
                              >
                                View Results
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Exam Detail Modal */}
        {showModal && selectedExam && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">
                    Exam Details
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    &times;
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">
                        {selectedExam.name || "Unnamed Exam"}
                      </h3>
                      <p className="text-gray-600">
                        Type: {selectedExam.type || "N/A"}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Academic Year: {selectedExam.academicYear || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedExam.status)}`}>
                        {selectedExam.status || "Unknown Status"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Exam Schedule */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Exam Schedule</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">Start Date</div>
                        <div className="text-sm text-gray-600">{formatDate(selectedExam.startDate)}</div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-800">End Date</div>
                        <div className="text-sm text-gray-600">{formatDate(selectedExam.endDate)}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Exam Description */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Description</h4>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">
                      {selectedExam.description || "No description provided"}
                    </p>
                  </div>
                </div>

                {/* Subjects */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Subjects</h4>
                  {selectedExam.classSubjects && selectedExam.classSubjects.length > 0 && 
                   selectedExam.classSubjects[0].subjects && 
                   selectedExam.classSubjects[0].subjects.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedExam.classSubjects[0].subjects.map((subject, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg flex items-center">
                          <BookOpen className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700">
                            {subject.name || `Subject ${index + 1}`}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">No subjects listed</div>
                  )}
                </div>

                {/* Marks Details */}
                <div className="mb-6">
                  <h4 className="font-medium text-gray-700 mb-2">Marks Information</h4>
                  <div className="bg-gray-50 p-4 rounded-lg flex flex-wrap gap-6">
                    <div>
                      <div className="text-xs text-gray-500">Total Marks</div>
                      <div className="text-lg font-semibold text-gray-800">{selectedExam.totalMarks || "N/A"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Passing Marks</div>
                      <div className="text-lg font-semibold text-gray-800">{selectedExam.passingMarks || "N/A"}</div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {selectedExam.status === 'Completed' && (
                    <button
                      onClick={() => navigate(`/student/exam-results/${selectedExam._id}`)}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      View Results
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyResults; 