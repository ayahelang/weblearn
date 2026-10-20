/**
 * Bungkus <pre class="code-block"> dengan panel + tombol Salin kode
 */
(function () {
  function initCodeCopy(root) {
    root = root || document;
    var blocks = root.querySelectorAll("pre.code-block, pre.md-code");
    blocks.forEach(function (pre) {
      if (pre.closest(".code-panel")) return;
      var panel = document.createElement("div");
      panel.className = "code-panel";
      var bar = document.createElement("div");
      bar.className = "code-panel-bar";
      var label = document.createElement("span");
      label.className = "code-panel-label";
      label.textContent = "Contoh kode";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy-btn";
      btn.textContent = "Salin kode";
      btn.addEventListener("click", function () {
        var text = pre.innerText || pre.textContent || "";
        function ok() {
          btn.textContent = "Tersalin!";
          btn.classList.add("is-copied");
          setTimeout(function () {
            btn.textContent = "Salin kode";
            btn.classList.remove("is-copied");
          }, 1600);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(ok).catch(function () {
            fallbackCopy(text, ok);
          });
        } else {
          fallbackCopy(text, ok);
        }
      });
      bar.appendChild(label);
      bar.appendChild(btn);
      pre.parentNode.insertBefore(panel, pre);
      panel.appendChild(bar);
      panel.appendChild(pre);
    });
  }
  function fallbackCopy(text, ok) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      ok();
    } catch (e) {}
    document.body.removeChild(ta);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initCodeCopy();
    });
  } else {
    initCodeCopy();
  }
  window.initCodeCopy = initCodeCopy;
})();
