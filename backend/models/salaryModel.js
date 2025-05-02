const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['paid', 'pending', 'partial'],
        default: 'pending'
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    paymentDate: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'bank', 'online'],
    },
    remarks: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Salary', salarySchema);
