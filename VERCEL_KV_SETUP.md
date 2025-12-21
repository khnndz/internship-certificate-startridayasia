# Setup Vercel KV untuk Production

Website Anda sekarang sudah dikonfigurasi untuk menggunakan **Vercel KV** (Redis) di production, sehingga admin bisa menambah user baru tanpa masalah filesystem read-only.

## Langkah-langkah Setup di Vercel Dashboard:

### 1. Buat Vercel KV Database
1. Buka project Anda di [Vercel Dashboard](https://vercel.com/dashboard)
2. Pilih project **Certificate Page StartFridayAsia**
3. Klik tab **Storage** di menu atas
4. Klik **Create Database**
5. Pilih **KV** (Key-Value Store)
6. Beri nama database (misal: `certificate-users-db`)
7. Pilih region terdekat (misal: Singapore untuk latency minimal)
8. Klik **Create**

### 2. Link Database ke Project
1. Setelah database dibuat, klik database tersebut
2. Klik tab **Settings**
3. Di bagian **Connect Project**, pilih project Anda
4. Klik **Connect**
5. Vercel akan otomatis menambahkan environment variables:
   - `KV_URL`
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`
   - `KV_REST_API_READ_ONLY_TOKEN`

### 3. Redeploy Project
1. Kembali ke tab **Deployments**
2. Klik deployment terbaru
3. Klik **Redeploy** (atau push commit baru ke Git)
4. Tunggu hingga deployment selesai

## Cara Kerja:

### Development (Lokal)
- Website tetap menggunakan `data/users.json` seperti biasa
- Tidak perlu setup KV di lokal

### Production (Vercel)
- Website otomatis menggunakan Vercel KV
- Data user disimpan di Redis, bukan file JSON
- Admin bisa menambah/edit/hapus user tanpa masalah

## Migrasi Data Awal

Setelah KV aktif, data user awal akan otomatis diambil dari seed data (admin account yang sudah ada di kode). Jika Anda sudah punya user lain di production sebelumnya, data tersebut akan hilang karena ini storage baru.

Untuk migrate data manual:
1. Export user dari JSON lokal
2. Gunakan Vercel KV browser di dashboard
3. Set key `users` dengan value array JSON user Anda

## Testing

Setelah setup:
1. Login sebagai admin di production
2. Coba tambah user baru
3. User harus tersimpan dan bisa login
4. Refresh halaman - data user harus tetap ada

## Troubleshooting

**Q: Admin masih tidak bisa tambah user di production**
- Pastikan KV database sudah ter-link ke project
- Pastikan sudah redeploy setelah link database
- Check logs di Vercel dashboard untuk error

**Q: Data user hilang setelah deploy ulang**
- Normal jika belum setup KV (data di file JSON tidak persistent di Vercel)
- Setelah setup KV, data akan persistent

**Q: Login tidak bisa setelah setup KV**
- Data admin seed tetap ada di kode
- Email: admin@startfriday.asia
- Password: (check .env atau kode untuk default admin password)

## Biaya

Vercel KV free tier:
- 256 MB storage
- 30K commands per month
- Cukup untuk ratusan user dengan ribuan operasi

---

**Catatan:** Setup ini sudah otomatis di kode. Anda hanya perlu create KV database di Vercel dashboard, sisanya akan otomatis bekerja.
