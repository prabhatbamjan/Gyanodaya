const Timetable = require('../models/timetableModel');
const Class = require('../models/classModel');
const Teacher = require('../models/teacherModel');
const Subject = require('../models/subjectModel');

// Get all timetables
exports.getAllTimetables = async (req, res) => {
  try {
    const timetables = await Timetable.find()
      .populate('class', 'name grade section')
      .populate('periods.subject', 'name code')
      .populate('periods.teacher', 'firstName lastName phone email');

    res.status(200).json({ success: true, data: timetables });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get timetable by class
exports.getTimetableByClass = async (req, res) => {
  try {
    const timetable = await Timetable.find({ class: req.params.classId })
      .populate('class', 'name grade section')
      .populate('periods.subject', 'name code')
      .populate('periods.teacher', 'firstName lastName phone email');

    if (!timetable || timetable.length === 0) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    res.status(200).json({ success: true, data: timetable });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get timetable by ID
exports.getTimetableById = async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('class', 'name grade section')
      .populate('periods.subject', 'name code')
      .populate('periods.teacher', 'firstName lastName phone email');

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    res.status(200).json({ success: true, data: timetable });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Create a timetable
exports.createTimetable = async (req, res) => {
  try {
    const { class: classId, day, periods, academicYear } = req.body;

    const classExists = await Class.findById(classId);
    if (!classExists) {
      return res.status(400).json({ success: false, message: 'Class not found' });
    }

    const existingTimetable = await Timetable.findOne({ class: classId, day, academicYear });
    if (existingTimetable) {
      return res.status(400).json({ success: false, message: 'Timetable already exists for this class and day' });
    }

    const allTimetablesForDay = await Timetable.find({ day, academicYear });
    const teacherPeriodCount = {};

    allTimetablesForDay.forEach(timetable => {
      timetable.periods.forEach(p => {
        const tId = p.teacher.toString();
        teacherPeriodCount[tId] = (teacherPeriodCount[tId] || 0) + 1;
      });
    });

    for (const period of periods) {
      const { teacher, subject, periodNumber } = period;

      const [teacherExists, subjectExists] = await Promise.all([
        Teacher.findById(teacher),
        Subject.findById(subject)
      ]);

      if (!teacherExists || !subjectExists) {
        return res.status(400).json({ success: false, message: 'Invalid teacher or subject ID' });
      }

      const isConflict = allTimetablesForDay.some(timetable => {
        if (timetable.class.toString() === classId.toString()) return false;

        return timetable.periods.some(p =>
          p.periodNumber === periodNumber && p.teacher.toString() === teacher.toString()
        );
      });

      if (isConflict) {
        return res.status(400).json({
          success: false,
          message: `Conflict: Teacher already assigned to period ${periodNumber} in another class on ${day}`
        });
      }

      const teacherCount = teacherPeriodCount[teacher] || 0;
      if (teacherCount >= 7) {
        return res.status(400).json({
          success: false,
          message: `Teacher load exceeded: Teacher already has ${teacherCount} periods on ${day}`
        });
      }

      teacherPeriodCount[teacher] = teacherCount + 1;

      await Teacher.findByIdAndUpdate(teacher, { $addToSet: { classes: classId } });
      await Class.findByIdAndUpdate(classId, { $addToSet: { teachers: teacher } });
    }

    const timetable = await Timetable.create(req.body);

    res.status(201).json({ success: true, data: timetable });
  } catch (error) {
    console.error('Error creating timetable:', error);
    res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
};

// Update timetable
exports.updateTimetable = async (req, res) => {
  try {
    const { periods } = req.body;

    if (periods) {
      for (const period of periods) {
        const teacherExists = await Teacher.findById(period.teacher);
        const subjectExists = await Subject.findById(period.subject);

        if (!teacherExists || !subjectExists) {
          return res.status(400).json({ success: false, message: 'Invalid teacher or subject ID' });
        }
      }
    }

    const timetable = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    res.status(200).json({ success: true, data: timetable });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete timetable
exports.deleteTimetable = async (req, res) => {
  try {
    const timetable = await Timetable.findByIdAndDelete(req.params.id);

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    res.status(200).json({ success: true, message: 'Timetable deleted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get all classes a teacher teaches
exports.getClassesByTeacher = async (req, res) => {
  try {
    const teacherId = req.params.teacherId;

    if (!teacherId) {
      return res.status(400).json({ success: false, message: 'Teacher ID is required' });
    }

    const classes = await Timetable.find({ 'periods.teacher': teacherId })
      .populate('periods.subject', 'name code')
      .populate('periods.teacher', 'firstName lastName email')
      .populate({
        path: 'class',
        select: '_id name grade section',
        populate: { path: 'students', select: 'firstName lastName' }
      });

    res.status(200).json({
      success: true,
      message: 'Classes retrieved successfully',
      count: classes.length,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve teacher classes',
      error: error.message
    });
  }
};

// Get all teachers assigned to a class
exports.getTeachersByClass = async (req, res) => {
  const classId = req.params.classId;

  try {
    const timetables = await Timetable.find({ class: classId });

    const teacherIds = new Set();
    timetables.forEach(entry => {
      entry.periods.forEach(period => {
        if (period.teacher) {
          teacherIds.add(period.teacher.toString());
        }
      });
    });

    const teachers = await Teacher.find({ _id: { $in: Array.from(teacherIds) } });

    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to fetch teachers',
      error: error.message
    });
  }
};

// Get a teacher's full timetable
exports.teacherTimetable = async (req, res) => {
  try {
    const id = req.params.teacherId;

    const entries = await Timetable.find({ 'periods.teacher': id })
      .populate('class', 'name grade section')
      .populate('periods.subject', 'name code')
      .populate('periods.teacher', 'firstName lastName');

    res.status(200).json({
      success: true,
      count: entries.length,
      data: entries
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
