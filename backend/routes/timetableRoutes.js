const express = require('express');
const router = express.Router();
const {
  getAllTimetables,
  getTimetableByClass,
  getTimetableById,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  teacherTimetable,
  getClassesByTeacher,
  getTeachersByClass
} = require('../controllers/timetableController');

// Get all timetables and create new timetable
router.route('/')
  .get(getAllTimetables)
  .post(createTimetable);

// Get, update, delete timetable by ID
router.route('/:id')
  .get(getTimetableById)
  .put(updateTimetable)
  .delete(deleteTimetable);

// Get timetable by class
router.route('/class/:classId')
  .get(getTimetableByClass);

// Get full timetable of a teacher
router.route('/teacher/:teacherId')
  .get(teacherTimetable);

// Get all classes assigned to a teacher
router.route('/teacher/classes/:teacherId')
  .get(getClassesByTeacher);

// Get all teachers assigned to a class
router.route('/teachers/class/:classId')
  .get(getTeachersByClass);

module.exports = router;
