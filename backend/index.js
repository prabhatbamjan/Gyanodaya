const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const users = require('./routes/userRoutes');
const subjects = require('./routes/subjectRoutes');
const teachers = require('./routes/teacherRoutes');
const classes = require('./routes/classRoutes');
const timetables = require('./routes/timetableRoutes');
const students = require('./routes/studentRoutes');
const notifications = require('./routes/notificationRoutes');
// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/users', users);
app.use('/api/subjects', subjects);
app.use('/api/teachers', teachers);
app.use('/api/classes', classes);
app.use('/api/timetables', timetables);
app.use('/api/students', students);
app.use('/api/notifications', notifications);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});