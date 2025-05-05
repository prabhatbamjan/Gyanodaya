const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exam name is required'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Exam type is required'],
    enum: ['Unit Test', 'Mid Term', 'Final Term', 'Practice Test', 'Other']
  },
  description: {
    type: String,
    trim: true
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: [0, 'Total marks cannot be negative']
  },
  passingMarks: {
    type: Number,
    required: [true, 'Passing marks is required'],
    min: [0, 'Passing marks cannot be negative'],
    validate: {
      validator: function(value) {
        return value <= this.totalMarks;
      },
      message: 'Passing marks cannot be greater than total marks'
    }
  },

  classSubjects: [
    {
      class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
      },
      subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
      }]
    }
  ],
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
    default: 'Upcoming'
  },
  resultsPublished: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Exam = mongoose.model('Exam', examSchema);
module.exports = Exam;

