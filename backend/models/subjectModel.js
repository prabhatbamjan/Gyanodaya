const mongoose = require('mongoose');

// Subject Schema Definition
const subjectSchema = new mongoose.Schema({
    code: { 
        type: String, 
        required: [true, 'code is required'],
        unique: true,
        trim: true
    },
    name: { 
        type: String, 
        unique: true,
        required: [true, 'name is required'],
        trim: true
    },
    description: { 
        type: String,
        required: [true, 'description is required'],
        trim: true
    },
    department: { 
        type: String, 
        required: [true, 'Department is required'],
        enum: ['Science', 'Nepali', 'Mathematics', 'Social Studies', 'Health and Physical Education', 'Moral Education', 'Optional/Additional Subjects']
    },
      createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create and export the model
const Subject = mongoose.model('Subject', subjectSchema);
module.exports = Subject; 