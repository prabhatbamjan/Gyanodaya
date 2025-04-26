const express = require('express');
const router = express.Router();
const {
    getAllTimetables,
    getTimetableByClass,
    createTimetable,
    updateTimetable,
    deleteTimetable,
    getClassesByTeacher,
   
} = require('../contorollers/timetableController'); // make sure this matches your file

// Get all timetables and create new timetable
router.route('/')
    .get(getAllTimetables)
    .post(createTimetable);

// Get timetable by class
router.route('/class/:classId')
    .get(getTimetableByClass);

// Update and delete timetable
router.route('/:id')
    .put(updateTimetable)
    .delete(deleteTimetable);

router.route('/class/:teacherId').get(getClassesByTeacher); 

module.exports = router;
