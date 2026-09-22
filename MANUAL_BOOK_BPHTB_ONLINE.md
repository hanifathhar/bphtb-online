# BUKU PANDUAN PENGGUNA (MANUAL BOOK)
# SISTEM INFORMASI BPHTB ONLINE
### Badan Pengelolaan Keuangan, Pendapatan dan Aset Daerah (BPKPAD)
### Kabupaten Tapanuli Selatan

---

## 📑 DAFTAR ISI
1. **BAB I: PENDAHULUAN**
   - 1.1 Latar Belakang & Tujuan
   - 1.2 Ruang Lingkup Sistem
2. **BAB II: HAK AKSES DAN MATRIKS WEWENANG (RBAC)**
   - 2.1 Struktur Peran Pengguna
   - 2.2 Matriks Hak Akses Modul
3. **BAB III: PANDUAN MASUK SISTEM (LOGIN)**
   - 3.1 Tampilan Antarmuka Login
   - 3.2 Kredensial Default & Keamanan Akun
4. **BAB IV: DASHBOARD & MONITORING REAL-TIME**
   - 4.1 Tampilan Dashboard Utama & Statistik
   - 4.2 Kartu Indikator Kinerja Utama (KPI Cards)
   - 4.3 Grafik Realisasi Penerimaan BPHTB
5. **BAB V: MODUL PENDAFTARAN BPHTB (WIZARD 5 LANGKAH)**
   - 5.1 Tahap 1: Data Wajib Pajak Lama (Penjual)
   - 5.2 Tahap 2: Data Wajib Pajak Baru (Pembeli)
   - 5.3 Tahap 3: Data Objek Pajak & Integrasi Lookup NOP PBB
   - 5.4 Tahap 4: Transaksi & Formula Kalkulasi Otomatis BPHTB
   - 5.5 Tahap 5: Unggah Dokumen Persyaratan & Simpan Berkas
6. **BAB VI: ALUR VERIFIKASI BERJENJANG (3 LEVEL)**
   - 6.1 Level 1: Verifikasi Berkas & Pemeriksaan Lapangan
   - 6.2 Level 2: Verifikasi Teknis & Yuridis (Kasi)
   - 6.3 Level 3: Verifikasi Penetapan SKP & Otorisasi Kabid
7. **BAB VII: MODUL PEMBAYARAN & PENERBITAN SSPD**
   - 7.1 Tampilan Kasir Pembayaran BPHTB
   - 7.2 Pencatatan Setoran Kas / Bank Persepsi
   - 7.3 Pencetakan Lembar SSPD 5 Rangkap Ber-Barcode
8. **BAB VIII: MODUL LAPORAN & REKAPITULASI**
   - 8.1 Tampilan Modul Laporan Pembayaran & Realisasi
   - 8.2 Laporan Piutang & Ekspor Format Cetak / Excel
9. **BAB IX: MASTER DATA & KONFIGURASI SISTEM**
   - 9.1 Pengelolaan Pengguna (User Management)
   - 9.2 Master Wilayah (Kecamatan & Desa)
   - 9.3 Master Tarif & NPOPTKP
10. **BAB X: PANDUAN PENANGANAN MASALAH (TROUBLESHOOTING)**

---

## BAB I: PENDAHULUAN

### 1.1 Latar Belakang & Tujuan
Aplikasi **BPHTB Online Kabupaten Tapanuli Selatan** adalah sistem informasi perpajakan daerah berbasis web modern yang dirancang untuk memproses pendaftaran, verifikasi berjenjang, penetapan pajak, validasi pembayaran kas daerah, serta pencetakan Surat Setoran Pajak Daerah (SSPD) secara digital, transparan, dan akuntabel.

### 1.2 Ruang Lingkup Sistem
- **Pendaftaran Berkas**: Mandiri oleh PPAT/Notaris atau melalui Petugas Loket Pelayanan.
- **Integrasi PBB-P2**: Penarikan data NJOP dan luas tanah/bangunan secara otomatis berdasarkan 18 digit NOP.
- **Validasi Multilevel**: Kontrol 3 tahapan (Staf Pemeriksa -> Kepala Seksi -> Kepala Bidang Penetapan).
- **Pembayaran Bank Persepsi**: Integrasi pencatatan kasir Bank Sumut / Bank Kasda dan penerbitan nomor STS.
- **Pencetakan Dokumen Resmi**: Cetak SKPD, SKPDKB, dan SSPD 5 Lembar berstandar legal.

---

## BAB II: HAK AKSES DAN MATRIKS WEWENANG

| Level | Peran (Role) | Deskripsi Tugas & Wewenang | Menu Utama |
|---|---|---|---|
| **1** | **Administrator** | Manajemen seluruh sistem, pengelolaan user, master data tarif & wilayah | Semua Menu & Pengaturan |
| **2** | **Loket Pelayanan** | Input pendaftaran berkas, penerimaan fisik dokumen, cetak tanda terima | Pendaftaran, Daftar Berkas |
| **3** | **Verifikator 1** | Pemeriksaan kelengkapan dokumen scan, validasi fisik objek & NOP | Verifikasi Level 1 |
| **4** | **Verifikator 2** | Penelaahan teknis kewajaran nilai pasar NPOP vs NJOP, verifikasi yuridis | Verifikasi Level 2 |
| **5** | **Verifikator 3** | Persetujuan final (Approval) penetapan SKPD dan penerbitan nomor kohir | Verifikasi Level 3, Penetapan |
| **6** | **Kasir / Bank** | Pencatatan penerimaan setoran pajak BPHTB dan penerbitan bukti lunas STS | Pembayaran, Laporan Kas |
| **7** | **PPAT / Notaris** | Pengajuan mandiri berkas BPHTB atas akta tanah & pemantauan status berkas | Pendaftaran & Tracking |

---

## BAB III: PANDUAN MASUK SISTEM (LOGIN)

### 3.1 Tampilan Antarmuka Login
![Halaman Login BPHTB Online](file:///d:/Project-App/NextjsApp/bphtb-online/public/manual-book-img/01_halaman_login.png)

### 3.2 Langkah-langkah Login:
1. Buka peramban (Google Chrome, Microsoft Edge, atau Mozilla Firefox).
2. Masukkan alamat URL: `http://localhost:3000` (atau domain server resmi BPKPAD).
3. Pada form login, masukkan **Username** dan **Password**.
4. Klik tombol **Masuk ke Sistem**.
5. Sistem akan memvalidasi token sesi dan mengarahkan ke halaman **Dashboard**.

> **Catatan Keamanan**: Selalu klik menu **Logout** di pojok kanan atas setelah selesai bertugas untuk mengakhiri sesi secara aman.

---

## BAB IV: DASHBOARD & MONITORING REAL-TIME

### 4.1 Tampilan Dashboard Utama
![Dashboard Utama BPHTB Online](file:///d:/Project-App/NextjsApp/bphtb-online/public/manual-book-img/02_dashboard_utama.png)

Dashboard menampilkan ringkasan eksekutif yang mencakup:
1. **Filter Tahun Anggaran**: Memfilter seluruh data berdasarkan tahun berjalan (contoh: 2026).
2. **Kartu Statistik (KPI)**:
   - *Total Berkas Terdaftar*
   - *Berkas Menunggu Verifikasi*
   - *Berkas Siap Bayar (SKP Terbit)*
   - *Total Realisasi Penerimaan BPHTB (Rp)*
3. **Grafik Realisasi Bulanan**: Grafik batang perbandingan target dan realisasi bulanan.
4. **Tabel Berkas Terbaru**: Pemantauan cepat 6 berkas terakhir yang masuk ke sistem.

---

## BAB V: MODUL PENDAFTARAN BPHTB (WIZARD 5 LANGKAH)

### 5.1 Tampilan Formulir Pendaftaran
![Formulir Pendaftaran BPHTB](file:///d:/Project-App/NextjsApp/bphtb-online/public/manual-book-img/03_pendaftaran_wp_lama.png)

### 5.2 Tahapan Pengisian:
- **Langkah 1 (Identitas WP Lama / Penjual)**: Masukkan Nama Lengkap, NIK (16 digit), NPWP, Alamat, RT/RW, Kelurahan/Desa, Kecamatan, dan No. Telepon.
- **Langkah 2 (Identitas WP Baru / Pembeli)**: Masukkan Nama Lengkap Penerima Hak, NIK, NPWP, Alamat Domisili, dan Kontak Pemohon.
- **Langkah 3 (Objek Pajak & Auto Lookup NOP PBB)**:
  - Masukkan **18 Digit NOP PBB**, lalu klik tombol **Cari Data PBB**.
  - Sistem otomatis mengisi Luas Tanah, Luas Bangunan, NJOP Bumi/m², dan NJOP Bangunan/m².
- **Langkah 4 (Transaksi & Perhitungan Pajak Otomatis)**:
  - Pilih **Jenis Transaksi** (Jual Beli, Hibah, Waris, Tukar Menukar, dll).
  - Masukkan **Nilai Transaksi Riil (Rp)**.
  - Sistem menetapkan:
    $$\text{NPOP} = \max(\text{Nilai Transaksi}, \text{Total NJOP PBB})$$
    $$\text{NPOPKP} = \text{NPOP} - \text{NPOPTKP}$$
    $$\text{BPHTB Terutang} = \text{NPOPKP} \times 5\%$$
- **Langkah 5 (Unggah Dokumen Persyaratan)**:
  - Upload berkas scan KTP, Surat Pernyataan, Foto Objek, Sertifikat, dan Bukti Lunas PBB.
  - Klik **Simpan & Daftarkan Berkas**. Nomor Berkas resmi akan langsung terbit.

---

## BAB VI: ALUR VERIFIKASI BERJENJANG (3 LEVEL)

### 6.1 Tampilan Modul Verifikasi Level 1
![Verifikasi Berkas Level 1](file:///d:/Project-App/NextjsApp/bphtb-online/public/manual-book-img/04_verifikasi_level1.png)

1. **Level 1 (Verifikasi Berkas & Lapangan)**: Memeriksa kelengkapan berkas fisik/scan dan kebenaran NOP PBB.
2. **Level 2 (Verifikasi Teknis & Yuridis)**: Menganalisis kesesuaian harga transaksi dan legalitas akta.
3. **Level 3 (Penetapan SKP)**: Otorisasi final dan penetapan Surat Ketetapan Pajak Daerah (SKPD/SKPDKB).

---

## BAB VII: MODUL PEMBAYARAN & PENERBITAN SSPD

### 7.1 Tampilan Kasir Pembayaran BPHTB
![Modul Kasir Pembayaran BPHTB](file:///d:/Project-App/NextjsApp/bphtb-online/public/manual-book-img/05_modul_pembayaran.png)

### 7.2 Prosedur Pelunasan:
1. Buka menu **Pembayaran BPHTB** -> Tab **Belum Lunas**.
2. Cari No. Berkas / Nama Wajib Pajak, lalu klik tombol **Bayar**.
3. Pilih **Bank Pembayaran** (Bank Sumut, Bank Sumut Syariah, Kasir BPKPAD, dll).
4. Masukkan **Nomor Bukti Setor / Ref Bank** dan **Tanggal Pembayaran**.
5. Klik **Konfirmasi Pembayaran Lunas**.
6. Masuk ke tab **Sudah Lunas** -> Klik **Cetak SSPD** untuk mengunduh Surat Setoran Pajak Daerah 5 Rangkap resmi ber-barcode.

---

## BAB VIII: MODUL LAPORAN & REKAPITULASI

### 8.1 Tampilan Modul Laporan
![Halaman Laporan Pembayaran](file:///d:/Project-App/NextjsApp/bphtb-online/public/manual-book-img/06_modul_laporan.png)

Aplikasi menyediakan berbagai jenis laporan dinas:
- **Laporan Pendaftaran**: Rekapitulasi permohonan masuk per periode.
- **Laporan Verifikasi**: Rekapitulasi status proses verifikasi 1, 2, dan 3.
- **Laporan Ketetapan SKP**: Rekapitulasi nilai pokok ketetapan dan nomor kohir.
- **Laporan Penerimaan Kas**: Rekapitulasi setoran kas daerah per bank persepsi & nomor STS.
- **Laporan Piutang**: Monitoring ketetapan yang belum dilunasi melewati jatuh tempo.

---

## BAB IX: MASTER DATA & PENGATURAN PENGGUNA

### 9.1 Tampilan Manajemen Pengguna
![Manajemen Pengguna Master Data](file:///d:/Project-App/NextjsApp/bphtb-online/public/manual-book-img/07_master_pengguna.png)

Pengaturan khusus untuk Administrator:
- **Master Pengguna**: Pembuatan user, reset kata sandi, dan penentuan role level 1 s.d 7.
- **Master Kecamatan & Desa**: Manajemen referensi 15 Kecamatan dan 238 Desa di Kabupaten Tapanuli Selatan.
- **Master Jenis Transaksi & Tarif**: Pengaturan tarif pajak dan batas NPOPTKP per jenis perolehan hak.
- **Master Pejabat**: Pengaturan Nama, NIP, Pangkat, dan Jabatan penandatangan SKPD/SSPD.

---

## BAB X: PANDUAN PENANGANAN MASALAH (TROUBLESHOOTING)

| Kendala | Penyebab | Solusi |
|---|---|---|
| **Gagal Login** | Password salah / user dinonaktifkan | Periksa tombol Caps Lock atau hubungi Administrator untuk reset password. |
| **Lookup NOP Gagal** | Format NOP salah / server PBB offline | Pastikan 18 digit angka benar. Jika server PBB offline, gunakan pengisian manual luas & NJOP. |
| **Upload Gagal** | Ukuran file > 5 MB atau format tidak didukung | Kompres file dan pastikan format berupa `.pdf`, `.jpg`, atau `.png`. |
| **Tidak Bisa Verifikasi** | Akun tidak memiliki wewenang level tersebut | Login menggunakan akun dengan level verifikasi yang sesuai (Level 1, 2, atau 3). |

---
**Badan Pengelolaan Keuangan, Pendapatan dan Aset Daerah (BPKPAD)**  
*Kabupaten Tapanuli Selatan — 2026*
