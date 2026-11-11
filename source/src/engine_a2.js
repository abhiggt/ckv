
/* the board library: base crafts. Each level re-seeds, re-scales and tints one of these, so no two boards are identical */
const BOARDS = {
  sheesham:    { name: 'Sheesham', kind: 'wood', wood: { L: [200,118,62], D: [128,60,26], G: [214,140,70], warp: 3.6, freq: 15 }, side: 0x6a4630, floor: 0xb08a72, edge: 0xa87458, rough: .55, ao: 1 },
  chandan:     { name: 'Chandan', kind: 'wood', wood: { L: [224,180,122], D: [168,116,64], G: [238,202,146], warp: 2.8, freq: 18 }, side: 0x7a5434, floor: 0xb69478, edge: 0xc09060, rough: .52, ao: 1 },
  akhrot:      { name: 'Akhrot', kind: 'wood', wood: { L: [140,96,64], D: [62,38,23], G: [168,118,74], warp: 4.6, freq: 11 }, side: 0x4a3222, floor: 0xa07f6b, edge: 0x8a6650, rough: .55, ao: 1 },
  makrana:     { name: 'Makrana', kind: 'marble', side: 0xcfc8bc, floor: 0xffffff, edge: 0xe2ddd4, rough: .32, ao: .55 },
  neel:        { name: 'Neel', kind: 'neel', side: 0x22408c, floor: 0xffffff, edge: 0x1f3d88, rough: .3, ao: .6 },
  bidri:       { name: 'Bidri', kind: 'bidri', side: 0x1a1a1c, floor: 0xffffff, edge: 0x1c1c1e, rough: .45, metal: .35, ao: .7 },
  warli:       { name: 'Warli', kind: 'art', art: 'warli', side: 0x5a2a18, floor: 0xffffff, edge: 0x7c3a22, rough: .85, ao: .8 },
  madhubani:   { name: 'Madhubani', kind: 'art', art: 'madhubani', side: 0x5c3a22, floor: 0xffffff, edge: 0x3a2618, rough: .8, ao: .5 },
  kolam:       { name: 'Kolam', kind: 'art', art: 'kolam', side: 0x231c19, floor: 0xffffff, edge: 0x2e2622, rough: .85, ao: .65 },
  gond:        { name: 'Gond', kind: 'art', art: 'gond', side: 0x12151f, floor: 0xffffff, edge: 0x1a1e2b, rough: .8, ao: .6 },
  kalamkari:   { name: 'Kalamkari', kind: 'art', art: 'kalamkari', side: 0x4a2414, floor: 0xffffff, edge: 0x6b3220, rough: .85, ao: .5 },
  lippan:      { name: 'Lippan', kind: 'art', art: 'lippan', side: 0x4e3826, floor: 0xffffff, edge: 0x6e5038, rough: .85, ao: .7 },
  pattachitra: { name: 'Pattachitra', kind: 'art', art: 'pattachitra', side: 0x5a1a10, floor: 0xffffff, edge: 0x8a2716, rough: .85, ao: .55 },
  pichwai:     { name: 'Pichwai', kind: 'art', art: 'pichwai', side: 0x14251f, floor: 0xffffff, edge: 0x1f3b33, rough: .85, ao: .6 },
  sanjhi:      { name: 'Sanjhi', kind: 'art', art: 'sanjhi', side: 0x16122a, floor: 0xffffff, edge: 0x241e3c, rough: .85, ao: .6 }
};

function texFromCanvas(cv, planar){
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  if (planar){ t.repeat.set(1 / (2 * TEX_EXT), 1 / (2 * TEX_EXT)); t.offset.set(.5, .5); }
  return t;
}
function pixCanvas(S, fn, ext){
  ext = ext || TEX_EXT;
  const ox = VAR.seed * 7.7, oy = VAR.seed * 3.3;
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(S, S), pix = img.data;
  for (let py = 0; py < S; py++){
    const y = ext - (py + .5) / S * 2 * ext;
    for (let px = 0; px < S; px++){ const x = -ext + (px + .5) / S * 2 * ext, c = fn(x + ox, y + oy), i = (py * S + px) * 4; pix[i] = c[0]; pix[i + 1] = c[1]; pix[i + 2] = c[2]; pix[i + 3] = 255; }
  }
  ctx.putImageData(img, 0, 0); return cv;
}
function artCanvas(S, draw, ext){
  ext = ext || TEX_EXT;
  const cv = document.createElement('canvas'); cv.width = cv.height = S;
  const g = cv.getContext('2d'), k = S / (2 * ext);
  g.setTransform(k, 0, 0, -k, S / 2, S / 2); g.lineJoin = 'round'; draw(g); return cv;
}
// gentle per-level tint: multiply every pixel toward a colour (keeps the craft, shifts the mood)
function tintCanvas(cv, t){
  if (!t || (t[0] === 1 && t[1] === 1 && t[2] === 1)) return cv;
  const g = cv.getContext('2d'), img = g.getImageData(0, 0, cv.width, cv.height), d = img.data;
  for (let i = 0; i < d.length; i += 4){ d[i] = d[i] * t[0]; d[i + 1] = d[i + 1] * t[1]; d[i + 2] = d[i + 2] * t[2]; }
  g.putImageData(img, 0, 0); return cv;
}
// quieten a pattern: pull every pixel toward the surface's average colour (keeps the material, softens the motif)
function soften(cv, k){
  const g = cv.getContext('2d'), img = g.getImageData(0, 0, cv.width, cv.height), d = img.data;
  let r = 0, gg = 0, b = 0, n = 0; for (let i = 0; i < d.length; i += 64){ r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; }
  r /= n; gg /= n; b /= n;
  for (let i = 0; i < d.length; i += 4){ d[i] = r + (d[i] - r) * k; d[i + 1] = gg + (d[i + 1] - gg) * k; d[i + 2] = b + (d[i + 2] - b) * k; }
  g.putImageData(img, 0, 0); return cv;
}
/* spec = { key, seed, sc, tint, id } */
const boardCache = new Map();
function boardTextures(spec){
  const id = spec.id + '@' + Q.tex; if (boardCache.has(id)) return boardCache.get(id);
  const B = BOARDS[spec.key]; VAR = { seed: spec.seed || 0, sc: spec.sc || 1 };
  let top, floor;
  if (B.kind === 'art'){ top = soften(artCanvas(Q.tex, ART[B.art].top), .36); floor = artCanvas(Q.tex, ART[B.art].floor); }
  else { const g = PIX[B.kind](B); top = pixCanvas(Q.tex, g.top); floor = g.floor ? pixCanvas(Q.tex, g.floor) : null; if (B.kind === 'neel' || B.kind === 'bidri') soften(top, .4); }
  VAR = { seed: 0, sc: 1 };
  tintCanvas(top, spec.tint); if (floor) tintCanvas(floor, spec.tint);
  const T = { top: texFromCanvas(top, true) }; T.floor = floor ? texFromCanvas(floor, true) : T.top;
  T.edge = T.top.clone(); T.edge.needsUpdate = true; T.edge.wrapS = T.edge.wrapT = THREE.RepeatWrapping;
  if (B.kind === 'wood'){ T.edge.repeat.set(5, .05); T.edge.offset.set(0, .3); } else { T.edge.repeat.set(3, .12); T.edge.offset.set(0, .4); }
  boardCache.set(id, T);
  while (boardCache.size > 3){ const [k, v] = boardCache.entries().next().value; if (k === curBoard) break; boardCache.delete(k); new Set([v.top, v.floor, v.edge]).forEach(t => t.dispose()); }
  return T;
}
function sphereTex(W, H, fn, srgb = true){
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d'), img = ctx.createImageData(W, H), d = img.data;
  for (let y = 0; y < H; y++){
    const th = (y + .5) / H * Math.PI;
    for (let x = 0; x < W; x++){
      const ph = (x + .5) / W * TAU, s = Math.sin(th);
      const c = fn(s * Math.cos(ph), Math.cos(th), s * Math.sin(ph), ph, th), i = (y * W + x) * 4;
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv); if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* =====================================================================
   ENGINE 5 · MATERIALS
   ===================================================================== */
const M = {
  top:   new THREE.MeshStandardMaterial({ roughness: .55, envMapIntensity: .3 }),
  side:  new THREE.MeshStandardMaterial({ roughness: .75, envMapIntensity: .22, side: THREE.DoubleSide }),
  floor: new THREE.MeshStandardMaterial({ roughness: .85, envMapIntensity: .2 }),
  floorLow: new THREE.MeshStandardMaterial({ roughness: .85, envMapIntensity: .15 }),
  edge:  new THREE.MeshStandardMaterial({ roughness: .6, envMapIntensity: .28 }),
  hole:  new THREE.MeshStandardMaterial({ color: 0x1a0f09, roughness: .95, side: THREE.BackSide }),
  holeB: new THREE.MeshStandardMaterial({ color: 0x0e0805, roughness: 1 }),
  brass: new THREE.MeshStandardMaterial({ color: 0xd2b070, metalness: .9, roughness: .34, envMapIntensity: .8 }),
  gateT: new THREE.MeshStandardMaterial({ color: 0xc9a160, metalness: .85, roughness: .36, envMapIntensity: .75 }),
  gateS: new THREE.MeshStandardMaterial({ color: 0x9a7438, metalness: .8, roughness: .42, envMapIntensity: .6 }),
  gong:  new THREE.MeshStandardMaterial({ color: 0xc9824e, metalness: .9, roughness: .34, envMapIntensity: .9, emissive: 0x7a3a10, emissiveIntensity: 0 })
};
let aoData = null, floorTexCur = null, curBoard = null, curSpec = null;
// one floor texture per level: the board's floor art + baked groove shading (no flat overlays that flicker)
function composeFloor(){
  if (!level || !curSpec || !aoData) return;
  const B = BOARDS[curSpec.key], src = boardTextures(curSpec).floor.image, S = src.width;
  const cv = document.createElement('canvas'); cv.width = cv.height = S; const g = cv.getContext('2d');
  g.drawImage(src, 0, 0);
  if (level.current) paintRiver(g, S / (2 * TEX_EXT));
  if (level.paint) level.paint(g, S / (2 * TEX_EXT));
  const A = aoData.S, ac = document.createElement('canvas'); ac.width = ac.height = A;
  const ag = ac.getContext('2d'), img = ag.createImageData(A, A), d = img.data;
  const col = B.kind === 'neel' ? [6, 16, 42] : B.kind === 'marble' ? [58, 50, 40] : [26, 12, 4], op = Math.min(.95, B.ao);
  for (let i = 0, n = A * A; i < n; i++){ const j = i * 4; d[j] = col[0]; d[j + 1] = col[1]; d[j + 2] = col[2]; d[j + 3] = aoData.a[i] * op; }
  ag.putImageData(img, 0, 0); g.imageSmoothingEnabled = true; g.drawImage(ac, 0, 0, S, S);
  if (floorTexCur) floorTexCur.dispose();
  floorTexCur = texFromCanvas(cv, true); M.floor.map = M.floorLow.map = floorTexCur; M.floor.needsUpdate = M.floorLow.needsUpdate = true;
}
function applyBoard(spec, skipFloor){
  if (curBoard === spec.id + '@' + Q.tex) return; curBoard = spec.id + '@' + Q.tex; curSpec = spec;
  const B = BOARDS[spec.key], t = boardTextures(spec), shiny = B.kind === 'marble' || B.kind === 'neel';
  M.top.map = t.top; M.side.map = B.kind === 'wood' || B.kind === 'marble' ? t.top : null; M.edge.map = t.edge;
  M.top.roughness = B.rough; M.top.metalness = B.metal || 0; M.top.envMapIntensity = B.kind === 'wood' || B.kind === 'art' ? .3 : .45;
  M.floor.roughness = shiny ? .45 : .85;
  const tc = new THREE.Color(spec.tint ? new THREE.Color(spec.tint[0], spec.tint[1], spec.tint[2]) : 0xffffff);
  M.side.color.set(B.side).multiply(tc); M.floor.color.set(B.floor); M.floorLow.color.set(B.floor).multiplyScalar(.74); M.floorLow.roughness = shiny ? .5 : .88; M.edge.color.set(B.edge).multiply(tc);
  M.edge.roughness = B.rough; M.edge.metalness = B.metal || 0;
  for (const k of ['top', 'side', 'floor', 'edge']) M[k].needsUpdate = true;
  if (!skipFloor) composeFloor();
}
const ballLooks = {};
function getBallLook(key){
  if (ballLooks[key]) return ballLooks[key];
  let mat;
  switch (key){
    case 'fauladi': mat = new THREE.MeshStandardMaterial({ color: 0xd4d6d8, metalness: 1, roughness: .16, envMapIntensity: 1.0 }); break;
    case 'peetal': {
      const bump = sphereTex(256, 128, (x, y, z) => { const n = NZ(x * 7 + 3, y * 7 + z * 4) * .6 + NZ2(z * 13, x * 13 + y * 6) * .4, v = 255 * Math.pow(n, .7); return [v, v, v]; }, false);
      mat = new THREE.MeshStandardMaterial({ color: 0xdcb86c, metalness: 1, roughness: .26, envMapIntensity: .95, bumpMap: bump, bumpScale: .9 }); break;
    }
    case 'kancha': {   // clear glass: thin in the middle, thicker and brighter at the rim
      mat = new THREE.MeshPhysicalMaterial({ color: 0xe9f2fa, roughness: .02, metalness: 0, clearcoat: 1, clearcoatRoughness: .02, envMapIntensity: 1.6, transparent: true, depthWrite: false, opacity: 1 });
      mat.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <opaque_fragment>', '#include <opaque_fragment>\n  { float f = 1.0 - abs(dot(normalize(normal), normalize(vViewPosition))); gl_FragColor.a = clamp(mix(.14, .92, pow(f, 2.4)), 0.0, 1.0); }'); };
      break;
    }
    case 'suvarna': {   // the maker's marble, gold, with a fine engraved ring
      const map = sphereTex(256, 128, (x, y, z, ph, th) => { const ring = Math.abs(th - Math.PI / 2) < .05 || Math.abs(Math.sin(ph * 6)) < .03 && Math.abs(th - Math.PI / 2) < .35; const n = (NZ(x * 8 + 2, y * 8 + z * 5) - .5) * 14; return ring ? [120 + n, 80 + n, 30] : [236 + n, 190 + n, 92 + n]; });
      mat = new THREE.MeshStandardMaterial({ map, metalness: 1, roughness: .2, envMapIntensity: 1.05 }); break;
    }
    default: mat = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: .5, roughness: .3 });
  }
  return (ballLooks[key] = mat);
}
