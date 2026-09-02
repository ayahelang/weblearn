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
    { q: "Apakah komentar di ruang diskusi tersimpan permanen?", a: "Untuk versi statis GitHub Pages ini, komentar disimpan lokal di browser kamu (localStorage) sebagai demo. Belum terhubung ke server bersama." },
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
     Community comments (localStorage demo)
     ========================================================================== */
  function initComments(seedComments) {
    const list = $("#commentList");
    const form = $("#commentForm");
    if (!list || !form) return;

    const STORAGE_KEY = "shwl-comments";
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    let comments = stored || (seedComments || []).map((c) => ({ ...c, avatarSeed: c.avatarSeed }));

    function avatarUrl(seed) {
      return `https://i.pravatar.cc/64?img=${seed}`;
    }

    function render() {
      list.innerHTML = comments
        .map(
          (c) => `
        <div class="comment">
          <img src="${avatarUrl(c.avatarSeed)}" alt="Avatar ${c.name}" loading="lazy" />
          <div class="comment-content">
            <div class="comment-head"><b>${c.name}</b><span>${c.time}</span></div>
            <p>${c.topic ? `<strong>#${c.topic}</strong> — ` : ""}${c.message}</p>
          </div>
        </div>`
        )
        .join("");
      list.scrollTop = list.scrollHeight;
    }
    render();

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = $("#commentName").value.trim();
      const topic = $("#commentTopic").value.trim();
      const message = $("#commentMessage").value.trim();
      if (!name || !message) return;

      comments.push({
        name,
        topic,
        message,
        time: "baru saja",
        avatarSeed: String(Math.floor(Math.random() * 70) + 1)
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(comments));
      render();
      form.reset();
    });
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
