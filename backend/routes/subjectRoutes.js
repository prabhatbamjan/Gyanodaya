const express = require('express');
const router = express.Router();
const {
    getSubjects,
    getSubject,
    createSubject,
    updateSubject,
    deleteSubject,
    getSubjectss
} = require('../contorollers/subjectController');

// Get all subjects and create a new subject
router.route('/')
    .get(getSubjects)   
    .post(createSubject);

// Get, update and delete a single subject
router.route('/:id')
    .get(getSubject)
    .put(updateSubject)
    .delete(deleteSubject);

router.route('/subjects')
    .get(getSubjectss);


module.exports = router; 