(function () {
  function initCodeCopy(root) {
    root = root || document;
    root.querySelectorAll("pre.code-block, pre.md-code").forEach(function (pre) {
      if (pre.closest(".code-panel")) return;

      var panel = document.createElement("div");
      panel.className = "code-panel";

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "code-copy-btn";
      btn.setAttribute("aria-label", "Salin kode");
      btn.textContent = "Salin";

      btn.addEventListener("click", function () {
        var text = pre.innerText || pre.textContent || "";
        function ok() {
          btn.textContent = "OK";
          btn.classList.add("is-copied");
          setTimeout(function () {
            btn.textContent = "Salin";
            btn.classList.remove("is-copied");
          }, 1400);
        }
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(ok).catch(function () {
            fallbackCopy(text, ok);
          });
        } else {
          fallbackCopy(text, ok);
        }
      });

      pre.parentNode.insertBefore(panel, pre);
      panel.appendChild(btn);
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
