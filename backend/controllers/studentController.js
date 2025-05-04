const Student = require('../models/studentModel');
const User = require('../models/userModels');
const Parent = require('../models/parentModel');
const Class = require('../models/classModel');
const sendEmail= require('../utils/email')
const mongoose = require('mongoose');
const Cloudinary =require('../middleware/cloudnery')
const fs = require("fs");
require("dotenv").config();

exports.createStudent = async (req, res) => {
  try {
        const {      firstName, 
        lastName,
        email,  
        dob,
        gender,
        classId,
        bloodGroup,
        admissionDate,
        address,     
        city,
        state,
        zipCode,
        country,     
        parentfirstName,
        parentlastName,
        parentemail,
        parentphone,
        parentoccupation,
        parentrelation} = req.body;
        const imagePath = req.file.path
        const result = await Cloudinary.uploader.upload(imagePath, {
          folder: "Student",
        });
    
        fs.unlinkSync(imagePath);
    // Check if student/user already exists
    if (await User.findOne({ email }) || await Student.findOne({ email })) {
      return res.status(400).json({
        status: 'error',
        message: 'Student already exists or email is in use'
      });
    }

    // Validate class
    const classObj = await Class.findById(classId);
    if (!classObj) {
      return res.status(404).json({
        status: 'error',
        message: 'Class not found'
      });
    }
    const checkcapticity=classObj.students.length;
    if(checkcapticity>=classObj.capacity){
      return res.status(400).json({
        status: 'error',
        message: 'Class is full'
      });
    } 

    // ✅ Create Parent First
    const parent = await Parent.create({
      firstName: parentfirstName,
      lastName: parentlastName,
      email: parentemail,
      phone: parentphone,
      occupation: parentoccupation,
      relationship: parentrelation
    });

    // Create Student (with parent reference)
    const student = await Student.create({
      imageUrl: result.secure_url,
      firstName: firstName,
      lastName: lastName,
      email: email,
      gender: gender,
      dateOfBirth: dob,
      bloodGroup: bloodGroup,
      admissionDate: admissionDate,
      class: classObj._id,
      parent: parent._id,
      address: {
        street: address,
        city: city,
        state: state,
        zipCode: zipCode,
        country: country
      }
    });

    // Link student to parent
    parent.children.push(student._id);
    await parent.save();

    // Create Student User
    const user = await User.create({
      _id: student._id,
      firstName: firstName,
      lastName: lastName,
      email: email,
      password: 'Password@1234',
      role: 'student'
    });

    // Create Parent User
    const parentUser = await User.create({
      _id: parent._id,
      firstName: parentfirstName,
      lastName: parentlastName,
      email: parentemail,
      password: 'Password@1234',
      role: 'parent'
    });
    const addstudnet=await Class.findById(classId);
    addstudnet.students.push(student._id);
    await addstudnet.save();
    const recipients = [     
      student, 
      parent
    ];
  
    try {
      for (let person of recipients) {
        await sendEmail({
          email: person.email,
          subject: 'Your Login Credentials for Gyanodaya',
          message: `
            Dear ${person.firstName} ${person.lastName},
  
            Greetings from Gyanodaya!
  
            Here are your login credentials for accessing the student portal:
  
            Email: ${person.email}
            Password: Password@1234
  
            You can change your password after logging in for the first time. Please make sure to keep this information confidential and secure.
  
            If you have any issues accessing your account, feel free to reach out to our support team.
  
            Best regards,
            The CODE IT Team
          `
        });
      }
      res.status(201).json({
        status: 'success',
        data: {
          id: student._id,
          name: `${firstName} ${lastName}`,
          email: student.email,
          classId: student.class,
          status: student.status || 'active',
          profileImg: student.profileImg || null
        }
      });
    } catch (error) {
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending the email. Try again later!'
      });
      
      console.error('Error sending email:', error);
    } 

   
     
  

   

  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};



exports.updateStudent = async (req, res) => {
  try {
    console.log('hello');
      const { studentId } = req.params;
      
      const {
          firstName, lastName, email,
          classId, gender, dob, bloodGroup,
          address, city, state, zipCode,
          admissionDate,
          parentFirstName, parentLastName, parentEmail, parentPhone, parentOccupation
      } = req.body;

      const student = await Student.findById(studentId);
      if (!student) {
          return res.status(404).json({
              status: 'error',
              message: 'this the reply'
          });
      }

      // Validate class if provided
      if (classId) {
          const classObj = await Class.findById(classId);
          if (!classObj) {
              return res.status(404).json({
                  status: 'error',
                  message: 'Class not found'
              });
          }
      }

      // Update student
      const updatedStudent = await Student.findByIdAndUpdate(studentId, {
          firstName, lastName, email,
          classId, gender, dob, bloodGroup,
          address, city, state, zipCode,
          admissionDate
      }, { new: true });

      // Update corresponding user
      await User.findByIdAndUpdate(studentId, {
          firstName, lastName, email
      });

      // Update parent info if present
      if (student.parent) {
          await Parent.findByIdAndUpdate(student.parent, {
              firstName: parentFirstName,
              lastName: parentLastName,
              email: parentEmail,
              phone: parentPhone,
              occupation: parentOccupation
          });

          await User.findByIdAndUpdate(student.parent, {
              firstName: parentFirstName,
              lastName: parentLastName,
              email: parentEmail
          });
      }
      

      res.status(200).json({
          status: 'success',
          message: 'Student updated successfully',
          data: updatedStudent
      });

  } catch (error) {
      res.status(400).json({
          status: 'error',
          message: error.message
      });
  }
};


// @desc    Delete a student
// @route   DELETE /api/admin/students/:id
// @access  Private (Admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Deleting student with ID:", id);

    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: 'Student not found'
      });
    }

    // Delete user associated with student
    await User.findByIdAndDelete(id);

    // Remove student reference from parent's children
    if (student.parent) {
      const parent = await Parent.findByIdAndUpdate(
        student.parent,
        { $pull: { children: id } },
        { new: true }
      );

      // Delete parent and its user account if no children remain
      if (parent && (!parent.children || parent.children.length === 0)) {
        await User.findByIdAndDelete(parent._id);
        await Parent.findByIdAndDelete(parent._id);
      }
    }

    // Delete student record
    await Student.findByIdAndDelete(id);

    res.status(200).json({
      status: 'success',
      message: 'Student and related records deleted successfully'
    });

  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};



// @desc    Get all students (for admin)
// @route   GET /api/admin/students
// @access  Private (Admin only)
exports.getAllStudents = async (req, res) => {
  try {
      const students = await Student.find()
          .populate('class', 'name section') // optional
          .populate('parent', 'firstName lastName email phone'); // optional

      res.status(200).json({
          status: 'success',
          results: students.length,
          data: students
      });

  } catch (error) {
      res.status(500).json({
          status: 'error',
          message: error.message
      });
  }
};


// @desc    Get student by ID
// @route   GET /api/admin/students/:id
// @access  Private (Admin only)
exports.getStudentById = async (req, res) => {
  try {
      const { id } = req.params;
      console.log("Params received:", req.params); 
      const student = await Student.findById(id)
                       .populate('class', 'name section')
                       .populate('parent', '_idfirstName lastName email phone occupation relationship');
          

      if (!student) {
          return res.status(404).json({
              status: 'error',
              message: 'Student not hello why not foundfound'
          });
      }
      

      res.status(200).json({
          status: 'success',
          data: {
              student,
             
          }
      });

  } catch (error) {
      res.status(500).json({
          status: 'error',
          message: error.message
      });
  }
};

exports.updateStudentProfile = async (req, res) => {
  try {
      const { studentId } = req.params;
      const {
          firstName,
          lastName,
          email,
          gender,
          dob,
          bloodGroup,
          address,
          city,
          state,
          zipCode,
          profileImg // optional
      } = req.body;

      const student = await Student.findById(studentId);
      if (!student) {
          return res.status(404).json({
              status: 'error',
              message: 'Student not found'
          });
      }

      // Update student info
      const updatedStudent = await Student.findByIdAndUpdate(studentId, {
          firstName,
          lastName,
          email,
          gender,
          dob,
          bloodGroup,
          address,
          city,
          state,
          zipCode,
          ...(profileImg && { profileImg }) // optional update
      }, { new: true });

      // Also update user info
      await User.findByIdAndUpdate(studentId, {
          firstName,
          lastName,
          email
      });

      res.status(200).json({
          status: 'success',
          message: 'Profile updated successfully',
          data: updatedStudent
      });

  } catch (error) {
      res.status(400).json({
          status: 'error',
          message: error.message
      });
  }
};

exports.getparents = async (req, res) => {
  try {
    const parents = await Student.find().populate('parent' ,'_id firstName lastName email phone occupation relationship');
    res.status(200).json({ parents });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};  

exports.getstudnetByclass = async (req, res) => {
  try {
    const { id } = req.params;

    const students = await Student.find({ class: id })
      .populate('parent', 'phone'); // Make sure this is correct

    res.status(200).json({
      success: true,
      data: students
    });

  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};
exports.getStudentsByClasses = async (req, res) => {
  try {
    const rawClassIds = req.query.classIds;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query.sortField || 'firstName';
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;

    if (!rawClassIds) {
      return res.status(400).json({
        success: false,
        message: 'No class IDs provided',
      });
    }

    const classIds = rawClassIds
      .split(',')
      .map(id => id.trim())
      .filter(id => mongoose.Types.ObjectId.isValid(id));

    if (classIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid class IDs provided',
      });
    }

    const skip = (page - 1) * limit;

    const [students, total] = await Promise.all([
      Student.find({ class: { $in: classIds } })
        .populate('parent', 'firstName lastName phone email occupation relationship')
        .populate('class', 'name section grade capacity')
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
      Student.countDocuments({ class: { $in: classIds } })
    ]);

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });

  } catch (error) {
    console.error('Error in getStudentsByClasses:', error.message);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message,
    });
  }
};



