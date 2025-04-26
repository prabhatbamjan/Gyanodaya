import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
// import { authAxios } from '../../utils/auth';
import Layout from '../../components/layoutes/adminlayout';

function AddEvent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classes, setClasses] = useState([]);
  const [attachments, setAttachments] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'academic',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    organizer: '',
    targetAudience: ['all'],
    classes: [],
    isAllDay: false,
    isRecurring: false,
    recurrencePattern: 'none',
    status: 'upcoming'
  });

  // Mock data for demonstration
  useEffect(() => {
    // In a real app, this would be an API call:
    // const fetchClasses = async () => {
    //   try {
    //     const response = await authAxios.get('/api/classes');
    //     setClasses(response.data.data);
    //   } catch (error) {
    //     console.error('Error fetching classes:', error);
    //   }
    // };
    // fetchClasses();

    // Mock data for demonstration
    setClasses([
      { id: '1', name: 'Class 10-A', grade: 10, section: 'A' },
      { id: '2', name: 'Class 10-B', grade: 10, section: 'B' },
      { id: '3', name: 'Class 9-A', grade: 9, section: 'A' },
      { id: '4', name: 'Class 9-B', grade: 9, section: 'B' },
      { id: '5', name: 'Class 8-A', grade: 8, section: 'A' },
      { id: '6', name: 'Class 8-B', grade: 8, section: 'B' }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAudienceChange = (audience) => {
    setFormData(prev => {
      const updatedAudience = [...prev.targetAudience];
      
      if (audience === 'all') {
        // If 'all' is selected, clear other selections
        return { ...prev, targetAudience: ['all'] };
      } else {
        // If 'all' is already selected and another option is clicked, remove 'all'
        if (updatedAudience.includes('all')) {
          const filteredAudience = updatedAudience.filter(a => a !== 'all');
          filteredAudience.push(audience);
          return { ...prev, targetAudience: filteredAudience };
        }
        
        // Toggle the selected audience
        if (updatedAudience.includes(audience)) {
          return { ...prev, targetAudience: updatedAudience.filter(a => a !== audience) };
        } else {
          updatedAudience.push(audience);
          return { ...prev, targetAudience: updatedAudience };
        }
      }
    });
  };

  const handleClassesChange = (classId) => {
    setFormData(prev => {
      const updatedClasses = [...prev.classes];
      
      if (updatedClasses.includes(classId)) {
        return { ...prev, classes: updatedClasses.filter(c => c !== classId) };
      } else {
        updatedClasses.push(classId);
        return { ...prev, classes: updatedClasses };
      }
    });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // In a real app, you would upload files to your server or cloud storage:
    // const uploadFiles = async () => {
    //   const formData = new FormData();
    //   files.forEach(file => {
    //     formData.append('attachments', file);
    //   });
    //
    //   try {
    //     const response = await authAxios.post('/api/events/upload-attachment', formData, {
    //       headers: {
    //         'Content-Type': 'multipart/form-data'
    //       }
    //     });
    //     setAttachments(prev => [...prev, ...response.data.data]);
    //   } catch (error) {
    //     console.error('Error uploading files:', error);
    //   }
    // };
    // uploadFiles();

    // Mock file upload for demonstration
    const newAttachments = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file),
      fileType: file.type
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.startDate || !formData.endDate) {
        throw new Error('Please fill in all required fields');
      }

      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        throw new Error('End date must be after start date');
      }

      // Prepare data for submission
      const eventData = {
        ...formData,
        attachments
      };

      // In a real app, this would be an API call:
      // const response = await authAxios.post('/api/events', eventData);
      // console.log('Event created:', response.data);

      // Mock successful submission
      console.log('Form submitted:', eventData);
      
      // Simulate API delay
      setTimeout(() => {
        setIsLoading(false);
        navigate('/admin/events');
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create event');
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <Link to="/admin/events" className="flex items-center text-blue-600 mb-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Events
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Add New Event</h1>
          <p className="text-gray-600">Create a new school event with relevant details</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Event Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Event Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Annual Science Fair"
                  required
                />
              </div>

              {/* Event Type */}
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="academic">Academic</option>
                  <option value="sports">Sports</option>
                  <option value="cultural">Cultural</option>
                  <option value="holiday">Holiday</option>
                  <option value="exam">Exam</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Main Auditorium"
                />
              </div>

              {/* Organizer */}
              <div>
                <label htmlFor="organizer" className="block text-sm font-medium text-gray-700 mb-1">
                  Organizer
                </label>
                <input
                  type="text"
                  id="organizer"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Science Department"
                />
              </div>

              {/* Start Date */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Start Time */}
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={formData.isAllDay}
                />
              </div>

              {/* End Time */}
              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="time"
                  id="endTime"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={formData.isAllDay}
                />
              </div>

              {/* All Day Event */}
              <div className="md:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isAllDay"
                    name="isAllDay"
                    checked={formData.isAllDay}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isAllDay" className="ml-2 block text-sm text-gray-700">
                    All Day Event
                  </label>
                </div>
              </div>

              {/* Event Description */}
              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Event Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="4"
                  placeholder="Describe the event..."
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Target Audience & Classes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Target Audience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {['all', 'students', 'teachers', 'parents', 'staff'].map(audience => (
                    <button
                      key={audience}
                      type="button"
                      onClick={() => handleAudienceChange(audience)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        formData.targetAudience.includes(audience)
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {audience.charAt(0).toUpperCase() + audience.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific Classes (if not for all) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specific Classes
                </label>
                <div className="text-xs text-gray-500 mb-2">
                  Select specific classes or leave empty for all classes
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {classes.map(classItem => (
                    <div key={classItem.id} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        id={`class-${classItem.id}`}
                        checked={formData.classes.includes(classItem.id)}
                        onChange={() => handleClassesChange(classItem.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor={`class-${classItem.id}`} className="ml-2 block text-sm text-gray-700">
                        {classItem.name} (Grade {classItem.grade}, Section {classItem.section})
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recurring Event Options */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Recurring Options</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="isRecurring" className="ml-2 block text-sm text-gray-700">
                    This is a recurring event
                  </label>
                </div>

                {formData.isRecurring && (
                  <div>
                    <label htmlFor="recurrencePattern" className="block text-sm font-medium text-gray-700 mb-1">
                      Recurrence Pattern
                    </label>
                    <select
                      id="recurrencePattern"
                      name="recurrencePattern"
                      value={formData.recurrencePattern}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="none">None</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Attachments</h2>
            <div className="border-dashed border-2 border-gray-300 p-4 rounded-md mb-4">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 mb-1">Upload event attachments</p>
                <p className="text-xs text-gray-400 mb-2">PDF, DOC, XLS, JPG, PNG files are supported</p>
                <input
                  type="file"
                  id="fileUpload"
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
                <label
                  htmlFor="fileUpload"
                  className="inline-block bg-blue-50 text-blue-700 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-100"
                >
                  Choose Files
                </label>
              </div>
            </div>

            {attachments.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h3>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between py-1 border-b last:border-b-0">
                      <div className="flex items-center text-sm">
                        <span className="text-gray-800">{file.name}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Event Status */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Event Status</h2>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md ${
                isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-1" />
                  Create Event
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default AddEvent; 