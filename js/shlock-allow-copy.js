/**
 * Izinkan salin teks di area belajar.
 * Dipasang SETELAH lock.js (capture phase menghentikan anti-select ultimate
 * hanya di zona konten pelajaran; proteksi lain tetap aktif).
 */
(function () {
  var ALLOW =
    "main, article, .allow-copy, .doc-preview, .doc-preview-rich, " +
    ".guide-narrow, .stage-detail, .role-detail, .quiz-box, .faq-list, " +
    ".glossary-grid, .callout, .step-card, .guide-block, .checklist-box, " +
    ".article-card, .article-body, pre, code, input, textarea, [contenteditable]";

  document.addEventListener(
    "selectstart",
    function (e) {
      if (e.target && e.target.closest && e.target.closest(ALLOW)) {
        e.stopPropagation();
      }
    },
    true
  );

  // Ctrl/Cmd+C di zona belajar: jangan dibiarkan “tertahan” oleh handler lain
  document.addEventListener(
    "copy",
    function (e) {
      if (e.target && e.target.closest && e.target.closest(ALLOW)) {
        e.stopPropagation();
      }
    },
    true
  );
})();
