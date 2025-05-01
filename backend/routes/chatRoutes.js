const express = require('express');
const chatController = require('../controllers/chatController');
const authController = require('../controllers/authController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect);

// Get or create a 1-on-1 chat
router.post('/', chatController.accessChat);

// Get all chats for current user
router.get('/', chatController.getChats);

// Get messages in a chat
router.get('/:chatId/messages', chatController.getMessages);

// Send a message
router.post('/:chatId/messages', chatController.sendMessage);

// Mark messages as read
router.put('/:chatId/read', chatController.markChatAsRead);

// Get potential users to chat with
router.get('/users', chatController.getPotentialChatUsers);

// Create group chat
router.post('/group', chatController.createGroupChat);

// Update group chat
router.put('/group', chatController.updateGroupChat);

module.exports = router; 