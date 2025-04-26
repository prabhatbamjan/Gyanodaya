const Teacher = require('../models/teacherModel');
const User = require('../models/userModels');
const sendEmail = require('../utils/email');

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Public
exports.getTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find();
        res.status(200).json({
            data: teachers
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error,
        });
    }
};

// @desc    Get single teacher
// @route   GET /api/teachers/:id
// @access  Public
exports.getTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            data: teacher
        });
    } catch (error) {       
        res.status(400).json({
            success: false,
            message: error,
        });
    }
};

// @desc    Create new teacher
// @route   POST /api/teachers
// @access  Private (Admin only)
exports.createTeacher = async (req, res) => {
     const data = req.body;
    try {
        // Check if teacher with email already exists
        const existingTeacherEmail = await Teacher.findOne({ email: data.email });
        const exitstUser = await User.findOne({ email: data.email });
        if (existingTeacherEmail || exitstUser){
            return res.status(400).json({
                success: false,
                message: 'A teacher or user with this email already exists'
            });
        }  
      const teacher=await Teacher.create({
           firstName: data.firstName,
           lastName: data.lastName,
           email: data.email,       
           gender: data.gender,
           dob: data.dob,
           joinDate: data.joinDate,
           qualification: data.qualification,
           salary: data.salary,
           experience: data.experience,
           phone: data.phone,
           address: {
            street: data.address.street,
            city: data.address.city,
            state: data.address.state,
            zipCode: data.address.zipCode,
            country: data.address.country,
           },
           subjects: data.subjects
      });
      if (!teacher) {
        // If teacher creation fails, delete the user
        return res.status(400).json({
            success: false,
            message: 'Failed to create teacher'
        });
    }
        // Create user first
        const user = await User.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: 'Password@1234',
            role: 'teacher',
            _id: teacher._id
           
        });

        if (!user) {
            await Teacher.findByIdAndDelete(teacher._id);
            return res.status(400).json({
                success: false,
                message: 'Failed to create user'
            });
        }

      ; 
      
      const message = `
      Dear ${teacher.firstName + teacher.lastName},
      
      Greetings from Gyanodaya!
      
      Here are your login credentials for accessing the student portal:
      
      Email: ${teacher.email}
      Password: Password@1234
      
      You can change your password after logging in for the first time. Please make sure to keep this information confidential and secure.
      
      If you have any issues accessing your account, feel free to reach out to our support team.
      
      Best regards,  
      The CODE IT Team
      `;

      try {
        await sendEmail({
            email: teacher.email,
            subject: 'Your Login Credentials for Gyanodaya',
            message
        });
       
    } catch (err) {     

        return res.status(500).json({
            status: 'error',
            message: 'There was an error sending the email. Try again later!'
        });
    }    
    

        res.status(201).json({
            success: true,
            data: teacher
        });
    } catch (error) {
        console.error('Error creating teacher:', error);
        res.status(400).json({
            success: false,
            message: error.message,
           
        });
    }
};

// @desc    Update teacher
// @route   PUT /api/teachers/:id
// @access  Private (Admin only)
exports.updateTeacher = async (req, res) => {
    try {
        // Check if updated email already exists (if email is being changed)
        if (req.body.email) {
            const existingTeacher = await Teacher.findOne({ 
                email: req.body.email,
                _id: { $ne: req.params.id }
            });
            
            if (existingTeacher) {
                return res.status(400).json({
                    success: false,
                    message: 'A teacher with this email already exists'
                });
            }
        }

    

        const teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
                );

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        res.status(200).json({
            success: true,
            data: teacher
        });
    } catch (error) {
        console.error('Error updating teacher:', error);
        res.status(400).json({
            success: false,
            message: error,
           
        });
    }
};

// @desc    Delete teacher
// @route   DELETE /api/teachers/:id
// @access  Private (Admin only)
exports.deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) {
        return res.status(404).json({
            success: false,
            message: 'User not found'
        });
      }
        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
      
        res.status(400).json({
            success: false,
            message: error
        });
    }
};
