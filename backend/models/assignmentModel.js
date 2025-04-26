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
  isDraft: {
    type: Boolean,
    default: false
  },
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