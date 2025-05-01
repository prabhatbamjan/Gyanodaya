const Chat = require('../models/chatModel');
const User = require('../models/userModels');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// Get or create a chat between two users
exports.accessChat = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError('Please provide a user ID', 400));
  }

  // Try to find an existing one-on-one chat
  let chat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { participants: { $elemMatch: { $eq: req.user._id } } },
      { participants: { $elemMatch: { $eq: userId } } }
    ]
  }).populate('participants', 'firstName lastName email role profilePicture');

  // If no chat exists, create a new one
  if (!chat) {
    const targetUser = await User.findById(userId);

    if (!targetUser) {
      return next(new AppError('User not found', 404));
    }

    const chatData = {
      participants: [req.user._id, userId],
      isGroupChat: false
    };

    chat = await Chat.create(chatData);
    chat = await Chat.findById(chat._id).populate('participants', 'firstName lastName email role profilePicture');
  }

  res.status(200).json({
    status: 'success',
    data: chat
  });
});

// Get all chats for the current user
exports.getChats = catchAsync(async (req, res, next) => {
  const chats = await Chat.find({
    participants: { $elemMatch: { $eq: req.user._id } }
  })
    .populate('participants', 'firstName lastName email role profilePicture')
    .populate('groupAdmin', 'firstName lastName email role')
    .sort({ updatedAt: -1 });

  // Calculate unread counts for each chat
  const chatsWithUnreadCount = chats.map(chat => {
    const unreadCount = chat.getUnreadCount(req.user._id);
    const chatObj = chat.toObject();
    chatObj.unreadCount = unreadCount;
    return chatObj;
  });

  res.status(200).json({
    status: 'success',
    results: chatsWithUnreadCount.length,
    data: chatsWithUnreadCount
  });
});

// Create a group chat
exports.createGroupChat = catchAsync(async (req, res, next) => {
  const { name, participants } = req.body;

  if (!name || !participants || !Array.isArray(participants) || participants.length < 2) {
    return next(new AppError('Please provide a name and at least 2 participants for the group chat', 400));
  }

  // Add current user to participants
  participants.push(req.user._id.toString());

  // Remove duplicates
  const uniqueParticipants = [...new Set(participants)];

  // Create the group chat
  const groupChat = await Chat.create({
    groupName: name,
    participants: uniqueParticipants,
    isGroupChat: true,
    groupAdmin: req.user._id
  });

  // Return populated group chat
  const fullGroupChat = await Chat.findById(groupChat._id)
    .populate('participants', 'firstName lastName email role profilePicture')
    .populate('groupAdmin', 'firstName lastName email role');

  res.status(201).json({
    status: 'success',
    data: fullGroupChat
  });
});

// Update a group chat (rename, add/remove participants)
exports.updateGroupChat = catchAsync(async (req, res, next) => {
  const { chatId, name, participants } = req.body;

  // Find the chat
  let chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new AppError('Chat not found', 404));
  }

  // Check if the user is the admin of the group
  if (chat.groupAdmin.toString() !== req.user._id.toString()) {
    return next(new AppError('Only the group admin can update the group', 403));
  }

  // Update the group name if provided
  if (name) {
    chat.groupName = name;
  }

  // Update participants if provided
  if (participants && Array.isArray(participants)) {
    // Ensure the admin is always in the group
    const uniqueParticipants = [...new Set([...participants, req.user._id.toString()])];
    chat.participants = uniqueParticipants;
  }

  await chat.save();

  // Return updated chat
  const updatedChat = await Chat.findById(chatId)
    .populate('participants', 'firstName lastName email role profilePicture')
    .populate('groupAdmin', 'firstName lastName email role');

  res.status(200).json({
    status: 'success',
    data: updatedChat
  });
});

// Get all messages for a chat
exports.getMessages = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  // Find the chat
  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new AppError('Chat not found', 404));
  }

  // Check if the user is a participant
  if (!chat.participants.includes(req.user._id)) {
    return next(new AppError('You are not a participant of this chat', 403));
  }

  // Mark all messages as read for the current user
  await chat.markAsRead(req.user._id);

  // Return the messages
  res.status(200).json({
    status: 'success',
    data: chat.messages
  });
});

// Send a message
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { chatId, text, attachments } = req.body;

  if (!chatId || !text) {
    return next(new AppError('Please provide a chat ID and message text', 400));
  }

  // Find the chat
  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new AppError('Chat not found', 404));
  }

  // Check if the user is a participant
  if (!chat.participants.includes(req.user._id)) {
    return next(new AppError('You are not a participant of this chat', 403));
  }

  // Create the message
  const messageData = {
    sender: req.user._id,
    text,
    readBy: [{ user: req.user._id }], // Mark as read by sender
    attachments: attachments || []
  };

  // Add the message to the chat
  const newMessage = await chat.addMessage(messageData);

  // Update the latest message reference
  chat.latestMessage = newMessage;
  await chat.save();

  // Return the new message
  res.status(201).json({
    status: 'success',
    data: newMessage
  });
});

// Get potential chat users based on role
exports.getPotentialChatUsers = catchAsync(async (req, res, next) => {
  const { role } = req.query;
  let users = [];

  // Based on user role, find appropriate users to chat with
  if (req.user.role === 'admin') {
    // Admin can chat with everyone
    if (role) {
      users = await User.find({ role, _id: { $ne: req.user._id } }).select('firstName lastName email role profilePicture');
    } else {
      users = await User.find({ _id: { $ne: req.user._id } }).select('firstName lastName email role profilePicture');
    }
  } else if (req.user.role === 'teacher') {
    // Teacher can chat with admin, other teachers, parents of their students, and their students
    if (role === 'admin') {
      users = await User.find({ role: 'admin' }).select('firstName lastName email role profilePicture');
    } else if (role === 'teacher') {
      users = await User.find({ role: 'teacher', _id: { $ne: req.user._id } }).select('firstName lastName email role profilePicture');
    } else if (role === 'student' || role === 'parent' || !role) {
      // Find teacher details
      const teacher = await Teacher.findOne({ user: req.user._id }).populate('class');
      
      if (teacher) {
        // Get students from assigned classes
        const studentIds = [];
        const parentIds = [];
        
        for (const cls of teacher.class) {
          const classStudents = await Student.find({ class: cls._id })
            .populate('user')
            .populate('parent');
          
          classStudents.forEach(student => {
            studentIds.push(student.user._id);
            if (student.parent) {
              parentIds.push(student.parent);
            }
          });
        }
        
        if (role === 'student' || !role) {
          const studentUsers = await User.find({ _id: { $in: studentIds } }).select('firstName lastName email role profilePicture');
          users.push(...studentUsers);
        }
        
        if (role === 'parent' || !role) {
          const parentUsers = await User.find({ _id: { $in: parentIds } }).select('firstName lastName email role profilePicture');
          users.push(...parentUsers);
        }
        
        if (!role) {
          const adminUsers = await User.find({ role: 'admin' }).select('firstName lastName email role profilePicture');
          const teacherUsers = await User.find({ role: 'teacher', _id: { $ne: req.user._id } }).select('firstName lastName email role profilePicture');
          users.push(...adminUsers, ...teacherUsers);
        }
      }
    }
  } else if (req.user.role === 'student') {
    // Students can chat with their teachers and admin
    if (role === 'admin' || !role) {
      const adminUsers = await User.find({ role: 'admin' }).select('firstName lastName email role profilePicture');
      users.push(...adminUsers);
    }
    
    if (role === 'teacher' || !role) {
      // Find student details
      const student = await Student.findOne({ user: req.user._id }).populate('class');
      
      if (student) {
        // Get teachers assigned to student's class
        const teachers = await Teacher.find({ class: { $in: [student.class._id] } }).populate('user');
        const teacherUsers = teachers.map(teacher => teacher.user);
        users.push(...teacherUsers);
      }
    }
  } else if (req.user.role === 'parent') {
    // Parents can chat with teachers of their children and admin
    if (role === 'admin' || !role) {
      const adminUsers = await User.find({ role: 'admin' }).select('firstName lastName email role profilePicture');
      users.push(...adminUsers);
    }
    
    if (role === 'teacher' || !role) {
      // Find parent's children
      const children = await Student.find({ parent: req.user._id }).populate('class');
      
      // Get all classes of children
      const classIds = children.map(child => child.class._id);
      
      // Get all teachers for those classes
      const teachers = await Teacher.find({ class: { $in: classIds } }).populate('user');
      const teacherUsers = teachers.map(teacher => teacher.user);
      users.push(...teacherUsers);
    }
  }

  // Remove duplicates
  const uniqueUsers = [];
  const userIds = new Set();
  
  users.forEach(user => {
    if (!userIds.has(user._id.toString())) {
      userIds.add(user._id.toString());
      uniqueUsers.push(user);
    }
  });

  res.status(200).json({
    status: 'success',
    results: uniqueUsers.length,
    data: uniqueUsers
  });
});

// Mark all messages in a chat as read
exports.markChatAsRead = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;

  // Find the chat
  const chat = await Chat.findById(chatId);

  if (!chat) {
    return next(new AppError('Chat not found', 404));
  }

  // Check if the user is a participant
  if (!chat.participants.includes(req.user._id)) {
    return next(new AppError('You are not a participant of this chat', 403));
  }

  // Mark all messages as read for the current user
  const markedCount = await chat.markAsRead(req.user._id);

  res.status(200).json({
    status: 'success',
    message: `${markedCount} messages marked as read`
  });
}); 