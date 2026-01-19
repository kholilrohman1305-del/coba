const express = require('express');
const router = express.Router();
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// --- FUNGSI PENCATAT ERROR (LOGGER) ---
// Fungsi ini akan menulis pesan error ke file 'error_log.txt' di folder utama
const logError = (context, msg) => {
    const logPath = path.join(__dirname, '../error_log.txt');
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${context}] ${msg}\n`;
    
    // Menulis ke file (append = menambah di baris bawah, tidak menimpa)
    fs.appendFile(logPath, logMessage, (err) => {
        if (err) console.error("Gagal menulis log:", err);
    });
};

// --- 1. GET (AMBIL SEMUA DATA) ---
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM siswa ORDER BY id DESC");
        res.json({ status: "success", data: rows });
    } catch (error) {
        logError('GET ALL', error.message);
        res.status(500).json({ message: error.message });
    }
});

// --- 2. GET (AMBIL 1 DATA BY ID) ---
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM siswa WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
        res.json({ status: "success", data: rows[0] });
    } catch (error) {
        logError(`GET ID ${req.params.id}`, error.message);
        res.status(500).json({ message: error.message });
    }
});

// --- 3. POST (TAMBAH DATA BARU) ---
// *Ini bagian yang sering error, log-nya lebih lengkap*
router.post('/', async (req, res) => {
    try {
        const { nama, email, jurusan } = req.body;
        
        // 1. Catat data yang masuk (untuk cek apakah data kosong)
        logError('POST ATTEMPT', `Mencoba simpan: Nama=${nama}, Email=${email}, Jurusan=${jurusan}`);

        // 2. Validasi Input
        if (!nama || !email || !jurusan) {
            throw new Error("Data tidak lengkap (Ada kolom kosong)");
        }

        // 3. Eksekusi SQL
        const sql = "INSERT INTO siswa (nama, email, jurusan) VALUES (?, ?, ?)";
        const [result] = await db.query(sql, [nama, email, jurusan]);

        // 4. Sukses
        logError('POST SUCCESS', `Data berhasil disimpan ID: ${result.insertId}`);
        res.status(201).json({
            status: "success",
            message: "Data berhasil ditambahkan",
            data: { id: result.insertId, nama, email, jurusan }
        });

    } catch (error) {
        // 5. Jika Gagal, catat errornya!
        logError('POST FAILED', `Error Database: ${error.message}`);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Email sudah terdaftar." });
        }
        res.status(500).json({ message: error.message });
    }
});

// --- 4. PUT (UPDATE DATA) ---
router.put('/:id', async (req, res) => {
    try {
        const { nama, email, jurusan } = req.body;
        const { id } = req.params;

        const sql = "UPDATE siswa SET nama = ?, email = ?, jurusan = ? WHERE id = ?";
        const [result] = await db.query(sql, [nama, email, jurusan, id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });

        res.json({
            status: "success",
            message: "Data berhasil diupdate"
        });
    } catch (error) {
        logError(`PUT FAILED ID ${req.params.id}`, error.message);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: "Email sudah digunakan siswa lain." });
        }
        res.status(500).json({ message: error.message });
    }
});

// --- 5. DELETE (HAPUS DATA) ---
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM siswa WHERE id = ?", [req.params.id]);
        
        if (result.affectedRows === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
        
        res.json({ status: "success", message: "Data berhasil dihapus" });
    } catch (error) {
        logError(`DELETE FAILED ID ${req.params.id}`, error.message);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;