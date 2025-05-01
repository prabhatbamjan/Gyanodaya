const AcademicCalendar = require('../models/academicCalendarModel');
const Class = require('../models/classModel');
const User = require('../models/userModels');

// Get all calendar events
exports.getAllEvents = async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      type, 
      classId, 
      academicYear 
    } = req.query;

    // Build filter object
    const filter = {};
    
    // Date filter
    if (startDate && endDate) {
      filter.$or = [
        { 
          startDate: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
          } 
        },
        { 
          endDate: { 
            $gte: new Date(startDate), 
            $lte: new Date(endDate) 
          } 
        },
        {
          $and: [
            { startDate: { $lte: new Date(startDate) } },
            { endDate: { $gte: new Date(endDate) } }
          ]
        }
      ];
    }

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Class filter
    if (classId) {
      filter.classes = classId;
    }

    // Academic year filter
    if (academicYear) {
      filter.academicYear = academicYear;
    }

    // Get events based on user role
    let events;
    
    if (req.user.role === 'admin') {
      // Admin can see all events
      events = await AcademicCalendar.find(filter)
        .populate('createdBy', 'firstName lastName')
        .populate('classes', 'name grade section');
    } else if (req.user.role === 'teacher') {
      // Teachers can see events for classes they teach
      const teacherClasses = await Class.find({ teacher: req.user._id }).select('_id');
      const classIds = teacherClasses.map(cls => cls._id);
      
      if (classId) {
        // If specific class requested, check if teacher teaches that class
        if (!classIds.includes(classId)) {
          return res.status(403).json({
            status: 'error',
            message: 'You are not authorized to view events for this class'
          });
        }
      } else {
        // Add teacher's classes to filter
        filter.$or = filter.$or || [];
        filter.$or.push(
          { classes: { $in: classIds } },
          { classes: { $size: 0 } } // Also include school-wide events (empty classes array)
        );
      }
      
      events = await AcademicCalendar.find(filter)
        .populate('createdBy', 'firstName lastName')
        .populate('classes', 'name grade section');
    } else if (req.user.role === 'student') {
      // Students can see events for their class
      const student = await User.findById(req.user._id).populate('class');
      
      if (!student.class) {
        return res.status(400).json({
          status: 'error',
          message: 'Student is not assigned to any class'
        });
      }
      
      filter.$or = filter.$or || [];
      filter.$or.push(
        { classes: student.class._id },
        { classes: { $size: 0 } } // Also include school-wide events
      );
      
      events = await AcademicCalendar.find(filter)
        .populate('createdBy', 'firstName lastName')
        .populate('classes', 'name grade section');
    } else if (req.user.role === 'parent') {
      // Parents can see events for their children's classes
      const parent = await User.findById(req.user._id);
      const children = await User.find({ parent: parent._id }).populate('class');
      
      if (!children.length) {
        return res.status(400).json({
          status: 'error',
          message: 'No children found for this parent'
        });
      }
      
      const childrenClassIds = children.map(child => child.class?._id).filter(Boolean);
      
      filter.$or = filter.$or || [];
      filter.$or.push(
        { classes: { $in: childrenClassIds } },
        { classes: { $size: 0 } } // Also include school-wide events
      );
      
      events = await AcademicCalendar.find(filter)
        .populate('createdBy', 'firstName lastName')
        .populate('classes', 'name grade section');
    }

    res.status(200).json({
      status: 'success',
      results: events.length,
      data: events
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get event by ID
exports.getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await AcademicCalendar.findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('classes', 'name grade section');
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create event
exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      startDate,
      endDate,
      allDay,
      type,
      color,
      location,
      classes,
      academicYear,
      isRecurring,
      recurrencePattern,
      attachments,
      notifyBefore
    } = req.body;

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({
        status: 'error',
        message: 'Start date cannot be after end date'
      });
    }

    // Validate classes if specified
    if (classes && classes.length > 0) {
      const validClasses = await Class.find({ _id: { $in: classes } });
      
      if (validClasses.length !== classes.length) {
        return res.status(400).json({
          status: 'error',
          message: 'One or more class IDs are invalid'
        });
      }
    }

    // Create event
    const event = await AcademicCalendar.create({
      title,
      description,
      startDate,
      endDate,
      allDay,
      type,
      color,
      location,
      classes: classes || [],
      academicYear,
      createdBy: req.user._id,
      isRecurring,
      recurrencePattern,
      attachments,
      notifyBefore
    });

    res.status(201).json({
      status: 'success',
      data: event
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update event
exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find event
    const event = await AcademicCalendar.findById(id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if user has permission (admin or creator)
    if (req.user.role !== 'admin' && !event.createdBy.equals(req.user._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to update this event'
      });
    }
    
    // Validate dates if provided
    if (req.body.startDate && req.body.endDate) {
      if (new Date(req.body.startDate) > new Date(req.body.endDate)) {
        return res.status(400).json({
          status: 'error',
          message: 'Start date cannot be after end date'
        });
      }
    }
    
    // Validate classes if provided
    if (req.body.classes && req.body.classes.length > 0) {
      const validClasses = await Class.find({ _id: { $in: req.body.classes } });
      
      if (validClasses.length !== req.body.classes.length) {
        return res.status(400).json({
          status: 'error',
          message: 'One or more class IDs are invalid'
        });
      }
    }
    
    // Update event
    const updatedEvent = await AcademicCalendar.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true
    });
    
    res.status(200).json({
      status: 'success',
      data: updatedEvent
    });
  } catch (error) {
    res.status(400).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete event
exports.deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find event
    const event = await AcademicCalendar.findById(id);
    
    if (!event) {
      return res.status(404).json({
        status: 'error',
        message: 'Event not found'
      });
    }
    
    // Check if user has permission (admin or creator)
    if (req.user.role !== 'admin' && !event.createdBy.equals(req.user._id)) {
      return res.status(403).json({
        status: 'error',
        message: 'You do not have permission to delete this event'
      });
    }
    
    // Delete event
    await AcademicCalendar.findByIdAndDelete(id);
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get academic years
exports.getAcademicYears = async (req, res) => {
  try {
    const academicYears = await AcademicCalendar.distinct('academicYear');
    
    res.status(200).json({
      status: 'success',
      data: academicYears
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 