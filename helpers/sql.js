/**
 * Generate SQL for a partial update.
 *
 * This function converts input data into a SQL `SET` clause
 * and an array of values for parameterized queries.
 *
 * Example:
 *  dataToUpdate = { firstName: "Aliya", age: 32 }
 *  jsToSql = { firstName: "first_name" }
 *
 * Returns:
 * {
 *   setCols: `"first_name"=$1, "age"=$2`,
 *   values: ["Aliya", 32]
 * }
 *
 * Throws:
 *  BadRequestError if `dataToUpdate` is empty.
 *
 * @param {Object} dataToUpdate - Data to be updated in the database.
 * @param {Object} jsToSql - Mapping of JavaScript keys to SQL column names.
 *
 * @returns {Object} { setCols, values }
 */
function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`);

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
