# Software Requirement Specification (SRS) — Contoh Lengkap

**Proyek:** Proyek Website Portfolio Sekolah  
**Dokumen:** SRS-WL-SDLC-001  
**Versi:** 1.1  
**Tanggal:** 1 Februari 2026  
**Status:** Approved  
**Penulis:** Business Analyst  

---

## 1. Pendahuluan

### 1.1 Tujuan
Dokumen ini menetapkan kebutuhan fungsional dan non-fungsional untuk modul pembelajaran SDLC pada website klien / proyek sekolah. Dokumen menjadi acuan bagi desainer, developer, dan QA.

### 1.2 Ruang Lingkup Produk
Modul berupa halaman web statis (`sdlc.html`) yang menampilkan:
- Penjelasan 7 tahapan SDLC
- Peran dan tanggung jawab tim
- Glossary istilah (klik untuk detail)
- Contoh dokumen yang dapat dilihat dan diunduh
- Latihan soal (quiz)
- FAQ

### 1.3 Definisi & Singkatan
| Istilah | Arti |
|---------|------|
| SDLC | Software Development Life Cycle |
| SRS | Software Requirement Specification |
| UAT | User Acceptance Testing |
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |

### 1.4 Referensi
- IEEE 830-1998 (Recommended Practice for SRS)
- Materi kuliah Rekayasa Perangkat Lunak

---

## 2. Deskripsi Umum

### 2.1 Perspektif Produk
Modul adalah bagian dari website proyek. Tidak memerlukan login untuk membaca materi. Backend Google Apps Script bersifat opsional (logging pengunjung & skor quiz).

### 2.2 Fungsi Utama Produk
1. Menampilkan tahapan SDLC secara interaktif
2. Menjelaskan istilah teknis on-demand (glossary modal)
3. Menyediakan unduhan contoh dokumen
4. Mengukur pemahaman lewat quiz
5. Menjelaskan peran & contoh pertanyaan interview

### 2.3 Karakteristik Pengguna
- Mahasiswa tingkat awal–menengah yang baru mengenal SDLC
- Pengajar yang ingin memakai materi sebagai pendukung kelas
- Pelajar otodidak / bootcamp

### 2.4 Batasan
- Hosting statis (web hosting)
- Tidak ada database server-side wajib
- Konten utama dalam Bahasa Indonesia

---

## 3. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas | Kriteria Penerimaan |
|----|-----------|-----------|---------------------|
| FR-01 | Sistem menampilkan 7 tahapan SDLC dengan judul, ikon, dan ringkasan | Must | 7 kartu tahapan tampil; klik membuka detail |
| FR-02 | Detail tahap menampilkan deskripsi, daftar deliverable, daftar tugas, dan mind-map | Must | Semua elemen terisi dari data JSON |
| FR-03 | Nama deliverable yang punya contoh dokumen dapat diklik | Must | Klik membuka pratinjau + tombol unduh |
| FR-04 | Istilah teknis di teks dapat diklik dan menampilkan definisi | Must | Modal glossary muncul dengan definisi |
| FR-05 | Sistem menampilkan 8 peran beserta tanggung jawab dan contoh interview | Should | Detail peran dapat dibuka/ditutup |
| FR-06 | Pengguna dapat mengerjakan quiz minimal 8 soal acak | Should | Skor dan penjelasan ditampilkan di akhir |
| FR-07 | FAQ ditampilkan dalam format accordion | Could | Klik pertanyaan membuka jawaban |
| FR-08 | Navigasi antar section di halaman SDLC | Must | Anchor link & scrollspy berfungsi |

---

## 4. Kebutuhan Non-Fungsional

| ID | Kategori | Kebutuhan | Target |
|----|----------|-----------|--------|
| NFR-01 | Performance | Waktu muat konten utama | < 3 detik pada koneksi 4G |
| NFR-02 | Usability | Layout responsif | Viewport 320px–1440px tanpa horizontal scroll |
| NFR-03 | Accessibility | Kontras teks | Minimal WCAG 2.1 AA |
| NFR-04 | Maintainability | Sumber konten | File JSON terpisah, dapat diedit tanpa mengubah HTML |
| NFR-05 | Compatibility | Browser | Chrome, Firefox, Safari, Edge (2 versi terakhir) |
| NFR-06 | Security | Tidak menyimpan password di frontend | Password admin hanya di Apps Script Properties |

---

## 5. Kebutuhan Antarmuka

### 5.1 Antarmuka Pengguna
- Mengikuti desain sistem Situs Portfolio Siswa (navy + electric blue)
- Mode gelap/terang (opsional, mengikuti preferensi portal utama)
- Modal untuk glossary dan pratinjau dokumen

### 5.2 Antarmuka Eksternal
- Google Apps Script Web App (opsional) untuk log pengunjung & skor

---

## 6. Lampiran
- Daftar istilah lengkap: lihat glossary di `data/sdlc.json`
- Contoh dokumen: folder `docs/samples/`

---
*Contoh SRS untuk pembelajaran. Di industri, SRS sering jauh lebih panjang dan dilengkapi diagram.*
