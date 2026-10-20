# Silverhawk WebLearn (Revisi — Modul SDLC)

Portal belajar & diskusi seputar desain website (HTML, CSS, JavaScript, JSON) **+ modul SDLC lengkap**.

Website statis (HTML + CSS + JS + JSON), tanpa build step, siap deploy ke **GitHub Pages**.

**Custom domain:** https://weblearn.silverhawk.web.id/

## Yang baru di revisi ini

- **Modul SDLC** lengkap: 7 tahapan, 8 peran + contoh interview, FAQ, quiz interaktif
- **Glossary interaktif** — klik istilah teknis (SRS, UAT, CI/CD, dll.) untuk penjelasan detail
- **Contoh dokumen SDLC** — Project Charter, SRS, User Stories, Test Case, Deployment Plan, dll. bisa dilihat & diunduh dari `docs/samples/`
- Gaya & pewarnaan tetap mengikuti tema Silverhawk WebLearn (navy + electric blue)
- Panduan Google Apps Script + Sheet untuk backend opsional (statistik & admin)

## Struktur folder

```
weblearn/
├─ index.html
├─ CNAME                          # weblearn.silverhawk.web.id
├─ css/style.css
├─ js/main.js
├─ data/
│  ├─ videos.json
│  ├─ articles.json
│  ├─ site.json
│  └─ sdlc.json                   # konten modul SDLC + glossary
├─ docs/samples/                  # contoh dokumen SDLC (.md)
├─ appscript/Code.gs              # backend Google Apps Script
├─ panduan/
│  └─ apps-script-sdlc.md         # panduan deploy backend
├─ assets/
└─ README.md
```

## Deploy ke GitHub Pages

1. Upload seluruh isi folder ini ke repo `ayahelang/weblearn` (atau repo target Anda).
2. Pastikan `CNAME` berisi `weblearn.silverhawk.web.id`.
3. Settings → Pages → Source: branch `main`, folder `/` (root).
4. Tunggu beberapa menit.

## Backend opsional (Google Apps Script)

Lihat file **`panduan/apps-script-sdlc.md`**.

Ringkas:
1. Buat project di script.google.com
2. Paste `appscript/Code.gs`
3. Jalankan `initialSetup`
4. Deploy sebagai Web App (Anyone)
5. Tempel URL ke `CONFIG.APPS_SCRIPT_URL` di `js/main.js` dan set `USE_BACKEND: true`

Password admin default: **Bismillaah** (disimpan di Script Properties, bukan di GitHub).

## Menjalankan lokal

```bash
python3 -m http.server 8000
# atau
npx serve .
```

Buka http://localhost:8000

## Mengedit konten SDLC

Edit `data/sdlc.json`:
- `stages` — tahapan, deliverable, tasks, mind-map
- `roles` — peran & interview Q&A
- `glossary` — istilah + definisi (otomatis jadi tautan klik)
- `faqs`, `quizzes`

Tambah file contoh di `docs/samples/` dan tautkan lewat field `file` pada deliverable.

---
Silverhawk WebLearn — materi pembelajaran
