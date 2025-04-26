const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classSchema = new Schema({
  name: {
    type: Number,
    required: [true, 'Class name is required'],
    min: 1,
    max: 12
   },
  grade: {
    type: Number,
    required: [true, 'Grade level is required'],
    min: 1,
    max: 12
  },
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true,
  },
  section: {
    type: String,
    required: [true, 'Section is required'],
    trim: true,
  
  },
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  classTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  capacity: {
    type: Number,
    default: 30
  },
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  }],
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule'
  },
  academicYear: {
    type: String,
    required: [true, 'Academic year is required']
  },
  fee: {
    type: Number,
    required: [true, 'Fee is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the timestamp when document is updated
classSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Class', classSchema); 