const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: [true, 'Class is required']
    },
    day: {
        type: String,
        required: [true, 'Day is required'],
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },
    periods: [{
        periodNumber: {
            type: Number,
            required: [true, 'Period number is required']
        },
        startTime: {
            type: String,
            required: [true, 'Start time is required']
        },
        endTime: {
            type: String,
            required: [true, 'End time is required']
        },
        subject: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            required: [true, 'Subject is required']
        },
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            required: [true, 'Teacher is required']
        },
        location: {
            type: String,
            default: 'Regular Classroom'
        },
        notes: {
            type: String
        }
    }],
    academicYear: {
        type: String,
        required: [true, 'Academic year is required']
    },
    isRecurring: {
        type: Boolean,
        default: true
    },
    effectiveFrom: {
        type: Date,
        default: Date.now
    },
    effectiveUntil: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'draft'],
        default: 'active'
    }
});

// Update the timestamp when document is updated
timetableSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for checking if timetable is currently effective
timetableSchema.virtual('isCurrentlyEffective').get(function() {
    const now = new Date();
    return (
        this.status === 'active' &&
        now >= this.effectiveFrom &&
        (!this.effectiveUntil || now <= this.effectiveUntil)
    );
});

// Add indexes for performance
timetableSchema.index({ class: 1, day: 1 });
timetableSchema.index({ 'periods.teacher': 1 });
timetableSchema.index({ status: 1, effectiveFrom: 1, effectiveUntil: 1 });

module.exports = mongoose.model('Timetable', timetableSchema); 