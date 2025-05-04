const jwt = require('jsonwebtoken');
const User = require('../models/userModels');

exports.protect = async (req, res, next) => {
    try {
        let token;

        // Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'You are not logged in! Please log in to get access.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if user still exists
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.status(401).json({
                status: 'error',
                message: 'The user belonging to this token no longer exists.'
            });
            return;
        }

        // Grant access to protected route
        req.user = currentUser;
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({
            status: 'error',
            message: error.message || 'Invalid token. Please log in again!'
        });
    }
}; 

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'You are not authorized to perform this action' });
        }
        next();
    };
};