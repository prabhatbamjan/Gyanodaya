const express = require('express');
const router = express.Router();
const {
    getAttendanceRecords,
    createAttendance,
    updateAttendance,
    deleteAttendance,
    generateReport,
    getAttendanceByTeacher,
    getAttendanceById
} = require('../controllers/attendanceController');

// Get all attendance records and create new attendance
router.route('/')
    .get(getAttendanceRecords)
    .post(createAttendance);
router.route('/teacher/:teacherId')
    .get(getAttendanceByTeacher);
   

// Generate attendance report
router.route('/report')
    .get(generateReport);

// Update and delete attendance record
router.route('/:id')
    .get(getAttendanceById)
    .put(updateAttendance)
    .delete(deleteAttendance);

module.exports = router; 