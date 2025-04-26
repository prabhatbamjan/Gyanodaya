const Assignment = require('../models/assignmentModel');
const Submission = require('../models/submissionModel');
const Class = require('../models/classModel');
const Subject = require('../models/subjectModel');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Set up storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/assignments');
    
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

// Get all assignments (with filtering options)
exports.getAllAssignments = catchAsync(async (req, res, next) => {
  const {
    classId,
    subjectId,
    teacherId,
    isDraft,
    fromDate,
    toDate,
    search
  } = req.query;

  // Build query filter
  const filter = {};
  
  if (classId) filter.classId = classId;
  if (subjectId) filter.subjectId = subjectId;
  if (teacherId) filter.teacherId = teacherId;
  
  if (isDraft !== undefined) {
    filter.isDraft = isDraft === 'true';
  }
  
  if (fromDate || toDate) {
    filter.dueDate = {};
    if (fromDate) filter.dueDate.$gte = new Date(fromDate);
    if (toDate) filter.dueDate.$lte = new Date(toDate);
  }
  
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  const assignments = await Assignment.find(filter)
    .populate('classId', 'name')
    .populate('subjectId', 'name')
    .populate('teacherId', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: assignments.length,
    data: {
      assignments
    }
  });
});

// Get assignment by ID
exports.getAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('classId', 'name')
    .populate('subjectId', 'name')
    .populate('teacherId', 'name');

  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      assignment
    }
  });
});

// Create new assignment
exports.createAssignment = catchAsync(async (req, res, next) => {
  // Validate if class exists
  const classExists = await Class.findById(req.body.classId);
  if (!classExists) {
    return next(new AppError('Class not found', 404));
  }

  // Validate if subject exists
  const subjectExists = await Subject.findById(req.body.subjectId);
  if (!subjectExists) {
    return next(new AppError('Subject not found', 404));
  }

  // Validate if teacher exists
  const teacherExists = await Teacher.findById(req.body.teacherId);
  if (!teacherExists) {
    return next(new AppError('Teacher not found', 404));
  }

  const assignment = await Assignment.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      assignment
    }
  });
});

// Update assignment
exports.updateAssignment = catchAsync(async (req, res, next) => {
  // Find assignment and check if it exists
  const existingAssignment = await Assignment.findById(req.params.id);
  if (!existingAssignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }

  // If updating classId, validate if class exists
  if (req.body.classId) {
    const classExists = await Class.findById(req.body.classId);
    if (!classExists) {
      return next(new AppError('Class not found', 404));
    }
  }

  // If updating subjectId, validate if subject exists
  if (req.body.subjectId) {
    const subjectExists = await Subject.findById(req.body.subjectId);
    if (!subjectExists) {
      return next(new AppError('Subject not found', 404));
    }
  }

  // Update assignment
  const assignment = await Assignment.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  ).populate('classId', 'name')
   .populate('subjectId', 'name')
   .populate('teacherId', 'name');

  res.status(200).json({
    status: 'success',
    data: {
      assignment
    }
  });
});

// Delete assignment
exports.deleteAssignment = catchAsync(async (req, res, next) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);

  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Get assignments for teacher dashboard
exports.getTeacherAssignments = catchAsync(async (req, res, next) => {
  const teacherId = req.params.teacherId;
  
  // Validate if teacher exists
  const teacherExists = await Teacher.findById(teacherId);
  if (!teacherExists) {
    return next(new AppError('Teacher not found', 404));
  }
  
  const assignments = await Assignment.find({ 
    teacherId,
    isDraft: false 
  })
    .populate('classId', 'name')
    .populate('subjectId', 'name')
    .sort({ dueDate: 1 })
    .limit(5);

  res.status(200).json({
    status: 'success',
    results: assignments.length,
    data: {
      assignments
    }
  });
});

// Get classes for a teacher (to use in assignment form)
exports.getTeacherClasses = catchAsync(async (req, res, next) => {
  const classes = await Class.find({ teacherId: req.user.teacherId })
    .sort({ name: 1 });
  
  res.status(200).json({
    status: 'success',
    results: classes.length,
    data: classes
  });
});

// Get subjects for a teacher (to use in assignment form)
exports.getTeacherSubjects = catchAsync(async (req, res, next) => {
  const subjects = await Subject.find({ teacherId: req.user.teacherId })
    .sort({ name: 1 });
  
  res.status(200).json({
    status: 'success',
    results: subjects.length,
    data: subjects
  });
});

// Download an assignment attachment
exports.downloadAttachment = catchAsync(async (req, res, next) => {
  const { id, attachmentId } = req.params;
  
  const assignment = await Assignment.findById(id);
  
  if (!assignment) {
    return next(new AppError('No assignment found with that ID', 404));
  }
  
  // Find the specific attachment
  const attachment = assignment.attachments.id(attachmentId);
  
  if (!attachment) {
    return next(new AppError('Attachment not found', 404));
  }
  
  // Set appropriate headers
  res.setHeader('Content-Type', attachment.mimetype);
  res.setHeader('Content-Disposition', `attachment; filename="${attachment.originalName}"`);
  
  // Send the file
  res.sendFile(path.resolve(attachment.path));
}); 