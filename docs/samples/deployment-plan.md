# Deployment Plan — Contoh

**Proyek:** Silverhawk WebLearn — Modul SDLC  
**Target URL:** https://weblearn.silverhawk.web.id/sdlc.html  
**Metode:** web hosting (branch main, root)  
**Versi rilis:** 1.0.0  

## 1. Prasyarat Go-Live
- [ ] Semua test case prioritas High lulus
- [ ] Tidak ada defect Critical/Major terbuka
- [ ] Seluruh file di `docs/samples/` ada dan dapat diunduh
- [ ] `CNAME` = weblearn.silverhawk.web.id
- [ ] Apps Script URL sudah di-set (jika USE_BACKEND true)

## 2. Langkah Deploy
1. Merge ke branch `main`
2. Push ke origin
3. GitHub Actions / Pages mem-build otomatis (static)
4. Tunggu 1–5 menit
5. Verifikasi https://weblearn.silverhawk.web.id/sdlc.html
6. Smoke test: tahapan, glossary, unduh 1 dokumen, 1 soal quiz

## 3. Rollback
```bash
git revert HEAD --no-edit
git push origin main
```
Atau restore commit sebelumnya via GitHub UI (Settings tidak perlu diubah).

## 4. Komunikasi
- Umumkan ke grup kelas / komunitas setelah smoke test lulus
- Lampirkan link langsung ke `/sdlc.html`

## 5. Post-Deploy Monitoring (7 hari)
- Cek error di browser console (jika dilaporkan user)
- Cek log Apps Script (jika aktif)
