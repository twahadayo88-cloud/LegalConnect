const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || "legalconnect",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log(" Database connected successfully!");
    conn.release();
  })
  .catch(err => {
    console.error(" Database connection failed:", err.message);
    console.error("Please check your .env file and database settings");
  });

module.exports = pool;