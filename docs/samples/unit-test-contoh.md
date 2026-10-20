# Unit Test — Contoh Konsep

```javascript
// Contoh pseudo-test (Jest style)
test("linkTerms menandai istilah glossary", () => {
  const html = linkTerms("Dokumen SRS penting");
  expect(html).toContain('data-term="SRS"');
});

test("skor quiz bertambah jika jawaban benar", () => {
  answerQuiz(correctIndex);
  expect(quizState.score).toBe(1);
});
```

Unit test memverifikasi fungsi kecil secara terisolasi sebelum integrasi.
