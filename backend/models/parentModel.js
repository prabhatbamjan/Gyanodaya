const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
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
    type: Number,
    required: [true, 'Phone is required'],
    trim: true
  }, 
  occupation: {
    type: String,
    required: [true, 'Occupation is required'],
    trim: true
  },
  relationship: {
    type: String,
    required: [true, 'Relationship is required'],
    trim: true
  },
  children: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Children information is required']
  }],
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

// ✅ Use proper model name
const Parent = mongoose.models.Parent || mongoose.model('Parent', parentSchema);

module.exports = Parent;
