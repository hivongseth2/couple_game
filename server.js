// ============================================================
//  Hai Đứa Mình — server: phục vụ trang web + socket realtime
//  Dữ liệu lưu thẳng vào data/db.json trên máy.
// ============================================================

const http = require("http");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");
const { Server } = require("socket.io");

const PORT = Number(process.env.PORT) || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(__dirname, "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const GAME_TITLES = { food: "Ăn gì", cafe: "Cà phê", todo: "Làm gì", budget: "Ngân sách" };
const MAX_MESSAGES = 1000;
const MAX_PEOPLE = 2;

// ---------- db (file JSON) ----------
let db = { rooms: {} };

function loadDb() {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
    if (!db || typeof db.rooms !== "object") db = { rooms: {} };
  } catch (e) {
    if (e.code !== "ENOENT") {
      const backup = `${DB_FILE}.broken-${Date.now()}`;
      console.error(`db.json bị lỗi (${e.message}), đã sao lưu sang ${backup}`);
      try { fs.copyFileSync(DB_FILE, backup); } catch (_) { /* bỏ qua */ }
    }
    db = { rooms: {} };
  }
}

function flushDb() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const json = JSON.stringify(db, null, 1);
  const tmp = `${DB_FILE}.tmp`;
  try {
    fs.writeFileSync(tmp, json);
    fs.renameSync(tmp, DB_FILE);
  } catch (e) {
    // Windows đôi khi khoá file (antivirus...) -> ghi trực tiếp
    fs.writeFileSync(DB_FILE, json);
  }
}

let saveTimer = null;
function saveDb() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushDb, 300);
}

function getRoom(code) {
  if (!db.rooms[code]) db.rooms[code] = { createdAt: Date.now(), state: {}, messages: [] };
  return db.rooms[code];
}

// ---------- validate ----------
const str = (v, max) => String(v == null ? "" : v).trim().slice(0, max);
const isInt = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;

function cleanItem(it) {
  if (typeof it === "number" && Number.isFinite(it) && it > 0 && it < 1e12) return Math.round(it);
  const s = str(it, 60);
  return s || null;
}

function cleanGame(data) {
  if (!data || typeof data !== "object" || !Array.isArray(data.groups)) return null;
  const groups = data.groups.slice(0, 30).map((g) => {
    if (!g || typeof g !== "object") return null;
    const out = { name: str(g.name, 40) || "Nhóm", items: [] };
    if (typeof g.link === "string") out.link = str(g.link, 20);
    if (Array.isArray(g.items)) out.items = g.items.slice(0, 60).map(cleanItem).filter((x) => x != null);
    return out;
  }).filter(Boolean);
  if (!groups.length) return null;
  const history = (Array.isArray(data.history) ? data.history : []).slice(0, 20).map((h) => ({
    text: str(h && h.text, 80),
    group: str(h && h.group, 40),
    by: str(h && h.by, 24),
    at: Number(h && h.at) || Date.now(),
  }));
  const active = isInt(data.active, 0, groups.length - 1) ? data.active : 0;
  return { groups, active, history };
}

// ---------- static files ----------
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

function lanUrls() {
  const urls = [];
  for (const list of Object.values(os.networkInterfaces())) {
    for (const ni of list || []) {
      if (ni.family === "IPv4" && !ni.internal) urls.push(`http://${ni.address}:${PORT}`);
    }
  }
  return urls;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://x");
  if (url.pathname === "/api/info") {
    res.writeHead(200, { "Content-Type": MIME[".json"] });
    return res.end(JSON.stringify({ urls: lanUrls() }));
  }
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/index.html";
  const file = path.normalize(path.join(PUBLIC_DIR, rel));
  if (!file.startsWith(PUBLIC_DIR + path.sep)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  fs.readFile(file, (err, buf) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return res.end("Không tìm thấy");
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-cache" });
    res.end(buf);
  });
});

// ---------- socket ----------
const io = new Server(server, { maxHttpBufferSize: 512 * 1024 });
const online = new Map(); // room -> Map(socketId -> { clientId, name })

function presence(code) {
  const seen = new Map();
  for (const m of (online.get(code) || new Map()).values()) seen.set(m.clientId, m);
  return [...seen.values()];
}

function addMessage(code, msg) {
  const room = getRoom(code);
  room.messages.push(msg);
  if (room.messages.length > MAX_MESSAGES) room.messages.splice(0, room.messages.length - MAX_MESSAGES);
  saveDb();
  io.to(code).emit("chat:new", msg);
}

io.on("connection", (socket) => {
  let roomCode = null;
  let me = null;

  function leave() {
    if (!roomCode) return;
    const members = online.get(roomCode);
    if (members) {
      members.delete(socket.id);
      if (!members.size) online.delete(roomCode);
    }
    socket.leave(roomCode);
    io.to(roomCode).emit("presence", presence(roomCode));
    roomCode = null;
    me = null;
  }

  socket.on("join", (p, ack) => {
    const reply = typeof ack === "function" ? ack : () => {};
    const code = str(p && p.room, 24).toLowerCase();
    const name = str(p && p.name, 24);
    const clientId = str(p && p.clientId, 64);
    if (!/^[a-z0-9-]{3,24}$/.test(code)) return reply({ error: "Mã phòng gồm chữ không dấu, số, dấu gạch (3–24 ký tự)" });
    if (!name) return reply({ error: "Nhập tên của bạn nhé" });
    if (!clientId) return reply({ error: "Thiếu mã thiết bị" });

    const members = online.get(code) || new Map();
    const others = new Set([...members.values()].filter((m) => m.clientId !== clientId).map((m) => m.clientId));
    if (others.size >= MAX_PEOPLE) return reply({ error: "Phòng này đã đủ 2 người rồi" });

    leave();
    roomCode = code;
    me = { clientId, name };
    members.set(socket.id, me);
    online.set(code, members);
    socket.join(code);

    const room = getRoom(code);
    saveDb();
    reply({ ok: true, room: code, state: room.state, messages: room.messages.slice(-200), presence: presence(code) });
    io.to(code).emit("presence", presence(code));
  });

  socket.on("leave", leave);

  socket.on("state:update", (p) => {
    if (!roomCode || !p || !GAME_TITLES[p.gameId]) return;
    const data = cleanGame(p.data);
    if (!data) return;
    getRoom(roomCode).state[p.gameId] = data;
    saveDb();
    socket.to(roomCode).emit("state:update", { gameId: p.gameId, data });
  });

  socket.on("spin", (p) => {
    if (!roomCode || !p || !GAME_TITLES[p.gameId] || !Array.isArray(p.items)) return;
    const items = p.items.slice(0, 60).map(cleanItem).filter((x) => x != null);
    if (items.length < 2 || !isInt(p.target, 0, items.length - 1)) return;
    socket.to(roomCode).emit("spin", {
      gameId: p.gameId,
      group: isInt(p.group, 0, 29) ? p.group : 0,
      groupName: str(p.groupName, 40),
      items,
      target: p.target,
      jitter: Math.max(-0.4, Math.min(0.4, Number(p.jitter) || 0)),
      turns: isInt(p.turns, 1, 12) ? p.turns : 6,
      duration: Math.max(1, Math.min(10, Number(p.duration) || 5.5)),
      by: me.name,
    });
  });

  socket.on("chat:send", (text) => {
    if (!roomCode) return;
    const t = str(text, 1000);
    if (!t) return;
    addMessage(roomCode, { id: crypto.randomUUID(), type: "text", clientId: me.clientId, name: me.name, text: t, at: Date.now() });
  });

  socket.on("chat:result", (p) => {
    if (!roomCode || !p || !GAME_TITLES[p.gameId]) return;
    const text = str(p.text, 80);
    if (!text) return;
    addMessage(roomCode, {
      id: crypto.randomUUID(), type: "result", clientId: me.clientId, name: me.name,
      game: GAME_TITLES[p.gameId], group: str(p.group, 40), text, at: Date.now(),
    });
  });

  socket.on("typing", (on) => {
    if (roomCode) socket.to(roomCode).emit("typing", { clientId: me.clientId, on: !!on });
  });

  socket.on("disconnect", leave);
});

// ---------- start ----------
loadDb();
server.listen(PORT, "0.0.0.0", () => {
  console.log("\n  Hai Đứa Mình đang chạy:");
  console.log(`   • Máy này:      http://localhost:${PORT}`);
  lanUrls().forEach((u) => console.log(`   • Cùng Wi-Fi:   ${u}`));
  console.log(`   • Dữ liệu lưu:  ${DB_FILE}\n`);
});

function shutdown() {
  clearTimeout(saveTimer);
  try { flushDb(); } catch (e) { console.error(e); }
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
