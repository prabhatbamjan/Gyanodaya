import axios from 'axios';

const API_URL = 'http://localhost:5000/api/chats';

// Get all chats for the current user
export const getChats = async () => {
  try {
    const response = await axios.get(API_URL, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get a single chat or create one if it doesn't exist
export const accessChat = async (userId) => {
  try {
    const response = await axios.post(API_URL, { userId }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get messages for a specific chat
export const getMessages = async (chatId) => {
  try {
    const response = await axios.get(`${API_URL}/${chatId}/messages`, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Send a message in a chat
export const sendMessage = async (chatId, text, attachments = []) => {
  try {
    const response = await axios.post(`${API_URL}/${chatId}/messages`, {
      chatId,
      text,
      attachments
    }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get potential users to chat with
export const getPotentialChatUsers = async (role) => {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      params: { role },
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Create a group chat
export const createGroupChat = async (name, participants) => {
  try {
    const response = await axios.post(`${API_URL}/group`, {
      name, 
      participants
    }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update a group chat
export const updateGroupChat = async (chatId, name, participants) => {
  try {
    const response = await axios.put(`${API_URL}/group`, {
      chatId,
      name,
      participants
    }, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Mark all messages in a chat as read
export const markChatAsRead = async (chatId) => {
  try {
    const response = await axios.put(`${API_URL}/${chatId}/read`, {}, {
      withCredentials: true
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 