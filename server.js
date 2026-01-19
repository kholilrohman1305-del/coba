const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const siswaRoutes = require('./routes/siswa');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// --- TAMBAHAN BARU DI SINI ---
// Menyajikan file statis (HTML/CSS/JS) dari folder 'public'
app.use(express.static('public')); 
// -----------------------------

// Routing API
app.use('/api/siswa', siswaRoutes);

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});