const mongoose = require('mongoose');

const academicCalendarSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  allDay: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['Holiday', 'Exam', 'Assignment', 'Event', 'Meeting', 'Term', 'Other'],
    default: 'Event'
  },
  color: {
    type: String,
    default: '#3788d8'
  },
  location: {
    type: String,
    trim: true
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  academicYear: {
    type: String,
    required: [true, 'Academic year is required'],
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'Monthly', 'Yearly', 'None'],
      default: 'None'
    },
    interval: {
      type: Number,
      default: 1
    },
    daysOfWeek: [{
      type: String,
      enum: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    }],
    endDate: {
      type: Date
    },
    occurrences: {
      type: Number
    }
  },
  attachments: [{
    name: String,
    url: String
  }],
  notifyBefore: {
    type: Number, // in minutes
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
academicCalendarSchema.index({ startDate: 1, endDate: 1 });
academicCalendarSchema.index({ academicYear: 1 });
academicCalendarSchema.index({ type: 1 });
academicCalendarSchema.index({ classes: 1 });

const AcademicCalendar = mongoose.model('AcademicCalendar', academicCalendarSchema);

module.exports = AcademicCalendar; 