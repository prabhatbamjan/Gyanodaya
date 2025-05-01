const Timetable = require('../models/timetableModel');
const Class = require('../models/classModel');
const Teacher = require('../models/teacherModel');
const Subject = require('../models/subjectModel');

// Get timetable by ID
exports.getTimetableById = async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id)
            .populate('class', 'name grade section')
            .populate('periods.subject', 'name code')
            .populate('periods.teacher', 'firstName lastName');

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        res.status(200).json({
            success: true,
            data: timetable
        });
    } catch (error) {
        console.error('Error retrieving timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving timetable',
            error: error.message
        });
    }
};

// Get all timetables
exports.getAllTimetables = async (req, res) => {
    try {
        const timetables = await Timetable.find()
            .populate('class', 'name grade section')
            .populate('periods.subject', 'name code')
            .populate('periods.teacher', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: timetables
        });
    } catch (error) {
        console.error('Error retrieving timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving timetable',
            error: error.message
        });
    }
};

// Get timetable by class
exports.getTimetableByClass = async (req, res) => {
    
    try {
        const timetable = await Timetable.find({ class: req.params.classId })
            .populate('class', 'name grade section')
            .populate('periods.subject', 'name code')
            .populate('periods.teacher', 'firstName lastName');

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        res.status(200).json({
            success: true,
            data: timetable
        });
    } catch (error) {
        console.error('Error retrieving timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving timetable',
            error: error.message
        });
    }
};

exports.createTimetable = async (req, res) => {
    try {
        const { class: classId, day, periods, academicYear } = req.body;

        // Validate class existence
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(400).json({
                success: false,
                message: 'Class not found'
            });
        }

        // Check if timetable already exists for this class/day/year
        const existingTimetable = await Timetable.findOne({ class: classId, day, academicYear });
        if (existingTimetable) {
            return res.status(400).json({
                success: false,
                message: 'Timetable already exists for this class and day'
            });
        }

        // Fetch all timetables for the same day and academic year
        const allTimetablesForDay = await Timetable.find({ day, academicYear });

        // Build a map of teacherId -> number of periods on that day
        const teacherPeriodCount = {};

        allTimetablesForDay.forEach(timetable => {
            timetable.periods.forEach(p => {
                const tId = p.teacher.toString();
                teacherPeriodCount[tId] = (teacherPeriodCount[tId] || 0) + 1;
            });
        });

        // Check each period in the new timetable
        for (const period of periods) {
            const { teacher, subject, periodNumber } = period;

            // Validate teacher and subject
            const teacherExists = await Teacher.findById(teacher);
            const subjectExists = await Subject.findById(subject);

            if (!teacherExists || !subjectExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid teacher or subject ID'
                });
            }

            // Check for periodNumber conflict across other classes
            const isConflict = allTimetablesForDay.some(timetable => {
                if (timetable.class.toString() === classId.toString()) return false;

                return timetable.periods.some(p =>
                    p.periodNumber === periodNumber &&
                    p.teacher.toString() === teacher.toString()
                );
            });

            if (isConflict) {
                return res.status(400).json({
                    success: false,
                    message: `Conflict: Teacher already assigned to period ${periodNumber} in another class on ${day}`
                });
            }

            // Check if teacher has 7 or more periods already
            const teacherCount = teacherPeriodCount[teacher] || 0;
            if (teacherCount >= 7) {
                return res.status(400).json({
                    success: false,
                    message: `Teacher load exceeded: Teacher already has ${teacherCount} periods on ${day}`
                });
            }

            // Increment for tracking
            teacherPeriodCount[teacher] = teacherCount + 1;

            // Add class-teacher relationship if needed
            await Teacher.findByIdAndUpdate(teacher, {
                $addToSet: { classes: classId }
            });

            await Class.findByIdAndUpdate(classId, {
                $addToSet: { teachers: teacher }
            });
        }

        // Save the timetable
        const timetable = await Timetable.create(req.body);

        res.status(201).json({
            success: true,
            data: timetable
        });

    } catch (error) {
        console.error('Error creating timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


// Update timetable
exports.updateTimetable = async (req, res) => {
    try {
        const { periods } = req.body;

        // Validate teachers and subjects if periods are being updated
        if (periods) {
            for (const period of periods) {
                const teacherExists = await Teacher.findById(period.teacher);
                const subjectExists = await Subject.findById(period.subject);

                if (!teacherExists || !subjectExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid teacher or subject ID'
                    });
                }
            }
        }

        const timetable = await Timetable.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        res.status(200).json({
            success: true,
            data: timetable
        });
    } catch (error) {
        console.error('Error retrieving timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving timetable',
            error: error.message
        });
    }
};

// Delete timetable
exports.deleteTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findByIdAndDelete(req.params.id);

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Timetable deleted successfully'
        });
    } catch (error) {
        console.error('Error retrieving timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving timetable',
            error: error.message
        });
    }
}; 


exports.getClassesByTeacher = async (req, res) => {
    try {
      const teacherId = req.params.teacherId;
  
      if (!teacherId) {
        return res.status(400).json({
          success: false,
          message: 'Teacher ID is required',
        });
      }
  
      const classes = await Timetable.find({ 'periods.teacher': teacherId })
        .populate({
          path: 'periods.subject',
          select: '_id name periodNumber',
        })
        .populate({
          path: 'periods.teacher',
          select: '_id', // Just keep the ID
        })
        .populate({
          path: 'class',
          select: '_id name section grade academicYear', // Only essential fields
        });
  
      const filteredClasses = classes
        .map(t => ({
          _id: t._id,
          class: t.class,
          periods: t.periods.filter(p => p.teacher?._id?.toString() === teacherId),
        }))
        .filter(t => t.periods.length > 0);
  
      return res.status(200).json({
        success: true,
        message: 'Classes retrieved successfully',
        count: filteredClasses.length,
        data: filteredClasses,
      });
    } catch (error) {
      console.error('Error fetching teacher classes:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve teacher classes',
        error: error.message,
      });
    }
  };
  

exports.getTeachersByClass = async (req, res) => {
    const id=req.params.classId;
    try {
      const timetableEntries = await Timetable.find({ classId: id});
  
    
      const teacherIds = [...new Set(timetableEntries.map(entry => entry.teacherId).filter(Boolean))];
  
      
      const teachers = await Teacher.find({ _id: { $in: teacherIds } });
  
      res.status(200).json({
        success: true,
        data: teachers
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Failed to fetch teachers',
        error: error.message
      });
    }
  };


  exports.teacherTimetable = async (req, res) => {
    try {
      const id = req.params.teacherId;
  
      const entries = await Timetable.find({ 'periods.teacher': id })
        .populate('class', 'name grade section')
        .populate('periods.subject', 'name code')
        .populate('periods.teacher', 'firstName lastName');
  
      // Filter periods per document to only include those matching the teacher ID
      const filteredEntries = entries.map(entry => {
        const filteredPeriods = entry.periods.filter(
          period => period.teacher && period.teacher._id.toString() === id
        );
        return {
          ...entry.toObject(),
          periods: filteredPeriods
        };
      });
  
      res.status(200).json({
        success: true,
        count: filteredEntries.length,
        data: filteredEntries
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message,
        error
      });
    }
  };
  
  