# 🖥️ Forum Chat - Backend

Ini adalah server backend untuk aplikasi **Forum Chat**. Dibangun di atas Node.js dengan kerangka kerja Express, backend ini menyediakan API RESTful yang kuat, menangani autentikasi pengguna, dan mengelola komunikasi real-time menggunakan Socket.IO.

<div align="center">
  
[![Download](https://img.shields.io/badge/Download-Backend-blue?style=for-the-badge&logo=github)](https://github.com/Zulkifli1409/forum-chat-backend)
[![Frontend](https://img.shields.io/badge/Download-Frontend-green?style=for-the-badge&logo=github)](https://github.com/Zulkifli1409/forum-chat-frontend)

</div>

---

## 📜 Daftar Isi

- [✨ Fitur Utama](#-fitur-utama)
- [🛠️ Arsitektur & Teknologi](#️-arsitektur--teknologi)
- [📁 Struktur Proyek](#-struktur-proyek)
- [🔌 Endpoint API](#-endpoint-api)
- [🏁 Memulai](#-memulai)
  - [Prasyarat](#prasyarat)
  - [Instalasi](#instalasi)
  - [Menjalankan Server](#menjalankan-server)
- [📜 Skrip yang Tersedia](#-skrip-yang-tersedia)

---

## ✨ Fitur Utama

- 🔗 **API RESTful Komprehensif** — Menyediakan endpoint yang terstruktur dengan baik untuk semua operasi data
- 🔐 **Autentikasi Berbasis Token** — Menggunakan JSON Web Tokens (JWT) untuk mengamankan endpoint dan mengelola sesi pengguna
- ⚡ **Komunikasi Real-Time** — Integrasi penuh dengan Socket.IO untuk obrolan langsung dan pembaruan data instan
- 🗄️ **Interaksi Database dengan Mongoose** — Pemodelan data yang elegan dan interaksi yang kuat dengan database MongoDB
- 🛡️ **Keamanan Tingkat Lanjut:**
  - `helmet` — Mengamankan aplikasi dengan mengatur header HTTP yang penting
  - `cors` — Mengaktifkan Cross-Origin Resource Sharing
  - `express-rate-limit` — Melindungi dari serangan brute-force dengan membatasi permintaan
  - `express-mongo-sanitize` & `xss-clean` — Mencegah serangan NoSQL injection dan Cross-Site Scripting (XSS)
- ✅ **Validasi Input** — Menggunakan `express-validator` untuk memvalidasi dan membersihkan data yang masuk
- ⏰ **Tugas Terjadwal** — Menggunakan `node-cron` untuk pekerjaan latar belakang seperti pembersihan data atau pengiriman notifikasi terjadwal
- 📝 **Logging Audit** — Mencatat tindakan penting yang dilakukan oleh admin untuk tujuan keamanan dan pelacakan

---

## 🛠️ Arsitektur & Teknologi

Backend ini dibangun dengan tumpukan teknologi berikut:

| Teknologi | Versi | Deskripsi |
|-----------|-------|-----------|
| **Node.js** | 20.x+ | Lingkungan runtime JavaScript sisi server |
| **Express.js** | 4.19.2 | Kerangka kerja web minimalis dan fleksibel untuk Node.js |
| **MongoDB** | - | Database NoSQL yang digunakan untuk menyimpan semua data aplikasi |
| **Mongoose** | 8.5.1 | Library Object Data Modeling (ODM) untuk MongoDB dan Node.js |
| **Socket.IO** | 4.7.5 | Memungkinkan komunikasi dua arah berbasis peristiwa secara real-time |
| **JSON Web Token (JWT)** | 9.0.2 | Standar terbuka untuk membuat token akses yang aman |
| **Bcrypt** | 5.1.1 | Library untuk melakukan hashing kata sandi |
| **Dotenv** | 16.4.5 | Memuat variabel lingkungan dari file `.env` |

---

## 📁 Struktur Proyek

Struktur proyek backend dirancang agar modular dan mudah dikelola:

```
/src
├── /config          # Konfigurasi (misalnya, koneksi database)
├── /controllers     # Logika bisnis untuk setiap rute
├── /middlewares     # Middleware Express (autentikasi, validasi, dll.)
├── /models          # Skema Mongoose untuk koleksi database
├── /routes          # Definisi rute API
├── /utils           # Fungsi utilitas pembantu
├── cron.js          # Logika untuk tugas-tugas terjadwal
├── generateAdmin.js # Skrip untuk membuat akun admin awal
└── server.js        # Titik masuk utama server, inisialisasi Express & Socket.IO
```

---

## 🔌 Endpoint API

API mengikuti praktik terbaik RESTful. Beberapa contoh endpoint utama meliputi:

### Autentikasi
- `POST /api/auth/register` — Mendaftarkan pengguna baru
- `POST /api/auth/login` — Mengautentikasi pengguna dan mengembalikan JWT

### Chat
- `GET /api/chats` — Mengambil pesan dari obrolan publik
- `POST /api/chats` — Mengirim pesan baru

### Admin (Dilindungi)
- `GET /api/admin/users` — Mengambil daftar semua pengguna

> 💡 *Untuk dokumentasi lengkap API, silakan merujuk ke file-file di dalam direktori `/routes`.*

---

## 🏁 Memulai

Ikuti instruksi ini untuk menyiapkan dan menjalankan server backend secara lokal.

### Prasyarat

- **Node.js** (versi LTS direkomendasikan)
- **npm**
- **Instance MongoDB** yang sedang berjalan (baik lokal maupun di cloud seperti MongoDB Atlas)

### Instalasi

1. **Clone repositori:**

   ```bash
   git clone https://github.com/Zulkifli1409/forum-chat-backend.git
   cd forum-chat-backend
   ```

2. **Instal dependensi:**

   ```bash
   npm install
   ```

3. **Konfigurasi Variabel Lingkungan:**

   Buat file `.env` di direktori root. Salin konten dari `.env.example` (jika ada) atau gunakan templat di bawah ini dan isi dengan nilai Anda sendiri:

   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/forum-chat-db
   JWT_SECRET=your_super_secret_jwt_key
   JWT_EXPIRES_IN=1d
   ```

### Menjalankan Server

- **Untuk memulai server dalam mode produksi:**

  ```bash
  npm start
  ```

- **Untuk memulai server dalam mode pengembangan dengan hot-reloading:**

  ```bash
  npm run dev
  ```

  Server akan berjalan di `http://localhost:5000` (atau port apa pun yang Anda tentukan dalam file `.env`).

---

## 📜 Skrip yang Tersedia

| Perintah | Deskripsi |
|----------|-----------|
| `npm start` | Menjalankan server menggunakan Node |
| `npm run dev` | Menjalankan server menggunakan `nodemon` untuk restart otomatis saat ada perubahan file |
| `npm run admin` | Menjalankan skrip satu kali untuk membuat pengguna admin baru di database |

---

## 🔗 Link Terkait

<div align="center">

| Repository | Link |
|------------|------|
| 🎨 **Frontend** | [Download Frontend](https://github.com/Zulkifli1409/forum-chat-frontend) |
| 🖥️ **Backend** | [Download Backend](https://github.com/Zulkifli1409/forum-chat-backend) |

</div>

---

<div align="center">
  
**Dibuat dengan ❤️ menggunakan Node.js dan Express**

</div>