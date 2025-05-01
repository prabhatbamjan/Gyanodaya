import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Download,
  Eye,
  CheckCircle,
  X,
  AlertTriangle
} from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import authAxios from '../../utils/auth';
import Loader from '../../components/Loader';

const AdminResults = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('Submitted');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Selection for publishing
  const [selectedResults, setSelectedResults] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);

  useEffect(() => {
    fetchClassesAndSubjects();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [selectedClass, selectedSubject, selectedTerm, selectedExamType, selectedStatus]);

  useEffect(() => {
    filterResults();
  }, [searchTerm, results]);

  const fetchClassesAndSubjects = async () => {
    try {
      setLoading(true);
      const [classesRes, subjectsRes] = await Promise.all([
        authAxios.get('/classes'),
        authAxios.get('/subjects')
      ]);
      
      setClasses(classesRes.data.data || []);
      setSubjects(subjectsRes.data.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load classes and subjects');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (selectedClass) params.append('classId', selectedClass);
      if (selectedSubject) params.append('subjectId', selectedSubject);
      if (selectedTerm) params.append('term', selectedTerm);
      if (selectedExamType) params.append('examType', selectedExamType);
      if (selectedStatus) params.append('status', selectedStatus);
      
      const response = await authAxios.get(`/results?${params}`);
      
      if (response.data.status === 'success') {
        setResults(response.data.data.results);
        // Reset selections when fetching new results
        setSelectedResults([]);
        setSelectAll(false);
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

  const filterResults = () => {
    if (!searchTerm.trim()) {
      setFilteredResults(results);
      setTotalPages(Math.ceil(results.length / itemsPerPage));
      return;
    }
    
    const filtered = results.filter(result => {
      const studentName = `${result.student?.firstName || ''} ${result.student?.lastName || ''}`.toLowerCase();
      const subjectName = result.subject?.name?.toLowerCase() || '';
      const className = result.class?.name?.toLowerCase() || '';
      
      return studentName.includes(searchTerm.toLowerCase()) || 
             subjectName.includes(searchTerm.toLowerCase()) ||
             className.includes(searchTerm.toLowerCase());
    });
    
    setFilteredResults(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleResultSelect = (resultId) => {
    setSelectedResults(prev => {
      if (prev.includes(resultId)) {
        return prev.filter(id => id !== resultId);
      } else {
        return [...prev, resultId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedResults([]);
    } else {
      setSelectedResults(getCurrentPageResults().map(result => result._id));
    }
    setSelectAll(!selectAll);
  };

  const getCurrentPageResults = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  };

  const handlePublishConfirm = () => {
    if (selectedResults.length === 0) {
      setError('Please select at least one result to publish');
      return;
    }
    setShowPublishConfirm(true);
  };

  const handlePublishResults = async () => {
    if (selectedResults.length === 0) return;
    
    try {
      setPublishLoading(true);
      const response = await authAxios.post('/results/publish', {
        resultIds: selectedResults
      });
      
      if (response.data.status === 'success') {
        setSuccessMessage(`Successfully published ${selectedResults.length} results`);
        setSelectedResults([]);
        setSelectAll(false);
        // Refresh results
        fetchResults();
      } else {
        setError('Failed to publish results');
      }
    } catch (err) {
      console.error('Error publishing results:', err);
      setError('Failed to publish results. Please try again.');
    } finally {
      setPublishLoading(false);
      setShowPublishConfirm(false);
    }
  };

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

  const clearFilters = () => {
    setSelectedClass('');
    setSelectedSubject('');
    setSelectedTerm('');
    setSelectedExamType('');
    setSearchTerm('');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Result Management</h1>
          <p className="mt-1 text-sm text-gray-500">Review and publish student results</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class
              </label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                Term
              </label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Terms</option>
                <option value="First Term">First Term</option>
                <option value="Second Term">Second Term</option>
                <option value="Final Term">Final Term</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Type
              </label>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="Midterm">Midterm</option>
                <option value="Final">Final</option>
                <option value="Assignment">Assignment</option>
                <option value="Project">Project</option>
                <option value="Quiz">Quiz</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full rounded-md border border-gray-300 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Published">Published</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center">
            <div className="w-full sm:w-1/2 mb-4 sm:mb-0">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by student, class or subject..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
              
              {selectedStatus === 'Submitted' && (
                <button
                  onClick={handlePublishConfirm}
                  disabled={selectedResults.length === 0}
                  className={`px-4 py-2 rounded-md text-white ${
                    selectedResults.length === 0 
                    ? 'bg-blue-300 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <CheckCircle className="h-4 w-4 inline-block mr-1" />
                  Publish Selected ({selectedResults.length})
                </button>
              )}
            </div>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6 bg-green-50 p-4 rounded-md text-green-800 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {successMessage}
            <button 
              onClick={() => setSuccessMessage('')}
              className="ml-auto text-green-700 hover:text-green-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-md text-red-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-auto text-red-700 hover:text-red-900"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Results Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader />
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No results found.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {selectedStatus === 'Submitted' && (
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                          <input
                            type="checkbox"
                            checked={selectAll}
                            onChange={handleSelectAll}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </th>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Class
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Exam Info
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
                    {getCurrentPageResults().map((result) => (
                      <tr key={result._id} className="hover:bg-gray-50">
                        {selectedStatus === 'Submitted' && (
                          <td className="px-6 py-4 whitespace-nowrap w-10">
                            <input
                              type="checkbox"
                              checked={selectedResults.includes(result._id)}
                              onChange={() => handleResultSelect(result._id)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {result.student ? `${result.student.firstName} ${result.student.lastName}` : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
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
                            {((result.marksObtained / result.totalMarks) * 100).toFixed(2)}%
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
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredResults.length > itemsPerPage && (
                <div className="px-6 py-4 flex items-center justify-between border-t">
                  <div className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, filteredResults.length)} of{' '}
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
            </>
          )}
        </div>
      </div>
      
      {/* Publish Confirmation Modal */}
      {showPublishConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Publication</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to publish {selectedResults.length} result{selectedResults.length !== 1 ? 's' : ''}? 
              This action will make the results visible to students and parents.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowPublishConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={publishLoading}
              >
                Cancel
              </button>
              <button 
                onClick={handlePublishResults}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                disabled={publishLoading}
              >
                {publishLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminResults; 