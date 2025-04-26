import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, Edit2, Trash2, Calendar, Clock, MapPin, 
  Users, Tag, User, Repeat, Info
} from 'lucide-react';
import Layout from '../../components/layoutes/adminlayout';
// import authAxios from '../../utils/auth';


const eventTypeColors = {
  Holiday: { bg: 'bg-red-100', text: 'text-red-800', icon: 'text-red-500' },
  Exam: { bg: 'bg-purple-100', text: 'text-purple-800', icon: 'text-purple-500' },
  Assignment: { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'text-blue-500' },
  Event: { bg: 'bg-green-100', text: 'text-green-800', icon: 'text-green-500' },
  Meeting: { bg: 'bg-amber-100', text: 'text-amber-800', icon: 'text-amber-500' },
  Term: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: 'text-indigo-500' },
  Other: { bg: 'bg-slate-100', text: 'text-slate-800', icon: 'text-slate-500' }
};

const formatDate = (dateString, includeTime = true) => {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return new Date(dateString).toLocaleString('en-US', options);
};

const CalendarEventDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { auth } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/api/academic-calendar/${id}`);
      setEvent(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching event:', err);
      setError('Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await authAxios.delete(`/api/academic-calendar/${id}`);
      navigate('/academics/calendar');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError('Failed to delete event');
      setIsDeleting(false);
      setDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <button
            onClick={() => navigate('/academics/calendar')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back to Calendar
          </button>
        </div>
      </Layout>
    );
  }

  if (!event) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            Event not found
          </div>
          <button
            onClick={() => navigate('/academics/calendar')}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back to Calendar
          </button>
        </div>
      </Layout>
    );
  }

  const typeColor = eventTypeColors[event.type] || eventTypeColors.Other;
  const canEdit = auth.role === 'admin' || (auth.role === 'teacher' && event.createdBy?._id === auth.id);
  
  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <button
            onClick={() => navigate('/academics/calendar')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft size={20} className="mr-1" />
            Back to Calendar
          </button>
          
          {canEdit && (
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/academics/calendar/edit/${id}`)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                <Edit2 size={16} className="mr-2" />
                Edit
              </button>
              <button
                onClick={() => setDeleteModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div 
            className="h-16 w-full"
            style={{ backgroundColor: event.color }}
          ></div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
                <div className="flex items-center">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeColor.bg} ${typeColor.text}`}>
                    <Tag size={14} className={`inline mr-1 ${typeColor.icon}`} />
                    {event.type}
                  </span>
                  <span className="ml-4 text-gray-500 text-sm">
                    <User size={14} className="inline mr-1" />
                    Created by {event.createdBy?.firstName} {event.createdBy?.lastName}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <Info size={18} className="mr-2 text-gray-500" />
                    Details
                  </h2>
                  {event.description ? (
                    <p className="text-gray-700 whitespace-pre-line">{event.description}</p>
                  ) : (
                    <p className="text-gray-500 italic">No description provided</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <Calendar size={18} className="mr-2 text-gray-500" />
                    Date & Time
                  </h2>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <Clock size={16} className="mr-2 mt-1 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {formatDate(event.startDate, !event.allDay)}
                        </p>
                        {!event.startDate.split('T')[0] === event.endDate.split('T')[0] && (
                          <p className="font-medium">
                            to {formatDate(event.endDate, !event.allDay)}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {event.allDay ? 'All day event' : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {event.location && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                      <MapPin size={18} className="mr-2 text-gray-500" />
                      Location
                    </h2>
                    <p className="text-gray-700">{event.location}</p>
                  </div>
                )}
                
                {event.isRecurring && (
                  <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2 flex items-center">
                      <Repeat size={18} className="mr-2 text-gray-500" />
                      Recurrence
                    </h2>
                    <div className="text-gray-700">
                      <p>
                        Repeats every {event.recurrencePattern.interval} {' '}
                        {event.recurrencePattern.frequency.toLowerCase()}
                        {event.recurrencePattern.interval > 1 ? 's' : ''}
                      </p>
                      
                      {event.recurrencePattern.frequency === 'Weekly' && event.recurrencePattern.daysOfWeek?.length > 0 && (
                        <p className="mt-1">
                          On: {event.recurrencePattern.daysOfWeek.join(', ')}
                        </p>
                      )}
                      
                      {event.recurrencePattern.endDate && (
                        <p className="mt-1">
                          Until: {new Date(event.recurrencePattern.endDate).toLocaleDateString()}
                        </p>
                      )}
                      
                      {event.recurrencePattern.occurrences && (
                        <p className="mt-1">
                          For {event.recurrencePattern.occurrences} occurrence(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <Users size={18} className="mr-2 text-gray-500" />
                    Classes
                  </h2>
                  
                  {event.classes && event.classes.length > 0 ? (
                    <div className="space-y-2">
                      {event.classes.map(cls => (
                        <div 
                          key={cls._id} 
                          className="flex items-center bg-gray-100 px-3 py-2 rounded"
                        >
                          <span className="text-gray-700">
                            {cls.name} - {cls.grade} {cls.section}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-700">
                      <p>This is a school-wide event</p>
                    </div>
                  )}
                </div>
                
                <div>
                  <h2 className="text-lg font-semibold mb-2 flex items-center">
                    <Calendar size={18} className="mr-2 text-gray-500" />
                    Academic Year
                  </h2>
                  <p className="text-gray-700">{event.academicYear}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Event</h2>
            <p className="mb-4 text-gray-700">
              Are you sure you want to delete "{event.title}"?
              This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteModal(false)}
                className="px-4 py-2 border rounded-md hover:bg-gray-50"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                ) : (
                  <Trash2 size={16} className="mr-2" />
                )}
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default CalendarEventDetail; 