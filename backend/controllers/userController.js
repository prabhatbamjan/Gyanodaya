const User = require('../models/userModels');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');

// Generate JWT Token
const generateToken = (id,role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

// Register User
exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password} = req.body;
        if(!firstName || !lastName || !email || !password ){
            return res.status(400).json({
                status: 'error',
                message: 'Please provide all fields'
            });
        }

        // Set default role as 'student' if not provided
      

        //  Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                status: 'error',
                message: 'User already exists'
            });
        }

        // Create new user
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            role: 'student'
        });

        // Generate token
        const token = generateToken(user._id,user.role);

        res.status(201).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Login User
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({
                status: 'error',
                message: 'Please provide email and password'
            });
        }

        // Check if user exists && password is correct
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({
                status: 'error',
                message: 'Incorrect email or password'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Get User Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.status(200).json({
            status: 'success',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Update Password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Get user from collection
        const user = await User.findById(req.user.id).select('+password');

        // Check if current password is correct
        if (!(await user.matchPassword(currentPassword))) {
            return res.status(401).json({
                status: 'error',
                message: 'Your current password is wrong'
            });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        // Generate new token
        const token = generateToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            message: 'Password updated successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Get user based on email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'There is no user with that email address'
            });
        }

        // Generate a simple reset code (6 digits)
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Store reset code in user document
        user.resetCode = resetCode;
        user.resetCodeExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send email with reset code
        const message = `Your password reset code is: ${resetCode}\nThis code will expire in 10 minutes.\nIf you didn't request this, please ignore this email!`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Code',
                message
            });

            res.status(200).json({
                status: 'success',
                message: 'Reset code sent to email!'
            });
        } catch (err) {
            user.resetCode = undefined;
            user.resetCodeExpires = undefined;
            await user.save();

            return res.status(500).json({
                status: 'error',
                message: 'There was an error sending the email. Try again later!'
            });
        }
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Verify Reset Code
exports.verifyResetCode = async (req, res) => {
    try {
        const { email, resetCode } = req.body;

        // Find user with valid reset code
        const user = await User.findOne({
            email,
            resetCode,
            resetCodeExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired reset code'
            });
        }

        // Generate a temporary token for password reset
        const resetToken = generateToken(user._id);

        res.status(200).json({
            status: 'success',
            message: 'Reset code verified successfully',
            resetToken
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
};

// Reset Password with Code
exports.resetPassword = async (req, res) => {
    try {
        const { email, resetCode, newPassword } = req.body;

        // Find user with valid reset code
        const user = await User.findOne({
            email,
            resetCode,
            resetCodeExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                status: 'error',
                message: 'Invalid or expired reset code'
            });
        }

        // Update password
        user.password = newPassword;
        // Clear reset code fields
        user.resetCode = undefined;
        user.resetCodeExpires = undefined;
        await user.save();

        // Generate new token
        const token = generateToken(user._id);

        res.status(200).json({
            status: 'success',
            token,
            message: 'Password reset successfully'
        });
    } catch (error) {
        res.status(400).json({
            status: 'error',
            message: error.message
        });
    }
}; 
