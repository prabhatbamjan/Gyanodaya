const Subject = require('../models/subjectModel');

// @desc    Get all subjects
// @route   GET /api/subjects
// @access  Public
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json({
           
            data: subjects
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get single subject
// @route   GET /api/subjects/:id
// @access  Public
exports.getSubject = async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subject
        });
    } catch (error) {
        console.error('Error getting Subject:', error);
        res.status(400).json({
            success: false,
            message: error.message
            
        });
    }
};

// @desc    Create new subject
// @route   POST /api/subjects
// @access  Private (Admin only)
exports.createSubject = async (req, res) => {
    try {
        // Check if subject code already exists
        const existingSubject = await Subject.findOne({ code: req.body.code });
        if (existingSubject) {
            return res.status(400).json({
                success: false,
                message: 'A subject with this code already exists'
            });
        }

        const subject = await Subject.create(req.body);

        res.status(201).json({
            success: true,
            data: subject
        });
    } catch (error) {
        console.error('Error creating Subject:', error);
        res.status(400).json({
            success: false,
            message: error.message
            
        });
    }
};

// @desc    Update subject
// @route   PUT /api/subjects/:id
// @access  Private (Admin only)
exports.updateSubject = async (req, res) => {
    try {
        // Check if updated code already exists (if code is being changed)
        if (req.body.code) {
            const existingSubject = await Subject.findOne({ 
                code: req.body.code,
                _id: { $ne: req.params.id }
            });
            
            if (existingSubject) {
                return res.status(400).json({
                    success: false,
                    message: 'A subject with this code already exists'
                });
            }
        }

        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }

        res.status(200).json({
            success: true,
            data: subject
        });
    } catch (error) {
        console.error('Error updating Subject:', error);
        res.status(400).json({
            success: false,
            message: error.message
            
        });
    }
};

// @desc    Delete subject
// @route   DELETE /api/subjects/:id
// @access  Private (Admin only)
exports.deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);

        if (!subject) {
            return res.status(404).json({
                success: false,
                message: 'Subject not found'
            });
        }
        const removedFromTimetables = await Timetable.findByIdAndDelete(req.params.id);
        const removedFromTeachers = await Teacher.findByIdAndDelete(req.params.id);

      if(removedFromTimetables || removedFromTeachers){
        return res.status(400).json({
            success: false,
            message: 'Subject is currently assigned to timetables or teachers'
        });
      }
        

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Error deleting Subject:', error);
        res.status(400).json({
            success: false,
            message: error.message
            
        });
    }
}; 

exports.getSubjectss = async (req, res) => {
    try {
        // Fetching all subjects from the database
        const subjects = await Subject.find();

       
        res.status(200).json({
            data: subjects.map(subject => ({
                id: subject._id, 
                name: subject.name
            }))
        });
    } catch (error) {
        console.error('Error getting Subjects:', error);
        res.status(400).json({
            success: false,
            message:error.message,
            
        });
    }
};
