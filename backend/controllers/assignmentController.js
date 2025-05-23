const Assignment = require('../models/assignmentModel');
const Submission = require('../models/submissionModel');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Student = require('../models/studentModel');
const { ensureDirectoryExists, processUploadedFile, deleteFile } = require('../utils/fileUtils');

// Create upload directories if they don't exist
const uploadDir = './uploads/assignments';
ensureDirectoryExists(uploadDir);

// Multer configuration
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'assignment-' + uniqueSuffix + ext);
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
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

exports.uploadAssignmentFiles = upload.array('attachments', 5);

/**
 * Checks if an assignment is past due and updates related submissions if needed
 * @param {Object} assignment - The assignment object to check
 * @returns {Promise<boolean>} - True if any submissions were updated
 */
const checkAssignmentDueDate = async (assignment) => {
  const now = new Date();
  const dueDate = new Date(assignment.dueDate);
  
  // If assignment isn't past due yet, no need to update anything
  if (dueDate >= now) return false;
  
  // Find submissions that were submitted after the due date but aren't marked as late
  const updatedSubmissions = await Submission.updateMany(
    {
      assignment: assignment._id,
      status: 'submitted',
      submittedAt: { $gt: dueDate },
      isLate: false
    },
    { 
      status: 'late',
      isLate: true 
    }
  );
  
  return updatedSubmissions.modifiedCount > 0;
};

// Create assignment
exports.createAssignment = async (req, res) => {
  try {
    let attachments = [];

    if (req.files && req.files.length > 0) {
      attachments = req.files.map(file => processUploadedFile(file));
    }

    if (!req.body.academicYear) {
      const currentYear = new Date().getFullYear();
      req.body.academicYear = `${currentYear}`;
    }

    const assignment = await Assignment.create({
      ...req.body,
      createdBy: req.user.id,
      attachments
    });

    res.status(201).json({
      success: true,
      data: assignment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error while creating assignment' });
  }
};

// Update assignment
exports.updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (req.user.role !== 'admin' && assignment.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this assignment' });
    }

    let newAttachments = [];
    if (req.files && req.files.length > 0) {
      newAttachments = req.files.map(file => processUploadedFile(file));
    }

    let currentAttachments = [...assignment.attachments];

    if (req.body.removeAttachments) {
      const attachmentsToRemove = Array.isArray(req.body.removeAttachments)
        ? req.body.removeAttachments
        : [req.body.removeAttachments];

      const removedAttachments = [];
      currentAttachments = currentAttachments.filter(attachment => {
        const shouldRemove = attachmentsToRemove.includes(attachment._id.toString());
        if (shouldRemove) {
          removedAttachments.push(attachment);
        }
        return !shouldRemove;
      });

      // Delete the physical files
      for (const attachment of removedAttachments) {
        deleteFile(attachment.path);
      }
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        attachments: [...currentAttachments, ...newAttachments]
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      success: true,
      data: updatedAssignment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error while updating assignment' });
  }
};

// Delete assignment
exports.deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (req.user.role !== 'admin' && assignment.createdBy.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this assignment' });
    }

    // Delete physical files
    for (const attachment of assignment.attachments) {
      deleteFile(attachment.path);
    }

    await Assignment.findByIdAndDelete(req.params.id);
    await Submission.deleteMany({ assignment: req.params.id });

    res.status(200).json({ success: true, data: null });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error while deleting assignment' });
  }
};

// Get all assignments
exports.getAllAssignments = async (req, res) => {
  try {
    const filter = {};
    if (req.query.classId) filter.classId = req.query.classId;
    if (req.query.subjectId) filter.subjectId = req.query.subjectId;
    if (req.query.academicYear) filter.academicYear = req.query.academicYear;
    if (req.user.role === 'teacher') filter.createdBy = req.user.id;
    if (req.user.role === 'student') {
      filter.isDraft = false;
    }

    const assignments = await Assignment.find(filter)
      .populate('classId', 'name section')
      .populate('subjectId', 'name')
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });
      
    // Check for past due assignments and update submission statuses
    let updatedCount = 0;
    for (const assignment of assignments) {
      if (await checkAssignmentDueDate(assignment)) {
        updatedCount++;
      }
    }
    
    if (updatedCount > 0) {
      console.log(`Updated ${updatedCount} assignments with late submission statuses`);
    }

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching assignments' });
  }
};

// Get assignment by ID
exports.getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('classId', 'name section')
      .populate('subjectId', 'name')
      .populate('createdBy', 'firstName lastName');

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    if (assignment.isDraft &&
      (req.user.role === 'student' || 
       (req.user.role === 'teacher' && assignment.createdBy.toString() !== req.user.id.toString()))) {
      return res.status(403).json({ success: false, message: 'Access denied to draft assignment' });
    }
    
    // Check if assignment is past due and update submission statuses if needed
    const updatedSubmissions = await checkAssignmentDueDate(assignment);
    if (updatedSubmissions) {
      console.log(`Updated late submission statuses for assignment: ${assignment._id}`);
    }

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching assignment' });
  }
};

// Get assignments by class
exports.getClassAssignments = async (req, res) => {
  try {
    const filter = { classId: req.params.classId };
    if (req.user.role === 'student') filter.isDraft = false;
    if (req.user.role === 'teacher') filter.createdBy = req.user.id;

    const assignments = await Assignment.find(filter)
      .populate('subjectId', 'name')
      .populate('createdBy', 'firstName lastName')
      .sort({ dueDate: 1 });

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching class assignments' });
  }
};

// Get teacher's assignments
exports.getTeacherAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user.id })
      .populate('classId', 'name section')
      .populate('subjectId', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error fetching teacher assignments' });
  }
};

// Get student assignments
exports.getStudentAssignments = async (req, res) => {
  try {
    const student = await Student.findById(req.user.studentId).populate('classId');
    if (!student) return res.status(404).json({ message: 'Student not found' });

    const { subject, status, search } = req.query;
    const query = { classId: student.classId._id };

    if (subject) query.subjectId = subject;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let assignments = await Assignment.find(query)
      .populate('classId')
      .populate('subjectId')
      .populate('teacherId', 'firstName lastName')
      .sort({ createdAt: -1 });

    if (status) {
      const submissions = await Submission.find({ 
        studentId: student._id,
        assignmentId: { $in: assignments.map(a => a._id) }
      });

      const submissionMap = new Map();
      submissions.forEach(sub => submissionMap.set(sub.assignmentId.toString(), sub));

      if (status === 'submitted' || status === 'graded') {
        assignments = assignments.filter(a => {
          const sub = submissionMap.get(a._id.toString());
          return sub && (status === 'submitted' || sub.status === 'graded');
        });
      } else if (status === 'pending') {
        assignments = assignments.filter(a => !submissionMap.has(a._id.toString()));
      }
    }

    res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error while fetching assignments', error: error.message });
  }
};
