
/* =====================================================================
   CHAKRVIEW · CONTENT, seven chakras, eight levels each, travelling inward.
   Each chakra is an element; its Sanskrit name only ever appears in brackets.
   ===================================================================== */
const CHAKRAS = [
  { name: 'Muladhara',    petals: 4,    color: '#b8432f', dark: '#e07a63', bg: 0xefe6d8, shape: 'circle', boards: ['chandan', 'chandan', 'sheesham', 'sheesham', 'akhrot', 'akhrot', 'warli', 'warli'],
    line: 'Begin here. Every path leads inward.', open: 'You stand steady now.' },
  { name: 'Svadhisthana', petals: 6,    color: '#c4652a', dark: '#e8935a', bg: 0xebdfcc, shape: 'hex',    boards: ['madhubani', 'madhubani', 'madhubani', 'kalamkari', 'kalamkari', 'kalamkari', 'pattachitra', 'pattachitra'],
    line: 'Let it flow. Some paths carry you.', open: 'You move without forcing.' },
  { name: 'Manipura',     petals: 10,   color: '#b88a1e', dark: '#e2b84f', bg: 0xe2d2b6, shape: 'oct',    boards: ['lippan', 'lippan', 'lippan', 'lippan', 'kolam', 'kolam', 'kolam', 'kolam'],
    line: 'Courage now. Keep clear of the glowing holes.', open: 'Your will is lit.' },
  { name: 'Anahata',      petals: 12,   color: '#4d8456', dark: '#86c08e', bg: 0xcbcdb6, shape: 'circle', tier: true, boards: ['pichwai', 'pichwai', 'pichwai', 'pichwai', 'gond', 'gond', 'gond', 'gond'],
    line: 'Lighter now. Step down, and hold steady.', open: 'You breathe easier.' },
  { name: 'Vishuddha',    petals: 16,   color: '#3f6f96', dark: '#8fb2cf', bg: 0x9aa6b0, shape: 'hex',    tier: true, boards: ['neel', 'neel', 'neel', 'neel', 'neel', 'makrana', 'makrana', 'makrana'],
    line: 'Listen. Some things here sing.', open: 'Your voice is clear.' },
  { name: 'Ajna',         petals: 2,    color: '#4a6383', dark: '#9db3cc', bg: 0x45526a, shape: 'square', boards: ['sanjhi', 'sanjhi', 'sanjhi', 'sanjhi', 'bidri', 'bidri', 'bidri', 'bidri'],
    line: 'Doors rise and fall. Wait, then go.', open: 'You see clearly.' },
  { name: 'Sahasrara',    petals: 1000, color: '#5d4f7a', dark: '#b4a6d0', bg: 0x2a2436, shape: 'lotus',  boards: ['makrana', 'makrana', 'makrana', 'chandan', 'chandan', 'makrana', 'makrana', 'makrana'],
    line: 'The last one. Petals all the way in.', open: '' }
];
const BG_END = 0x1a1626;
/* the elements are felt in the boards (a flowing ring, glowing holes, a breeze, singing posts) and only named once a world is complete */
const ELEMENTS = ['Earth', 'Water', 'Fire', 'Air', 'Sound', 'Light', 'Silence'];
const WIN_LINES = ['Inward.', 'Steady hands.', 'One ring closer.', 'Quietly done.', 'Breathe, and on.', 'Softly in.', 'Well rolled.', 'Deeper now.'];
const worldLabel = w => 'Levels ' + (w * 8 + 1) + ' to ' + (w * 8 + 8);
const ENDING = 'The mani was always inside you. It never came out, because you had never taken the journey. Now you have.';
/* nothing is explained up front: what's inside the glass is noticed slowly, one world at a time */
const MANI_LINES = ['Something stirs inside the glass.', 'It is brighter now. Look closer.', 'A jewel. A mani, waking.', 'The mani deepens.', 'It is almost the blue of the sky.', 'One more.', ''];
const maniCaption = () => { const n = CHAKRAS.filter((_, w) => save.done[w * 8 + 7]).length; return n ? MANI_LINES[Math.min(n, 6) - 1] : ''; };
/* every level has a name you can say out loud: "I'm on Patang" */
const NAMES = [
  ['Mitti', 'Aangan', 'Gully', 'Kuan', 'Bargad', 'Chaupal', 'Haveli', 'Qila'],
  ['Ghat', 'Nadi', 'Machhli', 'Naav', 'Jharna', 'Sangam', 'Saawan', 'Kamal'],
  ['Diya', 'Surya', 'Holi', 'Rangoli', 'Lohri', 'Mashaal', 'Dhoop', 'Jwala'],
  ['Patang', 'Mor', 'Jhoola', 'Chidiya', 'Bansuri', 'Basant', 'Hawa', 'Pankh'],
  ['Ghungroo', 'Tabla', 'Sitar', 'Shankh', 'Ghanta', 'Raag', 'Taal', 'Dhun'],
  ['Jaali', 'Aaina', 'Bindi', 'Taara', 'Chandra', 'Kajal', 'Sapna', 'Drishti'],
  ['Toran', 'Kalash', 'Mukut', 'Mandala', 'Gagan', 'Prakash', 'Ananta', 'Sahasra']
];
/* per-level rules, eight per chakra. nG rings · noBars · decoy (dead-end chance) · fg (false openings) · traps (holes)
   posts · spin (turning ring) · gates (timed doors) · seal (lotus + gong) · intro (new idea, one line)
   thematic: current (a river, 1 with you / -1 against) · orbit (posts circle the centre) · wind (gusts) · sing (posts ring) */
const PLAN = [
  [ { nG: 2, noBars: true }, { nG: 2, intro: 'bars' }, { nG: 3, posts: true, intro: 'posts' }, { nG: 3, spin: .22, intro: 'spin' },
    { nG: 3, decoy: .6, fg: 1, intro: 'pockets' }, { nG: 3, decoy: .7, fg: 1, posts: true }, { nG: 4, traps: true, decoy: .7, intro: 'holes' }, { nG: 4, spin: .2, decoy: .6, fg: 1, seal: true, intro: 'seal' } ],
  [ { nG: 3, decoy: .5, intro: 'corners' }, { nG: 3, fg: 1, decoy: .6, posts: true, current: 1, intro: 'river' }, { nG: 4, traps: true, decoy: .6 }, { nG: 4, traps: true, fg: 1, decoy: .7, posts: true },
    { nG: 4, traps: true, fg: 2, decoy: .7 }, { nG: 4, traps: true, fg: 2, decoy: .8, posts: true, current: -1, intro: 'upstream' }, { nG: 5, traps: true, decoy: .7, fg: 2 }, { nG: 5, traps: true, decoy: .8, fg: 2, posts: true, seal: true } ],
  [ { nG: 4, traps: true, decoy: .6, fg: 1, intro: 'embers' }, { nG: 4, traps: true, decoy: .7, fg: 2, posts: true, orbit: .35, intro: 'orbit' }, { nG: 4, traps: true, decoy: .8, fg: 2 }, { nG: 5, traps: true, decoy: .7, fg: 2 },
    { nG: 5, traps: true, decoy: .8, fg: 3, posts: true, orbit: .4 }, { nG: 5, traps: true, decoy: .9, fg: 3 }, { nG: 5, traps: true, decoy: .9, fg: 3, posts: true, orbit: .45 }, { nG: 5, traps: true, decoy: 1, fg: 3, seal: true } ],
  [ { nG: 4, decoy: .5, intro: 'tier' }, { nG: 4, spin: .2, decoy: .6 }, { nG: 4, traps: true, decoy: .6, fg: 1, wind: 7, intro: 'wind' }, { nG: 5, traps: true, decoy: .7, fg: 1, posts: true },
    { nG: 5, spin: .22, traps: true, decoy: .7, fg: 2, wind: 7 }, { nG: 5, traps: true, decoy: .8, fg: 2, posts: true, wind: 8 }, { nG: 5, traps: true, decoy: .8, fg: 2, spin: .24, limit: true, intro: 'time' }, { nG: 5, traps: true, decoy: .9, fg: 2, posts: true, seal: true, limit: true, wind: 8 } ],
  [ { nG: 4, traps: true, decoy: .6, limit: true, posts: true, sing: true, intro: 'sing' }, { nG: 4, traps: true, fg: 1, decoy: .7, posts: true, sing: true, limit: true }, { nG: 5, traps: true, fg: 2, decoy: .7, limit: true }, { nG: 5, traps: true, fg: 2, decoy: .8, limit: true },
    { nG: 5, traps: true, fg: 2, decoy: .8, posts: true, sing: true, limit: true }, { nG: 5, traps: true, fg: 3, decoy: .9, limit: true }, { nG: 5, traps: true, fg: 3, decoy: .9, posts: true, sing: true, limit: true }, { nG: 5, traps: true, fg: 3, decoy: 1, seal: true, limit: true } ],
  [ { nG: 4, gates: 1, decoy: .5, limit: true, intro: 'gates' }, { nG: 4, gates: 2, traps: true, decoy: .6, limit: true }, { nG: 4, gates: 2, traps: true, fg: 1, posts: true, orbit: .3, limit: true }, { nG: 5, gates: 2, traps: true, fg: 2, decoy: .7, limit: true },
    { nG: 5, gates: 3, traps: true, decoy: .8, limit: true }, { nG: 5, gates: 3, traps: true, fg: 2, posts: true, orbit: .35, limit: true }, { nG: 5, gates: 3, traps: true, fg: 3, decoy: .9, limit: true }, { nG: 5, gates: 3, traps: true, fg: 2, seal: true, limit: true } ],
  [ { nG: 4, traps: true, decoy: .6, gates: 1, limit: true, intro: 'lotus' }, { nG: 4, traps: true, decoy: .7, fg: 1, gates: 2, limit: true }, { nG: 5, traps: true, decoy: .7, fg: 2, posts: true, orbit: .35, limit: true }, { nG: 5, traps: true, decoy: .8, fg: 2, gates: 2, limit: true },
    { nG: 5, traps: true, decoy: .8, fg: 3, gates: 3, limit: true }, { nG: 5, traps: true, decoy: .9, fg: 3, posts: true, orbit: .4, gates: 2, limit: true }, { nG: 5, traps: true, decoy: .9, fg: 3, gates: 3, limit: true }, { nG: 5, traps: true, decoy: 1, fg: 3, gates: 3, posts: true, orbit: .3, sing: true, seal: true, limit: true } ]
];
const FEATURES = {
  bars:     'Wooden bars block the short way round.',
  posts:    'Brass posts guard the centre.',
  spin:     'One ring turns. Wait for its gap.',
  pockets:  'Some openings lead nowhere.',
  holes:    'Holes send you back one ring.',
  seal:     'The lotus is closed. Ring the gong to open it.',
  corners:  'Straight walls now. Tilt again at each corner.',
  river:    'One ring flows. Let it carry you.',
  upstream: 'This one flows against you. Push gently through.',
  embers:   'The holes glow here. Keep clear.',
  orbit:    'The posts circle the centre. Slip between them.',
  tier:     'The centre sits lower. Drop down the step; there is no climbing back.',
  wind:     'A breeze comes and goes. Hold steady.',
  time:     'From here on, each path has a time limit.',
  sing:     'Touch a brass post and it sings.',
  gates:    'Doors rise and fall. Time your way through.',
  lotus:    'Petals all the way in.'
};
/* the marbles, three compounds, like racing tyres. Each grows steadier the more you roll it. */
const BALLS = {
  kancha:  { name: 'Kancha', mat: 'Glass', tag: 'Soft', tyre: '#e0402f', speed: .86, damp: .62, rest: .5, grip: .1, tock: 2000, stats: [3, 5, 5], css: '' },
  peetal:  { name: 'Peetal', mat: 'Brass', tag: 'Medium', tyre: '#f2c230', speed: .95, damp: .5, rest: .34, grip: .07, tock: 1050, stats: [4, 3, 3],
             css: 'radial-gradient(circle at 34% 30%,#fff6d6 0 7%,#e8c477 22%,#9b6f28 70%,#4b3311)' },
  fauladi: { name: 'Fauladi', mat: 'Steel', tag: 'Hard', tyre: '#f4f4f4', speed: 1, damp: .4, rest: .3, grip: .055, tock: 1300, stats: [5, 2, 2],
             css: 'radial-gradient(circle at 34% 30%,#fff 0 7%,#d9dcdf 18%,#7d8489 62%,#30363a)' },
  suvarna: { name: 'Suvarna', mat: 'Gold', tag: "Maker's", tyre: '#d9a640', speed: .95, damp: .52, rest: .32, grip: .08, tock: 1150, stats: [4, 4, 3], secret: true,
             css: 'radial-gradient(circle at 34% 30%,#fff7d8 0 8%,#f0cf78 26%,#b98a2c 66%,#5c3d10)' }
};
const SEASON_N = 20;
const seasoning = k => Math.min(1, (save.xp[k] || 0) / SEASON_N);
function ballPhys(k){ const B = BALLS[k], s = seasoning(k); return { speed: B.speed, damp: B.damp + .14 * s, rest: B.rest * (1 - .3 * s), grip: B.grip * (1 + .6 * s), tock: B.tock }; }

const tintFor = (C, j) => { const base = hex2rgb(parseInt(C.color.slice(1), 16)), f = .05 + .014 * j, dk = 1 - .012 * j; return base.map(c => +((1 - f + f * c / 255) * dk).toFixed(3)); };
const LEVELS = [];
CHAKRAS.forEach((C, w) => PLAN[w].forEach((p, j) => {
  const i = LEVELS.length, art = BOARDS[C.boards[j]].kind === 'art';
  LEVELS.push(Object.assign({ shape: C.shape, tier: !!C.tier, seed: 4101 + i * 37 + w * 1000, w, j, i, name: NAMES[w][j],
    board: { key: C.boards[j], seed: i + 1, sc: (art ? 1.5 : 1) + (((i * 37) % 7) - 3) * .03, tint: tintFor(C, j), id: 'L' + i } }, p));
}));
const levelLimit = lv => Math.round(lv.par * 1.85 + (lv.cfg.gates || 0) * 3 + (lv.cfg.posts ? 3 : 0) + (lv.spin ? 12 : 0) + 10);
/* flow time: arrive within it and a lotus petal is yours. Calibrated against a steady, unhurried run. */
function flowTime(lv){
  const c = lv.cfg;
  let t = lv.pathLen / 5 + lv.geo.nG * 1.1 + (c.gates || 0) * 2.4 + (lv.spin ? 10 : 0) + (c.seal ? 5 : 0) + (c.wind ? 1.5 : 0) + (c.current < 0 ? 1.5 : 0) + (c.traps ? 1.5 : 0) + 3;
  t = Math.round(t);
  return lv.limit ? Math.min(t, Math.round(lv.limit * .7)) : t;
}
/* Relax: endless calm mazes from the chakras you've opened, no clock, no holes, no gong */
function relaxDef(n){
  let wMax = 0; for (let w = 1; w < 7; w++) if (DEV_UNLOCK || save.done[w * 8 - 1]) wMax = w;
  const w = n % (wMax + 1), C = CHAKRAS[w], j = (n * 3 + w) % 8, key = C.boards[j], art = BOARDS[key].kind === 'art';
  return { relax: true, w, j, i: -1, n, name: 'Relax', shape: C.shape, tier: !!C.tier, seed: 70001 + n * 131, nG: 3 + (n % 3 === 2 ? 1 : 0), decoy: .45, fg: 0,
    posts: n % 3 === 1, orbit: n % 3 === 1 && w >= 2 ? .35 : 0, sing: n % 3 === 1 && w === 4, spin: C.shape === 'circle' && n % 4 === 3 ? .18 : 0, current: w === 1 && n % 2 === 0 ? 1 : 0,
    board: { key, seed: 300 + n, sc: art ? 1.5 : 1, tint: tintFor(C, j), id: 'R' + n } };
}
const RELAX_LINES = ['Inward.', 'Breathe.', 'And again.', 'Gently.', 'Still rolling.', 'Softly in.'];

/* chakra glyph: a ring of petals */
function glyphSVG(n){
  const P = n >= 100 ? 28 : n, w = Math.min(16, 2 * Math.PI * 30 / P * .55), out = [];
  for (let k = 0; k < P; k++) out.push(`<path transform="rotate(${(k * 360 / P + (P === 2 ? 90 : 0)).toFixed(1)})" d="M0 -20Q${w.toFixed(1)} -33 0 -46Q${(-w).toFixed(1)} -33 0 -20Z"/>`);
  return `<svg class="gl" viewBox="-50 -50 100 100" fill="none" stroke="currentColor" stroke-width="3.6" stroke-linejoin="round"><circle r="16"/>${n >= 100 ? '<circle r="8"/>' : ''}${out.join('')}</svg>`;
}
const PETAL_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2.5c4.2 4.2 5.6 9 0 19-5.6-10-4.2-14.8 0-19z" fill="currentColor"/></svg>';
/* the mani: a cut jewel, pale at first, deep blue at the end */
function gemSVG(p, size){
  const c = css(maniColor(p));
  return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true"><g stroke="rgba(20,24,40,.35)" stroke-width=".8" stroke-linejoin="round">`
    + `<path d="M8 19L16 11L20 19Z" fill="${c}"/><path d="M16 11H32L28 19H20Z" fill="${c}"/><path d="M32 11L40 19H28Z" fill="${c}"/>`
    + `<path d="M8 19H20L24 42Z" fill="${c}"/><path d="M20 19H28L24 42Z" fill="${c}"/><path d="M28 19H40L24 42Z" fill="${c}"/></g>`
    + `<path d="M8 19L16 11L20 19Z" fill="#fff" opacity=".42"/><path d="M16 11H32L28 19H20Z" fill="#fff" opacity=".6"/><path d="M32 11L40 19H28Z" fill="#fff" opacity=".22"/>`
    + `<path d="M8 19H20L24 42Z" fill="#fff" opacity=".12"/><path d="M28 19H40L24 42Z" fill="#000" opacity=".22"/><path d="M20 19H28L24 42Z" fill="#000" opacity=".08"/></svg>`;
}
const doneCount = () => LEVELS.filter((_, i) => save.done[i]).length;
const petalCount = () => LEVELS.filter((_, i) => save.petal[i]).length;
const maniP = () => doneCount() / LEVELS.length;
const maniGlow = () => petalCount() / LEVELS.length;
const kanchaCss = () => { const c = css(maniColor(maniP())); return `radial-gradient(circle at 33% 27%,rgba(255,255,255,.95) 0 5%,rgba(255,255,255,0) 14%),conic-gradient(from 30deg at 52% 54%,${c},#fff8 ,${c},#0002,${c}) 50% 54%/30% 34% no-repeat,radial-gradient(circle,rgba(232,242,250,.5) 0 55%,rgba(170,198,222,.75) 82%,rgba(84,112,140,.9))`; };
const ballCss = k => k === 'kancha' ? kanchaCss() : BALLS[k].css;
function refreshMani(){ setMani(maniP(), maniGlow()); }

/* =====================================================================
   CHAKRVIEW · THEME, the room darkens as you travel inward
   ===================================================================== */
const lerpHex = (a, b, t) => { const A = hex2rgb(a), B = hex2rgb(b); return (Math.round(A[0] + (B[0] - A[0]) * t) << 16) | (Math.round(A[1] + (B[1] - A[1]) * t) << 8) | Math.round(A[2] + (B[2] - A[2]) * t); };
const lum = h => { const c = hex2rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const css = h => '#' + h.toString(16).padStart(6, '0');
function theme(def){
  const C = CHAKRAS[def.w], next = def.w + 1 < CHAKRAS.length ? CHAKRAS[def.w + 1].bg : BG_END;
  const bg = lerpHex(C.bg, next, def.j / 8), dark = lum(bg) < .2, r = document.documentElement.style;
  r.setProperty('--bg', css(bg));
  r.setProperty('--ink', dark ? '#f4ece0' : '#2a1d14');
  r.setProperty('--mut', dark ? 'rgba(244,236,224,.62)' : '#7a6656');
  r.setProperty('--card', dark ? 'rgba(44,46,64,.86)' : 'rgba(255,251,245,.84)');
  r.setProperty('--card2', dark ? 'rgba(255,255,255,.08)' : 'rgba(255,251,245,.6)');
  r.setProperty('--line', dark ? 'rgba(255,255,255,.14)' : 'rgba(42,29,20,.12)');
  r.setProperty('--accent', dark ? C.dark : C.color);
  document.querySelector('meta[name=theme-color]').content = css(bg);
  setBackdrop(bg);
  hemi.intensity = dark ? .5 : .6;
}

/* =====================================================================
   CHAKRVIEW · UI
   ===================================================================== */
let openSheet = null, toastTimer = 0, hintTimer = 0, target = null;
const unlocked = i => DEV_UNLOCK || ahamOn || i === 0 || !!save.done[i - 1] || !!save.done[i];
const nextLevelIdx = () => { for (let i = 0; i < LEVELS.length; i++) if (!save.done[i]) return i; return LEVELS.length - 1; };
const fmtE = s => { s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
function showToast(t, ms){ const el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('on'), ms || 1300); }
function setHint(text, ms){
  const el = $('hint');
  el.textContent = text || (save.control === 'touch' || !coarse ? (coarse ? 'Drag anywhere to roll the marble inward.' : 'Arrow keys roll the marble · V switches view · P pauses') : gyro.live ? 'Tilt to roll the marble inward. ◎ re-levels.' : 'Drag to roll, or tap to turn on tilt.');
  el.classList.remove('off'); clearTimeout(hintTimer); hintTimer = setTimeout(() => el.classList.add('off'), ms || 4800);
}
function layoutBands(){
  const h = innerHeight, hb = $('home').querySelector('.hbot');
  return { top: 110, bottom: openSheet ? Math.min($(openSheet).offsetHeight, h * .7) + 10 : (hb.offsetHeight || 260) + 18 };
}
function woodMedallion(style){
  return (g, s) => {
    const P = (x, y) => [(x + TEX_EXT) * s, (TEX_EXT - y) * s], c = P(0, 0), u = s;
    g.save(); g.translate(c[0], c[1]); g.strokeStyle = 'rgba(58,26,10,.62)'; g.fillStyle = 'rgba(58,26,10,.62)'; g.lineWidth = .045 * u; g.lineCap = 'round';
    const ring = r => { g.beginPath(); g.arc(0, 0, r * u, 0, TAU); g.stroke(); };
    ring(1.78); ring(1.66);
    if (style === 0){ for (let k = 0; k < 12; k++){ g.save(); g.rotate(k * TAU / 12); g.beginPath(); g.ellipse(1.12 * u, 0, .42 * u, .15 * u, 0, 0, TAU); g.stroke(); g.restore(); } }
    else if (style === 1){ for (let k = 0; k < 24; k++){ const a = k * TAU / 24; g.beginPath(); g.moveTo(Math.cos(a) * .72 * u, Math.sin(a) * .72 * u); g.lineTo(Math.cos(a) * (k % 2 ? 1.35 : 1.52) * u, Math.sin(a) * (k % 2 ? 1.35 : 1.52) * u); g.stroke(); } }
    else if (style === 2){ for (let k = 0; k < 8; k++){ g.save(); g.rotate(k * TAU / 8); g.beginPath(); g.moveTo(.7 * u, 0); g.bezierCurveTo(1 * u, .32 * u, 1.4 * u, .26 * u, 1.55 * u, 0); g.bezierCurveTo(1.4 * u, -.26 * u, 1 * u, -.32 * u, .7 * u, 0); g.stroke(); g.restore(); } }
    else { for (let k = 0; k < 16; k++){ const a = k * TAU / 16; g.beginPath(); g.arc(Math.cos(a) * 1.2 * u, Math.sin(a) * 1.2 * u, .07 * u, 0, TAU); g.fill(); } ring(.95); }
    for (let k = 0; k < 36; k++){ const a = k * TAU / 36; g.beginPath(); g.arc(Math.cos(a) * 1.72 * u, Math.sin(a) * 1.72 * u, .022 * u, 0, TAU); g.fill(); }
    ring(.62); g.restore();
  };
}
function loadDef(def){
  theme(def); applyBoard(def.board, true); level = genLevel(def);
  const kind = BOARDS[def.board.key].kind;
  if (kind === 'wood' || kind === 'marble') level.paint = woodMedallion(((def.i < 0 ? def.n : def.i) % 4 + 4) % 4);
  level.limit = def.limit ? levelLimit(level) : 0;
  level.flow = def.relax ? 0 : flowTime(level);
  level.ember = def.w === 2;
  M.holeB.emissive.setHex(level.ember ? 0x8a3410 : 0x000000); M.holeB.emissiveIntensity = level.ember ? .3 : 0;
  buildLevelMeshes(); resetBall('rest', true); resetGong();
  musicMood({ kind: 'calm', w: def.w });
}
function setTarget(i, force){
  if (!force && level && target && !target.relax && target.idx === i) return;
  target = { idx: i, def: LEVELS[i] }; loadDef(LEVELS[i]);
}
function setRelax(n, force){
  if (!force && level && target && target.relax && target.n === n) return;
  target = { idx: -1, relax: true, n, def: relaxDef(n) }; loadDef(target.def);
}
function rebuildLevel(){ if (target){ if (target.relax) setRelax(target.n, true); else setTarget(target.idx, true); } if (st.mode !== 'home') goHome(); }
function homeTarget(){ if (save.mode === 'relax') setRelax(save.relaxN || 0); else setTarget(nextLevelIdx()); }

function renderHome(){
  $('mSeg').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.m === save.mode));
  const sub = $('jSub');
  if (save.mode === 'relax'){
    $('jGlyph').innerHTML = maniCaption() ? '<span class="gem">' + gemSVG(maniP(), 20) + '</span>' : ''; $('jChakra').textContent = 'Endless mazes';
    $('jTitle').textContent = 'Relax'; $('jPips').classList.add('hidden');
    sub.textContent = 'No clock and no holes. Mazes from the worlds you have reached. Just roll, and breathe.'; sub.classList.remove('hidden');
    $('bPlayTxt').textContent = 'Begin';
  } else {
    const i = target && !target.relax ? target.idx : nextLevelIdx(), L = LEVELS[i], C = CHAKRAS[L.w];
    $('jGlyph').innerHTML = glyphSVG(C.petals); $('jChakra').textContent = 'Level ' + (i + 1);
    $('jTitle').textContent = L.name; $('jPips').classList.remove('hidden');
    $('jPips').innerHTML = Array.from({ length: 8 }, (_, j) => { const k = L.w * 8 + j; return `<i class="${save.done[k] ? 'done' : ''} ${k === i ? 'cur' : ''}"></i>`; }).join('');
    const b = save.best[i];
    if (b != null){ sub.innerHTML = 'Best ' + fmt(b) + (save.petal[i] ? ' · petal earned' : ''); sub.classList.remove('hidden'); }
    else if (L.j === 0){ sub.textContent = C.line; sub.classList.remove('hidden'); }
    else sub.classList.add('hidden');
    $('bPlayTxt').textContent = save.done[i] ? 'Play again' : doneCount() ? 'Continue' : 'Begin';
  }
  $('mSw').style.background = ballCss(save.ball);
}
function syncViewBtn(){ $('vSeg').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === save.view)); }
function setView(v){ save.view = v; persist(); syncViewBtn(); if (openSheet === 'shSet') renderSettings(); }
function toggleView(){ setView(save.view === 'eye' ? 'top' : 'eye'); }
function hudLabel(){
  if (target.relax){ $('hLbl').innerHTML = '<span>Relax · ' + ((target.n || 0) + 1) + '</span>'; return; }
  const L = LEVELS[target.idx]; $('hLbl').innerHTML = glyphSVG(CHAKRAS[L.w].petals) + '<span>' + L.name + ' · ' + (target.idx + 1) + '</span>';
}
function updateTimer(){
  const row = $('hTimeRow'), el = $('hTime'), bar = $('hLimit'), pt = $('hPetal');
  if (!target || target.relax || (!save.showTimer && !level.limit)){ row.classList.add('hidden'); bar.classList.add('hidden'); return; }
  row.classList.remove('hidden');
  if (level.limit){ const left = level.limit - st.time; bar.classList.remove('hidden'); el.textContent = fmtS(left); el.classList.toggle('low', left < 10); bar.firstElementChild.style.transform = `scaleX(${clamp(left / level.limit, 0, 1)})`; }
  else { bar.classList.add('hidden'); el.textContent = fmtE(st.time); el.classList.remove('low'); }
  pt.classList.toggle('gone', st.time > level.flow);
  pt.title = 'Arrive within ' + fmtE(level.flow) + ' for a petal';
}
function chapter(def){
  const C = CHAKRAS[def.w], el = $('chap');
  $('cEye').textContent = 'Level ' + (def.i + 1); $('cTitle').innerHTML = '<span class="cg" style="color:' + C.color + '">' + glyphSVG(C.petals) + '</span>'; $('cLine').textContent = C.line;
  el.classList.remove('off'); clearTimeout(chapter.t); chapter.t = setTimeout(() => el.classList.add('off'), 2600);
}
function begin(load){
  closeSheets(true); $('ovWin').classList.add('off'); $('ovPause').classList.add('off'); $('chap').classList.add('off');
  st.paused = false; load();
  initAudio(); if (save.control === 'tilt') enableGyro();
  $('home').classList.add('off'); $('hud').classList.remove('off');
  hudLabel(); st.time = 0; st.tx = st.ty = 0; resetBall('drop', true); resetGong(); ahamLevel();
  level.gates.forEach(g => { g.y = 0; g.closed = true; });
  updateTimer(); tiltChip(); keepAwake(true); canvas.focus(); fitAll(); document.body.classList.add('playing');
}
function play(i){
  if (i == null) i = target && !target.relax ? target.idx : nextLevelIdx();
  if (!unlocked(i)) return;
  if (save.mode !== 'journey'){ save.mode = 'journey'; persist(); }
  begin(() => setTarget(i));
  const L = LEVELS[i];
  let wait = 700;
  if (L.j === 0){ chapter(L); wait = 2900; }
  if (L.intro) setTimeout(() => { if (inGame()) setHint(FEATURES[L.intro], 5200); }, wait);
  else if (!save.tips.move){ save.tips.move = 1; persist(); setTimeout(() => { if (inGame()) setHint(); }, wait); }
  else if (i === 1 && !save.tips.view){ save.tips.view = 1; persist(); setTimeout(() => { if (inGame()) setHint('Sky shows the whole maze. Path follows behind the marble.', 4200); }, 900); }
}
function playRelax(){
  if (save.mode !== 'relax'){ save.mode = 'relax'; persist(); }
  begin(() => setRelax(save.relaxN || 0));
  if (!save.tips.relax){ save.tips.relax = 1; persist(); setTimeout(() => { if (inGame()) setHint('Relax: no clock, no holes. Each maze flows into the next.', 4200); }, 800); }
}
function retry(){ if (!target) return; if (target.relax) playRelax(); else play(target.idx); }
function goHome(){
  st.mode = 'home'; st.paused = false; keys.clear(); drag.id = null; showThumb(); setRoll(0); keepAwake(false);
  $('ovWin').classList.add('off'); $('ovPause').classList.add('off'); $('hud').classList.add('off'); $('hLimit').classList.add('hidden'); $('hint').classList.add('off'); $('chap').classList.add('off');
  $('home').classList.remove('off'); tiltChip(); document.body.classList.remove('playing');
  if (target && !target.relax && save.mode === 'journey' && save.done[target.idx]) setTarget(nextLevelIdx());
  renderHome(); fitAll();
}
/* pause: everything stops, the marble, the clock, the doors */
function pause(){
  if (st.paused || !(inGame() || st.mode === 'ready')) return;
  st.paused = true; keys.clear(); drag.id = null; showThumb(); setRoll(0);
  $('pEye').innerHTML = $('hLbl').innerHTML; renderPause(); $('ovPause').classList.remove('off');
}
function resume(){ if (!st.paused) return; closeSheets(true); $('ovPause').classList.add('off'); st.paused = false; canvas.focus(); }
function renderPause(){
  $('qMusic').classList.toggle('on', !!save.music); $('qSound').classList.toggle('on', !!save.sound); $('qHap').classList.toggle('on', !!save.haptics);
  $('qHap').classList.toggle('hidden', !coarse); $('qCal').classList.toggle('hidden', !useTilt());
}
function winStats(i, t){
  const best = save.best[i], petal = t <= level.flow;
  return `<div>Time<b>${fmt(t)}</b></div><div>Best<b>${fmt(best)}</b></div>`
    + `<div class="${petal ? 'pt' : ''}">${petal ? 'Petal' : 'Flow'}<b>${petal ? '<span class="petal" style="display:inline-block;width:22px;height:22px;vertical-align:-3px">' + PETAL_SVG + '</span>' : fmtE(level.flow)}</b></div>`;
}
function win(){
  if (target.relax) return relaxWin();
  st.mode = 'won'; setRoll(0); keepAwake(false); tiltChip();
  const i = target.idx, L = LEVELS[i], C = CHAKRAS[L.w], chakraDone = L.j === 7, last = i === LEVELS.length - 1, t = st.time;
  const before = seasoning(save.ball), prevBest = save.best[i], firstPetal = t <= level.flow && !save.petal[i];
  save.done[i] = true; save.xp[save.ball] = (save.xp[save.ball] || 0) + 1;
  if (prevBest == null || t < prevBest) save.best[i] = +t.toFixed(1);
  if (t <= level.flow) save.petal[i] = true;
  persist(); refreshMani();
  if (seasoning(save.ball) !== before) applyBall(save.ball, ballPhys(save.ball));
  const row = $('wRow'); row.innerHTML = '';
  const btn = (txt, fn, ghost) => { const b = document.createElement('button'); b.textContent = txt; if (ghost) b.className = 'ghost'; b.onclick = fn; row.appendChild(b); };
  const G = $('wGlyph'); G.classList.toggle('hidden', !chakraDone); G.classList.toggle('gemw', last);
  $('wStats').innerHTML = winStats(i, t); $('wStats').classList.remove('hidden');
  if (last){
    sfxBloom(); setTimeout(() => sfxBloom(), 1600);
    G.innerHTML = gemSVG(1, 96); $('wEye').textContent = 'Seven chakras, open'; $('wTitle').textContent = 'The mani';
    $('wSub').textContent = ENDING;
    btn('Home', goHome, true); btn('Relax', () => { save.mode = 'relax'; persist(); playRelax(); });
  } else if (chakraDone){
    sfxBloom();
    G.innerHTML = glyphSVG(C.petals); $('wEye').textContent = ELEMENTS[L.w]; $('wTitle').textContent = C.name;
    $('wSub').textContent = C.open + ' ' + maniCaption();
    btn('Home', goHome, true); btn('Onward', () => play(i + 1));
  } else {
    $('wEye').innerHTML = glyphSVG(C.petals) + 'Level ' + (i + 1); $('wTitle').textContent = L.name;
    $('wSub').textContent = WIN_LINES[(i * 5 + (firstPetal ? 1 : 0)) % WIN_LINES.length] + (firstPetal ? ' A petal for arriving in flow.' : prevBest != null && t < prevBest ? ' A new best.' : '');
    btn('Home', goHome, true); btn('Next', () => play(i + 1));
  }
  setTimeout(() => { if (st.mode === 'won') $('ovWin').classList.remove('off'); }, 650);
}
function relaxWin(){
  st.mode = 'won'; setRoll(0);
  save.relaxN = (target.n || 0) + 1; save.xp[save.ball] = (save.xp[save.ball] || 0) + 1; persist();
  showToast(RELAX_LINES[target.n % RELAX_LINES.length], 1500);
  setTimeout(() => {
    if (st.mode !== 'won' || !target.relax) return;
    setRelax(save.relaxN); hudLabel(); st.time = 0; st.tx = st.ty = 0; resetBall('drop', true); resetGong(); ahamLevel(); level.gates.forEach(g => { g.y = 0; g.closed = true; }); fitAll();
  }, 1300);
}
function onTrapReset(){ showToast(st.cp.k ? 'Back one ring' : 'Back to the start'); }
function onStepDown(){ /* the landing makes its own knock */ }
function onGong(){ showToast('The lotus opens', 1600); }
function timeUp(){
  thump(150, .25, .5); setHint('Time ran out. The path begins again.', 3200);
  st.time = 0; resetBall('drop', true); resetGong(); level.gates.forEach(g => { g.y = 0; });
}
function onFrame(dt){
  if (level.ember) M.holeB.emissiveIntensity = .28 + .08 * Math.sin(clock * 4.1) * Math.sin(clock * 1.9 + 1);
  if (st.mode === 'play'){ updateTimer(); if (level.limit && st.time > level.limit && !ahamOn) timeUp(); }
}
function onTiltChange(){
  if (!save.controlChosen && coarse && ['brave', 'nodata', 'frame', 'insecure'].includes(gyro.state) && save.control === 'tilt'){ save.control = 'touch'; if (inGame()) setHint(gyro.state === 'brave' ? 'Brave switches off tilt sensors, so drag is on. Drag anywhere to roll.' : 'Tilt isn\'t available here, so drag is on. Drag anywhere to roll.', 5200); }
  syncBar();
  if (openSheet === 'shSet') renderSettings();
}
function setControl(m){ save.control = m; save.controlChosen = true; persist(); if (m === 'tilt') enableGyro(true); tiltChip(); onTiltChange(); syncBar(); }
// the gameplay bar: music on/off and tilt ↔ drag, right where your hands are
function syncBar(){
  $('bMus').classList.toggle('mute', !save.music); $('bMus').setAttribute('aria-pressed', String(!!save.music));
  $('bCtl').classList.toggle('hidden', !coarse); $('bCtl').classList.toggle('drag', save.control === 'touch');
}
$('bMus').onclick = () => { save.music = !save.music; persist(); initAudio(); musicInit(); musicApply(); syncBar(); showToast(save.music ? 'Music on' : 'Music off'); canvas.focus(); };
$('bCtl').onclick = () => { setControl(save.control === 'touch' ? 'tilt' : 'touch'); showToast(save.control === 'touch' ? 'Drag to roll' : 'Tilt to roll'); if (save.control === 'touch') setHint('Drag anywhere to roll.', 2600); };

/* =====================================================================
   AHAM: a 30-minute playtest. Tap the Chakrview logo on the home screen four times.
   Every level open, the marble rolls through walls and over holes, no time limits,
   and nothing is saved: when it ends (or the page reloads) progress is exactly as it was.
   ===================================================================== */
const AHAM_MS = 30 * 60 * 1000;
const aham = { until: 0, snap: null, timer: 0, taps: 0, tapT: 0 };
function ahamLevel(){ st.ghost = ahamOn; if (ahamOn && level.cfg.seal){ st.open = true; } }
function startAham(){
  if (ahamOn) return;
  persist(); aham.snap = JSON.stringify(save); ahamOn = true; aham.until = Date.now() + AHAM_MS;
  $('aham').classList.remove('hidden'); tickAham(); clearInterval(aham.timer); aham.timer = setInterval(tickAham, 1000);
  sfxBloom(); vib([10, 30, 10, 30]); showToast('Aham · playtest on', 2000);
  if (inGame()) ahamLevel(); renderHome(); if (openSheet === 'shLevels') renderLevels();
}
function endAham(why){
  if (!ahamOn) return;
  clearInterval(aham.timer); ahamOn = false; st.ghost = false; $('aham').classList.add('hidden');
  const snap = JSON.parse(aham.snap); Object.keys(save).forEach(k => delete save[k]); Object.assign(save, snap); aham.snap = null;
  refreshMani(); applyBall(save.ball, ballPhys(save.ball)); syncViewBtn(); syncBar(); setSound(); musicApply();
  if (st.mode !== 'home') goHome(); closeSheets(true); homeTarget(); renderHome(); fitAll();
  showToast(why || 'Aham ended · progress as it was', 2400);
}
function tickAham(){ const left = aham.until - Date.now(); if (left <= 0){ endAham('Aham time is up'); return; } $('ahamT').textContent = fmtS(left / 1000); }
$('aham').onclick = () => endAham();
$('logo').addEventListener('click', () => {
  const now = Date.now(); aham.taps = now - aham.tapT < 1000 ? aham.taps + 1 : 1; aham.tapT = now;
  if (aham.taps >= 4){ aham.taps = 0; if (ahamOn) showToast('Aham · ' + fmtS((aham.until - now) / 1000) + ' left', 1600); else startAham(); }
});
/* release notes, newest first (kept in step with CHANGELOG.md) */
const RELEASES = [
  { v: '1.0.0', date: '12 Nov 2026', title: 'First release', notes: [
    'Fifty-six mazes across seven worlds, each on its own carved board of Indian craft.',
    'Two ways to play: Journey, in order, and Relax, endless and gentle with no clock and no holes.',
    'Your best time is kept on every level. Arrive within the flow time and a lotus petal is yours.',
    'Music made to slow you down, with a soft pulse beneath it. Headphones help.',
    'Tilt or drag, and switch any time during play. Music on or off right from the play bar.',
    'Sky and Path views, a pause menu, and a short guide on first play.',
    'Three marbles that grow steadier the more you roll them.',
    'Add it to your home screen to play offline.'
  ] }
];
/* tutorial: four short cards on first launch, replayable from Settings */
const TUT = [
  { t: 'Tilt, or drag', p: () => coarse ? 'Tilt your phone to roll the marble. Wrists tired? Tap the button at the bottom right while you play to switch to dragging, and back.' : 'Use the arrow keys to roll the marble. P pauses, V changes the view.',
    a: '<svg viewBox="0 0 150 120"><g class="tilt"><rect x="47" y="10" width="56" height="100" rx="11" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="75" cy="60" r="22" fill="none" stroke="currentColor" stroke-width="2" opacity=".35"/><circle cx="75" cy="60" r="4" fill="currentColor" opacity=".5"/><g class="roll"><circle cx="75" cy="60" r="8" fill="currentColor"/></g></g></svg>' },
  { t: 'Find the centre', p: () => 'Every maze ends at its middle. Find the gaps and roll inward, ring by ring. Some things you will only understand by going deeper.',
    a: '<svg viewBox="0 0 150 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M75 10a50 50 0 1 0 48 36" opacity=".45"/><path d="M75 26a34 34 0 1 1-30 18" opacity=".6"/><path d="M75 42a18 18 0 1 0 17 12" opacity=".8"/><circle class="glow" cx="75" cy="60" r="5" fill="currentColor"/></svg>' },
  { t: 'Headphones on', p: () => 'The music is made to slow you down, with a soft pulse beneath it that headphones bring out. The note at the bottom left turns it off.',
    a: '<svg viewBox="0 0 150 120" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><path d="M40 78V64a35 35 0 0 1 70 0v14"/><rect x="30" y="70" width="18" height="30" rx="7"/><rect x="102" y="70" width="18" height="30" rx="7"/><path class="glow" d="M14 78q-6 7 0 14M136 78q6 7 0 14" stroke-width="2.5"/></svg>' }
];
let tutI = 0;
function renderTut(){
  const T = TUT[tutI]; $('tArt').innerHTML = typeof T.a === 'function' ? T.a() : T.a; $('tTitle').textContent = T.t; $('tText').textContent = T.p();
  $('tDots').innerHTML = TUT.map((_, k) => `<i class="${k === tutI ? 'on' : ''}"></i>`).join('');
  $('tNext').textContent = tutI === TUT.length - 1 ? 'Begin' : 'Next'; $('tSkip').classList.toggle('hidden', tutI === TUT.length - 1);
}
function showTut(){ closeSheets(true); tutI = 0; renderTut(); $('ovTut').classList.remove('off'); }
function endTut(){ $('ovTut').classList.add('off'); save.tut = true; persist(); }
$('tNext').onclick = () => { initAudio(); if (tutI < TUT.length - 1){ tutI++; renderTut(); } else endTut(); };
$('tSkip').onclick = () => endTut();

/* sheets */
function openSheetId(id){ closeSheets(true); openSheet = id; $(id).classList.remove('off'); $('scrim').classList.remove('off'); requestAnimationFrame(fitAll); }
function closeSheets(silent){ document.querySelectorAll('.sheet').forEach(s => s.classList.add('off')); $('scrim').classList.add('off'); openSheet = null; if (!silent) fitAll(); }
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeSheets());
$('scrim').onclick = () => closeSheets();
function renderLevels(){
  const cur = target && !target.relax ? target.idx : nextLevelIdx(), opened = CHAKRAS.filter((_, w) => save.done[w * 8 + 7]).length;
  const cap = maniCaption(), named = opened >= 3;
  $('maniRow').classList.toggle('hidden', !opened);
  $('maniRow').innerHTML = opened ? `<span class="gem">${gemSVG(maniP(), 46)}</span><span><b>${named ? 'Your mani' : 'Inside the glass'}</b><small>${cap}${petalCount() ? ' · ' + petalCount() + ' petal' + (petalCount() === 1 ? '' : 's') : ''}</small></span>` : '';
  $('chakList').innerHTML = CHAKRAS.map((C, w) => {
    const open = unlocked(w * 8);
    const lv = Array.from({ length: 8 }, (_, j) => { const i = w * 8 + j, b = save.best[i];
      return `<button class="lv ${save.done[i] ? 'done' : ''} ${i === cur ? 'cur' : ''}" data-i="${i}" ${unlocked(i) ? '' : 'disabled'} aria-label="${LEVELS[i].name}, level ${i + 1}" title="${LEVELS[i].name}${b != null ? ' · best ' + fmt(b) : ''}">${i + 1}${save.petal[i] ? '<i>' + PETAL_SVG + '</i>' : ''}</button>`; }).join('');
    const known = save.done[w * 8 + 7];
    return `<div class="chak ${open ? '' : 'lock'}" style="--accent:${C.color}"><div class="ch"><span style="color:${C.color}">${glyphSVG(C.petals)}</span><b>${known ? C.name : open ? worldLabel(w) : '·  ·  ·'}</b>${known ? `<span>${ELEMENTS[w]}</span>` : ''}</div><div class="lvls">${lv}</div></div>`;
  }).join('');
  $('chakList').querySelectorAll('.lv').forEach(b => b.onclick = () => { const i = +b.dataset.i; play(i); });
}
function renderMarbles(){
  const keys = Object.keys(BALLS).filter(k => !BALLS[k].secret || save.egg);
  $('marbleList').style.gridTemplateColumns = `repeat(${keys.length},1fr)`;
  $('marbleList').innerHTML = keys.map(k => { const B = BALLS[k], s = seasoning(k);
    return `<button class="mcard ${save.ball === k ? 'on' : ''}" data-k="${k}"><span class="orb" style="background:${ballCss(k)};--tyre:${B.tyre}"></span><b>${B.name}</b><span class="tag">${B.mat} · ${B.tag}</span>
      <span class="bars"><div><span>Speed</span><i style="--v:${B.stats[0] * 20}%"></i></div><div><span>Grip</span><i style="--v:${B.stats[1] * 20}%"></i></div><div><span>Bounce</span><i style="--v:${B.stats[2] * 20}%"></i></div></span>
      <span class="season">${s >= 1 ? 'Fully seasoned' : 'Seasoning'}<i style="--v:${Math.round(s * 100)}%"></i></span></button>`; }).join('');
  $('marbleList').querySelectorAll('.mcard').forEach(b => b.onclick = () => { save.ball = b.dataset.k; persist(); applyBall(save.ball, ballPhys(save.ball)); renderMarbles(); renderHome(); });
}
function seg(el, opts, cur, fn){ el.innerHTML = ''; for (const [v, label] of opts){ const b = document.createElement('button'); b.textContent = label; b.className = v === cur ? 'on' : ''; b.onclick = () => fn(v); el.appendChild(b); } }
let resetArm = 0;
function renderSettings(){
  $('invRow').classList.toggle('hidden', !coarse); $('verInfo').textContent = 'Version ' + APP_VERSION;
  seg($('sView'), [['top', 'Sky'], ['eye', 'Path']], save.view, v => setView(v));
  seg($('sQual'), [['auto', 'Auto'], ['high', 'High'], ['low', 'Low']], save.quality, v => { save.quality = v; persist(); setQuality(PRESETS[tierOf(v)]); renderSettings(); });
  $('sSens').value = save.sens; $('sMusVol').value = save.musicVol; $('sSfxVol').value = save.sfxVol;
  [['sSound', 'sound'], ['sHap', 'haptics'], ['sBeats', 'beats'], ['sTimer', 'showTimer'], ['sInv', 'invert'], ['sRM', 'reduceMotion']].forEach(([id, k]) => $(id).classList.toggle('on', !!save[k]));
  $('instRow').classList.toggle('hidden', !(deferredPrompt || (isIOS && !standalone)));
  $('bInstall').classList.toggle('hidden', !deferredPrompt);
  $('instInfo').textContent = deferredPrompt ? 'Plays full screen and offline.' : 'In Safari: Share → Add to Home Screen.';
  $('bReset').textContent = resetArm ? 'Tap again' : 'Reset'; $('bReset').classList.toggle('warn', !!resetArm); $('bReset').classList.toggle('ghost', !resetArm);
}
const flip = (k, after) => () => { save[k] = !save[k]; persist(); if (after) after(); renderSettings(); if (st.paused) renderPause(); };
$('sSens').oninput = e => { save.sens = +e.target.value; persist(); };
$('sMusVol').oninput = e => { save.musicVol = +e.target.value; persist(); initAudio(); musicInit(); musicApply(true); };
$('sSfxVol').oninput = e => { save.sfxVol = +e.target.value; persist(); initAudio(); setSound(); };
$('sSfxVol').onchange = () => tock(18);
$('sSound').onclick = flip('sound', () => { initAudio(); setSound(); });
$('sBeats').onclick = flip('beats', () => musicApply());
$('sHap').onclick = flip('haptics', () => { if (save.haptics) vib(20); });
$('sTimer').onclick = flip('showTimer', () => { if (inGame()) updateTimer(); });
$('sInv').onclick = flip('invert');
$('sRM').onclick = flip('reduceMotion');
$('bTut').onclick = () => showTut();
$('bNew').onclick = () => { $('newList').innerHTML = RELEASES.map(r => `<h4>${r.v}<small>${r.date} · ${r.title}</small></h4><ul>${r.notes.map(n => '<li>' + n + '</li>').join('')}</ul>`).join(''); openSheetId('shNew'); };
$('bReset').onclick = () => {
  if (!resetArm){ resetArm = setTimeout(() => { resetArm = 0; renderSettings(); }, 3000); renderSettings(); return; }
  clearTimeout(resetArm); resetArm = 0;
  Object.assign(save, { done: [], best: {}, petal: {}, xp: {}, tips: {}, relaxN: 0, mode: 'journey' }); persist();
  refreshMani(); applyBall(save.ball, ballPhys(save.ball)); setTarget(0, true); renderSettings(); renderHome(); showToast('Progress cleared');
};
$('qMusic').onclick = () => { save.music = !save.music; persist(); initAudio(); musicInit(); musicApply(); renderPause(); syncBar(); };
$('qSound').onclick = () => { save.sound = !save.sound; persist(); initAudio(); setSound(); renderPause(); };
$('qHap').onclick = () => { save.haptics = !save.haptics; persist(); if (save.haptics) vib(20); renderPause(); };
$('qCal').onclick = () => { gyro.cal = true; showToast('Level set'); };
// the easter egg: tap the logo in Settings seven times, once for each chakra
let eggTaps = 0, eggTimer = 0;
$('logoSmall').onclick = () => {
  eggTaps++; clearTimeout(eggTimer); eggTimer = setTimeout(() => eggTaps = 0, 2500);
  if (eggTaps > 1 && eggTaps < 7) thump(900 + eggTaps * 120, .05, .05);
  if (eggTaps >= 7){ eggTaps = 0; save.egg = true; persist(); sfxBloom(); vib([10, 30, 10, 30, 10]); openSheetId('shEgg'); }
};
$('bSuvarna').onclick = () => { save.ball = 'suvarna'; persist(); applyBall('suvarna', ballPhys('suvarna')); renderHome(); closeSheets(); showToast('Suvarna'); };

/* buttons */
$('bPlay').onclick = () => save.mode === 'relax' ? playRelax() : play();
$('mSeg').querySelectorAll('button').forEach(b => b.onclick = () => { if (save.mode === b.dataset.m) return; save.mode = b.dataset.m; persist(); homeTarget(); renderHome(); fitAll(); });
$('bLevels').onclick = () => { renderLevels(); openSheetId('shLevels'); };
$('bMarble').onclick = () => { renderMarbles(); openSheetId('shMarble'); };
$('bSettings').onclick = () => { renderSettings(); openSheetId('shSet'); };
$('vSeg').querySelectorAll('button').forEach(b => b.onclick = () => { setView(b.dataset.v); canvas.focus(); });
$('bPause').onclick = () => pause();
$('pResume').onclick = () => resume();
$('pRestart').onclick = () => { st.paused = false; retry(); };
$('pHome').onclick = () => goHome();
$('pSet').onclick = () => { renderSettings(); openSheetId('shSet'); };
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (KEYMAP[k] && inGame() && !st.paused){ keys.add(k); e.preventDefault(); return; }
  if (e.repeat) return;
  if (!$('ovTut').classList.contains('off')){ if (k === 'enter' || k === ' ' || k === 'arrowright'){ $('tNext').click(); e.preventDefault(); } else if (k === 'escape') endTut(); return; }
  if (openSheet){ if (k === 'escape') closeSheets(); return; }
  if (st.paused){ if (k === 'escape' || k === 'p' || k === 'enter' || k === ' '){ resume(); e.preventDefault(); } else if (k === 'r'){ st.paused = false; retry(); } return; }
  if (st.mode === 'won'){ if (k === 'enter' || k === ' '){ const b = $('wRow').lastElementChild; b && b.click(); e.preventDefault(); } else if (k === 'escape') goHome(); return; }
  if (st.mode === 'home'){ if (k === 'enter'){ $('bPlay').click(); e.preventDefault(); } return; }
  if (k === 'v' || k === 'c') toggleView(); else if (k === 'r') retry(); else if (k === 'escape' || k === 'p') pause();
});
document.addEventListener('visibilitychange', () => { if (document.hidden && inGame() && !st.paused) pause(); });

/* phone app: install, keep awake, offline */
let deferredPrompt = null, wakeLock = null;
const standalone = matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; if (openSheet === 'shSet') renderSettings(); });
addEventListener('appinstalled', () => { deferredPrompt = null; showToast('Installed'); });
$('bInstall').onclick = async () => { if (!deferredPrompt) return; deferredPrompt.prompt(); try { await deferredPrompt.userChoice; } catch(e){} deferredPrompt = null; renderSettings(); };
async function keepAwake(on){ try { if (on && !wakeLock && 'wakeLock' in navigator && !document.hidden){ wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } else if (!on && wakeLock){ await wakeLock.release(); wakeLock = null; } } catch(e){} }
document.addEventListener('visibilitychange', () => { if (!document.hidden && inGame()) keepAwake(true); });
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

/* =====================================================================
   CHAKRVIEW · BOOT
   ===================================================================== */
if (!save.control) save.control = coarse && isBrave ? 'touch' : 'tilt';
if (!BALLS[save.ball] || (BALLS[save.ball].secret && !save.egg)) save.ball = 'kancha';
$('logo').innerHTML = logoHTML('Chakrview', 22);
$('logoSmall').innerHTML = '<span class="mark" style="width:54px;height:54px">' + markSVG() + '</span>';
$('favicon').href = 'icons/icon-192.png';
refreshMani();
applyBall(save.ball, ballPhys(save.ball));
syncViewBtn(); syncBar();
homeTarget();
renderHome();
resize();
requestAnimationFrame(() => fitAll());
if (!save.tut) showTut();
window.__ckv = { st, save, LEVELS, CHAKRAS, genLevel, play, playRelax, setTarget, setRelax, relaxDef, flowTime, gyro, get level(){ return level; }, get target(){ return target; }, win, goHome, pause, resume, segDistIn, MUS, tick, startAham, endAham, get aham(){ return ahamOn; } };
requestAnimationFrame(t => { last = t; frame(t); });
