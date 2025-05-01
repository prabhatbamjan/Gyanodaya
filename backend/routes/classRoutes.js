const express = require('express');
const router = express.Router();
const {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
  addSubjectsToClass
} = require('../controllers/classController');

// Routes
router.route('/')
  .get(getAllClasses)
  .post(createClass);

router.route('/:id')
  .get(getClassById)
  .put(updateClass)
  .delete(deleteClass);

router.route('/:id/subjects')
  .post(addSubjectsToClass);

module.exports = router; 