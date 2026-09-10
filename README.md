# Silverhawk WebLearn

Portal belajar & diskusi seputar desain website — HTML, CSS, JavaScript, dan JSON.
Website statis (HTML + CSS + JS + JSON), tanpa build step, siap deploy ke **GitHub Pages**.

## Struktur folder

```
silverhawk-weblearn/
├─ index.html            # halaman utama (single full-page site)
├─ css/
│  └─ style.css          # semua styling (tema biru, responsif/fluid)
├─ js/
│  └─ main.js            # semua interaktivitas (vanilla JS)
├─ data/
│  ├─ videos.json        # daftar video untuk carousel
│  ├─ articles.json      # daftar materi/artikel belajar
│  └─ site.json          # data umum: statistik, roadmap, komentar awal
├─ assets/
│  └─ favicon.svg
├─ panduan/
│  ├─ dns-github-pages.html          # panduan domain custom → GitHub Pages
│  └─ supabase-github-pages.html     # panduan koneksi Supabase + alternatif gratis
└─ README.md
```

## Fitur yang tersedia

- **Video Gallery Carousel** — carousel video YouTube (facade/lazy-load: thumbnail dulu, iframe dimuat saat diklik) lengkap dengan tombol prev/next, dot indicator, thumbnail strip, autoplay geser, dukungan keyboard & swipe.
- **Materi belajar dengan filter** — kartu artikel per topik (HTML/CSS/JS/JSON/Deploy), bisa difilter dan dibuka/ditutup untuk membaca ringkasan lengkap.
- **Roadmap 5 langkah** — alur belajar dari struktur HTML sampai deploy ke GitHub Pages.
- **Ruang diskusi komunitas** — form komentar sederhana, default tersimpan di `localStorage` (demo front-end). Bisa dihubungkan ke Supabase / backend lain agar komentar menjadi data bersama (lihat panduan).
- **FAQ** dan **newsletter** (form demo front-end).
- **Mode terang/gelap** dengan preferensi tersimpan otomatis.
- **Navigasi responsif** dengan menu mobile, scrollspy, progress bar scroll, dan tombol kembali ke atas.
- **Desain modern minimalis** bertema biru dengan motif "editor kode" (jendela browser, tab file, syntax JSON) yang konsisten di beberapa bagian.
- Semua konten dinamis (video, artikel, statistik, roadmap, komentar awal) diambil dari file **JSON** di folder `data/`, jadi mudah diedit tanpa menyentuh HTML.

## Menjalankan secara lokal

File JSON dimuat lewat `fetch()`, jadi sebaiknya dijalankan lewat server lokal kecil (bukan dibuka langsung sebagai `file://`), misalnya:

```bash
# opsi 1: Python
python3 -m http.server 8000

# opsi 2: Node (butuh paket 'serve')
npx serve .
```

Lalu buka `http://localhost:8000`. Jika file dibuka langsung tanpa server, `main.js` otomatis memakai data cadangan (fallback) khusus video agar carousel tetap tampil.

## Deploy ke GitHub Pages

1. Buat repository baru di GitHub, misalnya `silverhawk-weblearn`.
2. Unggah seluruh isi folder ini ke repository (pastikan `index.html` ada di root, atau di folder `docs/` jika kamu memilih opsi itu).
3. Buka **Settings → Pages** di repository.
4. Pada **Source**, pilih branch (misalnya `main`) dan folder root (`/`), lalu simpan.
5. Tunggu beberapa menit — GitHub akan memberi URL publik seperti `https://username.github.io/silverhawk-weblearn/`.

## Mengedit konten

- **Video**: edit `data/videos.json` — ganti `youtubeId`, `title`, `description`, `tag`.
- **Materi/artikel**: edit `data/articles.json` — tambah/ubah objek artikel (title, excerpt, content, image, dst).
- **Statistik, roadmap, komentar awal**: edit `data/site.json`.
- **Gambar artikel** memakai [Lorem Picsum](https://picsum.photos/) (foto bebas dipakai, tanpa perlu API key) — ganti bagian `seed/...` pada URL untuk mengganti gambar.

## Panduan tambahan

| Panduan | Isi |
|---------|-----|
| [DNS → GitHub Pages](panduan/dns-github-pages.html) | Cara menghubungkan domain custom (JagoanHosting, DomaiNesia, Hostinger, dll) ke GitHub Pages |
| [Supabase + GitHub Pages](panduan/supabase-github-pages.html) | Dari belum punya akun Supabase → project → tabel → RLS → API key → integrasi → realtime. Termasuk alternatif gratis. |
| [**Rollback & maju lagi (Git/GitHub)**](panduan/git-rollback-maju.html) | **Baru.** Kembalikan repo ke commit sebelumnya, lalu maju lagi ke commit yang sudah pernah ada — lewat website GitHub maupun perintah Git (`revert`, `reset`, `reflog`). |

### Alternatif backend gratis (ringkas)

Karena GitHub Pages hanya menyajikan file statis, untuk menyimpan data bersama (komentar, newsletter, dll) kamu butuh backend eksternal. Pilihan gratis yang direkomendasikan:

1. **Supabase** (disarankan) — Postgres + Realtime + Auth. Free tier cukup untuk komunitas kecil. Panduan lengkap ada di folder `panduan/`.
2. **Firebase (Google)** — Firestore + Realtime + Auth. Free Spark plan sangat longgar, tutorial berlimpah.
3. **Appwrite** — Open-source, ada Cloud free tier, mirip Supabase.
4. **PocketBase** — Single binary + SQLite, sangat ringan, cocok self-host di Railway/Render free tier.

Detail setup, perbandingan, dan contoh kode ada di [panduan/supabase-github-pages.html](panduan/supabase-github-pages.html).

## Catatan

- Judul & deskripsi 4 video di `videos.json` masih berupa placeholder umum — silakan ganti dengan judul asli video kamu.
- Form komentar dan newsletter berjalan penuh di sisi klien (tanpa server) secara default, sesuai sifat GitHub Pages yang hanya menyajikan file statis.
- Setelah menghubungkan Supabase (atau backend lain), komentar menjadi data bersama antar pengunjung dan mendukung realtime.
