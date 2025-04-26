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
            .populate('periods.teacher', 'firstName lastName');

        res.status(200).json({
            success: true,
            data: timetables
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error,
            
        });
    }
};

// Get timetable by class
exports.getTimetableByClass = async (req, res) => {
    
    try {
        const timetable = await Timetable.find({ class: req.params.classId })
           

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
        res.status(400).json({
            success: false,
            message: error,
            
        });
    }
};

// Create new timetable
exports.createTimetable = async (req, res) => {
    try {
        const { class: classId, day, periods, academicYear } = req.body;
        console.log(classId);

        console.log(req.body);
        // Validate class exists
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(400).json({
                success: false,
                message: 'Class not found'
            });
        }
       
        if (existingTimetable) {
            return res.status(400).json({
                success: false,
                message: 'Timetable already exists for this class and day'
            });
        }

        // Validate teachers and subjects
        for (const period of periods) {
            const teacherExists = await Teacher.findById(period.teacher);
            const subjectExists = await Subject.findById(period.subject);

            if (!teacherExists || !subjectExists) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid teacher or subject ID'
                });
            }
            const teacheaddclass =await Teacher.findByIdAndUpdate(period.teacher, { $addToSet: { classes: classId } }, { new: true, useFindAndModify: false });
            const classaddteacher = await Class.findByIdAndUpdate(classId, { $push: { teachers: period.teacher } }, { new: true, useFindAndModify: false });
            console.log(teacheaddclass);
            console.log(classaddteacher);
        }

        const timetable = await Timetable.create(req.body);

        res.status(201).json({
            success: true,
            data: timetable
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error,
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
        res.status(400).json({
            success: false,
            message: error,
            
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
        res.status(400).json({
            success: false,
            message: error,
            
        });
    }
}; 

exports.getClassesByTeacher = async (req, res) => {
    try {
        console.log(req.params.teacherId);
        const classes = await Timetable.find({ teacher: req.params.teacherId });
        console.log(classes);
        res.status(200).json({
            success: true,
            data: classes
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error,
            
        });
    }
};  
