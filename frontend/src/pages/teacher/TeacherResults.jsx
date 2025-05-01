import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Download,
  BookOpen,
  Users,
  Calendar,
  List
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layoutes/teacherlayout';
import authAxios from '../../utils/auth';
import { getUserData } from '../../utils/auth';
import Loader from '../../components/Loader';

const TeacherResults = () => {
  const [activeTab, setActiveTab] = useState('entered');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const userData = getUserData();
  
  const itemsPerPage = 10;

  useEffect(() => {
    fetchClassesAndSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchResults();
    }
  }, [activeTab, selectedClass, selectedSubject, selectedTerm, selectedExamType, currentPage]);

  const fetchClassesAndSubjects = async () => {
    try {
      setLoading(true);
      // Assuming the teacher ID is available in the user data
      const teacherId = userData.id;
      
      // Fetch classes assigned to the teacher
      const classesResponse = await authAxios.get(`/teachers/${teacherId}`);
      if (classesResponse.data.success) {
        const classIds = classesResponse.data.data.class || [];
        const classesData = await authAxios.get('/classes');
        
        // Filter classes assigned to the teacher
        const teacherClasses = classesData.data.data.filter(
          cls => classIds.includes(cls._id)
        );
        
        setClasses(teacherClasses);
      }
      
      // Fetch subjects taught by the teacher
      const subjectsResponse = await authAxios.get('/subjects/teacher');
      if (subjectsResponse.data.success) {
        setSubjects(subjectsResponse.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching teacher data:', err);
      setError('Failed to load classes and subjects. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedClass) params.append('classId', selectedClass);
      if (selectedSubject) params.append('subjectId', selectedSubject);
      if (selectedTerm) params.append('term', selectedTerm);
      if (selectedExamType) params.append('examType', selectedExamType);
      
      // Add status parameter based on active tab
      if (activeTab === 'entered') {
        params.append('status', 'Draft');
      } else if (activeTab === 'submitted') {
        params.append('status', 'Submitted');
      } else if (activeTab === 'published') {
        params.append('status', 'Published');
      }
      
      // Fetch results for teacher
      const teacherId = userData.id;
      const resultsResponse = await authAxios.get(`/results/teacher/${teacherId}?${params}`);
      
      if (resultsResponse.data.success) {
        setResults(resultsResponse.data.data.results || []);
        
        // Calculate total pages
        const total = resultsResponse.data.results || 0;
        setTotalPages(Math.ceil(total / itemsPerPage));
      } else {
        setError('Failed to load results');
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    if (!selectedClass) return;
    
    try {
      setStatsLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedClass) params.append('classId', selectedClass);
      if (selectedSubject) params.append('subjectId', selectedSubject);
      if (selectedTerm) params.append('term', selectedTerm);
      if (selectedExamType) params.append('examType', selectedExamType);
      
      const statsResponse = await authAxios.get(`/results/statistics?${params}`);
      
      if (statsResponse.data.success) {
        setStatistics(statsResponse.data.data.statistics);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleFilterChange = () => {
    setCurrentPage(1);
    fetchResults();
    fetchStatistics();
  };

  const filteredResults = results.filter(result => {
    const studentName = `${result.student?.firstName || ''} ${result.student?.lastName || ''}`.toLowerCase();
    const subjectName = result.subject?.name?.toLowerCase() || '';
    
    return studentName.includes(searchTerm.toLowerCase()) || 
           subjectName.includes(searchTerm.toLowerCase());
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  
  const getGradeColor = (grade) => {
    switch(grade) {
      case 'A+': return 'bg-green-100 text-green-800';
      case 'A': return 'bg-green-100 text-green-800';
      case 'B+': return 'bg-blue-100 text-blue-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C+': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'F': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Submitted': return 'bg-blue-100 text-blue-800';
      case 'Published': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student Results</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and view student assessment results
            </p>
          </div>
          
          <div className="mt-4 md:mt-0">
            <Link
              to="/teacher-results/add"
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Result
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-wrap gap-4">
              <div className="w-full md:w-auto md:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-auto md:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((subject) => (
                    <option key={subject._id} value={subject._id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="w-full md:w-auto md:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Term
                </label>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Terms</option>
                  <option value="First Term">First Term</option>
                  <option value="Second Term">Second Term</option>
                  <option value="Final Term">Final Term</option>
                </select>
              </div>
              
              <div className="w-full md:w-auto md:flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Type
                </label>
                <select
                  value={selectedExamType}
                  onChange={(e) => setSelectedExamType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Exams</option>
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Project">Project</option>
                  <option value="Quiz">Quiz</option>
                </select>
              </div>
              
              <div className="w-full md:w-auto md:flex-1 flex items-end">
                <button
                  onClick={handleFilterChange}
                  className="w-full inline-flex justify-center items-center rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filters
                </button>
              </div>
            </div>
            
            <div className="mt-4 flex">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student or subject..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('entered')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'entered'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Entered
              </button>
              <button
                onClick={() => setActiveTab('submitted')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'submitted'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Submitted
              </button>
              <button
                onClick={() => setActiveTab('published')}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'published'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Published
              </button>
            </nav>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader />
            </div>
          ) : currentItems.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No results found. {selectedClass ? '' : 'Please select a class to view results.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Marks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentItems.map((result) => (
                    <tr key={result._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {result.student ? `${result.student.firstName} ${result.student.lastName}` : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {result.class?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.subject?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.examType}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.term} • {result.academicYear}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {result.marksObtained} / {result.totalMarks}
                        </div>
                        <div className="text-xs text-gray-500">
                          {result.percentage?.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(result.grade)}`}>
                          {result.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link to={`/teacher-results/view/${result._id}`} className="text-blue-600 hover:text-blue-900">
                            <FileText size={18} />
                          </Link>
                          {result.status !== 'Published' && (
                            <Link to={`/teacher-results/edit/${result._id}`} className="text-yellow-600 hover:text-yellow-900">
                              <Edit size={18} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredResults.length > itemsPerPage && (
            <div className="px-6 py-4 flex items-center justify-between border-t">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstItem + 1} to{' '}
                {Math.min(indexOfLastItem, filteredResults.length)} of{' '}
                {filteredResults.length} results
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:text-gray-400"
                >
                  <ChevronLeft />
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`px-3 py-1 border rounded ${
                      currentPage === idx + 1 ? 'bg-blue-100 text-blue-700' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:text-gray-400"
                >
                  <ChevronRight />
                </button>
              </div>
            </div>
          )}
        </div>

        {selectedClass && statistics && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Results Statistics</h2>
            </div>
            
            {statsLoading ? (
              <div className="p-6 flex justify-center">
                <Loader />
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Total Students</h3>
                    <p className="text-2xl font-bold text-gray-900">{statistics.count}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Average Score</h3>
                    <p className="text-2xl font-bold text-gray-900">{statistics.avgPercentage?.toFixed(2) || 0}%</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Highest Score</h3>
                    <p className="text-2xl font-bold text-gray-900">{statistics.maxPercentage?.toFixed(2) || 0}%</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Lowest Score</h3>
                    <p className="text-2xl font-bold text-gray-900">{statistics.minPercentage?.toFixed(2) || 0}%</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Grade Distribution</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(statistics.gradeDistribution || {}).map(([grade, count]) => (
                      <div key={grade} className="flex items-center">
                        <span className={`inline-block w-8 h-8 rounded-full ${getGradeColor(grade)} flex items-center justify-center font-medium text-sm mr-2`}>
                          {grade}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{count} students</div>
                          <div className="text-xs text-gray-500">
                            {((count / statistics.count) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeacherResults; 