const Exam = require('../models/examModel');
const ExamResult = require('../models/examResultModel');
const Class = require('../models/classModel');
const Student = require('../models/studentModel');
const Subject = require('../models/subjectModel');
const Notification = require('../models/notificationModel'); 
const TimeTable  = require('../models/timetableModel');

/**

 * @param {Object} exam - The exam object to update
 * @returns {boolean} - True if status was updated, false otherwise
 */
const updateExamStatusByDate = (exam) => {
  if (exam.status === 'Cancelled') return false; 
  
  const now = new Date();
  const startDate = new Date(exam.startDate);
  const endDate = new Date(exam.endDate);
  let statusUpdated = false;
  
  if (exam.status === 'Upcoming' && startDate <= now && endDate >= now) {
    exam.status = 'Ongoing';
    statusUpdated = true;
  } else if ((exam.status === 'Upcoming' || exam.status === 'Ongoing') && endDate < now) {
    exam.status = 'Completed';
    statusUpdated = true;
  }
  
  return statusUpdated;
};

exports.createExam = async (req, res) => {
  const {
    name,
    type,
    description,
    totalMarks,
    passingMarks,
    classSubjects, // coming directly from frontend
    startDate,
    endDate,
    academicYear
  } = req.body;

  const createdBy = req.user._id; // Ensure user is attached to req (via auth middleware)

  try {
    const newExam = await Exam.create({
      name,
      type,
      description,
      totalMarks,
      passingMarks,
      classSubjects,
      startDate,
      endDate,
      createdBy,
      academicYear
    });
   // 2. Extract class IDs from classSubjects
   const classIds = classSubjects.map(cs => cs.class._id || cs.class);

   // 3. Fetch student users in these classes
   const students = await Student.find(
     { class: { $in: classIds } },
     '_id'
   );

   const studentIds = students.map(s => s._id);
   const parentIds = students.map(s => s.parent);

   // 4. Create a single notification with users list
   await Notification.create({
     title: 'New Exam Scheduled',
     message: `An exam "${name}" has been scheduled. Start Date: ${startDate}, End Date: ${endDate}.`,
     type: 'announcement',
     recipients: {
       users: studentIds,
       parents: parentIds
     },
     relatedTo: {
       model: 'Class',
       documentId: classIds[0] // You can use null or one of the class IDs
     },
     createdBy
   });

    res.status(201).json({ success: true, data: newExam });
  } catch (err) {
    console.error('Create Exam Error:', err);
    res.status(500).json({
      success: false,
      message: 'Failed to create exam',
      error: err.message
    });
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

    // Update exam statuses based on dates
    const updatedExams = [];
    for (const exam of exams) {
      if (updateExamStatusByDate(exam)) {
        updatedExams.push(exam._id);
        await exam.save();
      }
    }

    if (updatedExams.length > 0) {
      console.log(`Updated status for ${updatedExams.length} exams`);
    }

    return res.status(200).json({ success: true, count: exams.length, data: exams });
  } catch (error) {
    console.error('Get All Exams Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getExam = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('classSubjects.class', 'name')
      .populate('classSubjects.subjects', 'name')
      .populate('createdBy', 'firstName lastName');

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    // Update exam status based on dates if needed
    if (updateExamStatusByDate(exam)) {
      await exam.save();
    }

    return res.status(200).json({ success: true, data: exam });
  } catch (error) {
    console.error('Get Exam Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    return res.status(200).json({ success: true, data: exam });
  } catch (error) {
    console.error('Update Exam Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found' });
    }

    await ExamResult.deleteMany({ exam: exam._id });

    return res.status(200).json({ success: true, message: 'Exam and related results deleted' });
  } catch (error) {
    console.error('Delete Exam Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.getTeacherExams = async (req, res) => {
  try {
    const teacherId = req.user._id;
    const { academicYear, status } = req.query;

    // 1. Find timetable entries
    const timetableEntries = await TimeTable.find({ 'periods.teacher': teacherId })
      .select('class periods.subject periods.teacher');

    // 2. Extract unique class-subject pairs
    const classSubjectPairs = new Set();

    for (const entry of timetableEntries) {
      const classId = entry.class?.toString();
      if (!classId) continue;

      for (const period of entry.periods) {
        if (period.teacher?.toString() === teacherId.toString()) {
          const subjectId = period.subject?.toString();
          if (subjectId) {
            classSubjectPairs.add(`${classId}_${subjectId}`);
          }
        }
      }
    }

    if (classSubjectPairs.size === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'No class-subjects assigned to this teacher.'
      });
    }

    // 3. Find exams that match ANY of the class-subject pairs
    const exams = await Exam.find()
      .populate('classSubjects.class', 'name')
      .populate('classSubjects.subjects', 'name')
      .sort('-startDate');

    // 4. Filter exams to include only those matching teacher's class-subject pairs
    const filteredExams = exams.filter(exam =>
      exam.classSubjects.some(cs =>
        cs.class && cs.subjects.some(sub =>
          classSubjectPairs.has(`${cs.class._id}_${sub._id}`)
        )
      )
    );

    // 5. Apply additional filters
    const finalExams = filteredExams.filter(exam => {
      if (academicYear && exam.academicYear !== academicYear) return false;
      if (status && exam.status !== status) return false;
      return true;
    });

    // 6. Update exam statuses by date
    for (const exam of finalExams) {
      if (updateExamStatusByDate(exam)) {
        await exam.save();
      }
    }

    return res.status(200).json({
      success: true,
      count: finalExams.length,
      data: finalExams
    });

  } catch (error) {
    console.error('Get Teacher Exams Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


exports.submitExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { results } = req.body; // Each result contains: student, class, subjectResults (array with one subject)

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

    const savedResults = [];

    for (const result of results) {
      const { student, class: classId, subjectResults, totalMarksObtained, percentage, status, grade } = result;
      const subject = subjectResults[0].subject;

      let examResult = await ExamResult.findOne({ exam: examId, student });

      if (examResult) {
        const existingIndex = examResult.subjectResults.findIndex(
          s => s.subject.toString() === subject
        );

        if (existingIndex > -1) {
          // Update subject
          examResult.subjectResults[existingIndex] = subjectResults[0];
        } else {
          // Add new subject
          examResult.subjectResults.push(subjectResults[0]);
        }
        
        // Recalculate totals
        examResult.totalMarksObtained = totalMarksObtained;
        examResult.percentage = percentage;
        examResult.status = status;
        if (grade) examResult.grade = grade;
      } else {
        // Create new exam result with all required fields
        examResult = new ExamResult({
          exam: examId,
          student,
          class: classId,
          subjectResults: subjectResults,
          totalMarksObtained,
          percentage,
          status,
          grade,
          markedBy: req.user._id,
          academicYear: exam.academicYear
        });
      }

      await examResult.save(); // Triggers pre-save hook
      savedResults.push(examResult);
    }

    return res.status(200).json({
      success: true,
      count: savedResults.length,
      data: savedResults
    });
  } catch (error) {
    console.error('Submit Exam Results Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error',
      stack: error.stack
    });
  }
};

exports.getExamResults = async (req, res) => {
  try {
    const { examId } = req.params;
    const { student } = req.query;

    const filter = { exam: examId };
    if (student) filter.student = student;
    console.log(filter)
    const results = await ExamResult.find(filter)
      .populate('student', 'firstName lastName ')
      .populate('subjectResults.subject', 'name')
      .populate('markedBy', 'firstName lastName');
    console.log(results)

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

exports.getExamByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { academicYear } = req.query;
    const exams = await Exam.find({ 'classSubjects.class': classId })
      .populate('classSubjects.class', 'name')
      .populate('classSubjects.subjects', 'name')
      .populate('createdBy', 'firstName lastName');

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams
    });
  } catch (error) {
    console.error('Get Exam By Class Error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};



