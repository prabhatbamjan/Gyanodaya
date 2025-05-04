const Notification = require('../models/notificationModel');
const User = require('../models/userModels');

// Get all notifications (admin only)
exports.getAllNotifications = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    
    // Apply filters if provided
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.role) filter['recipients.roles'] = req.query.role;
    if (req.query.isRead === 'true' || req.query.isRead === 'false') {
      const isRead = req.query.isRead === 'true';
      filter[isRead ? 'readBy.0' : 'readBy'] = isRead ? { $exists: true } : { $exists: false };
    }
    
    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName')
      .populate('readBy.user', 'firstName lastName')
      .populate('recipients.users', 'firstName lastName role')
      .populate('relatedTo.documentId', 'firstName lastName');
    
    const total = await Notification.countDocuments(filter);
    
    // Add read count and recipient details
    const notificationsWithDetails = notifications.map(notification => {
      const notificationObj = notification.toObject();
      notificationObj.readCount = notification.readBy.length;
      notificationObj.totalRecipients = (
        (notification.recipients?.users?.length || 0) +
        (notification.recipients?.roles?.length || 0) +
        (notification.isGlobal ? 1 : 0)
      );
      return notificationObj;
    });
    
    res.status(200).json({
      success: true,
      data: notificationsWithDetails,
      stats: {
        total,
        read: notificationsWithDetails.reduce((acc, n) => acc + (n.readCount > 0 ? 1 : 0), 0),
        unread: notificationsWithDetails.reduce((acc, n) => acc + (n.readCount === 0 ? 1 : 0), 0)
      },
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get user's notifications
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    
    // Find notifications for this user (by user id, role, or global)
    const notifications = await Notification.find({
      $or: [
        { 'recipients.users': userId },
        { 'recipients.roles': userRole },
        { 'recipients.roles': 'all' },
        { isGlobal: true },
        // Add specific conditions for teacher notifications
        ...(userRole === 'teacher' ? [{ 
          'relatedTo.model': 'Teacher',
          'relatedTo.documentId': userId
        }] : [])
      ]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName')
      .populate('relatedTo.documentId', 'firstName lastName');
    
    // Count total notifications
    const total = await Notification.countDocuments({
      $or: [
        { 'recipients.users': userId },
        { 'recipients.roles': userRole },
        { 'recipients.roles': 'all' },
        { isGlobal: true },
        ...(userRole === 'teacher' ? [{ 
          'relatedTo.model': 'Teacher',
          'relatedTo.documentId': userId
        }] : [])
      ]
    });
    
    // Add read status to each notification
    const notificationsWithReadStatus = notifications.map(notification => {
      const notificationObj = notification.toObject();
      notificationObj.isRead = notification.readBy.some(
        reader => reader.user.toString() === userId.toString()
      );
      return notificationObj;
    });
    
    res.status(200).json({
      success: true,
      data: notificationsWithReadStatus,
      unread: notificationsWithReadStatus.filter(n => !n.isRead).length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get notification by ID
exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('readBy.user', 'firstName lastName');
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create a new notification
exports.createNotification = async (req, res) => {
  try {
    const {
      title,
      message,
      type,
      recipients,
      isGlobal,
      relatedTo,
      link
    } = req.body;
    
    // Validate recipient users if specified
    if (recipients?.users && recipients.users.length > 0) {
      const validUsers = await User.countDocuments({ _id: { $in: recipients.users } });
      
      if (validUsers !== recipients.users.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more user IDs are invalid'
        });
      }
    }
    
    const notification = await Notification.create({
      title,
      message,
      type,
      recipients,
      isGlobal,
      relatedTo,
      link,
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Update a notification
exports.updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    res.status(204).json({
      success: true,
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notificationId = req.params.id;
    
    const notification = await Notification.findById(notificationId);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Check if user has already read this notification
    const alreadyRead = notification.readBy.some(
      reader => reader.user.toString() === userId.toString()
    );
    
    if (!alreadyRead) {
      // Add user to readBy array
      notification.readBy.push({
        user: userId,
        readAt: new Date()
      });
      
      await notification.save();
    }

    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      $or: [
        { 'recipients.users': userId },
        { 'recipients.roles': req.user.role },
        { 'recipients.roles': 'all' },
        { isGlobal: true },
        ...(req.user.role === 'teacher' ? [{ 
          'relatedTo.model': 'Teacher',
          'relatedTo.documentId': userId
        }] : [])
      ],
      'readBy.user': { $ne: userId }
    });
    
    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification,
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    
    // Mark all matching notifications as read
    await Notification.updateMany(
      {
        $or: [
          { 'recipients.users': userId },
          { 'recipients.roles': userRole },
          { 'recipients.roles': 'all' },
          { isGlobal: true },
          ...(userRole === 'teacher' ? [{ 
            'relatedTo.model': 'Teacher',
            'relatedTo.documentId': userId
          }] : [])
        ],
        'readBy.user': { $ne: userId }
      },
      {
        $push: {
          readBy: {
            user: userId,
            readAt: new Date()
          }
        }
      }
    );

    // Get updated unread count
    const unreadCount = await Notification.countDocuments({
      $or: [
        { 'recipients.users': userId },
        { 'recipients.roles': userRole },
        { 'recipients.roles': 'all' },
        { isGlobal: true },
        ...(userRole === 'teacher' ? [{ 
          'relatedTo.model': 'Teacher',
          'relatedTo.documentId': userId
        }] : [])
      ],
      'readBy.user': { $ne: userId }
    });
    
    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      unreadCount
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}; 