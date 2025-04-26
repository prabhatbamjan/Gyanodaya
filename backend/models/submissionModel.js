const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Schema for file attachments
const SubmissionAttachmentSchema = new Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

// Submission Schema
const SubmissionSchema = new Schema({
  assignment: {
    type: Schema.Types.ObjectId,
    ref: 'Assignment',
    required: [true, 'A submission must belong to an assignment']
  },
  student: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'A submission must belong to a student']
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  answer: {
    type: String,
    required: [true, 'A submission must have an answer']
  },
  attachments: [
    {
      name: String,
      path: String,
      mimeType: String,
      size: Number
    }
  ],
  marks: {
    type: Number,
    min: [0, 'Marks cannot be negative']
  },
  feedback: {
    type: String
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'resubmitted', 'returned', 'graded'],
    default: 'submitted'
  },
  gradedAt: Date,
  returnedAt: Date,
  lateSubmission: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  gradedBy: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for student information
SubmissionSchema.virtual('studentInfo', {
  ref: 'Student',
  localField: 'student',
  foreignField: '_id',
  justOne: true
});

// Virtual for assignment information
SubmissionSchema.virtual('assignmentInfo', {
  ref: 'Assignment',
  localField: 'assignment',
  foreignField: '_id',
  justOne: true
});

// Virtual field for percentage score
SubmissionSchema.virtual('percentageScore').get(function() {
  if (!this.marks || !this.assignmentInfo.totalMarks) return null;
  return (this.marks / this.assignmentInfo.totalMarks) * 100;
});

// Method to check if submission is late when created
SubmissionSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Assignment = mongoose.model('Assignment');
      const assignment = await Assignment.findById(this.assignment);
      
      if (assignment && new Date() > new Date(assignment.dueDate)) {
        this.isLate = true;
      }
    } catch (err) {
      console.error('Error checking if submission is late:', err);
    }
  }
  this.lastUpdated = Date.now();
  next();
});

// Set gradedAt when status changes to graded
SubmissionSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'graded') {
    this.gradedAt = Date.now();
  }
  next();
});

// Pre-find hooks to populate assignment and student by default
SubmissionSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'assignment',
    select: 'title description dueDate totalMarks subjectId classId',
  }).populate({
    path: 'student',
    select: 'name email class',
  });
  next();
});

// Indexes for faster querying
SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });
SubmissionSchema.index({ student: 1 });
SubmissionSchema.index({ assignment: 1 });
SubmissionSchema.index({ status: 1 });
SubmissionSchema.index({ submittedAt: 1 });

const Submission = mongoose.model('Submission', SubmissionSchema);

module.exports = Submission; 