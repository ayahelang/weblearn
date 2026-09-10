/* ==========================================================================
   Silverhawk WebLearn — main.js
   Vanilla JS, no build step. Loads content from /data/*.json.
   Falls back to inline data if fetch fails (e.g. opened via file://).
   ========================================================================== */

(() => {
  "use strict";

  /* ---------- Fallback data (used only if fetch() can't reach /data) ---------- */
  const FALLBACK = {
    videos: {
      videos: [
        { id: "v1", youtubeId: "DHGhFJZLKMs", title: "Mengenal Dasar Teknologi Website", description: "Perkenalan singkat tentang HTML, CSS, dan JavaScript.", tag: "HTML" },
        { id: "v2", youtubeId: "aEj6k-gi9-s", title: "Praktik Membangun Tampilan dengan CSS", description: "Studi kasus menyusun layout dan tampilan visual.", tag: "CSS" },
        { id: "v3", youtubeId: "iiADhChRriM", title: "Interaktivitas Website dengan JavaScript", description: "Menambahkan interaksi dan logika sederhana.", tag: "JS" },
        { id: "v4", youtubeId: "g4SONHC15lg", title: "Mengelola Data Website dengan JSON", description: "Memakai JSON sebagai sumber data konten.", tag: "JSON" }
      ]
    },
    articles: [],
    site: { stats: [], roadmap: [], comments: [] }
  };

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  async function loadJSON(path, fallback) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error("bad status");
      return await res.json();
    } catch (err) {
      console.warn(`[silverhawk] gagal memuat ${path}, memakai data cadangan.`, err);
      return fallback;
    }
  }

  /* ==========================================================================
     Theme (light/dark) with localStorage persistence
     ========================================================================== */
  function initTheme() {
    const root = document.body;
    const toggle = $("#themeToggle");
    const stored = localStorage.getItem("shwl-theme");
    const prefersLight = window.matchMedia("(prefers-color-scheme: light)").matches;
    root.setAttribute("data-theme", stored || (prefersLight ? "light" : "dark"));

    toggle.addEventListener("click", () => {
      const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      localStorage.setItem("shwl-theme", next);
    });
  }

  /* ==========================================================================
     Mobile nav
     ========================================================================== */
  function initNav() {
    const navToggle = $("#navToggle");
    const navLinks = $("#navLinks");

    navToggle.addEventListener("click", () => {
      const open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", String(open));
    });

    $$(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    // Scrollspy
    const sections = $$(".nav-link")
      .map((a) => document.querySelector(a.getAttribute("href")))
      .filter(Boolean);

    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = "#" + entry.target.id;
          $$(".nav-link").forEach((a) => a.classList.toggle("active", a.getAttribute("href") === id));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((sec) => spy.observe(sec));
  }

  /* ==========================================================================
     Scroll progress bar + back-to-top
     ========================================================================== */
  function initScrollUI() {
    const bar = $("#progressBar");
    const backBtn = $("#backToTop");

    const onScroll = () => {
      const doc = document.documentElement;
      const scrolled = doc.scrollTop;
      const max = doc.scrollHeight - doc.clientHeight;
      bar.style.width = max > 0 ? `${(scrolled / max) * 100}%` : "0%";
      backBtn.classList.toggle("show", scrolled > 480);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    backBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    onScroll();
  }

  /* ==========================================================================
     Reveal-on-scroll
     ========================================================================== */
  function initReveal() {
    const items = $$("[data-reveal]");
    if (!items.length) return;
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    items.forEach((el) => io.observe(el));
  }

  /* ==========================================================================
     Hero stats
     ========================================================================== */
  function renderStats(stats) {
    const wrap = $("#heroStats");
    if (!wrap || !stats?.length) return;
    wrap.innerHTML = stats
      .map((s) => `<div class="stat"><b>${s.value}${s.suffix || ""}</b><span>${s.label}</span></div>`)
      .join("");
  }

  /* ==========================================================================
     Video carousel
     ========================================================================== */
  function initCarousel(videoData) {
    const list = videoData?.videos || [];
    const viewport = $("#carouselViewport");
    const dotsWrap = $("#carouselDots");
    const thumbsWrap = $("#carouselThumbs");
    if (!list.length || !viewport) return;

    let active = 0;
    let timer = null;
    const AUTOPLAY_MS = 6000;

    viewport.innerHTML = list
      .map(
        (v, i) => `
      <div class="carousel-slide${i === 0 ? " is-active" : ""}" data-index="${i}">
        <button class="thumb-btn" type="button"
          style="background-image:url('https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg')"
          data-play="${v.youtubeId}" aria-label="Putar video: ${v.title}">
          <span class="play-icon"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>
        </button>
        <div class="slide-meta">
          <span class="vtag">${v.tag}</span>
          <h3>${v.title}</h3>
          <p>${v.description}</p>
        </div>
      </div>`
      )
      .join("");

    dotsWrap.innerHTML = list
      .map((_, i) => `<button type="button" class="${i === 0 ? "is-active" : ""}" data-goto="${i}" aria-label="Ke video ${i + 1}"></button>`)
      .join("");

    thumbsWrap.innerHTML = list
      .map(
        (v, i) => `<button type="button" class="${i === 0 ? "is-active" : ""}" data-goto="${i}"
          style="background-image:url('https://img.youtube.com/vi/${v.youtubeId}/hqdefault.jpg')"
          aria-label="${v.title}"></button>`
      )
      .join("");

    const slides = $$(".carousel-slide", viewport);
    const dots = $$("button", dotsWrap);
    const thumbs = $$("button", thumbsWrap);

    function goTo(index) {
      active = (index + list.length) % list.length;
      slides.forEach((s, i) => s.classList.toggle("is-active", i === active));
      dots.forEach((d, i) => d.classList.toggle("is-active", i === active));
      thumbs.forEach((t, i) => t.classList.toggle("is-active", i === active));
    }

    function resetAutoplay() {
      clearInterval(timer);
      timer = setInterval(() => goTo(active + 1), AUTOPLAY_MS);
    }

    $("#prevBtn").addEventListener("click", () => { goTo(active - 1); resetAutoplay(); });
    $("#nextBtn").addEventListener("click", () => { goTo(active + 1); resetAutoplay(); });
    dots.forEach((d) => d.addEventListener("click", () => { goTo(+d.dataset.goto); resetAutoplay(); }));
    thumbs.forEach((t) => t.addEventListener("click", () => { goTo(+t.dataset.goto); resetAutoplay(); }));

    // Lazy-load the YouTube iframe only when a thumbnail is clicked (facade pattern)
    viewport.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-play]");
      if (!btn) return;
      const slide = btn.closest(".carousel-slide");
      const ytId = btn.dataset.play;
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?rel=0&autoplay=1`;
      iframe.title = "Pemutar video YouTube";
      iframe.setAttribute("allow", "accelerate-encoded-media; autoplay; encrypted-media; picture-in-picture");
      iframe.setAttribute("allowfullscreen", "");
      iframe.loading = "lazy";
      slide.innerHTML = "";
      slide.appendChild(iframe);
      clearInterval(timer); // stop autorotate once user starts watching
    });

    // Keyboard support
    $("#videoCarousel").addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") { goTo(active - 1); resetAutoplay(); }
      if (e.key === "ArrowRight") { goTo(active + 1); resetAutoplay(); }
    });

    // Swipe support
    let touchX = null;
    viewport.addEventListener("touchstart", (e) => (touchX = e.touches[0].clientX), { passive: true });
    viewport.addEventListener(
      "touchend",
      (e) => {
        if (touchX === null) return;
        const dx = e.changedTouches[0].clientX - touchX;
        if (Math.abs(dx) > 40) { goTo(active + (dx < 0 ? 1 : -1)); resetAutoplay(); }
        touchX = null;
      },
      { passive: true }
    );

    // Pause autoplay on hover/focus
    const carousel = $("#videoCarousel");
    carousel.addEventListener("mouseenter", () => clearInterval(timer));
    carousel.addEventListener("mouseleave", resetAutoplay);

    resetAutoplay();
  }

  /* ==========================================================================
     Articles / materi
     ========================================================================== */
  function initArticles(articles) {
    const grid = $("#articleGrid");
    const filterBar = $("#filterBar");
    if (!grid || !articles?.length) return;

    const tags = ["all", ...new Set(articles.map((a) => a.tag))];
    filterBar.innerHTML = tags
      .map((t) => `<button class="filter-btn${t === "all" ? " is-active" : ""}" data-filter="${t}">${t === "all" ? "Semua" : t}</button>`)
      .join("");

    function cardHTML(a) {
      return `
      <article class="article-card" data-tag="${a.tag}" data-id="${a.id}">
        <div class="article-thumb">
          <span class="article-level">${a.level}</span>
          <img src="${a.image}" alt="Ilustrasi materi: ${a.title}" loading="lazy" />
        </div>
        <div class="article-body">
          <div class="article-meta"><span class="tag">${a.tag}</span><span>${a.readTime} baca</span></div>
          <h3>${a.title}</h3>
          <p class="excerpt">${a.excerpt}</p>
          <p class="full">${a.content}</p>
          <button class="article-toggle" type="button">
            <span class="toggle-label">Baca ringkasan</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 5l7 7-7 7"/></svg>
          </button>
          <span class="file-badge">${a.fileTag}</span>
        </div>
      </article>`;
    }

    function render(filter = "all") {
      const list = filter === "all" ? articles : articles.filter((a) => a.tag === filter);
      grid.innerHTML = list.map(cardHTML).join("") || `<p style="color:var(--text-secondary)">Belum ada materi untuk topik ini.</p>`;
    }
    render();

    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest(".filter-btn");
      if (!btn) return;
      $$(".filter-btn", filterBar).forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      render(btn.dataset.filter);
    });

    grid.addEventListener("click", (e) => {
      const toggle = e.target.closest(".article-toggle");
      if (!toggle) return;
      const card = toggle.closest(".article-card");
      const open = card.classList.toggle("is-open");
      toggle.querySelector(".toggle-label").textContent = open ? "Tutup ringkasan" : "Baca ringkasan";
    });

    // Footer topic links jump + pre-filter
    $$("[data-topic-link]").forEach((link) => {
      link.addEventListener("click", () => {
        const tag = link.dataset.topicLink;
        const btn = $(`.filter-btn[data-filter="${tag}"]`, filterBar);
        if (btn) btn.click();
      });
    });
  }

  /* ==========================================================================
     Roadmap
     ========================================================================== */
  function renderRoadmap(steps) {
    const wrap = $("#roadmapList");
    if (!wrap || !steps?.length) return;
    wrap.innerHTML = steps
      .map(
        (s) => `
      <div class="roadmap-item" data-reveal>
        <div class="roadmap-step">${s.step}</div>
        <div class="roadmap-file">${s.file}</div>
        <h3>${s.title}</h3>
        <p>${s.desc}</p>
      </div>`
      )
      .join("");
    initReveal();
  }

  /* ==========================================================================
     FAQ
     ========================================================================== */
  const FAQ_ITEMS = [
    { q: "Apakah semua materi di sini gratis?", a: "Ya. Video, artikel, dan diskusi di Silverhawk WebLearn terbuka gratis untuk siapa saja yang ingin belajar." },
    { q: "Saya masih pemula total, mulai dari mana?", a: "Ikuti urutan di bagian Roadmap: mulai dari struktur HTML, lanjut ke tampilan CSS, interaksi JavaScript, lalu data JSON." },
    { q: "Apakah komentar di ruang diskusi tersimpan permanen?", a: "Kalau sudah terhubung Supabase: ya, selama kamu mengklaim profil (klik foto profil → set password). Tanpa klaim, komentar otomatis hilang setelah 7 hari. Baca Peraturan diskusi di halaman komunitas." },
    { q: "Bagaimana cara membalas komentar?", a: "Tekan tombol Balas di bawah komentar. Reply mendukung maksimal 3 level kedalaman agar thread tetap rapi." },
    { q: "Apa itu klaim profil?", a: "Klik avatar pada komentar atas namamu, lalu set password dan pilih avatar. Setelah diklaim, komentarmu tidak dihapus otomatis dan avatar konsisten." },
    { q: "Bolehkah saya pakai proyek ini sebagai template belajar?", a: "Tentu. Silakan modifikasi struktur, data JSON, dan konten sesuai kebutuhan belajar atau portofoliomu." }
  ];
  function renderFAQ() {
    const wrap = $("#faqList");
    if (!wrap) return;
    wrap.innerHTML = FAQ_ITEMS.map(
      (f) => `<details class="faq-item"><summary>${f.q}</summary><p>${f.a}</p></details>`
    ).join("");
  }

  /* ==========================================================================
     Community comments — Supabase + localStorage
     Fitur: reply 3 level, klaim profil (password+avatar), hapus 7 hari,
     reaction 👍, realtime, peraturan diskusi
     ========================================================================== */
  function initComments(seedComments) {
    const list = $("#commentList");
    const form = $("#commentForm");
    if (!list || !form) return;

    const STORAGE_KEY = "shwl-comments-v2";
    const PROFILE_KEY = "shwl-profile-session";
    const REACT_KEY = "shwl-reactions";
    const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const MAX_DEPTH = 3;

    const url = window.SUPABASE_URL || "";
    const key = window.SUPABASE_ANON_KEY || "";
    const hasSupabase =
      typeof window.supabase !== "undefined" &&
      url &&
      key &&
      !url.includes("YOUR_PROJECT") &&
      !key.includes("YOUR_ANON") &&
      key.length > 10;

    let client = null;
    if (hasSupabase) {
      try {
        client = window.supabase.createClient(url, key);
        console.info("[silverhawk] Supabase aktif.");
      } catch (err) {
        console.warn("[silverhawk] Gagal init Supabase:", err);
      }
    }

    /* ---- helpers ---- */
    function avatarUrl(seed) {
      return `https://i.pravatar.cc/64?img=${seed || "1"}`;
    }

    function formatTime(isoOrLabel) {
      if (!isoOrLabel) return "baru saja";
      if (typeof isoOrLabel === "string" && !isoOrLabel.includes("T") && isNaN(Date.parse(isoOrLabel))) {
        return isoOrLabel;
      }
      const d = new Date(isoOrLabel);
      if (isNaN(d.getTime())) return "baru saja";
      const diff = (Date.now() - d.getTime()) / 1000;
      if (diff < 60) return "baru saja";
      if (diff < 3600) return Math.floor(diff / 60) + " mnt";
      if (diff < 86400) return Math.floor(diff / 3600) + " jam";
      if (diff < 604800) return Math.floor(diff / 86400) + " hr";
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    }

    function escapeHtml(str) {
      return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    async function sha256(text) {
      const data = new TextEncoder().encode(text);
      const buf = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }

    function getSession() {
      try {
        return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null");
      } catch {
        return null;
      }
    }

    function setSession(session) {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(session));
    }

    function getReactions() {
      try {
        return JSON.parse(localStorage.getItem(REACT_KEY) || "{}");
      } catch {
        return {};
      }
    }

    function saveReactions(map) {
      localStorage.setItem(REACT_KEY, JSON.stringify(map));
    }

    function normalize(c) {
      return {
        id: c.id || c.localId || null,
        name: c.name,
        topic: c.topic || "",
        message: c.message,
        avatarSeed: String(c.avatar_seed || c.avatarSeed || "1"),
        time: c.created_at || c.time || new Date().toISOString(),
        parentId: c.parent_id || c.parentId || null,
        depth: Number(c.depth || 0),
        isClaimed: !!(c.is_claimed || c.isClaimed),
        likes: Number(c.likes || 0)
      };
    }

    /* ---- 7-day policy: hide unclaimed old comments ---- */
    function isExpired(c) {
      if (c.isClaimed) return false;
      const t = new Date(c.time).getTime();
      if (isNaN(t)) return false;
      return Date.now() - t > WEEK_MS;
    }

    function daysLeft(c) {
      if (c.isClaimed) return null;
      const t = new Date(c.time).getTime();
      if (isNaN(t)) return null;
      const left = WEEK_MS - (Date.now() - t);
      if (left <= 0) return 0;
      return Math.ceil(left / (24 * 60 * 60 * 1000));
    }

    /* ---- tree flatten for render (depth-first) ---- */
    function buildTree(flat) {
      const byId = new Map();
      const roots = [];
      flat.forEach((c) => {
        const n = { ...c, children: [] };
        if (c.id) byId.set(c.id, n);
      });
      flat.forEach((c) => {
        const n = c.id ? byId.get(c.id) : { ...c, children: [] };
        if (c.parentId && byId.has(c.parentId)) {
          byId.get(c.parentId).children.push(n);
        } else if (!c.parentId) {
          roots.push(n);
        } else {
          roots.push(n); // orphan → treat as root
        }
      });
      // local-only items without id
      flat.forEach((c) => {
        if (!c.id && !c.parentId) {
          if (!roots.find((r) => r === c || (r.localId && r.localId === c.localId))) {
            roots.push({ ...c, children: [] });
          }
        }
      });
      return roots;
    }

    function flattenTree(nodes, acc = []) {
      nodes.forEach((n) => {
        acc.push(n);
        if (n.children && n.children.length) flattenTree(n.children, acc);
      });
      return acc;
    }

    let comments = [];
    let replyToId = null;

    function visibleComments() {
      return comments.filter((c) => !isExpired(c));
    }

    function render() {
      const visible = visibleComments();
      const tree = buildTree(visible);
      const ordered = flattenTree(tree);
      const reactions = getReactions();
      const countEl = $("#commentCount");
      if (countEl) countEl.textContent = `${ordered.length} komentar`;

      list.innerHTML = ordered
        .map((c) => {
          const depth = Math.min(c.depth || 0, MAX_DEPTH);
          const left = daysLeft(c);
          const liked = !!(c.id && reactions[c.id]);
          const likeCount = (c.likes || 0) + (liked && !c._likedRemote ? 1 : 0);
          const canReply = depth < MAX_DEPTH;
          return `
        <div class="comment comment--depth-${depth}" data-id="${escapeHtml(c.id || "")}">
          <button type="button" class="comment-avatar-btn ${c.isClaimed ? "is-claimed" : ""}" data-claim-name="${escapeHtml(c.name)}" data-claim-seed="${escapeHtml(c.avatarSeed)}" title="Klik untuk klaim / edit profil">
            <img src="${avatarUrl(c.avatarSeed)}" alt="Avatar ${escapeHtml(c.name)}" loading="lazy" width="38" height="38" />
            ${c.isClaimed ? '<span class="claimed-badge" title="Profil diklaim">✓</span>' : ""}
          </button>
          <div class="comment-content">
            <div class="comment-head">
              <b>${escapeHtml(c.name)}</b>
              <span class="meta">
                ${c.topic ? `<span>#${escapeHtml(c.topic)}</span>` : ""}
                <span>${formatTime(c.time)}</span>
              </span>
            </div>
            <p>${escapeHtml(c.message)}</p>
            ${
              left !== null && left <= 3
                ? `<div class="comment-expiring">⏳ ${left === 0 ? "Akan dihapus segera" : "Sisa " + left + " hari"} — klaim profil agar tidak hilang</div>`
                : ""
            }
            <div class="comment-actions">
              <button type="button" class="btn-like ${liked ? "reacted" : ""}" data-like-id="${escapeHtml(c.id || "")}" ${c.id ? "" : "disabled"}>👍 ${likeCount || ""}</button>
              ${canReply && c.id ? `<button type="button" class="btn-reply" data-reply-id="${escapeHtml(c.id)}" data-reply-name="${escapeHtml(c.name)}">Balas</button>` : ""}
            </div>
            <div class="reply-slot" data-slot-for="${escapeHtml(c.id || "")}"></div>
          </div>
        </div>`;
        })
        .join("");

      // restore open reply box if any
      if (replyToId) {
        const slot = list.querySelector(`[data-slot-for="${CSS.escape(replyToId)}"]`);
        if (slot) openReplyBox(slot, replyToId);
      }
    }

    function openReplyBox(slot, parentId) {
      const parent = comments.find((c) => c.id === parentId);
      if (!parent) return;
      const depth = (parent.depth || 0) + 1;
      if (depth > MAX_DEPTH) return;
      slot.innerHTML = `
        <div class="reply-box">
          <textarea placeholder="Balas ${escapeHtml(parent.name)}…" maxlength="400" id="replyText"></textarea>
          <div class="reply-box-actions">
            <button type="button" class="btn btn-ghost btn-sm" id="replyCancel">Batal</button>
            <button type="button" class="btn btn-primary btn-sm" id="replySend">Kirim balasan</button>
          </div>
        </div>`;
      const ta = slot.querySelector("#replyText");
      if (ta) ta.focus();
      slot.querySelector("#replyCancel")?.addEventListener("click", () => {
        replyToId = null;
        slot.innerHTML = "";
      });
      slot.querySelector("#replySend")?.addEventListener("click", async () => {
        const message = (ta?.value || "").trim();
        const name = ($("#commentName")?.value || "").trim() || "Anonim";
        if (!message) return;
        await postComment({ name, topic: "", message, parentId, depth });
        replyToId = null;
      });
    }

    /* ---- load / save ---- */
    async function loadFromSupabase() {
      const { data, error } = await client
        .from("comments")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) {
        console.warn("[supabase] load gagal:", error.message);
        return null;
      }
      return (data || []).map(normalize);
    }

    function loadLocal() {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      if (stored) return stored.map(normalize);
      return (seedComments || []).map((c) =>
        normalize({
          ...c,
          localId: "seed-" + (c.name || "x") + Math.random(),
          avatarSeed: c.avatarSeed || "1",
          time: c.time || new Date().toISOString()
        })
      );
    }

    function saveLocal() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
    }

    async function postComment({ name, topic, message, parentId = null, depth = 0 }) {
      const session = getSession();
      let avatarSeed = String(Math.floor(Math.random() * 70) + 1);
      let isClaimed = false;
      if (session && session.name.toLowerCase() === name.toLowerCase()) {
        avatarSeed = session.avatarSeed;
        isClaimed = true;
      }

      if (client) {
        const row = {
          name,
          topic: topic || null,
          message,
          avatar_seed: avatarSeed,
          parent_id: parentId,
          depth,
          is_claimed: isClaimed,
          likes: 0
        };
        const { data, error } = await client.from("comments").insert([row]).select();
        if (error) {
          console.error("[supabase] insert:", error.message);
          alert("Gagal mengirim: " + error.message);
          return;
        }
        if (data && data[0]) {
          // realtime may also push; avoid dup
          if (!comments.find((c) => c.id === data[0].id)) {
            comments.push(normalize(data[0]));
            render();
          }
        }
      } else {
        comments.push(
          normalize({
            localId: "local-" + Date.now(),
            name,
            topic,
            message,
            avatarSeed,
            time: new Date().toISOString(),
            parentId,
            depth,
            isClaimed
          })
        );
        saveLocal();
        render();
      }
    }

    /* ---- events ---- */
    list.addEventListener("click", (e) => {
      const avatarBtn = e.target.closest("[data-claim-name]");
      if (avatarBtn) {
        openProfileModal(avatarBtn.dataset.claimName, avatarBtn.dataset.claimSeed);
        return;
      }
      const replyBtn = e.target.closest("[data-reply-id]");
      if (replyBtn) {
        replyToId = replyBtn.dataset.replyId;
        render();
        return;
      }
      const likeBtn = e.target.closest("[data-like-id]");
      if (likeBtn && likeBtn.dataset.likeId) {
        toggleLike(likeBtn.dataset.likeId);
      }
    });

    async function toggleLike(id) {
      const reactions = getReactions();
      const c = comments.find((x) => x.id === id);
      if (!c) return;
      if (reactions[id]) {
        delete reactions[id];
        c.likes = Math.max(0, (c.likes || 0) - 1);
      } else {
        reactions[id] = true;
        c.likes = (c.likes || 0) + 1;
      }
      saveReactions(reactions);
      if (client) {
        await client.from("comments").update({ likes: c.likes }).eq("id", id);
      } else {
        saveLocal();
      }
      render();
    }

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = $("#commentName").value.trim();
      const topic = $("#commentTopic").value.trim();
      const message = $("#commentMessage").value.trim();
      if (!name || !message) return;
      await postComment({ name, topic, message, parentId: null, depth: 0 });
      form.reset();
      const cc = $("#charCount");
      if (cc) cc.textContent = "0 / 400";
    });

    const msgArea = $("#commentMessage");
    if (msgArea) {
      msgArea.addEventListener("input", () => {
        const cc = $("#charCount");
        if (cc) cc.textContent = `${msgArea.value.length} / 400`;
      });
    }

    /* ---- rules toggle ---- */
    const rulesToggle = $("#rulesToggle");
    const rulesPanel = $("#rulesPanel");
    if (rulesToggle && rulesPanel) {
      rulesToggle.addEventListener("click", () => {
        const open = rulesToggle.getAttribute("aria-expanded") === "true";
        rulesToggle.setAttribute("aria-expanded", String(!open));
        rulesPanel.hidden = open;
      });
    }

    /* ---- profile modal ---- */
    const modal = $("#profileModal");
    const profileForm = $("#profileForm");
    let selectedSeed = "1";

    function openProfileModal(name, seed) {
      if (!modal) return;
      $("#profileName").value = name;
      selectedSeed = seed || "1";
      $("#profilePassword").value = "";
      $("#profilePassword2").value = "";
      const err = $("#profileError");
      if (err) {
        err.hidden = true;
        err.textContent = "";
      }
      buildAvatarGrid(selectedSeed);
      modal.hidden = false;
    }

    function closeProfileModal() {
      if (modal) modal.hidden = true;
    }

    function buildAvatarGrid(current) {
      const grid = $("#avatarGrid");
      if (!grid) return;
      const seeds = [];
      for (let i = 1; i <= 15; i++) seeds.push(String(i));
      // include current if outside range
      if (current && !seeds.includes(String(current))) seeds.unshift(String(current));
      grid.innerHTML = seeds
        .map(
          (s) => `
        <button type="button" class="${s === String(current) ? "is-selected" : ""}" data-seed="${s}" aria-label="Avatar ${s}">
          <img src="${avatarUrl(s)}" alt="" width="48" height="48" loading="lazy" />
        </button>`
        )
        .join("");
      grid.querySelectorAll("[data-seed]").forEach((btn) => {
        btn.addEventListener("click", () => {
          selectedSeed = btn.dataset.seed;
          grid.querySelectorAll("button").forEach((b) => b.classList.toggle("is-selected", b === btn));
        });
      });
    }

    $("#profileModalClose")?.addEventListener("click", closeProfileModal);
    modal?.addEventListener("click", (e) => {
      if (e.target === modal) closeProfileModal();
    });

    profileForm?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = $("#profileName").value.trim();
      const pass = $("#profilePassword").value;
      const pass2 = $("#profilePassword2").value;
      const err = $("#profileError");
      if (pass.length < 4) {
        err.hidden = false;
        err.textContent = "Password minimal 4 karakter.";
        return;
      }
      if (pass !== pass2) {
        err.hidden = false;
        err.textContent = "Konfirmasi password tidak sama.";
        return;
      }
      const hash = await sha256(name.toLowerCase() + ":" + pass);

      if (client) {
        // upsert profile
        const { error: pErr } = await client.from("profiles").upsert(
          {
            name,
            password_hash: hash,
            avatar_seed: selectedSeed
          },
          { onConflict: "name" }
        );
        if (pErr) {
          // table maybe missing — still claim locally + update comments
          console.warn("[supabase] profiles:", pErr.message);
        }
        // mark existing comments by this name as claimed + update avatar
        await client
          .from("comments")
          .update({ is_claimed: true, avatar_seed: selectedSeed })
          .ilike("name", name);
      }

      // update local state
      comments.forEach((c) => {
        if (c.name.toLowerCase() === name.toLowerCase()) {
          c.isClaimed = true;
          c.avatarSeed = selectedSeed;
        }
      });
      if (!client) saveLocal();

      setSession({ name, avatarSeed: selectedSeed, hash });
      // prefill form name
      const nameInput = $("#commentName");
      if (nameInput) nameInput.value = name;

      closeProfileModal();
      render();
      alert("Profil berhasil diklaim! Komentarmu tidak akan dihapus otomatis.");
    });

    /* ---- boot ---- */
    async function bootComments() {
      if (client) {
        const remote = await loadFromSupabase();
        comments = remote !== null ? remote : loadLocal();
      } else {
        comments = loadLocal();
      }
      // purge expired from local store
      comments = comments.filter((c) => !isExpired(c));
      if (!client) saveLocal();
      render();

      if (client) {
        client
          .channel("public:comments")
          .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" }, (payload) => {
            const n = normalize(payload.new);
            if (!comments.find((c) => c.id === n.id)) {
              comments.push(n);
              render();
            }
          })
          .on("postgres_changes", { event: "UPDATE", schema: "public", table: "comments" }, (payload) => {
            const n = normalize(payload.new);
            const idx = comments.findIndex((c) => c.id === n.id);
            if (idx >= 0) {
              comments[idx] = n;
              render();
            }
          })
          .subscribe();
      }

      // restore session name into form
      const session = getSession();
      if (session?.name && $("#commentName")) {
        $("#commentName").value = session.name;
      }
    }

    bootComments();
  }

  /* ==========================================================================
     Newsletter (front-end demo)
     ========================================================================== */
  function initNewsletter() {
    const form = $("#newsletterForm");
    const msg = $("#newsletterMsg");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = $("#newsletterEmail").value.trim();
      if (!email) return;
      msg.textContent = `Tersimpan secara lokal: ${email} — terima kasih sudah bergabung!`;
      form.reset();
    });
  }

  /* ==========================================================================
     Misc
     ========================================================================== */
  function initMisc(brand) {
    $("#year").textContent = new Date().getFullYear();
    if (brand?.description) $("#heroTagline").textContent = brand.description;

    // Duplicate marquee content once so the loop is seamless
    const track = $("#marqueeTrack");
    if (track) track.innerHTML += track.innerHTML;
  }

  /* ==========================================================================
     Boot
     ========================================================================== */
  async function boot() {
    initTheme();
    initNav();
    initScrollUI();
    renderFAQ();
    initNewsletter();

    const [videos, articles, site] = await Promise.all([
      loadJSON("data/videos.json", FALLBACK.videos),
      loadJSON("data/articles.json", FALLBACK.articles),
      loadJSON("data/site.json", FALLBACK.site)
    ]);

    initMisc(site.brand);
    renderStats(site.stats);
    initCarousel(videos);
    initArticles(articles);
    renderRoadmap(site.roadmap);
    initComments(site.comments);
    initReveal();
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
