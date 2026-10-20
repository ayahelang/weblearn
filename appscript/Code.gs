/**
 * Silverhawk WebLearn — SDLC Backend (Google Apps Script)
 * ========================================================
 *
 * SETUP SEKALI SAJA:
 * 1. Buka https://script.google.com → New project (atau buka project yang sudah ada)
 * 2. Hapus kode default, paste SELURUH isi file ini
 * 3. Simpan (Ctrl+S), nama project bebas mis. "WebLearn SDLC Backend"
 * 4. Pilih fungsi initialSetup di dropdown → klik Run → Authorize
 * 5. Deploy → New deployment → Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    Salin Web App URL
 * 6. URL itu harus sama dengan yang di js/config-sdlc.js (sudah diisi di zip ini)
 *
 * KEAMANAN:
 * - Password admin hanya di Script Properties (default: Bismillaah)
 * - Jangan commit password ke GitHub
 *
 * Sheet dibuat OTOMATIS: Visitors, QuizResults, Quizzes, Content, AdminTokens
 */

const SHEETS = {
  VISITORS: "Visitors",
  QUIZ_RESULTS: "QuizResults",
  QUIZZES: "Quizzes",
  CONTENT: "Content",
  TOKENS: "AdminTokens"
};

/** SETUP AWAL — jalankan sekali manual dari editor */
function initialSetup() {
  const props = PropertiesService.getScriptProperties();

  if (!props.getProperty("ADMIN_PASSWORD")) {
    props.setProperty("ADMIN_PASSWORD", "Bismillaah");
  }
  if (!props.getProperty("API_SECRET")) {
    props.setProperty("API_SECRET", Utilities.getUuid());
  }

  let ss;
  const existingId = props.getProperty("SPREADSHEET_ID");
  if (existingId) {
    try {
      ss = SpreadsheetApp.openById(existingId);
    } catch (e) {
      ss = SpreadsheetApp.create("WebLearn SDLC Database");
      props.setProperty("SPREADSHEET_ID", ss.getId());
    }
  } else {
    ss = SpreadsheetApp.create("WebLearn SDLC Database");
    props.setProperty("SPREADSHEET_ID", ss.getId());
  }

  ensureSheets(ss);

  Logger.log("✅ Setup selesai!");
  Logger.log("Spreadsheet ID: " + ss.getId());
  Logger.log("Spreadsheet URL: " + ss.getUrl());
  Logger.log("Password admin ada di Script Properties (ADMIN_PASSWORD).");
  Logger.log("Lanjut: Deploy sebagai Web App (Anyone).");
}

function ensureSheets(ss) {
  let sh = getOrCreateSheet(ss, SHEETS.VISITORS);
  ensureHeaders(sh, ["Timestamp", "Page", "UserAgent", "IP"]);

  sh = getOrCreateSheet(ss, SHEETS.QUIZ_RESULTS);
  ensureHeaders(sh, ["Timestamp", "Score", "Total", "Percentage"]);

  sh = getOrCreateSheet(ss, SHEETS.QUIZZES);
  ensureHeaders(sh, ["ID", "Question", "OptionA", "OptionB", "OptionC", "OptionD", "Correct", "Explanation"]);

  sh = getOrCreateSheet(ss, SHEETS.CONTENT);
  ensureHeaders(sh, ["ID", "Type", "Title", "DataJSON", "UpdatedAt"]);

  sh = getOrCreateSheet(ss, SHEETS.TOKENS);
  ensureHeaders(sh, ["Token", "CreatedAt", "ExpiresAt"]);
}

function getOrCreateSheet(ss, name) {
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

function ensureHeaders(sheet, headers) {
  const range = sheet.getRange(1, 1, 1, headers.length);
  const existing = range.getValues()[0];
  const needsHeader = existing.every(function (cell) {
    return cell === "" || cell === null;
  });
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
    throw new Error("Spreadsheet belum di-setup. Jalankan initialSetup() dulu dari editor Apps Script.");
  }
  return SpreadsheetApp.openById(id);
}

function doGet(e) {
  return respond({
    success: true,
    message: "WebLearn SDLC API is running. Use POST for actions.",
    time: new Date().toISOString()
  });
}

function doPost(e) {
  try {
    var raw = (e && e.postData && e.postData.contents) ? e.postData.contents : "{}";
    var body = {};
    try {
      body = JSON.parse(raw);
    } catch (parseErr) {
      // kadang form-urlencoded / text aneh
      body = { action: "unknown", raw: String(raw).substring(0, 200) };
    }

    var action = body.action || "";

    // Auto-heal: pastikan sheet ada setiap request (aman jika initialSetup sudah jalan)
    var ss = getSpreadsheet();
    ensureSheets(ss);

    switch (action) {
      case "login":
        return handleLogin(body);
      case "logVisitor":
        return handleLogVisitor(body, ss);
      case "saveQuizResult":
      case "saveScore": // alias agar kompatibel
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
      case "ping":
        return respond({ success: true, message: "pong", time: new Date().toISOString() });
      default:
        return respond({ success: false, message: "Unknown action: " + action });
    }
  } catch (err) {
    return respond({ success: false, message: err.message || String(err) });
  }
}

function respond(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function handleLogin(body) {
  var props = PropertiesService.getScriptProperties();
  var stored = props.getProperty("ADMIN_PASSWORD");
  if (!stored) {
    return respond({ success: false, message: "Admin password belum di-set. Jalankan initialSetup()." });
  }
  if (body.password !== stored) {
    return respond({ success: false, message: "Password salah." });
  }

  var token = Utilities.getUuid() + "-" + Utilities.getUuid();
  var ss = getSpreadsheet();
  var sh = ss.getSheetByName(SHEETS.TOKENS);
  var now = new Date();
  var expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  sh.appendRow([token, now.toISOString(), expires.toISOString()]);
  cleanupExpiredTokens(sh);
  return respond({ success: true, token: token });
}

function isValidToken(token) {
  if (!token) return false;
  var ss = getSpreadsheet();
  var sh = ss.getSheetByName(SHEETS.TOKENS);
  var data = sh.getDataRange().getValues();
  var now = new Date();
  for (var i = 1; i < data.length; i++) {
    if (data[i][0] === token) {
      return new Date(data[i][2]) > now;
    }
  }
  return false;
}

function cleanupExpiredTokens(sh) {
  var data = sh.getDataRange().getValues();
  var now = new Date();
  for (var i = data.length - 1; i >= 1; i--) {
    if (new Date(data[i][2]) <= now) {
      sh.deleteRow(i + 1);
    }
  }
}

function handleLogVisitor(body, ss) {
  var sh = ss.getSheetByName(SHEETS.VISITORS);
  sh.appendRow([
    new Date().toISOString(),
    body.page || "unknown",
    String(body.userAgent || "").substring(0, 250),
    ""
  ]);
  return respond({ success: true, saved: "visitor" });
}

function handleSaveQuizResult(body, ss) {
  var score = Number(body.score) || 0;
  var total = Number(body.total) || 0;
  var percentage = body.percentage != null ? Number(body.percentage) : (total ? Math.round((score / total) * 100) : 0);
  var sh = ss.getSheetByName(SHEETS.QUIZ_RESULTS);
  sh.appendRow([new Date().toISOString(), score, total, percentage]);
  return respond({ success: true, saved: "quiz", score: score, total: total, percentage: percentage });
}

function handleGetStats(body, ss) {
  if (!isValidToken(body.token)) {
    return respond({ success: false, message: "Token tidak valid atau expired. Login ulang." });
  }
  var visitorsSh = ss.getSheetByName(SHEETS.VISITORS);
  var quizSh = ss.getSheetByName(SHEETS.QUIZ_RESULTS);
  var visitorCount = Math.max(0, visitorsSh.getLastRow() - 1);
  var quizCount = Math.max(0, quizSh.getLastRow() - 1);
  var avgScore = null;
  if (quizCount > 0) {
    var scores = quizSh.getRange(2, 4, quizCount, 1).getValues().flat().filter(function (n) {
      return typeof n === "number";
    });
    if (scores.length) {
      avgScore = Math.round(scores.reduce(function (a, b) { return a + b; }, 0) / scores.length);
    }
  }
  var visitors = [];
  if (visitorCount > 0) {
    var start = Math.max(2, visitorsSh.getLastRow() - 29);
    var rows = visitorsSh.getRange(start, 1, visitorsSh.getLastRow() - start + 1, 3).getValues();
    rows.reverse().forEach(function (r) {
      visitors.push({ timestamp: r[0], page: r[1], userAgent: r[2] });
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

function handleSaveQuizzes(body, ss) {
  if (!isValidToken(body.token)) {
    return respond({ success: false, message: "Token tidak valid." });
  }
  var quizzes = body.quizzes || [];
  var sh = ss.getSheetByName(SHEETS.QUIZZES);
  if (sh.getLastRow() > 1) {
    sh.getRange(2, 1, sh.getLastRow() - 1, 8).clearContent();
  }
  quizzes.forEach(function (q, idx) {
    var opts = q.options || [];
    sh.appendRow([
      q.id || idx + 1,
      q.question || "",
      opts[0] || "",
      opts[1] || "",
      opts[2] || "",
      opts[3] || "",
      q.correct != null ? q.correct : "",
      q.explanation || ""
    ]);
  });
  return respond({ success: true, count: quizzes.length });
}

function handleGetQuizzes(ss) {
  var sh = ss.getSheetByName(SHEETS.QUIZZES);
  var data = sh.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][1]) continue;
    list.push({
      id: data[i][0],
      question: data[i][1],
      options: [data[i][2], data[i][3], data[i][4], data[i][5]],
      correct: data[i][6],
      explanation: data[i][7]
    });
  }
  return respond({ success: true, quizzes: list });
}

function handleSaveContent(body, ss) {
  if (!isValidToken(body.token)) {
    return respond({ success: false, message: "Token tidak valid." });
  }
  var sh = ss.getSheetByName(SHEETS.CONTENT);
  sh.appendRow([
    body.id || Utilities.getUuid(),
    body.type || "general",
    body.title || "",
    typeof body.data === "string" ? body.data : JSON.stringify(body.data || {}),
    new Date().toISOString()
  ]);
  return respond({ success: true });
}

function handleGetContent(ss) {
  var sh = ss.getSheetByName(SHEETS.CONTENT);
  var data = sh.getDataRange().getValues();
  var list = [];
  for (var i = 1; i < data.length; i++) {
    list.push({
      id: data[i][0],
      type: data[i][1],
      title: data[i][2],
      data: data[i][3],
      updatedAt: data[i][4]
    });
  }
  return respond({ success: true, content: list });
}
