const Subject = require('../models/subjectModel');
const Class = require('../models/classModel');
const Timetable = require('../models/timetableModel');
const Teacher= require('../models/teacherModel');

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


exports.deleteSubject = async (req, res) => {
    try {
      const subjectId = req.params.id;
  
      // Check if the subject exists
      const subject = await Subject.findById(subjectId);
      if (!subject) {
        return res.status(404).json({
          success: false,
          message: 'Subject not found',
        });
      }
  
      // Step 1: Remove subject from teachers' subjects
      await Teacher.updateMany(
        { subjects: subjectId },
        { $pull: { subjects: subjectId } }
      );
  
      // Step 2: Remove subject from all timetables
      await Timetable.updateMany(
        {},
        { $pull: { 'timetable': { subjectId: subjectId } } }
      );
  
      // Step 3: Remove subject from all classes
      await Class.updateMany(
        { subjects: subjectId },
        { $pull: { subjects: subjectId } }
      );
  
      // Step 4: Delete the subject
      await Subject.findByIdAndDelete(subjectId);
  
      res.status(200).json({
        success: true,
        message: 'Subject and all references (teachers, timetables, classes) removed successfully',
      });
  
    } catch (error) {
      console.error('Error deleting subject:', error);
      res.status(500).json({
        success: false,
        message: error.message,
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
