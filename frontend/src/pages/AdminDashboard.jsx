import React, { useState, useEffect } from 'react';
import { 
  Users, 
  BookOpen, 
  ClipboardList, 
  Calendar,
  School2,
  CreditCard, 
  Clipboard,
  ArrowRight,
  Bell,
  Plus,
  Edit2,
  Trash2
} from "lucide-react";
import { Link } from 'react-router-dom';
import Layout from '../components/layoutes/adminlayout';
import authAxios from '../utils/auth';
import Loader from '../components/Loader';
import { getRecentActivities } from '../services/activityService';
import { getAllEvents, deleteEvent } from '../services/eventService';
import { formatDistance } from 'date-fns';
import AcademicCalendarModal from '../components/AcademicCalendarModal';

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0, 
    activeClasses: 0,  
    totalTeachers: 0,
    attendance:0,
  
    
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [studentsRes, classesRes, teachersRes, activitiesRes, eventsRes, attendance] = 
          await Promise.all([
            authAxios.get('students/'),
            authAxios.get('classes/'),
            authAxios.get('teachers/'),          
            getRecentActivities(4), // Get 4 most recent activities
            getAllEvents(),// Get all events for the calendar
            authAxios.get('attendance/rate')
          ]);
         
        

        setStats({
          totalStudents: studentsRes.data.data.length,
          activeClasses: classesRes.data.data.length,
          totalTeachers: teachersRes.data.data.length,
          attendance:attendance.data.attendanceRate,
        });

        setActivities(activitiesRes.data);
        setEvents(eventsRes.data);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function to render the appropriate icon for activities
  const renderActivityIcon = (iconName) => {
    switch(iconName) {
      case 'Users':
        return <Users className="h-5 w-5 text-blue-500" />;
      case 'School2':
        return <School2 className="h-5 w-5 text-green-500" />;
      case 'Calendar':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case 'CreditCard':
        return <CreditCard className="h-5 w-5 text-yellow-500" />;
      case 'Bell':
        return <Bell className="h-5 w-5 text-red-500" />;
      default:
        return <Clipboard className="h-5 w-5 text-blue-500" />;
    }
  };

  // Helper function to get the background color for the icon container
  const getIconBackground = (iconName) => {
    switch(iconName) {
      case 'Users':
        return 'bg-blue-100';
      case 'School2':
        return 'bg-green-100';
      case 'Calendar':
        return 'bg-purple-100';
      case 'CreditCard':
        return 'bg-yellow-100';
      case 'Bell':
        return 'bg-red-100';
      default:
        return 'bg-blue-100';
    }
  };

  // Format relative time (e.g., "2 days ago")
  const formatRelativeTime = (timestamp) => {
    return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate duration between two dates
  const calculateDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? '1 day' : `${diffDays + 1} days`;
  };

  // Helper to get color based on status
  const getStatusColor = (status) => {
    switch(status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle opening the modal for a new event
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setModalOpen(true);
  };

  // Handle opening the modal to edit an existing event
  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  // Confirm deletion of an event
  const confirmDelete = (event) => {
    setEventToDelete(event);
    setDeleteConfirmOpen(true);
  };

  // Handle actual deletion
  const handleDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      await deleteEvent(eventToDelete._id);
      // Refresh events list
      const eventsRes = await getAllEvents();
      setEvents(eventsRes.data);
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle event save success (both create and update)
  const handleEventSaveSuccess = async () => {
    // Refresh events list
    const eventsRes = await getAllEvents();
    setEvents(eventsRes.data);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6 text-red-500">{error}</div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Students Card */}
        <Link to="/admin-students">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Total Students</h3>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
            {/* <p className="text-sm text-gray-500 mt-1">12 new this month</p> */}
          </div>
        </div>
        </Link>

        {/* Attendance Rate Card */}
        <Link to="/admin-attendance">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Attendance Rate</h3>
            <ClipboardList className="h-6 w-6 text-blue-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-800">{stats.attendance}%</p>
            
          </div>
        </div>
        </Link>
        {/* Active Classes Card */}
        <Link to="/admin-classes">  
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Active Classes</h3>
            <BookOpen className="h-6 w-6 text-blue-500" />
          </div>
          <div className="mt-2">
            
            <p className="text-3xl font-bold text-gray-800">{stats.activeClasses}</p>
            {/* <p className="text-sm text-gray-500 mt-1">3 added this week</p> */}
          </div>
        </div>
        </Link>

    
        <Link to="/admin-teachers">  
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-gray-500 text-sm">Total Teachers</h3>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div className="mt-2">
            <p className="text-3xl font-bold text-gray-800">
              {stats.totalTeachers}
            </p>
         
          </div>
        </div>
        </Link>
      </div>

      {/* Recent Activity and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          </div>
          <div className="p-6">
            {activities.length > 0 ? (
              <ul className="space-y-4">
                {activities.map(activity => (
                  <li key={activity.id} className="flex items-start">
                    <span className={`${getIconBackground(activity.icon)} rounded-full p-2 mr-3`}>
                      {renderActivityIcon(activity.icon)}
                    </span>
                    <div>
                      <p className="text-gray-800 font-medium">{activity.title}</p>
                      <p className="text-gray-500 text-sm">{activity.description}</p>
                      <p className="text-gray-400 text-xs mt-1">{formatRelativeTime(activity.timestamp)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activities found.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">Quick Stats</h3>
          </div>
          <div className="p-6">
            <ul className="space-y-4">
              <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Total Teachers</span>
                <span className="font-semibold text-gray-800">{stats.totalTeachers}</span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Total Classes</span>
                <span className="font-semibold text-gray-800">{stats.activeClasses}</span>
              </li>
              <li className="flex justify-between items-center pb-2 border-b border-gray-100">
                <span className="text-gray-600">Student-Teacher Ratio</span>
                <span className="font-semibold text-gray-800">
                  {stats.totalTeachers ? (stats.totalStudents / stats.totalTeachers).toFixed(1) : 'N/A'}:1
                </span>
              </li>
          
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Average Attendance</span>
                <span className="font-semibold text-gray-800">{stats.attendance}%</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Academic Calendar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Academic Calendar</h3>
       
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            {events.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>

                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map(event => (
                    <tr key={event._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                        {event.location && (
                          <div className="text-xs text-gray-500 mt-1">Location: {event.location}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(event.startDate)}
                          {new Date(event.startDate).toISOString().split('T')[0] !== 
                           new Date(event.endDate).toISOString().split('T')[0] && 
                           ` - ${formatDate(event.endDate)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{calculateDuration(event.startDate, event.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 capitalize">{event.eventType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                  
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500 text-center py-4">No events found. Add an event to get started.</p>
            )}
          </div>
          
          <div className="mt-4 text-right">
            <Link 
              to="/admin-events"
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
            >
              View Full Calendar <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>

      

 
    </Layout>
  );
}

export default AdminDashboard; 