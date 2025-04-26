const Submission = require('../models/submissionModel');
const Assignment = require('../models/assignmentModel');
const Student = require('../models/studentModel');
const Teacher = require('../models/teacherModel');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const archiver = require('archiver');
const User = require('../models/userModel');
const Class = require('../models/classModel');

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/submissions');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueFilename = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueFilename);
  }
});

// Filter for allowed file types
const fileFilter = (req, file, cb) => {
  // Accept common document and media types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'audio/mpeg',
    'application/zip',
    'application/x-zip-compressed'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Only document, image, audio, video, and archive files are allowed', 400), false);
  }
};

// Configure multer upload
exports.upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max file size
  }
});

// Middleware to check if user is the owner of the submission
exports.checkOwnership = catchAsync(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);
  
  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }
  
  if (submission.student._id.toString() !== req.user.id.toString()) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  
  req.submission = submission;
  next();
});

// Middleware to check if user has access to a student's submissions
exports.checkStudentAccess = catchAsync(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);
  
  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }
  
  if (req.user.role === 'student' && submission.student._id.toString() !== req.user.id.toString()) {
    return next(new AppError('You can only access your own submissions', 403));
  }
  
  if (req.user.role === 'parent') {
    const children = await User.find({ 
      parent: req.user.id, 
      role: 'student' 
    });
    
    const childIds = children.map(child => child._id.toString());
    
    if (!childIds.includes(submission.student._id.toString())) {
      return next(new AppError('You can only access your children\'s submissions', 403));
    }
  }
  
  req.submission = submission;
  next();
});

// Middleware to check if teacher has access to an assignment's submissions
exports.checkAssignmentTeacherAccess = catchAsync(async (req, res, next) => {
  const assignmentId = req.params.assignmentId || (req.submission && req.submission.assignment._id);
  
  if (!assignmentId) {
    return next(new AppError('Assignment ID is required', 400));
  }
  
  const assignment = await Assignment.findById(assignmentId);
  
  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }
  
  if (req.user.role === 'teacher' && assignment.teacher.toString() !== req.user.id.toString()) {
    return next(new AppError('You can only access submissions for your own assignments', 403));
  }
  
  next();
});

// Middleware to check if user has access to a specific submission
exports.checkSubmissionAccess = catchAsync(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);
  
  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }
  
  if (req.user.role === 'student' && submission.student._id.toString() !== req.user.id.toString()) {
    return next(new AppError('You can only access your own submissions', 403));
  }
  
  if (req.user.role === 'teacher') {
    const assignment = await Assignment.findById(submission.assignment._id);
    
    if (assignment.teacher.toString() !== req.user.id.toString()) {
      return next(new AppError('You can only access submissions for your own assignments', 403));
    }
  }
  
  if (req.user.role === 'parent') {
    const children = await User.find({ 
      parent: req.user.id, 
      role: 'student' 
    });
    
    const childIds = children.map(child => child._id.toString());
    
    if (!childIds.includes(submission.student._id.toString())) {
      return next(new AppError('You can only access your children\'s submissions', 403));
    }
  }
  
  req.submission = submission;
  next();
});

// Get all submissions (with filtering)
exports.getAllSubmissions = catchAsync(async (req, res, next) => {
  let filter = {};
  
  // Filter by assignment if provided
  if (req.params.assignmentId) {
    filter.assignment = req.params.assignmentId;
  }
  
  // Additional filtering based on user role
  if (req.user.role === 'student') {
    filter.student = req.user.id;
  } else if (req.user.role === 'teacher') {
    // For teachers, get submissions for their assignments
    if (!req.params.assignmentId) {
      const assignments = await Assignment.find({ teacher: req.user.id });
      filter.assignment = { $in: assignments.map(a => a._id) };
    } else {
      // Check if the assignment belongs to this teacher
      const assignment = await Assignment.findById(req.params.assignmentId);
      if (!assignment || assignment.teacher.toString() !== req.user.id.toString()) {
        return next(new AppError('You can only view submissions for your own assignments', 403));
      }
    }
  } else if (req.user.role === 'parent') {
    // For parents, get submissions of their children
    const children = await User.find({ 
      parent: req.user.id, 
      role: 'student' 
    });
    
    filter.student = { $in: children.map(child => child._id) };
  }
  
  const submissions = await Submission.find(filter);
  
  res.status(200).json({
    status: 'success',
    results: submissions.length,
    data: {
      submissions
    }
  });
});

// Get a specific submission
exports.getSubmission = catchAsync(async (req, res, next) => {
  // Use the submission from the middleware if available
  const submission = req.submission || await Submission.findById(req.params.id);
  
  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      submission
    }
  });
});

// Get all submissions for a specific student
exports.getStudentSubmissions = catchAsync(async (req, res, next) => {
  const studentId = req.params.studentId;
  
  // Check if user has access to the student's submissions
  if (req.user.role === 'student' && req.user.id !== studentId) {
    return next(new AppError('You can only view your own submissions', 403));
  }
  
  if (req.user.role === 'parent') {
    const children = await User.find({ 
      parent: req.user.id, 
      role: 'student' 
    });
    
    const childIds = children.map(child => child._id.toString());
    
    if (!childIds.includes(studentId)) {
      return next(new AppError('You can only view your children\'s submissions', 403));
    }
  }
  
  const submissions = await Submission.find({ student: studentId });
  
  res.status(200).json({
    status: 'success',
    results: submissions.length,
    data: {
      submissions
    }
  });
});

// Get all submissions for a specific assignment
exports.getAssignmentSubmissions = catchAsync(async (req, res, next) => {
  const assignmentId = req.params.assignmentId;
  
  // Check if user has access to the assignment's submissions
  if (req.user.role === 'teacher') {
    const assignment = await Assignment.findById(assignmentId);
    
    if (!assignment) {
      return next(new AppError('No assignment found with that ID', 404));
    }
    
    if (assignment.teacher.toString() !== req.user.id.toString()) {
      return next(new AppError('You can only view submissions for your own assignments', 403));
    }
  }
  
  const submissions = await Submission.find({ assignment: assignmentId });
  
  res.status(200).json({
    status: 'success',
    results: submissions.length,
    data: {
      submissions
    }
  });
});

// Create a new submission
exports.createSubmission = catchAsync(async (req, res, next) => {
  // Check if the assignment exists
  const assignment = await Assignment.findById(req.body.assignment);
  
  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }
  
  // Check if student is enrolled in the class
  const classFound = await Class.findById(assignment.class);
  
  if (!classFound) {
    return next(new AppError('No class found for this assignment', 404));
  }
  
  const isEnrolled = classFound.students.some(
    student => student.toString() === req.user.id.toString()
  );
  
  if (!isEnrolled && req.user.role === 'student') {
    return next(new AppError('You are not enrolled in this class', 403));
  }
  
  // Check if due date has passed and update submission status accordingly
  const now = new Date();
  const isLate = now > assignment.dueDate;
  
  // Check if a submission already exists
  const existingSubmission = await Submission.findOne({
    assignment: req.body.assignment,
    student: req.user.id
  });
  
  if (existingSubmission) {
    return next(new AppError('You have already submitted this assignment. Please update your existing submission.', 400));
  }
  
  // Create submission
  const submission = await Submission.create({
    assignment: req.body.assignment,
    student: req.user.id,
    answer: req.body.answer,
    attachments: req.body.attachments || [],
    status: req.body.status || 'submitted',
    lateSubmission: isLate
  });
  
  res.status(201).json({
    status: 'success',
    data: {
      submission
    }
  });
});

// Update a submission
exports.updateSubmission = catchAsync(async (req, res, next) => {
  // Get the submission
  const submission = await Submission.findById(req.params.id);
  
  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }
  
  // Only the owner can update the submission
  if (submission.student._id.toString() !== req.user.id.toString()) {
    return next(new AppError('You can only update your own submissions', 403));
  }
  
  // Check if the submission is already graded
  if (submission.status === 'graded') {
    return next(new AppError('You cannot update a graded submission', 400));
  }
  
  // Check if the assignment due date has passed
  const assignment = await Assignment.findById(submission.assignment._id);
  
  if (!assignment) {
    return next(new AppError('No assignment found for this submission', 404));
  }
  
  const now = new Date();
  if (now > assignment.dueDate && submission.status !== 'returned') {
    return next(new AppError('You cannot update a submission after the due date', 400));
  }
  
  // Update fields
  submission.answer = req.body.answer || submission.answer;
  submission.attachments = req.body.attachments || submission.attachments;
  submission.status = submission.status === 'returned' ? 'resubmitted' : submission.status;
  submission.submittedAt = now;
  
  await submission.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      submission
    }
  });
});

// Delete a submission
exports.deleteSubmission = catchAsync(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);
  
  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }
  
  // Check if user has permission to delete
  if (req.user.role === 'student') {
    // Students can only delete their own submissions
    if (submission.student._id.toString() !== req.user.id.toString()) {
      return next(new AppError('You can only delete your own submissions', 403));
    }
    
    // Students cannot delete graded submissions
    if (submission.status === 'graded') {
      return next(new AppError('You cannot delete a graded submission', 400));
    }
  } else if (req.user.role === 'teacher') {
    // Teachers can only delete submissions for their own assignments
    const assignment = await Assignment.findById(submission.assignment._id);
    
    if (!assignment || assignment.teacher.toString() !== req.user.id.toString()) {
      return next(new AppError('You can only delete submissions for your own assignments', 403));
    }
  } else if (req.user.role !== 'admin') {
    return next(new AppError('You do not have permission to delete this submission', 403));
  }
  
  await Submission.findByIdAndDelete(req.params.id);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Grade a submission
exports.gradeSubmission = catchAsync(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);
  
  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }
  
  // Verify teacher has permission to grade
  if (req.user.role === 'teacher') {
    const assignment = await Assignment.findById(submission.assignment._id);
    
    if (!assignment || assignment.teacher.toString() !== req.user.id.toString()) {
      return next(new AppError('You can only grade submissions for your own assignments', 403));
    }
  } else if (req.user.role !== 'admin') {
    return next(new AppError('Only teachers and admins can grade submissions', 403));
  }
  
  // Check if marks are within allowed range
  const assignment = await Assignment.findById(submission.assignment._id);
  
  if (req.body.marks > assignment.totalMarks) {
    return next(new AppError(`Marks cannot exceed the assignment total of ${assignment.totalMarks}`, 400));
  }
  
  // Update submission with grade
  submission.marks = req.body.marks;
  submission.feedback = req.body.feedback;
  submission.status = 'graded';
  submission.gradedAt = Date.now();
  
  await submission.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      submission
    }
  });
});

// Return a submission to student for revision
exports.returnSubmission = catchAsync(async (req, res, next) => {
  const submission = await Submission.findById(req.params.id);
  
  if (!submission) {
    return next(new AppError('No submission found with that ID', 404));
  }
  
  // Verify teacher has permission
  if (req.user.role === 'teacher') {
    const assignment = await Assignment.findById(submission.assignment._id);
    
    if (!assignment || assignment.teacher.toString() !== req.user.id.toString()) {
      return next(new AppError('You can only return submissions for your own assignments', 403));
    }
  } else if (req.user.role !== 'admin') {
    return next(new AppError('Only teachers and admins can return submissions', 403));
  }
  
  // Update submission status
  submission.status = 'returned';
  submission.feedback = req.body.feedback || submission.feedback;
  submission.returnedAt = Date.now();
  
  await submission.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      submission
    }
  });
});

// Download submission attachment
exports.downloadSubmissionAttachment = catchAsync(async (req, res, next) => {
  const { attachmentId } = req.params;
  
  // Find the submission with this attachment
  const submission = await Submission.findOne({
    'attachments._id': attachmentId
  });
  
  if (!submission) {
    return next(new AppError('Attachment not found', 404));
  }
  
  // Get the assignment
  const assignment = await Assignment.findById(submission.assignmentId);
  
  // Check permissions
  if (req.user.role === 'teacher') {
    if (assignment.teacherId.toString() !== req.user.teacherId.toString()) {
      return next(new AppError('You do not have permission to download this attachment', 403));
    }
  } else if (req.user.role === 'student') {
    const student = await Student.findOne({ userId: req.user._id });
    if (!student || student._id.toString() !== submission.studentId.toString()) {
      return next(new AppError('You do not have permission to download this attachment', 403));
    }
  }
  
  // Find the specific attachment
  const attachment = submission.attachments.id(attachmentId);
  
  if (!attachment) {
    return next(new AppError('Attachment not found', 404));
  }
  
  // Set appropriate headers
  res.setHeader('Content-Type', attachment.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
  
  // Send the file
  res.sendFile(path.resolve(attachment.path));
});

// Download all submissions for an assignment as a zip
exports.downloadAllSubmissions = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  // Get the assignment
  const assignment = await Assignment.findById(id)
    .populate('className')
    .populate('subjectName');
  
  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }
  
  // Check if user is the assignment's teacher
  if (assignment.teacherId.toString() !== req.user.teacherId.toString()) {
    return next(new AppError('You do not have permission to download submissions for this assignment', 403));
  }
  
  // Get all submissions with student info
  const submissions = await Submission.find({ assignmentId: id })
    .populate({
      path: 'student',
      select: 'name studentId classId userId'
    });
  
  if (submissions.length === 0) {
    return next(new AppError('No submissions found for this assignment', 404));
  }
  
  // Create a zip file
  const zipFileName = `submissions-${id}.zip`;
  const zipFilePath = path.join(__dirname, `../temp/${zipFileName}`);
  
  // Ensure temp directory exists
  const tempDir = path.join(__dirname, '../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  // Create a write stream for the zip
  const output = fs.createWriteStream(zipFilePath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Compression level
  });
  
  // Pipe archive data to the file
  archive.pipe(output);
  
  // For each submission, add a directory with student info
  submissions.forEach(submission => {
    const studentName = submission.student?.name || `Student_${submission.studentId}`;
    const submissionDir = `${studentName} - ${new Date(submission.submittedAt).toISOString().split('T')[0]}`;
    
    // Add a text file with submission details
    const submissionInfo = `
      Assignment: ${assignment.title}
      Class: ${assignment.className || assignment.classId}
      Subject: ${assignment.subjectName || assignment.subjectId}
      Student: ${studentName}
      Submitted: ${new Date(submission.submittedAt).toLocaleString()}
      Status: ${submission.status}
      ${submission.isLate ? 'Late Submission' : 'On Time'}
      ${submission.marks !== undefined ? `Marks: ${submission.marks}/${assignment.totalMarks}` : ''}
      ${submission.feedback ? `Feedback: ${submission.feedback}` : ''}
      
      Answer:
      ${submission.answer || 'No text answer provided'}
    `;
    
    archive.append(submissionInfo, { name: `${submissionDir}/submission-info.txt` });
    
    // Add attachments if any
    if (submission.attachments && submission.attachments.length > 0) {
      submission.attachments.forEach(attachment => {
        const fileStream = fs.createReadStream(attachment.path);
        archive.append(fileStream, { name: `${submissionDir}/${attachment.originalName}` });
      });
    }
  });
  
  // Finalize the archive
  archive.finalize();
  
  // When archive is complete, send the file
  output.on('close', () => {
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);
    res.sendFile(zipFilePath, () => {
      // Delete the file after sending
      fs.unlinkSync(zipFilePath);
    });
  });
  
  // If there's an error, handle it
  archive.on('error', err => {
    return next(new AppError(`Failed to create archive: ${err.message}`, 500));
  });
}); 