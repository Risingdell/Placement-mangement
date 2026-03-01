// Validation utility functions for form inputs
// Returns { valid: boolean, message: string }

/**
 * Validate CGPA (0-10 scale)
 * @param {number|string} cgpa - CGPA value
 * @returns {object} Validation result
 */
export const validateCGPA = (cgpa) => {
  // Empty or null is allowed (optional field)
  if (cgpa === '' || cgpa === null || cgpa === undefined) {
    return { valid: true, message: '' };
  }

  const numCGPA = parseFloat(cgpa);

  if (isNaN(numCGPA)) {
    return { valid: false, message: 'CGPA must be a number' };
  }

  if (numCGPA < 0 || numCGPA > 10) {
    return { valid: false, message: 'CGPA must be between 0 and 10' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate percentage (0-100 scale)
 * @param {number|string} percentage - Percentage value
 * @returns {object} Validation result
 */
export const validatePercentage = (percentage) => {
  // Empty or null is allowed (optional field)
  if (percentage === '' || percentage === null || percentage === undefined) {
    return { valid: true, message: '' };
  }

  const numPercentage = parseFloat(percentage);

  if (isNaN(numPercentage)) {
    return { valid: false, message: 'Percentage must be a number' };
  }

  if (numPercentage < 0 || numPercentage > 100) {
    return { valid: false, message: 'Percentage must be between 0 and 100' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate backlogs count (non-negative integer)
 * @param {number|string} backlogs - Number of backlogs
 * @returns {object} Validation result
 */
export const validateBacklogs = (backlogs) => {
  // Empty or null is allowed (optional field)
  if (backlogs === '' || backlogs === null || backlogs === undefined) {
    return { valid: true, message: '' };
  }

  const numBacklogs = parseInt(backlogs, 10);

  if (isNaN(numBacklogs)) {
    return { valid: false, message: 'Backlogs must be a number' };
  }

  if (numBacklogs < 0) {
    return { valid: false, message: 'Backlogs cannot be negative' };
  }

  if (!Number.isInteger(numBacklogs)) {
    return { valid: false, message: 'Backlogs must be a whole number' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate semester (1-8)
 * @param {number|string} semester - Semester number
 * @returns {object} Validation result
 */
export const validateSemester = (semester) => {
  // Empty or null is allowed (optional field)
  if (semester === '' || semester === null || semester === undefined) {
    return { valid: true, message: '' };
  }

  const numSemester = parseInt(semester, 10);

  if (isNaN(numSemester)) {
    return { valid: false, message: 'Semester must be a number' };
  }

  if (numSemester < 1 || numSemester > 8) {
    return { valid: false, message: 'Semester must be between 1 and 8' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate project dates (end date should be >= start date)
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {object} Validation result
 */
export const validateProjectDates = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return { valid: true, message: '' };
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return { valid: false, message: 'Invalid start date' };
  }

  if (isNaN(end.getTime())) {
    return { valid: false, message: 'Invalid end date' };
  }

  if (end < start) {
    return { valid: false, message: 'End date must be after start date' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate skill name (non-empty, max 50 characters)
 * @param {string} name - Skill name
 * @returns {object} Validation result
 */
export const validateSkillName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, message: 'Skill name is required' };
  }

  const trimmedName = name.trim();

  if (trimmedName.length === 0) {
    return { valid: false, message: 'Skill name cannot be empty' };
  }

  if (trimmedName.length > 50) {
    return { valid: false, message: 'Skill name cannot exceed 50 characters' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate project title (3-100 characters)
 * @param {string} title - Project title
 * @returns {object} Validation result
 */
export const validateProjectTitle = (title) => {
  if (!title || typeof title !== 'string') {
    return { valid: false, message: 'Project title is required' };
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    return { valid: false, message: 'Project title cannot be empty' };
  }

  if (trimmedTitle.length < 3) {
    return { valid: false, message: 'Project title must be at least 3 characters' };
  }

  if (trimmedTitle.length > 100) {
    return { valid: false, message: 'Project title cannot exceed 100 characters' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {object} Validation result
 */
export const validateURL = (url) => {
  // Empty URL is allowed (optional field)
  if (!url || url.trim() === '') {
    return { valid: true, message: '' };
  }

  try {
    const urlObj = new URL(url);

    // Check if protocol is http or https
    if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
      return { valid: false, message: 'URL must start with http:// or https://' };
    }

    return { valid: true, message: '' };
  } catch (e) {
    return { valid: false, message: 'Please enter a valid URL' };
  }
};

/**
 * Validate required text field
 * @param {string} value - Text value
 * @param {string} fieldName - Name of the field (for error message)
 * @param {number} minLength - Minimum length (default: 1)
 * @param {number} maxLength - Maximum length (default: 500)
 * @returns {object} Validation result
 */
export const validateRequiredText = (value, fieldName = 'This field', minLength = 1, maxLength = 500) => {
  if (!value || typeof value !== 'string') {
    return { valid: false, message: `${fieldName} is required` };
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    return { valid: false, message: `${fieldName} cannot be empty` };
  }

  if (trimmedValue.length < minLength) {
    return { valid: false, message: `${fieldName} must be at least ${minLength} characters` };
  }

  if (trimmedValue.length > maxLength) {
    return { valid: false, message: `${fieldName} cannot exceed ${maxLength} characters` };
  }

  return { valid: true, message: '' };
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {object} Validation result
 */
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: 'Email is required' };
  }

  const trimmedEmail = email.trim();

  // Basic email regex pattern
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(trimmedEmail)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }

  return { valid: true, message: '' };
};

/**
 * Validate phone number (10 digits)
 * @param {string} phone - Phone number
 * @returns {object} Validation result
 */
export const validatePhone = (phone) => {
  // Empty phone is allowed (optional field)
  if (!phone || phone.trim() === '') {
    return { valid: true, message: '' };
  }

  const trimmedPhone = phone.trim();

  // Remove spaces, hyphens, and parentheses
  const cleanedPhone = trimmedPhone.replace(/[\s\-()]/g, '');

  // Check if it's 10 digits
  const phonePattern = /^\d{10}$/;

  if (!phonePattern.test(cleanedPhone)) {
    return { valid: false, message: 'Phone number must be 10 digits' };
  }

  return { valid: true, message: '' };
};
