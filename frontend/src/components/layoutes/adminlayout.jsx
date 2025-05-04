import React, { useState, useRef, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  ShoppingBag, 
  BellRing, 
  School2, 
  LogOut, 
  Menu,
  X,
  Package,
  User,
  Settings,
  Bell,
  MessageSquare,
  DollarSign,
  Wallet
} from "lucide-react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getUserData } from '../../utils/auth';
import { getChats } from '../../services/messageService';

function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isChatNotificationsOpen, setIsChatNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New student registration', time: '10 min ago' },
    { id: 2, message: 'Upcoming parent-teacher meeting', time: '1 hour ago' },
    { id: 3, message: 'School event tomorrow', time: '2 hours ago' },
  ]);
  const [chats, setChats] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const navigate = useNavigate();
  const location = useLocation();
  const userData = getUserData();
 
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const chatNotificationsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (chatNotificationsRef.current && !chatNotificationsRef.current.contains(event.target)) {
        setIsChatNotificationsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load chats and calculate unread count
  useEffect(() => {
    async function loadChats() {
      try {
        const response = await getChats();
        const chatsWithUnread = response.data;
        setChats(chatsWithUnread);
        
        // Calculate total unread count
        const total = chatsWithUnread.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
        setUnreadCount(total);
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    }
    
    loadChats();
    
    // Refresh chats every minute
    const intervalId = setInterval(loadChats, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen(!isNotificationsOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
    if (isChatNotificationsOpen) setIsChatNotificationsOpen(false);
  };

  const toggleChatNotifications = () => {
    setIsChatNotificationsOpen(!isChatNotificationsOpen);
    if (isUserMenuOpen) setIsUserMenuOpen(false);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
    if (isChatNotificationsOpen) setIsChatNotificationsOpen(false);
  };

  // Function to determine if a link is active
  const isActive = (path) => {
    if (path === '/admin-dashboard' && location.pathname === '/admin-dashboard') {
      return true;
    }
    if (path !== '/admin-dashboard' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Helper function to get chat name
  const getChatName = (chat) => {
    if (chat.isGroupChat && chat.groupName) {
      return chat.groupName;
    }
    
    // For one-on-one chats, show the other user's name
    const otherUser = chat.participants.find(p => p._id !== userData._id);
    return otherUser ? `${otherUser.firstName} ${otherUser.lastName}` : 'Unknown User';
  };

  // Function to format message preview (truncate if too long)
  const formatMessagePreview = (message) => {
    if (!message) return '';
    return message.length > 30 ? message.substring(0, 30) + '...' : message;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navigation */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold">Gyanodaya</span>
          </div>
          
          <div className="flex items-center">
            {/* Chat Notifications */}
            <div className="relative mr-4" ref={chatNotificationsRef}>
              <button 
                className="text-white p-2 rounded-full hover:bg-blue-500 relative"
                onClick={toggleChatNotifications}
              >
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Chat Notifications dropdown */}
              {isChatNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">Messages</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {chats.length === 0 ? (
                      <div className="px-4 py-3 text-center text-gray-500">
                        No conversations yet
                      </div>
                    ) : (
                      chats.map(chat => (
                        <Link 
                          to={`/messages?chatId=${chat._id}`} 
                          key={chat._id} 
                          className="block"
                          onClick={() => setIsChatNotificationsOpen(false)}
                        >
                          <div className={`px-4 py-3 hover:bg-gray-100 border-b border-gray-100 ${chat.unreadCount > 0 ? 'bg-blue-50' : ''}`}>
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-800">{getChatName(chat)}</p>
                              {chat.unreadCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                            {chat.messages && chat.messages.length > 0 && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatMessagePreview(chat.messages[chat.messages.length - 1].text)}
                              </p>
                            )}
                          </div>
                        </Link>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 text-center border-t border-gray-100">
                    <Link to="/messages" className="text-sm text-blue-600 hover:text-blue-800" onClick={() => setIsChatNotificationsOpen(false)}>
                      View all messages
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* Notifications */}
            <div className="relative mr-4" ref={notificationsRef}>
              <button 
                className="text-white p-2 rounded-full hover:bg-blue-500 relative"
                onClick={toggleNotifications}
              >
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-xs">
                    {notifications.length}
                  </span>
                )}
              </button>
              
              {/* Notifications dropdown */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.map(notification => (
                      <div key={notification.id} className="px-4 py-3 hover:bg-gray-100 border-b border-gray-100">
                        <p className="text-sm text-gray-700">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 text-center">
                    <Link to="/notices" className="text-sm text-blue-600 hover:text-blue-800" onClick={() => setIsNotificationsOpen(false)}>
                      View all notifications
                    </Link>
                  </div>
                </div>
              )}
            </div>
            
            {/* User profile menu */}
            <div className="relative" ref={userMenuRef}>
              <div 
                className="flex items-center cursor-pointer"
                onClick={toggleUserMenu}
              >
                <span className="mr-2 hidden md:inline-block">
                  {userData ? `${userData.firstName} ${userData.lastName}` : 'Admin User'}
                </span>
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {userData ? userData.firstName.charAt(0) + userData.lastName.charAt(0) : 'AD'}
                  </span>
                </div>
              </div>
              
              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">
                      {userData ? `${userData.firstName} ${userData.lastName}` : 'Admin User'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {userData ? userData.email : 'admin@school.edu'}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link 
                      to="/admin-profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      <span>Profile</span>
                    </Link>
                    <Link 
                      to="/admin-settings" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4 mr-3 text-gray-500" />
                      <span>Settings</span>
                    </Link>
                  </div>
                  <div className="py-1 border-t border-gray-200">
                    <button 
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-gray-500" />
                      <span>Log out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <button 
              className="ml-4 md:hidden"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar - Desktop */}
        <aside className="w-64 bg-white shadow-md hidden md:block">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center">
              <Package className="h-5 w-5 mr-2 text-blue-600" />
              Administration
            </h2>
          </div>
          <nav className="py-4">
            <div className="px-3 mb-3">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</h3>
            </div>
            <ul className="space-y-1">
              <li>
                <Link 
                  to="/admin-dashboard" 
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin-dashboard') 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Building2 className={`h-5 w-5 mr-2 ${isActive('/admin-dashboard') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Dashboard</span>
                </Link>
              </li>

              <div className="px-3 pt-5 pb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Academic</h3>
              </div>

              <li>
                <Link 
                  to="/admin-classes" 
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin-classes') 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <BookOpen className={`h-5 w-5 mr-2 ${isActive('/admin-classes') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Classes</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin-subjects" 
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin-subjects') 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Package className={`h-5 w-5 mr-2 ${isActive('/admin-subjects') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Subjects</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin-timetable" 
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin-timetable') 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Calendar className={`h-5 w-5 mr-2 ${isActive('/admin-timetable') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Time Table</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin-exams" 
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin-exams') 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <ClipboardList className={`h-5 w-5 mr-2 ${isActive('/admin-exams') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Exams</span>
                </Link>
              </li>

              <div className="px-3 pt-5 pb-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Users</h3>
              </div>

              <li>
                <Link 
                  to="/admin-teachers" 
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    isActive('/admin-teachers') 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <School2 className={`h-5 w-5 mr-2 ${isActive('/admin-teachers') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Teachers</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin-students" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/admin/students') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Users className={`h-5 w-5 mr-3 ${isActive('/admin/students') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Students</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/attendance" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/attendance') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ClipboardList className={`h-5 w-5 mr-3 ${isActive('/attendance') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Attendance</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/messages" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/messages') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className={`h-5 w-5 mr-3 ${isActive('/messages') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Messages</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin-events" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/admin-events') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Calendar className={`h-5 w-5 mr-3 ${isActive('/admin-events') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Events</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin-orders" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/admin-orders') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Package className={`h-5 w-5 mr-3 ${isActive('/admin-orders') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Orders</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/product" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/admin-shop') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag className={`h-5 w-5 mr-3 ${isActive('/admin-shop') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>School Shop</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/notifications" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/notifications') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <BellRing className={`h-5 w-5 mr-3 ${isActive('/notifications') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Notifications</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/fee" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/fee') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <DollarSign className={`h-5 w-5 mr-3 ${isActive('/fee') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Fee Management</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin-salary-management" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/admin-salary-management') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Wallet className={`h-5 w-5 mr-3 ${isActive('/admin-salary-management') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Salary Management</span>
                </Link>
              </li>
              <li>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50">
            <div className="bg-white w-64 h-full overflow-y-auto shadow-lg">
              <div className="p-4 flex justify-between items-center border-b">
                <h2 className="text-xl font-semibold text-gray-800">Menu</h2>
                <button onClick={toggleMobileMenu}>
                  <X className="h-6 w-6 text-gray-500" />
                </button>
              </div>
              <nav className="py-4">
                <ul>
                  <li>
                    <Link 
                      to="/admin-dashboard" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin-dashboard') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Building2 className={`h-5 w-5 mr-3 ${isActive('/admin-dashboard') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin-profile" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin-profile') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <User className={`h-5 w-5 mr-3 ${isActive('/admin-profile') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin-students" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin-students') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Users className={`h-5 w-5 mr-3 ${isActive('/admin-students') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Students</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin-teachers" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin-teachers') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Users className={`h-5 w-5 mr-3 ${isActive('/admin-teachers') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Teachers</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin-classes" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin-classes') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <BookOpen className={`h-5 w-5 mr-3 ${isActive('/admin-classes') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Classes</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin-events" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin-events') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Calendar className={`h-5 w-5 mr-3 ${isActive('/admin-events') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Events</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/product" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin/shop') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <ShoppingBag className={`h-5 w-5 mr-3 ${isActive('/admin/shop') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>School Shop</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="fee" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/fee') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <DollarSign className={`h-5 w-5 mr-3 ${isActive('/fee') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Fee Management</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/salary" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin-salary') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Wallet className={`h-5 w-5 mr-3 ${isActive('/admin-salary') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Salary Management</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin/notices" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin/notices') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <BellRing className={`h-5 w-5 mr-3 ${isActive('/admin/notices') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Notifications</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin-settings" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin-settings') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Settings className={`h-5 w-5 mr-3 ${isActive('/admin-settings') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Settings</span>
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        handleLogout();
                        toggleMobileMenu();

                      }}
                      className="w-full flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-5 w-5 mr-3 text-gray-500" />
                      <span>Logout</span>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;