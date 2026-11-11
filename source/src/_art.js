let VAR = { seed: 0, sc: 1 };
function makeValueNoise(seed){
  const r = mulberry32(seed), v = new Float32Array(256), p = new Uint8Array(512), perm = [];
  for (let i = 0; i < 256; i++){ v[i] = r(); perm[i] = i; }
  for (let i = 255; i > 0; i--){ const j = (r() * (i + 1)) | 0; [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) p[i] = perm[i & 255];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, X = xi & 255, Y = yi & 255;
    const a = v[p[p[X] + Y]], b = v[p[p[X + 1] + Y]], c = v[p[p[X] + Y + 1]], d = v[p[p[X + 1] + Y + 1]];
    const u = xf * xf * (3 - 2 * xf), w = yf * yf * (3 - 2 * yf);
    return a + (b - a) * u + (c - a) * w + (a - b - c + d) * u * w;
  };
}
const NZ = makeValueNoise(11), NZ2 = makeValueNoise(29), NZ3 = makeValueNoise(53);
const fbm = (x, y) => { let v = 0, a = .5, f = 1; for (let o = 0; o < 4; o++){ v += a * NZ(x * f, y * f); f *= 2.03; a *= .5; } return v / .9375; };
function folDist(x, y, s){
  const v = (2 * y / SQ3) / s, u = x / s - v / 2, i0 = Math.floor(u), j0 = Math.floor(v);
  let m = 9, near = 9;
  for (let di = -1; di <= 2; di++) for (let dj = -1; dj <= 2; dj++){
    const i = i0 + di, j = j0 + dj, cx = (i + j / 2) * s, cy = j * SQ3 / 2 * s;
    const d = Math.hypot(x - cx, y - cy), e = Math.abs(d - s);
    if (e < m) m = e; if (d < near) near = d;
  }
  return [m, near];
}
const woodFn = W => (x, y) => {
  x += VAR.seed * 17.3; y += VAR.seed * 5.1;
  const w1 = fbm(x * .15 + 3.1, y * .15), w2 = fbm(x * .15, y * .15 + 7.7);
  const qx = x + W.warp * w1, qy = y + W.warp * w2, g = fbm(qx * .075, qy * .36);
  let ring = .5 + .5 * Math.sin((g * W.freq + qx * .06) * TAU); ring = ring * ring * ring;
  const fine = NZ2(x * .55 + w1 * 4, y * 6.5);
  const k = clamp(.5 * ring + .38 * fine + .35 * (w2 - .5) + .08, 0, 1), gold = clamp((w1 - .55) * 2.5, 0, .35) * (1 - k);
  return mix(mix(W.L, W.D, k), W.G, gold);
};
const marbleFn = (light, dark) => (x, y) => {
  const f = fbm(x * .16 + 9, y * .16) * .7 + NZ3(x * .6, y * .6) * .3;
  const v = Math.abs(Math.sin((x * .32 + y * .14 + f * 5.5) * Math.PI));
  const vein = Math.pow(clamp(1 - v / .05, 0, 1), 1.4), soft = clamp(1 - v / .35, 0, 1) * .35, cloud = (NZ2(x * .3, y * .3) - .5) * 10;
  const b = mix(light, dark, soft * .5 + vein * .75);
  return [b[0] + cloud, b[1] + cloud, b[2] + cloud * .8];
};
const PIX = {
  wood: B => ({ top: woodFn(B.wood), floor: null }),
  bidri: () => ({
    top: (x, y) => { const [m, near] = folDist(x, y, 1.25), n = (NZ2(x * 3, y * 3) - .5) * 10; return mix([30 + n, 30 + n, 33 + n], [214, 216, 220], Math.max(clamp(1 - (m - .022) / .02, 0, 1), clamp(1 - (near - .07) / .03, 0, 1))); },
    floor: (x, y) => { const n = (NZ2(x * 2.2, y * 2.2) - .5) * 12 + (NZ(x * 9, y * 9) - .5) * 6; return [46 + n, 46 + n, 49 + n]; }
  }),
  marble: () => ({ top: marbleFn([244, 241, 235], [150, 146, 138]), floor: (x, y) => marbleFn([226, 221, 212], [140, 134, 124])(x + 40, y) }),
  neel: () => ({
    top: (x, y) => { const [m, near] = folDist(x, y, 1.45), sp = (NZ(x * 7, y * 7) - .5) * 8; const c = mix([247 + sp, 244 + sp, 234 + sp], [36, 74, 162], clamp(1 - (m - .05) / .11, 0, 1) * .9); return mix(c, [46, 150, 168], clamp(1 - (near - .13) / .05, 0, 1)); },
    floor: (x, y) => { const n = (NZ2(x * 1.6, y * 1.6) - .5) * 20, s = clamp((fbm(x * 3.1 + 11, y * 3.1) - .7) / .08, 0, 1) * 34; return [28 + n * .4 + s, 54 + n * .6 + s, 132 + n + s]; }
  })
};
function paper(g, base, seed, amt){
  g.fillStyle = base; g.fillRect(-TEX_EXT, -TEX_EXT, 2 * TEX_EXT, 2 * TEX_EXT);
  const r = mulberry32(seed + VAR.seed * 131);
  for (let i = 0; i < 70; i++){ g.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,255,255'},${r() * amt * .5})`; g.beginPath(); g.arc((r() * 2 - 1) * TEX_EXT, (r() * 2 - 1) * TEX_EXT, .5 + r() * 2.5, 0, TAU); g.fill(); }
  for (let i = 0; i < 2600; i++){ g.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,255,255'},${r() * amt})`; g.fillRect((r() * 2 - 1) * TEX_EXT, (r() * 2 - 1) * TEX_EXT, .04, .04); }
}
function scatter(g, sp, seed, fn){
  sp *= VAR.sc; const r = mulberry32(seed + VAR.seed * 977);
  for (let j = -Math.ceil(TEX_EXT / (sp * .87)); j <= Math.ceil(TEX_EXT / (sp * .87)); j++)
    for (let i = -Math.ceil(TEX_EXT / sp) - 1; i <= Math.ceil(TEX_EXT / sp) + 1; i++){
      const x = (i + (j & 1) * .5) * sp + (r() - .5) * sp * .25, y = j * sp * .87 + (r() - .5) * sp * .25;
      g.save(); g.translate(x, y); fn(g, r, x, y); g.restore();
    }
}
function warliFigure(g, pose){
  g.beginPath(); g.arc(0, .19, .05, 0, TAU); g.fill();
  g.beginPath(); g.moveTo(-.08, .13); g.lineTo(.08, .13); g.lineTo(0, .03); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(0, .03); g.lineTo(-.08, -.07); g.lineTo(.08, -.07); g.closePath(); g.fill();
  g.beginPath(); g.moveTo(-.04, -.07); g.lineTo(-.08, -.2); g.moveTo(.04, -.07); g.lineTo(.09, -.2);
  if (pose === 0){ g.moveTo(-.06, .11); g.lineTo(-.15, .2); g.moveTo(.06, .11); g.lineTo(.15, .2); }
  else if (pose === 1){ g.moveTo(-.06, .11); g.lineTo(-.16, .04); g.moveTo(.06, .11); g.lineTo(.16, .04); }
  else { g.moveTo(-.06, .11); g.lineTo(-.15, .2); g.moveTo(.06, .11); g.lineTo(.16, .04); }
  g.stroke();
}
function fish(g, fill, ink){
  g.beginPath(); g.moveTo(-.3, 0); g.quadraticCurveTo(-.02, .2, .22, 0); g.quadraticCurveTo(-.02, -.2, -.3, 0); g.closePath();
  g.fillStyle = fill; g.fill(); g.strokeStyle = ink; g.lineWidth = .028; g.stroke();
  g.beginPath(); g.moveTo(-.26, 0); g.quadraticCurveTo(-.02, .15, .17, 0); g.quadraticCurveTo(-.02, -.15, -.26, 0); g.lineWidth = .014; g.stroke();
  g.beginPath(); g.moveTo(.22, 0); g.lineTo(.36, .11); g.lineTo(.33, 0); g.lineTo(.36, -.11); g.closePath(); g.fillStyle = fill; g.fill(); g.lineWidth = .022; g.stroke();
  for (let k = 0; k < 3; k++){ g.beginPath(); g.arc(-.05 + k * .07, 0, .05, -1.1, 1.1); g.lineWidth = .012; g.stroke(); }
  g.beginPath(); g.arc(-.19, .03, .026, 0, TAU); g.fillStyle = ink; g.fill();
}
function paisley(g, fill, ink, inner){
  const P = () => { g.beginPath(); g.moveTo(0, -.25); g.bezierCurveTo(.28, -.25, .3, .1, .05, .28); g.bezierCurveTo(-.05, .33, -.15, .25, -.08, .2); g.bezierCurveTo(.05, .1, -.2, .05, -.22, -.05); g.bezierCurveTo(-.24, -.18, -.12, -.25, 0, -.25); g.closePath(); };
  P(); g.fillStyle = fill; g.fill(); g.strokeStyle = ink; g.lineWidth = .026; g.stroke();
  g.save(); g.scale(.58, .58); g.translate(.02, -.05); P(); g.fillStyle = inner; g.fill(); g.lineWidth = .04; g.stroke(); g.restore();
  g.beginPath(); g.arc(.02, -.08, .03, 0, TAU); g.fillStyle = ink; g.fill();
}
function leaf(g, ink, dot){
  g.beginPath(); g.moveTo(-.3, 0); g.quadraticCurveTo(0, .17, .3, 0); g.quadraticCurveTo(0, -.17, -.3, 0); g.closePath();
  g.strokeStyle = ink; g.lineWidth = .024; g.stroke();
  g.beginPath(); g.moveTo(-.3, 0); g.lineTo(.3, 0); g.lineWidth = .016; g.stroke();
  g.fillStyle = dot;
  for (let t = -.22; t <= .22; t += .055){ const h = .09 * (1 - Math.pow(t / .3, 2)); for (const s of [-1, 1]){ g.beginPath(); g.arc(t, s * h * .55, .014, 0, TAU); g.fill(); } }
  g.lineWidth = .01; for (let t = -.2; t <= .2; t += .08){ g.beginPath(); g.moveTo(t, 0); g.lineTo(t + .05, .07 * (1 - Math.pow(t / .3, 2))); g.moveTo(t, 0); g.lineTo(t + .05, -.07 * (1 - Math.pow(t / .3, 2))); g.stroke(); }
}
function lotusSide(g, fill, ink, s){
  g.save(); g.scale(s, s); g.fillStyle = fill; g.strokeStyle = ink; g.lineWidth = .02;
  for (const [a, h] of [[-.7, .17], [.7, .17], [-.35, .22], [.35, .22], [0, .26]]){ g.save(); g.rotate(a); g.beginPath(); g.moveTo(0, -.04); g.quadraticCurveTo(.09, h * .5, 0, h); g.quadraticCurveTo(-.09, h * .5, 0, -.04); g.fill(); g.stroke(); g.restore(); }
  g.beginPath(); g.moveTo(0, -.04); g.lineTo(0, -.2); g.strokeStyle = '#4f7a52'; g.lineWidth = .025; g.stroke(); g.restore();
}
function pad(g, fill, ink){
  g.fillStyle = fill; g.strokeStyle = ink; g.lineWidth = .018;
  g.beginPath(); g.arc(0, 0, .19, .35, TAU - .35); g.lineTo(0, 0); g.closePath(); g.fill(); g.stroke();
  for (let k = 1; k < 8; k++){ const a = .35 + k * (TAU - .7) / 8; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * .17, Math.sin(a) * .17); g.stroke(); }
}
function lace(g, R, paperC, bg){
  g.fillStyle = paperC; g.beginPath(); g.arc(0, 0, R, 0, TAU); g.fill();
  g.fillStyle = bg;
  for (let k = 0; k < 8; k++){ g.save(); g.rotate(k * TAU / 8); g.beginPath(); g.ellipse(0, R * .55, R * .12, R * .28, 0, 0, TAU); g.fill(); g.restore(); }
  for (let k = 0; k < 16; k++){ const a = k * TAU / 16; g.beginPath(); g.arc(Math.cos(a) * R * .87, Math.sin(a) * R * .87, R * .06, 0, TAU); g.fill(); }
  g.beginPath(); g.arc(0, 0, R * .14, 0, TAU); g.fill();
}
function mirror(g, x, y, r){
  const gr = g.createRadialGradient(x - r * .3, y + r * .3, r * .1, x, y, r);
  gr.addColorStop(0, '#ffffff'); gr.addColorStop(.5, '#b9c6cc'); gr.addColorStop(1, '#6f7f88');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); g.strokeStyle = '#f1e9dc'; g.lineWidth = .025; g.stroke();
}
const ART = {
  warli: {
    top(g){ paper(g, '#9c4f2e', 3, .06); g.fillStyle = g.strokeStyle = '#f3eadb'; g.lineWidth = .025; g.lineCap = 'round';
      scatter(g, .62, 7, (g, r) => { if (r() < .12){ g.beginPath(); g.arc(0, 0, .09, 0, TAU); g.fill(); for (let k = 0; k < 10; k++){ const a = k * TAU / 10; g.beginPath(); g.moveTo(Math.cos(a) * .13, Math.sin(a) * .13); g.lineTo(Math.cos(a) * .2, Math.sin(a) * .2); g.stroke(); } } else warliFigure(g, (r() * 3) | 0); }); },
    floor(g){ paper(g, '#6f3521', 4, .05); g.fillStyle = g.strokeStyle = 'rgba(243,234,219,.9)'; g.lineWidth = .025; g.lineCap = 'round';
      const r = mulberry32(9); for (let i = 0; i < 900; i++){ g.beginPath(); g.arc((r() * 2 - 1) * TEX_EXT, (r() * 2 - 1) * TEX_EXT, .018, 0, TAU); g.fill(); }
      g.beginPath(); g.arc(0, 0, 1.6, 0, TAU); g.lineWidth = .02; g.stroke();
      for (let k = 0; k < 16; k++){ const a = k * TAU / 16; g.save(); g.translate(Math.cos(a) * 1.55, Math.sin(a) * 1.55); g.rotate(a - Math.PI / 2); g.scale(1.2, 1.2); warliFigure(g, 1); g.restore(); }
      for (let k = 0; k < 24; k++){ const a = k * TAU / 24; g.beginPath(); g.arc(Math.cos(a) * .8, Math.sin(a) * .8, .035, 0, TAU); g.fill(); } }
  },
  kolam: {
    top(g){ paper(g, '#352b27', 5, .05); g.strokeStyle = 'rgba(246,242,232,.92)'; g.fillStyle = '#f6f2e8'; g.lineWidth = .022; g.lineCap = 'round';
      const s = .34;
      for (let y = -TEX_EXT; y <= TEX_EXT; y += s) for (let x = -TEX_EXT; x <= TEX_EXT; x += s){ g.beginPath(); g.arc(x, y, .022, 0, TAU); g.fill(); }
      for (const dir of [1, -1]) for (let c = -2 * TEX_EXT; c <= 2 * TEX_EXT; c += s){
        g.beginPath(); let first = true;
        for (let t = -TEX_EXT * 1.5; t <= TEX_EXT * 1.5; t += .04){ const w = Math.sin(t / s * Math.PI * SQ3 / 1.2247) * .06; const x = t * .7071 + c * .7071 * dir + w * .7071 * -dir, y = t * .7071 * dir - c * .7071 + w * .7071; if (first){ g.moveTo(x, y); first = false; } else g.lineTo(x, y); }
        g.stroke();
      } },
    floor(g){ paper(g, '#2b2320', 6, .05); g.strokeStyle = 'rgba(246,242,232,.9)'; g.fillStyle = '#f6f2e8'; g.lineWidth = .028;
      const r = mulberry32(2); for (let i = 0; i < 700; i++){ g.beginPath(); g.arc((r() * 2 - 1) * TEX_EXT, (r() * 2 - 1) * TEX_EXT, .016, 0, TAU); g.fill(); }
      for (let k = 0; k < 8; k++){ g.save(); g.rotate(k * TAU / 8); g.beginPath(); g.ellipse(1.05, 0, .55, .22, 0, 0, TAU); g.stroke(); g.beginPath(); g.arc(1.05, 0, .045, 0, TAU); g.fill(); g.beginPath(); g.arc(1.68, 0, .04, 0, TAU); g.fill(); g.restore(); }
      for (let k = 0; k < 8; k++){ g.save(); g.rotate(k * TAU / 8 + TAU / 16); g.beginPath(); g.arc(.85, 0, .04, 0, TAU); g.fill(); g.restore(); }
      g.beginPath(); g.arc(0, 0, .62, 0, TAU); g.setLineDash([.05, .07]); g.stroke(); g.setLineDash([]); }
  },
  madhubani: {
    top(g){ paper(g, '#eedfbf', 8, .05); g.lineCap = 'round';
      scatter(g, .82, 11, (g, r) => { g.rotate((r() - .5) * .8 + (r() < .5 ? 0 : Math.PI)); const k = r(); if (k < .7) fish(g, k < .35 ? '#c98a32' : '#a8432e', '#2a1b12');
        else { g.strokeStyle = '#2a1b12'; g.lineWidth = .024; for (let p = 0; p < 5; p++){ g.save(); g.rotate(p * TAU / 5); g.beginPath(); g.ellipse(0, .13, .06, .12, 0, 0, TAU); g.fillStyle = p % 2 ? '#a8432e' : '#c98a32'; g.fill(); g.stroke(); g.restore(); } g.beginPath(); g.arc(0, 0, .05, 0, TAU); g.fillStyle = '#2a1b12'; g.fill(); } }); },
    floor(g){ paper(g, '#d6c095', 12, .05); g.strokeStyle = '#2a1b12'; g.lineWidth = .03;
      for (const rr of [1.72, 1.6]){ g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.stroke(); }
      for (let k = 0; k < 36; k++){ const a = k * TAU / 36; g.beginPath(); g.arc(Math.cos(a) * 1.6, Math.sin(a) * 1.6, .07, a + Math.PI / 2, a + Math.PI * 1.5, true); g.lineWidth = .02; g.stroke(); }
      for (const s of [0, 1]){ g.save(); g.rotate(s * Math.PI + .35); g.translate(0, .98); g.scale(2.2, 2.2); fish(g, s ? '#a8432e' : '#c98a32', '#2a1b12'); g.restore(); } }
  },
  gond: {
    top(g){ paper(g, '#1f2433', 13, .04); g.lineCap = 'round';
      scatter(g, .7, 15, (g, r) => { g.rotate(r() * Math.PI); leaf(g, r() < .5 ? '#efe6d2' : '#e2b65a', r() < .5 ? '#e2b65a' : '#efe6d2'); }); },
    floor(g){ paper(g, '#151925', 14, .04);
      const r = mulberry32(3); g.fillStyle = 'rgba(226,182,90,.6)'; for (let i = 0; i < 600; i++){ g.beginPath(); g.arc((r() * 2 - 1) * TEX_EXT, (r() * 2 - 1) * TEX_EXT, .016, 0, TAU); g.fill(); }
      for (let k = 0; k < 10; k++){ g.save(); g.rotate(k * TAU / 10); g.translate(1.15, 0); g.scale(1.6, 1.6); leaf(g, '#efe6d2', '#e2b65a'); g.restore(); }
      g.strokeStyle = '#e2b65a'; g.lineWidth = .025; g.setLineDash([.03, .06]); g.beginPath(); g.arc(0, 0, 1.75, 0, TAU); g.stroke(); g.beginPath(); g.arc(0, 0, .65, 0, TAU); g.stroke(); g.setLineDash([]); }
  },
  kalamkari: {
    top(g){ paper(g, '#ead9b8', 16, .05); g.lineCap = 'round';
      scatter(g, .78, 17, (g, r) => { g.rotate(r() * TAU); if (r() < .78) paisley(g, '#8b3a22', '#2a1b14', '#d9a65a');
        else { g.fillStyle = '#2a1b14'; for (let p = 0; p < 4; p++){ g.beginPath(); g.arc(Math.cos(p * TAU / 4) * .07, Math.sin(p * TAU / 4) * .07, .035, 0, TAU); g.fill(); } } }); },
    floor(g){ paper(g, '#d6c29c', 18, .05);
      const petal = (r0, r1, w) => { g.beginPath(); g.moveTo(r0, 0); g.bezierCurveTo(r0 + (r1 - r0) * .3, w, r0 + (r1 - r0) * .75, w * .8, r1, 0); g.bezierCurveTo(r0 + (r1 - r0) * .75, -w * .8, r0 + (r1 - r0) * .3, -w, r0, 0); g.closePath(); };
      g.strokeStyle = '#2a1b14'; g.lineWidth = .03;
      for (let k = 0; k < 8; k++){ g.save(); g.rotate(k * TAU / 8); petal(.6, 1.75, .38); g.fillStyle = '#8b3a22'; g.fill(); g.stroke(); petal(.7, 1.45, .2); g.fillStyle = '#d9a65a'; g.fill(); g.stroke(); g.restore(); }
      for (let k = 0; k < 8; k++){ g.save(); g.rotate(k * TAU / 8 + TAU / 16); petal(.55, 1.2, .22); g.fillStyle = '#c98a32'; g.fill(); g.stroke(); g.restore(); }
      g.beginPath(); g.arc(0, 0, .6, 0, TAU); g.fillStyle = '#ead9b8'; g.fill(); g.stroke(); }
  },
  lippan: {
    top(g){ paper(g, '#8f6b4b', 21, .06); g.lineCap = 'round'; g.lineJoin = 'round';
      scatter(g, .7, 23, (g) => {
        g.strokeStyle = '#f1e9dc'; g.lineWidth = .035;
        g.beginPath(); g.moveTo(0, .27); g.lineTo(.2, 0); g.lineTo(0, -.27); g.lineTo(-.2, 0); g.closePath(); g.stroke();
        g.lineWidth = .022; g.beginPath(); g.moveTo(0, .17); g.lineTo(.13, 0); g.lineTo(0, -.17); g.lineTo(-.13, 0); g.closePath(); g.stroke();
        mirror(g, 0, 0, .06);
        g.fillStyle = '#f1e9dc'; for (const [x, y] of [[.25, .25], [-.25, .25], [.25, -.25], [-.25, -.25]]){ g.beginPath(); g.arc(x, y, .028, 0, TAU); g.fill(); }
      }); },
    floor(g){ paper(g, '#6e5038', 22, .05); g.strokeStyle = '#f1e9dc'; g.lineCap = 'round';
      for (const [rr, n] of [[.8, 10], [1.2, 14], [1.62, 18]]){ g.lineWidth = .03; g.beginPath(); g.arc(0, 0, rr + .2, 0, TAU); g.stroke(); for (let k = 0; k < n; k++){ const a = k * TAU / n; mirror(g, Math.cos(a) * rr, Math.sin(a) * rr, .07); } }
      g.lineWidth = .022; g.beginPath(); for (let k = 0; k <= 48; k++){ const a = k * TAU / 48, rr = k % 2 ? .62 : .5; const x = Math.cos(a) * rr, y = Math.sin(a) * rr; k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  },
  pichwai: {
    top(g){ paper(g, '#24403a', 31, .05); g.lineCap = 'round';
      scatter(g, .74, 33, (g, r) => { g.rotate((r() - .5) * .6); if (r() < .7) lotusSide(g, '#efc3b6', '#b8746a', .9 + r() * .25); else pad(g, '#4f7a52', '#2c4b3a'); }); },
    floor(g){ paper(g, '#1b302c', 32, .05);
      for (let k = 0; k < 10; k++){ g.save(); g.rotate(k * TAU / 10 + .3); g.translate(1.45, 0); g.rotate(Math.PI / 2); pad(g, '#3f6648', '#24402f'); g.restore(); }
      g.fillStyle = '#efc3b6'; g.strokeStyle = '#b8746a'; g.lineWidth = .025;
      for (let k = 0; k < 12; k++){ g.save(); g.rotate(k * TAU / 12); g.beginPath(); g.ellipse(0, .78, .14, .32, 0, 0, TAU); g.fill(); g.stroke(); g.restore(); }
      for (let k = 0; k < 12; k++){ g.save(); g.rotate(k * TAU / 12 + TAU / 24); g.beginPath(); g.ellipse(0, .62, .1, .22, 0, 0, TAU); g.fillStyle = '#f6dcd2'; g.fill(); g.stroke(); g.restore(); } }
  },
  sanjhi: {
    top(g){ paper(g, '#2a2340', 34, .04);
      scatter(g, .62, 35, (g, r) => { g.rotate(r() * TAU); lace(g, .2, '#efe4cf', '#2a2340'); }); },
    floor(g){ paper(g, '#211b33', 36, .04);
      g.fillStyle = '#efe4cf'; g.beginPath(); g.arc(0, 0, 1.82, 0, TAU); g.fill();
      g.fillStyle = '#211b33';
      for (const [rr, n, w, h] of [[1.55, 24, .07, .16], [1.15, 16, .1, .22], [.78, 12, .07, .16]]) for (let k = 0; k < n; k++){ g.save(); g.rotate(k * TAU / n); g.beginPath(); g.ellipse(0, rr, w, h, 0, 0, TAU); g.fill(); g.restore(); }
      for (let k = 0; k < 36; k++){ const a = k * TAU / 36; g.beginPath(); g.arc(Math.cos(a) * 1.73, Math.sin(a) * 1.73, .035, 0, TAU); g.fill(); } }
  },
  pattachitra: {
    top(g){ paper(g, '#b8321f', 24, .05); g.lineCap = 'round';
      scatter(g, .66, 25, (g, r) => { g.rotate(r() * TAU); g.strokeStyle = '#1d140f'; g.lineWidth = .018;
        for (let p = 0; p < 6; p++){ g.save(); g.rotate(p * TAU / 6); g.beginPath(); g.ellipse(0, .11, .05, .1, 0, 0, TAU); g.fillStyle = '#efb93f'; g.fill(); g.strokeStyle = '#1d140f'; g.lineWidth = .018; g.stroke(); g.restore(); }
        g.beginPath(); g.arc(0, 0, .05, 0, TAU); g.fillStyle = '#f4e7cf'; g.fill(); g.stroke();
        g.beginPath(); g.moveTo(.2, -.04); g.quadraticCurveTo(.32, -.18, .22, -.3); g.quadraticCurveTo(.16, -.36, .12, -.3); g.lineWidth = .02; g.stroke(); }); },
    floor(g){ paper(g, '#f0e2c4', 26, .05); g.lineCap = 'round';
      g.fillStyle = '#b8321f'; g.beginPath(); g.arc(0, 0, 1.85, 0, TAU); g.arc(0, 0, 1.55, 0, TAU, true); g.fill();
      g.strokeStyle = '#1d140f'; g.lineWidth = .025; for (const rr of [1.85, 1.55]){ g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.stroke(); }
      g.fillStyle = '#efb93f'; for (let k = 0; k < 30; k++){ const a = k * TAU / 30; g.beginPath(); g.arc(Math.cos(a) * 1.7, Math.sin(a) * 1.7, .045, 0, TAU); g.fill(); }
      for (let k = 0; k < 10; k++){ g.save(); g.rotate(k * TAU / 10); g.beginPath(); g.ellipse(1.05, 0, .38, .14, 0, 0, TAU); g.fillStyle = k % 2 ? '#b8321f' : '#efb93f'; g.fill(); g.strokeStyle = '#1d140f'; g.lineWidth = .025; g.stroke(); g.restore(); } }
  }
};
