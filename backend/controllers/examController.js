const Exam = require('../models/examModel');
const ExamResult = require('../models/examResultModel'); // Use the correct model for results
const Class = require('../models/classModel');
const Student = require('../models/studentModel');
const Subject = require('../models/subjectModel');

exports.createExam = async (req, res) => {
  try {
    const {
      name,
      type,
      startDate,
      endDate,
      duration,
      totalMarks,
      passingMarks,
      description,
      academicYear,
      class: classIds,
      subjects
    } = req.body;

    // Validate class IDs
    const classes = await Class.find({ _id: { $in: classIds } }).lean();
    if (classes.length !== classIds.length) {
      return res.status(404).json({ success: false, message: 'One or more classes are invalid' });
    }

    // Validate subject IDs
    const allSubjects = await Subject.find({ _id: { $in: subjects } }).lean();
    if (allSubjects.length !== subjects.length) {
      return res.status(400).json({ success: false, message: 'One or more subjects are invalid' });
    }

    // Build classSubjects array with only the subjects available to each class
    const classSubjects = classes.map(cls => {
      const availableSubjectIds = cls.subjects.map(s => s.subject.toString());
      const matchedSubjects = subjects.filter(subId => availableSubjectIds.includes(subId));
      return {
        class: cls._id,
        subjects: matchedSubjects
      };
    });

    const exam = await Exam.create({
      name,
      type,
      startDate,
      endDate,
      duration,
      totalMarks,
      passingMarks,
      description,
      academicYear,
      classSubjects,
      createdBy: req.user._id // Make sure req.user is available (middleware must decode token)
    });

    return res.status(201).json({ success: true, data: exam });

  } catch (error) {
    console.error('Create Exam Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getAllExams = async (req, res) => {
  try {
    const { academicYear, type, status, class: classId } = req.query;
    const filter = {};

    if (academicYear) filter.academicYear = academicYear;
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (classId) filter['classSubjects.class'] = classId;

    const exams = await Exam.find(filter)
      .populate('classSubjects.class', 'name')
      .populate('classSubjects.subjects', 'name')
      .populate('createdBy', 'firstName lastName')
      .sort('-startDate');

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams
    });

  } catch (error) {
    console.error('Get All Exams Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTeacherExams = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { academicYear, status } = req.query;

    const teacherClasses = await Class.find({
      'subjects.teacher': teacherId
    }).distinct('_id');

    const filter = {
      'classSubjects.class': { $in: teacherClasses }
    };

    if (academicYear) filter.academicYear = academicYear;
    if (status) filter.status = status;

    const exams = await Exam.find(filter)
      .populate('classSubjects.class', 'name')
      .populate('classSubjects.subjects', 'name')
      .sort('-startDate');

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams
    });

  } catch (error) {
    console.error('Get Teacher Exams Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { results } = req.body;

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    if (['Upcoming', 'Cancelled'].includes(exam.status)) {
      return res.status(400).json({ success: false, message: 'Cannot submit results for this exam' });
    }

    const examClassIds = exam.classSubjects.map(cs => cs.class.toString());
    const studentIds = results.map(r => r.student);

    const validCount = await Student.countDocuments({
      _id: { $in: studentIds },
      class: { $in: examClassIds }
    });

    if (validCount !== studentIds.length) {
      return res.status(400).json({ success: false, message: 'One or more students do not belong to associated classes' });
    }

    const examResults = await ExamResult.create(
      results.map(result => ({
        ...result,
        exam: examId,
        class: result.class,
        markedBy: req.user._id,
        academicYear: exam.academicYear
      }))
    );

    return res.status(201).json({
      success: true,
      count: examResults.length,
      data: examResults
    });

  } catch (error) {
    console.error('Submit Exam Results Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { student } = req.query;

    const filter = { exam: examId };
    if (student) filter.student = student;

    const results = await ExamResult.find(filter)
      .populate('student', 'firstName lastName rollNumber')
      .populate('subjectResults.subject', 'name')
      .populate('markedBy', 'firstName lastName');

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error('Get Exam Results Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
