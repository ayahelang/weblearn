# Silverhawk WebLearn (+ Modul SDLC)

Portal belajar desain website (HTML, CSS, JavaScript, JSON) dengan **modul SDLC di halaman terpisah**.

- Beranda: `index.html` → https://weblearn.silverhawk.web.id/
- Modul SDLC: `sdlc.html` → https://weblearn.silverhawk.web.id/sdlc.html

## Fitur modul SDLC (`sdlc.html`)

- **7 tahapan** lengkap (Planning → Maintenance) + tugas + mind-map
- **Glossary interaktif** — klik istilah di teks atau di kamus lengkap
- **29 contoh dokumen** bisa dibaca di browser & diunduh (Project Charter, SRS, User Stories, Test Plan, Test Case, Bug Report, Deployment Plan, Risk Register, ERD, API Spec, dll.)
- **8 peran** + tanggung jawab + contoh pertanyaan interview
- **Quiz** interaktif dengan penjelasan
- **FAQ**
- Gaya mengikuti tema Silverhawk WebLearn (navy + electric blue)
- Backend opsional: Google Apps Script (URL sudah di-set di `js/config-sdlc.js`)

## Struktur penting

```
├─ index.html          # portal utama
├─ sdlc.html           # halaman SDLC (terpisah)
├─ css/style.css       # tema WebLearn
├─ css/sdlc-page.css   # tambahan khusus SDLC
├─ js/main.js          # logika portal utama
├─ js/sdlc.js          # logika halaman SDLC
├─ js/config-sdlc.js   # URL Apps Script + flag backend
├─ data/sdlc.json      # konten tahapan, peran, glossary, quiz
├─ docs/samples/*.md   # contoh dokumen unduhan
├─ appscript/Code.gs   # backend Google Apps Script
└─ panduan/apps-script-sdlc.md
```

## Deploy

1. Upload seluruh isi ke repo GitHub Pages.
2. Pastikan `CNAME` = `weblearn.silverhawk.web.id`.
3. Settings → Pages → branch `main`, folder `/`.

## Apps Script

URL Web App yang dipakai:

`https://script.google.com/macros/s/AKfycbyByHSQeIUyZFnzJnC1d-O-ymlSo4OaisdJcO1ZuuCkaciY2MX7_lYBxI1MmXf5VyrbyQ/exec`

Sudah tertulis di `js/config-sdlc.js` dengan `USE_BACKEND: true`.

Jika perlu setup ulang, lihat `panduan/apps-script-sdlc.md` dan paste ulang `appscript/Code.gs`.

Password admin ada di **Script Properties** (bukan di GitHub).

## Lokal

```bash
python3 -m http.server 8000
```

Buka http://localhost:8000 dan http://localhost:8000/sdlc.html
