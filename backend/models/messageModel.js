const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  recipients: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: null
    }
  }],
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot be more than 100 characters']
  },
  body: {
    type: String,
    required: [true, 'Message body is required'],
    trim: true
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    default: null
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    deletedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Virtual for checking if the message is read by a specific user
messageSchema.methods.isReadBy = function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  return recipient && recipient.readAt !== null;
};

// Mark as read by a specific user
messageSchema.methods.markAsRead = async function(userId) {
  const recipient = this.recipients.find(r => r.user.toString() === userId.toString());
  
  if (recipient && !recipient.readAt) {
    recipient.readAt = new Date();
    await this.save();
    return true;
  }
  
  return false;
};

// Get conversation thread
messageSchema.statics.getThread = async function(messageId) {
  const rootMessage = await this.findById(messageId);
  
  if (!rootMessage) {
    return [];
  }
  
  // If this message is part of a thread, find the root message
  const rootId = rootMessage.parentMessage || rootMessage._id;
  
  // Get all messages in the thread
  return this.find({
    $or: [
      { _id: rootId },
      { parentMessage: rootId }
    ],
    isDeleted: false
  }).sort('createdAt').populate('sender', 'firstName lastName role');
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message; 