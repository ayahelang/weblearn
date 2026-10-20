# Panduan Google Apps Script + Google Sheet (WebLearn SDLC)

Backend ini menyimpan **log pengunjung** dan **skor quiz** ke Google Sheet.

## A. Setup (wajib sekali)

### 1. Buat / buka project
1. Buka https://script.google.com
2. **New project** (atau buka project yang URL-nya sudah Anda punya)
3. Hapus kode default
4. Paste **seluruh** isi file `appscript/Code.gs` dari zip ini
5. Simpan (Ctrl+S)

### 2. Jalankan initialSetup
1. Di dropdown fungsi, pilih **`initialSetup`**
2. Klik **Run**
3. Authorize akun Google (izin Spreadsheet)
4. Di menu **Executions** / log, pastikan ada:
   - Spreadsheet ID
   - Spreadsheet URL
5. Di Google Drive Anda akan muncul file **"WebLearn SDLC Database"** (atau nama lama jika sudah pernah dibuat)

Yang dibuat otomatis:
| Sheet | Isi |
|-------|-----|
| Visitors | Timestamp, Page, UserAgent |
| QuizResults | Timestamp, Score, Total, Percentage |
| Quizzes / Content / AdminTokens | opsional admin |

Password admin default: **Bismillaah** (tersimpan di Script Properties, bukan di GitHub).

### 3. Deploy Web App
1. **Deploy** → **New deployment**
2. Ikon gear → pilih **Web app**
3. Description: `v1` (atau apa saja)
4. **Execute as:** Me
5. **Who has access:** Anyone
6. **Deploy**
7. Salin **Web App URL** (bentuk `https://script.google.com/macros/s/.../exec`)

### 4. Samakan URL di website
File `js/config-sdlc.js`:

```js
const SDLC_CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/XXXX/exec", // URL deploy Anda
  USE_BACKEND: true,
  APP_NAME: "Silverhawk WebLearn — SDLC"
};
```

Di zip ini URL Anda sudah terisi. **Hanya ganti jika Anda deploy ulang dan URL berubah.**

### 5. Uji
1. Buka URL Web App di browser (GET) → harus JSON `success: true`
2. Buka https://weblearn.silverhawk.web.id/sdlc.html
3. Klik beberapa tahap, kerjakan quiz sampai selesai
4. Buka Google Sheet hasil setup → sheet **Visitors** dan **QuizResults** harus ada baris baru

## B. Deploy ulang kode (setelah edit Code.gs)
1. Paste kode baru → Simpan
2. **Deploy** → **Manage deployments** → Edit (pensil) → **New version** → Deploy  
   (jika hanya “New deployment” tanpa version, URL bisa berubah)

## C. Ganti password admin
Project Settings (ikon gear) → **Script Properties** → edit `ADMIN_PASSWORD`

## D. Matikan backend
Di `js/config-sdlc.js` set `USE_BACKEND: false`. Materi & quiz tetap jalan; data tidak dikirim ke Sheet.

## E. Troubleshooting
| Gejala | Cek |
|--------|-----|
| Sheet kosong | `initialSetup` sudah Run? Deploy = Anyone? |
| GET URL tampil login Google | Who has access bukan Anyone |
| Error “Spreadsheet belum di-setup” | Jalankan `initialSetup` lagi |
| URL berubah setelah deploy | Update `js/config-sdlc.js` lalu push website |
