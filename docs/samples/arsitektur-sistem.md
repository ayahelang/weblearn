# System Architecture — Contoh (High Level)

```
[Browser Pengguna]
       │
       ▼
[web hosting — static files]
  ├─ sdlc.html
  ├─ css/style.css (tema proyek)
  ├─ js/sdlc.js
  ├─ data/sdlc.json
  └─ docs/samples/*.md
       │
       │ (opsional)
       ▼
[Google Apps Script Web App]
       │
       ▼
[Google Sheet — log & skor]
```

**Prinsip:** Separation of concerns — konten (JSON/MD) terpisah dari presentasi (HTML/CSS) dan logika (JS).
