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
  Award,
  MessageSquare
} from "lucide-react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getUserData } from '../../utils/auth';

function Layout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'New student registration', time: '10 min ago' },
    { id: 2, message: 'Upcoming parent-teacher meeting', time: '1 hour ago' },
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
    if (path === '/admin-dashboard' && location.pathname === '/admin-dashboard') {
      return true;
    }
    if (path !== '/admin-dashboard' && location.pathname.startsWith(path)) {
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
            <span className="text-sm font-bold">Teacher</span>
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
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-800">Main Menu</h2>
          </div>
          <nav className="py-4">
            <ul>
              <li>
                <Link 
                  to="/teacher-dashboard" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/admin-dashboard') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Building2 className={`h-5 w-5 mr-3 ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Dashboard</span>
                </Link>
              </li>
             
              <li>
                <Link 
                  to="/teacher-classes" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/teacher-classes') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <BookOpen className={`h-5 w-5 mr-3 ${isActive('/teacher-classes') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>My Classes</span>
                </Link>
              </li>     
              <li>
                <Link 
                  to="/teacher-attendance" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/teacher-attendance') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ClipboardList className={`h-5 w-5 mr-3 ${isActive('/teacher-attendance') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Attendance</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/teacher-students" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/teacher-students') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Users className={`h-5 w-5 mr-3 ${isActive('/teacher-students') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Students</span>
                </Link>
              </li>     
              <li>
                <Link 
                  to="/teacher-timetable" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/teacher-timetable') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Calendar className={`h-5 w-5 mr-3 ${isActive('/teacher-timetable') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>My Timetable</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/admin-timetable" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/admin-timetable') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Calendar className={`h-5 w-5 mr-3 ${isActive('/admin-timetable') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Time Table</span>
                </Link>
              </li>  
              <li>
                <Link 
                  to="/assignments" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/assignments') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Calendar className={`h-5 w-5 mr-3 ${isActive('/assignments') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Assignments</span>
                </Link>
              </li>        
             
              <li>
                <Link 
                  to="/teacher-results" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/teacher-results') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Award className={`h-5 w-5 mr-3 ${isActive('/teacher-results') ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span>Results</span>
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
                  to="/teacher-notifications" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/teacher-notifications') 
                      ? 'bg-blue-50 border-r-4 border-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <BellRing className={`h-5 w-5 mr-3 ${isActive('/teacher-notifications') ? 'text-blue-600' : 'text-gray-500'}`} />
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
                      to="/dashboard" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/dashboard') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Building2 className={`h-5 w-5 mr-3 ${isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin-profile/${userData._id}" 
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
                      to="/teacher-students" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/teacher-students') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Users className={`h-5 w-5 mr-3 ${isActive('/teacher-students') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Students</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/teacher-attendance" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/teacher-attendance') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <ClipboardList className={`h-5 w-5 mr-3 ${isActive('/teacher-attendance') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Attendance</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/teacher-timetable" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/teacher-timetable') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Calendar className={`h-5 w-5 mr-3 ${isActive('/teacher-timetable') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>My Timetable</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin/classes" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin/classes') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <BookOpen className={`h-5 w-5 mr-3 ${isActive('/admin/classes') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Classes</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin/events" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin/events') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Calendar className={`h-5 w-5 mr-3 ${isActive('/admin/events') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Events</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin/orders" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/admin/orders') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Package className={`h-5 w-5 mr-3 ${isActive('/admin/orders') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Orders</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/admin/shop" 
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
                      to="/teacher-notifications" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/teacher-notifications') 
                          ? 'bg-blue-50 border-r-4 border-blue-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <BellRing className={`h-5 w-5 mr-3 ${isActive('/teacher-notifications') ? 'text-blue-600' : 'text-gray-500'}`} />
                      <span>Notifications & Events</span>
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

export default Layout;