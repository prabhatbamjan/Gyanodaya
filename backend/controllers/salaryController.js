const Salary = require('../models/salaryModel');
const Teacher = require('../models/teacherModel');

exports.createSalary = async (req, res) => {
    try {
        const salary = await Salary.create(req.body);
        res.status(201).json({
            success: true,
            data: salary
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find().populate('teacher', 'name subject');
        res.status(200).json({
            success: true,
            data: salaries
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.getTeacherSalary = async (req, res) => {
    try {
        const salaries = await Salary.find({ teacher: req.params.teacherId });
        res.status(200).json({
            success: true,
            data: salaries
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.updateSalary = async (req, res) => {
    try {
        const salary = await Salary.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            success: true,
            data: salary
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

exports.deleteSalary = async (req, res) => {
    try {
        await Salary.findByIdAndDelete(req.params.id);
        res.status(200).json({
            success: true,
            message: 'Salary record deleted successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
