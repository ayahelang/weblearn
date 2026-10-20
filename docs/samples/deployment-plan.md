# Deployment Plan — Contoh

**Proyek:** Silverhawk WebLearn (revisi SDLC)  
**Target:** https://weblearn.silverhawk.web.id/  
**Metode:** GitHub Pages (branch main, root)

## 1. Prasyarat
- [ ] Semua konten di-review
- [ ] Quiz & glossary diuji di local
- [ ] Sample dokumen lengkap di `docs/samples/`
- [ ] CNAME tetap `weblearn.silverhawk.web.id`

## 2. Langkah Deploy
1. Commit & push ke branch `main`
2. Pastikan Settings → Pages → Source = Deploy from branch `main` / (root)
3. Tunggu 1–3 menit, cek URL custom domain
4. Verifikasi HTTPS & DNS (jika baru)

## 3. Rollback
Jika ada issue kritis:
```bash
git revert HEAD
git push origin main
```
Atau restore dari commit sebelumnya via GitHub UI.

## 4. Post-Deploy Checklist
- [ ] Section SDLC tampil
- [ ] Glossary modal berfungsi
- [ ] Unduh sample dokumen berhasil
- [ ] Quiz berjalan
- [ ] Mode gelap/terang OK
