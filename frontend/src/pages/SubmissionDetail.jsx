// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import Layout from '../components/layoutes/adminlayout';
// import authAxios from '../utils/auth';
// import { toast } from 'react-hot-toast';
// import { 
//   Calendar, Clock, Download, FileText, User, Book, 
//   BadgeCheck, XCircle, ArrowLeft, SendHorizontal, Pencil 
// } from 'lucide-react';

// const SubmissionDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const [submission, setSubmission] = useState(null);
//   const [assignment, setAssignment] = useState(null);
//   const [student, setStudent] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [marks, setMarks] = useState('');
//   const [feedback, setFeedback] = useState('');
//   const [showGradingForm, setShowGradingForm] = useState(false);
//   const [formErrors, setFormErrors] = useState({});

//   useEffect(() => {
//     const fetchSubmission = async () => {
//       try {
//         setLoading(true);
//         const response = await authAxios.get(`/submissions/${id}`);
        
//         const submissionData = response.data.data.submission;
//         setSubmission(submissionData);
        
//         // Fetch assignment details
//         const assignmentResponse = await authAxios.get(
//           `/assignments/${submissionData.assignment}`
//         );
//         setAssignment(assignmentResponse.data.data.assignment);
        
//         // Fetch student details
//         const studentResponse = await authAxios.get(
//           `/users/${submissionData.student}`
//         );
//         setStudent(studentResponse.data.data.user);
        
//         // Set initial form values if submission is already graded
//         if (submissionData.marks) {
//           setMarks(submissionData.marks.toString());
//         }
        
//         if (submissionData.feedback) {
//           setFeedback(submissionData.feedback);
//         }
//       } catch (error) {
//         console.error('Error fetching submission:', error);
//         toast.error('Failed to load submission details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchSubmission();
//   }, [id]);

//   const handleGradeSubmission = async (e) => {
//     e.preventDefault();
    
//     // Validate form
//     const errors = {};
//     if (!marks) {
//       errors.marks = 'Marks are required';
//     } else if (isNaN(marks) || Number(marks) < 0) {
//       errors.marks = 'Marks must be a positive number';
//     } else if (assignment && Number(marks) > assignment.totalMarks) {
//       errors.marks = `Marks cannot exceed the total marks (${assignment.totalMarks})`;
//     }
    
//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       return;
//     }
    
//     try {
//       const response = await authAxios.patch(`/submissions/${id}/grade`, {
//         marks: Number(marks),
//         feedback
//       });
      
//       setSubmission(response.data.data.submission);
//       setShowGradingForm(false);
//       toast.success('Submission graded successfully');
//     } catch (error) {
//       console.error('Error grading submission:', error);
//       toast.error('Failed to grade submission');
//     }
//   };

//   const handleReturnSubmission = async () => {
//     try {
//       const response = await authAxios.patch(`/submissions/${id}/return`, {
//         feedback
//       });
      
//       setSubmission(response.data.data.submission);
//       setShowGradingForm(false);
//       toast.success('Submission returned to student for revision');
//     } catch (error) {
//       console.error('Error returning submission:', error);
//       toast.error('Failed to return submission');
//     }
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Not available';
//     const date = new Date(dateString);
//     return date.toLocaleString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const isTeacherOrAdmin = () => {
//     return user && (user.role === 'teacher' || user.role === 'admin');
//   };

//   const getStatusBadge = () => {
//     const statusColors = {
//       submitted: 'bg-blue-100 text-blue-800',
//       graded: 'bg-green-100 text-green-800',
//       returned: 'bg-amber-100 text-amber-800',
//       resubmitted: 'bg-purple-100 text-purple-800'
//     };
    
//     return (
//       <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[submission.status] || 'bg-gray-100 text-gray-800'}`}>
//         {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
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

//   if (!submission || !assignment || !student) {
//     return (
//       <Layout>
//         <div className="bg-white shadow rounded-lg p-8 text-center">
//           <h2 className="text-xl font-medium text-gray-900 mb-4">Submission not found</h2>
//           <p className="text-gray-600 mb-6">The submission you are looking for does not exist or you don't have permission to view it.</p>
//           <button 
//             onClick={() => navigate('/submissions')}
//             className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
//           >
//             <ArrowLeft size={16} className="mr-2" />
//             Back to Submissions
//           </button>
//         </div>
//       </Layout>
//     );
//   }

//   return (
//     <Layout>
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex items-center mb-6">
//           <button 
//             onClick={() => navigate('/submissions')}
//             className="mr-4 inline-flex items-center text-gray-600 hover:text-gray-900"
//           >
//             <ArrowLeft size={20} className="mr-1" />
//             Back
//           </button>
//           <h1 className="text-2xl font-bold text-gray-900">Submission Details</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Info */}
//           <div className="lg:col-span-1">
//             <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
//               <div className="px-6 py-5 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">Assignment Information</h2>
//               </div>
//               <div className="px-6 py-5">
//                 <div className="mb-4">
//                   <div className="flex items-center text-sm text-gray-700 mb-1">
//                     <FileText size={16} className="mr-2 text-gray-500" />
//                     <span className="font-medium">Title:</span>
//                   </div>
//                   <div className="pl-6 ml-2 text-gray-900">{assignment.title}</div>
//                 </div>

//                 <div className="mb-4">
//                   <div className="flex items-center text-sm text-gray-700 mb-1">
//                     <Book size={16} className="mr-2 text-gray-500" />
//                     <span className="font-medium">Subject:</span>
//                   </div>
//                   <div className="pl-6 ml-2 text-gray-900">{assignment.subject?.name || 'N/A'}</div>
//                 </div>

//                 <div className="mb-4">
//                   <div className="flex items-center text-sm text-gray-700 mb-1">
//                     <BadgeCheck size={16} className="mr-2 text-gray-500" />
//                     <span className="font-medium">Total Marks:</span>
//                   </div>
//                   <div className="pl-6 ml-2 text-gray-900">{assignment.totalMarks}</div>
//                 </div>

//                 <div className="mb-4">
//                   <div className="flex items-center text-sm text-gray-700 mb-1">
//                     <Calendar size={16} className="mr-2 text-gray-500" />
//                     <span className="font-medium">Due Date:</span>
//                   </div>
//                   <div className="pl-6 ml-2 text-gray-900">{formatDate(assignment.dueDate)}</div>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
//               <div className="px-6 py-5 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">Student Information</h2>
//               </div>
//               <div className="px-6 py-5">
//                 <div className="mb-4">
//                   <div className="flex items-center text-sm text-gray-700 mb-1">
//                     <User size={16} className="mr-2 text-gray-500" />
//                     <span className="font-medium">Name:</span>
//                   </div>
//                   <div className="pl-6 ml-2 text-gray-900">{student.name}</div>
//                 </div>

//                 <div className="mb-4">
//                   <div className="flex items-center text-sm text-gray-700 mb-1">
//                     <User size={16} className="mr-2 text-gray-500" />
//                     <span className="font-medium">Email:</span>
//                   </div>
//                   <div className="pl-6 ml-2 text-gray-900">{student.email}</div>
//                 </div>

//                 <div className="mb-4">
//                   <div className="flex items-center text-sm text-gray-700 mb-1">
//                     <Clock size={16} className="mr-2 text-gray-500" />
//                     <span className="font-medium">Submitted:</span>
//                   </div>
//                   <div className="pl-6 ml-2 text-gray-900">
//                     {formatDate(submission.submittedAt)}
//                     {submission.lateSubmission && (
//                       <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
//                         Late
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <div className="mb-4">
//                   <div className="flex items-center text-sm text-gray-700 mb-1">
//                     <Clock size={16} className="mr-2 text-gray-500" />
//                     <span className="font-medium">Status:</span>
//                   </div>
//                   <div className="pl-6 ml-2">{getStatusBadge()}</div>
//                 </div>

//                 {submission.status === 'graded' && (
//                   <div className="mb-4">
//                     <div className="flex items-center text-sm text-gray-700 mb-1">
//                       <BadgeCheck size={16} className="mr-2 text-gray-500" />
//                       <span className="font-medium">Marks:</span>
//                     </div>
//                     <div className="pl-6 ml-2 text-gray-900">
//                       {submission.marks} / {assignment.totalMarks}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Content and Grading */}
//           <div className="lg:col-span-2">
//             <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
//               <div className="px-6 py-5 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">Student Answer</h2>
//               </div>
//               <div className="px-6 py-5">
//                 <div className="prose max-w-none">
//                   {submission.answer || 'No written answer provided.'}
//                 </div>

//                 {submission.attachments && submission.attachments.length > 0 && (
//                   <div className="mt-6">
//                     <h3 className="text-sm font-medium text-gray-900 mb-3">Attachments</h3>
//                     <ul className="divide-y divide-gray-200">
//                       {submission.attachments.map((attachment, index) => (
//                         <li key={index} className="py-3 flex justify-between items-center">
//                           <div className="flex items-center">
//                             <FileText size={18} className="mr-3 text-gray-500" />
//                             <span className="text-sm text-gray-900">{attachment.filename || `Attachment ${index + 1}`}</span>
//                           </div>
//                           <a
//                             href={attachment.url}
//                             download
//                             className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50"
//                           >
//                             <Download size={16} className="mr-1" />
//                             Download
//                           </a>
//                         </li>
//                       ))}
//                     </ul>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {isTeacherOrAdmin() && (
//               <div className="bg-white shadow rounded-lg overflow-hidden">
//                 <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
//                   <h2 className="text-lg font-medium text-gray-900">
//                     {submission.status === 'graded' ? 'Feedback' : 'Grade Submission'}
//                   </h2>
//                   {submission.status === 'graded' && (
//                     <button
//                       onClick={() => setShowGradingForm(!showGradingForm)}
//                       className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500"
//                     >
//                       <Pencil size={16} className="mr-1" />
//                       Edit Grade
//                     </button>
//                   )}
//                 </div>
                
//                 {submission.status === 'graded' && !showGradingForm ? (
//                   <div className="px-6 py-5">
//                     <div className="mb-4">
//                       <h3 className="text-sm font-medium text-gray-900 mb-2">Marks</h3>
//                       <p className="text-gray-900">
//                         {submission.marks} / {assignment.totalMarks}
//                       </p>
//                     </div>
                    
//                     <div>
//                       <h3 className="text-sm font-medium text-gray-900 mb-2">Feedback</h3>
//                       <div className="prose max-w-none text-gray-700">
//                         {submission.feedback || 'No feedback provided.'}
//                       </div>
//                     </div>
                    
//                     <div className="mt-6 text-sm text-gray-500">
//                       Graded on {formatDate(submission.gradedAt)}
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="px-6 py-5">
//                     <form onSubmit={handleGradeSubmission}>
//                       <div className="mb-4">
//                         <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-1">
//                           Marks (out of {assignment.totalMarks})
//                         </label>
//                         <input
//                           type="number"
//                           id="marks"
//                           name="marks"
//                           value={marks}
//                           onChange={(e) => setMarks(e.target.value)}
//                           min="0"
//                           max={assignment.totalMarks}
//                           className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
//                             formErrors.marks ? 'border-red-500' : ''
//                           }`}
//                         />
//                         {formErrors.marks && (
//                           <p className="mt-1 text-sm text-red-600">{formErrors.marks}</p>
//                         )}
//                       </div>

//                       <div className="mb-4">
//                         <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
//                           Feedback
//                         </label>
//                         <textarea
//                           id="feedback"
//                           name="feedback"
//                           rows={5}
//                           value={feedback}
//                           onChange={(e) => setFeedback(e.target.value)}
//                           className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
//                         />
//                       </div>

//                       <div className="flex justify-end space-x-3">
//                         {['submitted', 'resubmitted'].includes(submission.status) && (
//                           <button
//                             type="button"
//                             onClick={handleReturnSubmission}
//                             className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
//                           >
//                             <SendHorizontal size={16} className="mr-2" />
//                             Return for Revision
//                           </button>
//                         )}
                        
//                         <button
//                           type="submit"
//                           className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
//                         >
//                           <BadgeCheck size={16} className="mr-2" />
//                           {submission.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
//                         </button>
//                       </div>
//                     </form>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default SubmissionDetail; 