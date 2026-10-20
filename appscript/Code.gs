/**
 * SDLC Notes - Google Apps Script Backend
 * ========================================
 * 
 * INSTRUKSI SETUP (SEKALI SAJA):
 * 1. Buka https://script.google.com → New project
 * 2. Hapus kode default, paste SELURUH isi file ini
 * 3. Simpan project (Ctrl+S), beri nama "SDLC Notes Backend"
 * 4. Jalankan fungsi `initialSetup` sekali:
 *    - Pilih fungsi initialSetup di dropdown
 *    - Klik Run
 *    - Authorize (izin akses Spreadsheet & Script)
 * 5. Setelah berhasil, password admin otomatis disimpan di Script Properties.
 * 6. Deploy:
 *    - Deploy → New deployment
 *    - Type: Web app
 *    - Description: SDLC Notes API
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Deploy → Copy Web App URL
 * 7. Paste URL tersebut ke file js/config.js (APPS_SCRIPT_URL)
 *    dan set USE_BACKEND = true
 * 
 * PENTING KEAMANAN:
 * - Password admin disimpan di Script Properties, BUKAN di kode / GitHub.
 * - Token admin di-generate sementara (berlaku per sesi).
 * - Sheet & header dibuat OTOMATIS — Anda tidak perlu menyentuh Google Sheet manual.
 */

// Nama sheet (otomatis dibuat)
const SHEETS = {
  VISITORS: "Visitors",
  QUIZ_RESULTS: "QuizResults",
  QUIZZES: "Quizzes",
  CONTENT: "Content",
  TOKENS: "AdminTokens"
};

/**
 * SETUP AWAL — jalankan sekali manual dari editor
 */
function initialSetup() {
  const props = PropertiesService.getScriptProperties();
  
  // Set password admin (ganti jika ingin password lain)
  // Password default sesuai permintaan: Bismillaah
  props.setProperty("ADMIN_PASSWORD", "Bismillaah");
  
  // Optional: secret untuk validasi tambahan
  props.setProperty("API_SECRET", Utilities.getUuid());
  
  // Buat spreadsheet terikat (atau gunakan yang sudah ada)
  let ss;
  const existingId = props.getProperty("SPREADSHEET_ID");
  if (existingId) {
    try {
      ss = SpreadsheetApp.openById(existingId);
    } catch (e) {
      ss = SpreadsheetApp.create("SDLC Notes Database");
      props.setProperty("SPREADSHEET_ID", ss.getId());
    }
  } else {
    ss = SpreadsheetApp.create("SDLC Notes Database");
    props.setProperty("SPREADSHEET_ID", ss.getId());
  }
  
  // Pastikan semua sheet & header ada
  ensureSheets(ss);
  
  Logger.log("✅ Setup selesai!");
  Logger.log("Spreadsheet ID: " + ss.getId());
  Logger.log("Spreadsheet URL: " + ss.getUrl());
  Logger.log("Password admin sudah disimpan di Script Properties.");
  Logger.log("Sekarang deploy sebagai Web App.");
}

/**
 * Pastikan sheet dan header ada (otomatis)
 */
function ensureSheets(ss) {
  // Visitors
  let sh = getOrCreateSheet(ss, SHEETS.VISITORS);
  ensureHeaders(sh, ["Timestamp", "Page", "UserAgent", "IP"]);
  
  // Quiz Results
  sh = getOrCreateSheet(ss, SHEETS.QUIZ_RESULTS);
  ensureHeaders(sh, ["Timestamp", "Score", "Total", "Percentage"]);
  
  // Quizzes bank (opsional sync dari frontend)
  sh = getOrCreateSheet(ss, SHEETS.QUIZZES);
  ensureHeaders(sh, ["ID", "Question", "OptionA", "OptionB", "OptionC", "OptionD", "Correct", "Explanation"]);
  
  // Content (opsional)
  sh = getOrCreateSheet(ss, SHEETS.CONTENT);
  ensureHeaders(sh, ["ID", "Type", "Title", "DataJSON", "UpdatedAt"]);
  
  // Tokens (simple session)
  sh = getOrCreateSheet(ss, SHEETS.TOKENS);
  ensureHeaders(sh, ["Token", "CreatedAt", "ExpiresAt"]);
}

function getOrCreateSheet(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
  }
  return sh;
}

function ensureHeaders(sheet, headers) {
  const range = sheet.getRange(1, 1, 1, headers.length);
  const existing = range.getValues()[0];
  const needsHeader = existing.every(cell => cell === "" || cell === null);
  if (needsHeader) {
    range.setValues([headers]);
    range.setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

function getSpreadsheet() {
  const props = PropertiesService.getScriptProperties();
  const id = props.getProperty("SPREADSHEET_ID");
  if (!id) {
    throw new Error("Spreadsheet belum di-setup. Jalankan initialSetup() dulu.");
  }
  return SpreadsheetApp.openById(id);
}

/**
 * Web App entry points
 */
function doGet(e) {
  return respond({ success: true, message: "SDLC Notes API is running. Use POST for actions." });
}

function doPost(e) {
  try {
    const body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
    const action = body.action || "";
    
    // Pastikan sheet siap (idempotent)
    const ss = getSpreadsheet();
    ensureSheets(ss);
    
    switch (action) {
      case "login":
        return handleLogin(body);
      case "logVisitor":
        return handleLogVisitor(body, ss);
      case "saveQuizResult":
        return handleSaveQuizResult(body, ss);
      case "getStats":
        return handleGetStats(body, ss);
      case "saveQuizzes":
        return handleSaveQuizzes(body, ss);
      case "getQuizzes":
        return handleGetQuizzes(ss);
      case "saveContent":
        return handleSaveContent(body, ss);
      case "getContent":
        return handleGetContent(ss);
      default:
        return respond({ success: false, message: "Unknown action: " + action });
    }
  } catch (err) {
    return respond({ success: false, message: err.message || String(err) });
  }
}

function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * LOGIN — password dicek dari Script Properties
 */
function handleLogin(body) {
  const props = PropertiesService.getScriptProperties();
  const stored = props.getProperty("ADMIN_PASSWORD");
  
  if (!stored) {
    return respond({ success: false, message: "Admin password belum di-set. Jalankan initialSetup()." });
  }
  
  if (body.password !== stored) {
    return respond({ success: false, message: "Password salah." });
  }
  
  // Generate simple token (berlaku 24 jam)
  const token = Utilities.getUuid() + "-" + Utilities.getUuid();
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.TOKENS);
  const now = new Date();
  const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  
  sh.appendRow([token, now.toISOString(), expires.toISOString()]);
  
  // Bersihkan token lama (opsional)
  cleanupExpiredTokens(sh);
  
  return respond({ success: true, token: token });
}

function isValidToken(token) {
  if (!token) return false;
  const ss = getSpreadsheet();
  const sh = ss.getSheetByName(SHEETS.TOKENS);
  const data = sh.getDataRange().getValues();
  const now = new Date();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === token) {
      const exp = new Date(data[i][2]);
      return exp > now;
    }
  }
  return false;
}

function cleanupExpiredTokens(sh) {
  const data = sh.getDataRange().getValues();
  const now = new Date();
  // Hapus dari bawah agar index tidak bergeser
  for (let i = data.length - 1; i >= 1; i--) {
    const exp = new Date(data[i][2]);
    if (exp <= now) {
      sh.deleteRow(i + 1);
    }
  }
}

/**
 * Log pengunjung
 */
function handleLogVisitor(body, ss) {
  const sh = ss.getSheetByName(SHEETS.VISITORS);
  sh.appendRow([
    new Date().toISOString(),
    body.page || "unknown",
    (body.userAgent || "").substring(0, 250),
    "" // IP tidak tersedia langsung di Apps Script web app sederhana
  ]);
  return respond({ success: true });
}

/**
 * Simpan hasil quiz
 */
function handleSaveQuizResult(body, ss) {
  const sh = ss.getSheetByName(SHEETS.QUIZ_RESULTS);
  sh.appendRow([
    new Date().toISOString(),
    body.score || 0,
    body.total || 0,
    body.percentage || 0
  ]);
  return respond({ success: true });
}

/**
 * Statistik untuk admin
 */
function handleGetStats(body, ss) {
  if (!isValidToken(body.token)) {
    return respond({ success: false, message: "Token tidak valid atau expired. Login ulang." });
  }
  
  const visitorsSh = ss.getSheetByName(SHEETS.VISITORS);
  const quizSh = ss.getSheetByName(SHEETS.QUIZ_RESULTS);
  
  const visitorCount = Math.max(0, visitorsSh.getLastRow() - 1);
  const quizCount = Math.max(0, quizSh.getLastRow() - 1);
  
  let avgScore = null;
  if (quizCount > 0) {
    const scores = quizSh.getRange(2, 4, quizCount, 1).getValues().flat().filter(n => typeof n === "number");
    if (scores.length) {
      avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    }
  }
  
  // Ambil 30 visitor terakhir
  const visitors = [];
  if (visitorCount > 0) {
    const start = Math.max(2, visitorsSh.getLastRow() - 29);
    const rows = visitorsSh.getRange(start, 1, visitorsSh.getLastRow() - start + 1, 3).getValues();
    rows.reverse().forEach(r => {
      visitors.push({
        timestamp: r[0],
        page: r[1],
        userAgent: r[2]
      });
    });
  }
  
  return respond({
    success: true,
    totalVisitors: visitorCount,
    totalQuizzes: quizCount,
    avgScore: avgScore,
    visitors: visitors
  });
}

/**
 * Simpan bank soal (dari admin)
 */
function handleSaveQuizzes(body, ss) {
  if (!isValidToken(body.token)) {
    return respond({ success: false, message: "Token tidak valid." });
  }
  
  const quizzes = body.quizzes || [];
  const sh = ss.getSheetByName(SHEETS.QUIZZES);
  
  // Clear existing data (keep header)
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
  }
  
  quizzes.forEach(q => {
    sh.appendRow([
      q.id,
      q.question,
      (q.options && q.options[0]) || "",
      (q.options && q.options[1]) || "",
      (q.options && q.options[2]) || "",
      (q.options && q.options[3]) || "",
      q.correct,
      q.explanation || ""
    ]);
  });
  
  return respond({ success: true, count: quizzes.length });
}

function handleGetQuizzes(ss) {
  const sh = ss.getSheetByName(SHEETS.QUIZZES);
  const data = sh.getDataRange().getValues();
  const quizzes = [];
  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[1]) continue;
    quizzes.push({
      id: r[0],
      question: r[1],
      options: [r[2], r[3], r[4], r[5]],
      correct: r[6],
      explanation: r[7] || ""
    });
  }
  return respond({ success: true, quizzes: quizzes });
}

/**
 * Simpan konten tahapan & peran (snapshot JSON)
 * Sheet Content: ID | Type | Title | DataJSON | UpdatedAt
 */
function handleSaveContent(body, ss) {
  if (!isValidToken(body.token)) {
    return respond({ success: false, message: "Token tidak valid atau expired. Login ulang." });
  }

  const sh = ss.getSheetByName(SHEETS.CONTENT);
  // Clear existing (keep header)
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, sh.getLastColumn()).clearContent();
  }

  const now = new Date().toISOString();
  const stages = body.stages || [];
  const roles = body.roles || [];

  stages.forEach(function (s) {
    sh.appendRow([
      "stage-" + s.id,
      "stage",
      s.title || "",
      JSON.stringify(s),
      now
    ]);
  });

  roles.forEach(function (r) {
    sh.appendRow([
      "role-" + r.id,
      "role",
      r.name || "",
      JSON.stringify(r),
      now
    ]);
  });

  return respond({
    success: true,
    stages: stages.length,
    roles: roles.length
  });
}

/**
 * Ambil konten yang tersimpan (untuk override data default frontend)
 */
function handleGetContent(ss) {
  const sh = ss.getSheetByName(SHEETS.CONTENT);
  const data = sh.getDataRange().getValues();
  const stages = [];
  const roles = [];

  for (let i = 1; i < data.length; i++) {
    const r = data[i];
    if (!r[3]) continue;
    try {
      const obj = JSON.parse(r[3]);
      if (r[1] === "stage") stages.push(obj);
      else if (r[1] === "role") roles.push(obj);
    } catch (e) {
      // skip invalid JSON
    }
  }

  return respond({
    success: true,
    stages: stages,
    roles: roles
  });
}
