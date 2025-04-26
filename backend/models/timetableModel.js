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
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday']
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
        }
    }],
    academicYear: {
        type: String,
        required: [true, 'Academic year is required']
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
timetableSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Timetable', timetableSchema); 