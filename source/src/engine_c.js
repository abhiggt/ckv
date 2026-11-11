
/* =====================================================================
   ENGINE 9 · AUDIO, soft and physical. No music, no jingles.
   ===================================================================== */
const audio = { ctx: null };
const SA = 130.81;
function impulse(ac, dur, decay){
  const len = ac.sampleRate * dur, buf = ac.createBuffer(2, len, ac.sampleRate);
  for (let c = 0; c < 2; c++){ const d = buf.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay); }
  return buf;
}
function initAudio(){
  if (audio.ctx){ if (audio.ctx.state === 'suspended') audio.ctx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
  const ac = audio.ctx = new AC();
  audio.sfx = ac.createGain(); audio.sfx.gain.value = sfxLevel(); audio.sfx.connect(ac.destination);
  audio.rev = ac.createConvolver(); audio.rev.buffer = impulse(ac, 2.6, 2.8);
  const wet = ac.createGain(); wet.gain.value = .45; audio.rev.connect(wet); wet.connect(audio.sfx);
  const len = ac.sampleRate * 2, buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
  let b = 0; for (let i = 0; i < len; i++){ b = .985 * b + .015 * (Math.random() * 2 - 1); d[i] = b * 8; }
  audio.noise = buf;
  const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
  audio.rollF = ac.createBiquadFilter(); audio.rollF.type = 'lowpass'; audio.rollF.Q.value = .4; audio.rollF.frequency.value = 200;
  audio.rollG = ac.createGain(); audio.rollG.gain.value = 0;
  src.connect(audio.rollF); audio.rollF.connect(audio.rollG); audio.rollG.connect(audio.sfx); src.start();
}
const sfxLevel = () => save.sound ? .9 * (save.sfxVol == null ? 1 : save.sfxVol) : 0;
function setSound(){ if (audio.sfx) audio.sfx.gain.setTargetAtTime(sfxLevel(), audio.ctx.currentTime, .05); }
// a gentle hum that rises with speed (Chakrvroom)
function setHum(speed){
  if (!audio.ctx) return;
  const ac = audio.ctx, t = ac.currentTime;
  if (!audio.hum){
    const o = ac.createOscillator(), o2 = ac.createOscillator(), f = ac.createBiquadFilter(), g = ac.createGain();
    o.type = 'sawtooth'; o2.type = 'triangle'; f.type = 'lowpass'; f.frequency.value = 500; f.Q.value = 2; g.gain.value = 0;
    o.connect(f); o2.connect(f); f.connect(g); g.connect(audio.sfx); o.start(); o2.start(); audio.hum = { o, o2, f, g };
  }
  const H = audio.hum, s = clamp(speed / 40, 0, 1);
  H.o.frequency.setTargetAtTime(48 + speed * 3.2, t, .1); H.o2.frequency.setTargetAtTime(96 + speed * 6.4, t, .1);
  H.f.frequency.setTargetAtTime(300 + speed * 30, t, .1); H.g.gain.setTargetAtTime(Math.pow(s, 1.4) * .05, t, .12);
}
// a singing post: one note of the pentatonic scale
function sfxNote(k, v){ if (!audio.ctx || !save.sound) return; const f = SA * 4 * SCALE[k % SCALE.length] * (k >= SCALE.length ? 2 : 1), t = audio.ctx.currentTime, a = clamp(v / 20, .25, 1);
  voice(f, t, 2.2, .05 * a, 'sine', .8); voice(f * 3.01, t, .7, .012 * a, 'sine', .8); voice(f * 5.4, t, .3, .005 * a, 'sine', .5); }
// a gust of wind: a swell of filtered noise
function sfxWind(dur){
  if (!audio.ctx || !save.sound) return;
  const ac = audio.ctx, t = ac.currentTime, s = ac.createBufferSource(); s.buffer = audio.noise; s.loop = true; s.playbackRate.value = 3;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = .8; f.frequency.setValueAtTime(400, t); f.frequency.linearRampToValueAtTime(1300, t + dur * .5); f.frequency.linearRampToValueAtTime(500, t + dur);
  const g = ac.createGain(); g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(.05, t + dur * .45); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  s.connect(f); f.connect(g); g.connect(audio.sfx); const w = ac.createGain(); w.gain.value = .3; g.connect(w); w.connect(audio.rev); s.start(t); s.stop(t + dur + .1);
}
function setRoll(speed, k){
  if (!audio.ctx) return;
  const t = audio.ctx.currentTime; k = k || 1;
  audio.rollG.gain.setTargetAtTime(Math.pow(clamp(speed / 30, 0, 1), 2) * .06 * k, t, .12);
  audio.rollF.frequency.setTargetAtTime((160 + speed * 9) * (k > 1 ? .75 : 1), t, .15);
}
function voice(freq, t, dur, vol, type, wet){
  const ac = audio.ctx, o = ac.createOscillator(), g = ac.createGain();
  o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
  g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(audio.sfx); if (wet){ const w = ac.createGain(); w.gain.value = wet; g.connect(w); w.connect(audio.rev); }
  o.start(t); o.stop(t + dur + .05);
}
function thump(freq, vol, dur){
  if (!audio.ctx) return;
  const ac = audio.ctx, t = ac.currentTime, s = ac.createBufferSource(); s.buffer = audio.noise; s.playbackRate.value = 1.4;
  const f = ac.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq; const g = ac.createGain();
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0005, t + dur);
  s.connect(f); f.connect(g); g.connect(audio.sfx); s.start(t, Math.random()); s.stop(t + dur + .02);
}
function tock(v){
  if (!audio.ctx || !save.sound) return;
  const ac = audio.ctx, t = ac.currentTime, vol = clamp(v / 30, .03, .6) * .32;
  const s = ac.createBufferSource(); s.buffer = audio.noise; s.playbackRate.value = 2.2;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = BP.tock * (.85 + Math.random() * .2); f.Q.value = 1.6;
  const g = ac.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0005, t + .06);
  s.connect(f); f.connect(g); g.connect(audio.sfx); s.start(t, Math.random()); s.stop(t + .07);
}
const SCALE = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2, 9 / 4];
function chime(k){   // passing through a wall into the next ring, the soul of the game
  if (!audio.ctx || !save.sound) return;
  const f = SA * 4 * SCALE[Math.min(k, SCALE.length - 1)], t = audio.ctx.currentTime;
  voice(f, t, 1.6, .045, 'sine', .9); voice(f * 2.01, t, .9, .012, 'sine', .9);
}
function sfxGong(){
  if (!audio.ctx || !save.sound) return;
  const t = audio.ctx.currentTime, f = SA * 1.5;
  thump(700, .1, .06);
  voice(f, t, 4.2, .05, 'sine', 1); voice(f * 1.006, t, 3.6, .03, 'sine', 1);
  voice(f * 2.32, t, 2.4, .016, 'sine', 1); voice(f * 4.25, t, 1.2, .007, 'sine', 1);
}
function sfxBloom(){   // a chakra opens: a slow rising pair of bell tones
  if (!audio.ctx || !save.sound) return;
  const t = audio.ctx.currentTime;
  [[1, 0], [5 / 4, .18], [3 / 2, .36], [2, .6]].forEach(([r, d]) => voice(SA * 2 * r, t + d, 3.2, .035, 'sine', 1));
}
function sfxGoal(){ if (!audio.ctx || !save.sound) return; thump(260, .5, .35); }
function sfxTrap(){ if (!audio.ctx || !save.sound) return; thump(180, .4, .3); }
function sfxKnock(){ if (!audio.ctx || !save.sound) return; thump(520, .07, .09); }
const vib = p => { if (save.haptics && navigator.vibrate) try { navigator.vibrate(p); } catch(e){} };
addEventListener('pointerdown', () => initAudio(), { capture: true });
addEventListener('keydown', () => initAudio(), { capture: true });

/* =====================================================================
   ENGINE 10 · STATE & PHYSICS
   ===================================================================== */
const st = { open: true, sealT: 0, x: 0, y: 0, z: BALL_R, vx: 0, vy: 0, vz: 0, tier: 0, mode: 'home', hole: null, time: 0, tx: 0, ty: 0, heading: 0, impact: 0, fallT: 0, cp: null };
const others = [];   // other marbles to bump into (Chakrvroom): { x, y, vx, vy, on }
const floorY = () => level.tier && st.tier ? -level.tier.D : 0;
function resetBall(how, fresh){
  if (fresh || !st.cp) st.cp = level.entries[0];
  const c = st.cp; st.x = c.x; st.y = c.y; st.vx = st.vy = st.vz = 0; st.tier = level.tierAt(c.x, c.y);
  st.heading = c.heading != null ? c.heading : Math.atan2(c.dir * Math.cos(c.a), -c.dir * Math.sin(c.a)); chase.init = false;
  if (how === 'drop'){ st.z = floorY() + 3.2; st.vz = 0; st.bounces = 0; st.mode = 'drop'; } else st.z = floorY() + BALL_R;
}
const _P = { x: 0, y: 0, vx: 0, vy: 0 };
function collide(P, segs, grid, rest, grip){
  let imp = 0;
  for (let pass = 0; pass < 2; pass++){
    const cell = cellOf(grid, P.x, P.y);
    for (let n = 0; n < cell.length; n++){
      const j = cell[n], x1 = segs[j], y1 = segs[j + 1], dx = segs[j + 2] - x1, dy = segs[j + 3] - y1;
      const l2 = dx * dx + dy * dy || 1e-9; let t = ((P.x - x1) * dx + (P.y - y1) * dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = x1 + t * dx, qy = y1 + t * dy; let nx = P.x - qx, ny = P.y - qy; const d = Math.hypot(nx, ny);
      if (d < BALL_R && d > 1e-7){
        nx /= d; ny /= d; P.x = qx + nx * BALL_R; P.y = qy + ny * BALL_R;
        const vn = P.vx * nx + P.vy * ny;
        if (vn < 0){
          const e = vn < -2.5 ? rest : 0;
          P.vx -= (1 + e) * vn * nx; P.vy -= (1 + e) * vn * ny;
          const tx = -ny, ty = nx, vt = P.vx * tx + P.vy * ty, fr = Math.min(1, grip * -vn / (Math.abs(vt) + 1));
          P.vx -= vt * tx * fr; P.vy -= vt * ty * fr;
          if (-vn > imp) imp = -vn;
        }
      }
    }
  }
  return imp;
}
function physicsStep(h, play){
  const acc = G * BP.speed, damp = BP.damp + (level.drag || 0);
  let ax = acc * Math.sin(st.tx), ay = acc * Math.sin(st.ty);
  const fy = floorY();
  // a river along one ring (Water): pushes along the groove, from where you enter to its opening
  const Cu = level.current;
  if (Cu && (Cu.low ? 1 : 0) === st.tier){
    const r = level.geo.rho(st.x, st.y);
    if (r > Cu.a && r < Cu.b){
      const ang = Math.atan2(st.y, st.x), u = modT((ang - Cu.e) * Cu.dir);
      if (u < Cu.L){
        const e = .02, gx = level.geo.rho(st.x + e, st.y) - level.geo.rho(st.x - e, st.y), gy = level.geo.rho(st.x, st.y + e) - level.geo.rho(st.x, st.y - e), gl = Math.hypot(gx, gy) || 1;
        const f = Cu.c * Cu.flow * Math.min(1, u / .25, (Cu.L - u) / .25);
        ax += -gy / gl * f; ay += gx / gl * f;
      }
    }
  }
  // gusts of wind (Air)
  if (level.wind && level.wind.k > 0){ ax += level.wind.x * level.wind.k; ay += level.wind.y * level.wind.k; }
  let zt = fy + BALL_R + (gongObj && gongObj.tier === st.tier && Math.hypot(st.x - gongObj.x, st.y - gongObj.y) < .46 ? .045 : 0);
  if (play) for (const H of level.holes){
    if ((H.tier | 0) !== st.tier || (H.goal && !st.open) || (st.ghost && !H.goal)) continue;
    const dx = st.x - H.x, dy = st.y - H.y, d = Math.hypot(dx, dy);
    if (d < H.r){
      const o = H.r - d;
      if (o > BALL_R * .8 && st.z < fy + BALL_R + .05){ beginFall(H); return; }
      zt = fy + Math.sqrt(BALL_R * BALL_R - o * o);
      const k = acc * 1.1 * o / BALL_R / (d || 1e-4); ax -= dx * k; ay -= dy * k;
    }
  }
  // vertical: settle onto the floor (a step down falls with gravity and lands with a soft knock)
  if (st.z > zt + .002){ st.vz -= DROP_G * h; st.z += st.vz * h;
    if (st.z <= zt){ if (st.vz < -3.5){ landed(-st.vz); st.vz = -st.vz * .22; st.z = zt; } else { st.z = zt; st.vz = 0; } } }
  else { st.z = zt; st.vz = 0; }
  st.vx += ax * h; st.vy += ay * h;
  const sp = Math.hypot(st.vx, st.vy);
  if (sp > 0){ const ns = Math.max(0, sp * Math.exp(-damp * h) - .9 * h), lim = Math.min(ns, 70) / sp; st.vx *= lim; st.vy *= lim; }
  st.x += st.vx * h; st.y += st.vy * h;
  if (level.tier && !st.tier && level.geo.rho(st.x, st.y) < level.tier.a - .03){ st.tier = 1; st.vz = 0; if (play) onStepDown(); }
  // playtest (Aham): roll through everything, but stay on the board
  if (st.ghost){
    const r = level.geo.rho(st.x, st.y), lim = level.geo.rimA - BALL_R;
    if (r > lim){ const k = lim / r; st.x *= k; st.y *= k; st.vx *= .4; st.vy *= .4; }
    if (level.tier && st.tier && r > level.tier.a + .08){ st.tier = 0; st.z = BALL_R; st.vz = 0; }
    return;
  }
  let imp = collide(st, level.segs, level.grid, BP.rest, BP.grip);
  if (level.tier && st.tier) imp = Math.max(imp, collide(st, level.tier.segs, level.tier.grid, BP.rest, BP.grip));
  for (const Gt of level.gates) if (Gt.closed && (Gt.low ? 1 : 0) === st.tier) imp = Math.max(imp, collide(st, Gt.segs, Gt.grid, BP.rest, BP.grip));
  const S = level.spin;
  if (S){
    const c = Math.cos(-S.a), s = Math.sin(-S.a), wvx = -S.w * st.y, wvy = S.w * st.x;
    const rvx = st.vx - wvx, rvy = st.vy - wvy;
    _P.x = c * st.x - s * st.y; _P.y = s * st.x + c * st.y; _P.vx = c * rvx - s * rvy; _P.vy = s * rvx + c * rvy;
    const i2 = collide(_P, level.spinSegs, level.spinGrid, BP.rest, BP.grip);
    const c2 = Math.cos(S.a), s2 = Math.sin(S.a);
    st.x = c2 * _P.x - s2 * _P.y; st.y = s2 * _P.x + c2 * _P.y;
    st.vx = c2 * _P.vx - s2 * _P.vy - S.w * st.y; st.vy = s2 * _P.vx + c2 * _P.vy + S.w * st.x;
    imp = Math.max(imp, i2);
  }
  for (const P of level.posts){
    if ((P.tier | 0) !== st.tier) continue;
    const dx = st.x - P.x, dy = st.y - P.y, d = Math.hypot(dx, dy), min = BALL_R + P.r;
    if (d < min && d > 1e-6){
      const nx = dx / d, ny = dy / d; st.x = P.x + nx * min; st.y = P.y + ny * min;
      const vn = (st.vx - (P.vx || 0)) * nx + (st.vy - (P.vy || 0)) * ny;
      if (vn < 0){ st.vx -= 1.7 * vn * nx; st.vy -= 1.7 * vn * ny; imp = Math.max(imp, -vn * 1.2);
        if (P.note != null && play && -vn > 1.5 && clock - (P.t || 0) > .18){ P.t = clock; P.glow = 1; sfxNote(P.note, -vn); } }
    }
  }
  // marble-to-marble: equal masses, only our own marble is moved (each phone runs its own)
  for (const o of others){
    if (!o.on) continue;
    const dx = st.x - o.x, dy = st.y - o.y, d = Math.hypot(dx, dy), min = BALL_R * 2;
    if (d < min && d > 1e-6){
      const nx = dx / d, ny = dy / d; st.x = o.x + nx * min; st.y = o.y + ny * min;
      const rv = (st.vx - o.vx) * nx + (st.vy - o.vy) * ny;
      if (rv < 0){ const j = -(1 + .6) * rv / 2; st.vx += j * nx; st.vy += j * ny; imp = Math.max(imp, -rv * .9); o.bump = 1; }
    }
  }
  if (imp > st.impact) st.impact = imp;
}
function beginFall(H){ st.mode = 'fall'; st.hole = H; st.vz = -2; st.fallT = 0; if (H.goal){ sfxGoal(); vib([15, 50, 25]); } else { sfxTrap(); vib(30); } }
function landed(v){ tock(v * .9); thump(240, clamp(v / 40, .05, .25), .18); vib(12); }
function checkCheckpoint(){
  const g = level.geo, r = g.rho(st.x, st.y), k0 = st.cp ? st.cp.k : 0;
  for (let k = k0 + 1; k < g.nG; k++){
    const [a, b] = g.grooves[k];
    if (r > a - .05 && r < b + .05){
      const E = level.entries[k], afterSpin = level.spin && level.spin.k === k - 1;
      if (afterSpin){
        const ang = Math.atan2(st.y, st.x), q = g.pt((a + b) / 2, ang);
        if (!level.pockets.some(P => P.k === k && inArc(ang, P.s, P.L)) && !level.holes.some(H => !H.goal && Math.hypot(q[0] - H.x, q[1] - H.y) < 1.3)){
          const d = Math.sign(st.vx * -Math.sin(ang) + st.vy * Math.cos(ang)) || 1;
          st.cp = { k, x: q[0], y: q[1], a: ang, dir: d }; chime(k);
        }
      } else if (Math.hypot(st.x - E.x, st.y - E.y) < 1.6){ st.cp = E; chime(k); }
      break;
    }
  }
}
function resetGong(){ st.open = !level.cfg.seal; st.sealT = 0; if (level.cfg.seal) setSeal(0); if (gongObj){ gongObj.hit = false; gongObj.t = 0; gongObj.grp.position.y = gongObj.y0; gongObj.rip.visible = false; M.gong.emissiveIntensity = 0; } }
function setSeal(t){ const e = t * t * (3 - 2 * t); for (const pv of sealPivots){ const closed = .05 + pv.userData.layer * .03; pv.rotation.set(0, pv.userData.base, closed + (2.95 - closed) * e - pv.userData.layer * .04 * e); } }
function checkGong(dt){
  const O = gongObj; if (!O) return;
  if (O.hit){
    if (O.t < 1){ O.t = Math.min(1, O.t + dt * .7); const e = O.t;
      O.grp.position.y = O.y0 - .025 * Math.sin(Math.min(1, e * 4) * Math.PI) * (1 - e);
      M.gong.emissiveIntensity = .9 * (1 - e) * (1 - e);
      O.rip.visible = e < 1; O.rip.scale.setScalar(1 + e * 4); O.rip.material.opacity = .65 * (1 - e); }
    return;
  }
  if (st.mode === 'play'){ M.gong.emissiveIntensity = .16 + .12 * Math.sin(clock * 2.4); if (O.tier === st.tier && Math.hypot(st.x - O.x, st.y - O.y) < GONG_R){
    O.hit = true; O.t = 0; st.open = true; sfxGong(); vib([10, 40, 10]); onGong();
  } }
  else M.gong.emissiveIntensity = 0;
}
// doors: timed ones keep their own rhythm; manual ones (Chakrvroom's pit gate) are opened by the game
function tickGates(dt){
  if (!level.gates.length) return;
  const T = st.mode === 'home' ? clock : st.time;
  for (const Gt of level.gates){
    let open = Gt.timed ? ((T + Gt.phase) % Gt.period) / Gt.period < Gt.openFrac : !!Gt.open;
    if (!open && Gt.y < -.05){   // never close on the marble
      const tierOk = (Gt.low ? 1 : 0) === st.tier, r = level.geo.rho(st.x, st.y), a = Math.atan2(st.y, st.x);
      if (tierOk && r > Gt.a - BALL_R - .05 && r < Gt.b + BALL_R + .05 && inArc(a, Gt.s - BALL_R / r, Gt.L + 2 * BALL_R / r)) open = true;
    }
    const tgt = open ? -(WALL_H + .08) : 0, was = Gt.closed;
    Gt.y += clamp(tgt - Gt.y, -dt * 3.2, dt * 3.2);
    Gt.closed = Gt.y > -.3;
    if (Gt.closed && !was && st.mode === 'play' && Math.hypot(st.x - (Gt.a + Gt.b) / 2 * Math.cos(Gt.s), st.y - (Gt.a + Gt.b) / 2 * Math.sin(Gt.s)) < 7) sfxKnock();
    if (Gt.mesh) Gt.mesh.position.y = Gt.base + Gt.y;
  }
}

/* =====================================================================
   ENGINE 11 · INPUT, keys, touch (a thumb pad anywhere), tilt (with every browser's quirks)
   ===================================================================== */
const keys = new Set();
const KEYMAP = { arrowup: [0, 1], w: [0, 1], arrowdown: [0, -1], s: [0, -1], arrowleft: [-1, 0], a: [-1, 0], arrowright: [1, 0], d: [1, 0] };
const inGame = () => st.mode === 'play' || st.mode === 'drop' || st.mode === 'fall';
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
addEventListener('blur', () => keys.clear());
const drag = { id: null, x0: 0, y0: 0, x: 0, y: 0 };
const useTilt = () => coarse && save.control === 'tilt' && gyro.live;
const thumbEl = $('thumb');
function showThumb(){
  if (!thumbEl) return;
  if (drag.id === null){ thumbEl.classList.remove('on'); return; }
  const R = Math.min(innerWidth, innerHeight) * .18 / save.sens; let dx = drag.x - drag.x0, dy = drag.y - drag.y0; const l = Math.hypot(dx, dy); if (l > R){ dx *= R / l; dy *= R / l; }
  thumbEl.style.transform = `translate(${drag.x0}px,${drag.y0}px)`; thumbEl.firstElementChild.style.transform = `translate(${dx}px,${dy}px)`;
  thumbEl.classList.add('on');
}
canvas.addEventListener('pointerdown', e => {
  if (useTilt() || !(inGame() || st.mode === 'ready')) return;
  drag.id = e.pointerId; drag.x0 = drag.x = e.clientX; drag.y0 = drag.y = e.clientY; showThumb();
  try { canvas.setPointerCapture(e.pointerId); } catch(_){}
});
canvas.addEventListener('pointermove', e => { if (e.pointerId === drag.id){ drag.x = e.clientX; drag.y = e.clientY; showThumb(); } });
const endDrag = e => { if (e.pointerId === drag.id){ drag.id = null; showThumb(); } };
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
const gyro = { live: false, src: null, state: 'idle', listening: false, pending: false, beta: 0, gamma: 0, b0: 0, g0: 0, cal: true };
const needsPerm = () => !!(window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function');
function goLive(src){
  if (gyro.live && gyro.src === src) return;
  if (gyro.src !== src) gyro.cal = true;
  gyro.src = src; gyro.live = true; gyro.state = 'live'; tiltChip(); onTiltChange();
}
function onOrient(e){
  if (e.beta == null || e.gamma == null || (e.beta === 0 && e.gamma === 0 && e.alpha == null)) return;
  if (gyro.src === 'motion' || !gyro.live) goLive('orient');
  gyro.beta = e.beta; gyro.gamma = e.gamma;
  if (gyro.cal){ gyro.b0 = e.beta; gyro.g0 = e.gamma; gyro.cal = false; }
}
function onMotion(e){   // phones whose orientation sensor is silent: derive tilt from gravity
  if (gyro.src === 'orient') return;
  const g = e.accelerationIncludingGravity; if (!g || g.x == null || g.y == null || (g.x === 0 && g.y === 0 && !g.z)) return;
  const sg = isIOS ? -1 : 1, b = Math.asin(clamp(sg * g.y / 9.81, -1, 1)) / D2R, gm = Math.asin(clamp(-sg * g.x / 9.81, -1, 1)) / D2R;
  if (!gyro.live) goLive('motion');
  gyro.beta = b; gyro.gamma = gm;
  if (gyro.cal){ gyro.b0 = b; gyro.g0 = gm; gyro.cal = false; }
}
let tiltTimer = 0;
const noDataState = () => isBrave ? 'brave' : inFrame ? 'frame' : needsPerm() ? 'ask' : 'nodata';
function checkTiltSoon(){ clearTimeout(tiltTimer); if (!gyro.live && gyro.state !== 'denied') gyro.state = 'waiting'; tiltTimer = setTimeout(() => { if (!gyro.live && gyro.state !== 'denied'){ gyro.state = noDataState(); tiltChip(); onTiltChange(); } }, 1800); }
// always listen: browsers that expose requestPermission may still deliver events
function listenTilt(){ if (gyro.listening) return; gyro.listening = true; addEventListener('deviceorientation', onOrient); addEventListener('devicemotion', onMotion); }
// call inside a tap: iPhone shows its motion prompt only then
function enableGyro(force){
  if (!coarse || gyro.live || gyro.pending) return;
  if (!window.isSecureContext){ gyro.state = 'insecure'; tiltChip(); return; }
  listenTilt();
  if (needsPerm() && (force || gyro.state !== 'denied')){
    gyro.pending = true;
    let p; try { p = DeviceOrientationEvent.requestPermission(); } catch(e){ p = Promise.reject(e); }
    Promise.resolve(p).then(r => { gyro.pending = false; if (gyro.live) return; if (r === 'denied' && isIOS){ gyro.state = 'denied'; tiltChip(); onTiltChange(); } else { if (gyro.state === 'denied') gyro.state = 'waiting'; checkTiltSoon(); } },
                             () => { gyro.pending = false; checkTiltSoon(); });
  } else if (!gyro.live && gyro.state !== 'waiting') checkTiltSoon();
}
const TILT_MSG = { ask: 'Tap to turn on tilt', denied: 'Tilt is off · tap', insecure: 'Tilt needs the https link', frame: 'Open in a browser for tilt', nodata: 'No tilt here · tap to drag', brave: 'Brave blocks tilt · tap to drag' };
const TILT_INFO = { live: 'On', waiting: 'Starting…', idle: 'Starting…', ask: 'Needs your permission. Tap to turn it on.', denied: 'Blocked. Allow Motion in your browser, then reload.',
  insecure: 'Needs the https:// link of the game', frame: 'Blocked inside this preview', nodata: 'This browser sends no tilt data', brave: 'Brave switches off motion sensors for privacy. Drag to roll, or open the game in Chrome or Firefox.' };
function tiltChip(){
  const c = $('tiltChip'); if (!c) return;
  const msg = TILT_MSG[gyro.state], show = coarse && save.control === 'tilt' && !gyro.live && !!msg && inGame();
  c.classList.toggle('hidden', !show); if (show) c.textContent = msg;
}
function tiltHelp(){ const t = TILT_INFO[gyro.state]; if (t && !gyro.live) setHint(t, 6500); }
if ($('tiltChip')) $('tiltChip').onclick = e => {
  e.stopPropagation();
  if (gyro.state === 'brave' || gyro.state === 'nodata' || gyro.state === 'frame' || gyro.state === 'insecure'){ setControl('touch'); return; }
  enableGyro(true); setTimeout(() => { if (!gyro.live && gyro.state !== 'ask') tiltHelp(); }, 400);
};
const firstTap = () => { if (!gyro.live && save.control === 'tilt') enableGyro(); };
document.addEventListener('touchend', firstTap, { capture: true, passive: true });
document.addEventListener('click', firstTap, { capture: true });
if (coarse){ if (!window.isSecureContext) gyro.state = 'insecure'; else { listenTilt(); checkTiltSoon(); } }
addEventListener('orientationchange', () => setTimeout(() => { gyro.cal = true; }, 300));
if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', () => { gyro.cal = true; });
const screenAngle = () => { const a = (screen.orientation && typeof screen.orientation.angle === 'number') ? screen.orientation.angle : (window.orientation || 0); return ((a % 360) + 360) % 360; };
function viewInput(){
  if (window.__inp){ const r = window.__inp(); if (r) return r; }   // test autopilot
  let ix = 0, iy = 0;
  for (const k of keys){ const m = KEYMAP[k]; if (m){ ix += m[0]; iy += m[1]; } }
  if (ix || iy){ const l = Math.hypot(ix, iy); return [ix / l * MAX_TILT, iy / l * MAX_TILT, 7]; }
  if (drag.id !== null){
    const s = Math.min(innerWidth, innerHeight) * .18 / save.sens;
    let dx = (drag.x - drag.x0) / s, dy = -(drag.y - drag.y0) / s; const l = Math.hypot(dx, dy);
    if (l > 1){ dx /= l; dy /= l; }
    return [dx * MAX_TILT, dy * MAX_TILT, 12];
  }
  if (useTilt()){
    const db = gyro.beta - gyro.b0, dg = wrapA((gyro.gamma - gyro.g0) * D2R) / D2R, a = screenAngle();
    let x, y;
    if (a === 90){ x = db; y = dg; } else if (a === 270){ x = -db; y = -dg; } else if (a === 180){ x = -dg; y = db; } else { x = dg; y = -db; }
    const gain = .85 * save.sens * D2R * (save.invert ? -1 : 1); let tx = x * gain, ty = y * gain; const l = Math.hypot(tx, ty);
    if (l > MAX_TILT){ tx *= MAX_TILT / l; ty *= MAX_TILT / l; }
    return [tx, ty, 16];
  }
  return [0, 0, 5];
}

/* =====================================================================
   ENGINE 12 · CAMERAS, home orbit, Top, Eye level
   ===================================================================== */
const chase = { pos: new THREE.Vector3(), look: new THREE.Vector3(), init: false };
const topPose = { pos: new THREE.Vector3(), q: new THREE.Quaternion(), fov: 32 };
const homePose = { pos: new THREE.Vector3(), q: new THREE.Quaternion(), fov: 30, dist: 40 };
const chasePose = { q: new THREE.Quaternion(), fov: 62 };
const _m = new THREE.Matrix4(), _v = new THREE.Vector3(), _v2 = new THREE.Vector3(), _bw = new THREE.Vector3(), _pp = new THREE.Vector3(), _pq = new THREE.Quaternion();
const UP = new THREE.Vector3(0, 1, 0), NEG_Z = new THREE.Vector3(0, 0, -1);
let viewT = save.view === 'eye' ? 1 : 0, homeT = 1;
const camFx = { shake: 0, fov: 0 };
const lay = { curOffY: 0, homeOffY: 0 };
function distFor(visW, visH, fill, fov){
  const g = level ? level.geo : { extX: 10, extY: 10 }, tan = Math.tan(fov * D2R / 2);
  const ppu = Math.min(fill * visW / (2 * (g.extX + .3)), fill * visH / (2 * (g.extY + .3)));
  return innerHeight / (2 * tan * ppu);
}
function fitAll(){
  const w = innerWidth, h = innerHeight, portrait = w < h;
  const d = distFor(w, h - (portrait ? 150 : 40), portrait ? .97 : .9, topPose.fov) + WALL_H;
  topPose.pos.set(0, d, 0); _m.lookAt(topPose.pos, _v.set(0, 0, 0), NEG_Z); topPose.q.setFromRotationMatrix(_m);
  const B = layoutBands(), visH = Math.max(150, h - B.top - B.bottom);
  homePose.dist = distFor(Math.min(w, 760), visH, .95, homePose.fov) * 1.12;
  lay.homeOffY = h / 2 - (B.top + visH / 2);
  scene.fog.near = Math.max(d, homePose.dist) + 12; scene.fog.far = scene.fog.near + 90;
}
let orbitA = .5;
function updateCamera(dt){
  const h = st.heading, fx = Math.cos(h), fz = -Math.sin(h);
  ball.getWorldPosition(_bw);
  const pk = camera.aspect < 1 ? 1.45 : 1;
  const tp = _v.set(_bw.x - fx * 2.9 * pk, Math.max(_bw.y, -1) + 1.85 * pk, _bw.z - fz * 2.9 * pk);
  const tl = _v2.set(_bw.x + fx * 2.6, _bw.y - .1, _bw.z + fz * 2.6);
  if (!chase.init){ chase.pos.copy(tp); chase.look.copy(tl); chase.init = true; }
  else { const k = 1 - Math.exp(-dt * 6); chase.pos.lerp(tp, k); chase.look.lerp(tl, k); }
  _m.lookAt(chase.pos, chase.look, UP); chasePose.q.setFromRotationMatrix(_m);
  orbitA += dt * (save.reduceMotion ? 0 : .05);
  const md = homePose.dist;
  homePose.pos.set(Math.sin(orbitA) * md * .5, md * .86, Math.cos(orbitA) * md * .5);
  _m.lookAt(homePose.pos, _v.set(0, -.6, 0), UP); homePose.q.setFromRotationMatrix(_m);
  const ease = t => t * t * (3 - 2 * t);
  const vt = save.view === 'eye' ? 1 : 0, rm = save.reduceMotion ? 3 : 1;
  viewT += (vt - viewT) * (1 - Math.exp(-dt * 3.6 * rm)); if (Math.abs(vt - viewT) < 1e-4) viewT = vt;
  const ht = st.mode === 'home' ? 1 : 0;
  homeT += (ht - homeT) * (1 - Math.exp(-dt * 2.8)); if (Math.abs(ht - homeT) < 1e-4) homeT = ht;
  const e1 = ease(viewT), e2 = ease(homeT);
  _pp.lerpVectors(topPose.pos, chase.pos, e1); _pq.slerpQuaternions(topPose.q, chasePose.q, e1);
  camera.position.lerpVectors(_pp, homePose.pos, e2);
  camera.quaternion.slerpQuaternions(_pq, homePose.q, e2);
  camera.fov = (topPose.fov + (chasePose.fov - topPose.fov) * e1) * (1 - e2) + homePose.fov * e2 + camFx.fov * e1 * (1 - e2);
  // a little shake on hard bumps (Chakrvroom), never with reduced motion
  camFx.shake = Math.max(0, camFx.shake - dt * 2.5);
  if (camFx.shake > 0 && !save.reduceMotion){ const s = camFx.shake * camFx.shake * .12; camera.position.x += (Math.random() - .5) * s; camera.position.y += (Math.random() - .5) * s; camera.position.z += (Math.random() - .5) * s; }
  lay.curOffY += (lay.homeOffY * e2 - lay.curOffY) * (1 - Math.exp(-dt * 6));
  if (Math.abs(lay.curOffY) > .5) camera.setViewOffset(innerWidth, innerHeight, 0, lay.curOffY, innerWidth, innerHeight);
  else if (camera.view && camera.view.enabled) camera.clearViewOffset();
  const cd = camera.position.length(), R = (level ? Math.max(level.geo.extX, level.geo.extY) : 10) + 3;
  camera.near = Math.max(.05, (cd - R) * .75); camera.far = cd + R + 30;
  camera.updateProjectionMatrix();
}

/* =====================================================================
   ENGINE 13 · ADAPTIVE PERFORMANCE, only ever steps down, never flips shadows mid-game
   ===================================================================== */
function setShadows(on){
  if (renderer.shadowMap.enabled === on) return;
  renderer.shadowMap.enabled = on;
  scene.traverse(o => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.needsUpdate = true); });
}
function setQuality(p){
  const rebuild = p.tex !== Q.tex || p.arc !== Q.arc || p.ao !== Q.ao;
  Q = Object.assign({}, p);
  renderer.setPixelRatio(Q.pr); resize();
  sun.shadow.mapSize.set(Q.sm, Q.sm); if (sun.shadow.map){ sun.shadow.map.dispose(); sun.shadow.map = null; }
  setShadows(Q.shadows);
  if (rebuild){ curBoard = null; rebuildLevel(); }
}
const perf = { acc: 0, n: 0, steps: 0 };
function governor(dt){
  if (save.quality !== 'auto' || perf.steps >= 3) return;
  perf.acc += dt; perf.n++;
  if (perf.acc < 3) return;
  const avg = perf.acc / perf.n; perf.acc = 0; perf.n = 0;
  if (avg > 1 / 40){
    if (Q.pr > .85){ Q.pr = Math.max(.8, +(Q.pr * .85).toFixed(2)); renderer.setPixelRatio(Q.pr); resize(); perf.steps++; }
    else if (Q.shadows && st.mode === 'home'){ Q.shadows = false; setShadows(false); perf.steps++; }
  }
}

/* =====================================================================
   ENGINE 14 · MAIN LOOP
   ===================================================================== */
function resize(){
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight; chasePose.fov = camera.aspect < 1 ? 70 : 62;
  fitAll();
}
addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => { if (audio.ctx){ document.hidden ? audio.ctx.suspend() : audio.ctx.resume(); } });
const _quat = new THREE.Quaternion(), _axis = new THREE.Vector3();
let last = performance.now(), clock = 0;
// moving parts of a level: orbiting posts, singing-post glow, the river's leaves, gusts of wind
function tickWorld(dt){
  const T = st.mode === 'home' ? clock : st.time;
  const O = level.orbit;
  if (O){ O.a = O.w * T; if (O.grp) O.grp.rotation.y = O.a;
    for (const P of level.posts){ const a = P.ang0 + O.a; P.x = Math.cos(a) * P.rad; P.y = Math.sin(a) * P.rad; P.vx = -O.w * P.y; P.vy = O.w * P.x; } }
  for (const P of level.posts) if (P.glow > 0 && P.mat){ P.glow = Math.max(0, P.glow - dt * 1.4); P.mat.emissiveIntensity = P.glow * .9; }
  const Cu = level.current;
  if (Cu && Cu.leaves){
    const g = level.geo, y0 = (Cu.low ? -level.tier.D : 0) + .035, sgn = Cu.flow * Cu.dir;
    for (const Lf of Cu.leaves){
      Lf.u += sgn * Lf.sp * dt; if (Lf.u > Cu.L) Lf.u -= Cu.L; if (Lf.u < 0) Lf.u += Cu.L;
      const a = Cu.e + Cu.dir * Lf.u, q = g.pt(Lf.r, a), s = clamp(Math.min(Lf.u, Cu.L - Lf.u) / .2, 0, 1);
      Lf.m.position.set(q[0], y0 + Math.sin(T * 2 + Lf.ph) * .01, -q[1]); Lf.m.rotation.y = Lf.ph + T * Lf.spin; Lf.m.scale.setScalar(.25 + .75 * s);
    }
  }
  const W = level.wind;
  if (W){
    const n = Math.floor((T + W.off) / W.period), ph = (T + W.off) - n * W.period, on = st.mode === 'play' || st.mode === 'home';
    if (n !== W.n){ W.n = n; const a = mulberry32(W.seed + n * 97)() * TAU; W.x = Math.cos(a); W.y = Math.sin(a); W.cued = false; }
    if (ph > W.period - .7 && !W.cued){ W.cued = true; if (st.mode === 'play') sfxWind(W.dur + .9); }
    const live = on && ph < W.dur, e = live ? Math.pow(Math.sin(Math.PI * ph / W.dur), 2) : 0;
    W.k = e * W.str;
    if (W.feathers) W.feathers.forEach((F, i) => {
      const f = ph / W.dur, R = level.geo.boardA + 2, side = (i / W.feathers.length - .5) * 2 * R * .8;
      F.visible = live && W.k > .05;
      if (!F.visible) return;
      const along = -R + (f + F.userData.lag) * 2 * R * .9, px = W.x * along - W.y * side, py = W.y * along + W.x * side;
      F.position.set(px, .9 + F.userData.h + Math.sin(T * 6 + i) * .08, -py); F.rotation.set(Math.sin(T * 4 + i) * .5, -Math.atan2(W.y, W.x), Math.cos(T * 3 + i) * .4);
    });
  }
}
function frame(now){
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (!st.paused){ governor(dt); tick(dt); }
  updateCamera(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
// one step of the game, without drawing (tests drive this directly, faster than real time)
function tick(dt){
  clock += dt;
  let ix = 0, iy = 0, rate = 4;
  if (st.mode === 'play') [ix, iy, rate] = viewInput();
  else if (st.mode === 'home'){ ix = .05 * Math.sin(clock * .6); iy = .05 * Math.cos(clock * .45); rate = 1.6; }
  let bx = ix, by = iy;
  if (save.view === 'eye' && st.mode === 'play'){ const c = Math.cos(st.heading), s = Math.sin(st.heading); bx = iy * c + ix * s; by = iy * s - ix * c; }
  const k = 1 - Math.exp(-dt * rate);
  st.tx += (bx - st.tx) * k; st.ty += (by - st.ty) * k;
  board.rotation.set(-st.ty, 0, -st.tx);
  if (level.spin){ level.spin.a = level.spin.w * (st.mode === 'home' ? clock : st.time); spinGroup.rotation.y = level.spin.a; }
  tickGates(dt); tickWorld(dt);

  const px = st.x, py = st.y; st.impact = 0;
  if (st.mode === 'play' || st.mode === 'home'){
    const play = st.mode === 'play';
    if (play) st.time += dt;
    const N = Math.hypot(st.vx, st.vy) > 30 ? 10 : 7, h = dt / N;
    for (let i = 0; i < N && (st.mode === 'play' || st.mode === 'home'); i++) physicsStep(h, play);
    if (play){
      if (st.impact > 2){ tock(st.impact); if (st.impact > 12) vib(Math.min(14, st.impact | 0)); }
      const sp = Math.hypot(st.vx, st.vy); setRoll(sp, level.rollK);
      if (sp > 2){ const dh = wrapA(Math.atan2(st.vy, st.vx) - st.heading); st.heading = wrapA(st.heading + dh * (1 - Math.exp(-dt * 3 * Math.min(1, (sp - 2) / 6)))); }
      if (st.mode === 'play' && !level.noCheckpoints) checkCheckpoint();
    }
  } else if (st.mode === 'drop'){
    const fz = floorY() + BALL_R;
    st.vz -= DROP_G * dt; st.z += st.vz * dt;
    if (st.z <= fz){ st.z = fz; if (st.vz < -Math.max(2.5, DROP_G * dt * 1.6) && (st.bounces = (st.bounces || 0) + 1) < 5){ tock(-st.vz * .8); st.vz = -st.vz * Math.max(.2, BP.rest); } else { st.vz = 0; st.bounces = 0; st.mode = 'play'; } }
  } else if (st.mode === 'fall'){
    const H = st.hole; st.fallT += dt;
    st.vz -= DROP_G * .5 * dt; st.z += st.vz * dt;
    const kk = 1 - Math.exp(-dt * 14); st.x += (H.x - st.x) * kk; st.y += (H.y - st.y) * kk;
    setRoll(0);
    if (st.z < floorY() - .55){ st.z = floorY() - .55; if (H.goal) win(); else if (st.fallT > .55){ resetBall('drop'); onTrapReset(); } }
  }
  checkGong(dt);
  if (level.cfg.seal){ const tgt = st.open ? 1 : 0; if (st.sealT !== tgt){ st.sealT = clamp(st.sealT + (tgt ? dt * .8 : -dt * 3), 0, 1); setSeal(st.sealT); } }
  onFrame(dt);
  const mx = st.x - px, my = st.y - py, dist = Math.hypot(mx, my);
  if (dist > 1e-6 && dist < 3){ _axis.set(-my, 0, -mx).normalize(); _quat.setFromAxisAngle(_axis, dist / BALL_R); ball.quaternion.premultiply(_quat); }
  ball.position.set(st.x, st.z, -st.y);
  const fy = floorY();
  contact.position.set(st.x, fy + .02, -st.y);
  const cz = clamp(1 - (st.z - fy - BALL_R) / 2.5, 0, 1);
  contact.visible = st.z > fy - .1; contactMat.opacity = cz * (renderer.shadowMap.enabled ? .45 : .85); contact.scale.setScalar(.85 + (1 - cz) * .7);
}
