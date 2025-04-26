// import React, { useState, useEffect, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import Layout from '../components/layoutes/adminlayout';
// import authAxios from '../utils/auth';
// import { toast } from 'react-hot-toast';
// import { 
//   Calendar, Clock, FileText, User, Book, Upload, 
//   X, ArrowLeft, SendHorizontal, AlertTriangle, Check, Download
// } from 'lucide-react';

// const StudentSubmission = () => {
//   const { id } = useParams(); // This is the assignment ID
//   const navigate = useNavigate();
//   const { user } = useSelector((state) => state.auth);
//   const [assignment, setAssignment] = useState(null);
//   const [submission, setSubmission] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [answer, setAnswer] = useState('');
//   const [attachments, setAttachments] = useState([]);
//   const [submitting, setSubmitting] = useState(false);
//   const [formErrors, setFormErrors] = useState({});
//   const fileInputRef = useRef(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         // Get assignment details
//         const assignmentRes = await authAxios.get(`/assignments/${id}`);
//         setAssignment(assignmentRes.data.data.assignment);
        
//         // Check if student has already submitted
//         try {
//           const submissionsRes = await authAxios.get('/submissions', {
//             params: { assignmentId: id }
//           });
          
//           const submissions = submissionsRes.data.data.submissions;
//           const existingSubmission = submissions.find(s => 
//             s.assignment === id && s.student._id === user.id
//           );
          
//           if (existingSubmission) {
//             setSubmission(existingSubmission);
//             setAnswer(existingSubmission.answer || '');
//             setAttachments(existingSubmission.attachments || []);
//           }
//         } catch (err) {
//           console.error('Error fetching submissions:', err);
//         }
//       } catch (error) {
//         console.error('Error fetching assignment:', error);
//         toast.error('Failed to load assignment details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id, user.id]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate form
//     const errors = {};
//     if (!answer.trim() && attachments.length === 0) {
//       errors.answer = 'Please provide an answer or attach files';
//     }
    
//     if (Object.keys(errors).length > 0) {
//       setFormErrors(errors);
//       return;
//     }
    
//     setSubmitting(true);
    
//     try {
//       const submissionData = {
//         assignment: id,
//         answer,
//         attachments
//       };
      
//       let response;
      
//       if (submission) {
//         // Update existing submission
//         response = await authAxios.put(`/submissions/${submission._id}`, submissionData);
//         toast.success('Submission updated successfully');
//       } else {
//         // Create new submission
//         response = await authAxios.post('/submissions', submissionData);
//         toast.success('Assignment submitted successfully');
//       }
      
//       setSubmission(response.data.data.submission);
//     } catch (error) {
//       console.error('Error submitting assignment:', error);
//       toast.error(error.response?.data?.message || 'Failed to submit assignment');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleFileChange = (e) => {
//     const files = Array.from(e.target.files);
    
//     if (files.length > 0) {
//       // TODO: Implement file upload logic
//       // For now, we'll just add the files to the attachments array
//       const newAttachments = files.map(file => ({
//         filename: file.name,
//         fileSize: file.size,
//         fileType: file.type,
//         url: URL.createObjectURL(file) // This is temporary
//       }));
      
//       setAttachments([...attachments, ...newAttachments]);
//     }
//   };

//   const removeAttachment = (index) => {
//     const newAttachments = [...attachments];
//     newAttachments.splice(index, 1);
//     setAttachments(newAttachments);
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

//   const isSubmissionLate = () => {
//     if (!assignment) return false;
//     return new Date() > new Date(assignment.dueDate);
//   };

//   const isDueDatePassed = () => {
//     if (!assignment) return false;
//     return new Date() > new Date(assignment.dueDate);
//   };

//   const getSubmissionStatus = () => {
//     if (!submission) return null;
    
//     const statusColors = {
//       submitted: 'bg-blue-100 text-blue-800',
//       graded: 'bg-green-100 text-green-800',
//       returned: 'bg-amber-100 text-amber-800',
//       resubmitted: 'bg-purple-100 text-purple-800'
//     };
    
//     const statusIcons = {
//       submitted: <Clock size={16} />,
//       graded: <Check size={16} />,
//       returned: <AlertTriangle size={16} />,
//       resubmitted: <Clock size={16} />
//     };
    
//     return (
//       <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[submission.status] || 'bg-gray-100 text-gray-800'}`}>
//         {statusIcons[submission.status]}
//         {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
//       </span>
//     );
//   };

//   const canSubmit = () => {
//     if (!assignment) return false;
    
//     // Cannot submit if due date has passed
//     if (isDueDatePassed() && !submission) return false;
    
//     // Can resubmit if returned for revision
//     if (submission && submission.status === 'returned') return true;
    
//     // Cannot submit if already graded
//     if (submission && submission.status === 'graded') return false;
    
//     return true;
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

//   if (!assignment) {
//     return (
//       <Layout>
//         <div className="bg-white shadow rounded-lg p-8 text-center">
//           <h2 className="text-xl font-medium text-gray-900 mb-4">Assignment not found</h2>
//           <p className="text-gray-600 mb-6">The assignment you are looking for does not exist or you don't have permission to view it.</p>
//           <button 
//             onClick={() => navigate('/assignments')}
//             className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
//           >
//             <ArrowLeft size={16} className="mr-2" />
//             Back to Assignments
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
//             onClick={() => navigate('/assignments')}
//             className="mr-4 inline-flex items-center text-gray-600 hover:text-gray-900"
//           >
//             <ArrowLeft size={20} className="mr-1" />
//             Back
//           </button>
//           <h1 className="text-2xl font-bold text-gray-900">Assignment Submission</h1>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Left Column - Assignment Info */}
//           <div className="lg:col-span-1">
//             <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
//               <div className="px-6 py-5 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">Assignment Details</h2>
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
//                     <Calendar size={16} className="mr-2 text-gray-500" />
//                     <span className="font-medium">Due Date:</span>
//                   </div>
//                   <div className="pl-6 ml-2 text-gray-900">
//                     {formatDate(assignment.dueDate)}
//                     {isDueDatePassed() && (
//                       <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
//                         Passed
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {submission && (
//                   <div className="mb-4">
//                     <div className="flex items-center text-sm text-gray-700 mb-1">
//                       <Clock size={16} className="mr-2 text-gray-500" />
//                       <span className="font-medium">Status:</span>
//                     </div>
//                     <div className="pl-6 ml-2">
//                       {getSubmissionStatus()}
//                     </div>
//                   </div>
//                 )}

//                 {submission && submission.submittedAt && (
//                   <div className="mb-4">
//                     <div className="flex items-center text-sm text-gray-700 mb-1">
//                       <Clock size={16} className="mr-2 text-gray-500" />
//                       <span className="font-medium">Submitted On:</span>
//                     </div>
//                     <div className="pl-6 ml-2 text-gray-900">
//                       {formatDate(submission.submittedAt)}
//                       {submission.lateSubmission && (
//                         <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
//                           Late
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 )}

//                 {submission && submission.status === 'graded' && (
//                   <div className="mb-4">
//                     <div className="flex items-center text-sm text-gray-700 mb-1">
//                       <Check size={16} className="mr-2 text-gray-500" />
//                       <span className="font-medium">Marks:</span>
//                     </div>
//                     <div className="pl-6 ml-2 text-gray-900">
//                       {submission.marks} / {assignment.totalMarks}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Assignment Instructions */}
//             <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
//               <div className="px-6 py-5 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">Instructions</h2>
//               </div>
//               <div className="px-6 py-5">
//                 <div className="prose max-w-none text-gray-700">
//                   {assignment.instructions || 'No specific instructions provided.'}
//                 </div>

//                 {assignment.attachments && assignment.attachments.length > 0 && (
//                   <div className="mt-6">
//                     <h3 className="text-sm font-medium text-gray-900 mb-3">Resources & Materials</h3>
//                     <ul className="divide-y divide-gray-200">
//                       {assignment.attachments.map((attachment, index) => (
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
//           </div>

//           {/* Right Column - Submission Form */}
//           <div className="lg:col-span-2">
//             {/* Submission Form */}
//             <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
//               <div className="px-6 py-5 border-b border-gray-200">
//                 <h2 className="text-lg font-medium text-gray-900">
//                   {submission ? 'Your Submission' : 'Submit Assignment'}
//                 </h2>
//               </div>
//               <div className="px-6 py-5">
//                 {submission && submission.status === 'graded' ? (
//                   <div>
//                     <div className="prose max-w-none mb-6">
//                       {submission.answer || 'No written answer provided.'}
//                     </div>
                    
//                     {submission.attachments && submission.attachments.length > 0 && (
//                       <div className="mt-6">
//                         <h3 className="text-sm font-medium text-gray-900 mb-3">Your Attachments</h3>
//                         <ul className="divide-y divide-gray-200">
//                           {submission.attachments.map((attachment, index) => (
//                             <li key={index} className="py-3 flex justify-between items-center">
//                               <div className="flex items-center">
//                                 <FileText size={18} className="mr-3 text-gray-500" />
//                                 <span className="text-sm text-gray-900">{attachment.filename || `Attachment ${index + 1}`}</span>
//                               </div>
//                               <a
//                                 href={attachment.url}
//                                 download
//                                 className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-5 font-medium rounded-md text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:text-gray-800 active:bg-gray-50"
//                               >
//                                 <Download size={16} className="mr-1" />
//                                 Download
//                               </a>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     )}
//                   </div>
//                 ) : (
//                   <form onSubmit={handleSubmit}>
//                     {!canSubmit() && (
//                       <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
//                         <div className="flex">
//                           <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
//                           <div>
//                             <p className="font-medium">You cannot submit this assignment</p>
//                             <p className="text-sm">
//                               {isDueDatePassed() ? 
//                                 'The due date has passed and you did not submit this assignment in time.' : 
//                                 'This assignment is already graded and cannot be modified.'}
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
                    
//                     {submission && submission.status === 'returned' && (
//                       <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-700">
//                         <div className="flex">
//                           <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
//                           <div>
//                             <p className="font-medium">This submission was returned for revision</p>
//                             <p className="text-sm mt-1">Feedback: {submission.feedback}</p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
                    
//                     {isSubmissionLate() && !submission && (
//                       <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-700">
//                         <div className="flex">
//                           <AlertTriangle size={20} className="mr-3 flex-shrink-0" />
//                           <div>
//                             <p className="font-medium">Late submission</p>
//                             <p className="text-sm">
//                               The due date for this assignment has passed. Your submission will be marked as late.
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     )}
                    
//                     <div className="mb-4">
//                       <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-1">
//                         Your Answer
//                       </label>
//                       <textarea
//                         id="answer"
//                         name="answer"
//                         rows={8}
//                         value={answer}
//                         onChange={(e) => setAnswer(e.target.value)}
//                         placeholder="Type your answer here..."
//                         className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
//                           formErrors.answer ? 'border-red-500' : ''
//                         }`}
//                         disabled={!canSubmit()}
//                       />
//                       {formErrors.answer && (
//                         <p className="mt-1 text-sm text-red-600">{formErrors.answer}</p>
//                       )}
//                     </div>

//                     <div className="mb-4">
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Attachments
//                       </label>
                      
//                       {attachments.length > 0 && (
//                         <ul className="mb-3 border border-gray-200 rounded-md divide-y divide-gray-200">
//                           {attachments.map((file, index) => (
//                             <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
//                               <div className="flex items-center">
//                                 <FileText size={16} className="flex-shrink-0 mr-2 text-gray-500" />
//                                 <span className="ml-2 flex-1 truncate">{file.filename}</span>
//                               </div>
//                               {canSubmit() && (
//                                 <button
//                                   type="button"
//                                   onClick={() => removeAttachment(index)}
//                                   className="ml-4 flex-shrink-0 text-red-600 hover:text-red-500"
//                                 >
//                                   <X size={16} />
//                                 </button>
//                               )}
//                             </li>
//                           ))}
//                         </ul>
//                       )}
                      
//                       {canSubmit() && (
//                         <div className="mt-1 flex items-center">
//                           <input
//                             type="file"
//                             ref={fileInputRef}
//                             onChange={handleFileChange}
//                             className="sr-only"
//                             multiple
//                           />
//                           <button
//                             type="button"
//                             onClick={() => fileInputRef.current.click()}
//                             className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                           >
//                             <Upload size={16} className="mr-2" />
//                             Add Files
//                           </button>
//                           <p className="ml-3 text-xs text-gray-500">
//                             Upload documents, images, or other files related to your assignment.
//                           </p>
//                         </div>
//                       )}
//                     </div>

//                     {canSubmit() && (
//                       <div className="mt-6 flex justify-end">
//                         <button
//                           type="submit"
//                           disabled={submitting}
//                           className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                         >
//                           {submitting ? (
//                             <>
//                               <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
//                               {submission ? 'Updating...' : 'Submitting...'}
//                             </>
//                           ) : (
//                             <>
//                               <SendHorizontal size={16} className="mr-2" />
//                               {submission ? 'Update Submission' : 'Submit Assignment'}
//                             </>
//                           )}
//                         </button>
//                       </div>
//                     )}
//                   </form>
//                 )}
//               </div>
//             </div>

//             {/* Feedback Section - if graded */}
//             {submission && submission.status === 'graded' && (
//               <div className="bg-white shadow rounded-lg overflow-hidden">
//                 <div className="px-6 py-5 border-b border-gray-200">
//                   <h2 className="text-lg font-medium text-gray-900">Teacher Feedback</h2>
//                 </div>
//                 <div className="px-6 py-5">
//                   <div className="prose max-w-none text-gray-700">
//                     {submission.feedback || 'No feedback provided.'}
//                   </div>
                  
//                   <div className="mt-6 text-sm text-gray-500">
//                     Graded on {formatDate(submission.gradedAt)}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default StudentSubmission; 