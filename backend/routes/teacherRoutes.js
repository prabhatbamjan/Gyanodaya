const express = require('express');
const router = express.Router();
const {
    getTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    getTeacherClasses
} = require('../controllers/teacherController');
const upload = require("../middleware/uplode");

// Get all teachers and create a new teacher
router.route('/')
    .get(getTeachers)
    .post(upload.single("image"),createTeacher);

// Get, update and delete a single teacher
router.route('/:id')
    .get(getTeacher)
    .put(upload.single("image"),updateTeacher)
    .delete(deleteTeacher);

// Get classes assigned to a teacher
router.route('/:id/classes')
    .get(getTeacherClasses);

module.exports = router; 