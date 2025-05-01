const express = require('express');
const router = express.Router();
const resultController = require('../controllers/resultController');
const authController = require('../middleware/auth');

// Protect all routes
router.use(authController.protect);

// Admin only routes
router.route('/')
  .get(authController.restrictTo('admin'), resultController.getAllResults);

// Publish results (admin only)
router.post(
  '/publish',
  authController.restrictTo('admin'),
  resultController.publishResults
);

// Get results statistics (admin and teachers)
router.get(
  '/statistics',
  authController.restrictTo('admin', 'teacher'),
  resultController.getResultStatistics
);

// Get results for a specific class
router.get(
  '/class/:classId',
  authController.restrictTo('admin', 'teacher'),
  resultController.getClassResults
);

// Get results for a specific student
router.get(
  '/student/:studentId',
  authController.restrictTo('admin', 'teacher', 'student', 'parent'),
  resultController.getStudentResults
);

// Get results for a specific teacher
router.get(
  '/teacher/:teacherId',
  authController.restrictTo('admin', 'teacher'),
  resultController.getTeacherResults
);

// Create, update, delete results
router.route('/')
  .post(
    authController.restrictTo('admin', 'teacher'),
    resultController.createResult
  );

router.route('/:id')
  .put(
    authController.restrictTo('admin', 'teacher'),
    resultController.updateResult
  )
  .delete(
    authController.restrictTo('admin'),
    resultController.deleteResult
  );

module.exports = router; 