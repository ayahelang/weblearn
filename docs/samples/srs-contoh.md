# Software Requirement Specification (SRS) — Contoh Ringkas

**Proyek:** WebLearn SDLC Module  
**Versi:** 0.9  
**Tanggal:** 2026-02-01

## 1. Pendahuluan
### 1.1 Tujuan
Dokumen ini menetapkan kebutuhan fungsional dan non-fungsional modul SDLC pada portal WebLearn.

### 1.2 Ruang Lingkup
Modul pembelajaran interaktif SDLC: tahapan, peran, glossary, dokumen contoh, dan quiz.

## 2. Kebutuhan Fungsional

| ID | Kebutuhan | Prioritas |
|----|-----------|-----------|
| FR-01 | Pengguna dapat melihat 7 tahapan SDLC beserta deskripsi, tugas, dan deliverable | Must |
| FR-02 | Setiap istilah teknis dapat diklik dan menampilkan penjelasan detail (modal) | Must |
| FR-03 | Nama dokumen deliverable dapat diklik untuk melihat/mengunduh contoh | Must |
| FR-04 | Pengguna dapat mengerjakan quiz interaktif dan melihat skor + penjelasan | Should |
| FR-05 | Pengguna dapat memfilter/melihat detail 8 peran SDLC + contoh pertanyaan interview | Should |

## 3. Kebutuhan Non-Fungsional

| ID | Kebutuhan | Target |
|----|-----------|--------|
| NFR-01 | Halaman termuat < 3 detik pada koneksi 4G | Performance |
| NFR-02 | Responsif di viewport 320px – 1440px | Usability |
| NFR-03 | Kontras teks memenuhi WCAG AA | Accessibility |
| NFR-04 | Data konten dari file JSON (mudah diedit tanpa rebuild) | Maintainability |

## 4. Constraint
- Deploy ke GitHub Pages (static hosting)
- Tidak ada server-side rendering
- Backend opsional via Google Apps Script
