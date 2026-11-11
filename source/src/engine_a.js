/* =====================================================================
   ENGINE 1 · CONSTANTS & HELPERS
   (shared by Chakrview and Chakrvroom, game files define `save`, `EXT` and the UI hooks)
   ===================================================================== */
const APP_VERSION = '1.0.0';
const TAU = Math.PI * 2, D2R = Math.PI / 180, SQ3 = Math.sqrt(3);
const BALL_R = 0.36, WALL_H = 0.6, BEV = 0.06, TEX_EXT = EXT - .5;
const GOAL_R = 0.46, TRAP_R = 0.44, POST_R = 0.17, GONG_R = 0.5, TIER_D = 0.78;
const G = 300, MAX_TILT = 0.19, DROP_G = 90;
const isTouch = (window.matchMedia && matchMedia('(pointer: coarse)').matches) || navigator.maxTouchPoints > 0;
const coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const isBrave = !!(navigator.brave && typeof navigator.brave.isBrave === 'function');
const inFrame = (() => { try { return window.self !== window.top; } catch(e){ return true; } })();
const DEV_UNLOCK = /[?&]unlock=all\b/.test(location.search);
const $ = id => document.getElementById(id);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const wrapA = a => { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; };
const modT = a => ((a % TAU) + TAU) % TAU;
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function fmt(t){ const m = Math.floor(t / 60), s = t - m * 60; return m + ':' + (s < 10 ? '0' : '') + s.toFixed(1); }
const fmtS = s => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };
const hex2rgb = h => [(h >> 16) & 255, (h >> 8) & 255, h & 255];

/* board shapes. ρ is the shape's own "radius": circle = distance, polygon = apothem, lotus = distance ÷ petal wave */
const SHAPES = {
  circle: { N: 0, name: 'Circle',  pair: 1.8 },
  hex:    { N: 6, name: 'Hexagon', pair: 1.72 },
  oct:    { N: 8, name: 'Octagon', pair: 1.72 },
  square: { N: 4, name: 'Yantra',  pair: 1.66 },
  lotus:  { N: 0, name: 'Lotus',   pair: 1.8, petals: 8, amp: .065 }
};

/* =====================================================================
   ENGINE 2 · QUALITY TIERS
   ===================================================================== */
const mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
const weak = mem <= 2 || (isTouch && cores <= 4);
const DPR = window.devicePixelRatio || 1;
const PRESETS = {
  high: { pr: Math.min(DPR, 2),    shadows: true,  sm: 2048, tex: 1024, ao: 512, arc: 2,   bevSeg: 2, seg: 48 },
  mid:  { pr: Math.min(DPR, 1.5),  shadows: false, sm: 1024, tex: 1024, ao: 384, arc: 2.5, bevSeg: 2, seg: 32 },
  low:  { pr: Math.min(DPR, 1.1),  shadows: false, sm: 512,  tex: 512,  ao: 256, arc: 3.5, bevSeg: 1, seg: 24 }
};
const tierOf = q => q === 'auto' ? (weak ? 'low' : isTouch ? 'mid' : 'high') : q;
let Q = Object.assign({}, PRESETS[tierOf(save.quality)]);

/* =====================================================================
   ENGINE 3 · RENDERER & SCENE  (soft light, little shine, less glare, fewer fake shadows)
   ===================================================================== */
const canvas = $('c');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !weak && save.quality !== 'low', powerPreference: 'high-performance' }); }
catch (e) { document.body.innerHTML = '<div class="err">This game needs WebGL, which isn\'t available in this browser.</div>'; throw e; }
renderer.setPixelRatio(Q.pr);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = .94;
renderer.shadowMap.enabled = Q.shadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xefe6d8);
scene.fog = new THREE.Fog(0xefe6d8, 45, 110);
const camera = new THREE.PerspectiveCamera(32, 1, 0.05, 300);
(function buildEnv(){
  const env = new THREE.Scene();
  const geo = new THREE.SphereGeometry(50, 48, 24), pos = geo.attributes.position, cols = [];
  const top = new THREE.Color(.9, .87, .82), hor = new THREE.Color(.56, .4, .26), bot = new THREE.Color(.26, .12, .05);
  for (let i = 0; i < pos.count; i++){
    const y = pos.getY(i) / 50, c = new THREE.Color();
    if (y > .08) c.copy(hor).lerp(top, Math.pow((y - .08) / .92, .45)); else c.copy(hor).lerp(bot, Math.pow(clamp((.08 - y) / 1.08, 0, 1), .5));
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  env.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ side: THREE.BackSide, vertexColors: true })));
  // one broad soft window instead of several hard panels → softer, less glary highlights
  const panel = (w, h, x, y, z, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k * .98, k * .94), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m); };
  panel(34, 22, -16, 34, -10, 3.2); panel(40, 8, 0, 8, -44, 1.1);
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(env, .04).texture; pm.dispose();
})();
const hemi = new THREE.HemisphereLight(0xfff4e6, 0x6b5240, .6); scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff1e0, 2.15);
sun.position.set(-7, 18, -6); sun.castShadow = true;
sun.shadow.mapSize.set(Q.sm, Q.sm);
Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 2, far: 60 });
sun.shadow.bias = -.0006; sun.shadow.normalBias = .045; sun.shadow.radius = 4;
scene.add(sun);
function setBackdrop(hex){ scene.background.setHex(hex); scene.fog.color.setHex(hex); }

/* =====================================================================
   ENGINE 4 · PROCEDURAL TEXTURES, crafts as pixel shaders, folk art as vector painting
   ===================================================================== */
