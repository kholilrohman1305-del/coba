const express = require('express');
const router = express.Router();
const db = require('../config/db');

// --- 1. READ (Ambil Semua Data) ---
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM siswa ORDER BY id DESC");
        res.json({ status: "success", data: rows });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- 2. READ (Ambil 1 Data by ID) ---
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await db.query("SELECT * FROM siswa WHERE id = ?", [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });
        res.json({ status: "success", data: rows[0] });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- 3. CREATE (Tambah Data) ---
router.post('/', async (req, res) => {
    try {
        const { nama, email, jurusan } = req.body;
        // Validasi sederhana
        if (!nama || !email) return res.status(400).json({ message: "Nama dan Email wajib diisi" });

        const sql = "INSERT INTO siswa (nama, email, jurusan) VALUES (?, ?, ?)";
        const [result] = await db.query(sql, [nama, email, jurusan]);

        res.status(201).json({
            status: "success",
            message: "Data berhasil ditambahkan",
            data: { id: result.insertId, nama, email, jurusan }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- 4. UPDATE (Edit Data) ---
router.put('/:id', async (req, res) => {
    try {
        const { nama, email, jurusan } = req.body;
        const { id } = req.params;

        const sql = "UPDATE siswa SET nama = ?, email = ?, jurusan = ? WHERE id = ?";
        const [result] = await db.query(sql, [nama, email, jurusan, id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });

        res.json({
            status: "success",
            message: "Data berhasil diupdate",
            data: { id, nama, email, jurusan }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// --- 5. DELETE (Hapus Data) ---
router.delete('/:id', async (req, res) => {
    try {
        const [result] = await db.query("DELETE FROM siswa WHERE id = ?", [req.params.id]);

        if (result.affectedRows === 0) return res.status(404).json({ message: "Siswa tidak ditemukan" });

        res.json({ status: "success", message: "Data berhasil dihapus" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;