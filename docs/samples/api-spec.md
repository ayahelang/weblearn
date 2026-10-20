# API Specification — Contoh (Opsional Backend)

Jika Google Apps Script diaktifkan, endpoint Web App menerima request HTTP.

## Base URL
```
https://script.google.com/macros/s/AKfycbyByHSQeIUyZFnzJnC1d-O-ymlSo4OaisdJcO1ZuuCkaciY2MX7_lYBxI1MmXf5VyrbyQ/exec
```

## Contoh endpoint (konseptual, sesuai Code.gs)

### POST — Log pengunjung
```json
{ "action": "logVisitor", "page": "tahapan" }
```

### POST — Simpan skor quiz
```json
{ "action": "saveScore", "score": 8, "total": 10, "name": "Anonim" }
```

### POST — Login admin (jika ada panel admin)
```json
{ "action": "adminLogin", "password": "..." }
```

## Catatan Keamanan
- Password **tidak** disimpan di frontend / GitHub
- Password ada di Script Properties Apps Script
- Who has access: Anyone (untuk Web App publik); eksekusi sebagai pemilik script

## Tanpa Backend
Set `USE_BACKEND: false` — seluruh fitur belajar tetap berjalan dari file statis.
