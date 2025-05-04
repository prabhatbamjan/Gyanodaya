const Teacher = require('../models/teacherModel');
const User = require('../models/userModels');
const sendEmail = require('../utils/email');
const Cloudinary =require('../middleware/cloudnery')


const fs = require("fs");

require("dotenv").config();

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
    
    // Debug request
    console.log('Request body:', data);
    console.log('Request file:', req.file);
    
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: 'Image file is required'
        });
    }
    
    const imagePath = req.file.path;
    
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
        
        // Verify file exists before uploading
        if (!fs.existsSync(imagePath)) {
            return res.status(400).json({
                success: false,
                message: 'Image file not found at path: ' + imagePath
            });
        }
        
        // Upload to Cloudinary
        try {
            const result = await Cloudinary.uploader.upload(imagePath, {
                folder: "Teacher",
            });
            
            // Clean up the file after upload
            fs.unlinkSync(imagePath);
            
            // Create teacher with image URL
            const teacher = await Teacher.create({
                imageUrl: result.secure_url,
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
                return res.status(400).json({
                    success: false,
                    message: 'Failed to create teacher'
                });
            }
            
            // Generate password (replace with secure generator if needed)
            const generatedPassword = 'Password@1234';
            
            // Create associated user
            const user = await User.create({
                _id: teacher._id,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: generatedPassword,
                role: 'teacher',
            });
            
            if (!user) {
                await Teacher.findByIdAndDelete(teacher._id);
                return res.status(400).json({
                    success: false,
                    message: 'Failed to create user'
                });
            }
            
            // Prepare email
            const message = `
  Dear ${teacher.firstName} ${teacher.lastName},
  
  Greetings from Gyanodaya!
  
  Here are your login credentials for accessing the teacher portal:
  
  Email: ${teacher.email}
  Password: ${generatedPassword}
  
  You can change your password after logging in for the first time. Please keep this information confidential and secure.
  
  If you have any issues accessing your account, feel free to reach out to our support team.
  
  Best regards,  
  The CODE IT Team
            `;
            
            // Send email
            try {
                await sendEmail({
                    email: teacher.email,
                    subject: 'Your Login Credentials for Gyanodaya',
                    message,
                });
            } catch (emailErr) {
                console.error('Email error:', emailErr);
                await User.findByIdAndDelete(teacher._id);
                await Teacher.findByIdAndDelete(teacher._id);
                return res.status(500).json({
                    success: false,
                    message: 'There was an error sending the email. Try again later!'
                });
            }
            
            // Return success
            res.status(201).json({
                success: true,
                data: teacher
            });
            
        } catch (cloudinaryError) {
            console.error('Cloudinary upload error:', cloudinaryError);
            return res.status(400).json({
                success: false,
                message: 'Error uploading image to Cloudinary: ' + cloudinaryError.message
            });
        }
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

// @desc    Get classes assigned to a teacher
// @route   GET /api/teachers/:id/classes
// @access  Private (Teacher only)
exports.getTeacherClasses = async (req, res) => {
    try {
        const teacherId = req.params.id;
        
        // Find teacher with populated classes
        const teacher = await Teacher.findById(teacherId)
            .populate({
                path: 'class',
                populate: [
                    { path: 'subjects' },
                    { path: 'students', select: 'firstName lastName email registrationNumber' }
                ]
            });

        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: 'Teacher not found'
            });
        }

        // Also find classes where this teacher is the class teacher
        const classesAsClassTeacher = await require('../models/classModel').find({ classTeacher: teacherId })
            .populate('subjects')
            .populate('students', 'firstName lastName email registrationNumber');

        // Combine both types of classes
        let allClasses = [];
        
        // Add classes from teacher model
        if (teacher.class && teacher.class.length > 0) {
            allClasses = [...teacher.class];
        }
        
        // Add classes where teacher is class teacher (avoiding duplicates)
        if (classesAsClassTeacher && classesAsClassTeacher.length > 0) {
            classesAsClassTeacher.forEach(cls => {
                const isDuplicate = allClasses.some(c => c._id.toString() === cls._id.toString());
                if (!isDuplicate) {
                    allClasses.push(cls);
                }
            });
        }

        res.status(200).json({
            success: true,
            count: allClasses.length,
            data: allClasses
        });
    } catch (error) {
        console.error('Error getting teacher classes:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
