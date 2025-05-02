const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const users = require('./routes/userRoutes');
const subjects = require('./routes/subjectRoutes');
const teachers = require('./routes/teacherRoutes');
const classes = require('./routes/classRoutes');
const timetables = require('./routes/timetableRoutes');
const students = require('./routes/studentRoutes');
const notifications = require('./routes/notificationRoutes');
const attendance = require('./routes/attendanceRoutes');
const events = require('./routes/eventRoutes');
const product =require('./routes/productRoutes')

const fees = require('./routes/feeRoutes');
const salaries = require('./routes/salaryRoutes');

const orders = require('./routes/orderRoutes');
// const assignments = require('./routes/assignmentRoutes');
// const submissions = require('./routes/submissionRoutes');
// const academicCalendar = require('./routes/academicCalendarRoutes');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection with better error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit process with failure
  });

// Set mongoose debug mode for development environment
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}

// Routes
app.use('/api/users', users);
app.use('/api/subjects', subjects);
app.use('/api/teachers', teachers);
app.use('/api/classes', classes);
app.use('/api/timetables', timetables);
app.use('/api/students', students);
app.use('/api/notifications', notifications);
app.use('/api/attendance', attendance);
app.use('/api/events', events);
app.use('/api/products',product)

app.use('/api/fees', fees);
app.use('/api/salaries', salaries);
app.use('/api/orders', orders);

// app.use('/api/assignments', assignments);
// app.use('/api/submissions', submissions);
// app.use('/api/academic-calendar', academicCalendar);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to School Management API' });
});

// 404 route handler
app.use((req, res, next) => {
  res.status(404).json({ 
    success: false, 
    message: 'API endpoint not found' 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  
  // Determine if error is a validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  // Determine if error is a MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key error',
      error: err.message
    });
  }
  
  // Default error response
  res.status(err.statusCode || 500).json({ 
    success: false, 
    message: err.message || 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  // Don't crash the server, but log the error
});

module.exports = app;