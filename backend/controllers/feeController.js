const Fee = require('../models/feeModel');
const Student = require('../models/studentModel');

exports.createFee = async (req, res) => {
    try {
        const fee = await Fee.create(req.body);
        res.status(201).json({
            success: true,
            data: fee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getFees = async (req, res) => {
    try {
        const fees = await Fee.find().populate('student', 'name class');
        res.status(200).json({
            success: true,
            data: fees
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getStudentFees = async (req, res) => {
    try {
        const fees = await Fee.find({ student: req.params.studentId });
        res.status(200).json({
            success: true,
            data: fees
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateFee = async (req, res) => {
    try {
        const fee = await Fee.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: fee
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteFee = async (req, res) => {
    try {
        await Fee.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Fee record deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
