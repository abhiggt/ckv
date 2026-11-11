
/* =====================================================================
   ENGINE 6 · MAZE GEOMETRY, circle / polygon / lotus rings (ρ = the shape's own radius)
   ===================================================================== */
function makeGeo(shape, nG, opt){
  opt = opt || {};
  const S = SHAPES[shape], N = S.N, ch = N ? Math.cos(Math.PI / N) : 1, petals = S.petals || 0, amp = S.amp || 0;
  const nAng = []; for (let k = 0; k < N; k++) nAng.push(k * TAU / N);
  const nx = nAng.map(Math.cos), ny = nAng.map(Math.sin), vAng = nAng.map(a => a + Math.PI / N);
  const centerR = opt.centerR || 2.0, pair = opt.pair || S.pair, rimA = centerR + nG * pair, boardA = rimA + (opt.rimW || 1.0);
  const gw = opt.gw || clamp(pair * .58, .95, 1.05), grooves = [], ridges = [];
  for (let k = 0; k < nG; k++){ const o = rimA - k * pair; grooves.push([o - gw, o]); ridges.push([o - pair, o - gw]); }
  const maxDot = th => { let m = -1; const c = Math.cos(th), s = Math.sin(th); for (let k = 0; k < N; k++){ const d = c * nx[k] + s * ny[k]; if (d > m) m = d; } return m; };
  const unitR = th => petals ? 1 + amp * Math.cos(petals * th) : N ? 1 / maxDot(th) : 1;
  const pt = (rho, th) => { const t = rho * unitR(th); return [t * Math.cos(th), t * Math.sin(th)]; };
  const rho = (x, y) => { if (petals) return Math.hypot(x, y) / unitR(Math.atan2(y, x)); if (!N) return Math.hypot(x, y); let m = -1e9; for (let k = 0; k < N; k++){ const d = x * nx[k] + y * ny[k]; if (d > m) m = d; } return m; };
  let extX = boardA * (1 + amp), extY = extX;
  if (N){ extX = extY = 0; for (const a of vAng){ const r = boardA / ch; extX = Math.max(extX, Math.abs(r * Math.cos(a))); extY = Math.max(extY, Math.abs(r * Math.sin(a))); } }
  return { shape, N, ch, petals, vAng, boardA, rimA, centerR, pair, grooves, ridges, pt, rho, extX, extY, nG };
}
function arcAngles(geo, s, L){
  const out = [s];
  if (!geo.N){ const n = Math.max(1, Math.ceil(L / ((geo.petals ? .5 : 1) * Q.arc * D2R))); for (let i = 1; i < n; i++) out.push(s + L * i / n); }
  else { const mid = []; for (const v of geo.vAng){ const rel = modT(v - s); if (rel > 1e-6 && rel < L - 1e-6) mid.push(s + rel); } mid.sort((a, b) => a - b); out.push(...mid); }
  out.push(s + L); return out;
}
function fullLoop(geo, rho){ const A = arcAngles(geo, 0, TAU); A.pop(); return A.map(a => geo.pt(rho, a)); }
function regionLoop(geo, R){
  const A = arcAngles(geo, R.s, R.L), pts = [];
  for (const a of A) pts.push(geo.pt(R.b, a));
  for (let i = A.length - 1; i >= 0; i--) pts.push(geo.pt(R.a, A[i]));
  return pts;
}
const inArc = (a, s, L) => modT(a - s) <= L;
const addLoop = (pts, out) => { for (let i = 0; i < pts.length; i++){ const p = pts[i], q = pts[(i + 1) % pts.length]; out.push(p[0], p[1], q[0], q[1]); } };
const addLine = (pts, out) => { for (let i = 0; i + 1 < pts.length; i++){ const p = pts[i], q = pts[i + 1]; out.push(p[0], p[1], q[0], q[1]); } };

/* =====================================================================
   ENGINE 7 · SEEDED LEVEL GENERATOR
   cfg: shape nG seed · noBars decoy fg traps posts spin seal · tier (sunken centre) · gates (timed doors)
   ===================================================================== */
function genLevel(cfg){
  const nG = cfg.nG, geo = makeGeo(cfg.shape, nG), rnd = mulberry32((cfg.seed | 0) + 9);
  const rm = k => (geo.grooves[k][0] + geo.grooves[k][1]) / 2;
  const gapW = k => 1.3 / geo.ridges[k][0], barW = k => .7 / rm(k);
  const tierK = cfg.tier ? Math.floor((nG - 1) / 2) : -1;
  const plan = [], start = rnd() * TAU - Math.PI;
  let e = start;
  for (let k = 0; k < nG; k++){
    const r = rm(k), dir = rnd() < .5 ? 1 : -1;
    const entryHalf = k === 0 ? .55 / r : gapW(k - 1) / 2, barHalf = barW(k) / 2, minD = entryHalf + barHalf + .6 / r;
    const decoy = k > 0 && rnd() < (cfg.decoy || 0);
    const delta = decoy ? minD + (.4 + rnd() * .6) * Math.min(75 * D2R, 4.5 / r) : minD;
    const Lmax = Math.min(300 * D2R, TAU - delta - barHalf - gapW(k) / 2 - 1 / r), Lmin = Math.min(110 * D2R, Lmax);
    const L = cfg.noBars ? Math.PI * (.85 + rnd() * .3) : Lmin + rnd() * (Lmax - Lmin);
    const p = { e, dir, L, delta, gap: e + dir * L, bar: e - dir * delta, trap: null, decoy };
    if (cfg.traps && decoy){ const free = delta - barHalf - entryHalf; if (free * r >= 2 * TRAP_R + 1.1) p.trap = e - dir * (entryHalf + free * .6); }
    plan.push(p); e = p.gap;
  }
  const ridgeGaps = plan.map((p, k) => [{ a: p.gap, w: gapW(k) }]);
  const bars = cfg.noBars ? [] : plan.map((p, k) => ({ k, c: p.bar }));
  const holes = [], pockets = [];
  plan.forEach((p, k) => { if (p.trap != null){ const q = geo.pt(rm(k), p.trap); holes.push({ x: q[0], y: q[1], r: TRAP_R, goal: false, k }); } });
  let want = cfg.noBars ? 0 : (cfg.fg || 0), tries = 0; const used = new Set();
  while (want > 0 && tries++ < 30 && nG > 1){
    const k = Math.floor(rnd() * (nG - 1)), j = k + 1;
    if (used.has(j) || k === tierK) continue;          // no false openings down the step, you could never climb back
    const P = plan[j], r = rm(j), bh = barW(j) / 2, fh = gapW(k) / 2, inner = fh + .18 / r, W = 2 * (inner + 2 * bh);
    const u1 = P.L + gapW(j) / 2 + .5 / r, u2 = TAU - P.delta - bh - .5 / r;
    if (u2 - u1 < W) continue;
    const uc = u1 + W / 2 + rnd() * (u2 - u1 - W), fg = P.e + P.dir * uc;
    if (bars.some(b => b.k === k && Math.abs(wrapA(b.c - fg)) < barW(k) / 2 + fh + .25 / rm(k))) continue;
    ridgeGaps[k].push({ a: fg, w: gapW(k) });
    bars.push({ k: j, c: P.e + P.dir * (uc - inner - bh) }, { k: j, c: P.e + P.dir * (uc + inner + bh) });
    pockets.push({ k: j, s: fg - inner - 2 * bh, L: 2 * (inner + 2 * bh) });
    if (cfg.traps){ const q = geo.pt(r, fg); holes.push({ x: q[0], y: q[1], r: TRAP_R, goal: false, k: j }); }
    used.add(j); want--;
  }
  holes.push({ x: 0, y: 0, r: GOAL_R, goal: true, k: nG });

  // turning ring (round boards only)
  let spin = null;
  if (cfg.spin && !geo.N && !geo.petals){
    const cands = []; for (let k = 0; k < nG; k++) if (ridgeGaps[k].length === 1 && k !== tierK) cands.push(k);
    if (cands.length){ const k = cands.includes(Math.floor(nG / 2)) ? Math.floor(nG / 2) : cands[cands.length - 1]; spin = { k, w: cfg.spin * (rnd() < .5 ? 1 : -1), a: 0 }; }
  }
  // timed doors in some ridge openings (they sink into the floor and rise again)
  const gates = [];
  if (cfg.gates){
    const cands = []; for (let k = 0; k < nG; k++) if (ridgeGaps[k].length === 1 && k !== tierK && !(spin && spin.k === k)) cands.push(k);
    for (let i = cands.length - 1; i > 0; i--){ const j = (rnd() * (i + 1)) | 0; [cands[i], cands[j]] = [cands[j], cands[i]]; }
    cands.slice(0, cfg.gates).sort((a, b) => a - b).forEach((k, i) => {
      const gp = ridgeGaps[k][0]; const [a, b] = geo.ridges[k];
      gates.push({ k, a, b, s: gp.a - gp.w / 2 - .02, L: gp.w + .04, period: 3.4 + rnd() * 1.4, openFrac: .52, phase: rnd() * 5, y: 0, closed: true, timed: true });
    });
  }

  const regions = [{ full: true, a: geo.rimA, b: geo.boardA, ring: -1 }];
  ridgeGaps.forEach((gs, k) => {
    const [a, b] = geo.ridges[k];
    gs.forEach(g => g.a = modT(g.a)); gs.sort((p, q) => p.a - q.a);
    for (let i = 0; i < gs.length; i++){ const g = gs[i], h = gs[(i + 1) % gs.length], s = g.a + g.w / 2; regions.push({ a, b, s: wrapA(s), L: gs.length === 1 ? TAU - g.w : modT(h.a - h.w / 2 - s), ring: k, ridge: true, spin: spin && spin.k === k }); }
  });
  bars.forEach(bb => { const [a, b] = geo.grooves[bb.k], w = barW(bb.k); regions.push({ a, b, s: wrapA(bb.c - w / 2), L: w, bar: true, ring: bb.k }); });

  const segs = [], spinSegs = [];
  for (const R of regions){
    if (R.full){ R.outer = fullLoop(geo, R.b); R.inner = fullLoop(geo, R.a); addLoop(R.inner, segs); }
    else { R.loop = regionLoop(geo, R); addLoop(R.loop, R.spin ? spinSegs : segs); }
  }
  for (const Gt of gates){ Gt.loop = regionLoop(geo, Gt); const gs = []; addLoop(Gt.loop, gs); Gt.segs = new Float32Array(gs); Gt.grid = buildGrid(gs, BALL_R + .05); }

  // the step down: wall faces along the openings of the boundary ridge, solid only from below
  let tier = null;
  if (tierK >= 0){
    const a = geo.ridges[tierK][0], cliff = [];
    for (const g of ridgeGaps[tierK]){ const A = arcAngles(geo, g.a - g.w / 2 - .02, g.w + .04); addLine(A.map(t => geo.pt(a, t)), cliff); }
    tier = { k: tierK, a, D: TIER_D, segs: new Float32Array(cliff), grid: buildGrid(cliff, BALL_R + .05), gaps: ridgeGaps[tierK].map(g => ({ s: g.a - g.w / 2, L: g.w })) };
    const lowRing = R => R.ridge ? R.ring > tierK : R.bar ? R.ring > tierK : false;
    regions.forEach(R => { R.low = lowRing(R); R.cliff = R.ridge && R.ring === tierK; });
    gates.forEach(Gt => Gt.low = Gt.k > tierK);
  }
  const tierAt = (x, y) => tier && geo.rho(x, y) < tier.a - .02 ? 1 : 0;
  holes.forEach(H => H.tier = tierAt(H.x, H.y));

  const s0 = geo.pt(rm(0), start), d0 = plan[0].dir;
  const lv = {
    cfg, geo, regions, holes, pockets, spin, plan, gates, tier, tierAt,
    segs: new Float32Array(segs), grid: buildGrid(segs, BALL_R + .05), aoGrid: buildGrid(segs, 1.0),
    spinSegs: new Float32Array(spinSegs), spinGrid: buildGrid(spinSegs, BALL_R + .05),
    start: { x: s0[0], y: s0[1] }, heading: Math.atan2(d0 * Math.cos(start), -d0 * Math.sin(start)),
    entries: plan.map((p, k) => { const q = geo.pt(rm(k), p.e); return { k, x: q[0], y: q[1], a: p.e, dir: p.dir }; }),
    posts: [], gong: null
  };

  // reachability from the start (turning rings and doors count as open), nothing is placed where the ball can't go
  const FH = .16, FN = Math.ceil(2 * EXT / FH), seen = new Uint8Array(FN * FN);
  {
    const ok = (i, j) => { const x = -EXT + i * FH, y = -EXT + j * FH; if (geo.rho(x, y) > geo.rimA) return false; if (segDist(lv, x, y) < BALL_R - .03) return false; for (const H of holes) if (!H.goal && Math.hypot(x - H.x, y - H.y) < H.r + .05) return false; return true; };
    const si = Math.round((s0[0] + EXT) / FH), sj = Math.round((s0[1] + EXT) / FH), q = [sj * FN + si]; seen[q[0]] = 1;
    for (let h = 0; h < q.length; h++){ const id = q[h], i = id % FN, j = (id / FN) | 0; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]){ const a = i + di, b = j + dj; if (a < 0 || b < 0 || a >= FN || b >= FN) continue; const n = b * FN + a; if (!seen[n] && ok(a, b)){ seen[n] = 1; q.push(n); } } }
  }
  const reachable = (x, y) => { const i = Math.round((x + EXT) / FH), j = Math.round((y + EXT) / FH); for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) if (seen[(j + dj) * FN + i + di]) return true; return false; };
  lv.reachable = reachable;
  const inPocket = (k, a) => pockets.some(P => P.k === k && inArc(a, P.s, P.L));
  const nearHole = (x, y, m) => holes.some(H => !H.goal && Math.hypot(x - H.x, y - H.y) < H.r + m);
  const taken = [];
  const free = (x, y, m) => taken.every(t => Math.hypot(x - t[0], y - t[1]) > m);
  const nearBar = (k, a) => bars.some(b => b.k === k && Math.abs(wrapA(b.c - a)) < barW(k) / 2 + .55 / rm(k));
  const place = (k, a, m) => { const q = geo.pt(rm(k), a); if (inPocket(k, a) || nearBar(k, a) || nearHole(q[0], q[1], .55) || !free(q[0], q[1], m) || !reachable(q[0], q[1])) return null; return q; };
  taken.push([s0[0], s0[1]]);

  // the gong (sealed levels): a dead end or off the beaten track, and never above the step if the lotus is below
  if (cfg.seal){
    const okK = k => !tier || k > tierK;   // below the step, so you never have to climb back for it
    const put = (k, angles) => { if (!okK(k)) return false; for (const a of angles){ const q = place(k, a, 1.4); if (q){ taken.push(q); lv.gong = { x: q[0], y: q[1], k }; return true; } } return false; };
    const deco = plan.map((p, k) => ({ p, k })).filter(o => o.k > 0 && o.p.decoy).reverse();
    for (const { p, k } of deco){ if (lv.gong) break; const eh = gapW(k - 1) / 2, bh = barW(k) / 2; put(k, [.35, .5, .25].map(f => p.e - p.dir * (eh + (p.delta - eh - bh) * f))); }
    for (let k = nG - 1; k >= 1 && !lv.gong; k--){
      const p = plan[k], r = rm(k), u1 = p.L + gapW(k) / 2 + .5 / r, u2 = TAU - p.delta - barW(k) / 2 - .5 / r;
      if (u2 - u1 > .3) put(k, [.5, .3, .7].map(f => p.e + p.dir * (u1 + (u2 - u1) * f)));
    }
    for (let k = 1; k < nG && !lv.gong; k++){ const p = plan[k]; put(k, [.5, .25, .75].map(f => p.e + p.dir * p.L * f)); }
    for (let k = nG - 1; k >= 0 && !lv.gong; k--){ const angs = []; for (let i = 0; i < 24; i++) angs.push(rnd() * TAU); put(k, angs); }
    if (!lv.gong){ const a = rnd() * TAU; lv.gong = { x: Math.cos(a) * 1.62, y: Math.sin(a) * 1.62, k: nG }; }
    lv.gong.tier = tierAt(lv.gong.x, lv.gong.y);
  }
  if (cfg.posts){ const a0 = rnd() * TAU; for (let i = 0; i < 6; i++){ const a = a0 + i * TAU / 6, x = Math.cos(a) * 1.22, y = Math.sin(a) * 1.22; lv.posts.push({ x, y, r: POST_R, tier: tierAt(x, y), ang0: a, rad: 1.22, note: cfg.sing ? [0, 2, 3, 4, 5, 7][i] : null }); } }
  let len = nG * 1.2 + 2; plan.forEach((p, k) => len += (cfg.noBars ? Math.min(p.L, TAU - p.L) : p.L) * rm(k));
  lv.par = Math.max(6, Math.round(3 + len / 6.5)); lv.pathLen = len;
  // thematic extras use their own random stream, so adding them never changes a level's maze
  const rx = mulberry32((cfg.seed | 0) + 4242);
  if (cfg.orbit && lv.posts.length) lv.orbit = { w: cfg.orbit * (rx() < .5 ? 1 : -1), a: 0 };
  if (cfg.current){   // the river runs along the longest clear stretch of one ring
    let best = -1, bk = -1;
    plan.forEach((p, k) => { if (spin && spin.k === k) return; if (tier && k === tierK) return; const v = p.L * rm(k); if (v > best){ best = v; bk = k; } });
    if (bk >= 0){ const p = plan[bk], [a, b] = geo.grooves[bk];
      lv.current = { k: bk, a: a + .04, b: b - .04, e: p.e, dir: p.dir, L: p.L, c: 5, flow: cfg.current * p.dir, low: !!tier && bk > tierK, rm: rm(bk), seed: (cfg.seed | 0) + 17 }; }
  }
  if (cfg.wind){ const period = 7.5 + rx() * 2.5; lv.wind = { seed: (cfg.seed | 0) + 71, period, dur: 2.4, str: cfg.wind, off: period - 3.2, n: -1, k: 0, x: 1, y: 0 }; }
  return lv;
}
const GRID_MIN = -EXT, GRID_N = 2 * EXT;
function buildGrid(segs, pad){
  const cells = Array.from({ length: GRID_N * GRID_N }, () => []);
  for (let i = 0; i < segs.length; i += 4){
    const x0 = Math.min(segs[i], segs[i + 2]) - pad, x1 = Math.max(segs[i], segs[i + 2]) + pad;
    const y0 = Math.min(segs[i + 1], segs[i + 3]) - pad, y1 = Math.max(segs[i + 1], segs[i + 3]) + pad;
    const cx0 = clamp(Math.floor(x0 - GRID_MIN), 0, GRID_N - 1), cx1 = clamp(Math.floor(x1 - GRID_MIN), 0, GRID_N - 1);
    const cy0 = clamp(Math.floor(y0 - GRID_MIN), 0, GRID_N - 1), cy1 = clamp(Math.floor(y1 - GRID_MIN), 0, GRID_N - 1);
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) cells[cy * GRID_N + cx].push(i);
  }
  return cells;
}
const cellOf = (grid, x, y) => grid[clamp(Math.floor(y - GRID_MIN), 0, GRID_N - 1) * GRID_N + clamp(Math.floor(x - GRID_MIN), 0, GRID_N - 1)];
function segDistIn(segs, grid, x, y){
  const cell = cellOf(grid, x, y); let d = 9;
  for (let n = 0; n < cell.length; n++){
    const j = cell[n], x1 = segs[j], y1 = segs[j + 1], dx = segs[j + 2] - x1, dy = segs[j + 3] - y1;
    const l2 = dx * dx + dy * dy || 1e-9; let t = ((x - x1) * dx + (y - y1) * dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
    const ex = x - x1 - t * dx, ey = y - y1 - t * dy, dd = Math.sqrt(ex * ex + ey * ey); if (dd < d) d = dd;
  }
  return d;
}
const segDist = (lv, x, y) => segDistIn(lv.segs, lv.aoGrid, x, y);

/* =====================================================================
   ENGINE 8 · BOARD MESHES
   ===================================================================== */
const board = new THREE.Group(); scene.add(board);
let levelGroup = null, level = null, spinGroup = null;
function extrude(shape, mats, h){
  h = h || WALL_H;
  const geo = new THREE.ExtrudeGeometry(shape, { depth: h - 2 * BEV, bevelEnabled: true, bevelThickness: BEV, bevelSize: BEV, bevelOffset: -BEV, bevelSegments: Q.bevSeg, curveSegments: 4 });
  const m = new THREE.Mesh(geo, mats || [M.top, M.side]);
  m.rotation.x = -Math.PI / 2; m.position.y = BEV; m.castShadow = m.receiveShadow = true;
  return m;
}
const v2 = pts => pts.map(p => new THREE.Vector2(p[0], p[1]));
const rippleGeo = new THREE.RingGeometry(.42, .5, 48);
let gongObj = null;
const petalGeo = (() => { const p = new THREE.Shape(); p.moveTo(0, -.075); p.bezierCurveTo(.16, -.14, .4, -.09, .52, 0); p.bezierCurveTo(.4, .09, .16, .14, 0, .075); p.closePath(); return new THREE.ShapeGeometry(p, 10); })();
const petalMat = new THREE.MeshStandardMaterial({ color: 0xd2b070, metalness: .9, roughness: .32, side: THREE.DoubleSide, envMapIntensity: .8 });
let sealPivots = [];
const leafGeo = (() => { const p = new THREE.Shape(); p.moveTo(-.3, 0); p.quadraticCurveTo(0, .2, .3, 0); p.quadraticCurveTo(0, -.2, -.3, 0); return new THREE.ShapeGeometry(p, 6); })();
const marigoldGeo = (() => { const g = new THREE.SphereGeometry(.17, 14, 6, 0, TAU, 0, Math.PI / 2); g.scale(1, .55, 1); return g; })();
const featherGeo = (() => { const p = new THREE.Shape(); p.moveTo(-.55, 0); p.quadraticCurveTo(0, .13, .52, .03); p.lineTo(.55, 0); p.quadraticCurveTo(0, -.11, -.55, 0); return new THREE.ShapeGeometry(p, 6); })();
const leafMat = new THREE.MeshStandardMaterial({ color: 0x6f8f4e, roughness: .6, side: THREE.DoubleSide });
const marigoldMat = new THREE.MeshStandardMaterial({ color: 0xe8901f, roughness: .8, emissive: 0x6a2a00, emissiveIntensity: .25 });
const featherMat = new THREE.MeshStandardMaterial({ color: 0xf2ece0, roughness: .9, side: THREE.DoubleSide });
const SHARED_GEO = new Set([leafGeo, marigoldGeo, featherGeo]);
// the river, painted into the floor: a cool band with flowing lines and chevrons pointing downstream
function paintRiver(g, s){
  const Cu = level.current, geo = level.geo, P = (r, a) => { const q = geo.pt(r, a); return [(q[0] + TEX_EXT) * s, (TEX_EXT - q[1]) * s]; };
  const n = Math.max(12, Math.ceil(Cu.L * Cu.rm / .25)), A = k => Cu.e + Cu.dir * Cu.L * k / n;
  const band = (r0, r1) => { g.beginPath(); for (let k = 0; k <= n; k++){ const p = P(r1, A(k)); k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } for (let k = n; k >= 0; k--){ const p = P(r0, A(k)); g.lineTo(p[0], p[1]); } g.closePath(); };
  g.save();
  band(Cu.a + .02, Cu.b - .02); g.fillStyle = 'rgba(52,104,138,.18)'; g.fill();
  band(Cu.a + .12, Cu.b - .12); g.fillStyle = 'rgba(70,132,166,.08)'; g.fill();
  g.strokeStyle = 'rgba(235,246,252,.26)'; g.lineWidth = .024 * s; g.lineCap = 'round';
  for (const f of [.3, .55, .78]){ const r = Cu.a + (Cu.b - Cu.a) * f; g.beginPath();
    for (let k = 0; k <= n * 2; k++){ const a = Cu.e + Cu.dir * Cu.L * k / (n * 2), w = Math.sin(k * .9 + f * 9) * .05, p = P(r + w, a); k ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]); } g.stroke(); }
  // chevrons, every ~1.6 units, pointing the way the water flows
  const sg = Cu.flow * Cu.dir, step = 1.6 / Cu.rm, rm = (Cu.a + Cu.b) / 2;
  g.strokeStyle = 'rgba(240,248,252,.34)'; g.lineWidth = .035 * s;
  for (let u = step * .7; u < Cu.L - step * .4; u += step){
    const a = Cu.e + Cu.dir * u, d = .16 / rm * sg * Cu.dir, h = .2;
    const tip = P(rm, a + d), l = P(rm - h, a - d), r2 = P(rm + h, a - d);
    g.beginPath(); g.moveTo(l[0], l[1]); g.lineTo(tip[0], tip[1]); g.lineTo(r2[0], r2[1]); g.stroke();
  }
  g.restore();
}
const tierY = t => t && level && level.tier ? -level.tier.D : 0;
function floorShape(loopPts, holes){
  const fs = new THREE.Shape(v2(loopPts));
  for (const h of holes){ const p = new THREE.Path(); p.absarc(h.x, h.y, h.r, 0, TAU, true); fs.holes.push(p); }
  return fs;
}
function buildLevelMeshes(){
  if (levelGroup){ levelGroup.traverse(o => { if (o.userData.own) o.material.dispose();
    if (o.geometry && o.geometry !== rippleGeo && o.geometry !== petalGeo && !SHARED_GEO.has(o.geometry) && o !== ball) o.geometry.dispose(); }); board.remove(levelGroup); }
  const g = level.geo, T = level.tier;
  levelGroup = new THREE.Group(); spinGroup = new THREE.Group(); levelGroup.add(spinGroup);
  for (const R of level.regions){
    if (R.full){ const sh = new THREE.Shape(v2(R.outer)); sh.holes.push(new THREE.Path(v2(R.inner))); levelGroup.add(extrude(sh)); continue; }
    const tall = T && R.cliff, m = extrude(new THREE.Shape(v2(R.loop)), null, tall ? WALL_H + T.D : WALL_H);
    if (tall || R.low) m.position.y -= T.D;
    (R.spin ? spinGroup : levelGroup).add(m);
  }
  // board body
  const rOut = g.boardA / g.ch;
  let base;
  if (g.petals){ const sh = new THREE.Shape(v2(fullLoop(g, g.boardA))); base = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 1.1, bevelEnabled: false, curveSegments: 4 }), M.edge); base.rotation.x = -Math.PI / 2; base.position.y = -1.13; }
  else { base = new THREE.Mesh(new THREE.CylinderGeometry(rOut, rOut - .05, 1.08, g.N || 160, 1, true, g.N ? g.vAng[0] + Math.PI / 2 : 0), M.edge); base.position.y = -.48; }
  base.castShadow = true; levelGroup.add(base);
  // floors: one, or an upper ring and a sunken centre
  if (!T){
    const fl = new THREE.Mesh(new THREE.ShapeGeometry(floorShape(fullLoop(g, level.floorR || g.rimA + .12), level.holes), 20), M.floor);
    fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; levelGroup.add(fl);
  } else {
    const up = floorShape(fullLoop(g, g.rimA + .12), level.holes.filter(h => !h.tier));
    up.holes.push(new THREE.Path(v2(fullLoop(g, T.a).reverse())));
    const fu = new THREE.Mesh(new THREE.ShapeGeometry(up, 20), M.floor); fu.rotation.x = -Math.PI / 2; fu.receiveShadow = true; levelGroup.add(fu);
    const lo = floorShape(fullLoop(g, T.a + .08), level.holes.filter(h => h.tier));
    const fl = new THREE.Mesh(new THREE.ShapeGeometry(lo, 20), M.floorLow); fl.rotation.x = -Math.PI / 2; fl.position.y = -T.D; fl.receiveShadow = true; levelGroup.add(fl);
    // the step faces inside each opening
    const pos = [];
    for (const gp of T.gaps){
      const A = arcAngles(g, gp.s - .03, gp.L + .06);
      for (let i = 0; i + 1 < A.length; i++){ const p = g.pt(T.a, A[i]), q = g.pt(T.a, A[i + 1]);
        pos.push(p[0], 0, -p[1], q[0], 0, -q[1], q[0], -T.D, -q[1], p[0], 0, -p[1], q[0], -T.D, -q[1], p[0], -T.D, -p[1]); }
    }
    const cg = new THREE.BufferGeometry(); cg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); cg.computeVertexNormals();
    const uv = []; for (let i = 0; i < pos.length; i += 3) uv.push(pos[i] / (2 * TEX_EXT) + .5, -pos[i + 2] / (2 * TEX_EXT) + .5 + pos[i + 1] * .02); cg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    const cm = new THREE.Mesh(cg, M.side); cm.receiveShadow = true; levelGroup.add(cm);
  }
  bakeAO(); composeFloor();
  for (const h of level.holes){
    const y0 = tierY(h.tier);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(h.r, h.r, .95, 28, 1, true), M.hole); cup.position.set(h.x, y0 - .475, -h.y); levelGroup.add(cup);
    const bot = new THREE.Mesh(new THREE.CircleGeometry(h.r, 28), M.holeB); bot.rotation.x = -Math.PI / 2; bot.position.set(h.x, y0 - .94, -h.y); levelGroup.add(bot);
    if (h.goal){ const ring = new THREE.Mesh(new THREE.TorusGeometry(h.r + .06, .05, 8, 56), M.brass); ring.rotation.x = -Math.PI / 2; ring.position.set(h.x, y0 + .012, -h.y); levelGroup.add(ring); }
  }
  const O = level.orbit; let postGrp = levelGroup;
  if (O){ O.grp = postGrp = new THREE.Group(); levelGroup.add(postGrp); }
  for (const P of level.posts){
    const y0 = tierY(P.tier), px = O ? Math.cos(P.ang0) * P.rad : P.x, py = O ? Math.sin(P.ang0) * P.rad : P.y;
    let mat = M.brass;
    if (P.note != null){ mat = M.brass.clone(); mat.emissive.setHex(0xffb050); mat.emissiveIntensity = 0; P.mat = mat; P.glow = 0; }
    const m = new THREE.Mesh(new THREE.CylinderGeometry(P.r * .9, P.r, .62, 20), mat); m.position.set(px, y0 + .31, -py); m.castShadow = true; postGrp.add(m);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(P.r * .95, 16, 10), mat); cap.position.set(px, y0 + .64, -py); postGrp.add(cap);
    if (P.note != null){ m.userData.own = true; const ring = new THREE.Mesh(new THREE.TorusGeometry(P.r * 1.05, .022, 6, 24), mat); ring.rotation.x = -Math.PI / 2; ring.position.set(px, y0 + .5, -py); postGrp.add(ring); }
  }
  // the river: marigolds and leaves drifting along the current
  const Cu = level.current;
  if (Cu){
    const r = mulberry32(Cu.seed); Cu.leaves = [];
    for (let i = 0; i < 7; i++){
      const flower = i % 3 === 0, m = new THREE.Mesh(flower ? marigoldGeo : leafGeo, flower ? marigoldMat : leafMat);
      if (!flower) m.rotation.x = -Math.PI / 2;
      const w = new THREE.Group(); w.add(m); levelGroup.add(w);
      Cu.leaves.push({ m: w, u: Cu.L * (i + r() * .6) / 7, r: Cu.rm + (r() - .5) * .45, sp: (2.4 + r() * .8) / Cu.rm, ph: r() * TAU, spin: (r() - .5) * .8 });
    }
  }
  // the wind: a few pale feathers that sweep across during a gust
  if (level.wind){ level.wind.feathers = [];
    for (let i = 0; i < 5; i++){ const f = new THREE.Mesh(featherGeo, featherMat); f.visible = false; f.userData.lag = (i % 3) * .08; f.userData.h = (i % 2) * .35; levelGroup.add(f); level.wind.feathers.push(f); } }
  for (const Gt of level.gates){
    Gt.mesh = extrude(new THREE.Shape(v2(Gt.loop)), [M.gateT, M.gateS]); Gt.base = tierY(Gt.low ? 1 : 0) + BEV; Gt.mesh.position.y = Gt.base + Gt.y;
    levelGroup.add(Gt.mesh);
  }
  gongObj = null;
  if (level.gong){
    const G0 = level.gong, grp = new THREE.Group(); grp.position.set(G0.x, tierY(G0.tier), -G0.y);
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(.44, .47, .05, 40), M.gong); disc.position.y = .025; disc.receiveShadow = true; grp.add(disc);
    const boss = new THREE.Mesh(new THREE.SphereGeometry(.15, 20, 8, 0, TAU, 0, Math.PI / 2), M.gong); boss.scale.y = .35; boss.position.y = .05; grp.add(boss);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.3, .016, 6, 40), M.gong); rim.rotation.x = -Math.PI / 2; rim.position.y = .052; grp.add(rim);
    const rip = new THREE.Mesh(rippleGeo, new THREE.MeshBasicMaterial({ color: 0xe0a050, transparent: true, opacity: 0, depthWrite: false })); rip.userData.own = true;
    rip.rotation.x = -Math.PI / 2; rip.position.y = .07; rip.visible = false; grp.add(rip);
    levelGroup.add(grp); gongObj = { grp, rip, x: G0.x, y: G0.y, tier: G0.tier, hit: false, t: 0, y0: tierY(G0.tier) };
  }
  sealPivots = [];
  if (level.cfg.seal){
    const y0 = tierY(level.holes[level.holes.length - 1].tier);
    for (let layer = 0; layer < 2; layer++) for (let k = 0; k < 8; k++){
      const phi = (k + layer * .5) * TAU / 8, R = GOAL_R + .06, pv = new THREE.Group();
      pv.position.set(Math.cos(phi) * R, y0 + .02 + layer * .012, -Math.sin(phi) * R);
      pv.userData.base = phi + Math.PI; pv.userData.layer = layer;
      const m = new THREE.Mesh(petalGeo, petalMat); m.rotation.x = -Math.PI / 2; m.castShadow = true; pv.add(m);
      levelGroup.add(pv); sealPivots.push(pv);
    }
    setSeal(0);
  }
  if (level.decorate) level.decorate(levelGroup);
  board.add(levelGroup);
  const e = Math.max(g.extX, g.extY) + 1.2, sc = sun.shadow.camera;
  sc.left = sc.bottom = -e; sc.right = sc.top = e; sc.updateProjectionMatrix();
  tableShadow.scale.setScalar((Math.max(g.extX, g.extY) + 4.5) / 15.5);
  fitAll();
}
function bakeAO(){
  const S = Q.ao, a = new Uint8ClampedArray(S * S), T = level.tier;
  for (let py = 0; py < S; py++){
    const y = TEX_EXT - (py + .5) / S * 2 * TEX_EXT;
    for (let px = 0; px < S; px++){
      const x = -TEX_EXT + (px + .5) / S * 2 * TEX_EXT;
      let d = Math.min(1.2, segDist(level, x, y));
      if (T){ const dc = segDistIn(T.segs, T.grid, x, y); if (dc < d && level.geo.rho(x, y) < T.a) d = dc; }
      for (const h of level.holes){ const dd = Math.abs(Math.hypot(x - h.x, y - h.y) - h.r) * 1.5; if (dd < d) d = dd; }
      a[py * S + px] = 255 * (.48 * Math.exp(-d / .24) + .04);
    }
  }
  aoData = { S, a };
}
function radialTex(stops){
  const cv = document.createElement('canvas'); cv.width = cv.height = 128;
  const g = cv.getContext('2d'), gr = g.createRadialGradient(64, 64, 2, 64, 64, 64);
  stops.forEach(([o, c]) => gr.addColorStop(o, c)); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(cv);
}
// a very soft table shade under the board (kept faint: fake shadows read as glare)
const tableShadow = (() => {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(31, 31), new THREE.MeshBasicMaterial({ map: radialTex([[.5, 'rgba(40,28,18,0.22)'], [.8, 'rgba(40,28,18,0.08)'], [1, 'rgba(40,28,18,0)']]), transparent: true, depthWrite: false }));
  m.rotation.x = -Math.PI / 2; m.position.set(1.1, -1.12, 1.0); scene.add(m); return m;
})();
const ball = new THREE.Mesh(new THREE.SphereGeometry(BALL_R, Q.seg, Math.round(Q.seg * .7)));
ball.castShadow = true; board.add(ball);
const contactMat = new THREE.MeshBasicMaterial({ map: radialTex([[0, 'rgba(20,10,4,0.42)'], [.55, 'rgba(20,10,4,0.12)'], [1, 'rgba(20,10,4,0)']]), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 });
const contact = (() => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), contactMat); m.rotation.x = -Math.PI / 2; m.renderOrder = 3; board.add(m); return m; })();
let BP = { speed: .95, damp: .5, rest: .34, grip: .07, tock: 1050 };
// a glass marble's heart: the mani, a cut blue jewel. It starts almost colourless and deepens with every chakra opened.
const MANI_PALE = 0xe4edf6, MANI_DEEP = 0x1f4fb8;
const maniMat = new THREE.MeshStandardMaterial({ color: MANI_PALE, roughness: .14, metalness: .08, flatShading: true, emissive: MANI_PALE, emissiveIntensity: .1, envMapIntensity: 1.5 });
const maniGlowMat = new THREE.MeshBasicMaterial({ color: MANI_PALE, transparent: true, opacity: 0, depthWrite: false });
const maniGeo = (() => { const g = new THREE.IcosahedronGeometry(BALL_R * .5, 0); g.scale(1, 1.18, 1); return g; })();
const maniGlowGeo = new THREE.SphereGeometry(BALL_R * .78, 20, 14);
const maniColor = p => { const a = hex2rgb(MANI_PALE), b = hex2rgb(MANI_DEEP), t = Math.pow(clamp(p, 0, 1), .8); return (Math.round(a[0] + (b[0] - a[0]) * t) << 16) | (Math.round(a[1] + (b[1] - a[1]) * t) << 8) | Math.round(a[2] + (b[2] - a[2]) * t); };
function setMani(p, glow){
  const c = maniColor(p); maniMat.color.setHex(c); maniMat.emissive.setHex(c); maniMat.emissiveIntensity = .08 + .45 * clamp(glow, 0, 1);
  maniGlowMat.color.setHex(c); maniGlowMat.opacity = .05 + .16 * clamp(glow, 0, 1) * clamp(p * 1.5, 0, 1);
}
function ballCore(key){
  if (key !== 'kancha') return null;
  const g = new THREE.Group(); g.userData.core = true;
  const gem = new THREE.Mesh(maniGeo, maniMat); gem.rotation.set(.3, .4, .2); g.add(gem);
  const glow = new THREE.Mesh(maniGlowGeo, maniGlowMat); glow.renderOrder = 4; g.add(glow);
  return g;
}
function setCore(mesh, key){ mesh.children.filter(c => c.userData.core).forEach(c => mesh.remove(c)); const c = ballCore(key); if (c) mesh.add(c); }
function applyBall(key, phys){ BP = phys; ball.material = getBallLook(key); setCore(ball, key); ball.renderOrder = key === 'kancha' ? 5 : 0; }
