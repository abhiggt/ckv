/* =====================================================================
   ENGINE 15 · MUSIC, its own bus, separate from the sound effects. Only low sine waves and sub-bass:
   a deep drone, a slow breathing pad, now and then a soft low note, and binaural beats
   (a slightly different low tone in each ear, heard as a slow pulse, best with headphones).
   Each world sits a little higher than the last, and the pulse slows as you travel inward.
   Chakrvroom: a low, driving groove (sine kick, sub bass, a soft shaker) that lifts on the final lap.
   Everything passes through a low-pass filter, so nothing is ever sharp.
   ===================================================================== */
const BEATS = [10, 9, 8, 7, 6, 5.2, 4.5];                       // the binaural pulse per world, Hz
const PENTA = [1, 9 / 8, 5 / 4, 3 / 2, 5 / 3, 2];               // Sa Re Ga Pa Dha Sa'
const MUS = { out: null, kind: 'calm', sa: 98, beat: 10, next: 0, noteT: 0, chordT: 0, chord: 0, step: 0, lvl: 1, timer: 0, wanted: null };
const musVol = () => save.music ? .9 * (save.musicVol == null ? .7 : save.musicVol) : 0;
const worldSa = w => 98 * Math.pow(2, w * 7 / 12 / 6);           // rises gently by a fifth across the seven worlds
function musicInit(){
  const ac = audio.ctx; if (!ac || MUS.out) return;
  MUS.out = ac.createGain(); MUS.out.gain.value = 0;
  MUS.lp = ac.createBiquadFilter(); MUS.lp.type = 'lowpass'; MUS.lp.frequency.value = 900; MUS.lp.Q.value = .4;
  MUS.out.connect(MUS.lp); MUS.lp.connect(ac.destination);
  MUS.rev = ac.createConvolver(); MUS.rev.buffer = impulse(ac, 4, 2.6);
  const wet = ac.createGain(); wet.gain.value = .4; MUS.rev.connect(wet); wet.connect(MUS.out);
  MUS.bus = ac.createGain(); MUS.bus.connect(MUS.out);
  MUS.send = ac.createGain(); MUS.send.gain.value = .6; MUS.bus.connect(MUS.send); MUS.send.connect(MUS.rev);
  // binaural pair, hard left and hard right, on a low carrier
  const mg = ac.createChannelMerger(2); MUS.bin = ac.createGain(); MUS.bin.gain.value = 0; mg.connect(MUS.bin); MUS.bin.connect(MUS.out);
  MUS.oL = ac.createOscillator(); MUS.oR = ac.createOscillator();
  MUS.oL.frequency.value = MUS.sa; MUS.oR.frequency.value = MUS.sa + MUS.beat;
  MUS.oL.connect(mg, 0, 0); MUS.oR.connect(mg, 0, 1); MUS.oL.start(); MUS.oR.start();
  // the drone: a sub at Sa/2, Sa itself, and a quiet fifth that slowly changes to a fourth and back
  MUS.pad = ac.createGain(); MUS.pad.gain.value = 0; MUS.pad.connect(MUS.bus);
  MUS.padO = [[.5, .55], [1, .38], [1.5, .16], [2, .05]].map(([r, v]) => {
    const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = MUS.sa * r; g.gain.value = v; o.connect(g); g.connect(MUS.pad); o.start(); return { o, r, g };
  });
  const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 1 / 13; lg.gain.value = .018; lfo.connect(lg); lg.connect(MUS.pad.gain); lfo.start();
  // a little noise for the groove's shaker
  const len = ac.sampleRate, nb = ac.createBuffer(1, len, ac.sampleRate), d = nb.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  MUS.white = nb;
  MUS.next = ac.currentTime + .3; MUS.noteT = ac.currentTime + 5; MUS.chordT = ac.currentTime + 16;
  MUS.timer = setInterval(musicTick, 110);
  musicApply(true);
  if (MUS.wanted) musicMood(MUS.wanted);
}
// what the music should be: { kind: 'calm' | 'race', w (world 0–6), lvl (race intensity 0–2), sa }
function musicMood(m){
  MUS.wanted = Object.assign({}, MUS.wanted || {}, m);
  if (!MUS.out) return;
  const t = audio.ctx.currentTime, W = MUS.wanted;
  MUS.kind = W.kind || 'calm'; MUS.lvl = W.lvl == null ? 1 : W.lvl;
  if (MUS.kind === 'calm'){
    const w = clamp(W.w == null ? 0 : W.w, 0, 6);
    MUS.sa = worldSa(w); MUS.beat = BEATS[w];
  } else MUS.sa = W.sa || 55;
  MUS.oL.frequency.setTargetAtTime(MUS.sa, t, 1.5); MUS.oR.frequency.setTargetAtTime(MUS.sa + MUS.beat, t, 1.5);
  MUS.padO.forEach(p => p.o.frequency.setTargetAtTime(MUS.sa * (MUS.kind === 'calm' ? 1 : 2) * p.r, t, 1.5));
  musicApply();
}
function musicApply(now){
  if (!MUS.out) return;
  const t = audio.ctx.currentTime, tc = now ? .02 : .8, calm = MUS.kind === 'calm', W = MUS.wanted || {};
  MUS.out.gain.setTargetAtTime(musVol(), t, tc);
  MUS.bin.gain.setTargetAtTime(calm && save.beats !== false && !W.noBeats ? .1 : 0, t, tc * 2);
  MUS.pad.gain.setTargetAtTime(calm ? .1 : (MUS.lvl ? .02 : .05), t, tc * 2);
  MUS.lp.frequency.setTargetAtTime(calm ? 900 : 2400, t, .5);
}
function softNote(f, t, vol, dur){   // a low sine that swells in and fades out, no attack, nothing sharp
  const ac = audio.ctx, o = ac.createOscillator(), g = ac.createGain();
  o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * .3); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(MUS.bus); o.start(t); o.stop(t + dur + .05);
}
function hit(t, kind, vol){   // groove voices
  const ac = audio.ctx, g = ac.createGain(); g.connect(MUS.bus);
  if (kind === 'kick'){ const o = ac.createOscillator(); o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(40, t + .16);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .36); o.connect(g); o.start(t); o.stop(t + .4); return; }
  if (kind === 'bayan'){ const o = ac.createOscillator(); o.frequency.setValueAtTime(70, t); o.frequency.exponentialRampToValueAtTime(120, t + .25);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .5); o.connect(g); o.start(t); o.stop(t + .55); return; }
  const s = ac.createBufferSource(), f = ac.createBiquadFilter(); s.buffer = MUS.white;
  if (kind === 'shaker'){ f.type = 'bandpass'; f.frequency.value = 2200; f.Q.value = 1.2; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .06); }
  else { f.type = 'lowpass'; f.frequency.value = 500; g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + .18); }   // a soft thud on 2 and 4
  s.connect(f); f.connect(g); s.start(t, Math.random() * .5); s.stop(t + .22);
}
function bass(f, t, dur, vol){
  const ac = audio.ctx, o = ac.createOscillator(), g = ac.createGain();
  o.frequency.value = f; g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .015); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(MUS.bus); o.start(t); o.stop(t + dur + .05);
}
const BASSLINE = [0, null, 0, 12, null, 0, null, 3, 0, null, 0, 12, null, 7, null, 5];
function musicTick(){
  const ac = audio.ctx; if (!ac || ac.state !== 'running' || !MUS.out) return;
  const ahead = ac.currentTime + .45;
  if (MUS.next < ac.currentTime - .5) MUS.next = ac.currentTime + .05;
  if (!musVol()){ MUS.next = ahead; MUS.noteT = Math.max(MUS.noteT, ahead); return; }
  if (MUS.kind === 'calm'){
    MUS.next = ahead;
    // every 16 s the fifth leans to a fourth and back, slow movement, no beat
    if (MUS.chordT < ahead){ MUS.chord ^= 1; const p = MUS.padO[2]; p.o.frequency.setTargetAtTime(MUS.sa * (MUS.chord ? 4 / 3 : 1.5), MUS.chordT, 3); MUS.chordT += 16; }
    if (MUS.noteT < ahead){
      const r = PENTA[(Math.random() * PENTA.length) | 0];
      softNote(MUS.sa * r, MUS.noteT, .05, 7); if (Math.random() < .35) softNote(MUS.sa * .5 * PENTA[(Math.random() * 4) | 0], MUS.noteT + 2.5, .06, 8);
      MUS.noteT += 7 + Math.random() * 6;
    }
  } else {
    const sp = 60 / 112 / 4, L = MUS.lvl;
    while (MUS.next < ahead){
      const t = MUS.next, s = MUS.step % 16, bar = (MUS.step >> 4) % 4;
      if (L === 0){ if (s === 0 || s === 10) hit(t, 'kick', .3); if (s % 4 === 2) hit(t, 'shaker', .02); }
      else {
        if (s === 0 || s === 8 || s === 10 || (L > 1 && (s === 4 || s === 12))) hit(t, 'kick', .5);
        if (s === 4 || s === 12) hit(t, 'thud', .12);
        if (L > 1 || s % 2 === 0) hit(t, 'shaker', s % 4 === 2 ? .028 : .016);
        if (s === 14 || (bar === 3 && s === 6)) hit(t, 'bayan', .32);
      }
      const n = BASSLINE[s]; if (n != null && L > 0) bass(MUS.sa * 2 * Math.pow(2, (n + (bar === 2 ? 5 : bar === 3 ? 3 : 0)) / 12), t, sp * 1.8, L > 1 ? .12 : .1);
      MUS.step++; MUS.next += sp;
    }
  }
}
addEventListener('pointerdown', () => setTimeout(musicInit, 0), { capture: true });
addEventListener('keydown', () => setTimeout(musicInit, 0), { capture: true });
