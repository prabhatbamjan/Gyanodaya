import React, { useState, useRef, useEffect } from 'react';
import { 
  Home, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  BellRing, 
  LogOut, 
  Menu,
  X,
  Package,
  User,
  Settings,
  Bell,
  Award,
  MessageSquare,
  FileText,
  Book
} from "lucide-react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getUserData } from '../../utils/auth';

function StudentLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New assignment posted in Mathematics', time: '10 min ago' },
    { id: 2, message: 'Upcoming test reminder: Science', time: '1 hour ago' },
    { id: 3, message: 'School event tomorrow', time: '2 hours ago' },
  ]);
  
  const navigate = useNavigate();
  const location = useLocation();
  const userData = getUserData();
 
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
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
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
    if (isNotificationsOpen) setIsNotificationsOpen(false);
  };

  // Function to determine if a link is active
  const isActive = (path) => {
    if (path === '/student-dashboard' && location.pathname === '/student-dashboard') {
      return true;
    }
    if (path !== '/student-dashboard' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navigation */}
      <header className="bg-blue-600 text-white shadow-md">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold">Gyanodaya</span>
            <span className="text-sm font-bold">Student</span>
          </div>
          
          <div className="flex items-center">
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
                    <Link to="/student/notice" className="text-sm text-blue-600 hover:text-blue-800" onClick={() => setIsNotificationsOpen(false)}>
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
                  {userData ? `${userData.firstName} ${userData.lastName}` : 'Student User'}
                </span>
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {userData ? userData.firstName.charAt(0) + userData.lastName.charAt(0) : 'ST'}
                  </span>
                </div>
              </div>
              
              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">
                      {userData ? `${userData.firstName} ${userData.lastName}` : 'Student User'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {userData ? userData.email : 'student@school.edu'}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link 
                      to="/student-profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      <span>Profile</span>
                    </Link>
                    <Link 
                      to="/student-settings" 
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
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800">Main Menu</h2>
          </div>
          <nav className="py-4">
            <ul>
              <li>
                <Link 
                  to="/student-dashboard" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/student-dashboard') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Home className={`h-5 w-5 mr-3 ${isActive('/student-dashboard') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Dashboard</span>
                </Link>
              </li>
             
              <li>
                <Link 
                  to="/student/mycourse" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/student-courses') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Book className={`h-5 w-5 mr-3 ${isActive('/student-courses') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>My Courses</span>
                </Link>
              </li>    
              <li>
                <Link 
                  to="/student/myteacher" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/student-myteacher') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Book className={`h-5 w-5 mr-3 ${isActive('/student-myteacher') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>My Teachers</span>
                </Link>
              </li>  
              <li>
                <Link 
                  to="/student/assignments" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/student-assignments') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <FileText className={`h-5 w-5 mr-3 ${isActive('/student-assignments') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Assignments</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/student/attendance"
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/student-attendance') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ClipboardList className={`h-5 w-5 mr-3 ${isActive('/student-attendance') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>My Attendance</span>
                </Link>
              </li>  
           
              <li>
                <Link 
                  to="/student/timetable"
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/student-timetable') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Calendar className={`h-5 w-5 mr-3 ${isActive('/student-timetable') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Class Timetable</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/student-grades" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/student-grades') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Award className={`h-5 w-5 mr-3 ${isActive('/student-grades') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>My Grades</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/student-messages" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/student-messages') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className={`h-5 w-5 mr-3 ${isActive('/student-messages') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Messages</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/student/notice" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/student-notice') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <BellRing className={`h-5 w-5 mr-3 ${isActive('/student-notifications') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Notifications & Events</span>
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
                      to="/student-dashboard" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/student-dashboard') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Home className={`h-5 w-5 mr-3 ${isActive('/student-dashboard') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/student-profile" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/student-profile') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <User className={`h-5 w-5 mr-3 ${isActive('/student-profile') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/student-courses" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/student-courses') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Book className={`h-5 w-5 mr-3 ${isActive('/student-courses') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>My Courses</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/student/assignments" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/student-assignments') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <FileText className={`h-5 w-5 mr-3 ${isActive('/student-assignments') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Assignments</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/student-attendance" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/student-attendance') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <ClipboardList className={`h-5 w-5 mr-3 ${isActive('/student-attendance') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>My Attendance</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/student-timetable" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/student-timetable') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Calendar className={`h-5 w-5 mr-3 ${isActive('/student-timetable') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Class Timetable</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/student-grades" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/student-grades') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Award className={`h-5 w-5 mr-3 ${isActive('/student-grades') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>My Grades</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/student-messages" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/student-messages') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <MessageSquare className={`h-5 w-5 mr-3 ${isActive('/student-messages') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Messages</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/student-notifications" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/student-notifications') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <BellRing className={`h-5 w-5 mr-3 ${isActive('/student-notifications') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Notifications</span>
                    </Link>
                  </li>

                  <li>
                    <Link 
                      to="/student-settings" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/student-settings') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Settings className={`h-5 w-5 mr-3 ${isActive('/student-settings') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Settings</span>
                    </Link>
                  </li>
                  <li>
                    <button 
                      onClick={() => {
                        toggleMobileMenu();
                        handleLogout();
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
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;