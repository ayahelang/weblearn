/**
 * SDLC Notes page — layout pola repo asli + dokumen & glossary
 */
(function () {
  "use strict";

  var sdlcData = null;
  var quizState = { questions: [], index: 0, score: 0, answered: false };

  function initNav() {
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("navMenu");
    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        menu.classList.toggle("open");
      });
    }
    document.querySelectorAll(".nav-link").forEach(function (a) {
      a.addEventListener("click", function () {
        if (menu) menu.classList.remove("open");
      });
    });
  }

  function loadData() {
    fetch("data/sdlc.json")
      .then(function (r) {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then(function (data) {
        sdlcData = data;
        renderAll();
        logVisitor("sdlc-home");
      })
      .catch(function (e) {
        console.error(e);
        var el = document.getElementById("timelineContainer");
        if (el) {
          el.innerHTML =
            "<p style='text-align:center;color:#64748b'>Gagal memuat data. Jalankan lewat server lokal (bukan file://) agar JSON bisa di-fetch.</p>";
        }
      });
  }

  function linkTerms(text) {
    if (!sdlcData || !sdlcData.glossary || !text) return text;
    var terms = Object.keys(sdlcData.glossary).sort(function (a, b) {
      return b.length - a.length;
    });
    var result = String(text);
    terms.forEach(function (term) {
      var re = new RegExp("\\b(" + term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")\\b", "gi");
      result = result.replace(re, function (m) {
        return '<a href="#" class="term-link" data-term="' + term + '">' + m + "</a>";
      });
    });
    return result;
  }

  function renderAll() {
    renderStages();
    renderDocLibrary();
    renderRoles();
    renderTasks();
    renderFaqs();
    renderGlossary();
    var btn = document.getElementById("quizStartBtn");
    if (btn) btn.addEventListener("click", startQuiz);
  }

  function renderStages() {
    var el = document.getElementById("timelineContainer");
    if (!el) return;
    el.innerHTML = sdlcData.stages
      .map(function (s) {
        return (
          '<div class="timeline-item" data-id="' +
          s.id +
          '"><div class="num">' +
          s.id +
          '</div><div class="title">' +
          (s.short || s.title) +
          "</div></div>"
        );
      })
      .join("");
    el.querySelectorAll(".timeline-item").forEach(function (item) {
      item.addEventListener("click", function () {
        el.querySelectorAll(".timeline-item").forEach(function (i) {
          i.classList.remove("active");
        });
        item.classList.add("active");
        showStageDetail(+item.dataset.id);
      });
    });
  }

  function showStageDetail(id) {
    var stage = sdlcData.stages.find(function (s) {
      return s.id === id;
    });
    if (!stage) return;
    var detail = document.getElementById("stageDetail");
    var deliverables = (stage.deliverables || [])
      .map(function (d) {
        if (typeof d === "string") return "<li>" + d + "</li>";
        return (
          "<li><a href=\"#\" data-doc=\"" +
          d.file +
          "\" data-doc-name=\"" +
          d.name +
          "\">" +
          d.name +
          "</a> — <span style=\"color:#64748b\">" +
          (d.desc || "") +
          "</span></li>"
        );
      })
      .join("");
    var tasks = (stage.tasks || [])
      .map(function (t) {
        return "<li>" + linkTerms(t) + "</li>";
      })
      .join("");
    detail.innerHTML =
      "<h3>" +
      (stage.icon || "") +
      " " +
      stage.title +
      "</h3><p>" +
      linkTerms(stage.description) +
      '</p><div class="mind-box"><strong>Nalar petugas:</strong> ' +
      linkTerms(stage.mindMap || "") +
      "</div><p><span class=\"tag\">Deliverable</span></p><ul>" +
      deliverables +
      '</ul><p style="margin-top:1rem"><span class="tag">Tugas</span></p><ul>' +
      tasks +
      "</ul>";
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
    logVisitor("stage-" + id);
  }

  function renderDocLibrary() {
    var el = document.getElementById("docLibrary");
    if (!el) return;
    var items = [];
    sdlcData.stages.forEach(function (s) {
      (s.deliverables || []).forEach(function (d) {
        if (typeof d === "object" && d.file) {
          items.push({ stage: s.short || s.title, name: d.name, file: d.file, desc: d.desc || "" });
        }
      });
    });
    el.innerHTML = items
      .map(function (it) {
        return (
          '<div class="doc-card"><span class="stage-tag">' +
          it.stage +
          '</span><div><a href="#" data-doc="' +
          it.file +
          '" data-doc-name="' +
          it.name +
          '">' +
          it.name +
          '</a></div><div class="desc">' +
          it.desc +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderRoles() {
    var grid = document.getElementById("rolesGrid");
    if (!grid) return;
    var icons = ["📋", "🔍", "🏗️", "💻", "🧪", "🚀", "🎯", "🔄"];
    grid.innerHTML = sdlcData.roles
      .map(function (r, i) {
        return (
          '<div class="role-card" data-id="' +
          r.id +
          '"><div class="role-icon">' +
          (icons[i] || "👤") +
          "</div><h3>" +
          r.name +
          "</h3><p>" +
          (r.description || "").slice(0, 80) +
          "…</p></div>"
        );
      })
      .join("");
    grid.querySelectorAll(".role-card").forEach(function (card) {
      card.addEventListener("click", function () {
        grid.querySelectorAll(".role-card").forEach(function (c) {
          c.classList.remove("active");
        });
        card.classList.add("active");
        showRoleDetail(+card.dataset.id);
      });
    });
  }

  function showRoleDetail(id) {
    var role = sdlcData.roles.find(function (r) {
      return r.id === id;
    });
    if (!role) return;
    var detail = document.getElementById("roleDetail");
    var resp = (role.responsibilities || [])
      .map(function (r) {
        return "<li>" + r + "</li>";
      })
      .join("");
    var iq = (role.interviewQuestions || [])
      .map(function (i) {
        return '<div class="interview-q"><div class="q">❓ ' + i.q + '</div><div class="a">💬 ' + i.a + "</div></div>";
      })
      .join("");
    detail.style.display = "block";
    detail.innerHTML =
      "<h3>" +
      role.name +
      "</h3><p style=\"margin-bottom:1rem\">" +
      linkTerms(role.description) +
      '</p><h4 style="font-size:1rem;margin-bottom:0.5rem">Tanggung Jawab Utama</h4><ul style="margin:0 0 1.25rem 1.2rem">' +
      resp +
      '</ul><h4 style="font-size:1rem;margin-bottom:0.75rem">Contoh Pertanyaan Interview</h4>' +
      iq;
    detail.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderTasks() {
    var container = document.getElementById("tasksContainer");
    if (!container) return;
    container.innerHTML = sdlcData.stages
      .map(function (s) {
        return (
          '<div class="task-stage"><div class="task-stage-header"><span>' +
          s.id +
          ".</span> " +
          s.title +
          '</div><ul class="task-list">' +
          (s.tasks || [])
            .map(function (t) {
              return "<li>" + t + "</li>";
            })
            .join("") +
          "</ul></div>"
        );
      })
      .join("");
  }

  function renderFaqs() {
    var list = document.getElementById("faqList");
    if (!list || !sdlcData.faqs) return;
    list.innerHTML = sdlcData.faqs
      .map(function (f, i) {
        return (
          '<div class="faq-item" data-index="' +
          i +
          '"><button type="button" class="faq-question">' +
          f.q +
          ' <span class="icon">▼</span></button><div class="faq-answer"><div class="faq-answer-inner">' +
          linkTerms(f.a) +
          "</div></div></div>"
        );
      })
      .join("");
    list.querySelectorAll(".faq-item").forEach(function (item) {
      item.querySelector(".faq-question").addEventListener("click", function () {
        var open = item.classList.contains("open");
        list.querySelectorAll(".faq-item").forEach(function (i) {
          i.classList.remove("open");
        });
        if (!open) item.classList.add("open");
      });
    });
  }

  function renderGlossary() {
    var el = document.getElementById("glossaryGrid");
    if (!el || !sdlcData.glossary) return;
    var terms = Object.keys(sdlcData.glossary).sort(function (a, b) {
      return a.localeCompare(b);
    });
    el.innerHTML = terms
      .map(function (t) {
        return '<button type="button" class="glossary-chip" data-term="' + t + '">' + t + "</button>";
      })
      .join("");
  }

  function openGlossary(term) {
    var keys = Object.keys(sdlcData.glossary);
    var key =
      keys.find(function (k) {
        return k.toLowerCase() === String(term).toLowerCase();
      }) || term;
    document.getElementById("glossaryTitle").textContent = key;
    document.getElementById("glossaryBody").textContent = sdlcData.glossary[key] || "Definisi belum tersedia.";
    document.getElementById("glossaryModal").hidden = false;
  }


  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Markdown ringan → HTML untuk pratinjau dokumen */
  function renderMarkdown(src) {
    var text = String(src || "").replace(/\r\n/g, "\n");
    var lines = text.split("\n");
    var html = [];
    var inList = false;
    var listType = null;
    var inTable = false;
    var inCode = false;
    var codeBuf = [];

    function closeList() {
      if (inList) {
        html.push(listType === "ol" ? "</ol>" : "</ul>");
        inList = false;
        listType = null;
      }
    }
    function closeTable() {
      if (inTable) {
        html.push("</tbody></table>");
        inTable = false;
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];

      if (line.trim().indexOf("```") === 0) {
        if (inCode) {
          html.push("<pre class=\"md-code\"><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
          codeBuf = [];
          inCode = false;
        } else {
          closeList();
          closeTable();
          inCode = true;
        }
        continue;
      }
      if (inCode) {
        codeBuf.push(line);
        continue;
      }

      // table row
      if (line.indexOf("|") !== -1 && line.trim().charAt(0) === "|") {
        closeList();
        var cells = line.split("|").slice(1, -1).map(function (c) {
          return c.trim();
        });
        // separator |---|---|
        if (cells.every(function (c) { return /^[\s-:]+$/.test(c); })) {
          continue;
        }
        if (!inTable) {
          html.push("<table class=\"md-table\"><tbody>");
          inTable = true;
          html.push("<tr>" + cells.map(function (c) { return "<th>" + inlineMd(c) + "</th>"; }).join("") + "</tr>");
        } else {
          html.push("<tr>" + cells.map(function (c) { return "<td>" + inlineMd(c) + "</td>"; }).join("") + "</tr>");
        }
        continue;
      } else {
        closeTable();
      }

      if (/^#{1,3} /.test(line)) {
        closeList();
        var level = line.match(/^#+/)[0].length;
        var title = line.replace(/^#+\s*/, "");
        html.push("<h" + level + " class=\"md-h\">" + inlineMd(title) + "</h" + level + ">");
        continue;
      }
      if (/^---+$/.test(line.trim()) || /^\*\*\*+$/.test(line.trim())) {
        closeList();
        html.push("<hr class=\"md-hr\" />");
        continue;
      }
      if (/^[-*] /.test(line)) {
        if (!inList || listType !== "ul") {
          closeList();
          html.push("<ul class=\"md-ul\">");
          inList = true;
          listType = "ul";
        }
        html.push("<li>" + inlineMd(line.replace(/^[-*] /, "")) + "</li>");
        continue;
      }
      if (/^\d+\. /.test(line)) {
        if (!inList || listType !== "ol") {
          closeList();
          html.push("<ol class=\"md-ol\">");
          inList = true;
          listType = "ol";
        }
        html.push("<li>" + inlineMd(line.replace(/^\d+\. /, "")) + "</li>");
        continue;
      }
      if (!line.trim()) {
        closeList();
        continue;
      }
      closeList();
      html.push("<p class=\"md-p\">" + inlineMd(line) + "</p>");
    }
    closeList();
    closeTable();
    if (inCode) {
      html.push("<pre class=\"md-code\"><code>" + escapeHtml(codeBuf.join("\n")) + "</code></pre>");
    }
    return html.join("\n");
  }

  function inlineMd(s) {
    var t = escapeHtml(s);
    t = t.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/`([^`]+)`/g, "<code class=\"md-inline-code\">$1</code>");
    t = t.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    return t;
  }


  function openDoc(file, name) {
    document.getElementById("docTitle").textContent = name || file;
    var dl = document.getElementById("docDownload");
    dl.href = "docs/samples/" + file;
    dl.download = file;
    var body = document.getElementById("docBody");
    body.className = "doc-preview doc-preview-rich";
    body.innerHTML = "<p class=\"md-p\" style=\"color:#64748b\">Memuat dokumen…</p>";
    document.getElementById("docModal").hidden = false;
    fetch("docs/samples/" + file)
      .then(function (r) {
        if (!r.ok) throw new Error("missing");
        return r.text();
      })
      .then(function (text) {
        body.innerHTML = renderMarkdown(text);
      })
      .catch(function () {
        body.innerHTML = "<p class=\"md-p\">File tidak ditemukan: <code>" + escapeHtml(file) + "</code>. Pastikan folder <code>docs/samples/</code> ikut ter-deploy.</p>";
      });
  }

  function closeModals() {
    document.querySelectorAll(".modal").forEach(function (m) {
      m.hidden = true;
    });
  }

  document.addEventListener("click", function (e) {
    var term = e.target.closest(".term-link, .glossary-chip");
    if (term && term.dataset.term) {
      e.preventDefault();
      openGlossary(term.dataset.term);
      return;
    }
    var doc = e.target.closest("[data-doc]");
    if (doc) {
      e.preventDefault();
      openDoc(doc.dataset.doc, doc.dataset.docName || doc.textContent.trim());
      return;
    }
    if (e.target.closest("[data-close-modal]")) closeModals();
    if (e.target.classList.contains("modal")) closeModals();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModals();
  });

  function startQuiz() {
    if (!sdlcData.quizzes || !sdlcData.quizzes.length) return;
    quizState.questions = sdlcData.quizzes.slice().sort(function () {
      return Math.random() - 0.5;
    }).slice(0, Math.min(10, sdlcData.quizzes.length));
    quizState.index = 0;
    quizState.score = 0;
    quizState.answered = false;
    document.getElementById("quizStartBtn").hidden = true;
    document.getElementById("quizArea").hidden = false;
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    var area = document.getElementById("quizArea");
    var q = quizState.questions[quizState.index];
    if (!q) {
      area.innerHTML =
        '<div class="quiz-result"><p><strong>Selesai!</strong></p><div class="score-circle">' +
        quizState.score +
        "/" +
        quizState.questions.length +
        '</div><p>Skor Anda</p><button type="button" class="btn btn-primary" id="quizRestart">Ulangi Quiz</button></div>';
      document.getElementById("quizRestart").addEventListener("click", function () {
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
      q.options
        .map(function (o, i) {
          return '<button type="button" class="quiz-opt" data-idx="' + i + '">' + o + "</button>";
        })
        .join("") +
      '</div><div id="quizFeedback" class="quiz-feedback" hidden></div>' +
      '<div style="margin-top:1rem;text-align:right"><button type="button" class="btn btn-primary" id="quizNext" hidden>Lanjut</button></div>';
    quizState.answered = false;
    area.querySelectorAll(".quiz-opt").forEach(function (btn) {
      btn.addEventListener("click", function () {
        answerQuiz(+btn.dataset.idx);
      });
    });
    document.getElementById("quizNext").addEventListener("click", function () {
      quizState.index++;
      renderQuizQuestion();
    });
  }

  function answerQuiz(idx) {
    if (quizState.answered) return;
    quizState.answered = true;
    var q = quizState.questions[quizState.index];
    document.querySelectorAll(".quiz-opt").forEach(function (b) {
      b.disabled = true;
      if (+b.dataset.idx === q.correct) b.classList.add("correct");
      if (+b.dataset.idx === idx && idx !== q.correct) b.classList.add("wrong");
    });
    if (idx === q.correct) quizState.score++;
    var fb = document.getElementById("quizFeedback");
    fb.hidden = false;
    fb.className = "quiz-feedback " + (idx === q.correct ? "ok" : "bad");
    fb.textContent = (idx === q.correct ? "Benar. " : "Kurang tepat. ") + (q.explanation || "");
    document.getElementById("quizNext").hidden = false;
  }

  function postToBackend(payload) {
    if (typeof SDLC_CONFIG === "undefined" || !SDLC_CONFIG.USE_BACKEND || !SDLC_CONFIG.APPS_SCRIPT_URL) {
      return Promise.resolve();
    }
    return fetch(SDLC_CONFIG.APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    }).catch(function () {});
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

  initNav();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadData);
  } else {
    loadData();
  }
})();
