const express = require('express');
const router = express.Router();
const {
    getAllTimetables,
    getTimetableByClass,
    createTimetable,
    updateTimetable,
    deleteTimetable,
    getClassesByTeacher,
    getTeacherTimetable,
    getTimetableById
} = require('../controllers/timetableController'); // Updated path to controllers directory

// Get all timetables and create new timetable
router.route('/')
    .get(getAllTimetables)
    .post(createTimetable);

// Get timetable by class
router.route('/class/:classId')
    .get(getTimetableByClass);

// Update and delete timetable
router.route('/:id')
    .get(getTimetableById)
    .put(updateTimetable)
    .delete(deleteTimetable);

// Get classes for a specific teacher
router.route('/teacher/:teacherId/classes')
    .get(getClassesByTeacher);

// Get timetable for a specific teacher 
router.route('/teacher/:teacherId')
    .get(getTeacherTimetable);

module.exports = router;
