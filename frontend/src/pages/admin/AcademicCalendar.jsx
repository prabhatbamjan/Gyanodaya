import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Plus, 
  Filter, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import { getAllEvents, deleteEvent, getEventsByStatus } from '../../services/eventService';
import AcademicCalendarModal from '../../components/AcademicCalendarModal';
import Loader from '../../components/Loader';

const AcademicCalendar = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    search: '',
    dateRange: 'all'
  });

  // Fetch events on initial load
  useEffect(() => {
    fetchEvents();
  }, []);

  // Apply filters when events or filters change
  useEffect(() => {
    applyFilters();
  }, [events, filters]);

  // Fetch all events from the API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await getAllEvents();
      setEvents(response.data);
      setFilteredEvents(response.data);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError('Failed to fetch events: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Apply selected filters to the events list
  const applyFilters = () => {
    let filtered = [...events];

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(event => event.status === filters.status);
    }

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(event => event.eventType === filters.type);
    }

    // Filter by search term
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(
        event => 
          event.title.toLowerCase().includes(searchTerm) || 
          event.description.toLowerCase().includes(searchTerm) ||
          (event.location && event.location.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by date range
    const now = new Date();
    if (filters.dateRange === 'upcoming') {
      filtered = filtered.filter(event => new Date(event.startDate) >= now);
    } else if (filters.dateRange === 'past') {
      filtered = filtered.filter(event => new Date(event.endDate) < now);
    } else if (filters.dateRange === 'month') {
      const nextMonth = new Date(now);
      nextMonth.setMonth(now.getMonth() + 1);
      filtered = filtered.filter(
        event => new Date(event.startDate) >= now && new Date(event.startDate) <= nextMonth
      );
    }

    // Sort by start date (ascending)
    filtered.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

    setFilteredEvents(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle search input
  const handleSearch = (e) => {
    handleFilterChange('search', e.target.value);
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      status: 'all',
      type: 'all',
      search: '',
      dateRange: 'all'
    });
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
      fetchEvents();
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
    fetchEvents();
  };

  // Export events as CSV
  const exportToCSV = () => {
    const headers = ['Title', 'Description', 'Start Date', 'End Date', 'Duration', 'Location', 'Type', 'Status'];
    const data = filteredEvents.map(event => [
      event.title,
      event.description,
      formatDate(event.startDate),
      formatDate(event.endDate),
      calculateDuration(event.startDate, event.endDate),
      event.location || '',
      event.eventType,
      event.status
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'academic_calendar.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && events.length === 0) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-full">
          <Loader />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <Calendar className="h-6 w-6 text-blue-500 mr-2" />
            <h1 className="text-xl font-semibold text-gray-800">Academic Calendar</h1>
          </div>
          <button 
            onClick={handleAddEvent}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Event
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <label htmlFor="status-filter" className="mr-2 text-sm font-medium text-gray-700">Status:</label>
                <select
                  id="status-filter"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label htmlFor="type-filter" className="mr-2 text-sm font-medium text-gray-700">Type:</label>
                <select
                  id="type-filter"
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="academic">Academic</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label htmlFor="date-filter" className="mr-2 text-sm font-medium text-gray-700">Date:</label>
                <select
                  id="date-filter"
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="all">All Dates</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                  <option value="month">Next 30 Days</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={handleSearch}
                  className="pl-10 py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              
              <button
                onClick={resetFilters}
                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                title="Reset filters"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              
              <button
                onClick={exportToCSV}
                className="inline-flex items-center p-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                title="Export to CSV"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-500 rounded-md">
              {error}
            </div>
          )}
          
          <div className="overflow-x-auto">
            {filteredEvents.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEvents.map(event => (
                    <tr key={event._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500">
                          {event.description.length > 50 
                            ? `${event.description.substring(0, 50)}...` 
                            : event.description}
                        </div>
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
                        <div className="text-sm text-gray-500">{event.location || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 capitalize">{event.eventType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                          onClick={() => handleEditEvent(event)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Edit"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(event)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-lg">No events found.</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters or add a new event.</p>
              </div>
            )}
          </div>
          
          {/* Event count */}
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            {filters.status !== 'all' || filters.type !== 'all' || filters.search || filters.dateRange !== 'all' 
              ? ' (filtered)' 
              : ''}
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <AcademicCalendarModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        onSuccess={handleEventSaveSuccess}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setDeleteConfirmOpen(false)} />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <Trash2 className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Event</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this event? This action cannot be undone.
                      </p>
                      {eventToDelete && (
                        <div className="mt-2 p-3 bg-gray-50 rounded-md">
                          <p className="text-sm font-medium text-gray-900">{eventToDelete.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(eventToDelete.startDate)}
                            {new Date(eventToDelete.startDate).toISOString().split('T')[0] !== 
                             new Date(eventToDelete.endDate).toISOString().split('T')[0] && 
                             ` - ${formatDate(eventToDelete.endDate)}`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteEvent}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setDeleteConfirmOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AcademicCalendar; 