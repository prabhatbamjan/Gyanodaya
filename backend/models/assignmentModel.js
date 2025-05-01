const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide assignment title'],
    trim: true,
    maxlength: [100, 'Assignment title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide assignment description'],
    trim: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Please provide class ID']
  },
  subjectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, 'Please provide subject ID']
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: [true, 'Please provide teacher ID']
  },
  period: {
    type: Number,
    required: [true, 'Please provide period number']
  },
  academicYear: {
    type: String,
    required: [true, 'Please provide academic year'],
    match: [/^\d{4}-\d{4}$/, 'Academic year must be in format YYYY-YYYY']
  },
  dueDate: {
    type: Date,
    required: [true, 'Please provide due date']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please provide total marks'],
    min: [0, 'Total marks cannot be negative']
  },
  instructions: {
    type: String,
    trim: true
  },
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String,
    fileSize: Number
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft'
  },
  submissions: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    submittedAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'submitted', 'late', 'not_submitted'],
      default: 'pending'
    },
    marks: {
      type: Number,
      min: 0
    },
    remarks: {
      type: String,
      trim: true
    },
    attachments: [{
      fileName: String,
      filePath: String,
      fileType: String,
      fileSize: Number
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate to get submission count
assignmentSchema.virtual('submissionCount', {
  ref: 'Submission',
  localField: '_id',
  foreignField: 'assignmentId',
  count: true
});

// Index for faster queries
assignmentSchema.index({ classId: 1, subjectId: 1, dueDate: 1 });
assignmentSchema.index({ teacherId: 1 });
assignmentSchema.index({ isDraft: 1 });

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;