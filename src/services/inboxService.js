import { apiRequest } from './api';

// Inbox Services

export const getMyMessages = async (unreadOnly = false) => {
  const params = unreadOnly ? '?unreadOnly=true' : '';
  return await apiRequest(`/inbox${params}`, { method: 'GET' });
};

export const getMessageById = async (id) => {
  return await apiRequest(`/inbox/${id}`, { method: 'GET' });
};

export const getUnreadCount = async () => {
  return await apiRequest('/inbox/unread/count', { method: 'GET' });
};

export const getInboxPreview = async () => {
  return await apiRequest('/inbox/preview', { method: 'GET' });
};

export const markAsRead = async (id) => {
  return await apiRequest(`/inbox/${id}/read`, { method: 'PUT' });
};

export const markAsUnread = async (id) => {
  return await apiRequest(`/inbox/${id}/unread`, { method: 'PUT' });
};

export const deleteMessage = async (id) => {
  return await apiRequest(`/inbox/${id}`, { method: 'DELETE' });
};

export const getSentMessages = async () => {
  return await apiRequest('/inbox/admin/sent', { method: 'GET' });
};

export const sendMessage = async (messageData) => {
  return await apiRequest('/inbox/send', {
    method: 'POST',
    body: JSON.stringify(messageData),
    headers: { 'Content-Type': 'application/json' }
  });
};

export default {
  getMyMessages,
  getMessageById,
  getUnreadCount,
  getInboxPreview,
  markAsRead,
  markAsUnread,
  deleteMessage,
  getSentMessages,
  sendMessage
};
