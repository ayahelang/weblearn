# Silverhawk WebLearn

Portal belajar & diskusi seputar desain website — HTML, CSS, JavaScript, dan JSON.
Website statis (HTML + CSS + JS + JSON), tanpa build step, siap deploy ke **GitHub Pages**.

## Struktur folder

```
silverhawk-tweblearn/
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
└─ README.md
```

## Fitur yang tersedia

- **Video Gallery Carousel** — carousel video YouTube (facade/lazy-load: thumbnail dulu, iframe dimuat saat diklik) lengkap dengan tombol prev/next, dot indicator, thumbnail strip, autoplay geser, dukungan keyboard & swipe.
- **Materi belajar dengan filter** — kartu artikel per topik (HTML/CSS/JS/JSON/Deploy), bisa difilter dan dibuka/ditutup untuk membaca ringkasan lengkap.
- **Roadmap 5 langkah** — alur belajar dari struktur HTML sampai deploy ke GitHub Pages.
- **Ruang diskusi komunitas** — form komentar sederhana, tersimpan di `localStorage` (demo front-end, cocok untuk situs statis tanpa backend).
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

1. Buat repository baru di GitHub, misalnya `silverhawk-tweblearn`.
2. Unggah seluruh isi folder ini ke repository (pastikan `index.html` ada di root, atau di folder `docs/` jika kamu memilih opsi itu).
3. Buka **Settings → Pages** di repository.
4. Pada **Source**, pilih branch (misalnya `main`) dan folder root (`/`), lalu simpan.
5. Tunggu beberapa menit — GitHub akan memberi URL publik seperti `https://username.github.io/silverhawk-weblearn/`.

## Mengedit konten

- **Video**: edit `data/videos.json` — ganti `youtubeId`, `title`, `description`, `tag`.
- **Materi/artikel**: edit `data/articles.json` — tambah/ubah objek artikel (title, excerpt, content, image, dst).
- **Statistik, roadmap, komentar awal**: edit `data/site.json`.
- **Gambar artikel** memakai [Lorem Picsum](https://picsum.photos/) (foto bebas dipakai, tanpa perlu API key) — ganti bagian `seed/...` pada URL untuk mengganti gambar.

## Catatan

- Judul & deskripsi 4 video di `videos.json` masih berupa placeholder umum — silakan ganti dengan judul asli video kamu.
- Form komentar dan newsletter berjalan penuh di sisi klien (tanpa server), sesuai sifat GitHub Pages yang hanya menyajikan file statis.
