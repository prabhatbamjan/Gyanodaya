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
  User,
  Settings,
  Bell,
  MessageSquare,
  FileText,
  Users,
  TrendingUp,
  DollarSign,
  HelpCircle,
  BookMarked,
  School,
  ShoppingBag
} from "lucide-react";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getUserData } from '../../utils/auth';

function ParentLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Your child has a new assignment in Mathematics', time: '10 min ago' },
    { id: 2, message: 'Upcoming parent-teacher meeting', time: '1 hour ago' },
    { id: 3, message: 'School event tomorrow', time: '2 hours ago' },
    { id: 4, message: 'New items available in the school shop', time: '3 hours ago' },
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
    if (path === '/parent-dashboard' && location.pathname === '/parent-dashboard') {
      return true;
    }
    if (path !== '/parent-dashboard' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navigation */}
      <header className="bg-green-600 text-white shadow-md">
        <div className="container mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold">Gyanodaya</span>
            <span className="text-sm font-bold">Parent</span>
          </div>
          
          <div className="flex items-center">
            {/* Notifications */}
            <div className="relative mr-4" ref={notificationsRef}>
              <button 
                className="text-white p-2 rounded-full hover:bg-green-500 relative"
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
                    <Link to="/parent-notifications" className="text-sm text-green-600 hover:text-green-800" onClick={() => setIsNotificationsOpen(false)}>
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
                  {userData ? `${userData.firstName} ${userData.lastName}` : 'Parent User'}
                </span>
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-white font-medium">
                    {userData ? userData.firstName.charAt(0) + userData.lastName.charAt(0) : 'PT'}
                  </span>
                </div>
              </div>
              
              {/* User dropdown menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-800">
                      {userData ? `${userData.firstName} ${userData.lastName}` : 'Parent User'}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {userData ? userData.email : 'parent@example.com'}
                    </p>
                  </div>
                  <div className="py-1">
                    <Link 
                      to="/parent-profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4 mr-3 text-gray-500" />
                      <span>Profile</span>
                    </Link>
                    <Link 
                      to="/parent-settings" 
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
            <h2 className="text-xl font-semibold text-gray-800">Parent Portal</h2>
          </div>
          <nav className="py-4">
            <ul>
              <li>
                <Link 
                  to="/parent-dashboard" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-dashboard') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Home className={`h-5 w-5 mr-3 ${isActive('/parent-dashboard') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>Dashboard</span>
                </Link>
              </li>
             
              <li>
                <Link 
                  to="/parent-children" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-children') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Users className={`h-5 w-5 mr-3 ${isActive('/parent-children') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>My Children</span>
                </Link>
              </li>     
              <li>
                <Link 
                  to="/parent-academic-progress" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-academic-progress') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <TrendingUp className={`h-5 w-5 mr-3 ${isActive('/parent-academic-progress') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>Academic Progress</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/parent-attendance" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-attendance') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ClipboardList className={`h-5 w-5 mr-3 ${isActive('/parent-attendance') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>Attendance Records</span>
                </Link>
              </li>     
              <li>
                <Link 
                  to="/parent-calendar" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-calendar') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Calendar className={`h-5 w-5 mr-3 ${isActive('/parent-calendar') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>School Calendar</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/parent-assignments" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-assignments') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <FileText className={`h-5 w-5 mr-3 ${isActive('/parent-assignments') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>Assignments & Homework</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/parent-grades" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-grades') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <BookMarked className={`h-5 w-5 mr-3 ${isActive('/parent-grades') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>Grades & Reports</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/parent-messages" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-messages') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <MessageSquare className={`h-5 w-5 mr-3 ${isActive('/parent-messages') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>Teacher Communications</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/parent-payments" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-payments') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <DollarSign className={`h-5 w-5 mr-3 ${isActive('/parent-payments') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>Fees & Payments</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/parent-school-info" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-school-info') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <School className={`h-5 w-5 mr-3 ${isActive('/parent-school-info') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>School Information</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/parent-shop" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-shop') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ShoppingBag className={`h-5 w-5 mr-3 ${isActive('/parent-shop') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>School Shop</span>
                </Link>
              </li>
              <li>
                <Link 
                  to="/parent-help" 
                  className={`flex items-center px-6 py-3 text-gray-700 ${
                    isActive('/parent-help') 
                      ? 'bg-green-50 border-r-4 border-green-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <HelpCircle className={`h-5 w-5 mr-3 ${isActive('/parent-help') ? 'text-green-600' : 'text-gray-500'}`} />
                  <span>Help & Support</span>
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
                      to="/parent-dashboard" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-dashboard') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Home className={`h-5 w-5 mr-3 ${isActive('/parent-dashboard') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>Dashboard</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-profile" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-profile') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <User className={`h-5 w-5 mr-3 ${isActive('/parent-profile') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>Profile</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-children" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-children') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Users className={`h-5 w-5 mr-3 ${isActive('/parent-children') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>My Children</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-academic-progress" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-academic-progress') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <TrendingUp className={`h-5 w-5 mr-3 ${isActive('/parent-academic-progress') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>Academic Progress</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-attendance" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-attendance') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <ClipboardList className={`h-5 w-5 mr-3 ${isActive('/parent-attendance') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>Attendance Records</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-calendar" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-calendar') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Calendar className={`h-5 w-5 mr-3 ${isActive('/parent-calendar') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>School Calendar</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-assignments" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-assignments') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <FileText className={`h-5 w-5 mr-3 ${isActive('/parent-assignments') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>Assignments</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-grades" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-grades') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <BookMarked className={`h-5 w-5 mr-3 ${isActive('/parent-grades') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>Grades & Reports</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-messages" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-messages') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <MessageSquare className={`h-5 w-5 mr-3 ${isActive('/parent-messages') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>Teacher Communications</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-payments" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-payments') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <DollarSign className={`h-5 w-5 mr-3 ${isActive('/parent-payments') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>Fees & Payments</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-school-info" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-school-info') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <School className={`h-5 w-5 mr-3 ${isActive('/parent-school-info') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>School Information</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-shop" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-shop') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <ShoppingBag className={`h-5 w-5 mr-3 ${isActive('/parent-shop') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>School Shop</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-help" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-help') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <HelpCircle className={`h-5 w-5 mr-3 ${isActive('/parent-help') ? 'text-green-600' : 'text-gray-500'}`} />
                      <span>Help & Support</span>
                    </Link>
                  </li>
                  <li>
                    <Link 
                      to="/parent-settings" 
                      className={`flex items-center px-6 py-3 text-gray-700 ${
                        isActive('/parent-settings') 
                          ? 'bg-green-50 border-r-4 border-green-500' 
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <Settings className={`h-5 w-5 mr-3 ${isActive('/parent-settings') ? 'text-green-600' : 'text-gray-500'}`} />
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

export default ParentLayout;