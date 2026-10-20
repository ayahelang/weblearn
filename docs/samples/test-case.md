# Test Case / Test Scenario — Contoh

**Modul:** Halaman SDLC (sdlc.html)  
**Versi:** 1.0  
**Penulis QA:** Tim QA  
**Tanggal:** 10 Februari 2026  

---

## Ringkasan Strategi
Pengujian mencakup fungsional (tahapan, glossary, unduh dokumen, quiz, peran) dan non-fungsional ringan (responsif, aksesibilitas dasar).

---

## Test Case

| ID | Judul | Prasyarat | Langkah | Data / Input | Expected Result | Prioritas |
|----|-------|-----------|---------|--------------|-----------------|-----------|
| TC-01 | Tampil daftar tahapan | Buka sdlc.html | Scroll ke section Tahapan | - | 7 item tahapan tampil | High |
| TC-02 | Buka detail Planning | TC-01 lulus | Klik tahapan Planning | - | Panel detail menampilkan deskripsi, deliverable, tugas, mind-map | High |
| TC-03 | Buka glossary SRS | Ada teks mengandung “SRS” | Klik tautan istilah SRS | - | Modal muncul dengan definisi SRS | High |
| TC-04 | Tutup modal glossary | Modal terbuka | Tekan Escape | - | Modal tertutup | Medium |
| TC-05 | Pratinjau Project Charter | Detail Planning terbuka | Klik tautan “Project Charter” | - | Modal dokumen menampilkan isi contoh | High |
| TC-06 | Unduh dokumen | Modal dokumen terbuka | Klik tombol Unduh | - | File .md terunduh ke perangkat | High |
| TC-07 | Mulai quiz | Section Latihan terlihat | Klik “Mulai Quiz” | - | Soal pertama tampil | High |
| TC-08 | Jawab benar | Soal tampil | Pilih opsi yang benar | Opsi benar | Opsi ditandai hijau; penjelasan muncul; skor +1 | High |
| TC-09 | Jawab salah | Soal tampil | Pilih opsi salah | Opsi salah | Opsi ditandai merah; opsi benar hijau; penjelasan muncul | High |
| TC-10 | Selesai quiz | Semua soal dijawab | Klik Lanjut hingga akhir | - | Skor total ditampilkan; opsi ulangi tersedia | High |
| TC-11 | Buka detail peran BA | Section Peran terlihat | Klik chip/kartu Business Analyst | - | Tanggung jawab + contoh interview tampil | Medium |
| TC-12 | FAQ accordion | Section FAQ terlihat | Klik pertanyaan | - | Jawaban terbuka; klik lagi menutup | Low |
| TC-13 | Responsif mobile | Viewport 375px | Buka semua section utama | - | Tidak ada overflow horizontal; tombol dapat diklik | High |
| TC-14 | Navigasi header | Dari beranda website | Klik menu “SDLC” | - | Pindah ke sdlc.html | High |

---

## Catatan
- Status kolom (Pass/Fail) diisi saat eksekusi.
- Defect yang ditemukan dicatat di Bug Report / Defect Log terpisah.
