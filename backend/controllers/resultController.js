const Result = require('../models/resultModel');
const Student = require('../models/studentModel');
const Class = require('../models/classModel');
const Subject = require('../models/subjectModel');
const Teacher = require('../models/teacherModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get all results (for admin, with filters)
exports.getAllResults = catchAsync(async (req, res, next) => {
  const {
    classId,
    subjectId,
    studentId,
    teacherId,
    term,
    academicYear,
    examType,
    status
  } = req.query;

  // Build filter object
  const filter = {};
  if (classId) filter.class = classId;
  if (subjectId) filter.subject = subjectId;
  if (studentId) filter.student = studentId;
  if (teacherId) filter.teacher = teacherId;
  if (term) filter.term = term;
  if (academicYear) filter.academicYear = academicYear;
  if (examType) filter.examType = examType;
  if (status) filter.status = status;

  const results = await Result.find(filter)
    .populate('student', 'firstName lastName')
    .populate('class', 'name grade section')
    .populate('subject', 'name')
    .populate('teacher', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: {
      results
    }
  });
});

// Get results for a specific class (for teachers and admins)
exports.getClassResults = catchAsync(async (req, res, next) => {
  const { classId } = req.params;
  const { subjectId, term, academicYear, examType, status } = req.query;

  // Check if class exists
  const classExists = await Class.findById(classId);
  if (!classExists) {
    return next(new AppError('Class not found', 404));
  }

  // Build filter object
  const filter = { class: classId };
  if (subjectId) filter.subject = subjectId;
  if (term) filter.term = term;
  if (academicYear) filter.academicYear = academicYear;
  if (examType) filter.examType = examType;
  if (status) filter.status = status;

  // For teachers, only show results they entered
  if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return next(new AppError('Teacher profile not found', 404));
    }
    filter.teacher = teacher._id;
  }

  const results = await Result.find(filter)
    .populate('student', 'firstName lastName')
    .populate('subject', 'name')
    .populate('teacher', 'firstName lastName')
    .sort({ 'student.firstName': 1, 'subject.name': 1 });

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: {
      results
    }
  });
});

// Get results for a specific student (for students, parents, teachers, and admins)
exports.getStudentResults = catchAsync(async (req, res, next) => {
  const { studentId } = req.params;
  const { classId, subjectId, term, academicYear, examType, status } = req.query;

  // Check if student exists
  const student = await Student.findById(studentId);
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  // Build filter object
  const filter = { student: studentId };
  if (classId) filter.class = classId;
  if (subjectId) filter.subject = subjectId;
  if (term) filter.term = term;
  if (academicYear) filter.academicYear = academicYear;
  if (examType) filter.examType = examType;
  
  // Only admins and teachers can see unpublished results
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') {
    filter.status = 'Published';
  } else if (status) {
    filter.status = status;
  }

  const results = await Result.find(filter)
    .populate('class', 'name grade section')
    .populate('subject', 'name')
    .populate('teacher', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: {
      results
    }
  });
});

// Get results for subjects taught by a teacher
exports.getTeacherResults = catchAsync(async (req, res, next) => {
  const { teacherId } = req.params;
  const { classId, subjectId, term, academicYear, examType, status } = req.query;

  // Check if teacher exists
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    return next(new AppError('Teacher not found', 404));
  }

  // Build filter object
  const filter = { teacher: teacherId };
  if (classId) filter.class = classId;
  if (subjectId) filter.subject = subjectId;
  if (term) filter.term = term;
  if (academicYear) filter.academicYear = academicYear;
  if (examType) filter.examType = examType;
  if (status) filter.status = status;

  const results = await Result.find(filter)
    .populate('student', 'firstName lastName')
    .populate('class', 'name grade section')
    .populate('subject', 'name')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: {
      results
    }
  });
});

// Create new result (for teachers and admins)
exports.createResult = catchAsync(async (req, res, next) => {
  // Validate if student exists
  const student = await Student.findById(req.body.student);
  if (!student) {
    return next(new AppError('Student not found', 404));
  }

  // Validate if class exists
  const classExists = await Class.findById(req.body.class);
  if (!classExists) {
    return next(new AppError('Class not found', 404));
  }

  // Validate if subject exists
  const subject = await Subject.findById(req.body.subject);
  if (!subject) {
    return next(new AppError('Subject not found', 404));
  }

  // Set teacher ID (for teacher users)
  if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return next(new AppError('Teacher profile not found', 404));
    }
    req.body.teacher = teacher._id;
  }

  // Check if result already exists for the same combination
  const existingResult = await Result.findOne({
    student: req.body.student,
    class: req.body.class,
    subject: req.body.subject,
    term: req.body.term,
    academicYear: req.body.academicYear,
    examType: req.body.examType
  });

  if (existingResult) {
    return next(new AppError('Result already exists for this student, subject, term, and exam type', 400));
  }

  const result = await Result.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      result
    }
  });
});

// Update result (for teachers and admins)
exports.updateResult = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  // Find result and check if it exists
  const result = await Result.findById(id);
  if (!result) {
    return next(new AppError('Result not found', 404));
  }

  // Teachers can only update their own results that are not published
  if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    
    if (!teacher || !result.teacher.equals(teacher._id)) {
      return next(new AppError('You are not authorized to update this result', 403));
    }
    
    if (result.status === 'Published') {
      return next(new AppError('Cannot update a published result', 400));
    }
  }

  // Update result
  const updatedResult = await Result.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      result: updatedResult
    }
  });
});

// Delete result (for admins only)
exports.deleteResult = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const result = await Result.findByIdAndDelete(id);

  if (!result) {
    return next(new AppError('Result not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Publish results (for admins only)
exports.publishResults = catchAsync(async (req, res, next) => {
  const { resultIds } = req.body;

  if (!resultIds || !Array.isArray(resultIds) || resultIds.length === 0) {
    return next(new AppError('Please provide result IDs to publish', 400));
  }

  const updatePromises = resultIds.map(id => 
    Result.findByIdAndUpdate(id, {
      status: 'Published',
      publishedBy: req.user._id,
      publishedDate: new Date()
    })
  );

  await Promise.all(updatePromises);

  res.status(200).json({
    status: 'success',
    message: `${resultIds.length} results have been published`
  });
});

// Get result statistics (for admins and teachers)
exports.getResultStatistics = catchAsync(async (req, res, next) => {
  const { classId, subjectId, term, academicYear, examType } = req.query;

  // Build filter object
  const filter = {};
  if (classId) filter.class = classId;
  if (subjectId) filter.subject = subjectId;
  if (term) filter.term = term;
  if (academicYear) filter.academicYear = academicYear;
  if (examType) filter.examType = examType;

  // Add teacher filter for teacher users
  if (req.user.role === 'teacher') {
    const teacher = await Teacher.findOne({ user: req.user._id });
    if (!teacher) {
      return next(new AppError('Teacher profile not found', 404));
    }
    filter.teacher = teacher._id;
  }

  // Get statistics
  const stats = await Result.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        count: { $sum: 1 },
        avgPercentage: { $avg: '$percentage' },
        minPercentage: { $min: '$percentage' },
        maxPercentage: { $max: '$percentage' },
        gradeDistribution: {
          $push: '$grade'
        }
      }
    },
    {
      $project: {
        _id: 0,
        count: 1,
        avgPercentage: { $round: ['$avgPercentage', 2] },
        minPercentage: { $round: ['$minPercentage', 2] },
        maxPercentage: { $round: ['$maxPercentage', 2] },
        gradeDistribution: 1
      }
    }
  ]);

  // Process grade distribution
  const gradeDistribution = stats.length > 0 ? stats[0].gradeDistribution.reduce((acc, grade) => {
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {}) : {};

  res.status(200).json({
    status: 'success',
    data: {
      statistics: stats.length > 0 ? {
        ...stats[0],
        gradeDistribution
      } : {
        count: 0,
        avgPercentage: 0,
        minPercentage: 0,
        maxPercentage: 0,
        gradeDistribution: {}
      }
    }
  });
}); 