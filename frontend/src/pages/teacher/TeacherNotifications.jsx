import React, { useState, useEffect } from 'react';
import {
  Bell,
  Calendar,
  Search,
  CheckCircle,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  Bookmark,
  CalendarClock
} from 'lucide-react';
import Layout from '../../components/layoutes/teacherlayout';
import authAxios from '../../utils/auth';
import { getUserData } from '../../utils/auth';
import Loader from '../../components/Loader';

const TeacherNotifications = () => {
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [expandedNotification, setExpandedNotification] = useState(null);
  const [expandedEvent, setExpandedEvent] = useState(null);
  const userData = getUserData();

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    } else {
      fetchEvents();
    }
  }, [activeTab]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await authAxios.get('/notifications/my');
      
      if (response.data.success) {
        setNotifications(response.data.data);
        setUnreadCount(response.data.unread);
      } else {
        setError('Failed to load notifications');
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      // Use the class IDs assigned to the teacher to find relevant events
      const teacherResponse = await authAxios.get(`/teachers/${userData.id}`);
      if (!teacherResponse.data.success) {
        throw new Error('Failed to get teacher data');
      }
      
      const classIds = teacherResponse.data.data.class || [];
      
      // If teacher has classes, fetch events for those classes
      if (classIds.length > 0) {
        const eventsPromises = classIds.map(classId => 
          authAxios.get(`/events/class/${classId}`)
        );
        
        const eventsResponses = await Promise.all(eventsPromises);
        
        // Combine events from all classes and remove duplicates
        const allEvents = [];
        const eventIds = new Set();
        
        eventsResponses.forEach(response => {
          if (response.data.success) {
            response.data.data.forEach(event => {
              if (!eventIds.has(event._id)) {
                eventIds.add(event._id);
                allEvents.push(event);
              }
            });
          }
        });
        
        // Sort events by start date (newest first)
        allEvents.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        setEvents(allEvents);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await authAxios.post(`/notifications/${notificationId}/mark-read`);
      
      if (response.data.success) {
        // Update the notification's read status in the local state
        setNotifications(notifications.map(notification => 
          notification._id === notificationId 
            ? { ...notification, isRead: true } 
            : notification
        ));
        
        // Update unread count
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleToggleNotification = (id) => {
    if (expandedNotification === id) {
      setExpandedNotification(null);
    } else {
      setExpandedNotification(id);
      const notification = notifications.find(n => n._id === id);
      if (notification && !notification.isRead) {
        markAsRead(id);
      }
    }
  };

  const handleToggleEvent = (id) => {
    setExpandedEvent(expandedEvent === id ? null : id);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'announcement':
        return <Bookmark className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const filteredNotifications = notifications.filter(
    notification => 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvents = events.filter(
    event => 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'academic':
        return 'bg-blue-100 text-blue-800';
      case 'sports':
        return 'bg-green-100 text-green-800';
      case 'cultural':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {activeTab === 'notifications' ? 'My Notifications' : 'Upcoming Events'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {activeTab === 'notifications' 
              ? 'Stay updated with school-wide announcements and messages' 
              : 'View and track upcoming school events and activities'}
          </p>
        </div>

        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-2 flex items-center rounded-md ${
              activeTab === 'notifications'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Bell className="h-5 w-5 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 flex items-center rounded-md ${
              activeTab === 'events'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="h-5 w-5 mr-2" />
            Events
          </button>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        ) : activeTab === 'notifications' ? (
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                No notifications found
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`bg-white rounded-lg shadow overflow-hidden ${
                    !notification.isRead ? 'border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div
                    className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                    onClick={() => handleToggleNotification(notification._id)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 pt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div>
                        <h3 className={`text-lg font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(notification.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div>
                      {expandedNotification === notification._id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {expandedNotification === notification._id && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                      <p className="text-gray-700 whitespace-pre-line">
                        {notification.message}
                      </p>
                      {notification.link && (
                        <a
                          href={notification.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-block text-blue-600 hover:underline"
                        >
                          View more details
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                No upcoming events found
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div
                    className="px-6 py-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
                    onClick={() => handleToggleEvent(event._id)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 pt-1">
                        <CalendarClock className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium text-gray-900">
                            {event.title}
                          </h3>
                          <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                            {event.eventType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div>
                      {expandedEvent === event._id ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {expandedEvent === event._id && (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                      <p className="text-gray-700 mb-4 whitespace-pre-line">
                        {event.description}
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium text-gray-900">Date & Time</h4>
                          <p className="text-gray-700">
                            Start: {formatDate(event.startDate)}
                          </p>
                          <p className="text-gray-700">
                            End: {formatDate(event.endDate)}
                          </p>
                        </div>
                        
                        {event.location && (
                          <div>
                            <h4 className="font-medium text-gray-900">Location</h4>
                            <p className="text-gray-700">{event.location}</p>
                          </div>
                        )}
                      </div>
                      
                      {event.classes && event.classes.length > 0 && (
                        <div className="mt-4">
                          <h4 className="font-medium text-gray-900 mb-2">Participating Classes</h4>
                          <div className="flex flex-wrap gap-2">
                            {event.classes.map((cls) => (
                              <span
                                key={cls._id}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                              >
                                {cls.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TeacherNotifications; 