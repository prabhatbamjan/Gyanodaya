const express = require('express');
const router = express.Router();
const { createSalary, getSalaries, getTeacherSalary, updateSalary, deleteSalary } = require('../controllers/salaryController');
const authController = require('../middleware/auth');

router.use(authController.protect); 
router.route('/')
    .post(createSalary)
    .get(getSalaries);

router.route('/teacher/:teacherId')
    .get(getTeacherSalary);

router.route('/:id')
    .put(updateSalary)
    .delete(deleteSalary);

module.exports = router;
