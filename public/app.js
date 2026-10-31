// ============================================================
//  Hai Đứa Mình — vòng quay cho cặp đôi (animation: GSAP, realtime: Socket.IO)
// ============================================================

const ICONS = {
  food: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  cafe: '<path d="M10 2v2"/><path d="M14 2v2"/><path d="M6 2v2"/><path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1"/>',
  todo: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9Z"/><path d="M19 16v5"/><path d="M16.5 18.5h5"/>',
  budget: '<path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>',
  soundOn: '<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M19 5a10 10 0 0 1 0 14"/>',
  soundOff: '<path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/>',
};
const svg = (name) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${ICONS[name]}</svg>`;

const GAMES = [
  {
    id: "food", tab: "Ăn gì",
    title: "Hôm nay ăn gì?",
    desc: "Chọn kiểu món, quay một vòng, khỏi đùn đẩy nhau nữa.",
    lead: "Hôm nay mình ăn",
    groups: [
      { name: "Bữa chính", items: ["Phở bò", "Bún bò Huế", "Cơm tấm", "Bún chả", "Mì Quảng", "Bánh xèo", "Cơm gà", "Hủ tiếu", "Bún riêu", "Bánh canh cua"] },
      { name: "Lẩu & Nướng", items: ["Lẩu Thái", "Lẩu bò", "Lẩu nấm", "Nướng Hàn Quốc", "Lẩu cá kèo", "Buffet nướng", "Ốc các kiểu", "Lẩu gà lá é"] },
      { name: "Ăn vặt", items: ["Bánh tráng trộn", "Xiên que", "Bánh mì", "Chè", "Bánh flan", "Gỏi cuốn", "Bắp xào", "Trà sữa"] },
      { name: "Món ngoại", items: ["Sushi", "Pizza", "Gà rán", "Mì cay", "Tokbokki", "Dimsum", "Burger", "Ramen"] },
    ],
  },
  {
    id: "cafe", tab: "Cà phê",
    title: "Cà phê ở đâu?",
    desc: "Chọn không khí hôm nay. Thêm quán ruột của hai đứa vào cho vòng quay.",
    lead: "Mình đi",
    groups: [
      { name: "Chill yên tĩnh", items: ["Cà phê sách", "Quán acoustic", "Cà phê sân vườn", "Quán nhạc Trịnh", "Cà phê mèo", "Tiệm trà nhỏ"] },
      { name: "Sống ảo", items: ["Quán vintage", "Cà phê rooftop", "Tiệm bánh kiểu Hàn", "Quán view hồ", "Quán concept Nhật", "Cà phê hoa"] },
      { name: "Bình dân", items: ["Cà phê vỉa hè", "Cà phê bệt", "Cà phê muối", "Trà chanh", "Cà phê cóc", "Cà phê trứng"] },
      { name: "Hẹn hò tối", items: ["Rooftop bar", "Quán cocktail nhỏ", "Tiệm bánh ngọt", "Cà phê nhạc sống", "Quán ven sông", "Tiệm kem"] },
    ],
  },
  {
    id: "todo", tab: "Làm gì",
    title: "Hôm nay làm gì?",
    desc: "Ra ngoài hay ở nhà ôm nhau, để vòng quay chọn.",
    lead: "Hôm nay mình cùng",
    groups: [
      { name: "Ra ngoài", items: ["Xem phim rạp", "Dạo phố đi bộ", "Chơi bowling", "Đi hát karaoke", "Đi chợ đêm", "Chơi game arcade", "Đi bảo tàng", "Workshop vẽ tranh"] },
      { name: "Ở nhà", items: ["Cùng nấu ăn", "Cày phim", "Chơi board game", "Làm bánh", "Spa tại nhà", "Ghép puzzle", "Hát karaoke tại gia", "Dọn nhà cùng nhau"] },
      { name: "Lãng mạn", items: ["Picnic công viên", "Ngắm hoàng hôn", "Viết thư tay", "Chụp photobooth", "Ăn tối nến", "Dạo bờ sông", "Ngắm sao", "Xem lại ảnh cũ"] },
      { name: "Năng động", items: ["Đạp xe", "Chạy bộ", "Đi bơi", "Leo núi trong nhà", "Chơi cầu lông", "Phượt ngắn", "Tập yoga đôi", "Trượt patin"] },
    ],
  },
  {
    id: "budget", tab: "Ngân sách", money: true,
    title: "Quay ngân sách",
    desc: "Chọn loại hoạt động, quay xem hôm nay được tiêu bao nhiêu.",
    lead: "Ngân sách",
    groups: [
      { name: "Cà phê", link: "cafe", items: [50000, 80000, 100000, 120000, 150000, 200000] },
      { name: "Nhậu", link: "food:1", items: [200000, 300000, 400000, 500000, 700000, 1000000] },
      { name: "Ăn uống", link: "food", items: [100000, 150000, 200000, 300000, 400000, 500000] },
      { name: "Đi date", link: "todo", items: [200000, 300000, 500000, 700000, 1000000, 1500000] },
      { name: "Xem phim", items: [150000, 200000, 250000, 300000, 400000] },
      { name: "Mua sắm", items: [200000, 300000, 500000, 800000, 1000000, 2000000] },
    ],
  },
];

const COLORS = ["#eaa3b6", "#fdebef", "#d9c6ef", "#fbe3d3", "#f3bfcd", "#f6f0ff"];
const TAU = Math.PI * 2;
const STORE_KEY = "hai-dua-minh-v1";
const PREFS_KEY = "hai-dua-minh-prefs";
const MAX_ITEMS = 40;
const MAX_RANGE = 24;
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const $ = (s) => document.querySelector(s);
const clone = (o) => JSON.parse(JSON.stringify(o));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const mod = (a) => ((a % TAU) + TAU) % TAU;
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
const lsGet = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } };
const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2, 12));

if (REDUCED) gsap.globalTimeline.timeScale(4);

// ---------- state ----------
function freshGame(g) {
  return { groups: clone(g.groups), active: 0, history: [] };
}

function loadState() {
  let s = {};
  try { s = JSON.parse(lsGet(STORE_KEY)) || {}; } catch (e) { s = {}; }
  GAMES.forEach((g) => { if (!s[g.id] || !Array.isArray(s[g.id].groups)) s[g.id] = freshGame(g); });
  return s;
}
const saveLocal = () => lsSet(STORE_KEY, JSON.stringify(state));

// Lưu máy + đồng bộ cho người kia nếu đang trong phòng
function commit(gameId = game().id) {
  saveLocal();
  if (net.joined) net.socket.emit("state:update", { gameId, data: state[gameId] });
}

let prefs = { tab: "food", sound: true };
try { prefs = { ...prefs, ...JSON.parse(lsGet(PREFS_KEY)) }; } catch (e) { /* bỏ qua */ }
const savePrefs = () => lsSet(PREFS_KEY, JSON.stringify(prefs));

let state = loadState();
let spinning = false;
let spinItems = null; // danh sách đang quay (snapshot)
let pendingRender = false;
let rotation = 0; // radian

const game = () => GAMES.find((g) => g.id === prefs.tab) || GAMES[0];
const gameById = (id) => GAMES.find((g) => g.id === id);
const gState = () => state[game().id];
const activeGroup = () => {
  const gs = gState();
  if (!(gs.active >= 0 && gs.active < gs.groups.length)) gs.active = 0;
  return gs.groups[gs.active];
};

// ---------- money helpers ----------
function parseMoney(raw) {
  let s = String(raw).toLowerCase().replace(/\s|đ|vnd|vnđ/g, "");
  let m;
  if ((m = s.match(/^(\d+(?:[.,]\d+)?)(tr|triệu|trieu|m)$/))) return Math.round(parseFloat(m[1].replace(",", ".")) * 1e6);
  if ((m = s.match(/^(\d+(?:[.,]\d+)?)(k|nghìn|ngàn|nghin|ngan)$/))) return Math.round(parseFloat(m[1].replace(",", ".")) * 1e3);
  s = s.replace(/[.,]/g, "");
  if (!/^\d+$/.test(s)) return null;
  const n = parseInt(s, 10);
  if (!n) return null;
  return n < 1000 ? n * 1000 : n;
}
const moneyShort = (n) => (n >= 1e6 ? +(n / 1e6).toFixed(2) + "tr" : +(n / 1e3).toFixed(1) + "k");
const moneyLong = (n) => n.toLocaleString("vi-VN") + "đ";
const label = (item) => (typeof item === "number" ? moneyShort(item) : item);

// ---------- text split ----------
function splitChars(el, text) {
  el.innerHTML = String(text)
    .split(" ")
    .map((w) => `<span class="w">${Array.from(w).map((c) => `<span class="ch">${escapeHtml(c)}</span>`).join("")}</span>`)
    .join(" ");
  return el.querySelectorAll(".ch");
}

// ---------- sound ----------
let audioCtx = null;
function ensureAudio() {
  if (!audioCtx) {
    try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { audioCtx = null; }
  }
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}
function beep(freq, dur, vol = 0.05, type = "triangle") {
  if (!prefs.sound || !audioCtx) return;
  const t = audioCtx.currentTime;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(audioCtx.destination);
  o.start(t);
  o.stop(t + dur);
}
const tick = () => beep(1100, 0.03, 0.035);
const pop = () => { beep(880, 0.12, 0.04, "sine"); setTimeout(() => beep(1320, 0.14, 0.035, "sine"), 70); };
function chime() {
  [659, 784, 988, 1319].forEach((f, i) => setTimeout(() => beep(f, 0.35, 0.05, "sine"), i * 90));
}
document.addEventListener("pointerdown", ensureAudio, { once: true });

// ---------- wheel ----------
const canvas = $("#wheel");
const ctx = canvas.getContext("2d");
let W = 400;

function resizeWheel() {
  const dpr = window.devicePixelRatio || 1;
  W = canvas.parentElement.getBoundingClientRect().width || 400;
  canvas.width = Math.round(W * dpr);
  canvas.height = Math.round(W * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  drawWheel();
}

function sliceColor(i, n) {
  // tránh ô cuối trùng màu ô đầu
  if (i === n - 1 && n > 1 && (n - 1) % COLORS.length === 0) return COLORS[2];
  return COLORS[i % COLORS.length];
}

function fitText(text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 1 && ctx.measureText(t + "…").width > maxW) t = t.slice(0, -1);
  return t + "…";
}

// Vẽ bánh xe ở góc 0; việc xoay do GSAP xoay cả canvas.
function drawWheel() {
  const items = spinItems || activeGroup().items;
  const n = items.length;
  const c = W / 2;
  const rOuter = c - 1;
  const r = c - 15;
  ctx.clearRect(0, 0, W, W);

  ctx.beginPath();
  ctx.arc(c, c, rOuter, 0, TAU);
  ctx.fillStyle = "#2a1720";
  ctx.fill();

  const bulbs = 28;
  for (let i = 0; i < bulbs; i++) {
    const a = (i / bulbs) * TAU;
    ctx.beginPath();
    ctx.arc(c + Math.cos(a) * (rOuter - 7.5), c + Math.sin(a) * (rOuter - 7.5), Math.max(2, W / 190), 0, TAU);
    ctx.fillStyle = i % 2 ? "#f6d7a7" : "rgba(251,245,240,.35)";
    ctx.fill();
  }

  if (n === 0) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, TAU);
    ctx.fillStyle = "#fdebef";
    ctx.fill();
    return;
  }

  const arc = TAU / n;
  const fs = Math.max(10, Math.round((n <= 6 ? 16 : n <= 10 ? 14.5 : n <= 14 ? 13 : n <= 20 ? 11.5 : 10) * (W / 440)));
  for (let i = 0; i < n; i++) {
    const start = i * arc;
    ctx.beginPath();
    ctx.moveTo(c, c);
    ctx.arc(c, c, r, start, start + arc);
    ctx.closePath();
    ctx.fillStyle = sliceColor(i, n);
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,253,251,.9)";
    ctx.stroke();

    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(start + arc / 2);
    ctx.font = `600 ${fs}px "Be Vietnam Pro", system-ui, sans-serif`;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#2a1720";
    ctx.fillText(fitText(String(label(items[i])), r * 0.64), r - 16, 0);
    ctx.restore();
  }
}

function setRotation(rad) {
  rotation = rad;
  gsap.set(canvas, { rotation: (rad * 180) / Math.PI });
}

function sliceAtPointer(rot, n) {
  const arc = TAU / n;
  return Math.floor(mod(-Math.PI / 2 - rot) / arc) % n;
}

function introWheel() {
  setRotation(0);
  gsap.fromTo(canvas, { rotation: -70, scale: 0.94 }, { rotation: 0, scale: 1, duration: 1.1, ease: "expo.out", overwrite: true });
}

function spin() {
  if (spinning) return;
  const gs = gState();
  const group = activeGroup();
  const n = group.items.length;
  if (n < 2) {
    toast("Thêm ít nhất 2 lựa chọn để quay nha");
    gsap.fromTo("#hint", { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    return;
  }
  const p = {
    gameId: game().id,
    group: gs.active,
    groupName: group.name,
    items: group.items.slice(),
    target: Math.floor(Math.random() * n),
    jitter: (Math.random() - 0.5) * 0.7, // tính theo bề rộng 1 ô
    turns: 6 + Math.floor(Math.random() * 3),
    duration: 5.4 + Math.random() * 0.8,
  };
  if (net.joined) net.socket.emit("spin", p);
  runSpin(p, null);
}

// by = tên người kia nếu là lượt quay nhận qua socket, null nếu mình quay
function runSpin(p, by) {
  ensureAudio();
  const n = p.items.length;
  const arc = TAU / n;
  spinItems = p.items;
  drawWheel();

  const from = rotation;
  const goal = -Math.PI / 2 - (p.target + 0.5) * arc + p.jitter * arc;
  const to = from + mod(goal - from) + TAU * p.turns;
  const proxy = { r: from };
  let last = sliceAtPointer(from, n);

  const update = () => {
    setRotation(proxy.r);
    const cur = sliceAtPointer(proxy.r, n);
    if (cur !== last) { last = cur; tick(); wiggle(); }
  };

  setSpinning(true);
  gsap.timeline({
    onComplete() {
      setRotation(mod(rotation));
      const item = p.items[sliceAtPointer(rotation, n)];
      spinItems = null;
      setSpinning(false);
      drawWheel();
      if (pendingRender) {
        pendingRender = false;
        renderGroups();
        renderItems();
        renderHistory();
      }
      finish(p, item, by);
    },
  })
    .to(proxy, { r: from - 0.14, duration: 0.35, ease: "power2.out", onUpdate: update })
    .to(proxy, { r: to, duration: p.duration, ease: "power4.out", onUpdate: update });
}

function wiggle() {
  gsap.fromTo("#pointer", { rotation: -22 }, { rotation: 0, duration: 0.3, ease: "elastic.out(1, 0.45)", transformOrigin: "50% 30%", overwrite: true });
}

function setSpinning(v) {
  spinning = v;
  $("#spinBtn").disabled = v;
  gsap.to("#spinBtn", { scale: v ? 0.92 : 1, duration: 0.3, ease: "power2.out" });
  gsap.to(".spin-ring", { autoAlpha: v ? 0 : 1, duration: 0.2 });
  document.querySelectorAll("#addForm input, #addForm button, #rangeForm button, .chips button, .group, .tab, #resetBtn")
    .forEach((el) => (el.disabled = v));
}

// ---------- result ----------
const SWEET = [
  "Vòng quay đã quyết, cấm cãi nha.",
  "Đi với nhau là vui rồi.",
  "Ai đến trễ thì người đó bao.",
  "Nhớ chụp một tấm làm kỷ niệm.",
  "Hôm nay cũng thương nhau như mọi ngày.",
  "Lựa chọn chuẩn, không cần chỉnh.",
];

function moneyQuip(n) {
  if (n <= 100000) return "Tiết kiệm mà vẫn vui.";
  if (n <= 300000) return "Vừa đẹp, không lo cháy túi.";
  if (n <= 700000) return "Hôm nay chơi lớn một chút.";
  return "Chơi tới bến luôn. Ai bao đây?";
}

function suggestionFor(group) {
  if (!group || !group.link) return null;
  const [gid, gi] = group.link.split(":");
  const gs = state[gid];
  if (!gs) return null;
  const pool = gi !== undefined && gs.groups[+gi] ? gs.groups[+gi].items : gs.groups.flatMap((g) => g.items);
  return pool.length ? pick(pool) : null;
}

function finish(p, item, by) {
  const g = gameById(p.gameId);
  const text = typeof item === "number" ? moneyLong(item) : item;

  if (!by) {
    const gs = state[p.gameId];
    gs.history.unshift({ text, group: p.groupName, at: Date.now(), by: net.joined ? session.name : "" });
    gs.history = gs.history.slice(0, 8);
    commit(p.gameId);
    if (net.joined) net.socket.emit("chat:result", { gameId: p.gameId, group: p.groupName, text });
  }
  if (p.gameId === game().id) renderHistory(!by);

  const who = by ? `${by} quay · ` : "";
  $("#resultLead").textContent = g.money ? `${who}${g.lead} · ${p.groupName}` : `${who}${g.lead}`;
  if (g.money) {
    const sug = suggestionFor(state[p.gameId].groups[p.group]);
    $("#resultExtra").innerHTML = escapeHtml(moneyQuip(item)) + (sug ? `<br>Gợi ý: thử <b>${escapeHtml(sug)}</b> nhé?` : "");
  } else {
    $("#resultExtra").textContent = pick(SWEET);
  }
  openResult(typeof item === "number" ? item : null, text);
  chime();
}

const heartPath = $("#heartPath");
const heartLen = heartPath.getTotalLength();

function showModal(modal, card) {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  return gsap.timeline({ defaults: { ease: "power3.out" } })
    .fromTo(modal, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 })
    .fromTo(card, { y: 50, scale: 0.94, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: "back.out(1.4)" }, "<");
}

function hideModal(modal, card, then) {
  if (!modal.classList.contains("open")) return;
  gsap.to(card, { y: 24, scale: 0.96, autoAlpha: 0, duration: 0.22, ease: "power2.in" });
  gsap.to(modal, {
    autoAlpha: 0, duration: 0.28, delay: 0.05,
    onComplete() {
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden", "true");
      if (typeof then === "function") then();
    },
  });
}

function openResult(amount, text) {
  const result = $("#resultText");
  const tl = showModal($("#modal"), $("#modalCard"));
  tl.fromTo(heartPath, { strokeDasharray: heartLen, strokeDashoffset: heartLen, fillOpacity: 0 },
    { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, "-=0.4")
    .to(heartPath, { fillOpacity: 1, duration: 0.35 }, "-=0.15")
    .fromTo("#resultLead", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.35);

  if (amount != null) {
    const counter = { v: 0 };
    result.textContent = moneyLong(0);
    tl.fromTo(result, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4 }, 0.45)
      .to(counter, {
        v: amount, duration: 1.3, ease: "power3.out",
        onUpdate: () => (result.textContent = moneyLong(Math.round(counter.v / 1000) * 1000)),
      }, 0.45);
  } else {
    gsap.set(result, { autoAlpha: 1, y: 0 });
    tl.from(splitChars(result, text), { y: "0.7em", autoAlpha: 0, rotation: 8, duration: 0.6, stagger: 0.03, ease: "back.out(2)" }, 0.45);
  }

  tl.fromTo("#modalRule", { scaleX: 0 }, { scaleX: 1, duration: 0.6 }, 0.8)
    .fromTo("#resultExtra", { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.45 }, 0.95)
    .fromTo("#modal .modal-actions .btn", { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.07 }, 1.05)
    .add(burst, 0.3)
    .add(() => $("#okBtn").focus({ preventScroll: true }), 1.1);
}
const closeResult = (then) => hideModal($("#modal"), $("#modalCard"), then);

function burst() {
  if (REDUCED) return;
  const layer = $("#burst");
  const cx = innerWidth / 2;
  const cy = innerHeight / 2 - 90;
  const colors = ["#d9466f", "#f3bfcd", "#e9b872", "#cbb6ea", "#2a1720", "#fbe3d3"];
  const count = innerWidth < 600 ? 45 : 70;
  for (let i = 0; i < count; i++) {
    const el = document.createElement("i");
    el.className = "bit" + (Math.random() < 0.35 ? " round" : "");
    el.style.background = pick(colors);
    layer.appendChild(el);
    const ang = Math.random() * TAU;
    const dist = Math.min(innerWidth * 0.45, 140 + Math.random() * 260);
    gsap.set(el, { x: cx, y: cy, rotation: Math.random() * 360 });
    gsap.timeline({ onComplete: () => el.remove() })
      .to(el, { x: cx + Math.cos(ang) * dist, y: cy + Math.sin(ang) * dist * 0.75 - 90, rotation: "+=320", duration: 0.7 + Math.random() * 0.4, ease: "power3.out" })
      .to(el, { y: `+=${220 + Math.random() * 240}`, x: `+=${(Math.random() - 0.5) * 80}`, rotation: "+=200", autoAlpha: 0, duration: 1.2 + Math.random() * 0.7, ease: "power1.in" });
  }
}

// ---------- render ----------
function buildTabs() {
  const nav = $("#tabs");
  GAMES.forEach((g) => {
    const b = document.createElement("button");
    b.className = "tab";
    b.setAttribute("role", "tab");
    b.dataset.tab = g.id;
    b.innerHTML = `${svg(g.id)}<span>${g.tab}</span>`;
    nav.appendChild(b);
  });
}

function syncTabs(instant) {
  document.querySelectorAll(".tab").forEach((b) => {
    const on = b.dataset.tab === prefs.tab;
    b.classList.toggle("active", on);
    b.setAttribute("aria-selected", on);
  });
  const b = $(`.tab[data-tab="${prefs.tab}"]`);
  gsap.to("#tabInd", { x: b.offsetLeft, width: b.offsetWidth, duration: instant ? 0 : 0.6, ease: "power3.inOut" });
}

function renderHead(animate) {
  const g = game();
  const idx = GAMES.indexOf(g) + 1;
  $("#gameIndex").textContent = `0${idx} / 0${GAMES.length}`;
  $("#gameDesc").textContent = g.desc;
  const chars = splitChars($("#gameTitle"), g.title);
  if (animate) gsap.from(chars, { y: "0.6em", autoAlpha: 0, duration: 0.6, stagger: 0.018, ease: "power3.out" });
}

function renderGroups() {
  const gs = gState();
  const canDelete = gs.groups.length > 1;
  activeGroup();
  $("#groups").innerHTML =
    gs.groups.map((gr, i) => `<button class="group ${i === gs.active ? "active" : ""}" data-group="${i}">${escapeHtml(gr.name)}${
      i === gs.active && canDelete ? `<span class="x" data-del-group="${i}" title="Xoá loại này">×</span>` : ""}</button>`).join("") +
    `<button class="group add" data-add-group>+ Thêm loại</button>`;
}

function renderItems(animate) {
  const g = game();
  const items = activeGroup().items;
  $("#listEyebrow").textContent = g.money ? "Các mức tiền" : "Trong vòng quay";
  $("#listTitle").textContent = activeGroup().name;
  $("#addInput").placeholder = g.money ? "VD: 150k, 1tr, 250000" : "Thêm món, quán hoặc việc...";
  $("#rangeBox").hidden = !g.money;
  $("#items").innerHTML = items.length
    ? items.map((it, i) => `<li><span class="dot" style="background:${sliceColor(i, items.length)}"></span>${escapeHtml(typeof it === "number" ? moneyLong(it) : it)}<button data-del="${i}" aria-label="Xoá">×</button></li>`).join("")
    : `<li class="empty">Chưa có gì, thêm vào nhé</li>`;
  $("#hint").textContent = items.length < 2 ? "Cần ít nhất 2 lựa chọn để quay" : `${items.length} lựa chọn · bấm Quay hoặc phím Space`;
  if (animate) gsap.from("#items li", { y: 10, autoAlpha: 0, duration: 0.4, stagger: 0.02, ease: "power2.out" });
}

function renderHistory(animateFirst) {
  const h = gState().history;
  const fmt = (t) => new Date(t).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
  $("#history").innerHTML = h.length
    ? h.map((x) => `<li><span class="h-main">${escapeHtml(x.text)}</span><span class="h-group">${escapeHtml(x.group)}${
        x.by ? ` · <span class="h-by">${escapeHtml(x.by)}</span>` : ""}</span><time>${fmt(x.at)}</time></li>`).join("")
    : `<li class="empty">Chưa quay lần nào</li>`;
  if (animateFirst && h.length) gsap.from("#history li:first-child", { x: -16, autoAlpha: 0, duration: 0.5, ease: "power3.out" });
}

function render(animate) {
  renderHead(animate);
  renderGroups();
  renderItems(animate);
  renderHistory();
  drawWheel();
}

function switchTab(id) {
  if (spinning || id === prefs.tab) return;
  prefs.tab = id;
  savePrefs();
  syncTabs();
  gsap.to(".reveal", {
    autoAlpha: 0, y: 14, duration: 0.2, stagger: 0.05, ease: "power2.in", overwrite: true,
    onComplete() {
      render(true);
      introWheel();
      gsap.to(".reveal", { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08, ease: "power3.out" });
    },
  });
}

function switchGroup() {
  commit();
  renderGroups();
  renderItems(true);
  drawWheel();
  introWheel();
}

// ---------- events: game ----------
$("#tabs").addEventListener("click", (e) => {
  const b = e.target.closest("[data-tab]");
  if (b) switchTab(b.dataset.tab);
});

$("#groups").addEventListener("click", (e) => {
  if (spinning) return;
  const gs = gState();
  const del = e.target.closest("[data-del-group]");
  if (del) {
    const i = +del.dataset.delGroup;
    if (confirm(`Xoá loại "${gs.groups[i].name}"?`)) {
      gs.groups.splice(i, 1);
      gs.active = 0;
      switchGroup();
    }
    return;
  }
  if (e.target.closest("[data-add-group]")) {
    const name = (prompt(game().money ? "Tên loại hoạt động mới (VD: Du lịch, Spa...)" : "Tên nhóm mới?") || "").trim();
    if (!name) return;
    gs.groups.push({ name: name.slice(0, 24), items: [] });
    gs.active = gs.groups.length - 1;
    switchGroup();
    $("#addInput").focus();
    return;
  }
  const b = e.target.closest("[data-group]");
  if (b && +b.dataset.group !== gs.active) {
    gs.active = +b.dataset.group;
    switchGroup();
  }
});

$("#addForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const input = $("#addInput");
  const raw = input.value.trim();
  if (!raw) return;
  const items = activeGroup().items;
  if (items.length >= MAX_ITEMS) { toast(`Tối đa ${MAX_ITEMS} lựa chọn mỗi loại`); return; }
  let value = raw;
  if (game().money) {
    value = parseMoney(raw);
    if (!value) { toast("Nhập số tiền kiểu 150k, 1tr hoặc 250000 nha"); return; }
    if (items.includes(value)) { toast("Mức này có rồi"); return; }
    items.push(value);
    items.sort((a, b) => a - b);
  } else {
    if (items.some((x) => String(x).toLowerCase() === raw.toLowerCase())) { toast("Cái này có rồi"); return; }
    items.push(raw);
  }
  input.value = "";
  commit();
  renderItems();
  drawWheel();
  const li = $("#items").children[items.indexOf(value)];
  if (li) gsap.from(li, { scale: 0.6, autoAlpha: 0, duration: 0.45, ease: "back.out(2.2)" });
  gsap.fromTo(canvas, { scale: 0.97 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" });
});

$("#items").addEventListener("click", (e) => {
  const b = e.target.closest("[data-del]");
  if (!b || spinning) return;
  const i = +b.dataset.del;
  gsap.to(b.closest("li"), {
    scale: 0.6, autoAlpha: 0, duration: 0.2, ease: "power2.in",
    onComplete() {
      activeGroup().items.splice(i, 1);
      commit();
      renderItems();
      drawWheel();
    },
  });
});

$("#resetBtn").addEventListener("click", () => {
  if (!confirm("Khôi phục danh sách mặc định cho trò này? (Lịch sử vẫn giữ)")) return;
  const hist = gState().history;
  state[game().id] = { ...freshGame(game()), history: hist };
  commit();
  render(true);
  introWheel();
  toast("Đã khôi phục");
});

$("#spinBtn").addEventListener("click", spin);
$("#spinBtn").addEventListener("mouseenter", () => !spinning && gsap.to("#spinBtn", { scale: 1.07, duration: 0.3, ease: "power2.out" }));
$("#spinBtn").addEventListener("mouseleave", () => !spinning && gsap.to("#spinBtn", { scale: 1, duration: 0.3, ease: "power2.out" }));
$("#againBtn").addEventListener("click", () => closeResult(() => setTimeout(spin, 120)));
$("#okBtn").addEventListener("click", () => closeResult());
$("#modal").addEventListener("click", (e) => { if (e.target.id === "modal") closeResult(); });

const soundBtn = $("#soundBtn");
const renderSound = () => (soundBtn.innerHTML = svg(prefs.sound ? "soundOn" : "soundOff"));
soundBtn.addEventListener("click", () => {
  prefs.sound = !prefs.sound;
  savePrefs();
  renderSound();
  ensureAudio();
  gsap.fromTo(soundBtn, { scale: 0.85 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" });
});

// ---------- thêm nhanh theo khoảng tiền ----------
let rangeOpen = false;

function rangeValues() {
  const a = parseMoney($("#rFrom").value);
  const b = parseMoney($("#rTo").value);
  const step = parseMoney($("#rStep").value);
  if (!a || !b || !step) return { error: "Nhập đủ Từ, Đến và Bước (VD: 100k, 500k, 50k)" };
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const count = Math.floor((hi - lo) / step) + 1;
  if (count > MAX_RANGE) return { error: `Ra ${count} mức, nhiều quá. Tăng bước lên nhé (tối đa ${MAX_RANGE}).` };
  const vals = [];
  for (let i = 0; i < count; i++) vals.push(lo + i * step);
  if (vals[vals.length - 1] !== hi) vals.push(hi); // luôn có mức "Đến"
  if (vals.length < 2) return { error: "Khoảng quá hẹp, cần ít nhất 2 mức" };
  return { vals };
}

function updateRangePreview() {
  const box = $("#rPreview");
  const step = parseMoney($("#rStep").value);
  document.querySelectorAll("#stepPresets button").forEach((b) => b.classList.toggle("on", +b.dataset.step === step));
  if (!$("#rFrom").value && !$("#rTo").value) {
    box.className = "range-preview";
    box.textContent = "Nhập khoảng tiền và bước nhảy, ví dụ 100k → 500k, bước 50k.";
    return;
  }
  const r = rangeValues();
  if (r.error) {
    box.className = "range-preview err";
    box.textContent = r.error;
    return;
  }
  const shown = r.vals.length > 10 ? [...r.vals.slice(0, 6).map(moneyShort), "…", ...r.vals.slice(-2).map(moneyShort)] : r.vals.map(moneyShort);
  box.className = "range-preview";
  box.innerHTML = `<b>${r.vals.length} mức:</b> ${shown.join(" · ")}`;
}

function applyRange(replace) {
  const r = rangeValues();
  if (r.error) {
    toast(r.error);
    gsap.fromTo("#rPreview", { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
    return;
  }
  const group = activeGroup();
  const before = new Set(group.items);
  const next = replace ? r.vals : [...new Set([...group.items, ...r.vals])].sort((a, b) => a - b);
  if (next.length > MAX_ITEMS) { toast(`Tổng cộng ${next.length} mức, tối đa ${MAX_ITEMS}. Bấm "Thay cả danh sách" hoặc tăng bước.`); return; }
  if (replace && group.items.length && !confirm(`Thay ${group.items.length} mức hiện tại bằng ${r.vals.length} mức mới?`)) return;
  group.items = next;
  commit();
  renderItems();
  drawWheel();
  const added = replace ? next.length : next.filter((v) => !before.has(v)).length;
  // làm nổi các mức vừa thêm
  const fresh = [...$("#items").children].filter((_, i) => replace || !before.has(next[i]));
  gsap.from(fresh, { scale: 0.6, autoAlpha: 0, duration: 0.45, stagger: 0.03, ease: "back.out(2.2)" });
  setRotation(0);
  gsap.fromTo(canvas, { rotation: -40, scale: 0.95 }, { rotation: 0, scale: 1, duration: 0.9, ease: "expo.out" });
  toast(replace ? `Đã thay bằng ${added} mức mới` : added ? `Đã thêm ${added} mức` : "Các mức này có hết rồi");
}

$("#rangeToggle").addEventListener("click", () => {
  rangeOpen = !rangeOpen;
  $("#rangeToggle").setAttribute("aria-expanded", rangeOpen);
  gsap.to("#rangeForm", { height: rangeOpen ? "auto" : 0, autoAlpha: rangeOpen ? 1 : 0, duration: 0.45, ease: "power3.inOut" });
  if (rangeOpen) {
    gsap.from("#rangeForm > *", { y: 10, autoAlpha: 0, duration: 0.4, stagger: 0.05, delay: 0.1, ease: "power2.out" });
    setTimeout(() => $("#rFrom").focus({ preventScroll: true }), 300);
  }
});
["#rFrom", "#rTo", "#rStep"].forEach((s) => $(s).addEventListener("input", updateRangePreview));
$("#stepPresets").addEventListener("click", (e) => {
  const b = e.target.closest("[data-step]");
  if (!b) return;
  $("#rStep").value = moneyShort(+b.dataset.step);
  updateRangePreview();
});
$("#rangeForm").addEventListener("submit", (e) => { e.preventDefault(); applyRange(false); });
$("#rReplace").addEventListener("click", () => applyRange(true));

// ============================================================
//  Realtime: 2 người chung phòng + nhắn tin
// ============================================================
const NET_OK = typeof window.io === "function";
const clientId = lsGet("hdm-client") || uid();
lsSet("hdm-client", clientId);
let session = null;
try { session = JSON.parse(lsGet("hdm-session")); } catch (e) { session = null; }
const urlRoom = new URLSearchParams(location.search).get("room");
const net = { socket: null, joined: false, presence: [], messages: [], unread: 0, peerTyping: false, lanUrls: [] };

const normRoom = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d")
  .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24);
const partner = () => net.presence.find((p) => p.clientId !== clientId);
function partnerName() {
  const p = partner();
  if (p) return p.name;
  const last = [...net.messages].reverse().find((m) => m.clientId !== clientId);
  return last ? last.name : null;
}

function connect() {
  if (!NET_OK) return;
  const s = (net.socket = io({ transports: ["websocket", "polling"] }));
  s.on("connect", () => {
    // link mời sang phòng khác thì không tự vào phòng cũ
    if (session && (!urlRoom || normRoom(urlRoom) === session.room || net.joined)) join(session.room, session.name, true);
    updatePair();
  });
  s.on("disconnect", () => {
    net.joined = false;
    net.presence = [];
    updatePair();
  });
  s.on("presence", (list) => {
    const before = partner();
    net.presence = list;
    const after = partner();
    if (!before && after) toast(`${after.name} vừa vào phòng`);
    if (before && !after) net.peerTyping = false;
    updatePair();
  });
  s.on("state:update", ({ gameId, data }) => {
    if (!state[gameId]) return;
    state[gameId] = data;
    saveLocal();
    if (gameId !== game().id) return;
    if (spinning) { pendingRender = true; return; }
    renderGroups();
    renderItems();
    renderHistory();
    drawWheel();
  });
  s.on("spin", onRemoteSpin);
  s.on("chat:new", onChatMessage);
  s.on("typing", ({ on }) => {
    net.peerTyping = on;
    updateTyping();
  });
  fetch("/api/info").then((r) => r.json()).then((d) => { net.lanUrls = d.urls || []; }).catch(() => {});
}

function join(room, name, silent) {
  net.socket.emit("join", { room, name, clientId }, (res) => {
    if (!res || res.error) {
      if (silent) { session = null; lsSet("hdm-session", null); updatePair(); toast(res ? res.error : "Không vào được phòng"); }
      else showPairError(res ? res.error : "Không vào được phòng");
      return;
    }
    session = { room: res.room, name };
    lsSet("hdm-session", JSON.stringify(session));
    lsSet("hdm-name", name);
    net.joined = true;
    net.presence = res.presence;

    // Phòng đã có dữ liệu thì lấy về; trò nào phòng chưa có thì đẩy danh sách của mình lên
    GAMES.forEach((g) => {
      if (res.state && res.state[g.id]) state[g.id] = res.state[g.id];
      else net.socket.emit("state:update", { gameId: g.id, data: state[g.id] });
    });
    saveLocal();
    if (spinning) pendingRender = true;
    else render(false);

    net.messages = res.messages || [];
    renderChat();
    updatePair();
    history.replaceState(null, "", `?room=${encodeURIComponent(res.room)}`);
    if (!silent) {
      showPairJoined();
      toast(`Đã vào phòng ${res.room}`);
    }
  });
}

function leaveRoom() {
  if (net.socket) net.socket.emit("leave");
  net.joined = false;
  net.presence = [];
  net.messages = [];
  net.unread = 0;
  session = null;
  lsSet("hdm-session", null);
  history.replaceState(null, "", location.pathname);
  renderChat();
  updatePair();
}

function onRemoteSpin(p) {
  if (spinning || !gameById(p.gameId) || !Array.isArray(p.items) || p.items.length < 2) return;
  const go = () => {
    if (p.gameId !== prefs.tab) {
      prefs.tab = p.gameId;
      savePrefs();
      syncTabs();
      render(false);
    }
    const gs = state[p.gameId];
    if (p.group < gs.groups.length && gs.active !== p.group) {
      gs.active = p.group;
      renderGroups();
      renderItems();
    }
    toast(`${p.by} đang quay…`);
    runSpin(p, p.by);
  };
  if ($("#modal").classList.contains("open")) closeResult(go);
  else go();
}

// ---------- pair UI ----------
function updatePair() {
  const dot = $("#pairDot");
  const text = $("#pairText");
  const p = partner();
  dot.className = "status-dot";
  if (!NET_OK) {
    text.textContent = "Đang chơi một mình (mở qua server để chơi cùng)";
  } else if (!net.socket || !net.socket.connected) {
    dot.classList.add("wait");
    text.textContent = "Đang kết nối máy chủ…";
  } else if (!net.joined) {
    text.innerHTML = "Đang chơi một mình · <b>Kết nối với người ấy</b>";
  } else if (p) {
    dot.classList.add("on");
    text.innerHTML = `Phòng ${escapeHtml(session.room)} · Đang cùng <b>${escapeHtml(p.name)}</b>`;
  } else {
    dot.classList.add("wait");
    text.innerHTML = `Phòng ${escapeHtml(session.room)} · Chờ người ấy vào…`;
  }
  updatePeer();
  if ($("#pairModal").classList.contains("open") && net.joined) renderMembers();
}

function updatePeer() {
  const p = partner();
  const name = partnerName();
  $("#peerName").textContent = name || "Người ấy";
  $("#peerDot").className = "status-dot" + (p ? " on" : "");
  $("#peerStatus").textContent = !net.joined ? "Chưa kết nối" : p ? "Đang online" : name ? "Đang offline" : "Chưa vào phòng";
  $("#chat").classList.toggle("locked", !net.joined);
  updateTyping();
}

function updateTyping() {
  const p = partner();
  $("#chatTyping").textContent = net.joined && p && net.peerTyping ? `${p.name} đang nhập…` : "";
}

function shareLink() {
  if (!session) return "";
  let base = location.origin;
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && net.lanUrls.length) base = net.lanUrls[0];
  return `${base}/?room=${encodeURIComponent(session.room)}`;
}

function renderMembers() {
  $("#pairRoomInfo").innerHTML = `Bạn đang ở phòng <b>${escapeHtml(session.room)}</b> với tên <b>${escapeHtml(session.name)}</b>.`;
  $("#shareLink").value = shareLink();
  const isLan = /^http:\/\/(10|172|192)\./.test(shareLink());
  $("#shareNote").textContent = isLan
    ? "Hai máy cần dùng chung mạng Wi-Fi. Hoặc người ấy tự mở trang và nhập cùng mã phòng."
    : "Người ấy mở link này, nhập tên là vào chung phòng.";
  const people = [{ clientId, name: session.name, me: true }, ...net.presence.filter((p) => p.clientId !== clientId)];
  $("#members").innerHTML = people.map((p) =>
    `<li><span class="status-dot on"></span>${escapeHtml(p.name)}<small>${p.me ? "Bạn" : "Đang online"}</small></li>`).join("") +
    (people.length < 2 ? `<li><span class="status-dot wait"></span>Chờ người ấy…<small>Chưa vào</small></li>` : "");
}

function showPairError(msg) {
  $("#pairError").textContent = msg;
  gsap.fromTo("#pairError", { x: -6 }, { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" });
}

function showPairJoined() {
  $("#pairForm").hidden = true;
  $("#pairJoined").hidden = false;
  $("#pairTitle").textContent = "Đã vào phòng";
  renderMembers();
  gsap.from("#pairJoined > *", { y: 12, autoAlpha: 0, duration: 0.4, stagger: 0.06, ease: "power2.out" });
}

function openPair() {
  if (!NET_OK) {
    toast("Chạy “npm start” rồi mở trang qua địa chỉ server để chơi cùng nhau");
    return;
  }
  $("#pairError").textContent = "";
  if (net.joined) {
    showPairJoined();
  } else {
    $("#pairForm").hidden = false;
    $("#pairJoined").hidden = true;
    $("#pairTitle").textContent = "Kết nối với người ấy";
    $("#pairName").value = (session && session.name) || lsGet("hdm-name") || "";
    $("#pairRoom").value = normRoom(urlRoom) || (session && session.room) || "";
  }
  showModal($("#pairModal"), $("#pairCard"));
  if (!net.joined && matchMedia("(min-width: 700px)").matches) setTimeout(() => ($("#pairName").value ? $("#pairRoom") : $("#pairName")).focus(), 300);
}
const closePair = () => hideModal($("#pairModal"), $("#pairCard"));

$("#pairPill").addEventListener("click", openPair);
$("#gateBtn").addEventListener("click", openPair);
$("#pairCancel").addEventListener("click", closePair);
$("#pairDone").addEventListener("click", closePair);
$("#pairModal").addEventListener("click", (e) => { if (e.target.id === "pairModal") closePair(); });
$("#pairGen").addEventListener("click", () => {
  const words = ["nha", "tim", "meo", "gau", "tho", "may", "sao", "nang"];
  $("#pairRoom").value = `${pick(words)}-${pick(words)}-${Math.floor(100 + Math.random() * 900)}`;
  gsap.fromTo("#pairRoom", { scale: 0.97 }, { scale: 1, duration: 0.4, ease: "back.out(2)" });
});
$("#pairForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#pairName").value.trim();
  const room = normRoom($("#pairRoom").value);
  if (!name) return showPairError("Nhập tên của bạn nhé");
  if (room.length < 3) return showPairError("Mã phòng cần ít nhất 3 ký tự");
  $("#pairRoom").value = room;
  if (!net.socket.connected) return showPairError("Chưa kết nối được máy chủ, thử lại sau nhé");
  join(room, name, false);
});
$("#leaveRoom").addEventListener("click", () => {
  if (!confirm("Rời phòng? Lịch sử chat vẫn được lưu trên máy chủ.")) return;
  leaveRoom();
  closePair();
  toast("Đã rời phòng");
});
$("#copyLink").addEventListener("click", async () => {
  const input = $("#shareLink");
  try {
    await navigator.clipboard.writeText(input.value);
  } catch (e) {
    input.select();
    document.execCommand("copy");
  }
  toast("Đã sao chép link");
});

// ---------- chat ----------
const chatBody = $("#chatBody");
let chatOpen = false;

const fmtChatTime = (t) => {
  const d = new Date(t);
  const sameDay = d.toDateString() === new Date().toDateString();
  return d.toLocaleString("vi-VN", sameDay ? { hour: "2-digit", minute: "2-digit" } : { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
};

function msgHtml(m, prev) {
  let out = "";
  if (!prev || m.at - prev.at > 10 * 60 * 1000) out += `<div class="chat-time">${fmtChatTime(m.at)}</div>`;
  if (m.type === "result") {
    return out + `<div class="msg-result"><span class="eyebrow">${escapeHtml(m.name)} quay · ${escapeHtml(m.game)} / ${escapeHtml(m.group)}</span><b>${escapeHtml(m.text)}</b></div>`;
  }
  const mine = m.clientId === clientId;
  const showName = !mine && (!prev || prev.clientId !== m.clientId || prev.type !== "text");
  return out + `<div class="msg ${mine ? "me" : "them"}" title="${fmtChatTime(m.at)}">${showName ? `<span class="msg-name">${escapeHtml(m.name)}</span>` : ""}<p>${escapeHtml(m.text)}</p></div>`;
}

function renderChat() {
  chatBody.innerHTML = net.messages.length
    ? net.messages.map((m, i) => msgHtml(m, net.messages[i - 1])).join("")
    : `<div class="chat-time">Chưa có tin nhắn nào. Nói gì đó đi!</div>`;
  chatBody.scrollTop = chatBody.scrollHeight;
  updateBadge();
  updatePeer();
}

function onChatMessage(m) {
  if (!net.messages.length) chatBody.innerHTML = "";
  const prev = net.messages[net.messages.length - 1];
  net.messages.push(m);
  const nearBottom = chatBody.scrollHeight - chatBody.scrollTop - chatBody.clientHeight < 120;
  chatBody.insertAdjacentHTML("beforeend", msgHtml(m, prev));
  const el = chatBody.lastElementChild;
  const mine = m.clientId === clientId;
  gsap.from(el, { y: 14, scale: 0.94, autoAlpha: 0, duration: 0.4, ease: "back.out(1.8)", transformOrigin: mine ? "100% 100%" : "0% 100%" });
  if (nearBottom || mine) chatBody.scrollTop = chatBody.scrollHeight;
  if (!mine) {
    net.peerTyping = false;
    updateTyping();
    if (m.type === "text") {
      pop();
      if (!chatOpen) {
        net.unread++;
        updateBadge();
        gsap.fromTo("#chatFab", { scale: 1 }, { scale: 1.15, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
      }
    }
  }
  updatePeer();
}

function updateBadge() {
  const b = $("#chatBadge");
  b.textContent = net.unread > 9 ? "9+" : net.unread;
  b.classList.toggle("show", net.unread > 0);
}

function openChat() {
  if (chatOpen) return closeChat();
  chatOpen = true;
  net.unread = 0;
  updateBadge();
  updatePeer();
  const chat = $("#chat");
  chat.classList.add("open");
  chat.setAttribute("aria-hidden", "false");
  gsap.fromTo(chat, { y: 40, autoAlpha: 0, scale: 0.97 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.45, ease: "power3.out", transformOrigin: "100% 100%" });
  chatBody.scrollTop = chatBody.scrollHeight;
  if (net.joined && matchMedia("(min-width: 700px)").matches) setTimeout(() => $("#chatText").focus(), 200);
}

function closeChat() {
  chatOpen = false;
  const chat = $("#chat");
  sendTyping(false);
  gsap.to(chat, {
    y: 30, autoAlpha: 0, duration: 0.25, ease: "power2.in",
    onComplete() {
      chat.classList.remove("open");
      chat.setAttribute("aria-hidden", "true");
    },
  });
}

let typingTimer = null;
let typingSent = false;
function sendTyping(on) {
  if (!net.joined || on === typingSent) return;
  typingSent = on;
  net.socket.emit("typing", on);
}

const chatText = $("#chatText");
function autoGrow() {
  chatText.style.height = "auto";
  chatText.style.height = Math.min(chatText.scrollHeight, 120) + "px";
}
chatText.addEventListener("input", () => {
  autoGrow();
  sendTyping(chatText.value.trim().length > 0);
  clearTimeout(typingTimer);
  typingTimer = setTimeout(() => sendTyping(false), 2000);
});
chatText.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    $("#chatForm").requestSubmit();
  }
});
$("#chatForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const text = chatText.value.trim();
  if (!text || !net.joined) return;
  net.socket.emit("chat:send", text);
  chatText.value = "";
  autoGrow();
  sendTyping(false);
  gsap.fromTo("#chatForm button", { scale: 0.85 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
});
$("#chatFab").addEventListener("click", openChat);
$("#chatClose").addEventListener("click", closeChat);

// ---------- phím tắt ----------
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if ($("#pairModal").classList.contains("open")) closePair();
    else if ($("#modal").classList.contains("open")) closeResult();
    else if (chatOpen) closeChat();
  }
  const typing = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
  const busy = $("#modal").classList.contains("open") || $("#pairModal").classList.contains("open");
  if (e.code === "Space" && !typing && !busy) {
    e.preventDefault();
    spin();
  }
});

// ---------- toast ----------
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  gsap.killTweensOf(t);
  gsap.timeline()
    .fromTo(t, { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: "back.out(2)" })
    .to(t, { autoAlpha: 0, y: 10, duration: 0.3, ease: "power2.in" }, "+=2");
}

// ---------- ambient ----------
function ambient() {
  if (REDUCED) return;
  document.querySelectorAll(".blob").forEach((b) => {
    gsap.to(b, {
      x: () => gsap.utils.random(-140, 140),
      y: () => gsap.utils.random(-100, 100),
      scale: () => gsap.utils.random(0.85, 1.2),
      duration: () => gsap.utils.random(9, 15),
      ease: "sine.inOut", repeat: -1, yoyo: true, repeatRefresh: true,
    });
  });
  gsap.fromTo(".spin-ring", { scale: 1, opacity: 0.7 }, { scale: 1.45, opacity: 0, duration: 1.8, ease: "power1.out", repeat: -1, repeatDelay: 0.3 });
}

function entrance() {
  const logoChars = splitChars($("#logo"), "Hai Đứa Mình");
  gsap.timeline({ defaults: { ease: "power3.out" } })
    .from(".hero-in", { autoAlpha: 0, y: 14, duration: 0.7, stagger: 0.1 }, 0)
    .from(logoChars, { y: "0.5em", autoAlpha: 0, rotation: 6, duration: 0.8, stagger: 0.035, ease: "back.out(1.8)" }, 0.1)
    .add(() => syncTabs(true), 0.2)
    .from(".reveal", { autoAlpha: 0, y: 30, duration: 0.8, stagger: 0.12 }, 0.45)
    .add(introWheel, 0.55)
    .from("#chatFab", { scale: 0, duration: 0.6, ease: "back.out(2)" }, 0.9);
}

// ---------- start ----------
// để GSAP quản lý phần căn giữa, tránh đè transform của CSS khi scale
gsap.set("#spinBtn", { xPercent: -50, yPercent: -50, x: 0, y: 0 });
gsap.set("#toast", { xPercent: -50, x: 0 });
buildTabs();
renderSound();
render(false);
resizeWheel();
renderChat();
updatePair();
if (!NET_OK) $("#chatFab").hidden = true;
entrance();
ambient();
connect();
// Mở link có ?room=... mà chưa vào phòng nào thì hiện bảng kết nối
if (NET_OK && urlRoom && (!session || session.room !== normRoom(urlRoom))) setTimeout(openPair, 1200);
window.addEventListener("resize", () => { resizeWheel(); syncTabs(true); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { drawWheel(); syncTabs(true); });
