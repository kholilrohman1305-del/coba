const mysql = require('mysql2');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Fungsi Log Sederhana
const logError = (msg) => {
    const logPath = path.join(__dirname, '../error_log.txt');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[CONNECTION] ${timestamp}: ${msg}\n`);
};

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Cek Koneksi & Catat jika Gagal
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
        logError(err.message); // <--- Tulis ke file error_log.txt
    } else {
        console.log('✅ Connected to Database');
        connection.release();
    }
});

module.exports = pool.promise();