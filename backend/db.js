const oracledb = require('oracledb');
require('dotenv').config();

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool;

async function initPool() {
  pool = await oracledb.createPool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectString: process.env.DB_CONNECTION,
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1
  });
  console.log('✅ Oracle connection pool created');
}

async function getConnection() {
  return await pool.getConnection();
}

async function query(sql, binds = [], opts = {}) {
  let conn;
  try {
    conn = await getConnection();
    const result = await conn.execute(sql, binds, opts);
    return result;
  } finally {
    if (conn) await conn.close();
  }
}

module.exports = { initPool, getConnection, query };
