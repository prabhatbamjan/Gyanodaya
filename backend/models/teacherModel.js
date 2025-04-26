const mongoose = require('mongoose');

// Teacher Schema Definition
const teacherSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female', 'Other']
      },
      dob: {
        type: Date,
        required: [true, 'Date of birth is required']
      },
      joinDate: {
        type: Date,
        required: [true, 'Joining date is required'],
        default: Date.now
      },
      qualification: {
        type: String,
        required: [true, 'Qualification is required'],
        trim: true
      },
      salary: {
        type: Number,
        min: [0, 'Salary cannot be negative'],
        required: false
      },
      experience: {
        type: Number,
        min: [0, 'Experience cannot be negative'],
        required: false
      },
     
      profileImage: {
        type: String, // URL or path to image
        required: false
      },
      address: {
        street: {
          type: String,
          required: [true, 'Street address is required'],
          trim: true
        },
        city: {
          type: String,
          required: [true, 'City is required'],
          trim: true
        },
        state: {
          type: String,
          required: [true, 'State is required'],
          trim: true
        },
        zipCode: {
          type: String,
          required: [true, 'Zip code is required'],
          trim: true
        },
        country: {
          type: String,
          default: 'Nepal',
          trim: true
        }
      },
      subjects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subject',
        required: true
      }],
      class: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        
      }],
      isActive: {
        type: Boolean,
        default: true
      },
   
    
    
   
}, {
    timestamps: true
});

// Create and export the model
const Teacher = mongoose.model('Teacher', teacherSchema);
module.exports = Teacher;



 
