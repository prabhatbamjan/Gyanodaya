import authAxios from '../utils/auth';

// Get all chats for the current user
export const getChats = async () => {
  try {
    const response = await authAxios.get('/chats');
    return response.data;
  } catch (error) {
    console.error('Error fetching chats:', error);
    throw error;
  }
};

// Get a single chat or create one if it doesn't exist
export const accessChat = async (userId) => {
  try {
    const response = await authAxios.post('/chats', { userId });
    return response.data;
  } catch (error) {
    console.error('Error accessing chat:', error);
    throw error;
  }
};

// Get messages for a specific chat
export const getMessages = async (chatId) => {
  try {
    const response = await authAxios.get(`/chats/${chatId}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Send a message in a chat
export const sendMessage = async (chatId, text, attachments = []) => {
  try {
    const response = await authAxios.post(`/chats/${chatId}/messages`, {
      text,
      attachments
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get potential users to chat with (filtered by role if specified)
export const getPotentialChatUsers = async () => {
  try {
    // Get current user
    const currentUser = JSON.parse(localStorage.getItem('user'));
    let params = {};
    
    // If student, only allow chats with teachers and admins
    if (currentUser?.role === 'student') {
      params.roles = ['teacher', 'admin'];
    }
    
    // If teacher, allow chats with students, other teachers, and admins
    else if (currentUser?.role === 'teacher') {
      params.roles = ['student', 'teacher', 'admin'];
    }
    
    // If admin, allow chats with everyone
    // No filters needed for admins
    
    const response = await authAxios.get('/chats/users', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching potential users:', error);
    throw error;
  }
};

// Create a group chat
export const createGroupChat = async (name, participants) => {
  try {
    const response = await authAxios.post('/chats/group', {
      name, 
      participants
    });
    return response.data;
  } catch (error) {
    console.error('Error creating group chat:', error);
    throw error;
  }
};

// Update a group chat
export const updateGroupChat = async (chatId, name, participants) => {
  try {
    const response = await authAxios.put(`/chats/group/${chatId}`, {
      name,
      participants
    });
    return response.data;
  } catch (error) {
    console.error('Error updating group chat:', error);
    throw error;
  }
};

// Mark all messages in a chat as read
export const markChatAsRead = async (chatId) => {
  try {
    const response = await authAxios.put(`/chats/${chatId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking chat as read:', error);
    throw error;
  }
};

// Search for users by name (useful for the search feature)
export const searchUsers = async (query) => {
  try {
    const response = await authAxios.get(`/chats/users/search`, {
      params: { query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

// Get teacher list (for students)
export const getTeachers = async () => {
  try {
    const response = await authAxios.get('/chats/users', {
      params: { roles: ['teacher'] }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching teachers:', error);
    throw error;
  }
};

// Get admin list (for students and teachers)
export const getAdmins = async () => {
  try {
    const response = await authAxios.get('/chats/users', {
      params: { roles: ['admin'] }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching admins:', error);
    throw error;
  }
};

// Send broadcast message to all users (admin only)
export const sendBroadcastMessage = async (text, recipientType = 'all') => {
  try {
    const response = await authAxios.post('/chats/broadcast', {
      text,
      recipientType // 'all', 'students', 'teachers'
    });
    return response.data;
  } catch (error) {
    console.error('Error sending broadcast message:', error);
    throw error;
  }
}; 