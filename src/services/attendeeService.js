import { apiRequest } from './api';

/**
 * Attendee Service
 * Handles all API calls related to drive attendees
 */

// ==========================================
// Admin Attendee Management Services
// ==========================================

/**
 * Get all attendees for a specific drive
 * @param {number} driveId - Drive ID
 * @returns {Promise} - API response with attendee list
 */
export const getDriveAttendees = async (driveId) => {
  return await apiRequest(`/drives/${driveId}/attendees`, { method: 'GET' });
};

/**
 * Add students as attendees to a drive
 * Automatically generates unique attendance keys for each student
 *
 * @param {number} driveId - Drive ID
 * @param {Array<number>} userIds - Array of user IDs to mark as attendees
 * @param {string} notes - Optional notes (e.g., "Group B - 2:00 PM slot")
 * @returns {Promise} - API response with created attendees and their keys
 *
 * @example
 * const response = await addDriveAttendees(5, [1, 2, 3], "Morning batch");
 * // Returns attendees with generated keys: BlueTiger, RedEagle, etc.
 */
export const addDriveAttendees = async (driveId, userIds, notes = '') => {
  return await apiRequest(`/drives/${driveId}/attendees`, {
    method: 'POST',
    body: JSON.stringify({ userIds, notes }),
  });
};

/**
 * Remove a student's attendance from a drive
 *
 * @param {number} driveId - Drive ID
 * @param {number} userId - User ID to remove from attendees
 * @returns {Promise} - API response
 */
export const removeDriveAttendee = async (driveId, userId) => {
  return await apiRequest(`/drives/${driveId}/attendees/${userId}`, {
    method: 'DELETE',
  });
};

/**
 * Get list of students who haven't attended this drive yet
 * Useful for admin to search and select which students to mark as attended
 *
 * @param {number} driveId - Drive ID
 * @param {Object} filters - Optional filters
 * @param {string} filters.search - Search by name, USN, or email
 * @param {string} filters.filter - Filter type: 'all', 'applied', 'not_applied'
 * @returns {Promise} - API response with non-attendee students
 *
 * @example
 * const response = await getNonAttendees(5, {
 *   search: "Rajesh",
 *   filter: "applied"
 * });
 */
export const getNonAttendees = async (driveId, filters = {}) => {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.filter) params.append('filter', filters.filter);

  const queryString = params.toString();
  const url = `/drives/${driveId}/non-attendees${queryString ? '?' + queryString : ''}`;

  return await apiRequest(url, { method: 'GET' });
};

/**
 * Export attendee list as CSV or JSON
 * @param {number} driveId - Drive ID
 * @param {string} format - Export format: 'csv' or 'json'
 * @returns {Promise} - Exported data
 */
export const exportAttendees = async (driveId, format = 'csv') => {
  return await apiRequest(`/drives/${driveId}/attendees/export?format=${format}`, {
    method: 'GET',
  });
};

/**
 * Send message to all attendees of a drive with exam/meeting link
 * Only attended students receive the message
 *
 * @param {number} driveId - Drive ID
 * @param {Object} messageData - Message details
 * @param {string} messageData.subject - Subject line (e.g., "Your Exam Link")
 * @param {string} messageData.message - Message content
 * @param {string} messageData.examLink - Exam or meeting link to send to students
 * @param {string} messageData.messageType - Type: 'exam_link', 'interview_link', 'general'
 * @returns {Promise} - API response with success count
 *
 * @example
 * const response = await sendMessageToAttendees(5, {
 *   subject: "Your Coding Test Link - Google",
 *   message: "Your test is scheduled for 2:00 PM. Click link below to begin.",
 *   examLink: "https://hackerearth.com/test-link",
 *   messageType: "exam_link"
 * });
 */
export const sendMessageToAttendees = async (driveId, messageData) => {
  return await apiRequest(`/drives/${driveId}/attendees/send-message`, {
    method: 'POST',
    body: JSON.stringify(messageData),
  });
};

export default {
  getDriveAttendees,
  addDriveAttendees,
  removeDriveAttendee,
  getNonAttendees,
  exportAttendees,
  sendMessageToAttendees,
};
