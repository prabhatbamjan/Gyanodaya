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
            .populate('periods.teacher', 'firstName lastName email');

        res.status(200).json({
            success: true,
            count: timetables.length,
            data: timetables
        });
    } catch (error) {
        console.error('Error fetching timetables:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch timetables',
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
            .populate('periods.teacher', 'firstName lastName email');
      console.log(timetable);
        if (!timetable || timetable.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No timetable found for this class'
            });
        }

        res.status(200).json({
            success: true,
            count: timetable.length,
            data: timetable
        });
    } catch (error) {
        console.error('Error fetching timetable by class:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch timetable',
            error: error.message
        });
    }
};

// Create new timetable
exports.createTimetable = async (req, res) => {
    try {
        const { class: classId, day, periods, academicYear } = req.body;

        // Validate class exists
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }
        
        // Check if timetable already exists for this class and day
        const existingTimetable = await Timetable.findOne({ class: classId, day });
        if (existingTimetable) {
            return res.status(409).json({
                success: false,
                message: 'Timetable already exists for this class and day',
                timetableId: existingTimetable._id
            });
        }

        // Validate teachers and subjects
        for (const period of periods) {
            const teacherExists = await Teacher.findById(period.teacher);
            const subjectExists = await Subject.findById(period.subject);

            if (!teacherExists) {
                return res.status(404).json({
                    success: false,
                    message: `Teacher with ID ${period.teacher} not found`
                });
            }
            
            if (!subjectExists) {
                return res.status(404).json({
                    success: false,
                    message: `Subject with ID ${period.subject} not found`
                });
            }
            
            // Add class to teacher's classes array (if not already there)
            await Teacher.findByIdAndUpdate(
                period.teacher, 
                { $addToSet: { class: classId } }, 
                { new: true }
            );
            
            
        }

        const timetable = await Timetable.create(req.body);
        
        // Return populated timetable
        const populatedTimetable = await Timetable.findById(timetable._id)
            .populate('class', 'name grade section')
            .populate('periods.subject', 'name code')
            .populate('periods.teacher', 'firstName lastName email');

        res.status(201).json({
            success: true,
            data: populatedTimetable
        });
    } catch (error) {
        console.error('Error creating timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create timetable',
            error: error.message
        });
    }
};

// Update timetable
exports.updateTimetable = async (req, res) => {
    try {
        const { periods, class: classId } = req.body;

        // Validate teachers and subjects if periods are being updated
        if (periods) {
            for (const period of periods) {
                const teacherExists = await Teacher.findById(period.teacher);
                const subjectExists = await Subject.findById(period.subject);

                if (!teacherExists) {
                    return res.status(404).json({
                        success: false,
                        message: `Teacher with ID ${period.teacher} not found`
                    });
                }
                
                if (!subjectExists) {
                    return res.status(404).json({
                        success: false,
                        message: `Subject with ID ${period.subject} not found`
                    });
                }
                
                // If classId is provided, update teacher-class relationships
                if (classId) {
                    // Add class to teacher's classes array
                    await Teacher.findByIdAndUpdate(
                        period.teacher, 
                        { $addToSet: { classes: classId } }, 
                        { new: true }
                    );
                }
            }
        }

        const timetable = await Timetable.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('class', 'name grade section')
         .populate('periods.subject', 'name code')
         .populate('periods.teacher', 'firstName lastName email');

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
        console.error('Error updating timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update timetable',
            error: error.message
        });
    }
};

// Delete timetable
exports.deleteTimetable = async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id);

        if (!timetable) {
            return res.status(404).json({
                success: false,
                message: 'Timetable not found'
            });
        }

        // Remove the timetable
      const deletedTimetable = await Timetable.findByIdAndDelete(req.params.id);
      if (!deletedTimetable) {
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
        console.error('Error deleting timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete timetable',
            error: error.message
        });
    }
};

// Get classes by teacher
exports.getClassesByTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        
        // Find all timetables that have periods with this teacher
        const timetables = await Timetable.find({ 
            'periods.teacher': teacherId 
        }).populate('class', 'name grade section');
        
        // Extract unique classes from timetables
        const classes = new Set();
        timetables.forEach(timetable => {
            if (timetable.class) {
                classes.add(JSON.stringify(timetable.class));
            }
        });
        
        // Convert back from stringified objects
        const uniqueClasses = Array.from(classes).map(c => JSON.parse(c));

        res.status(200).json({
            success: true,
            count: uniqueClasses.length,
            data: uniqueClasses
        });
    } catch (error) {
        console.error('Error finding classes by teacher:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to find classes for teacher',
            error: error.message
        });
    }
};

// Get teacher timetable
exports.getTeacherTimetable = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        
        // Find all timetables that include this teacher
        const timetables = await Timetable.find({
            'periods.teacher': teacherId
        }).populate('class', 'name grade section')
          .populate('periods.subject', 'name code');
        
        if (!timetables || timetables.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No timetable entries found for this teacher'
            });
        }
        
        // Process timetables to create a teacher-specific view
        const teacherTimetable = {};
        
        timetables.forEach(timetable => {
            const day = timetable.day;
            const className = timetable.class ? 
                `${timetable.class.name} (Grade ${timetable.class.grade}${timetable.class.section})` : 
                'Unknown Class';
            
            // Filter only periods taught by this teacher
            const teacherPeriods = timetable.periods.filter(
                period => period.teacher.toString() === teacherId
            );
            
            if (!teacherTimetable[day]) {
                teacherTimetable[day] = [];
            }
            
            teacherPeriods.forEach(period => {
                teacherTimetable[day].push({
                    periodNumber: period.periodNumber,
                    startTime: period.startTime,
                    endTime: period.endTime,
                    subject: period.subject,
                    class: {
                        id: timetable.class._id,
                        name: className
                    }
                });
            });
            
            // Sort periods by periodNumber
            if (teacherTimetable[day].length > 0) {
                teacherTimetable[day].sort((a, b) => a.periodNumber - b.periodNumber);
            }
        });
        
        res.status(200).json({
            success: true,
            data: teacherTimetable
        });
    } catch (error) {
        console.error('Error fetching teacher timetable:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch teacher timetable',
            error: error.message
        });
    }
}; 

exports.getTimetableById = async (req, res) => {
    try {
        const timetable = await Timetable.findById(req.params.id);
        console.log("Requested ID:", req.params.id);
        console.log(timetable);
        res.status(200).json({
            success: true,
            data: timetable
        });
    } catch (error) {
        console.error('Error fetching timetable by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch timetable by ID',
            error: error.message
        });
    }
};


