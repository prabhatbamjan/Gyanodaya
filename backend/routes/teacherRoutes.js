const express = require('express');
const router = express.Router();
const {
    getTeachers,
    getTeacher,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    
} = require('../contorollers/teacherController');

// Get all teachers and create a new teacher
router.route('/')
    .get(getTeachers)
    .post(createTeacher);

// Get, update and delete a single teacher
router.route('/:id')
    .get(getTeacher)
    .put(updateTeacher)
    .delete(deleteTeacher);



module.exports = router; 