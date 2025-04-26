const express = require('express');
const submissionController = require('../controllers/submissionController');
const authController = require('../controllers/authController');

// mergeParams allows access to params from parent router
const router = express.Router({ mergeParams: true });

// Protect all routes after this middleware
router.use(authController.protect);

// Get all submissions with optional filtering
router.get('/', submissionController.getAllSubmissions);

// Get a student's submissions
router.get('/student/:studentId', 
  submissionController.getStudentSubmissions
);

// Get submissions for an assignment
router.get('/assignment/:assignmentId',
  submissionController.checkAssignmentTeacherAccess,
  submissionController.getAssignmentSubmissions
);

// Submit a new assignment (students only)
router.post('/',
  authController.restrictTo('student'),
  submissionController.createSubmission
);

// Get a specific submission
router.get('/:id',
  submissionController.checkSubmissionAccess,
  submissionController.getSubmission
);

// Update a submission (student can only update their own)
router.put('/:id',
  authController.restrictTo('student'),
  submissionController.checkOwnership,
  submissionController.updateSubmission
);

// Delete a submission
router.delete('/:id',
  submissionController.checkSubmissionAccess,
  submissionController.deleteSubmission
);

// Grade a submission (teachers & admins only)
router.patch('/:id/grade',
  authController.restrictTo('teacher', 'admin'),
  submissionController.checkSubmissionAccess,
  submissionController.gradeSubmission
);

// Return a submission for revision (teachers & admins only)
router.patch('/:id/return',
  authController.restrictTo('teacher', 'admin'),
  submissionController.checkSubmissionAccess,
  submissionController.returnSubmission
);

module.exports = router; 