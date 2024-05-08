const { credentials } = require("./dbConfig.js");
const { Pool } = require("pg");

exports.PoolResult = async (query, value) => {
  try {
    const pool = new Pool(credentials);
    const queryResult = await pool.query(query, value);
    await pool.end();
    return queryResult;
  } catch (error) {
    console.info(
      "postgres via pool: error - could not connection with postgres  due to an error ",
      error
    );
  }
};