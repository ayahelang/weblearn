# Detailed Design Document — Ringkas

## Modul UI
- **StageList:** render daftar tahapan dari JSON
- **StageDetail:** panel detail + tautan dokumen
- **GlossaryModal:** tampil definisi istilah
- **DocModal:** pratinjau + unduh file MD
- **QuizEngine:** acak soal, hitung skor, tampil penjelasan

## Alur data
`sdlc.json` → fetch → state di memori → render DOM.  
Tidak ada store global framework; vanilla JS.
