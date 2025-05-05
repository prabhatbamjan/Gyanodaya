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
  getExamResults,
  getExamByClass
} = require('../controllers/examController');

const authController = require('../middleware/auth');

// Protect all routes
router.use(authController.protect);

// Teacher-specific
router.get('/teacher', getTeacherExams);
router.post('/:examId/results', submitExamResults);

// Common
router.get('/:examId/results', getExamResults);

// Admin
router.route('/')
  .post(createExam)
  .get(getAllExams);

router.route('/:id')
  .get(getExam)
  .put(updateExam)
  .delete(deleteExam);

router.route('/class/:classId')
  .get(getExamByClass);

module.exports = router;
