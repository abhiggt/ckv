/* =====================================================================
   LOGOMARK, the morepankh: rings falling inward toward one point, like a peacock-feather eye;
   the smallest is the marble. The wordmark (Sora) appears only inside the game.
   ===================================================================== */
let logoN = 0;
function markSVG(opt){
  opt = opt || {};
  const id = 'mb' + (++logoN);
  const stops = opt.race ? '<stop offset="0" stop-color="#ffd9c8"/><stop offset=".3" stop-color="#e5603a"/><stop offset=".8" stop-color="#9e2a14"/><stop offset="1" stop-color="#5a1408"/>'
                         : '<stop offset="0" stop-color="#fff3cf"/><stop offset=".3" stop-color="#e2b75e"/><stop offset=".78" stop-color="#9a6a22"/><stop offset="1" stop-color="#5b3b10"/>';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="${id}" cx=".34" cy=".3" r=".8">${stops}</radialGradient></defs>`
    + `<g fill="none" stroke="currentColor" stroke-width="${opt.w || 6}"><circle cx="50" cy="50" r="44"/><circle cx="41.5" cy="58.5" r="32"/><circle cx="34" cy="66" r="21.4"/></g>`
    + `<circle cx="28" cy="72" r="10.5" fill="${opt.flat || `url(#${id})`}"/></svg>`;
}
function logoHTML(word, size, opt){ return `<span class="logo" style="font-size:${size}px">${markSVG(opt)}<span class="lw">${word}</span></span>`; }
