const Result = require('../models/resultModel');
const Student = require('../models/studentModel');
const Class = require('../models/classModel');
const Subject = require('../models/subjectModel');
const Teacher = require('../models/teacherModel');

// Helper function to return error
const sendError = (res, message, statusCode = 400) => {
  return res.status(statusCode).json({ status: 'error', message });
};

// Get all results
exports.getAllResults = async (req, res) => {
  try {
    const {
      classId, subjectId, studentId, teacherId,
      term, academicYear, examType, status
    } = req.query;

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

    res.status(200).json({ status: 'success', results: results.length, data: { results } });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getClassResults = async (req, res) => {
  try {
    const { classId } = req.params;
    const { subjectId, term, academicYear, examType, status } = req.query;

    const classExists = await Class.findById(classId);
    if (!classExists) return sendError(res, 'Class not found', 404);

    const filter = { class: classId };
    if (subjectId) filter.subject = subjectId;
    if (term) filter.term = term;
    if (academicYear) filter.academicYear = academicYear;
    if (examType) filter.examType = examType;
    if (status) filter.status = status;

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (!teacher) return sendError(res, 'Teacher profile not found', 404);
      filter.teacher = teacher._id;
    }

    const results = await Result.find(filter)
      .populate('student', 'firstName lastName')
      .populate('subject', 'name')
      .populate('teacher', 'firstName lastName')
      .sort({ 'student.firstName': 1, 'subject.name': 1 });

    res.status(200).json({ status: 'success', results: results.length, data: { results } });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { classId, subjectId, term, academicYear, examType, status } = req.query;

    const student = await Student.findById(studentId);
    if (!student) return sendError(res, 'Student not found', 404);

    const filter = { student: studentId };
    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;
    if (term) filter.term = term;
    if (academicYear) filter.academicYear = academicYear;
    if (examType) filter.examType = examType;

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

    res.status(200).json({ status: 'success', results: results.length, data: { results } });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getTeacherResults = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { classId, subjectId, term, academicYear, examType, status } = req.query;

    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return sendError(res, 'Teacher not found', 404);

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

    res.status(200).json({ status: 'success', results: results.length, data: { results } });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.createResult = async (req, res) => {
  try {
    const student = await Student.findById(req.body.student);
    if (!student) return sendError(res, 'Student not found', 404);

    const classExists = await Class.findById(req.body.class);
    if (!classExists) return sendError(res, 'Class not found', 404);

    const subject = await Subject.findById(req.body.subject);
    if (!subject) return sendError(res, 'Subject not found', 404);

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (!teacher) return sendError(res, 'Teacher profile not found', 404);
      req.body.teacher = teacher._id;
    }

    const existingResult = await Result.findOne({
      student: req.body.student,
      class: req.body.class,
      subject: req.body.subject,
      term: req.body.term,
      academicYear: req.body.academicYear,
      examType: req.body.examType
    });

    if (existingResult) {
      return sendError(res, 'Result already exists for this combination', 400);
    }

    const result = await Result.create(req.body);
    res.status(201).json({ status: 'success', data: { result } });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.updateResult = async (req, res) => {
  try {
    const result = await Result.findById(req.params.id);
    if (!result) return sendError(res, 'Result not found', 404);

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (!teacher || !result.teacher.equals(teacher._id)) {
        return sendError(res, 'Not authorized to update this result', 403);
      }
      if (result.status === 'Published') {
        return sendError(res, 'Cannot update a published result', 400);
      }
    }

    const updatedResult = await Result.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ status: 'success', data: { result: updatedResult } });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.deleteResult = async (req, res) => {
  try {
    const result = await Result.findByIdAndDelete(req.params.id);
    if (!result) return sendError(res, 'Result not found', 404);

    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.publishResults = async (req, res) => {
  try {
    const { resultIds } = req.body;
    if (!Array.isArray(resultIds) || resultIds.length === 0) {
      return sendError(res, 'Please provide result IDs to publish', 400);
    }

    await Promise.all(resultIds.map(id =>
      Result.findByIdAndUpdate(id, {
        status: 'Published',
        publishedBy: req.user._id,
        publishedDate: new Date()
      })
    ));

    res.status(200).json({
      status: 'success',
      message: `${resultIds.length} results have been published`
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};

exports.getResultStatistics = async (req, res) => {
  try {
    const { classId, subjectId, term, academicYear, examType } = req.query;

    const filter = {};
    if (classId) filter.class = classId;
    if (subjectId) filter.subject = subjectId;
    if (term) filter.term = term;
    if (academicYear) filter.academicYear = academicYear;
    if (examType) filter.examType = examType;

    if (req.user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: req.user._id });
      if (!teacher) return sendError(res, 'Teacher profile not found', 404);
      filter.teacher = teacher._id;
    }

    const stats = await Result.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          avgPercentage: { $avg: '$percentage' },
          minPercentage: { $min: '$percentage' },
          maxPercentage: { $max: '$percentage' },
          gradeDistribution: { $push: '$grade' }
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

    const gradeDistribution = stats.length > 0 ? stats[0].gradeDistribution.reduce((acc, grade) => {
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {}) : {};

    res.status(200).json({
      status: 'success',
      data: {
        statistics: stats.length > 0 ? { ...stats[0], gradeDistribution } : {
          count: 0, avgPercentage: 0, minPercentage: 0, maxPercentage: 0, gradeDistribution: {}
        }
      }
    });
  } catch (err) {
    sendError(res, err.message, 500);
  }
};
