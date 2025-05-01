const express = require('express');
const router = express.Router();
const {
    getAllStudents,
    getStudentById,
    createStudent,
    updateStudent,
    deleteStudent,
    getparents,
    getstudnetByclass,
    getStudentsByClasses

} = require('../controllers/studentController');
const upload = require("../middleware/uplode");
// Get all students
router.route('/')
    .get(getAllStudents)
    .post(upload.single("image"),createStudent);


// Get student by 
router.route('/:id')
    .get(getStudentById)
    .put(upload.single("image"),updateStudent)
    .delete(deleteStudent);



router.route('/parents')
    .get(getparents);
router.route('/class/:id')
    .get(getstudnetByclass);
router.route('/classes')
    .get(getStudentsByClasses);


module.exports = router; 