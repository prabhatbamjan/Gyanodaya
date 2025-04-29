const Event = require('../models/eventModel');
const Class = require('../models/classModel');

// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('classes', 'name grade section')
            .populate('createdBy', 'firstName lastName')
            .sort({ startDate: 1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};

// Get events by class
exports.getEventsByClass = async (req, res) => {
    try {
        const classId = req.params.classId;
        
        // Verify class exists
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({
                success: false,
                message: 'Class not found'
            });
        }

        const events = await Event.find({ classes: classId })
            .populate('classes', 'name grade section')
            .populate('createdBy', 'firstName lastName')
            .sort({ startDate: 1 });

        res.status(200).json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        console.error('Error fetching events by class:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};

// Create new event
exports.createEvent = async (req, res) => {
    try {
        const { title, description, startDate, endDate, location, eventType, classes } = req.body;

        // Validate dates
        if (new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be after end date'
            });
        }

        // Validate classes if provided
        if (classes && classes.length > 0) {
            const validClasses = await Class.find({ _id: { $in: classes } });
            if (validClasses.length !== classes.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more invalid class IDs provided'
                });
            }
        }

        const event = await Event.create({
            ...req.body,
            createdBy: req.user._id
        });

        const populatedEvent = await Event.findById(event._id)
            .populate('classes', 'name grade section')
            .populate('createdBy', 'firstName lastName');

        res.status(201).json({
            success: true,
            data: populatedEvent
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create event',
            error: error.message
        });
    }
};

// Update event
exports.updateEvent = async (req, res) => {
    try {
        const { startDate, endDate, classes } = req.body;

        // Validate dates if provided
        if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
            return res.status(400).json({
                success: false,
                message: 'Start date cannot be after end date'
            });
        }

        // Validate classes if provided
        if (classes && classes.length > 0) {
            const validClasses = await Class.find({ _id: { $in: classes } });
            if (validClasses.length !== classes.length) {
                return res.status(400).json({
                    success: false,
                    message: 'One or more invalid class IDs provided'
                });
            }
        }

        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('classes', 'name grade section')
         .populate('createdBy', 'firstName lastName');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error updating event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update event',
            error: error.message
        });
    }
};

// Delete event
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete event',
            error: error.message
        });
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate('classes', 'name grade section')
            .populate('createdBy', 'firstName lastName');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.status(200).json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Error fetching event:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event',
            error: error.message
        });
    }
}; 