import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash, Eye, Calendar, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import Layout from '../../components/layoutes/adminlayout';
// import authAxios  from '../../utils/auth';

function Events() {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Event type options
  const eventTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'academic', label: 'Academic' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'exam', label: 'Exam' },
    { value: 'other', label: 'Other' }
  ];

  // Event status options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'ongoing', label: 'Ongoing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Fetch events
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be an API call:
        // const response = await authAxios.get('/api/events', {
        //   params: {
        //     page: currentPage,
        //     limit: 10,
        //     search: searchQuery,
        //     eventType: selectedType !== 'all' ? selectedType : undefined,
        //     status: selectedStatus !== 'all' ? selectedStatus : undefined,
        //     startDate: dateRange.from || undefined,
        //     endDate: dateRange.to || undefined
        //   }
        // });
        // setEvents(response.data.data);
        // setTotalPages(response.data.totalPages);
        // setTotalEvents(response.data.total);

        // Mock data for demonstration
        setTimeout(() => {
          const mockEvents = [
            {
              id: '1',
              title: 'Annual Science Fair',
              eventType: 'academic',
              startDate: '2023-11-15',
              endDate: '2023-11-17',
              location: 'Main Auditorium',
              status: 'upcoming',
              isAcademicCalendar: true
            },
            {
              id: '2',
              title: 'Sports Day',
              eventType: 'sports',
              startDate: '2023-11-25',
              endDate: '2023-11-25',
              location: 'School Grounds',
              status: 'upcoming',
              isAcademicCalendar: true
            },
            {
              id: '3',
              title: 'Parent-Teacher Meeting',
              eventType: 'academic',
              startDate: '2023-11-10',
              endDate: '2023-11-10',
              location: 'Classrooms',
              status: 'completed',
              isAcademicCalendar: false
            },
            {
              id: '4',
              title: 'Winter Break',
              eventType: 'holiday',
              startDate: '2023-12-20',
              endDate: '2024-01-05',
              location: 'School',
              status: 'upcoming',
              isAcademicCalendar: true
            },
            {
              id: '5',
              title: 'End of Year Exams',
              eventType: 'exam',
              startDate: '2023-12-10',
              endDate: '2023-12-18',
              location: 'Examination Halls',
              status: 'upcoming',
              isAcademicCalendar: true
            },
            {
              id: '6',
              title: 'Annual Cultural Festival',
              eventType: 'cultural',
              startDate: '2023-11-30',
              endDate: '2023-12-02',
              location: 'School Auditorium',
              status: 'upcoming',
              isAcademicCalendar: false
            },
            {
              id: '7',
              title: 'Career Guidance Seminar',
              eventType: 'academic',
              startDate: '2023-11-05',
              endDate: '2023-11-05',
              location: 'Conference Room',
              status: 'completed',
              isAcademicCalendar: false
            }
          ];

          // Filter events based on search, type, status and date range
          let filteredEvents = [...mockEvents];
          
          if (searchQuery) {
            filteredEvents = filteredEvents.filter(event => 
              event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              event.location.toLowerCase().includes(searchQuery.toLowerCase())
            );
          }
          
          if (selectedType !== 'all') {
            filteredEvents = filteredEvents.filter(event => event.eventType === selectedType);
          }
          
          if (selectedStatus !== 'all') {
            filteredEvents = filteredEvents.filter(event => event.status === selectedStatus);
          }
          
          if (dateRange.from) {
            filteredEvents = filteredEvents.filter(event => event.startDate >= dateRange.from);
          }
          
          if (dateRange.to) {
            filteredEvents = filteredEvents.filter(event => event.endDate <= dateRange.to);
          }

          setEvents(filteredEvents);
          setTotalEvents(filteredEvents.length);
          setTotalPages(Math.ceil(filteredEvents.length / 10));
          setIsLoading(false);
        }, 800);
      } catch (err) {
        setError('Failed to fetch events');
        console.error(err);
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [currentPage, searchQuery, selectedType, selectedStatus, dateRange]);

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle type filter change
  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter change
  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  // Handle date range changes
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setDateRange({ from: '', to: '' });
    setCurrentPage(1);
  };

  // Handle delete event
  const handleDelete = (id) => {
    // In a real app, this would be an API call:
    // await authAxios.delete(`/api/events/${id}`);
    
    // For demo, just filter out the deleted event
    setEvents(events.filter(event => event.id !== id));
    setTotalEvents(prev => prev - 1);
  };

  // Get status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get type badge styling
  const getTypeBadge = (type) => {
    switch (type) {
      case 'academic':
        return 'bg-purple-100 text-purple-800';
      case 'sports':
        return 'bg-green-100 text-green-800';
      case 'cultural':
        return 'bg-pink-100 text-pink-800';
      case 'holiday':
        return 'bg-red-100 text-red-800';
      case 'exam':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Events</h1>
            <p className="text-gray-600">Manage and organize school events</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-2">
            <Link
              to="/admin/academic-calendar"
              className="flex items-center px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Calendar View
            </Link>
            <Link
              to="/admin/events/add"
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Event
            </Link>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Search & Filters</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="md:col-span-2">
                <label htmlFor="search" className="sr-only">Search Events</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search events by title or location"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">Event Type</label>
                <select
                  id="eventType"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedType}
                  onChange={handleTypeChange}
                >
                  {eventTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  id="status"
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  value={selectedStatus}
                  onChange={handleStatusChange}
                >
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  id="dateFrom"
                  name="from"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateRange.from}
                  onChange={handleDateChange}
                />
              </div>
              <div>
                <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  id="dateTo"
                  name="to"
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={dateRange.to}
                  onChange={handleDateChange}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  className="w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Events Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Events {totalEvents > 0 && `(${totalEvents})`}
            </h2>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-700 border-b border-gray-200">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-500 mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || selectedType !== 'all' || selectedStatus !== 'all' || dateRange.from || dateRange.to
                  ? 'Try adjusting your filters to see more results'
                  : 'Get started by creating a new event'}
              </p>
              <Link
                to="/admin/events/add"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add New Event
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Calendar
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadge(event.eventType)}`}>
                          {event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(event.startDate)}
                          {event.startDate !== event.endDate && ` - ${formatDate(event.endDate)}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{event.location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(event.status)}`}>
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {event.isAcademicCalendar ? 'Yes' : 'No'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/events/${event.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            to={`/admin/events/${event.id}/edit`}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && events.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{events.length}</span> of{' '}
                    <span className="font-medium">{totalEvents}</span> events
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Events; 