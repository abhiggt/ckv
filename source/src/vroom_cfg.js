/* =====================================================================
   CHAKRVROOM · SAVE DATA
   ===================================================================== */
const EXT = 17;
const SAVE_KEY = 'chakrvroom.v1';
const save = Object.assign({
  ball: 'kancha', tag: '', view: 'top', quality: 'auto', sound: true, sfxVol: 1, music: true, musicVol: .7, beats: false, haptics: true, sens: 1, invert: false,
  reduceMotion: false, control: null, controlChosen: false, track: 0, laps: 3, tut: false, bestLap: {}
}, (() => { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || {}; } catch(e){ return {}; } })());
if (save.view !== 'eye') save.view = 'top';
if (!save.bestLap || typeof save.bestLap !== 'object') save.bestLap = {};
function persist(){ try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch(e){} }
