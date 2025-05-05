const mongoose = require('mongoose');

const examResultSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  class: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true
  },
  subjectResults: [{
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    remarks: String,
    status: {
      type: String,
      enum: ['Pass', 'Fail']
    },
    grade: String
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
}, { timestamps: true });

examResultSchema.index({ exam: 1, student: 1 }, { unique: true });

examResultSchema.methods.calculateGrade = function(percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  return 'F';
};

examResultSchema.methods.calculateGrade = function (percentage) {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C+';
  if (percentage >= 40) return 'C';
  return 'F';
};

examResultSchema.pre('save', async function (next) {
  if (!this.subjectResults || this.subjectResults.length === 0) {
    return next(new Error('Subject results are required'));
  }

  if (!this.subjectResults.every(s => typeof s.marksObtained === 'number')) {
    return next(new Error('All subject results must have valid marksObtained'));
  }

  const exam = await mongoose.model('Exam').findById(this.exam);
  if (!exam || !exam.totalMarks || !exam.passingMarks) {
    return next(new Error('Exam not found or missing total/passing marks'));
  }

  const subjectCount = this.subjectResults.length;

  this.totalMarksObtained = this.subjectResults.reduce((sum, s) => sum + s.marksObtained, 0);
  this.percentage = (this.totalMarksObtained / (exam.totalMarks * subjectCount)) * 100;
  this.grade = this.calculateGrade(this.percentage);

  // Update subject results with grade and status
  this.subjectResults = this.subjectResults.map(subject => {
    const subjectPercentage = (subject.marksObtained / exam.totalMarks) * 100;
    const subjectStatus = subjectPercentage >= (exam.passingMarks / exam.totalMarks * 100) ? 'Pass' : 'Fail';
    return {
      ...subject,
      grade: this.calculateGrade(subjectPercentage),
      status: subjectStatus
    };
  });

  // If any subject is failed, set overall status to Fail
  const anySubjectFailed = this.subjectResults.some(sub => sub.status === 'Fail');
  this.status = anySubjectFailed ? 'Fail' : 'Pass';

  next();
});


const ExamResult = mongoose.model('ExamResult', examResultSchema);
module.exports = ExamResult;
