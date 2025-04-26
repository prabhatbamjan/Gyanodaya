// import React, { useState, useEffect } from 'react';
// import Layout from '../components/layoutes/adminlayout';
// import authAxios from '../utils/auth';
// import { useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import { Check, X, FileText, Clock, AlertTriangle, Download, Eye } from 'lucide-react';
// import { toast } from 'react-hot-toast';

// const statusColors = {
//   submitted: 'bg-blue-100 text-blue-800',
//   graded: 'bg-green-100 text-green-800',
//   returned: 'bg-amber-100 text-amber-800',
//   resubmitted: 'bg-purple-100 text-purple-800'
// };

// const statusIcons = {
//   submitted: <FileText size={16} />,
//   graded: <Check size={16} />,
//   returned: <AlertTriangle size={16} />,
//   resubmitted: <Clock size={16} />
// };

// const Submissions = () => {
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const [submissions, setSubmissions] = useState([]);
//   const [filteredSubmissions, setFilteredSubmissions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [classes, setClasses] = useState([]);
//   const [subjects, setSubjects] = useState([]);
//   const [assignments, setAssignments] = useState([]);
//   const [filters, setFilters] = useState({
//     classId: '',
//     subjectId: '',
//     assignmentId: '',
//     status: '',
//     searchTerm: ''
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [submissionsRes, classesRes, subjectsRes, assignmentsRes] = await Promise.all([
//           authAxios.get('/submissions'),
//           authAxios.get('/classes'),
//           authAxios.get('/subjects'),
//           authAxios.get('/assignments')
//         ]);

//         setSubmissions(submissionsRes.data.data.submissions);
//         setFilteredSubmissions(submissionsRes.data.data.submissions);
//         setClasses(classesRes.data.data.classes);
//         setSubjects(subjectsRes.data.data.subjects);
//         setAssignments(assignmentsRes.data.data.assignments);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         toast.error('Failed to load submissions');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   useEffect(() => {
//     let result = [...submissions];

//     if (filters.classId) {
//       // Find assignments for this class and filter submissions
//       const classAssignments = assignments.filter(a => a.class === filters.classId).map(a => a._id);
//       result = result.filter(s => classAssignments.includes(s.assignment));
//     }

//     if (filters.subjectId) {
//       // Find assignments for this subject and filter submissions
//       const subjectAssignments = assignments.filter(a => a.subject === filters.subjectId).map(a => a._id);
//       result = result.filter(s => subjectAssignments.includes(s.assignment));
//     }

//     if (filters.assignmentId) {
//       result = result.filter(s => s.assignment === filters.assignmentId);
//     }

//     if (filters.status) {
//       result = result.filter(s => s.status === filters.status);
//     }

//     if (filters.searchTerm) {
//       const term = filters.searchTerm.toLowerCase();
//       result = result.filter(s => 
//         s.student?.name?.toLowerCase().includes(term) ||
//         assignments.find(a => a._id === s.assignment)?.title?.toLowerCase().includes(term)
//       );
//     }

//     setFilteredSubmissions(result);
//   }, [filters, submissions, assignments]);

//   const handleFilterChange = (e) => {
//     const { name, value } = e.target;
//     setFilters({
//       ...filters,
//       [name]: value
//     });
//   };

//   const resetFilters = () => {
//     setFilters({
//       classId: '',
//       subjectId: '',
//       assignmentId: '',
//       status: '',
//       searchTerm: ''
//     });
//   };

//   const viewSubmission = (id) => {
//     navigate(`/submission/${id}`);
//   };

//   const getAssignmentTitle = (assignmentId) => {
//     const assignment = assignments.find(a => a._id === assignmentId);
//     return assignment ? assignment.title : 'Unknown Assignment';
//   };

//   const getStudentName = (studentId) => {
//     const submission = submissions.find(s => s._id === studentId);
//     return submission?.student?.name || 'Unknown Student';
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not submitted';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusBadge = (status) => {
//     return (
//       <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
//         {statusIcons[status]}
//         {status.charAt(0).toUpperCase() + status.slice(1)}
//       </span>
//     );
//   };

//   if (loading) {
//     return (
//       <Layout>
//         <div className="flex justify-center items-center h-64">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
//           <h1 className="text-2xl font-bold text-gray-900">Student Submissions</h1>
//           <div className="mt-4 md:mt-0">
//             <button
//               onClick={resetFilters}
//               className="ml-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700"
//             >
//               Reset Filters
//             </button>
//           </div>
//         </div>

//         {/* Filters */}
//         <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
//             <div>
//               <label htmlFor="classId" className="block text-sm font-medium text-gray-700 mb-1">
//                 Class
//               </label>
//               <select
//                 id="classId"
//                 name="classId"
//                 value={filters.classId}
//                 onChange={handleFilterChange}
//                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//               >
//                 <option value="">All Classes</option>
//                 {classes.map((cls) => (
//                   <option key={cls._id} value={cls._id}>
//                     {cls.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label htmlFor="subjectId" className="block text-sm font-medium text-gray-700 mb-1">
//                 Subject
//               </label>
//               <select
//                 id="subjectId"
//                 name="subjectId"
//                 value={filters.subjectId}
//                 onChange={handleFilterChange}
//                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//               >
//                 <option value="">All Subjects</option>
//                 {subjects.map((subject) => (
//                   <option key={subject._id} value={subject._id}>
//                     {subject.name}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label htmlFor="assignmentId" className="block text-sm font-medium text-gray-700 mb-1">
//                 Assignment
//               </label>
//               <select
//                 id="assignmentId"
//                 name="assignmentId"
//                 value={filters.assignmentId}
//                 onChange={handleFilterChange}
//                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//               >
//                 <option value="">All Assignments</option>
//                 {assignments.map((assignment) => (
//                   <option key={assignment._id} value={assignment._id}>
//                     {assignment.title}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
//                 Status
//               </label>
//               <select
//                 id="status"
//                 name="status"
//                 value={filters.status}
//                 onChange={handleFilterChange}
//                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//               >
//                 <option value="">All Statuses</option>
//                 <option value="submitted">Submitted</option>
//                 <option value="graded">Graded</option>
//                 <option value="returned">Returned</option>
//                 <option value="resubmitted">Resubmitted</option>
//               </select>
//             </div>

//             <div>
//               <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
//                 Search
//               </label>
//               <input
//                 type="text"
//                 id="searchTerm"
//                 name="searchTerm"
//                 value={filters.searchTerm}
//                 onChange={handleFilterChange}
//                 placeholder="Search by student name or assignment"
//                 className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//               />
//             </div>
//           </div>
//         </div>

//         {/* Submissions Table */}
//         {filteredSubmissions.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-sm p-8 text-center">
//             <p className="text-gray-500">No submissions found matching the selected filters.</p>
//           </div>
//         ) : (
//           <div className="bg-white shadow-sm rounded-lg overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-gray-200">
//                 <thead className="bg-gray-50">
//                   <tr>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Assignment
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Student
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Submitted At
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Grade
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                       Actions
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {filteredSubmissions.map((submission) => (
//                     <tr key={submission._id} className="hover:bg-gray-50">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
//                         {getAssignmentTitle(submission.assignment)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {submission.student.name}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {formatDate(submission.submittedAt)}
//                         {submission.lateSubmission && (
//                           <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
//                             Late
//                           </span>
//                         )}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {getStatusBadge(submission.status)}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
//                         {submission.marks ? `${submission.marks}/100` : '-'}
//                       </td>
//                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                         <button
//                           onClick={() => viewSubmission(submission._id)}
//                           className="text-indigo-600 hover:text-indigo-900 mr-3"
//                           title="View Submission"
//                         >
//                           <Eye size={18} />
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default Submissions; 