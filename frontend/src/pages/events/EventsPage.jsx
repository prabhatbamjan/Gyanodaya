import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, Filter, Edit, Trash2 } from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
import Loader from '../../components/Loader';
import authAxios from '../../utils/auth';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, classesRes] = await Promise.all([
        authAxios.get('events/'),
        authAxios.get('classes/')
      ]);

      const allOk = [eventsRes, classesRes].every(
        res => res.status === 200
      );
      
      if (!allOk) {
        throw new Error('One or more API responses were not OK');
      }

      setEvents(eventsRes.data.data);
      setClasses(classesRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        const response = await authAxios.delete(`events/${id}`);
        if (response.data.success) {
          setEvents(events.filter(event => event._id !== id));
        } else {
          setError('Failed to delete event');
        }
      } catch (err) {
        console.error('Error deleting event:', err);
        setError('Failed to delete event');
      }
    }
  };

  // Filter events based on search term and filters
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = !selectedClass || event.classes.some(c => c._id === selectedClass);
    const matchesType = !selectedType || event.eventType === selectedType;
    const matchesStatus = !selectedStatus || event.status === selectedStatus;
    
    return matchesSearch && matchesClass && matchesType && matchesStatus;
  });

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
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

  return (
    <Layout>
      <div className="w-full p-6 bg-gray-50">
        <header className="mb-6 bg-white p-5 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-xl font-semibold text-gray-800">Events Management</h1>
              <p className="text-sm text-gray-500">Manage all school events and activities</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-full md:w-auto">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search events..."
                  className="w-full md:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Link
                to="/admin-events/add"
                className="w-full md:w-auto flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add Event
              </Link>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls._id} value={cls._id}>
                    {cls.name} - {cls.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="">All Types</option>
                <option value="academic">Academic</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <select
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="w-full bg-white rounded-lg shadow-sm p-6 flex justify-center">
            <Loader size="large" text="Loading events..." />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="w-full bg-white rounded-lg shadow-sm p-6 text-center text-gray-600">
            No events found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.eventType)}`}>
                      {event.eventType}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="truncate">
                      {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {event.location && (
                    <p className="text-sm text-gray-500 mb-3 truncate">
                      Location: {event.location}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.classes && event.classes.slice(0, 3).map((cls) => (
                      <span
                        key={cls._id}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                      >
                        {cls.name} - {cls.section}
                      </span>
                    ))}
                    {event.classes && event.classes.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                        +{event.classes.length - 3} more
                      </span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(event.status)}`}>
                      {event.status}
                    </span>
                    
                    <div className="flex space-x-2">
                      <Link
                        to={`/events/edit/${event._id}`}
                        className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-white hover:bg-blue-600 rounded-md border border-blue-200 hover:border-transparent transition-colors"
                        title="Edit event"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-white hover:bg-red-600 rounded-md border border-red-200 hover:border-transparent transition-colors"
                        title="Delete event"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventsPage; 