/**
 * Attendance Key Generator
 * Generates unique 2-word keys (e.g., "BlueTiger", "RedEagle") for drive attendees
 */

// Lists of adjectives and nouns for key generation
const adjectives = [
  'Blue', 'Red', 'Green', 'Silver', 'Golden', 'Dark', 'Light', 'Swift',
  'Brave', 'Bold', 'Bright', 'Clear', 'Crystal', 'Deep', 'Fast', 'Grand',
  'Great', 'Happy', 'High', 'Iron', 'Jade', 'Noble', 'Quick', 'Rapid',
  'Royal', 'Sharp', 'Smart', 'Smooth', 'Solid', 'Stellar', 'Strong', 'True',
  'Wild', 'Wise', 'Cosmic', 'Elite', 'Epic', 'Prime', 'Quantum', 'Radiant'
];

const nouns = [
  'Tiger', 'Eagle', 'Lion', 'Falcon', 'Phoenix', 'Dragon', 'Wolf', 'Hawk',
  'Bear', 'Fox', 'Owl', 'Raven', 'Shark', 'Panther', 'Cobra', 'Viper',
  'Sparrow', 'Crane', 'Lynx', 'Jaguar', 'Leopard', 'Cheetah', 'Stallion',
  'Mustang', 'Thunder', 'Storm', 'Blaze', 'Flash', 'Shadow', 'Ghost',
  'Spirit', 'Knight', 'Warrior', 'Champion', 'Guardian', 'Sentinel', 'Titan'
];

/**
 * Generate a unique 2-word attendance key
 * Format: [Adjective][Noun] (e.g., "BlueTiger")
 *
 * @param {Array<string>} existingKeys - Array of already used keys to avoid duplicates
 * @returns {string} - Unique 2-word key in PascalCase
 *
 * @example
 * const key = generateAttendanceKey(['BlueTiger', 'RedEagle']);
 * // Returns something like "GoldenPhoenix"
 */
const generateAttendanceKey = (existingKeys = []) => {
  const maxAttempts = 100;
  let attempts = 0;

  while (attempts < maxAttempts) {
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const key = `${adjective}${noun}`;

    // Check if key hasn't been used
    if (!existingKeys.includes(key)) {
      return key;
    }
    attempts++;
  }

  // Fallback: append random number if couldn't find unique combination after 100 attempts
  const timestamp = Date.now().toString().slice(-4);
  const fallbackKey = `${adjectives[0]}${nouns[0]}${timestamp}`;
  console.warn(`Could not generate unique key after ${maxAttempts} attempts. Using fallback: ${fallbackKey}`);
  return fallbackKey;
};

/**
 * Generate multiple unique attendance keys
 *
 * @param {number} count - Number of keys to generate
 * @param {Array<string>} existingKeys - Array of already used keys
 * @returns {Array<string>} - Array of unique keys
 *
 * @example
 * const keys = generateMultipleAttendanceKeys(5, existingKeys);
 * // Returns ['BlueTiger', 'RedEagle', 'GoldenPhoenix', ...]
 */
const generateMultipleAttendanceKeys = (count, existingKeys = []) => {
  const keys = [...existingKeys]; // Copy to avoid mutating original array
  const generatedKeys = [];

  for (let i = 0; i < count; i++) {
    const newKey = generateAttendanceKey(keys);
    generatedKeys.push(newKey);
    keys.push(newKey); // Add to list to avoid duplicates in this batch
  }

  return generatedKeys;
};

/**
 * Validate if a string is a valid attendance key format
 * Valid format: [Adjective][Noun] - two PascalCase words combined
 *
 * @param {string} key - Key to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
const isValidAttendanceKeyFormat = (key) => {
  if (typeof key !== 'string') return false;

  // Check if key is combination of one adjective and one noun
  const adjList = adjectives.map(a => a.toLowerCase());
  const nounList = nouns.map(n => n.toLowerCase());

  const lowerKey = key.toLowerCase();

  for (const adj of adjList) {
    for (const noun of nounList) {
      if (lowerKey === `${adj}${noun}`) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Get statistics about available keys
 * @returns {Object} - Statistics including total possible combinations
 */
const getKeyStats = () => {
  return {
    totalAdjectives: adjectives.length,
    totalNouns: nouns.length,
    totalPossibleCombinations: adjectives.length * nouns.length,
    exampleKeys: [
      `${adjectives[0]}${nouns[0]}`,
      `${adjectives[1]}${nouns[1]}`,
      `${adjectives[2]}${nouns[2]}`
    ]
  };
};

module.exports = {
  generateAttendanceKey,
  generateMultipleAttendanceKeys,
  isValidAttendanceKeyFormat,
  getKeyStats
};
