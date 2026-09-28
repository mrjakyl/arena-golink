/* ============================================================
   8-BIT NBA — fan-made retro arcade basketball
   A single-file HTML5 canvas game. No external assets.
   P1: ARROWS + SPACE(shoot) X(steal) SHIFT(turbo)
   P2: WASD + G(shoot) H(steal) S(turbo)
   ============================================================ */
(function () {
'use strict';

/* ================= HELPERS ================= */
function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
function lerp(a, b, t) { return a + (b - a) * t; }
function sign(v) { return v < 0 ? -1 : (v > 0 ? 1 : 0); }
function rnd(a, b) { return a + Math.random() * (b - a); }
function irnd(a, b) { return Math.floor(rnd(a, b + 1)); }
function choice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function dist2(ax, ay, bx, by) { var dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
function pad(s, n) { s = String(s); while (s.length < n) s = '0' + s; return s; }
function fmtClock(fr) { var s = Math.ceil(fr / 60); var m = Math.floor(s / 60); s = s - m * 60; return m + ':' + pad(s, 2); }
function mulberry(seed) { return function () { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; var t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ================= DATA (pure JSON, extracted by tooling) ================= */
/*__DATA_START__*/
var DATA = {
  "teams": [
    { "abbr": "BOS", "city": "BOSTON",      "nick": "CELTICS",  "j": "#0f8a4c", "a": "#f2f2ea", "p": "#0f8a4c", "skin": "#f0c088", "hair": "#221a12" },
    { "abbr": "NYK", "city": "NEW YORK",    "nick": "KNICKS",   "j": "#1f5fc4", "a": "#f28c28", "p": "#1f5fc4", "skin": "#8a5a30", "hair": "#141414" },
    { "abbr": "CHI", "city": "CHICAGO",     "nick": "BULLS",    "j": "#d0382c", "a": "#141414", "p": "#141414", "skin": "#5c3a24", "hair": "#141414" },
    { "abbr": "GSW", "city": "GOLDEN ST",   "nick": "WARRIORS", "j": "#2655c9", "a": "#ffd23e", "p": "#2655c9", "skin": "#a06a3c", "hair": "#221a12" },
    { "abbr": "LAL", "city": "LOS ANGELES", "nick": "LAKERS",   "j": "#f0b03c", "a": "#4b2a86", "p": "#f0b03c", "skin": "#8a5a30", "hair": "#141414" },
    { "abbr": "PHX", "city": "PHOENIX",     "nick": "SUNS",     "j": "#5b2d8e", "a": "#f28c28", "p": "#5b2d8e", "skin": "#a06a3c", "hair": "#221a12" },
    { "abbr": "SAS", "city": "SAN ANTONIO", "nick": "SPURS",    "j": "#23252b", "a": "#c9ccd4", "p": "#23252b", "skin": "#f0c088", "hair": "#141414" },
    { "abbr": "MIA", "city": "MIAMI",       "nick": "HEAT",     "j": "#c8232f", "a": "#141414", "p": "#141414", "skin": "#5c3a24", "hair": "#141414" }
  ],
  "poses": {
    "stand": [
      "....KKKK....",
      "...KKKKKK...",
      "...KSSSSK...",
      "...KSSKSK...",
      "...KSSSSK...",
      "....SSSS....",
      "...JJJJJJ...",
      "..JJJJJJJJ..",
      ".JJJJJJJJJJ.",
      ".JJJJAAJJJJ.",
      ".JJJJAAJJJJ.",
      ".SSJJJJJJSS.",
      ".SSPPPPPPSS.",
      "..PPPPPPPP..",
      "..PPP..PPP..",
      "..SS....SS..",
      "..SS....SS..",
      "..SS....SS..",
      "..SS....SS..",
      "..SS....SS..",
      "..SS....SS..",
      "..SS....SS..",
      ".WWW....WWW.",
      ".WWW....WWW."
    ],
    "run1": [
      "....KKKK....",
      "...KKKKKK...",
      "...KSSSSK...",
      "...KSSKSK...",
      "...KSSSSK...",
      "....SSSS....",
      "...JJJJJJ...",
      "..JJJJJJJJ..",
      ".JJJJJJJJJJ.",
      ".JJJJAAJJJJ.",
      ".JJJJAAJJJJ.",
      ".SSJJJJJJSS.",
      ".SSPPPPPPSS.",
      "..PPPPPPPP..",
      "..PPP..PPP..",
      ".SSS....SSS.",
      ".SS......SS.",
      ".SS......SS.",
      ".SS......SS.",
      ".SS......SS.",
      ".SS......SS.",
      "WWW......WW.",
      "WWW.....WWW.",
      "............"
    ],
    "run2": [
      "....KKKK....",
      "...KKKKKK...",
      "...KSSSSK...",
      "...KSSKSK...",
      "...KSSSSK...",
      "....SSSS....",
      "...JJJJJJ...",
      "..JJJJJJJJ..",
      ".JJJJJJJJJJ.",
      ".JJJJAAJJJJ.",
      ".JJJJAAJJJJ.",
      ".SSJJJJJJSS.",
      ".SSPPPPPPSS.",
      "..PPPPPPPP..",
      "..PPP..PPP..",
      "..SSS.SSS...",
      "...SS..SS...",
      "...SS..SS...",
      "...SS..SS...",
      "....S..SS...",
      "....WW.WW...",
      "...WWW.WW...",
      "............",
      "............"
    ],
    "jump": [
      "....KKKK....",
      "...KKKKKK...",
      "..SKSSSSKS..",
      "..SKSSKSKS..",
      "..SKSSSSKS..",
      "..S..SS..S..",
      "..SJJJJJJS..",
      "..JJJJJJJJ..",
      "..JJJJJJJJ..",
      "..JJJAAJJJ..",
      "..JJJAAJJJ..",
      "..JJJJJJJJ..",
      "..PPPPPPPP..",
      "..PPPPPPPP..",
      "..PPP..PPP..",
      "..SS....SS..",
      "..SS....SS..",
      "..SSS..SSS..",
      "...SS..SS...",
      "....S..S....",
      "............",
      "............",
      "............",
      "............"
    ],
    "shoot": [
      "..S......S..",
      "..S.KKKK.S..",
      "..SKKKKKKS..",
      "..SKSSKSKS..",
      "..SKSSSSKS..",
      "..S..SS..S..",
      "..SJJJJJJS..",
      "..JJJJJJJJ..",
      "..JJJJJJJJ..",
      "..JJJAAJJJ..",
      "..JJJAAJJJ..",
      "..JJJJJJJJ..",
      "..PPPPPPPP..",
      "..PPPPPPPP..",
      "..PP....PP..",
      "..SS....SS..",
      "..SS....SS..",
      "..SS....SS..",
      "..SS....SS..",
      "..SS....SS..",
      "..SS....SS..",
      "..SS....SS..",
      ".WWW....WWW.",
      ".WWW....WWW."
    ],
    "defend": [
      ".S........S.",
      ".S..KKKK..S.",
      ".S.KKKKKK.S.",
      ".S.KSSKSK.S.",
      ".S.KSSSSK.S.",
      ".S..SSSS..S.",
      ".S.JJJJJJ.S.",
      "..JJJJJJJJ..",
      "..JJJJJJJJ..",
      "..JJJAAJJJ..",
      "..JJJAAJJJ..",
      "..JJJJJJJJ..",
      "..PPPPPPPP..",
      ".PPPPPPPPPP.",
      ".PPP....PPP.",
      ".SS......SS.",
      ".SS......SS.",
      ".SS......SS.",
      ".SS......SS.",
      ".SS......SS.",
      ".SS......SS.",
      ".SS......SS.",
      "WWW......WWW",
      "WWW......WWW"
    ],
    "dunk": [
      ".........S..",
      ".........S..",
      "....KKKK.S..",
      "...KKKKKKS..",
      "...KSSSSKS..",
      "...KSSKSK...",
      "...KSSSSK...",
      "....SSSS....",
      "...JJJJJJS..",
      "..JJJJJJJ...",
      "..JJJAAJJ...",
      "..JJJAAJJ...",
      "..JJJJJJJJ..",
      "..PPPPPPPP..",
      "..PPP..PPP..",
      "..SS...SSS..",
      ".SSS....SS..",
      ".SS.....SS..",
      ".SS......S..",
      "............",
      "............",
      "............",
      "............",
      "............"
    ],
    "lunge": [
      "............",
      "....KKKK....",
      "...KKKKKK...",
      "...KSSSSK...",
      "...KSSKSK...",
      "....SSSS....",
      "...JJJJJJSSS",
      "..JJJJJJJSSS",
      ".JJJJJJJJJ..",
      ".JJJJAAJJ...",
      ".JJJJAAJJ...",
      ".SSJJJJJJ...",
      ".SSPPPPPP...",
      "..PPPPPPPP..",
      "..PPP..PPP..",
      "..SS....SS..",
      ".SSS....SS..",
      ".SS.....SS..",
      ".SS.....SS..",
      "SS......SS..",
      "SS.....SS...",
      "............",
      "WWW...WWW...",
      "............"
    ]
  },
  "ball": [
    [".OOO.", "OOOOO", "ODDDO", "OOOOO", ".OOO."],
    [".OOO.", "OODOO", "OODOO", "OODOO", ".OOO."]
  ],
  "font": {
    "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "B": ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
    "C": [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
    "D": ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
    "E": ["#####", "#....", "#....", "####.", "#....", "#....", "#####"],
    "F": ["#####", "#....", "#....", "####.", "#....", "#....", "#...."],
    "G": [".###.", "#...#", "#....", "#.###", "#...#", "#...#", ".###."],
    "H": ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "I": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
    "J": ["..###", "...#.", "...#.", "...#.", "...#.", "#..#.", ".##.."],
    "K": ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
    "L": ["#....", "#....", "#....", "#....", "#....", "#....", "#####"],
    "M": ["#...#", "##.##", "#.#.#", "#.#.#", "#...#", "#...#", "#...#"],
    "N": ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
    "O": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "P": ["####.", "#...#", "#...#", "####.", "#....", "#....", "#...."],
    "Q": [".###.", "#...#", "#...#", "#...#", "#.#.#", "#..#.", ".##.#"],
    "R": ["####.", "#...#", "#...#", "####.", "#.#..", "#..#.", "#...#"],
    "S": [".####", "#....", "#....", ".###.", "....#", "....#", "####."],
    "T": ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
    "U": ["#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "V": ["#...#", "#...#", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
    "W": ["#...#", "#...#", "#...#", "#.#.#", "#.#.#", "##.##", "#...#"],
    "X": ["#...#", "#...#", ".#.#.", "..#..", ".#.#.", "#...#", "#...#"],
    "Y": ["#...#", "#...#", ".#.#.", "..#..", "..#..", "..#..", "..#.."],
    "Z": ["#####", "....#", "...#.", "..#..", ".#...", "#....", "#####"],
    "0": [".###.", "#...#", "#..##", "#.#.#", "##..#", "#...#", ".###."],
    "1": ["..#..", ".##..", "..#..", "..#..", "..#..", "..#..", "#####"],
    "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#####"],
    "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
    "4": ["...#.", "..##.", ".#.#.", "#..#.", "#####", "...#.", "...#."],
    "5": ["#####", "#....", "#....", "####.", "....#", "....#", "####."],
    "6": ["..##.", ".#...", "#....", "####.", "#...#", "#...#", ".###."],
    "7": ["#####", "....#", "...#.", "..#..", ".#...", ".#...", ".#..."],
    "8": [".###.", "#...#", "#...#", ".###.", "#...#", "#...#", ".###."],
    "9": [".###.", "#...#", "#...#", ".####", "....#", "...#.", ".##.."],
    " ": [".....", ".....", ".....", ".....", ".....", ".....", "....."],
    ".": [".....", ".....", ".....", ".....", ".....", ".##..", ".##.."],
    "!": ["..#..", "..#..", "..#..", "..#..", "..#..", ".....", "..#.."],
    "?": [".###.", "#...#", "....#", "..##.", "..#..", ".....", "..#.."],
    ":": [".....", ".##..", ".##..", ".....", ".##..", ".##..", "....."],
    "-": [".....", ".....", ".....", "#####", ".....", ".....", "....."],
    "'": ["..#..", "..#..", "..#..", ".....", ".....", ".....", "....."],
    "/": ["....#", "....#", "...#.", "..#..", ".#...", "#....", "#...."],
    "#": [".#.#.", ".#.#.", "#####", ".#.#.", "#####", ".#.#.", ".#.#."],
    ">": ["#....", ".#...", "..#..", "...#.", "..#..", ".#...", "#...."]
  },
  "ads": ["PIXL-COLA", "HANGTIME", "RETRO AIR", "8-BIT SPORTS", "DUNK-O-RAMA", "ZAP COLA"],
  "crowdColors": ["#c8452f", "#3e6fb0", "#d8b13c", "#3f9d55", "#c8c8c8", "#8a5fb0", "#e08040", "#4ab0b0"]
};
/*__DATA_END__*/

/* ================= CONSTANTS ================= */
var W = 384, H = 216;
var FLOOR = 170;              // players' feet line
var GRAV = 0.35;              // player gravity
var BALL_GRAV = 0.16;
var BALL_R = 3;
var QLEN = 60 * 30;           // 30s quarters
var OTLEN = 60 * 15;          // 15s overtime
var SHOTLEN = 60 * 12;        // 12s shot clock
var THREE_DIST = 78;          // min x-dist from rim for a 3
var HOOPS = [
  { idx: 0, side: 1,  boardX: 10,  rimBack: 11, rimFront: 25, rimCX: 18,  rimY: 116, boardTop: 98, boardBot: 130, inL: 13, inR: 23 },
  { idx: 1, side: -1, boardX: 374, rimBack: 373, rimFront: 359, rimCX: 366, rimY: 116, boardTop: 98, boardBot: 130, inL: 361, inR: 371 }
];
var DIFF = {
  rookie: { label: "ROOKIE", spd: 0.86, aimErr: 0.16, shootP: 0.020, stealP: 0.004, blockP: 0.013, shootMin: 34, shootMax: 88, dunkP: 0.030, jukeP: 0.010 },
  pro:    { label: "PRO",    spd: 1.00, aimErr: 0.11, shootP: 0.030, stealP: 0.008, blockP: 0.028, shootMin: 26, shootMax: 86, dunkP: 0.060, jukeP: 0.022 },
  legend: { label: "LEGEND", spd: 1.12, aimErr: 0.05, shootP: 0.042, stealP: 0.015, blockP: 0.050, shootMin: 22, shootMax: 84, dunkP: 0.100, jukeP: 0.034 }
};
var SLAM_TXT = ["SLAM!", "JAM!", "BOOMSHAKALAKA!", "MONSTER JAM!", "POSTERIZED!"];

/* ================= GLOBAL STATE ================= */
var G = {
  screen: 'title',        // title | select | game
  titleStage: 'press',    // press | menu
  titleIdx: 0,
  sel: null,              // selection flow state
  match: null,            // the real match
  demo: null,             // attract-mode match behind title
  paused: false,
  muted: false,
  crt: true,
  t: 0,
  flash: 0
};

/* ================= CANVAS ================= */
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function fit() {
  var availW = window.innerWidth - 16;
  var availH = window.innerHeight - 64;
  var s = Math.min(availW / W, availH / H);
  if (s >= 1) s = Math.floor(s);
  canvas.style.width = Math.round(W * s) + 'px';
  canvas.style.height = Math.round(H * s) + 'px';
}
window.addEventListener('resize', fit);
fit();

/* ================= INPUT ================= */
var keys = {};
var pressed = {};
var PREVENT = { 'ArrowLeft': 1, 'ArrowRight': 1, 'ArrowUp': 1, 'ArrowDown': 1, 'Space': 1 };
var P1KEYS = { left: ['ArrowLeft'], right: ['ArrowRight'], jump: ['ArrowUp'], shoot: ['Space'], steal: ['KeyX'], turbo: ['ShiftLeft', 'ShiftRight'] };
var P2KEYS = { left: ['KeyA'], right: ['KeyD'], jump: ['KeyW'], shoot: ['KeyG'], steal: ['KeyH'], turbo: ['KeyS'] };

function held() { for (var i = 0; i < arguments.length; i++) { if (keys[arguments[i]]) return true; } return false; }
function hit() { for (var i = 0; i < arguments.length; i++) { if (pressed[arguments[i]]) return true; } return false; }
function keysFor(p) { return p.i === 0 ? P1KEYS : P2KEYS; }

window.addEventListener('keydown', function (e) {
  if (PREVENT[e.code]) e.preventDefault();
  if (!keys[e.code]) pressed[e.code] = true;
  keys[e.code] = true;
  ensureAudio();
  if (e.code === 'KeyM') { G.muted = !G.muted; }
  if (e.code === 'KeyC') { G.crt = !G.crt; document.getElementById('crt').style.display = G.crt ? 'block' : 'none'; }
});
window.addEventListener('keyup', function (e) { keys[e.code] = false; });
window.addEventListener('blur', function () { keys = {}; });
function clearPressed() { pressed = {}; }

/* ================= AUDIO ================= */
var AC = null, master = null, sfxGain = null, musGain = null, noiseBuf = null;
var songTimer = null;

function ensureAudio() {
  if (AC) { if (AC.state === 'suspended') AC.resume(); return; }
  try {
    var Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return;
    AC = new Ctor();
    master = AC.createGain(); master.gain.value = 0.9; master.connect(AC.destination);
    sfxGain = AC.createGain(); sfxGain.gain.value = 0.5; sfxGain.connect(master);
    musGain = AC.createGain(); musGain.gain.value = 0.30; musGain.connect(master);
    noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
    var d = noiseBuf.getChannelData(0);
    for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    if (!songTimer) songTimer = setInterval(musicTick, 30);
  } catch (err) { AC = null; }
}
function tone(o) {
  if (!AC || G.muted) return;
  var t0 = AC.currentTime + (o.at || 0);
  var dur = o.dur || 0.1;
  var osc = AC.createOscillator();
  osc.type = o.type || 'square';
  osc.frequency.setValueAtTime(Math.max(20, o.f), t0);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(Math.max(20, o.f2), t0 + dur);
  var g = AC.createGain();
  g.gain.setValueAtTime(o.vol || 0.15, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g); g.connect(o.mus ? musGain : sfxGain);
  osc.start(t0); osc.stop(t0 + dur + 0.03);
}
function noiseBurst(o) {
  if (!AC || G.muted) return;
  var t0 = AC.currentTime + (o.at || 0);
  var dur = o.dur || 0.15;
  var src = AC.createBufferSource();
  src.buffer = noiseBuf; src.loop = true;
  var flt = AC.createBiquadFilter();
  flt.type = o.ft || 'bandpass';
  flt.frequency.setValueAtTime(o.f || 800, t0);
  if (o.f2) flt.frequency.exponentialRampToValueAtTime(Math.max(40, o.f2), t0 + dur);
  flt.Q.value = o.q || 1;
  var g = AC.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.vol || 0.2, t0 + (o.attack || 0.01));
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  src.connect(flt); flt.connect(g); g.connect(o.mus ? musGain : sfxGain);
  src.start(t0); src.stop(t0 + dur + 0.03);
}
var sfx = {
  blip: function () { tone({ f: 660, dur: 0.05, vol: 0.10 }); },
  confirm: function () { tone({ f: 523, dur: 0.06, vol: 0.12 }); tone({ f: 784, dur: 0.09, vol: 0.12, at: 0.06 }); },
  back: function () { tone({ f: 400, f2: 200, dur: 0.1, vol: 0.1 }); },
  dribble: function () { tone({ f: 95, f2: 55, dur: 0.07, type: 'sine', vol: 0.22 }); },
  floorBounce: function () { tone({ f: 130, f2: 70, dur: 0.08, type: 'sine', vol: 0.2 }); },
  clank: function () { tone({ f: 320, f2: 170, dur: 0.08, vol: 0.13 }); tone({ f: 880, f2: 840, dur: 0.04, vol: 0.05 }); },
  board: function () { tone({ f: 210, f2: 150, dur: 0.07, vol: 0.11 }); },
  swish: function () { noiseBurst({ ft: 'highpass', f: 1800, f2: 4200, dur: 0.20, vol: 0.22 }); tone({ f: 1318, dur: 0.05, type: 'triangle', vol: 0.06, at: 0.02 }); },
  buzzer: function () { tone({ f: 165, dur: 0.9, type: 'sawtooth', vol: 0.25 }); tone({ f: 168, dur: 0.9, type: 'square', vol: 0.12 }); },
  whistle: function () { tone({ f: 2300, dur: 0.10, type: 'sine', vol: 0.10 }); tone({ f: 2300, dur: 0.14, type: 'sine', vol: 0.10, at: 0.13 }); },
  steal: function () { tone({ f: 900, f2: 280, dur: 0.13, vol: 0.12 }); },
  block: function () { noiseBurst({ ft: 'lowpass', f: 420, dur: 0.1, vol: 0.26 }); tone({ f: 95, dur: 0.09, type: 'sine', vol: 0.2 }); },
  tick: function (c) { tone({ f: 260 + c * 520, dur: 0.03, vol: 0.05 }); },
  green: function () { tone({ f: 1046, dur: 0.05, vol: 0.07 }); },
  jump: function () { tone({ f: 190, f2: 340, dur: 0.1, vol: 0.06 }); },
  whoosh: function () { noiseBurst({ ft: 'bandpass', f: 500, f2: 1700, dur: 0.22, vol: 0.10, q: 2 }); },
  fire: function () { tone({ f: 392, f2: 784, dur: 0.3, type: 'sawtooth', vol: 0.1 }); tone({ f: 588, f2: 1175, dur: 0.3, type: 'square', vol: 0.06, at: 0.05 }); },
  cheer: function (big) {
    noiseBurst({ ft: 'bandpass', f: 700, f2: 1400, dur: big ? 1.1 : 0.5, vol: big ? 0.30 : 0.18, attack: 0.08, q: 0.7 });
  },
  charge: function () { tone({ f: 130, f2: 420, dur: 0.4, type: 'sawtooth', vol: 0.07 }); }
};

/* ---- music sequencer ---- */
var SONGS = {
  menu: {
    bpm: 104,
    bass: [36, 0, 0, 0, 43, 0, 0, 0, 36, 0, 0, 0, 43, 0, 0, 0, 36, 0, 0, 0, 43, 0, 0, 0, 41, 0, 0, 0, 43, 0, 45, 0],
    lead: [72, 0, 76, 0, 79, 0, 84, 0, 83, 0, 79, 0, 76, 0, 79, 0, 72, 0, 76, 0, 79, 0, 84, 0, 86, 0, 84, 0, 79, 0, 76, 0],
    drums: "k...s...k...s...k...s...k...s.k."
  },
  game: {
    bpm: 138,
    bass: [45, 0, 45, 0, 57, 0, 45, 0, 43, 0, 43, 0, 45, 0, 38, 0, 45, 0, 45, 0, 57, 0, 45, 0, 48, 0, 50, 0, 52, 0, 43, 0],
    lead: [0, 0, 69, 0, 0, 0, 72, 0, 0, 0, 74, 0, 0, 72, 0, 0, 0, 0, 69, 0, 0, 0, 72, 0, 76, 0, 77, 0, 76, 0, 74, 0],
    drums: "k.h.s.h.k.h.s.hhk.h.s.h.k.h.s.hk"
  }
};
var song = null, songName = '', songStep = 0, songNext = 0;
function midiF(n) { return 440 * Math.pow(2, (n - 69) / 12); }
function playSong(name) {
  if (songName === name) return;
  songName = name; song = SONGS[name] || null; songStep = 0;
  if (AC) songNext = AC.currentTime + 0.08;
}
function stopSong() { songName = ''; song = null; }
function musicTick() {
  if (!AC || !song || G.muted) { if (AC) songNext = AC.currentTime + 0.08; return; }
  var stepDur = (60 / song.bpm) / 4;
  while (songNext < AC.currentTime + 0.14) {
    var at = songNext - AC.currentTime;
    var b = song.bass[songStep % song.bass.length];
    if (b) tone({ f: midiF(b), dur: stepDur * 0.9, type: 'triangle', vol: 0.16, at: at, mus: true });
    var l = song.lead[songStep % song.lead.length];
    if (l) tone({ f: midiF(l), dur: stepDur * 0.85, type: 'square', vol: 0.055, at: at, mus: true });
    var d = song.drums[songStep % song.drums.length];
    if (d === 'k') { tone({ f: 150, f2: 45, dur: 0.09, type: 'sine', vol: 0.30, at: at, mus: true }); }
    else if (d === 's') { noiseBurst({ ft: 'bandpass', f: 1800, dur: 0.07, vol: 0.10, at: at, q: 1.2, mus: true }); }
    else if (d === 'h') { noiseBurst({ ft: 'highpass', f: 6000, dur: 0.03, vol: 0.045, at: at, mus: true }); }
    songStep++;
    songNext += stepDur;
  }
}

/* ================= FONT ================= */
var glyphCache = {};
function glyphCanvas(ch, color, scale) {
  var key = ch + '|' + color + '|' + scale;
  var c = glyphCache[key];
  if (c) return c;
  var rows = DATA.font[ch];
  if (!rows) return null;
  c = document.createElement('canvas');
  c.width = 5 * scale; c.height = 7 * scale;
  var g = c.getContext('2d');
  g.fillStyle = color;
  for (var y = 0; y < 7; y++) {
    var r = rows[y] || '.....';
    for (var x = 0; x < 5; x++) {
      if (r.charAt(x) === '#') g.fillRect(x * scale, y * scale, scale, scale);
    }
  }
  glyphCache[key] = c;
  return c;
}
function textW(s, scale) { return s.length * 6 * scale - scale; }
function drawText(g, s, x, y, color, scale, align, shadow) {
  scale = scale || 1;
  s = String(s).toUpperCase();
  if (align === 'center') x = Math.round(x - textW(s, scale) / 2);
  else if (align === 'right') x = Math.round(x - textW(s, scale));
  x = Math.round(x); y = Math.round(y);
  for (var pass = (shadow ? 0 : 1); pass < 2; pass++) {
    var dx = x, dy = y + (pass === 0 ? 1 : 0);
    var col = pass === 0 ? '#000000' : color;
    for (var i = 0; i < s.length; i++) {
      var gl = glyphCanvas(s.charAt(i), col, scale);
      if (gl) g.drawImage(gl, dx + (pass === 0 ? 1 : 0), dy);
      dx += 6 * scale;
    }
  }
}

/* ================= SPRITES ================= */
var sheetCache = {};
function buildSprite(rows, pal) {
  var c = document.createElement('canvas');
  c.width = 12; c.height = 24;
  var g = c.getContext('2d');
  for (var y = 0; y < 24; y++) {
    var r = (rows[y] || '').padEnd(12, '.');
    for (var x = 0; x < 12; x++) {
      var ch = r.charAt(x);
      var col = pal[ch];
      if (col) { g.fillStyle = col; g.fillRect(x, y, 1, 1); }
    }
  }
  return c;
}
function getSheet(teamIdx) {
  var c = sheetCache[teamIdx];
  if (c) return c;
  var t = DATA.teams[teamIdx];
  var pal = { K: t.hair, S: t.skin, J: t.j, A: t.a, P: t.p, W: '#f2f2ea' };
  c = {};
  for (var k in DATA.poses) c[k] = buildSprite(DATA.poses[k], pal);
  sheetCache[teamIdx] = c;
  return c;
}
function ballSprite(frame, fire) {
  var key = 'ball' + frame + (fire ? 'f' : '');
  var c = glyphCache[key];
  if (c) return c;
  c = document.createElement('canvas');
  c.width = 5; c.height = 5;
  var g = c.getContext('2d');
  var rows = DATA.ball[frame];
  for (var y = 0; y < 5; y++) {
    for (var x = 0; x < 5; x++) {
      var ch = rows[y].charAt(x);
      if (ch === '.') continue;
      if (ch === 'O') g.fillStyle = fire ? '#ffd23e' : '#e8722a';
      else g.fillStyle = fire ? '#e8722a' : '#7a3010';
      g.fillRect(x, y, 1, 1);
    }
  }
  glyphCache[key] = c;
  return c;
}

/* ================= ARENA (static background) ================= */
var arenaCanvas = null;
var crowdSpots = [];
function buildArena() {
  arenaCanvas = document.createElement('canvas');
  arenaCanvas.width = W; arenaCanvas.height = H;
  var g = arenaCanvas.getContext('2d');
  var R = mulberry(1234);

  // upper wall + banners
  g.fillStyle = '#0d1026'; g.fillRect(0, 0, W, 30);
  g.fillStyle = '#151a3a'; g.fillRect(0, 28, W, 4);
  var banX = 26;
  while (banX < W - 40) {
    g.fillStyle = (Math.floor(banX / 46) % 2 === 0) ? '#c8232f' : '#2655c9';
    g.fillRect(banX, 6, 34, 14);
    g.fillStyle = '#ffd23e';
    g.fillRect(banX + 3, 8, 28, 1); g.fillRect(banX + 3, 17, 28, 1);
    for (var bx = 0; bx < 3; bx++) { g.fillStyle = '#ffd23e'; g.fillRect(banX + 8 + bx * 9, 12, 3, 3); }
    banX += 46;
  }
  // stands
  g.fillStyle = '#171a33'; g.fillRect(0, 32, W, 56);
  g.fillStyle = '#10122a';
  for (var ry = 34; ry < 88; ry += 8) g.fillRect(0, ry + 6, W, 2);
  // crowd spots (rendered live; precompute positions/colors)
  crowdSpots = [];
  for (var row = 0; row < 7; row++) {
    for (var cx = 4; cx < W - 4; cx += 6) {
      crowdSpots.push({
        x: cx + Math.floor(R() * 2), y: 38 + row * 7,
        c: DATA.crowdColors[Math.floor(R() * DATA.crowdColors.length)],
        ph: Math.floor(R() * 60)
      });
    }
  }
  // ad boards
  g.fillStyle = '#0e1020'; g.fillRect(0, 88, W, 14);
  g.fillStyle = '#2a2f55'; g.fillRect(0, 88, W, 1); g.fillRect(0, 101, W, 1);
  for (var ai = 0; ai < DATA.ads.length; ai++) {
    var ax = 8 + ai * 64;
    drawText(g, DATA.ads[ai], ax, 92, ai % 2 ? '#ffd23e' : '#e8e8f0', 1);
  }
  // court floor
  g.fillStyle = '#b5722f'; g.fillRect(0, 102, W, H - 102);
  g.fillStyle = '#c9864a'; g.fillRect(0, 102, W, 3);
  // wood planks
  g.fillStyle = 'rgba(0,0,0,0.10)';
  for (var px2 = 0; px2 < W; px2 += 24) g.fillRect(px2, 102, 1, H - 102);
  g.fillStyle = 'rgba(255,255,255,0.05)';
  for (var px3 = 12; px3 < W; px3 += 24) g.fillRect(px3, 102, 1, H - 102);
  g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, 160, W, 1);
  // sideline
  g.fillStyle = '#efe6cf'; g.fillRect(0, 152, W, 1);
  // painted keys
  g.fillStyle = '#8f4a1f'; g.fillRect(26, 152, 52, 64); g.fillRect(306, 152, 52, 64);
  g.fillStyle = '#efe6cf';
  g.fillRect(26, 152, 52, 1); g.fillRect(26, 215, 52, 1); g.fillRect(26, 152, 1, 64); g.fillRect(78, 152, 1, 64);
  g.fillRect(306, 152, 52, 1); g.fillRect(306, 215, 52, 1); g.fillRect(306, 152, 1, 64); g.fillRect(358, 152, 1, 64);
  g.fillRect(26, 190, 52, 1); g.fillRect(306, 190, 52, 1); // free throw lines
  // center circle
  g.strokeStyle = '#efe6cf'; g.lineWidth = 1;
  g.beginPath(); g.ellipse(192, 184, 24, 11, 0, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#efe6cf'; g.fillRect(191, 152, 1, 64);
  // 3pt marks
  g.fillStyle = '#efe6cf';
  g.fillRect(96, 152, 1, 64); g.fillRect(287, 152, 1, 64);
  drawText(g, "3", 99, 196, '#efe6cf', 1);
  drawText(g, "3", 279, 196, '#efe6cf', 1);
  // hoop poles + backboards
  drawHoopStatic(g, HOOPS[0]);
  drawHoopStatic(g, HOOPS[1]);
}
function drawHoopStatic(g, h) {
  // pole
  g.fillStyle = '#3a3f52';
  g.fillRect(h.boardX - (h.side === 1 ? 0 : 2), 104, 2, 66);
  g.fillStyle = '#2a2f40'; g.fillRect(h.boardX - (h.side === 1 ? 0 : 2), 104, 2, 66 - 40);
  // backboard
  g.fillStyle = '#e8ecf4';
  g.fillRect(h.boardX - (h.side === 1 ? 0 : 1), h.boardTop, 1, h.boardBot - h.boardTop);
  g.fillStyle = '#e5484d';
  g.fillRect(h.boardX - (h.side === 1 ? 1 : 1), h.boardTop + 14, h.side === 1 ? 1 : 1, 5);
  g.fillStyle = '#c8ccd8';
  g.fillRect(h.boardX - (h.side === 1 ? 1 : 1), h.boardTop, 1, 1);
}

/* ================= PARTICLES / POPUPS ================= */
function spawnParts(m, n, fn) { for (var i = 0; i < n; i++) m.parts.push(fn(i)); }
function confetti(m, x, y, n) {
  spawnParts(m, n, function () {
    return { type: 'cf', x: x + rnd(-4, 4), y: y + rnd(-4, 4), vx: rnd(-1.4, 1.4), vy: rnd(-2.4, -0.4), g: 0.09, t: 0, life: irnd(40, 80), c: choice(DATA.crowdColors) };
  });
}
function dust(m, x, y) {
  spawnParts(m, 3, function () {
    return { type: 'px', x: x + rnd(-3, 3), y: y + rnd(-1, 1), vx: rnd(-0.5, 0.5), vy: rnd(-0.4, -0.1), g: 0.01, t: 0, life: 18, c: '#d8c8a8' };
  });
}
function fireTrail(m, x, y) {
  m.parts.push({ type: 'fr', x: x + rnd(-1.5, 1.5), y: y + rnd(-1.5, 1.5), vx: rnd(-0.2, 0.2), vy: rnd(-0.3, 0.1), g: -0.005, t: 0, life: 14, c: Math.random() < 0.5 ? '#ffd23e' : '#f0742a' });
}
function ring(m, x, y) {
  m.parts.push({ type: 'ring', x: x, y: y, vx: 0, vy: 0, g: 0, t: 0, life: 14, c: '#ffd23e' });
}
function updateParts(m) {
  for (var i = m.parts.length - 1; i >= 0; i--) {
    var p = m.parts[i];
    p.t++; p.x += p.vx; p.y += p.vy; p.vy += p.g;
    if (p.t > p.life) m.parts.splice(i, 1);
  }
}
function renderParts(g, m) {
  for (var i = 0; i < m.parts.length; i++) {
    var p = m.parts[i];
    if (p.type === 'ring') {
      var r = 3 + p.t * 1.6;
      g.globalAlpha = 1 - p.t / p.life;
      g.strokeStyle = p.c; g.lineWidth = 1;
      g.beginPath(); g.arc(p.x, p.y, r, 0, Math.PI * 2); g.stroke();
      g.globalAlpha = 1;
      continue;
    }
    g.globalAlpha = 1 - p.t / p.life;
    g.fillStyle = p.c;
    if (p.type === 'cf' && (p.t & 3) < 2) g.fillStyle = '#f2f2ea';
    g.fillRect(Math.round(p.x), Math.round(p.y), p.type === 'fr' ? 2 : 1, p.type === 'fr' ? 2 : (p.type === 'cf' ? 2 : 1));
  }
  g.globalAlpha = 1;
}
function popup(m, txt, x, y, color, scale, rise) {
  m.popups.push({ txt: txt, x: clamp(x, 30, W - 30), y: clamp(y, 26, H - 16), c: color || '#f2f2ea', s: scale || 1, t: 0, life: 70, rise: rise === false ? 0 : 0.28 });
}
function announce(m, txt, color) { m.ann = { txt: txt, c: color || '#ffd23e', t: 0, life: 110 }; }
function updatePopups(m) {
  for (var i = m.popups.length - 1; i >= 0; i--) {
    var p = m.popups[i];
    p.t++; p.y -= p.rise;
    if (p.t > p.life) m.popups.splice(i, 1);
  }
  if (m.ann) { m.ann.t++; if (m.ann.t > m.ann.life) m.ann = null; }
}
function renderPopups(g, m) {
  for (var i = 0; i < m.popups.length; i++) {
    var p = m.popups[i];
    var a = p.t < 50 ? 1 : 1 - (p.t - 50) / 20;
    g.globalAlpha = clamp(a, 0, 1);
    drawText(g, p.txt, p.x, p.y, p.c, p.s, 'center', true);
  }
  g.globalAlpha = 1;
  if (m.ann) {
    var an = m.ann;
    var a2 = an.t < 8 ? an.t / 8 : (an.t > an.life - 20 ? (an.life - an.t) / 20 : 1);
    g.globalAlpha = clamp(a2, 0, 1);
    var yy = 34 + (an.t < 8 ? (8 - an.t) * -2 : 0);
    g.fillStyle = 'rgba(10,12,32,0.78)';
    var wid = textW(an.txt, 2) + 16;
    g.fillRect(Math.round(192 - wid / 2), yy - 4, wid, 20);
    g.fillStyle = an.c; g.fillRect(Math.round(192 - wid / 2), yy - 4, wid, 1); g.fillRect(Math.round(192 - wid / 2), yy + 15, wid, 1);
    drawText(g, an.txt, 192, yy, an.c, 2, 'center', true);
    g.globalAlpha = 1;
  }
}

/* ================= MATCH ================= */
function makePlayer(i, team, human) {
  return {
    i: i, team: team, human: human,
    x: i === 0 ? 140 : 244, y: FLOOR, vx: 0, vy: 0, onGround: true,
    facing: i === 0 ? 1 : -1,
    charging: false, charge: 0, state: 'normal',
    stun: 0, stealCd: 0, grabCd: 0, stealAnim: 0,
    turbo: 1, turboOn: false,
    fire: false, fireT: 0, streak: 0,
    runPh: 0, animT: irnd(0, 60), dribPh: 0, dribHit: false,
    ai: { juke: 0, releaseAt: 0.76, thinkT: 0 },
    stats: { pts: 0, fgm: 0, fga: 0, tpm: 0, tpa: 0, stl: 0, blk: 0 }
  };
}
function createMatch(cfg) {
  var m = {
    cfg: cfg,
    players: [makePlayer(0, cfg.teamA, cfg.humans[0]), makePlayer(1, cfg.teamB, cfg.humans[1])],
    ball: { x: 192, y: 120, vx: 0, vy: 0, state: 'held', holder: 0, shooter: -1, lastTouch: 0, beyond3: false, flightT: 0, prevY: 120, dribPh: 0, dribHit: false, spin: 0, rimTouched: false, boardTouched: false, blocked: false, noStealT: 0 },
    score: [0, 0], quarter: 1, clock: QLEN, shotClock: SHOTLEN,
    phase: 'tipoff', phaseT: 80, phaseLabel: 'TIP OFF!', nextPoss: 0,
    popups: [], parts: [], ann: null,
    shake: 0, hype: 0, t: 0, hintT: 400, waitBuzz: false, over: false, winner: -1,
    rimShake: [0, 0], netAnim: [0, 0], boardFlash: [0, 0],
    lastShot: null
  };
  return m;
}
function attackHoop(teamIdx) { return HOOPS[teamIdx === 0 ? 1 : 0]; }
function holderOf(m) { return m.ball.state === 'held' ? m.players[m.ball.holder] : null; }
function giveBall(m, pi) {
  m.ball.state = 'held'; m.ball.holder = pi; m.ball.noStealT = 45;
  m.ball.rimTouched = false; m.ball.boardTouched = false; m.ball.blocked = false;
  m.ball.vx = 0; m.ball.vy = 0; m.shotClock = SHOTLEN;
  m.players[pi].charging = false;
}
function qPoss(q) { return q === 1 ? 0 : (q === 2 ? 1 : (q === 3 ? 1 : (q === 4 ? 0 : (q % 2 === 1 ? 1 : 0)))); }
function qLabel(q) { return q === 1 ? '1ST' : (q === 2 ? '2ND' : (q === 3 ? '3RD' : (q === 4 ? '4TH' : 'OT'))); }

function beginQuarter(m) {
  m.quarter = m.nextQuarter;
  m.clock = m.quarter >= 5 ? OTLEN : QLEN;
  m.phase = 'tipoff'; m.phaseT = 80;
  m.phaseLabel = m.quarter >= 5 ? 'OVERTIME!' : (qLabel(m.quarter) + ' QUARTER');
  var poss = qPoss(m.quarter);
  m.nextPoss = poss;
  setupPossession(m, poss);
  m.waitBuzz = false;
  m.shotClock = SHOTLEN;
}
function setupPossession(m, teamIdx) {
  var p = m.players[teamIdx];
  var other = m.players[1 - teamIdx];
  p.x = teamIdx === 0 ? 76 : 308; p.y = FLOOR; p.vx = 0; p.vy = 0; p.onGround = true; p.facing = teamIdx === 0 ? 1 : -1;
  p.state = 'normal'; p.stun = 0; p.charging = false;
  other.x = teamIdx === 0 ? 250 : 134; other.y = FLOOR; other.vx = 0; other.vy = 0; other.onGround = true;
  other.state = 'normal'; other.stun = 0; other.charging = false;
  giveBall(m, teamIdx);
}
function beginLive(m) { m.phase = 'live'; sfx.whistle(); }
function doInbound(m) {
  m.phase = 'live';
  var t = m.nextPoss;
  var p = m.players[t];
  var hoop = attackHoop(1 - t); // hoop where the basket was scored = the new attacking team's target... place them at their backcourt
  p.x = clamp(p.x, 40, W - 40);
  if (Math.abs(p.x - attackHoop(t).rimCX) > 150) { /* keep position */ }
  p.x = t === 0 ? clamp(p.x, 40, 160) : clamp(p.x, 224, 344);
  giveBall(m, t);
  m.waitBuzz = false;
  if (m.clock <= 0) { endQuarter(m); }
}

/* ---------- controls ---------- */
function readHuman(p) {
  var k = keysFor(p);
  return {
    left: held.apply(null, k.left), right: held.apply(null, k.right),
    jump: hit.apply(null, k.jump),
    shoot: held.apply(null, k.shoot),
    steal: hit.apply(null, k.steal),
    turbo: held.apply(null, k.turbo)
  };
}
var NULLCTRL = { left: false, right: false, jump: false, shoot: false, steal: false, turbo: false };

function aiControl(m, p) {
  var c = { left: false, right: false, jump: false, shoot: false, steal: false, turbo: false };
  var D = DIFF[m.cfg.difficulty] || DIFF.pro;
  var b = m.ball;
  var opp = m.players[1 - p.i];
  p.ai.thinkT++;

  if (b.state === 'held' && b.holder === p.i) {
    // ============ OFFENSE ============
    if (!p.ai.hadBall) { p.ai.hadBall = true; p.ai.mode = Math.random() < 0.32 ? 'perimeter' : 'attack'; }
    var hoop = attackHoop(p.i);
    var dist = Math.abs(hoop.rimCX - p.x);
    var odd = Math.abs(opp.x - p.x);
    var spotOff = p.ai.mode === 'perimeter'
      ? 86 + Math.sin(m.t * 0.011 + p.i) * 9
      : 30 + Math.sin(m.t * 0.013 + p.i * 3.1) * 16;
    var targetX = hoop.rimCX - sign(hoop.rimCX - p.x) * spotOff;
    if (p.ai.juke > 0) { p.ai.juke--; targetX = p.x - sign(hoop.rimCX - p.x) * 34; }
    else if (odd < 18 && Math.random() < D.jukeP) { p.ai.juke = irnd(12, 20); }
    var dx = targetX - p.x;
    if (Math.abs(dx) > 4) { if (dx > 0) c.right = true; else c.left = true; }
    c.turbo = odd > 30 && dist > 60 && p.turbo > 0.3;
    if (p.charging) {
      c.shoot = p.charge < p.ai.releaseAt; // hold the button until the intended release point
    } else {
      var urgent = m.shotClock < 140;
      var minD = p.ai.mode === 'perimeter' ? 78 : D.shootMin;
      var maxD = p.ai.mode === 'perimeter' ? 102 : D.shootMax;
      if (dist <= 24 && (odd > 16 || urgent) && Math.random() < D.dunkP) {
        c.shoot = true; // will dunk on release
        p.ai.releaseAt = 0.2; // quick release
      } else if (urgent && dist < 102 && p.onGround) {
        c.shoot = true;
        p.ai.releaseAt = 0.76 + rnd(-D.aimErr, D.aimErr);
      } else if (dist >= minD && dist <= maxD && (odd > 19 || Math.random() < 0.004) && Math.random() < D.shootP && p.onGround) {
        c.shoot = true;
        p.ai.releaseAt = 0.76 + rnd(-D.aimErr, D.aimErr);
      }
    }
  } else if (b.state === 'held') {
    // ============ DEFENSE ============
    p.ai.hadBall = false;
    var holder = m.players[b.holder];
    var myHoop = attackHoop(1 - p.i); // hoop opponent attacks
    var guardX = holder.x + sign(myHoop.rimCX - holder.x) * 15;
    var gdx = guardX - p.x;
    if (Math.abs(gdx) > 3) { if (gdx > 0) c.right = true; else c.left = true; }
    c.turbo = Math.abs(gdx) > 40 && p.turbo > 0.25;
    var hdd = Math.abs(holder.x - p.x);
    if (hdd < 16 && p.stealCd <= 0 && b.noStealT <= 0 && Math.random() < D.stealP) c.steal = true;
    if (holder.charging && holder.charge > 0.35 && hdd < 30 && p.onGround && Math.random() < D.blockP) c.jump = true;
    if (b.state === 'shot' && b.flightT < 10 && b.shooter !== p.i) {
      var hx = b.x + b.vx * 8;
      if (Math.abs(hx - p.x) < 14 && p.onGround && Math.random() < D.blockP * 2) c.jump = true;
    }
  } else {
    // ============ LOOSE BALL ============
    p.ai.hadBall = false;
    var bx = b.x + b.vx * 6;
    var ldx = bx - p.x;
    if (Math.abs(ldx) > 3) { if (ldx > 0) c.right = true; else c.left = true; }
    c.turbo = Math.abs(ldx) > 50 && p.turbo > 0.2;
    if (b.state === 'shot' && b.y < 130 && b.vy > 0 && Math.abs(b.x - p.x) < 10 && p.onGround && Math.random() < D.blockP) c.jump = true;
  }
  return c;
}

/* ---------- physics & actions ---------- */
function applyControl(m, p, c) {
  p.animT++;
  if (p.stun > 0) { p.stun--; c = NULLCTRL; }
  if (p.stealAnim > 0) p.stealAnim--;
  if (p.stealCd > 0) p.stealCd--;
  if (p.grabCd > 0) p.grabCd--;

  p.turboOn = c.turbo && p.turbo > 0.02 && !p.charging && p.state !== 'dunk';
  if (p.turboOn) p.turbo = Math.max(0, p.turbo - 1 / 65); else p.turbo = Math.min(1, p.turbo + 1 / 100);

  var spdMul = (p.turboOn ? 1.42 : 1) * (p.fire ? 1.1 : 1);
  if (!p.human) spdMul *= (DIFF[m.cfg.difficulty] || DIFF.pro).spd;
  var maxV = 1.5 * spdMul * (p.charging ? 0.45 : 1);

  if (p.state !== 'dunk') {
    var dir = (c.right ? 1 : 0) - (c.left ? 1 : 0);
    p.vx += dir * 0.24;
    if (dir === 0) p.vx *= 0.8;
    p.vx = clamp(p.vx, -maxV, maxV);
    if (dir !== 0) p.facing = dir;
    if (c.jump && p.onGround) { p.vy = -4.9; p.onGround = false; dust(m, p.x, FLOOR); sfx.jump(); }
  }

  p.vy += GRAV;
  p.y += p.vy;
  if (p.y >= FLOOR) {
    if (!p.onGround) {
      dust(m, p.x, FLOOR);
      if (p.state === 'dunk') dunkFail(m, p);
    }
    p.y = FLOOR; p.vy = 0; p.onGround = true;
    if (p.state === 'jumpshot') p.state = 'normal';
  }
  p.x += p.vx;
  p.x = clamp(p.x, 22, W - 22);

  var isHolder = m.ball.state === 'held' && m.ball.holder === p.i;
  if (isHolder) {
    if (c.shoot && p.onGround && p.state !== 'dunk') {
      if (!p.charging) { p.charging = true; p.charge = 0; sfx.charge(); }
      var prevC = p.charge;
      p.charge = Math.min(1, p.charge + 1 / 42);
      if ((p.animT & 3) === 0) sfx.tick(p.charge);
      if (prevC < 0.66 && p.charge >= 0.66 && p.charge <= 0.86) sfx.green();
      if (p.charge >= 1) releaseShot(m, p);
    } else if (p.charging && !c.shoot) {
      releaseShot(m, p);
    }
  } else {
    p.charging = false;
    if (c.shoot && p.onGround) { p.vy = -4.9; p.onGround = false; sfx.jump(); } // block jump
  }
  if (c.steal) trySteal(m, p);
  if (p.fire) {
    p.fireT--;
    if (p.fireT <= 0) { p.fire = false; popup(m, 'COOLED OFF', p.x, p.y - 34, '#9db2d8', 1); }
    else if ((p.animT & 1) === 0) fireTrail(m, p.x + rnd(-4, 4), p.y - irnd(0, 3));
  }
  p.runPh += Math.abs(p.vx) * 0.16;
}

function releaseShot(m, p) {
  var hoop = attackHoop(p.i);
  var dist = Math.abs(hoop.rimCX - p.x);
  var wasCharging = p.charging;
  p.charging = false;
  var charge = clamp(p.charge, 0, 1);
  p.charge = 0;
  if (!wasCharging) return;

  if (dist < 26 || (p.turboOn && dist < 42)) { startDunk(m, p, hoop); return; }

  // jump shot
  p.stats.fga++;
  var b3 = dist > THREE_DIST;
  if (b3) p.stats.tpa++;
  p.vy = -3.4; p.onGround = false;
  var b = m.ball;
  b.state = 'shot'; b.holder = -1; b.shooter = p.i; b.lastTouch = p.i;
  b.flightT = 0; b.rimTouched = false; b.boardTouched = false; b.blocked = false;
  b.beyond3 = b3; b.prevY = p.y - 27;
  b.x = p.x + p.facing * 2; b.y = p.y - 27;

  var err = 2.0 + dist * 0.052;
  var cd = Math.abs(charge - 0.76);
  err += cd <= 0.10 ? 0 : (cd - 0.10) * 26;
  if (charge > 0.97) err += 5;
  var opp = m.players[1 - p.i];
  var odd = Math.abs(opp.x - p.x);
  if (odd < 22) err += (odd < 13 ? 4.5 : 2) + (!opp.onGround ? 5 : 0);
  if (p.fire) err *= 0.45;
  if (!p.human) err += 0; // AI error comes from aim timing
  var ang = rnd(0, Math.PI * 2);
  var mag = err * rnd(0.3, 1.0);
  var tx = hoop.rimCX + Math.cos(ang) * mag;
  var ty = hoop.rimY + Math.sin(ang) * mag * 0.6;
  var T = clamp(24 + dist * 0.55, 28, 64);
  b.vx = (tx - b.x) / T + p.vx * 0.25;
  b.vy = (ty - b.y) / T - 0.5 * BALL_GRAV * T;
  m.lastShot = { shooter: p.i, clock: m.clock, b3: b3 };
  sfx.whoosh();
}

function startDunk(m, p, hoop) {
  p.state = 'dunk';
  p.stats.fga++;
  if (p.onGround) { p.vy = -4.7; p.onGround = false; }
  var dx = hoop.rimCX - p.x;
  p.vx = clamp(dx / 12, -3.4, 3.4);
  p.facing = sign(dx) || p.facing;
  sfx.jump();
}
function dunkFail(m, p) {
  p.state = 'normal';
  var b = m.ball;
  if (b.state === 'held' && b.holder === p.i) {
    b.state = 'loose'; b.shooter = p.i; b.flightT = 20;
    b.x = p.x + p.facing * 4; b.y = p.y - 20;
    b.vx = p.vx * 0.5 + rnd(-0.4, 0.4); b.vy = 0.4;
    p.grabCd = 26;
    shotMissed(m);
    popup(m, 'SWIPED AWAY!', p.x, p.y - 34, '#e5484d', 1);
  }
}
function slamDunk(m, p, hoop) {
  p.state = 'normal';
  p.vx *= 0.25; p.vy = 1;
  var b = m.ball;
  b.x = hoop.rimCX; b.y = hoop.rimY - 2; b.prevY = b.y;
  b.state = 'dead'; b.vx = rnd(-0.3, 0.3); b.vy = 1.5;
  m.shake = 10;
  m.rimShake[hoop.idx] = 16;
  ring(m, hoop.rimCX, hoop.rimY + 4);
  confetti(m, hoop.rimCX, hoop.rimY, 26);
  scoreBasket(m, hoop.idx, p.i, 'dunk');
}

function trySteal(m, p) {
  var b = m.ball;
  if (b.state !== 'held' || b.holder === p.i || p.stealCd > 0 || b.noStealT > 0) return;
  var victim = m.players[b.holder];
  var dd = Math.abs(victim.x - p.x);
  if (dd > 14 || Math.abs(victim.y - p.y) > 6) return;
  p.stealCd = 55;
  p.stealAnim = 12;
  // steal easier from behind (defender between victim and victim's target hoop)
  var hoop = attackHoop(victim.i);
  var behind = (p.x - victim.x) * sign(hoop.rimCX - victim.x) < 0;
  var chance = 0.24 + (behind ? 0.10 : 0) + (!p.human ? 0.05 : 0);
  if (victim.fire) chance -= 0.08;
  if (Math.random() < chance) {
    giveBall(m, p.i);
    victim.stun = 16; victim.charging = false;
    p.stats.stl++;
    popup(m, 'STEAL!', p.x, p.y - 36, '#ffd23e', 1);
    sfx.steal();
  } else {
    p.stun = 26;
    popup(m, 'REACH!', p.x, p.y - 34, '#9db2d8', 1);
  }
}

function shotMissed(m) {
  var b = m.ball;
  if (b.shooter >= 0) {
    var p = m.players[b.shooter];
    p.streak = 0; p.fire = false;
  }
}

function scoreBasket(m, hoopIdx, shooterIdx, kind) {
  var st = hoopIdx === 1 ? 0 : 1;
  var b = m.ball;
  var pts = kind === 'dunk' ? 2 : (b.beyond3 ? 3 : 2);
  m.score[st] += pts;
  var sp = shooterIdx >= 0 ? m.players[shooterIdx] : null;
  var txt;
  if (sp && sp.i === st) {
    sp.stats.fgm++; sp.stats.pts += pts;
    if (kind !== 'dunk' && b.beyond3) sp.stats.tpm++;
    sp.streak++;
    if (!sp.fire) {
      if (sp.streak === 2) { popup(m, 'HEATING UP...', sp.x, sp.y - 40, '#f0742a', 1); }
      if (sp.streak >= 3) {
        sp.fire = true; sp.fireT = 60 * 12;
        announce(m, "HE'S ON FIRE!", '#f0742a');
        confetti(m, sp.x, sp.y - 20, 20);
        sfx.fire(); sfx.cheer(true);
      }
    }
  } else if (sp) { sp.streak = 0; sp.fire = false; }

  if (kind === 'dunk') txt = choice(SLAM_TXT);
  else if (kind === 'bank') txt = b.beyond3 ? 'BANK 3!' : 'BANK!';
  else if (kind === 'swish') txt = b.beyond3 ? 'FROM DOWNTOWN!' : 'SWISH!';
  else txt = b.beyond3 ? 'THREE POINTS!' : 'GOOD!';
  var hoop = HOOPS[hoopIdx];
  popup(m, txt, hoop.rimCX, hoop.rimY - 14, '#f2f2ea', 1);
  m.netAnim[hoopIdx] = 18;
  m.hype = 100;
  if (kind !== 'dunk') confetti(m, hoop.rimCX, hoop.rimY, pts === 3 ? 18 : 10);
  sfx.swish();
  sfx.cheer(kind === 'dunk' || pts === 3);

  var buzz = m.waitBuzz || m.clock <= 0;
  if (buzz) announce(m, 'BUZZER BEATER!', '#ffd23e');

  m.nextPoss = 1 - st;
  m.phase = 'inbound'; m.phaseT = 60;
  m.phaseLabel = DATA.teams[m.players[1 - st].team].abbr + ' BALL';
  b.state = 'dead';
  m.shotClock = SHOTLEN;
  m.waitBuzz = false;
}

function endQuarter(m) {
  sfx.buzzer();
  m.waitBuzz = false;
  if (m.quarter === 2) {
    m.phase = 'halftime'; m.phaseT = 60 * 8; m.phaseLabel = 'HALFTIME';
    return;
  }
  if (m.quarter >= 4 && m.score[0] !== m.score[1]) {
    m.phase = 'over'; m.phaseT = 0;
    m.over = true;
    m.winner = m.score[0] > m.score[1] ? 0 : 1;
    stopSong();
    return;
  }
  m.phase = 'break'; m.phaseT = 150;
  m.phaseLabel = m.quarter >= 4 ? 'OVERTIME!' : ('END OF ' + qLabel(m.quarter) + ' QUARTER');
  m.nextQuarter = m.quarter + 1;
}

function shotClockViolation(m) {
  sfx.whistle();
  announce(m, 'SHOT CLOCK VIOLATION!', '#e5484d');
  var t = m.ball.state === 'held' ? 1 - m.ball.holder : m.nextPoss;
  m.nextPoss = t;
  m.phase = 'inbound'; m.phaseT = 70;
  m.phaseLabel = DATA.teams[m.players[t].team].abbr + ' BALL';
  m.ball.state = 'dead'; m.ball.vx = 0; m.ball.vy = 0.5;
  m.shotClock = SHOTLEN;
}

/* ---------- ball ---------- */
function collideHoop(m, h) {
  var b = m.ball;
  // backboard plane
  if (h.side === 1) {
    if (b.x - BALL_R <= h.boardX + 1 && b.x > h.boardX - 8 && b.y > h.boardTop && b.y < h.boardBot && b.vx < 0) {
      b.x = h.boardX + 1 + BALL_R; b.vx = Math.abs(b.vx) * 0.55; b.vy *= 0.9;
      if (b.state === 'shot') { b.boardTouched = true; }
      m.boardFlash[h.idx] = 6; sfx.board();
    }
  } else {
    if (b.x + BALL_R >= h.boardX - 1 && b.x < h.boardX + 8 && b.y > h.boardTop && b.y < h.boardBot && b.vx > 0) {
      b.x = h.boardX - 1 - BALL_R; b.vx = -Math.abs(b.vx) * 0.55; b.vy *= 0.9;
      if (b.state === 'shot') { b.boardTouched = true; }
      m.boardFlash[h.idx] = 6; sfx.board();
    }
  }
  // rim endpoints
  var pts = [{ x: h.rimFront, y: h.rimY }, { x: h.rimBack, y: h.rimY }];
  for (var i = 0; i < 2; i++) {
    var dx = b.x - pts[i].x, dy = b.y - pts[i].y;
    var d2 = dx * dx + dy * dy;
    var R = BALL_R + 1.6;
    if (d2 < R * R && d2 > 0.001) {
      var d = Math.sqrt(d2);
      var nx = dx / d, ny = dy / d;
      var vn = b.vx * nx + b.vy * ny;
      if (vn < 0) {
        b.vx = (b.vx - 2 * vn * nx) * 0.45 + rnd(-0.25, 0.25);
        b.vy = (b.vy - 2 * vn * ny) * 0.45 + rnd(-0.15, 0.15);
        b.x = pts[i].x + nx * R; b.y = pts[i].y + ny * R;
        if (b.state === 'shot') { b.rimTouched = true; m.shotClock = SHOTLEN; }
        m.rimShake[h.idx] = Math.max(m.rimShake[h.idx], 4);
        if (Math.abs(vn) > 0.5) sfx.clank();
      }
    }
  }
}

function updateBall(m) {
  var b = m.ball;
  if (b.noStealT > 0) b.noStealT--;
  b.spin += 0.25 + Math.abs(b.vx) * 0.1;

  if (b.state === 'held') {
    var p = m.players[b.holder];
    if (p.charging || p.state === 'dunk' || !p.onGround) {
      b.x = p.x + p.facing * 2; b.y = p.y - 27;
    } else {
      b.dribPh += 0.17 + Math.abs(p.vx) * 0.16;
      var s = Math.abs(Math.sin(b.dribPh));
      b.x = p.x + p.facing * 8; b.y = FLOOR - 3 - s * 12;
      if (s < 0.1 && !b.dribHit) { sfx.dribble(); b.dribHit = true; }
      if (s > 0.5) b.dribHit = false;
    }
    return;
  }
  if (b.state === 'dead') {
    // decorative fall after a basket
    b.vy += BALL_GRAV; b.x += b.vx; b.y += b.vy;
    if (b.y > FLOOR - BALL_R) { b.y = FLOOR - BALL_R; b.vy = -b.vy * 0.45; b.vx *= 0.8; if (Math.abs(b.vy) < 0.4) b.vy = 0; }
    return;
  }

  b.prevY = b.y;
  b.vy += BALL_GRAV;
  b.x += b.vx; b.y += b.vy;
  b.flightT++;
  var holderP = m.players[b.shooter];
  if (holderP && holderP.fire && b.state === 'shot' && (b.flightT & 1) === 0) fireTrail(m, b.x, b.y);

  // walls (above boards can pass; below use court walls)
  var wallL = b.y < HOOPS[0].boardTop ? 4 : 16;
  var wallR = b.y < HOOPS[1].boardTop ? W - 4 : W - 16;
  if (b.x < wallL + BALL_R) { b.x = wallL + BALL_R; b.vx = Math.abs(b.vx) * 0.6; sfx.board(); }
  if (b.x > wallR - BALL_R) { b.x = wallR - BALL_R; b.vx = -Math.abs(b.vx) * 0.6; sfx.board(); }

  // hoops
  collideHoop(m, HOOPS[0]);
  collideHoop(m, HOOPS[1]);

  // scoring
  for (var hi = 0; hi < 2; hi++) {
    var h = HOOPS[hi];
    if (b.vy > 0 && b.prevY <= h.rimY && b.y > h.rimY && b.x > h.inL && b.x < h.inR) {
      var kind = 'rim';
      if (!b.rimTouched && !b.boardTouched) kind = 'swish';
      else if (b.boardTouched) kind = 'bank';
      var shooter = b.state === 'shot' ? b.shooter : b.lastTouch;
      b.beyond3 = b.state === 'shot' ? b.beyond3 : false;
      var wasShot = b.state === 'shot';
      b.vx *= 0.3; b.vy = Math.max(b.vy, 0.8);
      scoreBasket(m, hi, shooter, kind);
      return;
    }
  }

  // blocks
  if (b.state === 'shot' && b.flightT <= 18 && !b.blocked) {
    for (var pi = 0; pi < 2; pi++) {
      var p2 = m.players[pi];
      if (b.shooter === pi) continue;
      var hx = p2.x + p2.facing * 3, hy = p2.y - (p2.onGround ? 25 : 28);
      if (dist2(hx, hy, b.x, b.y) < 42) {
        b.blocked = true;
        b.state = 'loose'; b.flightT = 20;
        b.vx = p2.facing * rnd(0.8, 1.6);
        b.vy = rnd(0.2, 0.9);
        p2.stats.blk++;
        p2.grabCd = 10;
        shotMissed(m);
        popup(m, 'BLOCKED!', p2.x, p2.y - 40, '#e5484d', 1);
        sfx.block();
        m.hype = Math.max(m.hype, 60);
        return;
      }
    }
  }

  // floor
  if (b.y > FLOOR - BALL_R) {
    b.y = FLOOR - BALL_R;
    if (Math.abs(b.vy) > 0.7) {
      b.vy = -b.vy * 0.55; b.vx *= 0.85;
      sfx.floorBounce();
    } else {
      b.vy = 0; b.vx *= 0.93;
      if (Math.abs(b.vx) < 0.04) b.vx = 0;
    }
    if (b.state === 'shot') { b.state = 'loose'; shotMissed(m); }
  }

  // grab loose balls
  if (b.state === 'loose' || (b.state === 'shot' && b.flightT > 26)) {
    for (var gi = 0; gi < 2; gi++) {
      var p3 = m.players[gi];
      if (p3.grabCd > 0 || p3.stun > 0) continue;
      if (p3.state === 'dunk') continue;
      if (dist2(p3.x, p3.y - 12, b.x, b.y) < 12 * 12) {
        var wasShot2 = b.state === 'shot';
        giveBall(m, gi);
        b.lastTouch = gi;
        if (wasShot2) { popup(m, 'REBOUND!', p3.x, p3.y - 36, '#9db2d8', 1); }
        break;
      }
    }
  }
}

/* ---------- match update ---------- */
function updateMatch(m) {
  m.t++;
  if (m.shake > 0) m.shake--;
  if (m.hype > 0) m.hype--;
  for (var i = 0; i < 2; i++) {
    if (m.rimShake[i] > 0) m.rimShake[i]--;
    if (m.netAnim[i] > 0) m.netAnim[i]--;
    if (m.boardFlash[i] > 0) m.boardFlash[i]--;
  }
  updateParts(m);
  updatePopups(m);
  if (m.hintT > 0) m.hintT--;

  if (m.phase === 'tipoff') {
    m.phaseT--;
    if (m.phaseT <= 0) beginLive(m);
    return;
  }
  if (m.phase === 'inbound') {
    m.phaseT--;
    updateBall(m); // let dead ball fall
    if (m.phaseT <= 0) doInbound(m);
    return;
  }
  if (m.phase === 'break') {
    m.phaseT--;
    if (m.phaseT <= 0 || hit('Space', 'Enter')) beginQuarter(m);
    return;
  }
  if (m.phase === 'halftime') {
    m.phaseT--;
    if (m.phaseT <= 0 || hit('Space', 'Enter')) { m.nextQuarter = 3; beginQuarter(m); }
    return;
  }
  if (m.phase === 'over') {
    m.t % 4 === 0 && confetti(m, rnd(20, W - 20), 24, 2);
    return;
  }

  // ===== live =====
  if (!m.waitBuzz) {
    m.clock--;
    if (m.clock <= 0) {
      m.clock = 0;
      if (m.ball.state === 'shot') { m.waitBuzz = true; }
      else if (m.ball.state === 'held' && m.players[m.ball.holder].charging) { m.waitBuzz = true; }
      else { endQuarter(m); return; }
    }
  }

  if (m.ball.state !== 'dead' && !m.waitBuzz && m.clock > 0) {
    m.shotClock--;
    if (m.shotClock <= 0) { shotClockViolation(m); return; }
  }

  // players
  for (var pi2 = 0; pi2 < 2; pi2++) {
    var p = m.players[pi2];
    var c = p.human ? readHuman(p) : aiControl(m, p);
    applyControl(m, p, c);
  }
  // soft body collision
  var pA = m.players[0], pB = m.players[1];
  var pdx = pB.x - pA.x;
  if (Math.abs(pdx) < 10 && Math.abs(pA.y - pB.y) < 20) {
    var push = (10 - Math.abs(pdx)) * 0.5 * (pdx >= 0 ? 1 : -1);
    if (push === 0) push = 0.5;
    pA.x -= push; pB.x += push;
    pA.x = clamp(pA.x, 22, W - 22); pB.x = clamp(pB.x, 22, W - 22);
  }

  updateBall(m);

  // dunk slam check
  for (var pi3 = 0; pi3 < 2; pi3++) {
    var pp = m.players[pi3];
    if (pp.state === 'dunk' && m.ball.holder === pi3) {
      var hoop = attackHoop(pp.i);
      if (Math.abs(pp.x - hoop.rimCX) < 9 && pp.y - 27 <= hoop.rimY + 4) {
        slamDunk(m, pp, hoop);
      }
    }
  }

  // buzzer resolution while waiting
  if (m.waitBuzz) {
    if (m.ball.state === 'loose' || m.ball.state === 'held') { endQuarter(m); return; }
    if (m.ball.state === 'dead') { m.waitBuzz = false; endQuarter(m); return; }
    if (m.ball.flightT > 150) { endQuarter(m); return; }
  }
}

/* ================= RENDER MATCH ================= */
function renderPlayer(g, m, p) {
  var sheet = getSheet(p.team);
  var b = m.ball;
  var pose = 'stand';
  var isHolder = b.state === 'held' && b.holder === p.i;
  var opp = m.players[1 - p.i];
  var oppHas = b.state === 'held' && b.holder !== p.i;
  if (p.state === 'dunk') pose = 'dunk';
  else if (p.charging) pose = 'shoot';
  else if (isHolder && !p.onGround) pose = 'shoot';
  else if (!p.onGround) pose = (b.state === 'shot' || oppHas) ? 'jump' : 'jump';
  else if (p.stealAnim > 0) pose = 'lunge';
  else if (oppHas && Math.abs(opp.x - p.x) < 30 && Math.abs(p.vx) < 0.3) pose = 'defend';
  else if (Math.abs(p.vx) > 0.25) pose = (Math.floor(p.runPh) % 2 === 0) ? 'run1' : 'run2';

  var bob = (pose === 'run1' || pose === 'run2') ? ((Math.floor(p.runPh) % 2 === 0) ? 0 : -1) : 0;
  var px = Math.round(p.x), py = Math.round(p.y);

  // shadow
  var airH = clamp((FLOOR - p.y) / 34, 0, 1);
  g.globalAlpha = 0.3 - airH * 0.15;
  g.fillStyle = '#000';
  g.fillRect(px - 5 + Math.round(airH * 2), FLOOR + 1, 10 - Math.round(airH * 4), 2);
  g.globalAlpha = 1;

  g.save();
  g.translate(px, py + bob);
  if (p.facing < 0) g.scale(-1, 1);
  g.drawImage(sheet[pose], -6, -24);
  g.restore();

  // stun stars
  if (p.stun > 0) {
    for (var st = 0; st < 3; st++) {
      var ang2 = m.t * 0.2 + st * 2.1;
      g.fillStyle = (m.t & 4) ? '#ffd23e' : '#f2f2ea';
      g.fillRect(px + Math.round(Math.cos(ang2) * 6) - 1, py - 30 + Math.round(Math.sin(ang2) * 2), 2, 2);
    }
  }
  // human marker arrow
  if (p.human) {
    g.fillStyle = (m.t & 16) ? '#f2f2ea' : DATA.teams[p.team].a;
    g.fillRect(px - 2, py + 3, 4, 1); g.fillRect(px - 1, py + 4, 2, 1);
  }
  // charge meter
  if (p.charging) {
    var mw = 16, mx = px - mw / 2, my = py - 34;
    g.fillStyle = '#000'; g.fillRect(mx - 1, my - 1, mw + 2, 5);
    g.fillStyle = '#3a3f55'; g.fillRect(mx, my, mw, 3);
    var gz1 = Math.round(mw * 0.66), gz2 = Math.round(mw * 0.86);
    g.fillStyle = '#2f8f4e'; g.fillRect(mx + gz1, my, gz2 - gz1, 3);
    var cw = Math.round(mw * p.charge);
    g.fillStyle = p.charge >= 0.66 && p.charge <= 0.86 ? '#35c46a' : (p.charge > 0.86 ? '#e5484d' : '#ffd23e');
    g.fillRect(mx, my, cw, 3);
  }
  // fire aura
  if (p.fire && (m.t & 2)) {
    g.fillStyle = '#f0742a';
    g.fillRect(px - 6, py - 26, 1, 2); g.fillRect(px + 5, py - 26, 1, 2);
  }
}

function renderHoop(g, m, h) {
  var shake = m.rimShake[h.idx] > 0 ? Math.sin(m.rimShake[h.idx] * 0.8) * 1.5 : 0;
  var ry = h.rimY + Math.round(shake);
  // rim
  g.fillStyle = '#e8722a';
  g.fillRect(Math.min(h.rimBack, h.rimFront), ry, Math.abs(h.rimFront - h.rimBack), 2);
  g.fillStyle = '#c85a18';
  g.fillRect(h.side === 1 ? h.rimBack - 1 : h.rimFront, ry, 2, 2);
  // net
  var stretch = m.netAnim[h.idx] > 0 ? (m.netAnim[h.idx] / 18) * 5 : 0;
  var sway = m.netAnim[h.idx] > 0 ? Math.sin(m.t * 0.6) * 1.5 : 0;
  g.strokeStyle = 'rgba(240,240,235,0.85)';
  g.lineWidth = 1;
  var topL = Math.min(h.rimBack, h.rimFront) + 1, topR = Math.max(h.rimBack, h.rimFront) - 1;
  var botL = topL + 2 + stretch * 0.3, botR = topR - 2 - stretch * 0.3;
  var nh = 9 + stretch;
  for (var i = 0; i <= 4; i++) {
    var t = i / 4;
    g.beginPath();
    g.moveTo(lerp(topL, topR, t), ry + 2);
    g.lineTo(lerp(botL, botR, t) + sway, ry + 2 + nh);
    g.stroke();
  }
  g.beginPath();
  g.moveTo(botL + sway, ry + 2 + nh); g.lineTo(botR + sway, ry + 2 + nh);
  g.stroke();
  // board flash
  if (m.boardFlash[h.idx] > 0) {
    g.fillStyle = 'rgba(255,255,255,0.5)';
    g.fillRect(h.boardX - (h.side === 1 ? 0 : 1), h.boardTop, 2, h.boardBot - h.boardTop);
  }
}

function renderCrowd(g, m) {
  for (var i = 0; i < crowdSpots.length; i++) {
    var s = crowdSpots[i];
    var jump = 0;
    if (m.hype > 0 && ((i + Math.floor(m.t / 6)) & 3) === 0) jump = -2;
    else if ((m.t + s.ph) % 90 < 4) jump = -1;
    g.fillStyle = s.c;
    g.fillRect(s.x, s.y + jump, 2, 3);
  }
}

function renderBall(g, m) {
  var b = m.ball;
  // shadow
  if (b.state !== 'held') {
    var airH2 = clamp((FLOOR - 3 - b.y) / 60, 0, 1);
    g.globalAlpha = 0.3 - airH2 * 0.18;
    g.fillStyle = '#000';
    g.fillRect(Math.round(b.x) - 2 + Math.round(airH2 * 3), FLOOR + 1, 5 - Math.round(airH2 * 2), 2);
    g.globalAlpha = 1;
  }
  var frame = Math.floor(b.spin / 6) % 2;
  var onFire = false;
  if (b.state === 'held') onFire = m.players[b.holder].fire;
  if (b.state === 'shot' && b.shooter >= 0) onFire = m.players[b.shooter].fire;
  g.drawImage(ballSprite(frame, onFire), Math.round(b.x) - 2, Math.round(b.y) - 2);
}

function renderHUD(g, m) {
  g.fillStyle = '#0b0e24'; g.fillRect(0, 0, W, 22);
  g.fillStyle = '#2a2f55'; g.fillRect(0, 22, W, 1);
  var t0 = DATA.teams[m.players[0].team], t1 = DATA.teams[m.players[1].team];
  // left team block
  g.fillStyle = t0.j; g.fillRect(6, 4, 10, 10);
  g.fillStyle = t0.a; g.fillRect(6, 4, 10, 2);
  drawText(g, t0.abbr, 20, 5, t0.j === '#23252b' ? '#c9ccd4' : '#f2f2ea', 1);
  drawText(g, String(m.score[0]), 20, 12, '#f2f2ea', 1);
  // right team block
  g.fillStyle = t1.j; g.fillRect(W - 16, 4, 10, 10);
  g.fillStyle = t1.a; g.fillRect(W - 16, 4, 10, 2);
  drawText(g, t1.abbr, W - 20, 5, t1.j === '#23252b' ? '#c9ccd4' : '#f2f2ea', 1, 'right');
  drawText(g, String(m.score[1]), W - 20, 12, '#f2f2ea', 1, 'right');
  // clock
  var qstr = m.quarter >= 5 ? 'OT' : ('Q' + m.quarter);
  drawText(g, qstr, 192, 3, '#9db2d8', 1, 'center');
  drawText(g, fmtClock(m.clock), 192, 10, m.clock <= 60 * 5 && (m.t & 16) ? '#e5484d' : '#f2f2ea', 1, 'center');
  // shot clock
  var sc = Math.ceil(m.shotClock / 60);
  drawText(g, String(sc), 236, 10, m.shotClock < 60 * 3 ? ((m.t & 8) ? '#e5484d' : '#ffd23e') : '#ffd23e', 1);
  drawText(g, 'SHOT', 236, 3, '#9db2d8', 1);
  // fire tags
  if (m.players[0].fire && (m.t & 16)) drawText(g, 'FIRE', 54, 12, '#f0742a', 1);
  if (m.players[1].fire && (m.t & 16)) drawText(g, 'FIRE', W - 54, 12, '#f0742a', 1, 'right');
  // turbo bars (humans)
  for (var i = 0; i < 2; i++) {
    var p = m.players[i];
    if (!p.human) continue;
    var bx = i === 0 ? 6 : W - 36;
    g.fillStyle = '#000'; g.fillRect(bx - 1, 18, 32, 3);
    g.fillStyle = '#2a2f55'; g.fillRect(bx, 19, 30, 1);
    g.fillStyle = p.turboOn ? '#ffd23e' : '#35c46a';
    g.fillRect(bx, 19, Math.round(30 * p.turbo), 1);
  }
}

function renderStatsTable(g, m, y) {
  drawText(g, 'PTS  FG   3PT  STL  BLK', 262, y, '#9db2d8', 1);
  for (var i = 0; i < 2; i++) {
    var p = m.players[i], t = DATA.teams[p.team], s = p.stats;
    var row = String(s.pts).padStart(3) + '  ' + (s.fgm + '/' + s.fga).padStart(3) + '  ' + (s.tpm + '/' + s.tpa).padStart(3) + '  ' + String(s.stl).padStart(2) + '  ' + String(s.blk).padStart(2);
    drawText(g, t.abbr, 122, y + 14 + i * 12, t.j === '#23252b' ? '#c9ccd4' : t.j, 1);
    drawText(g, row, 262, y + 14 + i * 12, '#f2f2ea', 1);
  }
}

function renderMatch(g, m, dim) {
  g.save();
  if (m.shake > 0) g.translate(irnd(-2, 2), irnd(-1, 1));
  g.drawImage(arenaCanvas, 0, 0);
  renderCrowd(g, m);
  renderHoop(g, m, HOOPS[0]);
  renderHoop(g, m, HOOPS[1]);
  renderPlayer(g, m, m.players[0]);
  renderPlayer(g, m, m.players[1]);
  renderBall(g, m);
  renderParts(g, m);
  renderPopups(g, m);
  g.restore();

  renderHUD(g, m);

  if (dim) {
    g.fillStyle = 'rgba(6,8,22,0.55)';
    g.fillRect(0, 22, W, H - 22);
  }

  // phase overlays
  if (m.phase === 'tipoff') {
    g.fillStyle = 'rgba(6,8,22,0.55)'; g.fillRect(0, 86, W, 44);
    drawText(g, m.phaseLabel, 192, 98, '#ffd23e', 2, 'center', true);
    drawText(g, DATA.teams[m.players[m.nextPoss].team].city + ' ' + DATA.teams[m.players[m.nextPoss].team].nick + ' BALL', 192, 116, '#f2f2ea', 1, 'center', true);
  } else if (m.phase === 'inbound') {
    drawText(g, m.phaseLabel, 192, 40, '#f2f2ea', 1, 'center', true);
  } else if (m.phase === 'break') {
    g.fillStyle = 'rgba(6,8,22,0.72)'; g.fillRect(0, 70, W, 76);
    drawText(g, m.phaseLabel, 192, 84, '#ffd23e', 2, 'center', true);
    drawText(g, DATA.teams[m.players[0].team].abbr + '  ' + m.score[0] + ' - ' + m.score[1] + '  ' + DATA.teams[m.players[1].team].abbr, 192, 108, '#f2f2ea', 2, 'center', true);
  } else if (m.phase === 'halftime') {
    g.fillStyle = 'rgba(6,8,22,0.85)'; g.fillRect(0, 46, W, 132);
    drawText(g, 'HALFTIME', 192, 56, '#ffd23e', 2, 'center', true);
    drawText(g, DATA.teams[m.players[0].team].abbr + '  ' + m.score[0] + ' - ' + m.score[1] + '  ' + DATA.teams[m.players[1].team].abbr, 192, 76, '#f2f2ea', 2, 'center', true);
    renderStatsTable(g, m, 98);
    drawText(g, 'PRESS SPACE', 192, 158, (m.t & 16) ? '#f2f2ea' : '#9db2d8', 1, 'center', true);
  } else if (m.phase === 'over') {
    g.fillStyle = 'rgba(6,8,22,0.85)'; g.fillRect(0, 30, W, 164);
    drawText(g, 'FINAL', 192, 40, '#9db2d8', 1, 'center', true);
    var wt = DATA.teams[m.players[m.winner].team];
    drawText(g, wt.city + ' ' + wt.nick + ' WIN!', 192, 52, wt.j === '#23252b' ? '#c9ccd4' : wt.j, 2, 'center', true);
    drawText(g, DATA.teams[m.players[0].team].abbr + '  ' + m.score[0] + ' - ' + m.score[1] + '  ' + DATA.teams[m.players[1].team].abbr, 192, 76, '#f2f2ea', 3, 'center', true);
    renderStatsTable(g, m, 100);
    drawText(g, 'SPACE: REMATCH    ESC: TITLE', 192, 156, (m.t & 16) ? '#ffd23e' : '#f2f2ea', 1, 'center', true);
  }

  // buzzer flash
  if (m.clock <= 0 && m.phase === 'live' && (m.t & 4)) {
    g.fillStyle = 'rgba(229,72,77,0.15)';
    g.fillRect(0, 22, W, H - 22);
  }

  // controls hint
  if (m.hintT > 0 && m.phase === 'live') {
    g.globalAlpha = clamp(m.hintT / 60, 0, 1) * 0.9;
    g.fillStyle = 'rgba(6,8,22,0.7)'; g.fillRect(24, H - 26, W - 48, 18);
    var h0 = m.players[0].human, h1 = m.players[1].human;
    if (h0 && h1) drawText(g, 'P1 ARROWS+SPACE X  |  P2 WASD+G H', 192, H - 20, '#f2f2ea', 1, 'center');
    else drawText(g, 'MOVE ARROWS  JUMP UP  SHOOT SPACE(HOLD)  STEAL X  TURBO SHIFT', 192, H - 20, '#f2f2ea', 1, 'center');
    g.globalAlpha = 1;
  }
}

/* ================= SCREENS ================= */
function startSelect(mode) {
  G.screen = 'select';
  G.sel = {
    mode: mode, stage: mode === '1p' ? 'difficulty' : 'team',
    diffIdx: 1, cursor: 0, picks: [-1, -1], picking: 0,
    cpuAnim: 0, cpuPick: -1, vsT: 0, teams: [-1, -1]
  };
}
function selectUpdate() {
  var s = G.sel;
  if (s.stage === 'difficulty') {
    if (hit('ArrowUp', 'KeyW')) { s.diffIdx = (s.diffIdx + 2) % 3; sfx.blip(); }
    if (hit('ArrowDown', 'KeyS')) { s.diffIdx = (s.diffIdx + 1) % 3; sfx.blip(); }
    if (hit('Space', 'Enter', 'KeyG')) { sfx.confirm(); s.stage = 'team'; s.cursor = 0; }
    if (hit('Escape')) { sfx.back(); G.screen = 'title'; G.titleStage = 'menu'; }
    return;
  }
  if (s.stage === 'team') {
    var cols = 4;
    if (hit('ArrowLeft', 'KeyA')) { s.cursor = (s.cursor + 7) % 8; sfx.blip(); }
    if (hit('ArrowRight', 'KeyD')) { s.cursor = (s.cursor + 1) % 8; sfx.blip(); }
    if (hit('ArrowUp', 'KeyW')) { s.cursor = (s.cursor + 8 - cols) % 8; sfx.blip(); }
    if (hit('ArrowDown', 'KeyS')) { s.cursor = (s.cursor + cols) % 8; sfx.blip(); }
    if (hit('Space', 'Enter', 'KeyG')) {
      sfx.confirm();
      s.teams[s.picking] = s.cursor;
      if (s.mode === '2p') {
        if (s.picking === 0) { s.picking = 1; }
        else { s.stage = 'vs'; s.vsT = 100; }
      } else {
        s.stage = 'cpu'; s.cpuAnim = 50;
      }
    }
    if (hit('Escape')) { sfx.back(); if (s.picking > 0) { s.picking = 0; } else if (s.mode === '1p') { s.stage = 'difficulty'; } else { G.screen = 'title'; G.titleStage = 'menu'; } }
    return;
  }
  if (s.stage === 'cpu') {
    s.cpuAnim--;
    if (s.cpuAnim <= 0) {
      var pool = [];
      for (var i = 0; i < 8; i++) if (i !== s.teams[0]) pool.push(i);
      s.teams[1] = choice(pool);
      s.stage = 'vs'; s.vsT = 100; sfx.confirm();
    }
    return;
  }
  if (s.stage === 'vs') {
    s.vsT--;
    if (s.vsT <= 0 || hit('Space', 'Enter')) {
      launchMatch();
    }
    return;
  }
}
function launchMatch() {
  var s = G.sel;
  var mode1p = s.mode === '1p';
  G.match = createMatch({
    teamA: s.teams[0], teamB: s.teams[1],
    humans: [true, !mode1p],
    difficulty: ['rookie', 'pro', 'legend'][s.diffIdx]
  });
  G.screen = 'game';
  G.paused = false;
  playSong('game');
}

function titleUpdate() {
  if (G.titleStage === 'press') {
    if (hit('Space', 'Enter') || Object.keys(pressed).length > 0) {
      if (Object.keys(pressed).length > 0 || hit('Space', 'Enter')) { G.titleStage = 'menu'; sfx.confirm(); }
    }
    return;
  }
  if (hit('ArrowUp', 'ArrowDown', 'KeyW', 'KeyS')) { G.titleIdx = 1 - G.titleIdx; sfx.blip(); }
  if (hit('Space', 'Enter', 'KeyG')) {
    sfx.confirm();
    if (G.titleIdx === 0) startSelect('1p');
    else startSelect('2p');
  }
}

function renderTitle(g) {
  renderMatch(g, G.demo, true);
  // logo plate
  g.fillStyle = 'rgba(6,8,22,0.75)'; g.fillRect(48, 26, W - 96, 74);
  g.fillStyle = '#e5484d'; g.fillRect(48, 26, W - 96, 2); g.fillRect(48, 98, W - 96, 2);
  drawText(g, '8-BIT', 192, 34, '#9db2d8', 2, 'center', true);
  drawText(g, 'NBA', 192, 50, '#f0742a', 5, 'center', true);
  drawText(g, 'ARCADE HOOPS', 192, 90, '#f2f2ea', 1, 'center', true);

  if (G.titleStage === 'press') {
    if (G.t & 32) drawText(g, 'PRESS ANY KEY', 192, 150, '#ffd23e', 2, 'center', true);
    drawText(g, 'A FAN-MADE TRIBUTE', 192, 178, '#9db2d8', 1, 'center', true);
    drawText(g, 'KEYBOARD REQUIRED', 192, 190, '#5c6a8a', 1, 'center', true);
  } else {
    var items = ['1 PLAYER VS CPU', '2 PLAYERS'];
    for (var i = 0; i < 2; i++) {
      var y = 138 + i * 16;
      var sel = G.titleIdx === i;
      if (sel) { g.fillStyle = 'rgba(6,8,22,0.8)'; g.fillRect(96, y - 3, W - 192, 14); drawText(g, '>', 104, y, '#ffd23e', 1); }
      drawText(g, items[i], 192, y, sel ? '#ffd23e' : '#f2f2ea', 1, 'center', true);
    }
    drawText(g, 'M:SOUND  C:CRT  P:PAUSE', 192, 182, '#9db2d8', 1, 'center', true);
  }
}

function renderSelect(g) {
  var s = G.sel;
  g.fillStyle = '#0d1026'; g.fillRect(0, 0, W, H);
  // striped bg
  for (var i = 0; i < 8; i++) {
    g.fillStyle = i % 2 ? '#101430' : '#0d1026';
    g.fillRect(i * 48, 0, 48, H);
  }
  if (s.stage === 'difficulty') {
    drawText(g, 'SELECT DIFFICULTY', 192, 40, '#ffd23e', 2, 'center', true);
    var dl = ['ROOKIE', 'PRO', 'LEGEND'];
    for (var d = 0; d < 3; d++) {
      var dy = 84 + d * 22;
      if (s.diffIdx === d) { g.fillStyle = 'rgba(255,210,62,0.14)'; g.fillRect(120, dy - 4, 144, 18); drawText(g, '>', 128, dy, '#ffd23e', 1); }
      drawText(g, dl[d], 192, dy, s.diffIdx === d ? '#ffd23e' : '#f2f2ea', 1, 'center', true);
    }
    drawText(g, 'ARROWS + SPACE', 192, 176, '#9db2d8', 1, 'center', true);
    return;
  }
  if (s.stage === 'team' || s.stage === 'cpu') {
    var title2 = s.mode === '2p' ? ('PLAYER ' + (s.picking + 1) + ' - PICK TEAM') : 'PICK YOUR TEAM';
    drawText(g, title2, 192, 22, '#ffd23e', 2, 'center', true);
    for (var ti = 0; ti < 8; ti++) {
      var tx = 18 + (ti % 4) * 90, ty = 44 + Math.floor(ti / 4) * 74;
      var t = DATA.teams[ti];
      var active = s.stage === 'team' && s.cursor === ti;
      var picked = s.teams[0] === ti || s.teams[1] === ti;
      g.fillStyle = '#131735'; g.fillRect(tx, ty, 84, 66);
      g.fillStyle = t.j; g.fillRect(tx, ty, 84, 4);
      if (active || (s.stage === 'cpu' && (s.cpuAnim > 0) && ti === (s.teams[0] + Math.floor(s.cpuAnim / 6)) % 8)) {
        g.fillStyle = (G.t & 8) ? '#ffd23e' : '#f2f2ea';
        g.fillRect(tx, ty, 84, 1); g.fillRect(tx, ty + 65, 84, 1);
        g.fillRect(tx, ty, 1, 66); g.fillRect(tx + 83, ty, 1, 66);
      } else if (picked) {
        g.fillStyle = '#35c46a'; g.fillRect(tx, ty + 65, 84, 1);
      }
      // mini player
      var sheet = getSheet(ti);
      g.save();
      g.translate(tx + 42, ty + 42);
      g.scale(1.6, 1.6);
      g.drawImage(sheet.stand, -6, -24);
      g.restore();
      drawText(g, t.abbr, tx + 42, ty + 48, t.j === '#23252b' ? '#c9ccd4' : t.j, 1, 'center', true);
      drawText(g, t.nick, tx + 42, ty + 57, '#9db2d8', 1, 'center', true);
    }
    if (s.stage === 'cpu') drawText(g, 'CPU IS CHOOSING...', 192, 202, '#ffd23e', 1, 'center', true);
    else drawText(g, 'ARROWS + SPACE' + (s.mode === '2p' ? '   (P2: WASD+G)' : ''), 192, 202, '#9db2d8', 1, 'center', true);
    return;
  }
  if (s.stage === 'vs') {
    drawText(g, 'VS', 192, 20, '#e5484d', 3, 'center', true);
    for (var v = 0; v < 2; v++) {
      var vt = DATA.teams[s.teams[v]];
      var vx = v === 0 ? 60 : 324;
      var sheet2 = getSheet(s.teams[v]);
      g.save();
      g.translate(vx, 120);
      if (v === 1) g.scale(-2.4, 2.4); else g.scale(2.4, 2.4);
      g.drawImage(sheet2[v === 0 ? 'shoot' : 'defend'], -6, -24);
      g.restore();
      drawText(g, vt.abbr, vx, 148, vt.j === '#23252b' ? '#c9ccd4' : vt.j, 2, 'center', true);
      drawText(g, vt.city, vx, 166, '#f2f2ea', 1, 'center', true);
      drawText(g, vt.nick, vx, 176, '#f2f2ea', 1, 'center', true);
      if (G.match === null) {
        var who = v === 0 ? 'P1' : (s.mode === '1p' ? 'CPU' : 'P2');
        drawText(g, who, vx, 186, '#9db2d8', 1, 'center', true);
      }
    }
    if (s.vsT < 60 && (G.t & 16)) drawText(g, 'TIP OFF!', 192, 96, '#ffd23e', 2, 'center', true);
    return;
  }
}

/* ================= BOOT / LOOP ================= */
function newDemo() {
  var a = irnd(0, 7), b = irnd(0, 7);
  if (b === a) b = (a + 1 + irnd(0, 6)) % 8;
  return createMatch({ teamA: a, teamB: b, humans: [false, false], difficulty: 'pro' });
}

function update() {
  G.t++;
  if (G.flash > 0) G.flash--;
  playSong(G.screen === 'game' ? 'game' : 'menu');

  if (G.screen === 'title') {
    updateMatch(G.demo);
    if (G.demo.phase === 'over') { G.demo = newDemo(); }
    titleUpdate();
  } else if (G.screen === 'select') {
    selectUpdate();
  } else if (G.screen === 'game') {
    var m = G.match;
    if (hit('KeyP') || hit('Escape')) {
      if (m.phase !== 'over') { G.paused = !G.paused; sfx.blip(); }
    }
    if (m.phase === 'over') {
      if (hit('Space', 'Enter')) { launchMatch(); return; }
      if (hit('Escape')) { G.screen = 'title'; G.titleStage = 'menu'; G.paused = false; return; }
    }
    if (!G.paused) updateMatch(m);
    else {
      if (hit('KeyQ')) { G.screen = 'title'; G.titleStage = 'menu'; G.paused = false; }
    }
  }
  clearPressed();
}

function render() {
  ctx.fillStyle = '#05060f';
  ctx.fillRect(0, 0, W, H);
  if (G.screen === 'title') renderTitle(ctx);
  else if (G.screen === 'select') renderSelect(ctx);
  else if (G.screen === 'game') {
    renderMatch(ctx, G.match, false);
    if (G.paused) {
      ctx.fillStyle = 'rgba(6,8,22,0.78)';
      ctx.fillRect(0, 60, W, 96);
      drawText(ctx, 'PAUSED', 192, 76, '#ffd23e', 3, 'center', true);
      drawText(ctx, 'P: RESUME   Q: QUIT TO TITLE', 192, 118, '#f2f2ea', 1, 'center', true);
      drawText(ctx, 'M: SOUND ' + (G.muted ? 'OFF' : 'ON') + '   C: SCANLINES', 192, 132, '#9db2d8', 1, 'center', true);
    }
  }
}

var last = 0, acc = 0;
var STEP = 1000 / 60;
function loop(t) {
  requestAnimationFrame(loop);
  if (!last) last = t;
  var dt = t - last; last = t;
  if (dt > 100) dt = 100;
  acc += dt;
  while (acc >= STEP) { update(); acc -= STEP; }
  render();
}

/* boot */
buildArena();
G.demo = newDemo();
if (typeof window !== 'undefined') {
  window.GAME = {
    version: '1.0',
    data: DATA,
    get state() { return G.screen; },
    get match() { return G.match; },
    get sel() { return G.sel; },
    get demo() { return G.demo; },
    get paused() { return G.paused; },
    get muted() { return G.muted; },
    start: function (mode, diffIdx, teamA, teamB) {
      startSelect(mode || '1p');
      G.sel.diffIdx = diffIdx || 1;
      G.sel.teams = [teamA === undefined ? 0 : teamA, teamB === undefined ? 1 : teamB];
      G.sel.stage = 'vs'; G.sel.vsT = 30;
      G.sel.mode = mode || '1p';
    },
    forceDemo: function () {
      G.screen = 'title';
    }
  };
  var q = new URLSearchParams(location.search);
  if (q.get('demo') === '1') {
    // straight to CPU vs CPU exhibition
    var a = irnd(0, 7), b = (a + 1 + irnd(0, 6)) % 8;
    G.match = createMatch({ teamA: a, teamB: b, humans: [false, false], difficulty: 'pro' });
    G.screen = 'game';
  }
}
requestAnimationFrame(loop);
})();
