import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  UserPlus, 
  Users, 
  ArrowLeft, 
  MessageSquare,
  Info,
  Search,
  Megaphone
} from "lucide-react";
import { format } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import { getChats, getMessages, sendMessage, accessChat, getPotentialChatUsers, markChatAsRead, sendBroadcastMessage } from '../services/messageService';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastRecipient, setBroadcastRecipient] = useState('all');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const isAdmin = currentUser?.role === 'admin';

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

  const handleSendMessage = async (e) => {
    e?.preventDefault();
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
    return format(new Date(timestamp), 'h:mm a');
  };
  
  const formatDateHeader = (timestamp) => {
    return format(new Date(timestamp), 'MMMM d, yyyy');
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
  
  const getLastMessage = (chat) => {
    if (chat.messages && chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      return {
        text: lastMessage.text,
        timestamp: lastMessage.createdAt,
        sender: lastMessage.sender
      };
    }
    return null;
  };
  
  const getLastMessagePreview = (chat) => {
    const lastMessage = getLastMessage(chat);
    if (!lastMessage) return '';
    
    const senderName = lastMessage.sender._id === currentUser._id 
      ? 'You' 
      : `${lastMessage.sender.firstName}`;
      
    let messageText = lastMessage.text;
    if (messageText.length > 30) {
      messageText = messageText.substring(0, 27) + '...';
    }
    
    return senderName === 'You' 
      ? `You: ${messageText}` 
      : messageText;
  };
  
  const formatChatTimestamp = (chat) => {
    const lastMessage = getLastMessage(chat);
    if (!lastMessage) return '';
    
    const messageDate = new Date(lastMessage.timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(messageDate, 'h:mm a');
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return format(messageDate, 'EEEE'); // Day name
    } else {
      return format(messageDate, 'MM/dd/yyyy');
    }
  };
  
  const isUserOnline = (chat) => {
    // This would be implemented with a real online status system
    // For now, just randomly assign some users as online
    return Math.random() > 0.5;
  };
  
  const getFilteredChats = () => {
    if (!searchQuery) return chats;
    
    return chats.filter(chat => 
      getChatName(chat).toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleSendBroadcast = async () => {
    if (!broadcastMessage.trim()) return;
    
    try {
      setBroadcastLoading(true);
      await sendBroadcastMessage(broadcastMessage, broadcastRecipient);
      setBroadcastMessage('');
      setShowBroadcastModal(false);
      loadChats(); // Reload chats to show new broadcast messages
      setBroadcastLoading(false);
    } catch (error) {
      console.error('Error sending broadcast message:', error);
      setBroadcastLoading(false);
    }
  };

  // BroadcastModal component
  const BroadcastModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Send Broadcast Message</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Recipients
            </label>
            <select
              value={broadcastRecipient}
              onChange={(e) => setBroadcastRecipient(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Users</option>
              <option value="students">All Students</option>
              <option value="teachers">All Teachers</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              value={broadcastMessage}
              onChange={(e) => setBroadcastMessage(e.target.value)}
              placeholder="Type your broadcast message..."
              className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setShowBroadcastModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleSendBroadcast}
              disabled={!broadcastMessage.trim() || broadcastLoading}
              className={`px-4 py-2 rounded-md ${
                !broadcastMessage.trim() || broadcastLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {broadcastLoading ? 'Sending...' : 'Send to All'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (chatLoading) {
    return <Loader />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar - Chat list */}
      <div className="w-80 bg-white border-r flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-blue-600">Chats</h1>
        </div>
        
        {/* Search bar */}
        <div className="px-4 py-2 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Messenger"
              className="pl-10 py-2 w-full bg-gray-100 rounded-full text-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Chat actions */}
        <div className="px-2 py-2 flex space-x-2 border-b border-gray-200">
          <button 
            onClick={() => setOpenGroupModal(true)}
            className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-full"
          >
            <Users className="h-5 w-5 text-blue-600" />
          </button>
          <button 
            onClick={loadPotentialUsers}
            className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-full"
          >
            <UserPlus className="h-5 w-5 text-blue-600" />
          </button>
          {isAdmin && (
            <button 
              onClick={() => setShowBroadcastModal(true)}
              className="flex items-center justify-center p-2 hover:bg-gray-100 rounded-full"
              title="Send broadcast message"
            >
              <Megaphone className="h-5 w-5 text-blue-600" />
            </button>
          )}
        </div>
        
        {/* Chat list */}
        <div className="flex-1 overflow-y-auto">
          {showUserList ? (
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">New Message</h3>
                <button 
                  onClick={() => setShowUserList(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>
              {potentialUsers.map(user => (
                <div 
                  key={user._id}
                  onClick={() => startNewChat(user._id)}
                  className="flex items-center p-3 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium mr-3">
                    {getInitials(getUserName(user))}
                  </div>
                  <div>
                    <p className="font-medium">{getUserName(user)}</p>
                    <p className="text-sm text-gray-500">{user.role}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            getFilteredChats().map(chat => (
              <div
                key={chat._id}
                onClick={() => selectChat(chat)}
                className={`flex items-center px-4 py-3 cursor-pointer relative ${
                  selectedChat?._id === chat._id ? 'bg-blue-50' : 'hover:bg-gray-100'
                }`}
              >
                <div className="relative mr-3">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium">
                    {chat.isGroupChat ? (
                      <Users className="h-6 w-6" />
                    ) : (
                      getInitials(getChatName(chat))
                    )}
                  </div>
                  {isUserOnline(chat) && !chat.isGroupChat && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-sm font-medium truncate">{getChatName(chat)}</h3>
                    <span className="text-xs text-gray-500">{formatChatTimestamp(chat)}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {getLastMessagePreview(chat)}
                  </p>
                </div>
                {chat.unreadCount > 0 && (
                  <div className="ml-2 h-5 w-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{chat.unreadCount}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      {/* Right side - Chat area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat header */}
            <div className="bg-white border-b border-gray-200 p-3 flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium mr-3">
                  {selectedChat.isGroupChat ? (
                    <Users className="h-5 w-5" />
                  ) : (
                    getInitials(getChatName(selectedChat))
                  )}
                </div>
                <div>
                  <h3 className="font-medium">{getChatName(selectedChat)}</h3>
                  {isUserOnline(selectedChat) && !selectedChat.isGroupChat && (
                    <p className="text-xs text-green-500">Active now</p>
                  )}
                </div>
              </div>
              <button className="text-blue-500 hover:bg-blue-50 p-2 rounded-full">
                <Info className="h-5 w-5" />
              </button>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loading ? (
                <div className="flex justify-center items-center h-full">
                  <Loader />
                </div>
              ) : messages.length > 0 ? (
                <div className="flex flex-col space-y-3">
                  {messages.map((message, index) => {
                    const isCurrentUser = message.sender._id === currentUser._id;
                    const showDateHeader = index === 0 || 
                      new Date(message.createdAt).toDateString() !== 
                      new Date(messages[index-1].createdAt).toDateString();
                    
                    return (
                      <React.Fragment key={message._id}>
                        {showDateHeader && (
                          <div className="text-center my-4">
                            <span className="px-4 py-1 bg-gray-200 rounded-full text-sm text-gray-600">
                              {formatDateHeader(message.createdAt)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                          {!isCurrentUser && (
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium mr-2 self-end">
                              {getInitials(getUserName(message.sender))}
                            </div>
                          )}
                          <div className="max-w-xs md:max-w-md">
                            <div className={`rounded-2xl px-4 py-2 ${
                              isCurrentUser 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-200 text-gray-800'
                            }`}>
                              <p className="text-sm">{message.text}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1 ml-1">
                              {formatTimestamp(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mb-4" />
                  <p>No messages yet</p>
                  <p className="text-sm">Send a message to start the conversation</p>
                </div>
              )}
            </div>
            
            {/* Message input */}
            <div className="bg-white p-4 border-t border-gray-200">
              <form onSubmit={handleSendMessage} className="flex items-center">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Aa"
                  className="flex-1 border-0 bg-gray-100 rounded-full py-2 px-4 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!messageText.trim()}
                  className={`ml-2 p-2 rounded-full ${
                    messageText.trim() 
                      ? 'text-blue-500 hover:bg-blue-50' 
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-50">
            <MessageSquare className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-700">Your Messages</h3>
            <p className="text-gray-500 mt-1">Select a chat to start messaging</p>
            <button
              onClick={loadPotentialUsers}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              New Message
            </button>
          </div>
        )}
      </div>
      
      {/* Group Chat Modal */}
      {openGroupModal && (
        <CreateGroupChat
          isOpen={openGroupModal}
          onClose={() => setOpenGroupModal(false)}
          onSuccess={handleGroupChatCreated}
        />
      )}
      
      {/* Broadcast Modal */}
      {showBroadcastModal && <BroadcastModal />}
    </div>
  );
};

export default Messages; 