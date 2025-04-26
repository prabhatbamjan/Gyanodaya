const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'announcement'],
    default: 'info'
  },
  recipients: {
    // Recipients can be specific users or roles
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    roles: [{
      type: String,
      enum: ['admin', 'teacher', 'student', 'parent', 'all']
    }]
  },
  isGlobal: {
    type: Boolean,
    default: false
  },
  relatedTo: {
    // Optional reference to related document (like a class, event, etc.)
    model: {
      type: String,
      enum: ['Class', 'AcademicCalendar', 'Subject', 'User', 'Teacher', 'Student', 'Timetable']
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  link: {
    // Optional link to navigate to when clicking the notification
    type: String
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
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});


const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification; 