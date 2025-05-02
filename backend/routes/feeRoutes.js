const express = require('express');
const router = express.Router();
const { createFee, getFees, getStudentFees, updateFee, deleteFee } = require('../controllers/feeController');
const authController = require('../middleware/auth');

router.use(authController.protect); 

router.route('/')
    .post(createFee)
    .get( getFees);

router.route('/student/:studentId')
    .get(getStudentFees);

router.route('/:id')
    .put(updateFee)
    .delete(deleteFee);

module.exports = router;
