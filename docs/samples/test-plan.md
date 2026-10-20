# Test Plan — Contoh

**Proyek:** Modul SDLC WebLearn  
**Dokumen:** TP-WL-SDLC-001  
**Versi:** 1.0  
**Tanggal:** 5 Februari 2026  

## 1. Tujuan Pengujian
Memastikan modul SDLC memenuhi requirement (SRS), mudah digunakan oleh pemula, dan semua contoh dokumen dapat diakses/diunduh.

## 2. Scope
**In scope:** Tahapan, peran, glossary, unduh dokumen, quiz, FAQ, navigasi, responsif.  
**Out of scope:** Load testing massal, security penetration test mendalam, browser sangat usang (IE11).

## 3. Strategi
- Functional testing manual berdasarkan test case
- Exploratory testing 1 sesi oleh pengguna non-teknis
- Checklist aksesibilitas dasar (keyboard, kontras)

## 4. Resource & Jadwal
- 1 QA (part-time) selama 3 hari
- Entry criteria: development selesai, data JSON lengkap
- Exit criteria: semua test case prioritas High lulus; tidak ada defect Critical terbuka

## 5. Risiko Pengujian
| Risiko | Mitigasi |
|--------|----------|
| Contoh dokumen belum lengkap | Blokir go-live sampai semua deliverable utama punya file |
| Glossary kurang istilah | Review silang dengan teks materi |

## 6. Deliverable Pengujian
- Test Case (dokumen ini / turunan)
- Bug Report
- Test Summary Report
