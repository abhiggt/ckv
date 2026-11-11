# Chakrview: prompt for scaling

This file is for you, or an AI assistant, when you want to grow **Chakrview** and **Chakrvroom**. It covers how the games are built, where everything lives, the rules to keep, and ready-to-paste prompts.

---

## 1. What the games are

**Chakrview (`docs/index.html`)** is a calm tilt-maze. The marble travels inward through seven chakras of eight levels each, 56 in total.

What it is not:
- not a coin, score or points collector;
- not a gallery of Indian art;
- not about flexing fast clears.

Times are kept quietly. They only earn a petal; nothing is ranked.

**Modes** (home switch `#mSeg`, saved as `save.mode`):
- **Journey:** the 56 levels in order. The timer shows elapsed time, or a countdown on levels with a limit. The best time is saved per level (`save.best[i]`). Arriving within the level's *flow time* earns a lotus petal (`save.petal[i]`).
- **Relax:** endless mazes from `relaxDef(n)`, using the shapes and boards of the chakras already opened. No traps, no gong, no limit. `save.relaxN` remembers where you are, and each maze drops straight into the next.

**The mani:** a faceted blue jewel inside the Kancha marble (`ballCore()` / `setMani(p, glow)` in engine_b.js).
- **Colour** comes from `p` (levels done ÷ 56), from pale `#e4edf6` to sapphire `#1f4fb8`.
- **Glow** comes from petals ÷ 56.
- **UI:** `gemSVG(p)` draws it in the levels sheet, the HUD (Relax) and the ending card.
- **Ending (level 56):** "The mani was always inside you. It never came out, because you had never taken the journey. Now you have."

**Discovery first.** Nothing about chakras, elements or the mani is explained up front.
- **Before completing a world:** it shows only its petal glyph and "Levels 9 to 16".
- **On completion:** the card names the element and the Sanskrit name together ("Water · Svadhisthana").
- **The jewel:** it is called "something inside the glass" until three worlds are done (`MANI_LINES`).
- **Full reveal:** the ending card ("Seven chakras, open").

Elements are felt, not labelled. The table below is internal.

| # | Element (Chakra, internal) | Board | Thematic feature (cfg flag), kept gentle so it never breaks flow |
|---|---|---|---|
| 1 | Earth (Muladhara) | Circle | bars, posts, turning ring, pockets, holes, gong |
| 2 | Water (Svadhisthana) | Hexagon | `current`: a river along one ring (1 with you, −1 against), painted into the floor with drifting marigolds |
| 3 | Fire (Manipura) | Octagon | ember-glowing holes; `orbit`: posts circling the centre |
| 4 | Air (Anahata) | Two-level circle | the step down; `wind`: gusts with a whoosh and feathers; time limit from level 31 |
| 5 | Sound (Vishuddha) | Two-level hexagon | `sing`: posts play a pentatonic note when hit |
| 6 | Light (Ajna) | Square Yantra | timed doors (`gates`), orbiting posts |
| 7 | Silence (Sahasrara) | Lotus | all of the above, gently |

Each chakra entry in `CHAKRAS` carries:
- `line`: the chapter card, a neutral line shown when the world begins;
- `open`: the line shown when the world is completed.

Win lines are shared (`WIN_LINES`), and element names live in `ELEMENTS`.

**Chakrvroom (`docs/duel.html`)** races up to four marbles.

Six tracks (`TRACKS`), ranked from easiest to hardest:

| # | Track | Meaning |
|---|---|---|
| 1 | Krodh | Anger |
| 2 | Irshya | Envy |
| 3 | Kaam | Desire |
| 4 | Lobh | Greed |
| 5 | Moh | Attachment |
| 6 | Ahankar | Ego, the hardest |

Each track sets `holes`, `posts`, `traps`, `decoy` and `fg`.

Quick-race rivals (`BOTS`) are named after the senses. Each has its own speed `v` (5.2 to 5.9, plus 4.5% per track), `corner` slowdown, `wob` and `slip`. They start late, slip now and then, and slow down and get briefly lost in the maze. The race ends when every rival is in; if you are not, a 'You lost' card asks whether to complete your journey.
- Jhatka (touch);
- Nazar (sight);
- Chaska (taste);
- Shor (sound);
- Dhuan (smell).

Race feel:
- F1-style lights;
- a driving groove that lifts on the final lap;
- a speed hum;
- lap toasts and lap times;
- overtake cues (`cue()`);
- camera shake on bumps and an FOV kick in Path view;
- fastest lap and best lap per track (`save.bestLap`).

---

## 2. Repository layout

```
README.md               the game's page on GitHub (for players)
prompt_for_scaling.md   this file
media/mark.png          the logomark
docs/                   THE WEBSITE (GitHub Pages serves this folder)
  index.html            Chakrview (built)
  duel.html             Chakrvroom (built)
  manifest.webmanifest, sw.js, icons/, .nojekyll
source/
  build.py              python3 build.py  →  writes ../docs/index.html and ../docs/duel.html
  three.min.js          three.js r159 (inlined)
  fonts.css             Sora 600 + Manrope 500/600/700, base64 woff2
  src/
    base.css            shared styles: tokens, sheets, HUD, Sky/Path switch, pause, tutorial, chapter card
    engine_a.js         constants, shapes, quality tiers, renderer, light
    _art.js             procedural crafts (wood/marble/neel/bidri shaders, folk-art painters)
    engine_a2.js        board library BOARDS, variants, soften(), materials, floor compositing, marble looks
    engine_b.js         maze geometry, level generator (+ orbit/current/wind/sing), meshes, river painter, the mani
    engine_c.js         sound effects, physics (rivers, wind, moving posts), input, cameras, tickWorld, tick()/frame()
    music.js            music bus: tanpura, shruti pad, bells, binaural beats; Chakrvroom's race groove
    logo.js             the logomark (morepankh rings)
    solo_cfg.js / solo_page.html / solo_ui.js     Chakrview
    vroom_cfg.js / vroom_page.html / vroom_ui.js  Chakrvroom
    mqtt.js             tiny MQTT-over-WebSocket client for rooms
```

**Workflow:**
1. Edit `source/src/`.
2. Run `python3 build.py`.
3. Bump `VERSION` in `docs/sw.js`.
4. Commit and push.

**Never hand-edit `docs/*.html`.**

---

## 3. Content formats

**A level** is one entry in `PLAN[world][j]` (solo_ui.js):
```js
{ nG: 5, traps: true, decoy: .8, fg: 2, posts: true, orbit: .5, sing: true, current: 1, wind: 12,
  gates: 2, spin: .22, seal: true, limit: true, intro: 'river' }
```

| Key | Meaning |
|---|---|
| `nG` | rings (2–5) |
| `decoy` / `fg` | dead-end chance / false openings |
| `traps` | holes |
| `posts` | six brass posts round the centre |
| `orbit` | posts circle the centre at this speed (rad/s) |
| `sing` | posts ring a pentatonic note when hit |
| `current` | river: 1 with you, −1 against |
| `wind` | gust strength (≈12) |
| `spin` | turning ring, round boards only |
| `gates` | timed doors |
| `seal` | lotus plus gong |
| `limit` | time limit |
| `intro` | key into `FEATURES`, shown once as a hint |

Thematic extras draw from their own random stream (`seed + 4242`), so adding them never changes a level's maze.

**Times:**
- **`levelLimit(lv)`:** `par × 1.85 + gates × 3 + posts × 3 + spin × 12 + 10`.
- **`flowTime(lv)`:** path length ÷ 5, plus per-feature allowances. It was calibrated against an autopilot run and sits at about 1.8–2× a near-perfect run.

**Music, low sine waves and sub-bass only:**
- Everything runs through a 900 Hz low-pass.
- **`musicMood({ kind: 'calm', w })`:** Sa = `worldSa(w)`, rising from 98 Hz by a fifth across the seven worlds.
  - A sub-bass drone sits at Sa/2, with Sa and a fifth that leans to a fourth every 16 s.
  - A soft low note swells in now and then.
  - The binaural pair is carried on Sa, with the beat from `BEATS[w]`: 10 Hz down to 4.5 Hz.
- **`musicMood({ kind: 'race', lvl })`:** 0 is the lobby, 1 the race, 2 the final lap.
- **Volume:** the music bus (`MUS.out`) is separate from effects (`audio.sfx`). Volumes come from `save.musicVol` / `save.sfxVol`, and binaural beats can be switched off with `save.beats`.

**A Chakrvroom track:**
```js
{ name: 'Moh', en: 'Attachment', shape, board, turf, tint, holes, posts, traps, decoy, fg, line }
```
If the bots can't find a route, `loadTrack()` first re-arranges the holes and posts, keeping the same counts. Only then does it ease off. This is deterministic, so every phone gets the same track.

---

## 4. Rooms (Chakrvroom multiplayer)

**Transport:**
- MQTT 3.1.1 over secure WebSocket, QoS 0.
- Public brokers are raced: EMQX, HiveMQ and test.mosquitto.org.

**Codes:**
- Always four characters, A–Z and 0–9. The default is random; the player may type their own.
- **Checking a code is free:** the host connects to every broker, publishes `probe` and listens for 1.3 s.
- An existing host answers `taken`, and any `roster` also counts. Either one stops the new room ("ABHI is in use right now").

**Topic:** `chakrvroom/v1/<CODE>`. Messages:
- `hi`: join and heartbeat;
- `roster`: from the host;
- `ping` / `pong`: clock sync, keeping the minimum round trip;
- `go`;
- `p`: about 12 per second;
- `fin`;
- `res`;
- `bye`: also the last will;
- `probe` / `taken`.

**Fairness:** each phone simulates its own marble, and bumps move only your own. The host orders results from everyone's own times.

**Pause:** a quick race pauses fully, with the clock shifted on resume. Online, the menu opens but the race continues.

**Local testing:** run an MQTT broker with WebSocket support (e.g. `aedes` + `websocket-stream`) and open `duel.html?broker=ws://localhost:8888`. A 4-player test passed: custom code, second host refused, join, race, positions, results and a leaver.

---

## 5. Phone tilt

- **Always listening:** `deviceorientation` / `devicemotion`.
- **iPhone:** asks for permission on the first tap.
- **Brave:** blocks sensors, so the game switches to Touch with a one-line note.
- **Settings:**
  - **Controls:** Tilt / Touch;
  - **Sensitivity;**
  - **Invert tilt;**
  - **Re-level:** the HUD ◎ button or the pause menu.

---

## 6. Hypercasual basics (keep them)

**Play-screen layout,** built for small phones and browser bars, with safe-area insets:
- top left: pause;
- top centre: time (or place) with the level name under it;
- top right: Sky / Path, two quiet icons;
- bottom left: music on/off;
- bottom right: tilt ↔ drag.

Hints float above the bottom buttons.

- **First-launch tutorial** (`TUT`): four cards, replayable from Settings.
- **Pause menu:**
  - Resume, Restart, Settings, Home/Leave;
  - quick toggles for music, sound, vibration and re-level.
- **Auto-pause:** when the app is hidden.
- **Keys:** `P` / `Esc` pause, `V` switches view, `R` restarts.
- **Settings, grouped:**
  - **Play:** controls, sensitivity, invert, view, show timer;
  - **Sound:** music + volume, binaural beats, effects + volume, vibration;
  - **Display:** graphics, reduce motion;
  - **More:** how to play, install, reset progress (tap twice).
- **Sky / Path view switch:** a two-part control with the active view lit.
- **Phone app:** keeps the screen awake while playing, installs as an app, plays offline.

---

### Aham: the playtest mode (hidden)

**To start:** tap the Chakrview logo on the home screen four times, with less than a second between taps.

**For 30 minutes** (`AHAM_MS`):
- every level is open;
- the marble rolls through walls, doors, posts and turning rings, but stays on the board (`st.ghost` in `physicsStep`);
- it rolls over holes without falling in;
- sealed lotuses start open;
- time limits never restart.

**Nothing is saved:** `persist()` does nothing while `ahamOn` is true. When the mode ends, `save` is restored from a snapshot taken at the start. That happens on the timer, on a tap of the pill, or on a reload.

**While it's on,** a pill shows the time left.

**Restarting:** four taps start a fresh 30 minutes. It is not listed in the README or changelog on purpose.

## 7. Guard rails

**Calm:**
- no coins, stars, points or leaderboards;
- failure is gentle (back one ring, or the level begins again);
- petals are a quiet perk, never a score.

**Copy:**
- No em dashes on screen.
- Discovery first: never name chakras, elements or the mani before the player earns it.
- Level names are short and sayable.
- One line per new idea.

**Look:**
- no rounded typefaces;
- Sora for titles, Manrope for everything else;
- earthy, then muted blue, then dark violet.

**Logo:** the morepankh mark; the wordmark appears only inside the games.

**Rendering:**
- Paint flat things into `composeFloor()` (see `paintRiver`), never as transparent overlays.
- No shadow maps on phones.

**Seeds are content:** add cfg flags, and give new features their own random stream.

**After touching levels,** run the autopilot (below). All 56 must say `WON`.

---

## 8. Testing

- **Headless:** the engine exposes `tick(dt)`, so tests can run physics faster than real time. `window.__inp` lets a test steer.
- **The autopilot:**
  - plans a route on a grid: BFS, then string-pulling;
  - steers with tilt;
  - reports each level's time against its flow time and limit.

  Run it on all 56 levels and a sample of Relax mazes.
- **Quick reachability check:** `__ckv.LEVELS.forEach((_, i) => { __ckv.setTarget(i, true); console.log(i + 1, __ckv.level.reachable(0, 0)); })`.

---

## 9. Ready-to-paste prompts

1. **A new thematic feature:** "Add a cfg flag `lamps` for the Fire chakra: diyas at dead ends that light as the marble passes. Use their own random stream. Paint the soot ring into the floor with a `level.paint` hook. Run the autopilot."
2. **Daily maze in Relax:** "Add a 'Today' maze to Relax, seeded from the date, with the best time saved per day."
3. **Private, reliable rooms:** "Put my HiveMQ Cloud URL, username and password at the top of mqtt.js. Send them in CONNECT. Keep the public brokers as fallbacks."
4. **Share card:** "When a chakra opens, offer Share: render the board from above with the level name, the chakra glyph and the mani, and share it as a PNG."
5. **Bots in rooms:** "Let the host fill empty slots with sense rivals, simulated on the host and broadcast as normal `p` messages."

---

## 10. Versions and the changelog

- **Version numbers:** `APP_VERSION` in engine_a.js; Settings shows it.
- **Release notes:** `RELEASES` in solo_ui.js and vroom_ui.js feed the What's new sheet. `CHANGELOG.md` holds the same notes.
- **Each release:**
  1. Bump all three together.
  2. Set `VERSION` in `docs/sw.js` to match.
  3. Tag the commit `v<version>`.

## 11. Deploying

- **GitHub Pages:** Settings → Pages → Deploy from a branch → `main`, `/docs`. Chakrview is then at `https://<user>.github.io/<repo>/` and Chakrvroom at `…/duel.html`.
- **After every update:** bump `VERSION` in `docs/sw.js`; it's currently `chakrview-1.0.0`.
- **Testing:** `?unlock=all` opens every level.
- **Saved progress:** Chakrview saves under `chakrview.v4` and Chakrvroom under `chakrvroom.v1`, per device. New fields merge in, so existing progress is kept.
