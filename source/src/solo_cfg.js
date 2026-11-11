/* =====================================================================
   CHAKRVIEW · SAVE DATA, progress, best times, petals and preferences. Nothing is ever scored.
   ===================================================================== */
const EXT = 16.5;
const SAVE_KEY = 'chakrview.v4';
const save = Object.assign({
  ball: 'kancha', view: 'top', quality: 'auto', sound: true, sfxVol: 1, music: true, musicVol: .7, beats: true, haptics: true, sens: 1, invert: false,
  showTimer: true, reduceMotion: false, control: null, controlChosen: false, mode: 'journey',
  done: [], best: {}, petal: {}, xp: {}, egg: false, tips: {}, tut: false, relaxN: 0
}, (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch(e){ return {}; } })());
if (save.view !== 'eye') save.view = 'top';
if (save.mode !== 'relax') save.mode = 'journey';
['best', 'petal', 'xp', 'tips'].forEach(k => { if (!save[k] || typeof save[k] !== 'object') save[k] = {}; });
if (!Array.isArray(save.done)) save.done = [];
let ahamOn = false;   // playtest mode: nothing is written while it's on
function persist(){ if (ahamOn) return; try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch(e){} }
