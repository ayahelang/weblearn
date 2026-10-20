# Panduan Google Apps Script + Google Sheet

## Penting: siapa yang membuat Google Sheet?

**Saya (atau zip ini) TIDAK membuat Google Sheet di internet untuk Anda.**

Sheet dibuat **otomatis di akun Google ANDA** pada saat ANDA menjalankan fungsi `initialSetup` di editor Apps Script.

Alurnya:
1. Anda buka https://script.google.com (login akun Google Anda)
2. Paste `Code.gs` → jalankan **`initialSetup`** → Authorize
3. Script memakai izin akun Anda untuk **membuat file Spreadsheet baru di Google Drive Anda**
4. Nama default file: **WebLearn SDLC Database**
5. Cara menemukan Sheet:
   - Buka [Google Drive](https://drive.google.com) → cari `WebLearn SDLC Database`
   - Atau di editor Apps Script: setelah Run `initialSetup`, buka menu **Executions** / log — ada baris **Spreadsheet URL** yang bisa diklik
   - Atau: Project Settings → Script Properties → lihat `SPREADSHEET_ID`, lalu buka  
     `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_ITU`

Tidak ada link Sheet “global” dari pihak lain — karena data pengunjung & skor quiz tersimpan di Drive milik pemilik script (Anda).

---

## Setup langkah demi langkah

### 1. Kode
- Buka https://script.google.com → project Anda
- Paste seluruh isi `appscript/Code.gs` dari zip
- Simpan

### 2. initialSetup (wajib)
- Dropdown fungsi → **`initialSetup`** → **Run** → izinkan akses Spreadsheet
- Cek log: harus ada Spreadsheet URL
- Cek Drive: file **WebLearn SDLC Database** muncul

### 3. Deploy Web App
- Deploy → New deployment → Web app
- Execute as: **Me**
- Who has access: **Anyone**
- Salin URL `.../exec`
- Pastikan sama dengan `js/config-sdlc.js` → `APPS_SCRIPT_URL`

### 4. Uji
- Buka URL Web App di browser → JSON `success: true`
- Buka halaman `sdlc.html`, klik tahapan, selesaikan quiz
- Buka Sheet di Drive Anda → sheet **Visitors** dan **QuizResults** ada baris baru

Password admin default di Script Properties: **Bismillaah**
