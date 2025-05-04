const express = require('express');
const router = express.Router();
const {
  createExam,
  getAllExams,
  getExam,
  updateExam,
  deleteExam,
  getTeacherExams,
  submitExamResults,
  getExamResults
} = require('../controllers/examController');
const authController = require('../middleware/auth');

// Protect all routes
router.use(authController.protect);

// Admin routes

router.route('/')
  .post(createExam)
  .get(getAllExams);

router.route('/:id')
  .get(getExam)
  .put(updateExam)
  .delete(deleteExam);

// Teacher routes
router.get('/teacher', getTeacherExams);
router.post('/:examId/results', submitExamResults);

// Common routes (accessible by admin and teachers)
router.get('/:examId/results', getExamResults);

module.exports = router;
