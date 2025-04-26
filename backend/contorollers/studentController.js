const Student = require('../models/studentModel');
const User = require('../models/userModels');
const Parent = require('../models/parentModel');
const Class = require('../models/classModel');
const sendEmail= require('../utils/email')

// @desc    Create a new student (admin)
// @route   POST /api/admin/students
// @access  Private (Admin only)
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
    const recipients = [     
      student.email, 
      parent.email
    ];
  
    try {
      for (let email of recipients) {
        await sendEmail({
          email: email,
          subject: 'Your Login Credentials for Gyanodaya',
          message: `
            Dear ${recipients.firstName} ${recipients.lastName},
  
            Greetings from Gyanodaya!
  
            Here are your login credentials for accessing the student portal:
  
            Email: ${recipients.email}
            Password: Password@1234
  
            You can change your password after logging in for the first time. Please make sure to keep this information confidential and secure.
  
            If you have any issues accessing your account, feel free to reach out to our support team.
  
            Best regards,
            The CODE IT Team
          `
        });
      }
    } catch (error) {
      console.error('Error sending email:', error);
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
      const { studentId } = req.params;

      const student = await Student.findById(studentId);
      if (!student) {
          return res.status(404).json({
              status: 'error',
              message: 'Student not found'
          });
      }

      // Remove student user
      await User.findByIdAndDelete(student._id);

      // Remove student from parent's children
      if (student.parent) {
          const parent = await Parent.findByIdAndUpdate(
              student.parent,
              { $pull: { children: student._id } },
              { new: true }
          );

          // If no more children, delete parent and parent user
          if (parent && parent.children.length === 0) {
              await User.findByIdAndDelete(parent._id);
              await Parent.findByIdAndDelete(parent._id);
          }
      }

      // Finally, delete the student
      await Student.findByIdAndDelete(student._id);

      res.status(200).json({
          status: 'success',
          message: 'Student and related records deleted successfully'
      });

  } catch (error) {
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
          

      if (!student) {
          return res.status(404).json({
              status: 'error',
              message: 'Student not hello why not foundfound'
          });
      }
      const parent = await Parent.findById(student.parent);

      res.status(200).json({
          status: 'success',
          data: {
              student,
              parent
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
    const parents = await Parent.find();
    res.status(200).json({ parents });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};  


