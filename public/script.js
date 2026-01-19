const API_URL = '/api/siswa';

document.addEventListener('DOMContentLoaded', loadData);

// --- Tampilkan Pesan Error/Sukses ---
function showAlert(message, type = 'danger') {
    const alertBox = document.getElementById('alertBox');
    alertBox.className = `alert alert-${type}`;
    alertBox.innerText = message;
    alertBox.classList.remove('d-none');
    
    // Hilangkan alert otomatis setelah 3 detik
    setTimeout(() => alertBox.classList.add('d-none'), 3000);
}

// --- 1. LOAD DATA ---
async function loadData() {
    try {
        const response = await fetch(API_URL);
        const result = await response.json();
        
        const tbody = document.getElementById('tabelSiswa');
        tbody.innerHTML = '';

        if (result.data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">Data kosong</td></tr>';
            return;
        }

        result.data.forEach((siswa, index) => {
            tbody.innerHTML += `
                <tr>
                    <td>${index + 1}</td>
                    <td>${siswa.nama}</td>
                    <td>${siswa.email}</td>
                    <td>${siswa.jurusan}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editData(${siswa.id}, '${siswa.nama}', '${siswa.email}', '${siswa.jurusan}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="hapusData(${siswa.id})">Hapus</button>
                    </td>
                </tr>
            `;
        });
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// --- 2. SUBMIT (TAMBAH / UPDATE) ---
document.getElementById('formSiswa').addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('siswaId').value;
    const data = {
        nama: document.getElementById('nama').value,
        email: document.getElementById('email').value,
        jurusan: document.getElementById('jurusan').value
    };

    let url = API_URL;
    let method = 'POST';

    if (id) {
        url = `${API_URL}/${id}`;
        method = 'PUT';
    }

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            showAlert('Data berhasil disimpan!', 'success');
            resetForm();
            loadData();
        } else {
            // Tampilkan pesan error spesifik dari backend (misal: Email duplikat)
            showAlert('Gagal: ' + result.message);
        }
    } catch (error) {
        showAlert('Terjadi kesalahan koneksi server.');
    }
});

// --- 3. DELETE ---
async function hapusData(id) {
    if (confirm('Yakin hapus data ini?')) {
        try {
            const response = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            if (response.ok) {
                showAlert('Data dihapus', 'success');
                loadData();
            }
        } catch (error) {
            showAlert('Gagal menghapus data');
        }
    }
}

// --- 4. PREPARE EDIT ---
window.editData = function(id, nama, email, jurusan) {
    document.getElementById('siswaId').value = id;
    document.getElementById('nama').value = nama;
    document.getElementById('email').value = email;
    document.getElementById('jurusan').value = jurusan;
    
    document.getElementById('btnSimpan').innerText = 'Update';
    document.getElementById('btnSimpan').classList.replace('btn-primary', 'btn-success');
    document.getElementById('btnBatal').classList.remove('d-none');
};

// --- RESET FORM ---
window.resetForm = function() {
    document.getElementById('formSiswa').reset();
    document.getElementById('siswaId').value = '';
    
    document.getElementById('btnSimpan').innerText = 'Simpan';
    document.getElementById('btnSimpan').classList.replace('btn-success', 'btn-primary');
    document.getElementById('btnBatal').classList.add('d-none');
};