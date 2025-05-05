const Submission = require('../models/submissionModel');
const Assignment = require('../models/assignmentModel');
const Student = require('../models/studentModel');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { ensureDirectoryExists, processUploadedFile, deleteFile } = require('../utils/fileUtils');

// Create upload directories if they don't exist
const uploadDir = './uploads/submissions';
ensureDirectoryExists(uploadDir);

// Configure multer for file storage
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'submission-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported. Please upload a valid document, image, or PDF.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

exports.uploadSubmissionFiles = upload.array('attachments', 5);

// Create a submission
exports.createSubmission = async (req, res) => {
  try {
    // Get the assignment ID from URL params
    const assignmentId = req.params.assignmentId;
    
    // Get student ID from user authentication data
    const studentId = req.user.id;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID not found in user data',
      });
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if student already submitted this assignment
    const existingSubmission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment',
      });
    }

    // Process file uploads
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => processUploadedFile(file));
    }

    // Check if submission is late
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;

    // Create submission
    const submission = await Submission.create({
      assignment: assignmentId,
      student: studentId,
      class: assignment.classId,
      subject: assignment.subjectId,
      content: req.body.content || '',
      attachments,
      submittedAt: now,
      isLate,
      status: isLate ? 'late' : 'submitted',
      academicYear: assignment.academicYear || (new Date().getFullYear() + '-' + (new Date().getFullYear() + 1))
    });

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting assignment',
      error: error.message,
    });
  }
};

// Update a submission
exports.updateSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });
    if (submission.student.toString() !== req.user.student.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    if (['graded', 'returned'].includes(submission.status)) return res.status(400).json({ success: false, message: 'Cannot update a graded submission' });

    const assignment = await Assignment.findById(submission.assignment);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    // Process new files
    let newAttachments = [];
    if (req.files && req.files.length > 0) {
      newAttachments = req.files.map(file => processUploadedFile(file));
    }

    let currentAttachments = [...submission.attachments];

    // Handle file removal if specified
    if (req.body.removeAttachments) {
      const toRemove = Array.isArray(req.body.removeAttachments) ? req.body.removeAttachments : [req.body.removeAttachments];
      currentAttachments = currentAttachments.filter(att => {
        if (toRemove.includes(att._id.toString())) {
          deleteFile(att.path);
          return false;
        }
        return true;
      });
    }

    // Update submission
    const updatedSubmission = await Submission.findByIdAndUpdate(
      submissionId,
      {
        $set: {
        content: req.body.content || submission.content,
        attachments: [...currentAttachments, ...newAttachments],
          lastUpdatedAt: new Date()
        }
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedSubmission
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating submission',
      error: error.message
    });
  }
};

// Get all submissions for an assignment (teacher view)
exports.getAssignmentSubmissions = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    if (req.user.role !== 'admin' && assignment.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'firstName lastName rollNumber')
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, count: submissions.length, data: submissions });
  } catch (err) {
    next(err);
  }
};

// Get a student's submission
exports.getStudentSubmission = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;
    console.log(studentId)
    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId
    }).populate('student', 'firstName lastName rollNumber');

    if (!submission) {
      return res.status(200).json({ success: true, data: null });
    }

    if (req.user.role === 'student' && submission.student._id.toString() !== req.user.student.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (req.user.role === 'teacher') {
      const assignment = await Assignment.findById(assignmentId);
      if (assignment && assignment.createdBy.toString() !== req.user.id.toString()) {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
      }
    }

    res.status(200).json({ success: true, data: submission });
  } catch (err) {
    next(err);
  }
};

// Grade a submission
exports.gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { marks, feedback } = req.body;

    if (marks === undefined) {
      return res.status(400).json({ success: false, message: 'Marks are required' });
    }

    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

    const assignment = await Assignment.findById(submission.assignment);
    if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

    if (req.user.role !== 'admin' && assignment.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    if (marks > assignment.totalMarks) {
      return res.status(400).json({ success: false, message: `Marks cannot exceed ${assignment.totalMarks}` });
    }

    const updated = await Submission.findByIdAndUpdate(
      submissionId,
      {
        marks,
        feedback,
        status: 'graded',
        gradedBy: req.user.id,
        gradedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

// Get all submissions of a student
exports.getStudentAllSubmissions = async (req, res, next) => {
  try {
    const studentId = req.params.studentId || req.user.student;

    const student = await Student.findById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    if (req.user.role === 'student' && studentId !== req.user.student.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const submissions = await Submission.find({ student: studentId })
      .populate({ path: 'assignment', select: 'title dueDate totalMarks' })
      .populate('subject', 'name')
      .sort({ submittedAt: -1 });

    res.status(200).json({ success: true, count: submissions.length, data: submissions });
  } catch (err) {
    next(err);
  }
};

// Submit an assignment
exports.submitAssignment = async (req, res) => {
  try {
    // Get the assignment ID from URL params
    const assignmentId = req.params.id;
    
    // Get student ID from user authentication data
    const studentId = req.user.studentId;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID not found in user data',
      });
    }

    // Check if assignment exists
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if student already submitted this assignment
    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId,
    });

    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this assignment',
      });
    }

    // Process file uploads
    let attachments = [];
    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => processUploadedFile(file));
    }

    // Check if submission is late
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isLate = now > dueDate;

    // Create submission
    const submission = await Submission.create({
      assignmentId,
      studentId,
      content: req.body.content || '',
      attachments,
      submittedAt: now,
      isLate,
      status: 'submitted'
    });

    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting assignment',
      error: error.message,
    });
  }
};

// Get student's submission for an assignment
exports.getStudentSubmission = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    const studentId = req.user.studentId;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID not found in user data',
      });
    }

    const submission = await Submission.findOne({
      assignment: assignmentId,
      student: studentId,
    }).populate('attachments');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submission',
      error: error.message,
    });
  }
};

// Get all submissions for an assignment (for teachers)
exports.getAssignmentSubmissions = async (req, res) => {
  try {
    const assignmentId = req.params.assignmentId;
    
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found',
      });
    }

    // Check if user is authorized (teacher who created assignment or admin)
    if (req.user.role !== 'admin' && assignment.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to view these submissions',
      });
    }

    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'firstName lastName email')
      .populate('attachments');

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching submissions',
      error: error.message,
    });
  }
};
