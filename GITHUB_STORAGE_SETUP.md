# GitHub Storage Setup (100% Gratis & Unlimited)

Aplikasi ini menggunakan **GitHub API** sebagai penyimpanan data dan file yang **100% gratis dan tanpa limit**.

## ✅ Yang Disimpan di GitHub

| Data | Lokasi di Repository | Keterangan |
|------|---------------------|------------|
| **User Data** | `data/users.json` | Data user, password (hashed), certificates info |
| **File Certificate** | `public/certificates/*.pdf` | File PDF sertifikat |

## Keuntungan

- ✅ **Gratis selamanya** - Tidak ada biaya
- ✅ **Unlimited storage** - Tidak ada batasan penyimpanan
- ✅ **Version history** - Setiap perubahan tercatat sebagai commit
- ✅ **Rate limit tinggi** - 5000 requests/jam
- ✅ **Backup otomatis** - Data tersimpan di repository Git

## Setup

### 1. Buat GitHub Personal Access Token

1. Buka https://github.com/settings/tokens
2. Klik **"Generate new token (classic)"**
3. Beri nama token (misal: "Certificate App Storage")
4. Pilih scope: **`repo`** (Full control of private repositories)
5. Klik **"Generate token"**
6. **Salin token** (hanya muncul sekali!)

### 2. Tambahkan Environment Variables di Vercel

Buka Vercel Dashboard → Project → Settings → Environment Variables

Tambahkan variabel berikut:

| Variable | Value | Contoh |
|----------|-------|--------|
| `GITHUB_TOKEN` | Token dari langkah 1 | `ghp_xxxxxxxxxxxx` |
| `GITHUB_OWNER` | Username GitHub Anda | `Ahmadlazim-03` |
| `GITHUB_REPO` | Nama repository | `internship-certificate-dashboard-startfriday-asia` |
| `GITHUB_BRANCH` | Branch yang digunakan (opsional) | `main` |

### 3. Pastikan file `data/users.json` ada di repository

File ini akan digunakan sebagai database. Pastikan sudah ada di repository Anda.

### 4. Deploy ulang

Setelah menambahkan environment variables, deploy ulang aplikasi:

```bash
git push origin main
```

## Cara Kerja

1. **Development (lokal)**: Data disimpan di file `data/users.json` lokal
2. **Production (Vercel)**: Data disimpan di repository GitHub via API

Setiap kali ada perubahan data (user baru, update, dll), aplikasi akan:
1. Membaca file `data/users.json` dari GitHub
2. Mengupdate kontennya
3. Membuat commit baru dengan perubahan

## Troubleshooting

### Error: "GitHub API Error: 401"
- Pastikan `GITHUB_TOKEN` valid dan belum expired
- Pastikan token memiliki scope `repo`

### Error: "GitHub API Error: 404"
- Pastikan `GITHUB_OWNER` dan `GITHUB_REPO` benar
- Pastikan file `data/users.json` ada di repository
- Pastikan repository tidak private (atau token punya akses)

### Data tidak terupdate
- Cache berlaku 30 detik, tunggu sebentar lalu refresh
- Cek commit history di GitHub untuk memastikan data tersimpan

## Rate Limits

GitHub API memiliki rate limit:
- **Authenticated**: 5000 requests/jam
- Untuk aplikasi normal, ini lebih dari cukup

## Migrasi dari Vercel KV

Jika sebelumnya menggunakan Vercel KV:
1. Export data dari KV
2. Update `data/users.json` di repository
3. Hapus environment variables KV dari Vercel
4. Tambahkan environment variables GitHub
5. Deploy ulang

---

## 🔒 Fitur Keamanan

Aplikasi ini dilengkapi dengan:

| Fitur | Keterangan |
|-------|------------|
| **Password Hashing** | bcrypt dengan salt rounds 10 |
| **JWT Authentication** | Token expired dalam 24 jam |
| **Rate Limiting** | 5 login attempts per 15 menit |
| **Input Validation** | Sanitasi semua input user |
| **File Validation** | Hanya PDF, max 10MB per file |
| **Admin Protection** | Admin tidak bisa hapus akun sendiri |
| **Secure Cookies** | httpOnly, secure, sameSite |

---

## 💾 Backup & Restore

### Download Backup
```bash
# Atau akses via browser (login sebagai admin dulu)
GET /api/backup
```

Akan mengunduh file `backup-YYYY-MM-DD.json` yang berisi semua data user dan sertifikat.

### Restore dari Backup
```bash
POST /api/restore
Content-Type: application/json

{file content dari backup}
```

### Backup Otomatis via Git
Karena data disimpan di GitHub repository, setiap perubahan otomatis tercatat sebagai commit. Anda bisa:
1. Lihat history perubahan di GitHub
2. Rollback ke versi sebelumnya kapan saja
3. Clone repository untuk backup lokal

---

## 📈 Scalability

| Aspek | Kapasitas |
|-------|-----------|
| **Users** | Unlimited (practical: ribuan) |
| **Certificates per user** | Unlimited |
| **File size** | Max 100MB per file (GitHub limit) |
| **API requests** | 5000/jam (authenticated) |
| **Concurrent users** | Tergantung Vercel plan |

### Limitasi
- GitHub API rate limit: 5000 req/jam
- Untuk traffic sangat tinggi (>1000 concurrent users), pertimbangkan dedicated database
- Cache 30 detik untuk mengurangi API calls

---

**Catatan:** Setup ini sudah otomatis di kode. Anda hanya perlu menambahkan environment variables GitHub di Vercel dashboard, sisanya akan otomatis bekerja.
