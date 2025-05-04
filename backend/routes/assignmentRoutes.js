const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAllAssignments,
  getAssignment,
  updateAssignment,
  deleteAssignment,
  getClassAssignments,
  getTeacherAssignments,
  getStudentAssignments,
  uploadAssignmentFiles
} = require('../controllers/assignmentController');
const { 
  createSubmission, 
  getStudentSubmission,
  getAssignmentSubmissions,
  updateSubmission,
  gradeSubmission,
  uploadSubmissionFiles
} = require('../controllers/submissionController');
const { protect} = require('../middleware/auth');

// Protect all routes
router.use(protect);

// Assignment routes
router.route('/')
  .post( uploadAssignmentFiles, createAssignment)
  .get(getAllAssignments);

router.route('/teacher')
  .get(getTeacherAssignments);

router.route('/student')
  .get( getStudentAssignments);

router.route('/:id')
  .get(getAssignment)
  .put( uploadAssignmentFiles, updateAssignment)
  .delete( deleteAssignment);

router.route('/class/:classId')
  .get(getClassAssignments);

// Submission routes
router.route('/:assignmentId/submissions')
  .get( getAssignmentSubmissions);

router.route('/:assignmentId/submit')
  .post( uploadSubmissionFiles, createSubmission);

router.route('/:assignmentId/submission')
  .get(getStudentSubmission);

router.route('/:assignmentId/submission/:studentId')
  .get( getStudentSubmission);

router.route('/submissions/:submissionId')
  .put( uploadSubmissionFiles, updateSubmission);

router.route('/submissions/:submissionId/grade')
  .put( gradeSubmission);

module.exports = router; 