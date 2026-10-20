# Database Design (ERD) — Contoh Konseptual

**Catatan:** Modul Situs Portfolio SDLC saat ini **statis** (JSON + file). ERD di bawah adalah contoh seandainya data disimpan di database (mis. untuk LMS penuh).

## Entitas Utama (contoh)

```
[User] 1──* [QuizAttempt]
  │ id
  │ name
  │ role

[Stage] 1──* [Deliverable]
  │ id
  │ title
  │ description

[Term] (glossary)
  │ id
  │ term
  │ definition

[Document]
  │ id
  │ filename
  │ title
  │ stage_id (FK)
```

## Relasi
- Satu Stage memiliki banyak Deliverable
- Satu User dapat memiliki banyak QuizAttempt
- Document terkait ke Stage (opsional)

## Untuk proyek situs statis contoh
Data disimpan di:
- `data/sdlc.json` — tahapan, peran, glossary, quiz, FAQ
- `docs/samples/*.md` — isi dokumen contoh

Tidak ada ERD fisik yang di-deploy; diagram ini hanya untuk pembelajaran konsep Design phase.
