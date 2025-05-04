const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: [true, 'Exam is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student is required']
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: [true, 'Class is required']
  },
  subjectResults: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    marksObtained: {
      type: Number,
      required: [true, 'Marks obtained is required'],
      min: [0, 'Marks cannot be negative']
    },
    remarks: String,
    grade: String,
    status: {
      type: String,
      enum: ['Pass', 'Fail'],
      required: true
    }
  }],
  totalMarksObtained: {
    type: Number,
    required: true
  },
  percentage: {
    type: Number,
    required: true
  },
  grade: String,
  rank: Number,
  remarks: String,
  status: {
    type: String,
    enum: ['Pass', 'Fail'],
    required: true
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  academicYear: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Create indexes for better query performance
examResultSchema.index({ exam: 1, student: 1 }, { unique: true });
examResultSchema.index({ class: 1, academicYear: 1 });
examResultSchema.index({ student: 1, academicYear: 1 });

// Calculate grade based on percentage
examResultSchema.methods.calculateGrade = function(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  return 'F';
};

// Pre-save middleware to calculate total marks, percentage, and grade
examResultSchema.pre('save', async function(next) {
  // Calculate total marks obtained
  this.totalMarksObtained = this.subjectResults.reduce((total, subject) => total + subject.marksObtained, 0);
  
  // Get exam details for total marks
  const exam = await mongoose.model('Exam').findById(this.exam);
  if (!exam) {
    return next(new Error('Exam not found'));
  }
  
  // Calculate percentage
  this.percentage = (this.totalMarksObtained / (exam.totalMarks * this.subjectResults.length)) * 100;
  
  // Calculate overall grade
  this.grade = this.calculateGrade(this.percentage);
  
  // Set overall status
  this.status = this.percentage >= (exam.passingMarks / exam.totalMarks * 100) ? 'Pass' : 'Fail';
  
  // Calculate subject-wise grades and status
  this.subjectResults.forEach(subject => {
    const subjectPercentage = (subject.marksObtained / exam.totalMarks) * 100;
    subject.grade = this.calculateGrade(subjectPercentage);
    subject.status = subjectPercentage >= (exam.passingMarks / exam.totalMarks * 100) ? 'Pass' : 'Fail';
  });

  next();
});

const ExamResult = mongoose.model('ExamResult', examResultSchema);
module.exports = ExamResult;
