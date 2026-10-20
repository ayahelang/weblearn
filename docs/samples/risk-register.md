# Risk Register — Contoh (Awal Proyek)

**Proyek:** Modul SDLC WebLearn  
**Diperbarui:** 15 Januari 2026  

| ID | Risiko | Penyebab | Probabilitas | Dampak | Skor | Mitigasi | Kontingensi | Owner |
|----|--------|----------|--------------|--------|------|----------|-------------|-------|
| R01 | Scope creep materi | Permintaan fitur baru terus-menerus | Tinggi | Tinggi | 9 | Change Request formal; baseline scope di Charter | Tunda fitur ke fase 2 | PM |
| R02 | Contoh dokumen tidak realistis | Penulis belum pengalaman industri | Sedang | Tinggi | 6 | Review oleh dosen/praktisi | Revisi template | BA |
| R03 | Keterlambatan konten glossary | Istilah banyak, waktu terbatas | Sedang | Sedang | 4 | Prioritaskan istilah yang muncul di teks | Rilis bertahap | Content |
| R04 | web hosting delay / DNS | Propagasi DNS / cache | Rendah | Sedang | 2 | Deploy H-2; cek CNAME | Pakai URL domain hosting sementara | DevOps |
| R05 | Apps Script quota | Trafik tinggi | Rendah | Rendah | 1 | USE_BACKEND bisa dimatikan | Frontend tetap jalan offline | Dev |

**Cara baca skor:** Probabilitas × Dampak (skala 1–3 masing-masing, skor 1–9). Fokus mitigasi pada skor ≥ 6.
