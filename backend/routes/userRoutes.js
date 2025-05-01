const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgotPassword', userController.forgotPassword);
router.post('/verifyResetCode', userController.verifyResetCode);
router.post('/resetPassword', userController.resetPassword);

// Protected routes
router.use(authController.protect); // All routes after this middleware will be protected

router.get('/profile', userController.getProfile);
router.patch('/update-password', userController.updatePassword);

module.exports = router;