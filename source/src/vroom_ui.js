
/* =====================================================================
   CHAKRVROOM · CONTENT, circuits, turfs, marbles
   ===================================================================== */
const TURFS = {
  wood:   { name: 'Wood',   drag: 0,    tip: 'Even for every marble.', mul: { kancha: [1, 1], peetal: [1, 1], fauladi: [1.02, .95] } },
  clay:   { name: 'Clay',   drag: .35,  tip: 'Soft Kancha grips best.', mul: { kancha: [1.05, 1.25], peetal: [.98, 1], fauladi: [.92, .85] } },
  felt:   { name: 'Felt',   drag: .6,   tip: 'Slow and grippy.', mul: { kancha: [1.06, 1.2], peetal: [1, 1], fauladi: [.93, .9] } },
  marble: { name: 'Marble', drag: -.12, tip: 'Fast and slippery.', mul: { kancha: [.94, .85], peetal: [1, 1], fauladi: [1.07, 1.1] } }
};
/* six tracks, one for each enemy within, ranked from the loudest and easiest to see (anger)
   to the subtlest and hardest to beat (ego, the "I" the others grow from) */
const TRACKS = [
  { name: 'Krodh',   en: 'Anger',      shape: 'circle', board: 'sheesham', turf: 'wood',   tint: [1.05, .95, .9],   holes: 0, posts: 2, traps: false, decoy: .4, fg: 0, line: 'Anger is loud and easy to see. The first to beat.' },
  { name: 'Irshya',  en: 'Envy',       shape: 'hex',    board: 'gond',     turf: 'felt',   tint: [.95, 1.03, .97],  holes: 0, posts: 3, traps: false, decoy: .5, fg: 1, line: 'Envy watches the marble ahead. Watch your own line.' },
  { name: 'Kaam',    en: 'Desire',     shape: 'oct',    board: 'lippan',   turf: 'clay',   tint: [1.03, .97, .93],  holes: 1, posts: 4, traps: true,  decoy: .6, fg: 1, line: 'Desire pulls you off the line. Hold it.' },
  { name: 'Lobh',    en: 'Greed',      shape: 'square', board: 'bidri',    turf: 'marble', tint: [1, 1, 1.02],      holes: 2, posts: 4, traps: true,  decoy: .7, fg: 1, line: 'Greed wants every corner. Take only what you need.' },
  { name: 'Moh',     en: 'Attachment', shape: 'circle', board: 'madhubani',turf: 'felt',   tint: [1.02, .98, .95],  holes: 2, posts: 5, traps: true,  decoy: .8, fg: 2, line: 'Attachment holds you back. Let go to go fast.' },
  { name: 'Ahankar', en: 'Ego',        shape: 'lotus',  board: 'makrana',  turf: 'marble', tint: [1, .99, 1.03],    holes: 3, posts: 5, traps: true,  decoy: .9, fg: 2, line: 'Ego, the I the others grow from. The hardest to beat.' }
];
const BALLS = {
  kancha:  { name: 'Kancha', mat: 'Glass', tag: 'Soft', tyre: '#e0402f', speed: .86, damp: .62, rest: .5, grip: .1, tock: 2000,
             css: 'radial-gradient(circle at 33% 27%,rgba(255,255,255,.95) 0 5%,rgba(255,255,255,0) 14%),radial-gradient(ellipse 14% 44% at 50% 52%,#ffffff 0 60%,transparent 64%),radial-gradient(ellipse 44% 12% at 50% 50%,#d6e8f6 0 60%,transparent 64%),radial-gradient(ellipse 26% 26% at 56% 46%,#a9cbe6 0 50%,transparent 56%),radial-gradient(circle,rgba(232,242,250,.5) 0 55%,rgba(170,198,222,.75) 82%,rgba(84,112,140,.9))' },
  peetal:  { name: 'Peetal', mat: 'Brass', tag: 'Medium', tyre: '#f2c230', speed: .95, damp: .5, rest: .34, grip: .07, tock: 1050, css: 'radial-gradient(circle at 34% 30%,#fff6d6 0 7%,#e8c477 22%,#9b6f28 70%,#4b3311)' },
  fauladi: { name: 'Fauladi', mat: 'Steel', tag: 'Hard', tyre: '#f4f4f4', speed: 1, damp: .4, rest: .3, grip: .055, tock: 1300, css: 'radial-gradient(circle at 34% 30%,#fff 0 7%,#d9dcdf 18%,#7d8489 62%,#30363a)' }
};
const PCOL = ['#f0a63a', '#3fb3aa', '#e35d86', '#7c86e8'];
/* your rivals are the senses, the ones that pull the mind outward */
const BOTS = [
  { tag: 'JHATKA', sense: 'touch', ball: 'fauladi', v: 5.9, corner: .55, wob: .12, slip: 1.2 },   // a jolt: fastest in a straight line, clumsy in turns
  { tag: 'NAZAR',  sense: 'sight', ball: 'fauladi', v: 5.6, corner: .42, wob: .05, slip: .7 },    // the evil eye: the cleanest line
  { tag: 'CHASKA', sense: 'taste', ball: 'kancha',  v: 5.4, corner: .25, wob: .1,  slip: 1 },     // a craving: greedy through corners
  { tag: 'SHOR',   sense: 'sound', ball: 'peetal',  v: 5.7, corner: .45, wob: .2,  slip: 1.4 },   // the din: fast but wild
  { tag: 'DHUAN',  sense: 'smell', ball: 'peetal',  v: 5.2, corner: .4,  wob: .08, slip: .8 }     // smoke: steady, drifts in
];
function racePhys(ballKey, turfKey){ const B = BALLS[ballKey], m = TURFS[turfKey].mul[ballKey]; return { speed: B.speed * m[0], damp: B.damp, rest: B.rest, grip: B.grip * m[1], tock: B.tock }; }

/* =====================================================================
   CHAKRVROOM · TRACK, a wide circuit lane around a small maze.
   Laps go anticlockwise; on the final lap the pit gate opens into the maze; the centre is the finish.
   ===================================================================== */
const LANE_W = 2.6, WALL_T = .6;
function genTrack(ti, seed, simp){
  const T = TRACKS[ti], m = 3, turf = TURFS[T.turf];
  const maze = genLevel({ shape: T.shape, nG: m, seed, decoy: T.decoy, fg: T.fg, traps: T.traps && simp < 7 });
  // if the bots can't find a way round, rearrange (same counts) a few times before easing off
  const nPost = simp < 4 ? T.posts : simp < 6 ? Math.max(0, T.posts - 1) : 0, nHole = simp < 4 ? T.holes : simp < 6 ? Math.max(0, T.holes - 1) : 0;
  const geo = makeGeo(T.shape, m, { rimW: WALL_T + LANE_W + 1.0 });
  const inR = geo.rimA, laneIn = inR + WALL_T, laneOut = laneIn + LANE_W, mid = (laneIn + laneOut) / 2;
  const gateA = modT(maze.plan[0].e), gw = 1.6 / laneIn, line = gateA + 1.15 / mid, rnd = mulberry32(seed + 333 + simp * 101);
  const regions = maze.regions.filter(R => !R.full);
  regions.push({ a: inR, b: laneIn, s: wrapA(gateA + gw / 2), L: TAU - gw, ridge: true, ring: -2 });
  // chicanes: a bar from the outside wall, then one from the inside, an S-bend
  const chic = [];
  for (let c = 0; c < 3; c++){
    const base = line + (c + 1) * TAU / 4 + (rnd() - .5) * .25, w = .55 / mid;
    regions.push({ a: laneOut - LANE_W * .44, b: laneOut, s: wrapA(base), L: w, bar: true, ring: -3 });
    regions.push({ a: laneIn, b: laneIn + LANE_W * .44, s: wrapA(base + 2.1 / mid), L: w, bar: true, ring: -3 });
    chic.push(base);
  }
  regions.push({ full: true, a: laneOut, b: geo.boardA, ring: -1 });
  const segs = [];
  for (const R of regions){ if (R.full){ R.outer = fullLoop(geo, R.b); R.inner = fullLoop(geo, R.a); addLoop(R.inner, segs); } else { R.loop = regionLoop(geo, R); addLoop(R.loop, segs); } }
  const gate = { a: inR, b: laneIn, s: gateA - gw / 2 - .01, L: gw + .02, timed: false, open: false, y: 0, closed: true, low: false };
  gate.loop = regionLoop(geo, gate); { const gs = []; addLoop(gate.loop, gs); gate.segs = new Float32Array(gs); gate.grid = buildGrid(gs, BALL_R + .05); }
  // bumpers and two holes on the circuit, away from the line, the gate and the chicanes
  const clear = a => Math.abs(wrapA(a - line)) > .5 && Math.abs(wrapA(a - gateA)) > .5 && chic.every(c => Math.abs(wrapA(a - c - 1 / mid)) > .45);
  const posts = [], holes = maze.holes.slice();
  for (let i = 0, t = 0; i < nPost && t < 60; t++){ const a = rnd() * TAU; if (!clear(a)) continue; const [x, y] = geo.pt(mid + (rnd() - .5) * .9, a); if (posts.some(p => Math.hypot(p.x - x, p.y - y) < 3)) continue; posts.push({ x, y, r: .26, tier: 0 }); i++; }
  for (let i = 0, t = 0; i < nHole && t < 60; t++){ const a = rnd() * TAU; if (!clear(a)) continue; const side = rnd() < .5 ? laneIn + .75 : laneOut - .75; const [x, y] = geo.pt(side, a); if (posts.some(p => Math.hypot(p.x - x, p.y - y) < 2.4) || holes.some(h => Math.hypot(h.x - x, h.y - y) < 4)) continue; holes.push({ x, y, r: TRAP_R, goal: false, tier: 0, lane: true }); i++; }
  const k = 1 / (2 * TEX_EXT);
  const lv = {
    cfg: { shape: T.shape, nG: m, seed, race: true }, geo, regions, holes, pockets: maze.pockets, spin: null, plan: maze.plan, gates: [gate], tier: null, tierAt: () => 0,
    segs: new Float32Array(segs), grid: buildGrid(segs, BALL_R + .05), aoGrid: buildGrid(segs, 1.0), spinSegs: new Float32Array(0), spinGrid: buildGrid([], 1),
    entries: maze.entries, posts, gong: null, floorR: laneOut + .12, drag: turf.drag, rollK: T.turf === 'felt' || T.turf === 'clay' ? 1.4 : 1,
    laneIn, laneOut, mid, line, gateA, turf: T.turf, ti
  };
  // the chequered start line, painted into the floor
  lv.paint = (g, s) => {
    const n = 8, cw = LANE_W / n, P = (r, a) => { const q = geo.pt(r, a); return [(q[0] + TEX_EXT) * s, (TEX_EXT - q[1]) * s]; };
    for (let i = 0; i < n; i++) for (let j = 0; j < 2; j++){
      const r0 = laneIn + i * cw, r1 = r0 + cw, a0 = line + (j - 1) * cw / mid, a1 = a0 + cw / mid;
      g.fillStyle = (i + j) % 2 ? 'rgba(245,240,230,.92)' : 'rgba(25,20,18,.88)';
      g.beginPath(); [P(r0, a0), P(r1, a0), P(r1, a1), P(r0, a1)].forEach((p, q) => q ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1])); g.closePath(); g.fill();
    }
  };
  // the grid: two rows of two, just past the line
  lv.slots = [0, 1, 2, 3].map(i => { const row = i >> 1, col = i & 1, a = line + (row ? .55 : 1.3) / mid + .01, r = laneIn + LANE_W * (col ? .72 : .3), [x, y] = geo.pt(r, a); return { k: -1, x, y, a, dir: 1 }; });
  return lv;
}
// lap progress: unwrapped angle travelled anticlockwise from the line, in laps
function laneAngle(x, y){ return Math.atan2(y, x); }

/* bots: follow a shortest path (one lap around, then through the gate and the maze) */
function botPaths(lv){
  const FH = .14, N = Math.ceil(2 * EXT / FH), ok = new Uint8Array(N * N), g = lv.geo;
  const wall = (x, y) => { const r = g.rho(x, y), d = wrapA(Math.atan2(y, x) - lv.line); return r > lv.laneIn - .05 && d < .02 && d > -.5 / r; };
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++){
    const x = -EXT + i * FH, y = -EXT + j * FH;
    if (g.rho(x, y) > lv.laneOut - BALL_R - .1) continue;
    if (segDist(lv, x, y) < BALL_R + (g.rho(x, y) > lv.laneIn ? .07 : .015)) continue;
    if (lv.holes.some(h => !h.goal && Math.hypot(x - h.x, y - h.y) < h.r + .35)) continue;
    if (lv.posts.some(p => Math.hypot(x - p.x, y - p.y) < p.r + BALL_R + .15)) continue;
    ok[j * N + i] = 1;
  }
  const cell = (x, y) => [Math.round((x + EXT) / FH), Math.round((y + EXT) / FH)];
  function bfs(from, to, gateOpen){
    const prev = new Int32Array(N * N).fill(-1), [si, sj] = cell(from.x, from.y), [ti, tj] = cell(to.x, to.y), s = sj * N + si, tgt = tj * N + ti, q = [s]; prev[s] = s;
    const G = lv.gates[0];
    const pass = (i, j) => { if (!ok[j * N + i]) return false; const x = -EXT + i * FH, y = -EXT + j * FH; if (wall(x, y)) return false; if (!gateOpen && segDistIn(G.segs, G.grid, x, y) < BALL_R + .1) return false; return true; };
    for (let h = 0; h < q.length; h++){ const id = q[h]; if (id === tgt) break; const i = id % N, j = (id / N) | 0;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]){ const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= N || b >= N) continue; const n = b * N + a; if (prev[n] < 0 && (pass(a, b) || n === tgt)){ prev[n] = id; q.push(n); } } }
    if (prev[tgt] < 0) return null;
    const pts = []; for (let c = tgt; c !== s; c = prev[c]) pts.push([-EXT + (c % N) * FH, -EXT + ((c / N) | 0) * FH]); pts.push([from.x, from.y]); pts.reverse();
    // string-pull: keep only points we can't see past
    const sees = (p, q) => { const L = Math.hypot(q[0] - p[0], q[1] - p[1]), n = Math.ceil(L / .1); for (let i = 1; i < n; i++){ const t = i / n, [a, b] = cell(p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t); if (!pass(a, b)) return false; } return true; };
    const out = [pts[0]]; let i = 0;
    while (i < pts.length - 1){ let j = Math.min(pts.length - 1, i + 48); while (j > i + 1 && !sees(pts[i], pts[j])) j--; out.push(pts[j]); i = j; }
    return out;
  }
  const A = (() => { const [x, y] = g.pt(lv.mid, lv.line + .9 / lv.mid); return { x, y }; })();
  const B = (() => { const [x, y] = g.pt(lv.mid, lv.line - .75 / lv.mid); return { x, y }; })();
  return { lap: bfs(A, B, false), fin: bfs(A, { x: 0, y: 0 }, true), A };
}

/* =====================================================================
   CHAKRVROOM · RACE STATE
   ===================================================================== */
const race = { on: false, practice: false, track: 0, seed: 1, laps: 3, start: 0, prog: 0, lastA: 0, inMaze: false, finished: false, t: 0, racers: [], fins: {}, resT: 0, rid: 0, gateOpen: false };
const meshPool = [];
function racerMesh(i){
  if (!meshPool[i]){
    const m = new THREE.Mesh(ball.geometry, getBallLook('peetal')); m.castShadow = true;
    const collar = new THREE.Mesh(new THREE.TorusGeometry(BALL_R * 1.02, .035, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    collar.rotation.x = Math.PI / 2; const grp = new THREE.Group(); grp.add(m); grp.add(collar); board.add(grp);
    const tag = document.createElement('b'); $('tags').appendChild(tag);
    meshPool[i] = { grp, m, collar, tag };
  }
  return meshPool[i];
}
const myCollar = new THREE.Mesh(new THREE.TorusGeometry(BALL_R * 1.02, .035, 8, 32), new THREE.MeshBasicMaterial({ color: 0xffffff })); myCollar.rotation.x = Math.PI / 2; board.add(myCollar);
const myTag = document.createElement('b'); $('tags').appendChild(myTag);
function hideRacers(){ meshPool.forEach(p => { p.grp.visible = false; p.tag.style.display = 'none'; }); myCollar.visible = false; myTag.style.display = 'none'; others.length = 0; }

/* =====================================================================
   CHAKRVROOM · ROOMS over MQTT
   ===================================================================== */
const CODE_CH = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const rid = () => Math.random().toString(36).slice(2, 9);
const net = { rx: {}, log: [], mq: null, pending: [], code: '', topic: '', id: rid(), host: false, state: 'idle', players: [], off: 0, rtt: 1e9, seen: {}, hb: 0, joinT: 0 };
const newCode = () => Array.from({ length: 4 }, () => CODE_CH[(Math.random() * CODE_CH.length) | 0]).join('');
const hostNow = () => Date.now() + net.off;
function send(m){ if (net.mq && net.mq.ok){ m.id = net.id; net.mq.pub(net.topic, JSON.stringify(m)); } }
function status(t){ $('dStat').textContent = t || ''; }
const me = () => ({ id: net.id, tag: myTagText(), ball: save.ball });
function myTagText(){ return (save.tag || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3) || 'YOU'; }
async function openRoom(code, asHost){
  closeNet();
  net.code = code; net.topic = 'chakrvroom/v1/' + code; net.host = asHost; net.state = asHost ? 'probing' : 'joining'; net.off = 0; net.rtt = 1e9; net.seen = {}; net.taken = false;
  net.players = asHost ? [Object.assign(me(), { slot: 0 })] : [];
  renderLobby(); status(asHost ? 'Checking ' + code + ' is free…' : 'Connecting…');
  const will = { topic: net.topic, msg: JSON.stringify({ k: 'bye', id: net.id }) };
  const tries = BROKERS.map(u => new MQ(u));
  net.pending = tries;
  const attach = mq => { mq.onmsg = (t, s) => { if (t === net.topic) onNet(s, mq); }; mq.sub(net.topic); };
  let resolveFirst, fails = 0; const first = new Promise(r => resolveFirst = r);
  tries.forEach(mq => mq.connect('cv' + net.id + Math.random().toString(36).slice(2, 5), will, 8000).then(() => {
    if (net.pending !== tries){ mq.close(); return; }
    attach(mq);
    mq.pub(net.topic, JSON.stringify(asHost ? { k: 'probe', id: net.id } : Object.assign({ k: 'hi' }, me())));
    resolveFirst(true);
  }).catch(() => { if (++fails === tries.length) resolveFirst(false); }));
  const ok = await first;
  if (net.pending !== tries) return;
  if (!ok){ net.pending = []; net.state = asHost ? 'create' : 'join'; renderLobby(); status('Couldn\'t reach a room server. Check your internet and try again.'); return; }
  if (asHost){
    // listen a moment for a room that already uses this code
    await new Promise(r => setTimeout(r, 1300));
    if (net.pending !== tries) return;
    if (net.taken){ tries.forEach(m => m.close()); net.pending = []; net.state = 'create'; net.code = ''; renderLobby(); status(code + ' is in use right now. Try other letters.'); vib(30); return; }
    adopt(tries.find(m => m.ok));
    return;
  }
  // keep saying hello until the host answers
  net.joinT = Date.now();
  const again = () => { if (net.mq || net.pending !== tries) return; if (Date.now() - net.joinT > 9000){ closeNet(); net.state = 'join'; renderLobby(); status('No room with that code. Check the four letters.'); return; }
    tries.forEach(m => m.ok && m.pub(net.topic, JSON.stringify(Object.assign({ k: 'hi' }, me())))); setTimeout(again, 1200); };
  setTimeout(again, 1200);
}
function adopt(mq){
  net.mq = mq; net.pending.forEach(m => { if (m !== mq) m.close(); }); net.pending = [];
  mq.onclose = () => { if (net.mq === mq){ closeNet(); goLobby('The connection dropped.'); } };
  clearInterval(net.hb); net.hb = setInterval(heartbeat, 2000);
  if (net.host){ net.state = 'room'; renderLobby(); status('Share the code. Up to four marbles.'); send({ k: 'roster', players: net.players, track: save.track, laps: save.laps }); }
}
function closeNet(why){
  net.log.push((Date.now() % 100000) + ' close ' + (why || ''));
  clearInterval(net.hb); net.pending.forEach(m => m.close()); net.pending = [];
  if (net.mq){ send({ k: 'bye' }); const m = net.mq; net.mq = null; setTimeout(() => m.close(), 60); }
  net.state = 'idle'; net.players = []; net.code = '';
}
function heartbeat(){
  const now = Date.now();
  if (net.host){
    const before = net.players.length;
    net.players = net.players.filter(p => { const ok = p.id === net.id || now - (net.seen[p.id] || now) < 15000; if (!ok) net.log.push((now % 100000) + ' prune ' + p.tag); return ok; });
    if (net.players.length !== before){ renderLobby(); if (race.on && !race.practice) maybeFinishRace(); }
    if (!race.on) send({ k: 'roster', players: net.players, track: save.track, laps: save.laps });
  } else {
    send(Object.assign({ k: 'hi' }, me()));
    const H = net.players.find(p => p.slot === 0);
    if (H && now - (net.seen[H.id] || now) > 15000){ closeNet(); goLobby('The host left the room.'); return; }
    send({ k: 'ping', t: Date.now() });
  }
}
function onNet(s, mq){
  let m; try { m = JSON.parse(s); } catch(e){ return; }
  if (!m || m.id === net.id) return;
  net.seen[m.id] = Date.now(); net.rx[m.k] = (net.rx[m.k] || 0) + 1;
  if (net.state === 'probing'){ if (m.k === 'roster' || (m.k === 'taken' && m.to === net.id)) net.taken = true; if (m.k !== 'hi') return; }
  switch (m.k){
    case 'probe': if (net.host && net.mq) send({ k: 'taken', to: m.id }); break;
    case 'hi':
      if (!net.host) return;
      if (!net.players.find(p => p.id === m.id)){
        if (race.on || net.players.length >= 4){ send({ k: 'full', to: m.id, racing: race.on }); return; }
        const used = new Set(net.players.map(p => p.slot)); let slot = 0; while (used.has(slot)) slot++;
        net.players.push({ id: m.id, tag: String(m.tag || '').slice(0, 3), ball: BALLS[m.ball] ? m.ball : 'peetal', slot }); vib(15); thump(900, .06, .06);
      } else { const p = net.players.find(p => p.id === m.id); p.tag = String(m.tag || '').slice(0, 3); p.ball = BALLS[m.ball] ? m.ball : p.ball; }
      renderLobby(); send({ k: 'roster', players: net.players, track: save.track, laps: save.laps });
      break;
    case 'roster':
      if (net.host) return;
      if (!net.mq){ if (!m.players.some(p => p.id === net.id)) return; adopt(mq); net.state = 'room'; for (let i = 0; i < 6; i++) setTimeout(() => send({ k: 'ping', t: Date.now() }), i * 250); vib(15); }
      net.players = m.players; if (save.track !== m.track){ save.track = m.track; showTrack(); } save.laps = m.laps || 3;
      if (!m.players.some(p => p.id === net.id)){ closeNet(); goLobby('You were removed from the room.'); return; }
      renderLobby(); status(race.on ? '' : 'Connected. The host starts the race.');
      break;
    case 'full': if (m.to === net.id && !net.mq){ closeNet(); net.state = 'join'; renderLobby(); status(m.racing ? 'That room is mid-race. Try again in a minute.' : 'That room is full. Four marbles already.'); } break;
    case 'ping': if (net.host) send({ k: 'pong', to: m.id, t: m.t, h: Date.now() }); break;
    case 'pong': if (m.to === net.id){ const now = Date.now(), r = now - m.t; if (r <= net.rtt){ net.rtt = r; net.off = m.h - (m.t + now) / 2; } } break;
    case 'go': if (!net.host) startRace({ track: m.track, seed: m.seed, laps: m.laps, at: m.at - net.off, players: m.players, rid: m.rid }); break;
    case 'p': { const R = race.racers.find(r => r.id === m.id); if (R && m.r === race.rid){ R.tx = m.x; R.ty = m.y; R.tz = m.z; R.q = m.q; R.lap = m.l; if (!R.seen){ R.seen = true; R.x = m.x; R.y = m.y; R.z = m.z; } R.last = Date.now(); } break; }
    case 'fin': if (m.r === race.rid){ race.fins[m.id] = m.t; const R = race.racers.find(r => r.id === m.id); if (R){ R.done = true; R.t = m.t; } if (net.host) maybeFinishRace(); } break;
    case 'res': if (!net.host && m.r === race.rid) showResults(m.order); break;
    case 'bye':
      if (net.host){ net.players = net.players.filter(p => p.id !== m.id); renderLobby(); send({ k: 'roster', players: net.players, track: save.track, laps: save.laps }); if (race.on) maybeFinishRace(); }
      else if (net.players.find(p => p.id === m.id && p.slot === 0)){ closeNet(); goLobby('The host left the room.'); }
      else { net.players = net.players.filter(p => p.id !== m.id); renderLobby(); }
      { const R = race.racers.find(r => r.id === m.id); if (R) R.gone = true; }
      break;
  }
}

/* =====================================================================
   CHAKRVROOM · RACING
   ===================================================================== */
let lightT = [];
function hostStart(){
  if (!net.host || net.players.length < 2){ status('Waiting for at least one more marble.'); return; }
  const m = { k: 'go', track: save.track, seed: (Math.random() * 1e9) | 0, laps: save.laps, at: Date.now() + 4600, players: net.players, rid: (race.rid || 0) + 1 };
  send(m); startRace({ track: m.track, seed: m.seed, laps: m.laps, at: m.at, players: m.players, rid: m.rid });
}
function practice(){
  const pick = BOTS.slice().sort(() => Math.random() - .5).slice(0, 3);
  const players = [Object.assign(me(), { slot: 0 })].concat(pick.map((b, i) => ({ id: 'bot' + i, tag: b.tag, ball: b.ball, slot: i + 1, bot: b })));
  startRace({ track: save.track, seed: (Math.random() * 1e9) | 0, laps: save.laps, at: Date.now() + 4300, players, rid: (race.rid || 0) + 1, practice: true });
}
function startRace(o){
  initAudio(); if (save.control === 'tilt') enableGyro();
  Object.assign(race, { on: true, practice: !!o.practice, track: o.track, seed: o.seed, laps: o.laps || 3, start: o.at, rid: o.rid, fins: {}, finished: false, inMaze: false, gateOpen: false, resT: 0,
    lapTimes: [], lapStart: 0, lastLap: 0, pos: 0, posCand: 0, posT: 0, waitT: 0, fov: 0, asked: false, cont: false });
  $('ovLost').classList.add('off');
  st.paused = false; $('ovPause').classList.add('off'); musicMood({ kind: 'race', lvl: 0, sa: [55, 58.27, 49, 51.91, 46.25, 61.74][o.track] || 55 });
  closeSheets(true); $('ovWin').classList.add('off');
  loadTrack(o.track, o.seed);
  const mine = o.players.find(p => p.id === net.id) || o.players[0];
  applyBall(save.ball, racePhys(save.ball, level.turf));
  st.cp = Object.assign({}, level.slots[mine.slot]); resetBall('rest'); st.mode = 'ready'; st.time = 0; st.tx = st.ty = 0;
  race.prog = (wrapA(st.cp.a - level.line)) / TAU; race.lastA = laneAngle(st.x, st.y);
  hideRacers();
  race.racers = o.players.filter(p => p.id !== mine.id).map((p, i) => {
    const s = level.slots[p.slot], R = { id: p.id, tag: p.tag || 'P' + (p.slot + 1), ball: p.ball, slot: p.slot, x: s.x, y: s.y, z: BALL_R, tx: s.x, ty: s.y, tz: BALL_R, vx: 0, vy: 0, q: wrapA(s.a - level.line) / TAU, lap: 0, done: false, seen: !!p.bot, bot: p.bot || null, mesh: racerMesh(i), on: true };
    R.mesh.m.material = getBallLook(p.ball); setCore(R.mesh.m, p.ball); R.mesh.m.renderOrder = p.ball === 'kancha' ? 5 : 0; R.mesh.collar.material.color.set(PCOL[p.slot]); R.mesh.grp.visible = true;
    R.mesh.tag.textContent = R.tag; R.mesh.tag.style.background = PCOL[p.slot]; R.mesh.tag.style.display = '';
    if (p.bot){ R.path = race.paths; R.s = 0; R.leg = -1; R.v = p.bot.v * (1 + o.track * .045) * (.96 + Math.random() * .08); R.corner = p.bot.corner; R.wobA = p.bot.wob; R.slip = p.bot.slip; R.pts = null; }
    return R;
  });
  race.me = mine; myCollar.material.color.set(PCOL[mine.slot]); myCollar.visible = true; myTag.textContent = myTagText(); myTag.style.background = PCOL[mine.slot]; myTag.style.display = '';
  others.length = 0; race.racers.forEach(R => others.push(R));
  $('home').classList.add('off'); $('hud').classList.remove('off'); $('hOf').textContent = '/ ' + (race.racers.length + 1);
  // five red lights, one each half second; all out = go
  lightT.forEach(clearTimeout); lightT = [];
  const L = $('lights'), lights = [...L.children]; lights.forEach(l => l.classList.remove('on')); L.classList.remove('off');
  const now = Date.now();
  lights.forEach((l, i) => lightT.push(setTimeout(() => { l.classList.add('on'); if (audio.ctx && save.sound) voice(SA * 3, audio.ctx.currentTime, .25, .05, 'sine', .3); }, Math.max(0, o.at - 2700 + i * 500 - now))));
  lightT.push(setTimeout(() => { lights.forEach(l => l.classList.remove('on')); if (audio.ctx && save.sound) voice(SA * 6, audio.ctx.currentTime, .7, .06, 'sine', .4); vib(25); st.mode = 'play'; st.time = 0; musicMood({ kind: 'race', lvl: 1 }); cue('Go', ''); setTimeout(() => L.classList.add('off'), 900); }, Math.max(0, o.at - now)));
  hudUpdate(); keepAwake(true); tiltChip(); fitAll(); canvas.focus();
  setTimeout(() => setHint(`${TRACKS[o.track].name}: ${race.laps} laps anticlockwise, then the maze. ${TRACKS[o.track].line}`, 4600), 300);
}
function loadTrack(ti, seed){
  const T = TRACKS[ti];
  applyBoard({ key: T.board, seed: seed % 97, sc: 1, tint: T.tint, id: 'T' + ti + ':' + (seed % 97) }, true);
  for (let simp = 0; simp < 8; simp++){ level = genTrack(ti, seed, simp); race.paths = botPaths(level); if (race.paths.lap && race.paths.fin) break; }
  target = { track: ti, seed };
  buildLevelMeshes();
}
function rebuildLevel(){ if (target) loadTrack(target.track, target.seed); if (st.mode !== 'home') goLobby(); }
let target = null;
function raceTime(){ return Math.max(0, (Date.now() - race.start) / 1000); }
function myQ(){ if (race.finished) return 100 - Object.keys(race.fins).length; if (race.inMaze) return race.laps + clamp(1 - level.geo.rho(st.x, st.y) / level.laneIn, 0, 1); return race.prog; }
function onFrame(dt){
  if (!race.on) return;
  const G = level.gates[0];
  if (st.mode === 'play' || st.mode === 'drop' || st.mode === 'fall'){
    // lap progress while on the circuit
    const r = level.geo.rho(st.x, st.y), a = laneAngle(st.x, st.y);
    if (r > level.laneIn - .1 && !race.inMaze){ race.prog += wrapA(a - race.lastA) / TAU; }
    race.lastA = a;
    if (r < level.geo.rimA - .05 && !race.inMaze){ race.inMaze = true; const now = raceTime(); race.lapTimes.push(now - race.lapStart); race.lapStart = now; cue('The maze', ''); chime(3); }
    if (!race.inMaze && r > level.laneIn){ const sec = Math.floor(modT(a - level.line) / (TAU / 8)), sa = level.line + (sec + .5) * TAU / 8, [x, y] = level.geo.pt(level.mid, sa); st.cp = { k: -1, x, y, a: sa, dir: 1 }; }
    // laps: a chime, the lap time, and a bell for the last one
    const lapNow = Math.floor(race.prog);
    if (lapNow > race.lastLap && !race.inMaze && lapNow < race.laps){
      const now = raceTime(); race.lapTimes.push(now - race.lapStart); race.lapStart = now; race.lastLap = lapNow;
      const lt = race.lapTimes[race.lapTimes.length - 1];
      if (lapNow === race.laps - 1){ cue('Final lap', ''); sfxGong(); vib([20, 40, 20]); musicMood({ kind: 'race', lvl: 2 }); }
      else { showToast(`Lap ${lapNow + 1} / ${race.laps} · ${fmt(lt)}`, 1600); chime(lapNow + 1); vib(12); }
    }
    const open = race.prog >= race.laps - 1 || race.inMaze;
    if (open && !race.gateOpen){ race.gateOpen = true; showToast('Gate open', 1500); thump(500, .08, .1); }
    G.open = race.gateOpen;
    // the feel of speed: a hum, a little camera kick, a shake on hard bumps
    const sp = Math.hypot(st.vx, st.vy);
    setHum(st.mode === 'play' ? sp : 0);
    race.fov += ((save.view === 'eye' && !save.reduceMotion ? clamp((sp - 6) * .55, 0, 10) : 0) - race.fov) * (1 - Math.exp(-dt * 3)); camFx.fov = race.fov;
    if (st.impact > 7){ camFx.shake = Math.max(camFx.shake, Math.min(1, st.impact / 24)); if (st.impact > 14) vib(18); }
  } else setHum(0);
  // other marbles
  const now = Date.now();
  for (const R of race.racers){
    if (R.bot) stepBot(R, dt);
    else { const k = 1 - Math.exp(-dt * 12), ox = R.x, oy = R.y; R.x += (R.tx - R.x) * k; R.y += (R.ty - R.y) * k; R.z += (R.tz - R.z) * k; if (Math.hypot(R.tx - R.x, R.ty - R.y) > 3){ R.x = R.tx; R.y = R.ty; } R.vx = (R.x - ox) / Math.max(dt, 1e-3); R.vy = (R.y - oy) / Math.max(dt, 1e-3); }
    R.on = !R.done && !R.gone && R.z > -.1 && R.seen;
    const M = R.mesh; M.grp.visible = !R.gone && R.seen && (!R.done || R.z > -1);
    const mx = R.x - M.grp.position.x, my = -R.y - M.grp.position.z, d = Math.hypot(mx, my);
    if (d > 1e-5 && d < 2){ _ra.set(my, 0, -mx).normalize(); _rq.setFromAxisAngle(_ra, d / BALL_R); M.m.quaternion.premultiply(_rq); }
    M.grp.position.set(R.x, R.z, -R.y);
  }
  myCollar.position.set(st.x, st.z, -st.y); myCollar.visible = st.z > -.3;
  // labels
  placeTag(myTag, st.x, st.z, st.y, myCollar.visible);
  race.racers.forEach(R => placeTag(R.mesh.tag, R.x, R.z, R.y, R.mesh.grp.visible));
  // send my marble ~12 times a second
  if (!race.practice && net.mq && (st.mode !== 'ready')){ race.sendAcc = (race.sendAcc || 0) + dt; if (race.sendAcc > 1 / 12){ race.sendAcc = 0; send({ k: 'p', r: race.rid, x: +st.x.toFixed(2), y: +st.y.toFixed(2), z: +st.z.toFixed(2), q: +myQ().toFixed(3), l: Math.floor(race.prog) }); } }
  if (st.mode === 'play' || st.mode === 'won') hudUpdate();
  // quick race: it ends when every rival is in. If you're still out there, you're asked whether to finish anyway.
  if (race.practice && !race.resT){
    const allIn = race.racers.every(R => R.done);
    if (race.finished){ race.waitT = (race.waitT || 0) + dt; if (allIn || race.waitT > 10) finishPractice(); }
    else if (allIn && !race.asked && st.mode === 'play'){ race.asked = true; showLost(); }
  }
}
const _ra = new THREE.Vector3(), _rq = new THREE.Quaternion(), _tv = new THREE.Vector3();
function placeTag(el, x, z, y, vis){
  if (!vis){ el.style.display = 'none'; return; }
  _tv.set(x, z + BALL_R * 1.4, -y); board.localToWorld(_tv); _tv.project(camera);
  if (_tv.z > 1){ el.style.display = 'none'; return; }
  el.style.display = ''; el.style.transform = `translate(${((_tv.x + 1) / 2 * innerWidth).toFixed(1)}px,${((1 - _tv.y) / 2 * innerHeight).toFixed(1)}px) translate(-50%,-140%)`;
}
function stepBot(R, dt){
  if (st.mode === 'ready' || R.done) { if (R.done){ R.z = Math.max(-1.2, R.z - dt * 2); } return; }
  if (!R.pts){
    const P = race.paths; if (!P.lap || !P.fin){ R.done = true; R.t = 999; return; }
    const s = level.slots[R.slot], pts = [[s.x, s.y]];
    for (let l = 0; l < race.laps - 1; l++) pts.push(...P.lap);
    pts.push(...P.fin);
    R.pts = pts; R.seg = 0; R.u = 0; R.lap = 0; R.lastA = laneAngle(R.x, R.y); R.q = wrapA(s.a - level.line) / TAU;
    R.wob = Math.random() * 10;
    // a little human in them: a late start, the odd wobble or wall-scrape, and a moment of doubt in the maze
    R.delay = .2 + Math.random() * .5; R.nextSlip = 3 + Math.random() * 6 / R.slip; R.slowT = 0; R.lost = Math.random() < .6 ? 1 + Math.random() * 2.2 : 0;
  }
  if (R.delay > 0){ R.delay -= dt; return; }
  let k = 1;
  R.nextSlip -= dt; if (R.nextSlip <= 0){ R.slowT = .4 + Math.random() * .8 * R.slip; R.slowK = .3 + Math.random() * .3; R.nextSlip = 4 + Math.random() * 7 / R.slip; }
  if (R.slowT > 0){ R.slowT -= dt; k = R.slowK; }
  if (level.geo.rho(R.x, R.y) < level.laneIn - .3){ k *= .62; if (R.lost > 0){ R.lost -= dt; k *= .12; } }
  let move = R.v * k * dt * (1 - R.wobA + R.wobA * Math.sin(clock * 1.3 + R.wob));
  // slow into sharp turns
  const nx = R.pts[Math.min(R.seg + 1, R.pts.length - 1)], nn = R.pts[Math.min(R.seg + 2, R.pts.length - 1)];
  if (nx && nn){ const a1 = Math.atan2(nx[1] - R.y, nx[0] - R.x), a2 = Math.atan2(nn[1] - nx[1], nn[0] - nx[0]), turn = Math.abs(wrapA(a2 - a1)), dn = Math.hypot(nx[0] - R.x, nx[1] - R.y); if (dn < 1.5) move *= 1 - R.corner * Math.min(1, turn / 1.6); }
  const ox = R.x, oy = R.y;
  while (move > 0 && R.seg < R.pts.length - 1){
    const b = R.pts[R.seg + 1], dx = b[0] - R.x, dy = b[1] - R.y, d = Math.hypot(dx, dy);
    if (d <= move){ R.x = b[0]; R.y = b[1]; move -= d; R.seg++; } else { R.x += dx / d * move; R.y += dy / d * move; move = 0; }
  }
  R.vx = (R.x - ox) / dt; R.vy = (R.y - oy) / dt;
  const a = laneAngle(R.x, R.y), r = level.geo.rho(R.x, R.y);
  if (r > level.laneIn - .1) R.q += wrapA(a - R.lastA) / TAU; else R.q = race.laps + clamp(1 - r / level.laneIn, 0, 1);
  R.lastA = a; R.lap = Math.floor(R.q);
  if (R.seg >= R.pts.length - 1){ R.done = true; R.t = raceTime(); race.fins[R.id] = R.t; }
}
function hudUpdate(){
  const lap = Math.min(race.laps, Math.max(1, Math.floor(race.prog) + 1));
  $('hLap').textContent = race.finished ? 'Finished' : race.inMaze ? 'The maze' : race.gateOpen ? 'Final lap · gate open' : `Lap ${lap} / ${race.laps}`;
  const q = myQ(), all = [q].concat(race.racers.filter(R => !R.gone).map(R => R.done ? 100 - Object.keys(race.fins).indexOf(R.id) : R.q));
  const pos = race.finished ? Object.keys(race.fins).indexOf(net.id) + 1 || 1 : 1 + all.slice(1).filter(v => v > q).length;
  $('hPos').textContent = 'P' + pos;
  // overtakes: call them out once the new place has held for half a second
  if (st.mode === 'play' && !race.finished){
    if (pos !== race.posCand){ race.posCand = pos; race.posT = Date.now(); }
    else if (pos !== race.pos && Date.now() - race.posT > 450){ if (race.pos && raceTime() > 2.5) cue('P' + pos + (pos < race.pos ? ' ▲' : ' ▼'), pos < race.pos ? 'up' : 'dn'); if (pos < race.pos && race.pos) chime(4 - pos + 2); race.pos = pos; }
  }
  $('hTime').textContent = st.mode === 'ready' ? '' : fmt(race.finished ? race.myT : raceTime());
}
function win(){   // fell into the centre: finished
  st.mode = 'won'; setRoll(0); setHum(0); tiltChip(); race.finished = true; race.myT = raceTime(); race.fins[net.id] = race.myT; sfxBloom(); vib([20, 60, 30]);
  race.lapTimes.push(race.myT - race.lapStart); musicMood({ kind: 'race', lvl: 0 });
  const place = Object.keys(race.fins).length; cue(place === 1 ? 'You win' : 'P' + place, place === 1 ? 'up' : '');
  if (race.practice){ if (!race.cont) setHint('Finished. Waiting for the others…', 3000); return; }
  send({ k: 'fin', r: race.rid, t: race.myT }); setHint('Finished. Waiting for the others…', 3000);
  if (net.host) maybeFinishRace();
}
function onTrapReset(){ showToast(race.inMaze ? 'Back one ring' : 'Back a little'); }
function onStepDown(){}
function onGong(){}
// host: results when everyone is in, or 25 s after the first finisher
function maybeFinishRace(){
  if (!race.on || race.resT === -1) return;
  const ids = net.players.map(p => p.id), finished = ids.filter(id => race.fins[id] != null);
  if (finished.length && !race.resT) race.resT = setTimeout(() => publishResults(), 25000);
  if (finished.length === ids.length) publishResults();
}
function publishResults(){
  if (race.resT === -1) return; clearTimeout(race.resT); race.resT = -1;
  const order = net.players.map(p => ({ id: p.id, tag: p.tag, slot: p.slot, t: race.fins[p.id] != null ? race.fins[p.id] : null })).sort((a, b) => (a.t == null) - (b.t == null) || a.t - b.t);
  send({ k: 'res', r: race.rid, order }); showResults(order);
}
function showLost(){
  st.paused = true; race.pauseAt = Date.now(); setRoll(0); setHum(0); keys.clear(); drag.id = null; showThumb(); musicMood({ kind: 'race', lvl: 0 });
  $('lEye').textContent = TRACKS[race.track].name + ' · ' + TRACKS[race.track].en; $('ovLost').classList.remove('off'); thump(160, .2, .4); vib(40);
}
$('lYes').onclick = () => { $('ovLost').classList.add('off'); race.cont = true; race.start += Date.now() - race.pauseAt; st.paused = false; musicMood({ kind: 'race', lvl: 1 }); setHint('Take your time. Finish the race.', 2600); canvas.focus(); };
$('lNo').onclick = () => { $('ovLost').classList.add('off'); race.start += Date.now() - race.pauseAt; st.paused = false; finishPractice(); };
function finishPractice(){
  if (race.resT === -1) return; race.resT = -1;
  const now = raceTime(), eta = R => { if (R.done) return R.t; if (!R.pts) return null; let d = 0, x = R.x, y = R.y; for (let k = R.seg + 1; k < R.pts.length; k++){ d += Math.hypot(R.pts[k][0] - x, R.pts[k][1] - y); x = R.pts[k][0]; y = R.pts[k][1]; } return now + d / (R.v * (1 - R.wobA * .5) * .93); };
  const all = [{ id: net.id, tag: myTagText(), slot: 0, t: race.fins[net.id] != null ? race.fins[net.id] : null }].concat(race.racers.map(R => ({ id: R.id, tag: R.tag, slot: R.slot, t: eta(R) })));
  showResults(all.sort((a, b) => (a.t == null) - (b.t == null) || a.t - b.t));
}
function showResults(order){
  race.resT = -1;
  const myPos = order.findIndex(o => o.id === net.id) + 1, best = order[0] && order[0].t, T = TRACKS[race.track];
  musicMood({ kind: 'race', lvl: 0 }); setHum(0);
  $('wEye').textContent = T.name + ' · ' + T.en; $('wTitle').textContent = myPos === 1 ? 'You win' : race.cont && race.fins[net.id] != null ? 'Journey complete' : myPos && race.fins[net.id] != null ? 'P' + myPos : 'Race over';
  const senseOf = tag => { const B = BOTS.find(b => b.tag === tag); return B ? '<small>' + B.sense.toUpperCase() + '</small>' : ''; };
  $('wStand').innerHTML = order.map((o, i) => `<div class="${o.id === net.id ? 'me' : ''}"><span class="p">${i + 1}</span><i class="d" style="background:${PCOL[o.slot]}"></i>${o.tag || 'P' + (o.slot + 1)}${race.practice ? senseOf(o.tag) : ''}<span class="t">${o.t == null ? 'DNF' : i === 0 ? fmt(o.t) : '+' + (o.t - best).toFixed(1) + 's'}</span></div>`).join('');
  // your laps, the fastest marked, and the best lap ever on this track
  const L = race.lapTimes || [], laps = L.slice(0, race.laps), el = $('wLaps');
  if (race.fins[net.id] != null && laps.length){
    const fast = Math.min(...laps), prev = save.bestLap[race.track], isBest = prev == null || fast < prev;
    if (isBest){ save.bestLap[race.track] = +fast.toFixed(2); persist(); }
    el.innerHTML = laps.map((t, k) => `<span class="${t === fast ? 'fl' : ''}">Lap ${k + 1} <b>${fmt(t)}</b></span>`).join('') + (L.length > race.laps ? `<span>Maze <b>${fmt(L[race.laps])}</b></span>` : '') + `<span class="${isBest ? 'fl' : ''}">${isBest ? 'New best lap' : 'Best lap ' + fmt(prev)}</span>`;
    el.classList.remove('hidden');
  } else el.classList.add('hidden');
  const row = $('wRow'); row.innerHTML = '';
  const btn = (t, fn, ghost) => { const b = document.createElement('button'); b.textContent = t; if (ghost) b.className = 'ghost'; b.onclick = fn; row.appendChild(b); };
  if (race.practice){ $('wSub').textContent = ''; btn('Lobby', () => goLobby(), true); btn('Race again', practice); }
  else if (net.host){ $('wSub').textContent = ''; btn('Lobby', () => { race.on = false; goLobby(); send({ k: 'roster', players: net.players, track: save.track, laps: save.laps }); }, true); btn('Race again', () => { race.on = false; hostStart(); }); }
  else { $('wSub').textContent = 'The host starts the next race.'; btn('Leave', () => { closeNet(); goLobby(); }, true); btn('Lobby', () => { race.on = false; goLobby(); }); }
  setTimeout(() => $('ovWin').classList.remove('off'), 400);
}
function goLobby(msg){
  net.log.push((Date.now() % 100000) + ' lobby ' + (msg || ''));
  lightT.forEach(clearTimeout); $('lights').classList.add('off');
  race.on = false; st.mode = 'home'; st.paused = false; keys.clear(); drag.id = null; showThumb(); setRoll(0); setHum(0); keepAwake(false); hideRacers(); camFx.fov = 0;
  $('ovPause').classList.add('off'); $('ovLost').classList.add('off'); musicMood({ kind: 'race', lvl: 0 });
  $('ovWin').classList.add('off'); $('hud').classList.add('off'); $('hint').classList.add('off'); $('home').classList.remove('off');
  if (net.state === 'room' || net.state === 'hosting'){} else if (!net.mq) net.state = 'idle';
  showTrack(); renderLobby(); if (msg) status(msg); tiltChip(); fitAll();
}

/* =====================================================================
   CHAKRVROOM · LOBBY UI
   ===================================================================== */
let openSheet = null, toastTimer = 0, hintTimer = 0, cueTimer = 0;
function cue(t, cls){ const el = $('cue'); el.textContent = t; el.className = 'cue on ' + (cls || ''); clearTimeout(cueTimer); cueTimer = setTimeout(() => el.classList.remove('on'), 1100); }
/* pause: practice stops the clock; online, the race keeps going while the menu is open */
function pause(){
  if (!race.on || !$('ovPause').classList.contains('off')) return;
  keys.clear(); drag.id = null; showThumb();
  if (race.practice && st.mode !== 'ready'){ st.paused = true; race.pauseAt = Date.now(); setRoll(0); setHum(0); }
  $('pEye').textContent = TRACKS[race.track].name + ' · ' + $('hLap').textContent;
  $('pNote').classList.toggle('hidden', race.practice); $('pRestart').classList.toggle('hidden', !race.practice);
  renderPause(); $('ovPause').classList.remove('off');
}
function resume(){
  closeSheets(true); $('ovPause').classList.add('off');
  if (st.paused){ race.start += Date.now() - race.pauseAt; st.paused = false; }
  canvas.focus();
}
function renderPause(){
  $('qMusic').classList.toggle('on', !!save.music); $('qSound').classList.toggle('on', !!save.sound); $('qHap').classList.toggle('on', !!save.haptics);
  $('qHap').classList.toggle('hidden', !coarse); $('qCal').classList.toggle('hidden', !useTilt());
}
function leaveRace(){ st.paused = false; $('ovPause').classList.add('off'); if (race.practice || !net.mq) goLobby(); else { closeNet(); goLobby('You left the room.'); } }
/* tutorial */
const TUT = [
  { t: 'Meet your rivals', p: 'Jhatka, Nazar, Chaska, Shor and Dhuan, each named after a sense, each with its own way of racing. Three line up against you in a quick race. Or bring up to three friends.',
    a: '<svg viewBox="0 0 150 120"><circle cx="75" cy="60" r="50" fill="none" stroke="currentColor" stroke-width="3" opacity=".3"/><circle cx="75" cy="60" r="34" fill="none" stroke="currentColor" stroke-width="3" opacity=".3"/>' + PCOL.map((c, k) => `<circle cx="${75 + 42 * Math.cos(k * 1.1 - 2)}" cy="${60 + 42 * Math.sin(k * 1.1 - 2)}" r="7" fill="${c}"/>`).join('') + '</svg>' },
  { t: 'Laps, then the maze', p: 'Run the laps anticlockwise. On the final lap the gate opens into a maze, and the first marble into the centre wins.',
    a: '<svg viewBox="0 0 150 120" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><circle cx="75" cy="60" r="50" opacity=".35"/><path d="M75 10a50 50 0 1 0 50 50" class="glow"/><path d="M120 54l5 7 6-7"/><circle cx="75" cy="60" r="22" opacity=".5"/><circle cx="75" cy="60" r="10" opacity=".7"/><circle cx="75" cy="60" r="3" fill="currentColor"/></svg>' },
  { t: 'Six enemies within', p: 'The tracks run from Krodh, anger, the easiest to beat, to Ahankar, ego, the hardest. To race friends, open a room and share its four-letter code.',
    a: '<svg viewBox="0 0 150 120">' + [0, 1, 2, 3, 4, 5].map(k => `<rect x="${18 + k * 20}" y="${88 - k * 12}" width="14" height="${12 + k * 12}" rx="3" fill="currentColor" opacity="${.25 + k * .13}"/>`).join('') + '</svg>' }
];
let tutI = 0;
function renderTut(){ const T = TUT[tutI]; $('tArt').innerHTML = T.a; $('tTitle').textContent = T.t; $('tText').textContent = T.p; $('tDots').innerHTML = TUT.map((_, k) => `<i class="${k === tutI ? 'on' : ''}"></i>`).join(''); $('tNext2').textContent = tutI === TUT.length - 1 ? 'Let\'s race' : 'Next'; $('tSkip').classList.toggle('hidden', tutI === TUT.length - 1); }
function showTut(){ closeSheets(true); tutI = 0; renderTut(); $('ovTut').classList.remove('off'); }
function endTut(){ $('ovTut').classList.add('off'); save.tut = true; persist(); }
$('tNext2').onclick = () => { initAudio(); if (tutI < TUT.length - 1){ tutI++; renderTut(); } else endTut(); };
$('tSkip').onclick = () => endTut();
function showToast(t, ms){ const el = $('toast'); el.textContent = t; el.classList.add('on'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('on'), ms || 1300); }
function setHint(text, ms){ const el = $('hint'); el.textContent = text || (save.control === 'touch' || !coarse ? (coarse ? 'Drag anywhere to roll.' : 'Arrow keys roll · V switches view') : 'Tilt to roll. ◎ re-levels.'); el.classList.remove('off'); clearTimeout(hintTimer); hintTimer = setTimeout(() => el.classList.add('off'), ms || 4000); }
function layoutBands(){ const hb = $('home').querySelector('.hbot'); return { top: 96, bottom: openSheet ? Math.min($(openSheet).offsetHeight, innerHeight * .7) + 10 : (hb.offsetHeight || 300) + 14 }; }
function showTrack(){
  const T = TRACKS[save.track], Tf = TURFS[T.turf];
  $('tName').textContent = T.name; $('tShape').textContent = (save.track + 1) + ' of ' + TRACKS.length + ' · ' + T.en;
  $('tRank').innerHTML = TRACKS.map((_, k) => `<i class="${k <= save.track ? 'on' : ''}"></i>`).join(''); $('tRank').title = 'Difficulty ' + (save.track + 1) + ' of ' + TRACKS.length;
  $('tTurf').innerHTML = `<b>${Tf.name} turf</b> · ${T.line}`;
  if (st.mode === 'home' && (!target || target.track !== save.track)){ loadTrack(save.track, 1000 + save.track * 7); resetBall('rest', true); }
  const canPick = !(net.state === 'room' && !net.host) && net.state !== 'joining';
  $('tPrev').style.visibility = $('tNext').style.visibility = canPick ? '' : 'hidden';
}
function renderBalls(){
  $('ballRow').innerHTML = Object.keys(BALLS).map(k => `<button class="chip ${save.ball === k ? 'on' : ''}" data-k="${k}" title="${BALLS[k].mat} · ${BALLS[k].tag}"><span class="orb" style="background:${BALLS[k].css};--tyre:${BALLS[k].tyre}"></span>${BALLS[k].tag}</button>`).join('');
  $('ballRow').querySelectorAll('.chip').forEach(b => b.onclick = () => { save.ball = b.dataset.k; persist(); applyBall(save.ball, racePhys(save.ball, TRACKS[save.track].turf)); renderBalls(); if (net.mq) send(Object.assign({ k: 'hi' }, me())); if (net.host){ const p = net.players.find(p => p.id === net.id); if (p) p.ball = save.ball; renderLobby(); } });
}
function renderLobby(){
  const s = net.state;
  $('pMain').classList.toggle('hidden', s !== 'idle');
  $('pCreate').classList.toggle('hidden', !(s === 'create' || s === 'probing')); $('bOpen').disabled = s === 'probing';
  $('pJoin').classList.toggle('hidden', !(s === 'join' || s === 'joining'));
  $('pRoom').classList.toggle('hidden', s !== 'room');
  $('bStart').classList.toggle('hidden', !net.host);
  $('codeTxt').textContent = net.code || '····';
  $('plist').innerHTML = [0, 1, 2, 3].map(i => { const p = net.players.find(p => p.slot === i);
    return p ? `<div class="slot" style="--pc:${PCOL[i]}"><span class="orb" style="background:${BALLS[p.ball] ? BALLS[p.ball].css : ''}"></span>${p.tag || 'P' + (i + 1)}<small>${i === 0 ? 'HOST' : p.id === net.id ? 'YOU' : 'P' + (i + 1)}</small></div>` : `<div class="slot empty">Open</div>`; }).join('');
  $('bStart').disabled = net.players.length < 2; $('bStart').style.opacity = net.players.length < 2 ? .45 : 1;
  if (s === 'idle') status('A quick race against three rivals, or a room for up to four friends. Same Wi‑Fi not needed.');
  showTrack();
}
function syncViewBtn(){ $('vSeg').querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === save.view)); }
function setView(v){ save.view = v; persist(); syncViewBtn(); if (openSheet === 'shSet') renderSettings(); }
function openSheetId(id){ closeSheets(true); openSheet = id; $(id).classList.remove('off'); $('scrim').classList.remove('off'); requestAnimationFrame(fitAll); }
function closeSheets(silent){ document.querySelectorAll('.sheet').forEach(s => s.classList.add('off')); $('scrim').classList.add('off'); openSheet = null; if (!silent) fitAll(); }
document.querySelectorAll('[data-close]').forEach(b => b.onclick = () => closeSheets());
$('scrim').onclick = () => closeSheets();
function seg(el, opts, cur, fn){ el.innerHTML = ''; for (const [v, label] of opts){ const b = document.createElement('button'); b.textContent = label; b.className = v === cur ? 'on' : ''; b.onclick = () => fn(v); el.appendChild(b); } }
function renderSettings(){
  $('invRow').classList.toggle('hidden', !coarse); $('verInfo').textContent = 'Version ' + APP_VERSION;
  seg($('sView'), [['top', 'Sky'], ['eye', 'Path']], save.view, v => setView(v));
  seg($('sLaps'), [[2, '2'], [3, '3'], [5, '5']], save.laps, v => { if (net.state === 'room' && !net.host) return; save.laps = v; persist(); renderSettings(); if (net.host && net.mq) send({ k: 'roster', players: net.players, track: save.track, laps: save.laps }); });
  seg($('sQual'), [['auto', 'Auto'], ['high', 'High'], ['low', 'Low']], save.quality, v => { save.quality = v; persist(); setQuality(PRESETS[tierOf(v)]); renderSettings(); });
  $('sSens').value = save.sens; $('sMusVol').value = save.musicVol; $('sSfxVol').value = save.sfxVol;
  [['sSound', 'sound'], ['sHap', 'haptics'], ['sInv', 'invert'], ['sRM', 'reduceMotion']].forEach(([id, k]) => $(id).classList.toggle('on', !!save[k]));
  $('sTagShow').textContent = myTagText();
}
function onTiltChange(){
  if (!save.controlChosen && coarse && ['brave', 'nodata', 'frame', 'insecure'].includes(gyro.state) && save.control === 'tilt') save.control = 'touch';
  syncBar(); if (openSheet === 'shSet') renderSettings();
}
function setControl(m){ save.control = m; save.controlChosen = true; persist(); if (m === 'tilt') enableGyro(true); tiltChip(); onTiltChange(); syncBar(); }
function syncBar(){ $('bMus').classList.toggle('mute', !save.music); $('bCtl').classList.toggle('hidden', !coarse); $('bCtl').classList.toggle('drag', save.control === 'touch'); }
$('bMus').onclick = () => { save.music = !save.music; persist(); initAudio(); musicInit(); musicApply(); syncBar(); renderPause(); showToast(save.music ? 'Music on' : 'Music off'); canvas.focus(); };
$('bCtl').onclick = () => { setControl(save.control === 'touch' ? 'tilt' : 'touch'); showToast(save.control === 'touch' ? 'Drag to roll' : 'Tilt to roll'); };
$('sSens').oninput = e => { save.sens = +e.target.value; persist(); };
const flip = (k, after) => () => { save[k] = !save[k]; persist(); if (after) after(); renderSettings(); renderPause(); };
$('sSound').onclick = flip('sound', () => { initAudio(); setSound(); });
$('sHap').onclick = flip('haptics', () => { if (save.haptics) vib(20); });
$('sInv').onclick = flip('invert');
$('sRM').onclick = flip('reduceMotion');
$('sMusVol').oninput = e => { save.musicVol = +e.target.value; persist(); initAudio(); musicInit(); musicApply(true); };
$('sSfxVol').oninput = e => { save.sfxVol = +e.target.value; persist(); initAudio(); setSound(); };
$('sSfxVol').onchange = () => tock(18);
$('bTut').onclick = () => showTut();
const RELEASES = [
  { v: '1.0.0', date: '12 Nov 2026', title: 'First release', notes: [
    'Six tracks, one for each enemy within, from Krodh (anger) to Ahankar (ego).',
    'Quick races against five rivals, each named after a sense and each with its own way of racing.',
    'Rooms for up to four friends. Pick your own four-letter code, or take a random one.',
    'Laps, then a maze: the gate opens on the final lap and the centre is the finish.',
    'Lap times, your fastest lap, overtake calls, a final-lap bell and a low, driving beat.',
    'Tilt or drag, and music on or off, right from the race bar.'
  ] }
];
$('bNew').onclick = () => { $('newList').innerHTML = RELEASES.map(r => `<h4>${r.v}<small>${r.date} · ${r.title}</small></h4><ul>${r.notes.map(n => '<li>' + n + '</li>').join('')}</ul>`).join(''); openSheetId('shNew'); };
$('qMusic').onclick = () => { save.music = !save.music; persist(); initAudio(); musicInit(); musicApply(); renderPause(); syncBar(); };
$('qSound').onclick = () => { save.sound = !save.sound; persist(); initAudio(); setSound(); renderPause(); };
$('qHap').onclick = () => { save.haptics = !save.haptics; persist(); if (save.haptics) vib(20); renderPause(); };
$('qCal').onclick = () => { gyro.cal = true; showToast('Level set'); };
$('pResume').onclick = () => resume();
$('pRestart').onclick = () => { st.paused = false; $('ovPause').classList.add('off'); practice(); };
$('pSet').onclick = () => { renderSettings(); openSheetId('shSet'); };
$('pLeave').onclick = () => leaveRace();
$('bPause').onclick = () => pause();
$('tag').value = save.tag || '';
$('tag').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3); save.tag = e.target.value; persist(); if (net.host){ const p = net.players.find(p => p.id === net.id); if (p){ p.tag = myTagText(); renderLobby(); } } else if (net.mq) send(Object.assign({ k: 'hi' }, me())); });
$('tag').addEventListener('keydown', e => e.stopPropagation());
$('tPrev').onclick = () => { save.track = (save.track + TRACKS.length - 1) % TRACKS.length; persist(); showTrack(); applyBall(save.ball, racePhys(save.ball, TRACKS[save.track].turf)); if (net.host) send({ k: 'roster', players: net.players, track: save.track, laps: save.laps }); };
$('tNext').onclick = () => { save.track = (save.track + 1) % TRACKS.length; persist(); showTrack(); applyBall(save.ball, racePhys(save.ball, TRACKS[save.track].turf)); if (net.host) send({ k: 'roster', players: net.players, track: save.track, laps: save.laps }); };
$('bCreate').onclick = () => { initAudio(); net.state = 'create'; $('codeNew').value = newCode(); renderLobby(); status('Share this code with your friends once the room is open.'); };
$('bNewCode').onclick = () => { $('codeNew').value = newCode(); };
$('bCreateBack').onclick = () => { closeNet(); renderLobby(); };
const tryOpen = () => { const c = $('codeNew').value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (c.length !== 4){ status('A room code is four letters or numbers.'); return; } openRoom(c, true); };
$('bOpen').onclick = tryOpen;
$('codeNew').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') tryOpen(); });
$('codeNew').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); });
$('bJoin').onclick = () => { net.state = 'join'; renderLobby(); status('Type the four letters from the host.'); setTimeout(() => $('codeIn').focus(), 60); };
$('bJoinBack').onclick = () => { closeNet(); renderLobby(); };
const tryJoin = () => { const c = $('codeIn').value.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (c.length !== 4){ status('Codes have four letters.'); return; } openRoom(c, false); };
$('bGoJoin').onclick = tryJoin;
$('codeIn').addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') tryJoin(); });
$('codeIn').addEventListener('input', e => { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4); });
$('bLeave').onclick = () => { closeNet(); renderLobby(); };
$('bStart').onclick = () => hostStart();
$('bBots').onclick = () => practice();
$('bShare').onclick = async () => {
  const url = location.href.split(/[?#]/)[0] + '#r=' + net.code, text = 'Race me in Chakrvroom · room ' + net.code;
  try { if (navigator.share){ await navigator.share({ title: 'Chakrvroom', text, url }); return; } } catch(e){ return; }
  try { await navigator.clipboard.writeText(text + '\n' + url); showToast('Link copied'); } catch(e){ showToast(net.code); }
};
$('bSettings').onclick = () => { renderSettings(); openSheetId('shSet'); };
$('vSeg').querySelectorAll('button').forEach(b => b.onclick = () => { setView(b.dataset.v); canvas.focus(); });

addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  if (KEYMAP[k] && inGame() && !st.paused){ keys.add(k); e.preventDefault(); return; }
  if (e.repeat) return;
  if (!$('ovTut').classList.contains('off')){ if (k === 'enter' || k === ' ' || k === 'arrowright'){ $('tNext2').click(); e.preventDefault(); } else if (k === 'escape') endTut(); return; }
  if (openSheet){ if (k === 'escape') closeSheets(); return; }
  if (!$('ovPause').classList.contains('off')){ if (k === 'escape' || k === 'p' || k === 'enter'){ resume(); e.preventDefault(); } return; }
  if (race.on && (k === 'escape' || k === 'p')){ pause(); return; }
  if (k === 'v' && st.mode !== 'home') setView(save.view === 'eye' ? 'top' : 'eye');
});
addEventListener('pagehide', () => { if (net.mq) send({ k: 'bye' }); });
document.addEventListener('visibilitychange', () => { if (document.hidden && race.on && race.practice && st.mode === 'play') pause(); });
let wakeLock = null;
async function keepAwake(on){ try { if (on && !wakeLock && 'wakeLock' in navigator && !document.hidden){ wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); } else if (!on && wakeLock){ await wakeLock.release(); wakeLock = null; } } catch(e){} }
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

/* =====================================================================
   CHAKRVROOM · BOOT
   ===================================================================== */
if (!save.control) save.control = coarse && isBrave ? 'touch' : 'tilt';
if (!BALLS[save.ball]) save.ball = 'kancha';
if (!TRACKS[save.track]) save.track = 0;
$('logo').innerHTML = logoHTML('Chakrvroom', 21, { race: true });
$('favicon').href = 'icons/icon-192.png';
setBackdrop(0x1b1c28); hemi.intensity = .5; setMani(.55, .3);
applyBall(save.ball, racePhys(save.ball, TRACKS[save.track].turf));
syncViewBtn(); syncBar(); renderBalls(); showTrack(); renderLobby(); musicMood({ kind: 'race', lvl: 0 });
if (!save.tut) showTut();
resize(); requestAnimationFrame(() => fitAll());
{ const m = /#r=([A-Za-z0-9]{4})/.exec(location.hash); if (m){ history.replaceState(null, '', location.pathname + location.search); $('codeIn').value = m[1].toUpperCase(); openRoom(m[1].toUpperCase(), false); } }
window.__cvr = { st, race, net, save, get level(){ return level; }, practice, openRoom, hostStart, TRACKS, genTrack, botPaths, pause, resume, tick, BOTS };
requestAnimationFrame(t => { last = t; frame(t); });
