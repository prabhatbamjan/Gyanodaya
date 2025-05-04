const mongoose = require('mongoose');

const TattendanceSchema = new mongoose.Schema({  
    date: {
        type: Date,
        required: [true, 'Date is required'],
        default: Date.now
    },    
    records: [{
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Teacher',
            required: [true, 'Teacher is required']
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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
  
    status: {
        type: String,
        enum: ['submitted', 'verified'],
        default: 'submitted'
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
TattendanceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add indexes for better query performance


module.exports = mongoose.model('Tattendance', TattendanceSchema); 