# Panduan Deploy Google Apps Script + Google Sheet untuk WebLearn (Modul SDLC)

Backend opsional ini menyimpan data pengunjung, skor quiz, dan mendukung panel admin sederhana. Password admin **tidak** disimpan di GitHub.

## 1. Buat Project Apps Script

1. Buka [script.google.com](https://script.google.com) → **New project**.
2. Hapus kode default.
3. Paste seluruh isi file `appscript/Code.gs` dari repositori ini.
4. Simpan project, beri nama misalnya **WebLearn SDLC Backend**.

## 2. Jalankan initialSetup

1. Di editor, pilih fungsi **`initialSetup`** di dropdown fungsi.
2. Klik **Run**.
3. Authorize akun Google Anda (izin Spreadsheet & Script Properties).
4. Cek log eksekusi: Spreadsheet otomatis dibuat, password admin disimpan di **Script Properties**.

Password default: **Bismillaah** (bisa diubah nanti di Script Properties → `ADMIN_PASSWORD`).

## 3. Deploy sebagai Web App

1. Klik **Deploy** → **New deployment**.
2. Type: **Web app**.
3. Description: misalnya `v1`.
4. Execute as: **Me**.
5. Who has access: **Anyone**.
6. Klik **Deploy**.
7. Salin **Web App URL** (bentuknya `https://script.google.com/macros/s/XXXX/exec`).

## 4. Hubungkan ke Frontend

Buka file `js/config.js` (atau bagian CONFIG di `js/main.js` jika digabung):

```js
const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/XXXX/exec", // tempel URL Anda
  USE_BACKEND: true,
  APP_NAME: "Silverhawk WebLearn"
};
```

Commit & push. Selesai.

## 5. Mengubah Password Admin

1. Buka project Apps Script.
2. **Project Settings** (ikon gear) → **Script Properties**.
3. Edit value `ADMIN_PASSWORD`.

## 6. Keamanan

- Jangan commit password, Spreadsheet ID, atau secret ke GitHub.
- Semua rahasia disimpan di Script Properties.
- Token admin (jika dipakai) sebaiknya berumur terbatas.

## 7. Testing tanpa Backend

Set `USE_BACKEND: false`. Aplikasi tetap jalan penuh dengan data dari file JSON lokal; hanya logging pengunjung/skor yang tidak tersimpan ke Sheet.

---
*Silverhawk WebLearn*
