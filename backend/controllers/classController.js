const Class = require('../models/classModel');
const Student = require('../models/studentModel');
const Subject = require('../models/subjectModel');
const Timetable = require('../models/timetableModel');
const Teacher= require('../models/teacherModel');


// Get all classes
exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find()
    .populate('classTeacher', 'firstName lastName')
   
    
    res.status(200).json({
      success: true,
      count: classes.length,
      data: classes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch classes',
      error: error.message
    });
  }
};

// Get single class by ID
exports.getClassById = async (req, res) => {
  try {
    const classObj = await Class.findById(req.params.id)
      .populate('subjects')
      .populate('classTeacher', 'firstName lastName email')
      .populate('students', 'firstName lastName email');

    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      data: classObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch class details',
      error: error.message
    });
  }
};

// Create new class
exports.createClass = async (req, res) => {
  try {
    const { subjects, name, grade, section, fee, roomNumber } = req.body;
    
    // Validate required fields
    if (!name || !grade || !section || !fee || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, grade, section, fee, roomNumber'
      });
    }
    
    // Validate subjects if provided
    if (subjects && subjects.length > 0) {
      const validSubjects = await Subject.find({ _id: { $in: subjects } });
      
      if (validSubjects.length !== subjects.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more subject IDs are invalid'
        });
      }
    }
    const existingClass = await Class.findOne({ 
      name,
      section, 
      grade, 
      roomNumber 
    });

    if (existingClass) {
      return res.status(400).json({
        success: false,
        message: 'Class with this name, section, grade and room number already exists',
      });
    }
    
  
    const roomNumberExists = await Class.findOne({ roomNumber });
    if (roomNumberExists) {
      return res.status(400).json({
        success: false,
        message: 'Room number already exists',
      });
    }
    
    
    // Create the class object
    const classObj = await Class.create(req.body);
   
   
    // Return success response
    res.status(201).json({
      success: true,
      data: classObj
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(400).json({
      success: false,
      message: error.message,
     
    });
  }
};


// Update class
exports.updateClass = async (req, res) => {
  try {
    const { subjects, classTeacher } = req.body;
    
    // Validate subjects if provided
    if (subjects && subjects.length > 0) {
      const validSubjects = await Subject.find({ _id: { $in: subjects } });
      
      if (validSubjects.length !== subjects.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more subject IDs are invalid'
        });
      }
    }
    const teacherAvailable = await Class.findOne({ classTeacher: classTeacher });
    if (teacherAvailable) {
      return res.status(400).json({
        success: false,
        message: 'Teacher already assigned to another class'
      });
    }
  
    
    const classObj = await Class.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: classObj
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update class',
      error: error.message
    });
  }
};

// Delete class
exports.deleteClass = async (req, res) => {
  try {
    const id = req.params.id;

    // Delete related timetables
    await Timetable.deleteMany({ class : id }); // Assuming you use `classId` in timetable

    // Remove class from teachers who have it
    await Teacher.updateMany(
      { class: id },
      { $pull: { class: id } }
    );

    // Remove class from students (or delete students if needed)
    await Student.deleteMany({ class: id });

    // Now delete the class itself
    const classObj = await Class.findByIdAndDelete(id);
    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Class and related data deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete class',
      error: error.message
    });
  }
};


// Add subjects to class
exports.addSubjectsToClass = async (req, res) => {
  try {
    const { subjectIds } = req.body;
    
    if (!subjectIds || !Array.isArray(subjectIds) || subjectIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide valid subject IDs'
      });
    }
    
    // Validate subjects
    const validSubjects = await Subject.find({ _id: { $in: subjectIds } });
    
    if (validSubjects.length !== subjectIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more subject IDs are invalid'
      });
    }
    
    const classObj = await Class.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { subjects: { $each: subjectIds } } },
      { new: true }
    );
    
    if (!classObj) {
      return res.status(404).json({
        success: false,
        message: 'Class not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: classObj
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add subjects to class',
      error: error.message
    });
  }
};
 