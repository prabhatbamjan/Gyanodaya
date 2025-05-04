const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  getUserNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  markAsRead,
  markAllAsRead
} = require('../controllers/notificationController');

const authController = require('../middleware/auth');


// Protect all routes
router.use(authController.protect);

// User notification routes
router.get('/my', getUserNotifications);
router.post('/mark-all-read', markAllAsRead);
router.post('/:id/mark-read', markAsRead);

// Admin routes (restricted to admin)
// router.use(authController);
router.route('/')
  .get(getAllNotifications)
  .post(createNotification);

router.route('/:id')
  .get(getNotificationById)
  .put(updateNotification)
  .delete(deleteNotification);

module.exports = router; 