const { promisePool } = require('../config/database');

const columnCache = new Map();

const getCacheKey = (tableName, columnName) => `${tableName}:${columnName}`;

const hasColumn = async (tableName, columnName) => {
  const cacheKey = getCacheKey(tableName, columnName);

  if (columnCache.has(cacheKey)) {
    return columnCache.get(cacheKey);
  }

  const [rows] = await promisePool.query(
    `SELECT 1
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName]
  );

  const exists = rows.length > 0;
  columnCache.set(cacheKey, exists);
  return exists;
};

module.exports = {
  hasColumn
};
