const express = require('express');
const router = express.Router();
const academicCalendarController = require('../contorollers/academicCalendarController');


// Protect all routes


// Get all academic years
router.get('/academic-years', academicCalendarController.getAcademicYears);

// Event routes
router.route('/')
  .get(academicCalendarController.getAllEvents)
  .post(restrictTo('admin', 'teacher'), academicCalendarController.createEvent);

router.route('/:id')
  .get(academicCalendarController.getEventById)
  .patch(restrictTo('admin', 'teacher'), academicCalendarController.updateEvent)
  .delete(restrictTo('admin', 'teacher'), academicCalendarController.deleteEvent);

module.exports = router; 