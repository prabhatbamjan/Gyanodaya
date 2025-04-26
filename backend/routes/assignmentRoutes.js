const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const submissionController = require('../controllers/submissionController');
const authController = require('../controllers/authController');
const submissionRoutes = require('./submissionRoutes');

// Protect all routes after this middleware
router.use(authController.protect);

// Re-route to submission routes if the URL contains assignmentId
router.use('/:assignmentId/submissions', submissionRoutes);

// Get assignments for a specific class (accessible by students, teachers, and admins)
router.get(
  '/class/:classId',
  authController.restrictTo('admin', 'teacher', 'student', 'parent'),
  assignmentController.getClassAssignments
);

// Get assignments for a specific subject (accessible by students, teachers, and admins)
router.get(
  '/subject/:subjectId',
  authController.restrictTo('admin', 'teacher', 'student', 'parent'),
  assignmentController.getSubjectAssignments
);

// Get assignments for a specific teacher (accessible by the teacher and admins)
router.get(
  '/teacher/:teacherId',
  authController.restrictTo('admin', 'teacher'),
  assignmentController.getTeacherAssignments
);

// Get a specific assignment by ID (accessible by anyone who has access to the class)
router.route('/:id')
  .get(authController.restrictTo('admin', 'teacher', 'student', 'parent'), assignmentController.getAssignment)
  .patch(authController.restrictTo('admin', 'teacher'), assignmentController.updateAssignment)
  .delete(authController.restrictTo('admin', 'teacher'), assignmentController.deleteAssignment);

// Get all assignments (with filtering options) and create a new assignment
router.route('/')
  .get(authController.restrictTo('admin', 'teacher', 'student', 'parent'), assignmentController.getAllAssignments)
  .post(authController.restrictTo('admin', 'teacher'), assignmentController.createAssignment);

// Publish a draft assignment
router.patch(
  '/:id/publish',
  authController.restrictTo('admin', 'teacher'),
  assignmentController.publishAssignment
);

// Get classes and subjects for teacher (for assignment form)
router.get(
  '/teacher/classes',
  authController.restrictTo('teacher'),
  assignmentController.getTeacherClasses
);

router.get(
  '/teacher/subjects',
  authController.restrictTo('teacher'),
  assignmentController.getTeacherSubjects
);

// Teacher-specific routes
router.get(
  '/teacher',
  authController.restrictTo('teacher'),
  assignmentController.getTeacherAssignments,
  assignmentController.getAllAssignments
);

// Student-specific routes
router.get(
  '/student',
  authController.restrictTo('student'),
  assignmentController.getAllAssignments
);

// Create an assignment (teacher only)
router.post(
  '/',
  authController.restrictTo('teacher'),
  assignmentController.upload.array('attachments', 5), // Allow up to 5 files
  assignmentController.createAssignment
);

// Get, update, and delete an assignment
router.route('/:id')
  .get(assignmentController.getAssignmentById)
  .put(
    authController.restrictTo('teacher'),
    assignmentController.upload.array('attachments', 5),
    assignmentController.updateAssignment
  )
  .delete(
    authController.restrictTo('teacher'),
    assignmentController.deleteAssignment
  );

// Download assignment attachment
router.get(
  '/:id/attachments/:attachmentId',
  assignmentController.downloadAttachment
);

// Routes for submissions
router.get(
  '/:id/submissions',
  authController.restrictTo('teacher'),
  submissionController.getAssignmentSubmissions
);

// Submit an assignment (student only)
router.post(
  '/:id/submit',
  authController.restrictTo('student'),
  submissionController.upload.array('attachments', 5),
  submissionController.submitAssignment
);

// Get a specific submission
router.get(
  '/:id/submissions/:submissionId',
  submissionController.getSubmission
);

// Grade a submission (teacher only)
router.put(
  '/:id/submissions/:submissionId/grade',
  authController.restrictTo('teacher'),
  submissionController.gradeSubmission
);

// Download submission attachment
router.get(
  '/submissions/download/:attachmentId',
  submissionController.downloadSubmissionAttachment
);

// Download all submissions for an assignment as a zip (teacher only)
router.get(
  '/:id/submissions/download',
  authController.restrictTo('teacher'),
  submissionController.downloadAllSubmissions
);

module.exports = router; 