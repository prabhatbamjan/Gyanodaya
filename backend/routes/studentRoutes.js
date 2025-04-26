const express = require('express');
const router = express.Router();
const {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getparents
} = require('../contorollers/studentController');

// Get all students
router.route('/')
    .get(getAllStudents)
    .post(createStudent);


// Get student by ID
router.route('/edit/:id')
    .get(getStudentById)
    .put(updateStudent)
    .delete(deleteStudent);

router.route('/parents')
    .get(getparents);


module.exports = router; 