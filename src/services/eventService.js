import { apiRequest } from './api';

// Event Services

export const getAllEvents = async (type = null, upcoming = false) => {
  let params = [];
  if (type) params.push(`type=${type}`);
  if (upcoming) params.push('upcoming=true');
  const queryString = params.length > 0 ? `?${params.join('&')}` : '';
  return await apiRequest(`/events${queryString}`, { method: 'GET' });
};

export const getEventById = async (id) => {
  return await apiRequest(`/events/${id}`, { method: 'GET' });
};

export const getUpcomingEvents = async () => {
  return await apiRequest('/events/upcoming/preview', { method: 'GET' });
};

export const getEventsByDateRange = async (startDate, endDate) => {
  return await apiRequest(`/events/range?startDate=${startDate}&endDate=${endDate}`, {
    method: 'GET',
  });
};

export const getCalendarEvents = async (year, month) => {
  return await apiRequest(`/events/calendar?year=${year}&month=${month}`, {
    method: 'GET',
  });
};

export default {
  getAllEvents,
  getEventById,
  getUpcomingEvents,
  getEventsByDateRange,
  getCalendarEvents,
};
