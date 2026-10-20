/**
 * Silverhawk WebLearn — SDLC dedicated page logic
 */
(function () {
  "use strict";

  let sdlcData = null;
  let quizState = { questions: [], index: 0, score: 0, answered: false };

  // Theme + mobile nav (lightweight, mirrors main portal)
  function initChrome() {
    const root = document.body;
    const saved = localStorage.getItem("wl-theme");
    if (saved) root.setAttribute("data-theme", saved);
    document.getElementById("themeToggle")?.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("wl-theme", next);
    });
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    toggle?.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      toggle.classList.toggle("open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // progress bar
    window.addEventListener("scroll", () => {
      const h = document.documentElement;
      const p = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      const bar = document.getElementById("progressBar");
      if (bar) bar.style.width = p + "%";
    });
  }

  async function loadData() {
    try {
      const res = await fetch("data/sdlc.json");
      if (!res.ok) throw new Error("HTTP " + res.status);
      sdlcData = await res.json();
      renderAll();
      logVisitor("sdlc-home");
    } catch (e) {
      console.error(e);
      const el = document.getElementById("sdlcStages");
      if (el) el.innerHTML = "<p>Gagal memuat data SDLC. Pastikan <code>data/sdlc.json</code> tersedia saat dijalankan lewat server (bukan file://).</p>";
    }
  }

  function linkTerms(text) {
    if (!sdlcData?.glossary || !text) return text;
    const terms = Object.keys(sdlcData.glossary).sort((a, b) => b.length - a.length);
    let result = String(text);
    terms.forEach((term) => {
      const re = new RegExp("\\b(" + term.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&") + ")\\b", "gi");
      result = result.replace(re, (m) => '<a href="#" class="term-link" data-term="' + term + '">' + m + "</a>");
    });
    return result;
  }

  function renderAll() {
    renderStages();
    renderDocLibrary();
    renderRoles();
    renderFaqs();
    renderGlossaryGrid();
    document.getElementById("quizStartBtn")?.addEventListener("click", startQuiz);
    document.getElementById("sdlcDetailClose")?.addEventListener("click", () => {
      document.getElementById("sdlcDetail").hidden = true;
      document.querySelectorAll(".sdlc-card").forEach((c) => c.classList.remove("active"));
    });
  }

  function renderStages() {
    const el = document.getElementById("sdlcStages");
    if (!el) return;
    el.innerHTML = sdlcData.stages
      .map(
        (s) =>
          '<article class="sdlc-card" data-stage-id="' +
          s.id +
          '" tabindex="0" role="button">' +
          '<div class="sdlc-card-icon">' +
          (s.icon || "📘") +
          "</div><h3>" +
          s.title +
          "</h3><p>" +
          s.description.slice(0, 100) +
          "…</p></article>"
      )
      .join("");
    el.querySelectorAll(".sdlc-card").forEach((card) => {
      const open = () => openStage(+card.dataset.stageId);
      card.addEventListener("click", open);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open();
        }
      });
    });
  }

  function openStage(id) {
    const stage = sdlcData.stages.find((s) => s.id === id);
    if (!stage) return;
    document.querySelectorAll(".sdlc-card").forEach((c) => c.classList.toggle("active", +c.dataset.stageId === id));
    const panel = document.getElementById("sdlcDetail");
    const body = document.getElementById("sdlcDetailBody");
    const deliverables = (stage.deliverables || [])
      .map((d) => {
        if (typeof d === "string") return "<li>" + d + "</li>";
        return (
          '<li><a href="#" data-doc="' +
          d.file +
          '" data-doc-name="' +
          d.name +
          '">' +
          d.name +
          '</a> — <span class="muted">' +
          (d.desc || "") +
          "</span></li>"
        );
      })
      .join("");
    const tasks = (stage.tasks || []).map((t) => "<li>" + linkTerms(t) + "</li>").join("");
    body.innerHTML =
      "<h3>" +
      (stage.icon || "") +
      " " +
      stage.title +
      "</h3><p>" +
      linkTerms(stage.description) +
      '</p><div class="mind-map"><strong>Nalar petugas:</strong> ' +
      linkTerms(stage.mindMap || "") +
      "</div><h4>Deliverable (dokumen yang dihasilkan)</h4><ul class=\"sdlc-deliverables\">" +
      deliverables +
      '</ul><h4>Tugas utama</h4><ul class="sdlc-tasks">' +
      tasks +
      "</ul>";
    panel.hidden = false;
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    logVisitor("stage-" + id);
  }

  function renderDocLibrary() {
    const el = document.getElementById("docLibrary");
    if (!el) return;
    const items = [];
    sdlcData.stages.forEach((s) => {
      (s.deliverables || []).forEach((d) => {
        if (typeof d === "object" && d.file) {
          items.push({ stage: s.short || s.title, name: d.name, file: d.file, desc: d.desc || "" });
        }
      });
    });
    el.innerHTML = items
      .map(
        (it) =>
          '<div class="doc-lib-item"><span class="stage-tag">' +
          it.stage +
          '</span><div><a href="#" data-doc="' +
          it.file +
          '" data-doc-name="' +
          it.name +
          '">' +
          it.name +
          "</a></div><div class=\"muted\">" +
          it.desc +
          "</div></div>"
      )
      .join("");
  }

  function renderRoles() {
    const el = document.getElementById("sdlcRoles");
    if (!el) return;
    el.innerHTML = sdlcData.roles
      .map((r) => '<button type="button" class="sdlc-role-chip" data-role-id="' + r.id + '">' + r.name + "</button>")
      .join("");
    el.querySelectorAll(".sdlc-role-chip").forEach((chip) => {
      chip.addEventListener("click", () => openRole(+chip.dataset.roleId));
    });
  }

  function openRole(id) {
    const role = sdlcData.roles.find((r) => r.id === id);
    if (!role) return;
    document.querySelectorAll(".sdlc-role-chip").forEach((c) => c.classList.toggle("active", +c.dataset.roleId === id));
    const el = document.getElementById("sdlcRoleDetail");
    const resp = (role.responsibilities || []).map((r) => "<li>" + r + "</li>").join("");
    const iq = (role.interviewQuestions || [])
      .map((i) => '<div class="interview"><q>' + i.q + "</q><p>" + i.a + "</p></div>")
      .join("");
    el.innerHTML =
      "<h4>" +
      role.name +
      "</h4><p>" +
      linkTerms(role.description) +
      "</p><strong>Tanggung jawab</strong><ul>" +
      resp +
      "</ul><strong>Contoh pertanyaan interview</strong>" +
      iq;
    el.hidden = false;
  }

  function renderFaqs() {
    const el = document.getElementById("sdlcFaqs");
    if (!el || !sdlcData.faqs) return;
    el.innerHTML = sdlcData.faqs
      .map((f) => "<details><summary>" + f.q + "</summary><p>" + linkTerms(f.a) + "</p></details>")
      .join("");
  }

  function renderGlossaryGrid() {
    const el = document.getElementById("glossaryGrid");
    if (!el || !sdlcData.glossary) return;
    const terms = Object.keys(sdlcData.glossary).sort((a, b) => a.localeCompare(b));
    el.innerHTML = terms
      .map((t) => '<button type="button" class="glossary-chip" data-term="' + t + '">' + t + "</button>")
      .join("");
    el.querySelectorAll(".glossary-chip").forEach((btn) => {
      btn.addEventListener("click", () => openGlossary(btn.dataset.term));
    });
  }

  function openGlossary(term) {
    const keys = Object.keys(sdlcData.glossary);
    const key = keys.find((k) => k.toLowerCase() === String(term).toLowerCase()) || term;
    const def = sdlcData.glossary[key] || "Definisi belum tersedia.";
    document.getElementById("glossaryTitle").textContent = key;
    document.getElementById("glossaryBody").textContent = def;
    document.getElementById("glossaryModal").hidden = false;
  }

  async function openDoc(file, name) {
    const modal = document.getElementById("docModal");
    document.getElementById("docTitle").textContent = name || file;
    const dl = document.getElementById("docDownload");
    dl.href = "docs/samples/" + file;
    dl.download = file;
    const body = document.getElementById("docBody");
    body.textContent = "Memuat dokumen…";
    modal.hidden = false;
    try {
      const res = await fetch("docs/samples/" + file);
      if (!res.ok) throw new Error("missing");
      body.textContent = await res.text();
    } catch {
      body.textContent =
        "File contoh tidak ditemukan: " + file + "\n\nPastikan folder docs/samples/ ikut ter-deploy.";
    }
  }

  function closeModals() {
    document.querySelectorAll(".modal").forEach((m) => (m.hidden = true));
  }

  document.addEventListener("click", (e) => {
    const term = e.target.closest(".term-link, .glossary-chip");
    if (term && term.dataset.term) {
      e.preventDefault();
      openGlossary(term.dataset.term);
      return;
    }
    const doc = e.target.closest("[data-doc]");
    if (doc) {
      e.preventDefault();
      openDoc(doc.dataset.doc, doc.dataset.docName || doc.textContent.trim());
      return;
    }
    if (e.target.closest("[data-close-modal]")) closeModals();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModals();
  });

  function startQuiz() {
    if (!sdlcData?.quizzes?.length) return;
    quizState.questions = [...sdlcData.quizzes].sort(() => Math.random() - 0.5).slice(0, Math.min(10, sdlcData.quizzes.length));
    quizState.index = 0;
    quizState.score = 0;
    quizState.answered = false;
    document.getElementById("quizStartBtn").hidden = true;
    document.getElementById("quizArea").hidden = false;
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const area = document.getElementById("quizArea");
    const q = quizState.questions[quizState.index];
    if (!q) {
      area.innerHTML =
        "<p><strong>Selesai!</strong> Skor Anda: " +
        quizState.score +
        " / " +
        quizState.questions.length +
        '</p><button type="button" class="btn btn-primary" id="quizRestart">Ulangi Quiz</button>';
      document.getElementById("quizRestart")?.addEventListener("click", () => {
        document.getElementById("quizStartBtn").hidden = false;
        area.hidden = true;
      });
      saveQuizScore(quizState.score, quizState.questions.length);
      return;
    }
    area.innerHTML =
      '<div class="quiz-progress">Soal ' +
      (quizState.index + 1) +
      " / " +
      quizState.questions.length +
      '</div><div class="quiz-question">' +
      q.question +
      '</div><div class="quiz-options">' +
      q.options.map((o, i) => '<button type="button" class="quiz-opt" data-idx="' + i + '">' + o + "</button>").join("") +
      '</div><div id="quizExplain" class="quiz-explanation" hidden></div>' +
      '<button type="button" class="btn btn-primary" id="quizNext" hidden>Lanjut</button>';
    quizState.answered = false;
    area.querySelectorAll(".quiz-opt").forEach((btn) => {
      btn.addEventListener("click", () => answerQuiz(+btn.dataset.idx));
    });
    document.getElementById("quizNext")?.addEventListener("click", () => {
      quizState.index++;
      renderQuizQuestion();
    });
  }

  function answerQuiz(idx) {
    if (quizState.answered) return;
    quizState.answered = true;
    const q = quizState.questions[quizState.index];
    document.querySelectorAll(".quiz-opt").forEach((b) => {
      b.disabled = true;
      if (+b.dataset.idx === q.correct) b.classList.add("correct");
      if (+b.dataset.idx === idx && idx !== q.correct) b.classList.add("wrong");
    });
    if (idx === q.correct) quizState.score++;
    const exp = document.getElementById("quizExplain");
    exp.textContent = q.explanation || "";
    exp.hidden = false;
    document.getElementById("quizNext").hidden = false;
  }

  function postToBackend(payload) {
    if (typeof SDLC_CONFIG === "undefined" || !SDLC_CONFIG.USE_BACKEND || !SDLC_CONFIG.APPS_SCRIPT_URL) {
      return Promise.resolve();
    }
    // text/plain + no-cors: hindari CORS preflight; Apps Script tetap menerima body JSON string
    return fetch(SDLC_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).catch(function () { /* diam: backend opsional */ });
  }

  function logVisitor(page) {
    return postToBackend({
      action: "logVisitor",
      page: page || "sdlc",
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : ""
    });
  }

  function saveQuizScore(score, total) {
    var percentage = total ? Math.round((score / total) * 100) : 0;
    return postToBackend({
      action: "saveQuizResult",
      score: score,
      total: total,
      percentage: percentage
    });
  }

  initChrome();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadData);
  } else {
    loadData();
  }
})();
