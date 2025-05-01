const express = require('express');
const router = express.Router();
const {
    getAllEvents,
    getEventsByClass,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventById
} = require('../controllers/eventController');
const authController = require('../middleware/auth');
// Public routes
router.get('/', getAllEvents);
router.get('/class/:classId', getEventsByClass);
router.get('/:id', getEventById);

// Protected routes (require authentication)
router.use(authController.protect); 
// Admin only routes
router.post('/',  createEvent);
router.put('/:id',  updateEvent);
router.delete('/:id',  deleteEvent);

module.exports = router; 