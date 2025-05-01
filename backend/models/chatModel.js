const mongoose = require('mongoose');

// Schema for individual messages
const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }]
}, {
  timestamps: true
});

// Schema for chat conversations
const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isGroupChat: {
    type: Boolean,
    default: false
  },
  groupName: {
    type: String,
    trim: true
  },
  groupAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [messageSchema],
  latestMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Method to add a message to a chat
chatSchema.methods.addMessage = async function(messageData) {
  this.messages.push(messageData);
  this.latestMessage = this.messages[this.messages.length - 1]._id;
  await this.save();
  return this.messages[this.messages.length - 1];
};

// Method to mark messages as read for a user
chatSchema.methods.markAsRead = async function(userId) {
  const unreadMessages = this.messages.filter(msg => 
    !msg.readBy.some(rb => rb.user.toString() === userId.toString()) &&
    msg.sender.toString() !== userId.toString()
  );

  unreadMessages.forEach(msg => {
    msg.readBy.push({ user: userId });
  });

  if (unreadMessages.length > 0) {
    await this.save();
    return unreadMessages.length;
  }
  
  return 0;
};

// Method to get unread message count for a user
chatSchema.methods.getUnreadCount = function(userId) {
  return this.messages.filter(msg => 
    !msg.readBy.some(rb => rb.user.toString() === userId.toString()) &&
    msg.sender.toString() !== userId.toString()
  ).length;
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat; 