const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: [true, 'Class is required']
    },
    subject: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: [true, 'Subject is required']
    },
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },
    period: {
        type: Number,
        required: [true, 'Period number is required']
    },
    records: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: [true, 'Student is required']
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'late', 'excused'],
            default: 'present'
        },
        remarks: {
            type: String
        },
        markedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Teacher who marked attendance is required']
        },
        markedAt: {
            type: Date,
            default: Date.now
        }
    }],
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: [true, 'Teacher is required']
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required']
    },
    status: {
        type: String,
        enum: ['draft', 'submitted', 'verified'],
        default: 'draft'
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

// Update timestamp on save
attendanceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add indexes for better query performance
attendanceSchema.index({ class: 1, date: 1, subject: 1 });
attendanceSchema.index({ 'records.student': 1, date: 1 });
attendanceSchema.index({ teacher: 1, date: 1 });
attendanceSchema.index({ date: 1, status: 1 });

// Virtual for getting attendance statistics
attendanceSchema.virtual('statistics').get(function() {
    const total = this.records.length;
    const present = this.records.filter(r => r.status === 'present').length;
    const absent = this.records.filter(r => r.status === 'absent').length;
    const late = this.records.filter(r => r.status === 'late').length;
    const excused = this.records.filter(r => r.status === 'excused').length;

    return {
        total,
        present,
        absent,
        late,
        excused,
        presentPercentage: (present / total) * 100
    };
});

module.exports = mongoose.model('Attendance', attendanceSchema); 