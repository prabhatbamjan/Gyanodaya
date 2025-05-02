const express = require('express');
const router = express.Router();
const {
    getAllOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    generateReport
} = require('../controllers/orderController');
const authController = require('../middleware/auth');

// Protect all routes
router.use(authController.protect);

// Routes
router.get('/report', generateReport);
router.route('/')
    .get(getAllOrders)
    .post(createOrder);

router.route('/:id')
    .get(getOrder)
    .patch(updateOrderStatus);

module.exports = router;
