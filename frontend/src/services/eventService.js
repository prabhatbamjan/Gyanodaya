import authAxios from '../utils/auth';

// Get all events
export const getAllEvents = async () => {
  try {
    const response = await authAxios.get('/events');
    return response.data;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Get event by ID
export const getEventById = async (id) => {
  try {
    const response = await authAxios.get(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
};

// Create new event
export const createEvent = async (eventData) => {
  try {
    const response = await authAxios.post('/events', eventData);
    return response.data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update event
export const updateEvent = async (id, eventData) => {
  try {
    const response = await authAxios.put(`/events/${id}`, eventData);
    return response.data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete event
export const deleteEvent = async (id) => {
  try {
    const response = await authAxios.delete(`/events/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};

// Get upcoming events (next 30 days)
export const getUpcomingEvents = async () => {
  try {
    const allEvents = await getAllEvents();
    const now = new Date();
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    
    return {
      ...allEvents,
      data: allEvents.data.filter(event => {
        const eventStart = new Date(event.startDate);
        return eventStart >= now && eventStart <= thirtyDaysFromNow;
      })
    };
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
};

// Get events by status
export const getEventsByStatus = async (status) => {
  try {
    const allEvents = await getAllEvents();
    
    return {
      ...allEvents,
      data: allEvents.data.filter(event => event.status === status)
    };
  } catch (error) {
    console.error(`Error fetching ${status} events:`, error);
    throw error;
  }
}; 