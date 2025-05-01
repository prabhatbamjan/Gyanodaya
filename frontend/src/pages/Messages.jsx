import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  UserPlus, 
  Users, 
  ArrowLeft, 
  MessageSquare 
} from "lucide-react";
import { format } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import { getChats, getMessages, sendMessage, accessChat, getPotentialChatUsers, markChatAsRead } from '../services/messageService';
import Loader from '../components/Loader';
import CreateGroupChat from '../components/CreateGroupChat';

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [potentialUsers, setPotentialUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);
  const [openGroupModal, setOpenGroupModal] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('user'));

  // Load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check if there's a chat ID in the URL params and select that chat
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const chatId = params.get('chatId');
    
    if (chatId && chats.length > 0) {
      const chat = chats.find(c => c._id === chatId);
      if (chat) selectChat(chat);
    }
  }, [location.search, chats]);

  const loadChats = async () => {
    try {
      setChatLoading(true);
      const response = await getChats();
      setChats(response.data);
      setChatLoading(false);
    } catch (error) {
      console.error('Error loading chats:', error);
      setChatLoading(false);
    }
  };

  const selectChat = async (chat) => {
    try {
      setSelectedChat(chat);
      setLoading(true);
      const response = await getMessages(chat._id);
      setMessages(response.data);
      
      // Mark messages as read
      await markChatAsRead(chat._id);
      
      setLoading(false);
      
      // Update URL with chat ID
      navigate(`/messages?chatId=${chat._id}`, { replace: true });
      
      // Update chat list to reflect read messages
      loadChats();
    } catch (error) {
      console.error('Error loading messages:', error);
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;
    
    try {
      await sendMessage(selectedChat._id, messageText);
      setMessageText('');
      
      // Reload messages to show the new message
      const response = await getMessages(selectedChat._id);
      setMessages(response.data);
      
      // Update chat list to show latest message
      loadChats();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const loadPotentialUsers = async () => {
    try {
      setLoading(true);
      const response = await getPotentialChatUsers();
      setPotentialUsers(response.data);
      setShowUserList(true);
      setLoading(false);
    } catch (error) {
      console.error('Error loading potential users:', error);
      setLoading(false);
    }
  };

  const startNewChat = async (userId) => {
    try {
      setLoading(true);
      const response = await accessChat(userId);
      
      // Add the new chat to the list if it's not already there
      if (!chats.find(chat => chat._id === response.data._id)) {
        setChats([response.data, ...chats]);
      }
      
      // Select the new chat
      setSelectedChat(response.data);
      
      // Hide the user list
      setShowUserList(false);
      
      // Load messages for the new chat
      const messagesResponse = await getMessages(response.data._id);
      setMessages(messagesResponse.data);
      
      // Update URL with chat ID
      navigate(`/messages?chatId=${response.data._id}`, { replace: true });
      
      setLoading(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTimestamp = (timestamp) => {
    return format(new Date(timestamp), 'MMM d, h:mm a');
  };

  const getUserName = (user) => {
    return `${user.firstName} ${user.lastName}`;
  };

  const getChatName = (chat) => {
    if (chat.isGroupChat && chat.groupName) {
      return chat.groupName;
    }
    
    // For one-on-one chats, show the other user's name
    const otherUser = chat.participants.find(p => p._id !== currentUser._id);
    return otherUser ? getUserName(otherUser) : 'Unknown User';
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleGroupChatCreated = () => {
    loadChats();
  };

  if (chatLoading) {
    return <Loader />;
  }

  return (
    <div className="container mx-auto px-4 mt-4 mb-4">
      <h2 className="text-2xl font-semibold mb-4">Messages</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Chat List */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Conversations</h3>
              <div className="flex">
                <button 
                  onClick={() => setOpenGroupModal(true)} 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full mr-2"
                >
                  <Users size={20} />
                </button>
                <button 
                  onClick={loadPotentialUsers} 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-full"
                >
                  <UserPlus size={20} />
                </button>
              </div>
            </div>
            
            <hr className="mb-4" />
            
            {chats.length === 0 ? (
              <div className="text-center mt-4">
                <p className="text-gray-500">No conversations yet</p>
                <button 
                  className="mt-4 px-4 py-2 bg-white border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50 inline-flex items-center"
                  onClick={loadPotentialUsers}
                >
                  <UserPlus size={16} className="mr-2" />
                  Start a new conversation
                </button>
              </div>
            ) : (
              <ul className="overflow-y-auto flex-grow">
                {chats.map((chat) => (
                  <li 
                    key={chat._id} 
                    className={`flex items-center p-3 cursor-pointer border-b ${selectedChat && selectedChat._id === chat._id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    onClick={() => selectChat(chat)}
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                        {getInitials(getChatName(chat))}
                      </div>
                      {chat.unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium">{getChatName(chat)}</p>
                      {chat.isGroupChat && (
                        <p className="text-sm text-gray-500">Group · {chat.participants.length} members</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Message Area */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-lg shadow-md flex flex-col h-full">
            {showUserList ? (
              <>
                <div className="p-4 flex items-center border-b">
                  <button 
                    onClick={() => setShowUserList(false)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  >
                    <ArrowLeft size={20} />
                  </button>
                  <h3 className="text-lg font-semibold ml-2">New Conversation</h3>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <ul className="overflow-y-auto flex-grow">
                    {potentialUsers.map((user) => (
                      <li 
                        key={user._id} 
                        className="flex items-center p-4 border-b cursor-pointer hover:bg-gray-50"
                        onClick={() => startNewChat(user._id)}
                      >
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          {getInitials(`${user.firstName} ${user.lastName}`)}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium">{`${user.firstName} ${user.lastName}`}</p>
                          <p className="text-sm text-gray-500">
                            {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : selectedChat ? (
              <>
                <div className="p-4 border-b flex items-center">
                  <h3 className="text-lg font-semibold">{getChatName(selectedChat)}</h3>
                  {selectedChat.isGroupChat && (
                    <span className="text-sm text-gray-500 ml-2">
                      ({selectedChat.participants.length} members)
                    </span>
                  )}
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center flex-grow p-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                ) : (
                  <div className="p-4 overflow-y-auto flex-grow flex flex-col">
                    {messages.length === 0 ? (
                      <div className="text-center mt-12">
                        <p className="text-gray-500">No messages yet</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Send a message to start the conversation
                        </p>
                      </div>
                    ) : (
                      messages.map((message, index) => {
                        const isCurrentUser = message.sender._id === currentUser._id;
                        const senderName = `${message.sender.firstName} ${message.sender.lastName}`;
                        
                        return (
                          <div
                            key={index}
                            className={`flex flex-col mb-4 ${isCurrentUser ? 'items-end' : 'items-start'}`}
                          >
                            {selectedChat.isGroupChat && !isCurrentUser && (
                              <span className="text-xs text-gray-500 ml-2 mb-1">
                                {senderName}
                              </span>
                            )}
                            
                            <div 
                              className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${
                                isCurrentUser 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <p className="break-words">{message.text}</p>
                              <p className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                {formatTimestamp(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
                
                <div className="p-4 border-t flex">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-grow border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <button 
                    className={`ml-2 p-2 rounded-full ${messageText.trim() ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                  >
                    <Send size={20} />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8">
                <MessageSquare size={48} className="text-gray-300 mb-4" />
                <h3 className="text-lg text-gray-500 mb-4">
                  Select a conversation or start a new one
                </h3>
                <div className="flex space-x-4">
                  <button 
                    className="px-4 py-2 border border-blue-600 rounded-md text-blue-600 hover:bg-blue-50 inline-flex items-center"
                    onClick={() => setOpenGroupModal(true)}
                  >
                    <Users size={16} className="mr-2" />
                    Create Group
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 rounded-md text-white hover:bg-blue-700 inline-flex items-center"
                    onClick={loadPotentialUsers}
                  >
                    <UserPlus size={16} className="mr-2" />
                    New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Group Chat Creation Modal */}
      <CreateGroupChat 
        open={openGroupModal} 
        handleClose={() => setOpenGroupModal(false)} 
        onSuccess={handleGroupChatCreated} 
      />
    </div>
  );
};

export default Messages; 