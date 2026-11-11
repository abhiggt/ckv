# Chakrview — Prompt for Scaling

Use this file when you (or an AI assistant) want to grow **Chakrview**. It explains how the game is built, where everything lives, and gives ready-to-paste prompts for the most common expansions.

---

## 1. What Chakrview is

Chakrview comes in two versions. Both live in the same folder and share the same engine.

| Version | File | What it is |
|---------|------|-----------|
| **Solo** | `index.html` | A calm tilt-maze for ages 5–55. Tilt a carved board (phone tilt, keyboard or drag) to roll a ball through rings to the centre. It has a 24-level Journey: Circle 1–6, Hexagon 7–16 and Octagon 17–24. |
| **1v1 Duel** | `duel.html` | Two phones race marbles through the same big maze (6 rings), best of 3. You connect with a 4-letter room code, and the phones talk to each other directly. |

**Solo: unique selling points**

1. **A journey through Indian art.** Every Journey level is set on a different craft or folk-art board: Sheesham, Chandan, Akhrot, Makrana, Neel, Bidri, Warli, Madhubani, Kolam, Gond, Kalamkari, Lippan, Pattachitra, Pichwai and Sanjhi. The art is the setting, not homework. Stories about each art form appear only in the optional Gallery.
2. **Two ways to see one maze.** Plan from above (Top view), then drop behind the ball and steer (Chase view).
3. **Tactile mechanics, one at a time.** Bars, brass posts that bounce, turning rings, sand that slows, polished brass that speeds up, dead-end pockets, then holes. Each one gets a single short line on the level that introduces it.
4. **The twist: the gong (from level 6).** A brass lotus closes the centre. A copper temple gong sits somewhere in the maze, usually in a dead end or off the main route. Roll over it: it rings softly, sinks, ripples, and the lotus blooms open. Finding the gong is the puzzle.
5. **Calm by design.** There is no music during levels, no jingles and no "game over". You hear a soft rolling hush, gentle wall taps, a bell when you pass into a new ring, and the gong. Holes only send you back one ring.
6. **Relax mode with music.** Endless mazes with no clock and no holes, plus a very light ambience (an airy pad, a breeze and wind chimes). The ambience plays **only in Relax**.
7. **Daily maze.** One maze a day, the same for everyone, with a streak.
8. **Bet your time.** Bet how many seconds you'll need and stake *kaudi* (cowrie shells). The odds are `1.6 × par ÷ bet`, from ×1.1 to ×5. An empty purse is topped up with 10 kaudi.
9. **Challenge a friend (ghost race).** After any maze, *Challenge a friend* shares a link that carries the maze and your run. Your friend races your translucent ghost ball on the same maze. This needs no server.
10. **Crafted balls.** 12 balls that roll differently. They unlock as you finish levels (2, 4, 6, 9, 12, 15, 18, 22), or you can buy them with kaudi (`30 + unlock × 12`).
11. **Art gallery.** 15 cards that colour in as you finish each art form's levels. Tap a card to read its story.
12. **Feel the floor.** On Android, sand gives soft vibration pulses. iPhones don't allow web vibration.

**Duel: how it works**

- **Rooms.** One player taps **Create room** and gets a code such as `K7QM`, which can be shared as a link (`duel.html#r=K7QM`). The friend taps **Join room** and types the code, or opens the link.
- **Connection.** PeerJS (inlined) uses its free public matchmaking server only for the handshake, plus free STUN/TURN servers. After that, ball positions go straight between the phones about 15 times per second. Both players need the internet only for the first few seconds. Same Wi‑Fi is not required, but it is the most reliable.
- **Race.** Round 1 is a Circle, round 2 a Hexagon and round 3 an Octagon, each 6 rings, with holes, posts, sand and brass. There is a 3-2-1-Go countdown. The host starts its countdown half a round-trip later, so both players start together.
- **Fairness.** Each phone times its own run. The host decides close calls by comparing both times, and the result is sent to both phones.
- **Marbles.** The marbles don't collide; you see your friend's ball live. If both of you pick the same ball, the friend's is shown in a contrasting style.
- **Ball choice.** Players pick their ball in the lobby: the four starter balls, plus any ball unlocked in Solo on that phone.
- **Practice alone.** A solo run on a random race maze.

**Tech.** Each HTML file is self-contained: Three.js r159 is inlined, and `duel.html` also inlines PeerJS 1.5.4. Neither needs a build step. Next to them are the files that make the game an installable phone app (PWA):

```
docs/index.html              the solo game
docs/duel.html               the 1v1 duel (linked from the "1v1" button on the solo home screen)
docs/manifest.webmanifest    app name, colours, icons, full-screen display
docs/sw.js                   service worker: offline play + quiet background updates
docs/icons/                  icon-192.png, icon-512.png, maskable-512.png, apple-touch-icon.png
```

---

## 2. File map (sections inside `index.html`)

The game script is split into numbered sections. Search for `/* ===` headers.

| # | Section | What lives there | Typical edits |
|---|---------|------------------|---------------|
| 1 | Constants & helpers | Ball radius, wall height, gravity `G`, `MAX_TILT`, `GONG_R`, RNG, `isIOS` | Physics feel |
| 2 | Save data | `SAVE_KEY = 'chakrview.v2'` (saved progress carries over). Fields: settings, `done[]`, `best[]` times, `daily{}`, `streak`, `ambience`, `kaudi`, bets, and `owned{}` (balls bought with kaudi). The old `motifs` and `bonus` fields are ignored. | Add saved fields |
| 3 | **Content** | `SHAPES`, `BOARDS`, `STORY`, `BALLS`, `FEATURES` (one-line intros), `CAMPAIGN`, daily rules | **Most scaling happens here** |
| 4 | Quality tiers | `PRESETS`: **high** = desktop with shadow maps; **mid** = phones, no shadow maps; **low** = weak devices | Performance budgets |
| 5 | Logo | Wordmark "chakr*view*" with a brass ball as the dot of the i, plus the favicon | Branding |
| 6 | Renderer & scene | Lights, environment map, fog, shadow bias | Mood/lighting |
| 7 | Procedural textures | Wood/marble/bidri/neel pixel generators (`PIX`), folk-art vector painters (`ART`) | New board styles |
| 8 | Materials | Board materials, `applyBoard`, **`composeFloor()`** (floor art + sand + baked groove shading in one texture), ball looks (`getBallLook`) | New ball looks |
| 9 | Maze geometry | `makeGeo` (circle/polygon rings, ρ = apothem), outlines | New shapes |
| 10 | Level generator | `genLevel(cfg)`: seeded plan, decoys, false gaps (pockets), traps, turning ring, a reachability flood, **gong placement** (sealed levels), posts, sand and brass zones, checkpoints | New maze mechanics |
| 11 | Board meshes | Extrusion, turning ring, floor, `bakeAO` (stored as data and painted into the floor), holes, the goal ring (a raised brass torus), brass plates, posts, the gong, the lotus seal, the ghost ball | Visual effects |
| 12 | Audio | Rolling hush, wall taps, ring-pass bell, `sfxGong`, soft thumps; Relax-only ambience (`ambWanted`, `syncAmb`, `tickAmbience`) | Sound design |
| 13 | State & physics | `physicsStep` (the goal is ignored while `st.open` is false), `checkCheckpoint`, `resetGong`, `checkGong` | Mechanics |
| 14 | Input | Keys, drag, **tilt** (see §5), tilt status chip | Controls |
| 15 | Cameras | Home orbit, Top, Chase; per-frame near/far planes | Camera feel |
| 16 | UI | Home, Journey, Levels, Relax, Collection, Settings, results | Screens |
| 17 | Adaptive performance | `governor()` steps the pixel ratio down at most 3 times and never toggles shadows during play | Perf |
| 18 | Main loop | `frame()`, run recording for challenges | — |
| 18b | Bet · Gallery · Challenge · Floor feel | `openBet`, `renderGallery`, challenge links (`makeChallenge`, `challengeURL`, `readChallenge`, `encGhost`/`decGhost`, `tickGhost`), `floorFeel` | New modes |
| 19 | Phone app | Install button / iPhone install sheet, wake lock, `shareResult`, service worker | Install and share |
| 20 | Boot | Initial selection, opening a challenge link, debug handle `window.__cv` | — |

**`duel.html`** is generated from the solo source. It shares sections 1–15 and 17–18, and replaces 16 and 20 with:

- **16 · Duel UI:** lobby, ball row, countdown, `beginRound`, `win`, `hostJudge`/`decide`/`applyResult`, and the friend's marble (`tickOpp`).
- **16b · Rooms:** `createRoom`, `joinRoom`, `setupConn` and the `onData` message protocol.

Duel-specific engine changes: `EXT = 18` (a bigger board area), `raceCfg(shape, seed)`, and turning rings driven by race time so both players see the same angle.

**Duel message protocol** (JSON over the PeerJS data channel):

| Message | Sent by | Meaning |
|---------|---------|---------|
| `hello {ball}` | both | My ball choice |
| `ping {t}` / `pong {t}` | both | Round-trip time (used to start together) |
| `round {r, shape, seed, wins}` | host | Start round *r* |
| `p {r, x, y, z}` | both | My ball position (about 15 per second) |
| `fin {r, t}` | both | I reached the centre in *t* seconds |
| `res {r, w, ht, gt, wins}` | host | Round result (`w` is `'host'` or `'guest'`) |
| `bye` | both | Leaving the room |

**Dev unlock:** open `index.html?unlock=all` to unlock every level, ball and board for testing.

---

## 3. Content formats

### Journey level

```js
{ shape: 'oct', nG: 5, seed: 308, board: 'sanjhi', traps: true, brass: 2, sand: 2, fg: 4, decoy: 1, posts: true, seal: true }
```

| Key | Meaning |
|-----|---------|
| `shape` | Key in `SHAPES` (`circle`, `hex`, `oct`) |
| `nG` | Number of rings (2–5 in Solo, 6 in Duel) |
| `seed` | Integer. The same seed always gives the same maze |
| `board` | Key in `BOARDS`. Reaching the level also "discovers" this board for Relax |
| `noBars` | `true` = no blocking bars (gentlest) |
| `decoy` | 0–1 chance per ring of a dead-end branch |
| `fg` | False openings that lead into sealed pockets |
| `traps` | Holes in dead ends. Falling in sends you back one ring |
| `posts` | Six bouncy brass posts around the centre |
| `spin` | Turning-ring speed in radians per second (circle boards only, e.g. `.24`) |
| `sand`, `brass` | Number of slow and fast patches |
| `seal` | Brass lotus over the centre plus a gong that opens it |
| `intro` | Feature keys from `FEATURES` to show on this level's short card. **The card only appears when a level has an `intro`.** |

The gong is placed automatically: first in a decoy dead end, then off the main route, always reachable.

### Ball

```js
moti: { name: 'Moti', origin: 'Pearl', speed: .88, damp: .55, rest: .36, grip: .07,
        tock: 1500, stats: [3,3,4], unlock: 6, desc: '…', css: 'radial-gradient(…)' }
```

| Key | Meaning |
|-----|---------|
| `speed` | Acceleration multiplier (0.7 slow … 1.0 fast) |
| `damp` | Rolling resistance (0.36 slippery … 1.1 grippy) |
| `rest` | Bounce off walls (0.18 dead … 0.6 springy) |
| `grip` | Wall friction |
| `tock` | Pitch (Hz) of the wall tap |
| `unlock` | Journey levels finished before it unlocks (0 = starter, available in Duel too) |
| `css` | The swatch shown in the Collection and the Duel lobby |

Add the 3D look as a `case` in `getBallLook()`.

### Board

```js
warli: { name: 'Warli', origin: 'Tribal painting · Maharashtra', kind: 'art', art: 'warli',
         side: 0x5a2a18, floor: 0xffffff, edge: 0x7c3a22, rough: .85, ao: .8, desc: '…' }
```

| `kind` | How the texture is made |
|--------|-------------------------|
| `wood` | Pixel generator with `wood: { L, D, G, warp, freq }` colours/grain |
| `bidri`, `marble`, `neel` | Pixel generators in `PIX` |
| `art` | Vector painter in `ART[name] = { top(g){…}, floor(g){…} }`. Draw in board units with y up; `TEX_EXT` is the half-width of the canvas. **Always set `lineWidth` before every `stroke()`. `save()`/`restore()` resets it to 1 board unit, and one stray stroke paints the whole board black.** |

`ao` sets how dark the baked groove shading is; `composeFloor()` paints it into the floor texture.

---

## 4. Ready-to-paste prompts

Paste the prompt together with the HTML file into your AI assistant.

### 4.1 Add more Journey levels / a new world

> In this Chakrview `index.html`, extend `CAMPAIGN` with a new world of **10 Decagon levels** after Octagon. Add `deca: { N: 10, name: 'Decagon', pair: 1.72 }` to `SHAPES` and a decagon icon to `SHAPE_SVG`. Ramp from `{ nG: 4, decoy: .6, fg: 2, traps: true, brass: 2, seal: true }` to `{ nG: 5, decoy: 1, fg: 5, traps: true, posts: true, sand: 3, brass: 3, seal: true }`. Use new unique seeds. Then run a solvability check: rasterise free space (distance to `level.segs` ≥ 0.34, excluding non-goal holes and posts), BFS from `level.start`, and confirm both the centre and `level.gong` are reachable. Replace any failing seed.

### 4.2 Add a new ball

> Add a ball called **"Shankh"** (conch shell) to `BALLS`: creamy white with soft pink spiral ridges; `speed .86`, `rest .4`, high control, `unlock: 24`. Write its look in `getBallLook()` using `sphereTex()` and a `bumpMap`. Add a CSS `css` swatch.

### 4.3 Add a new folk-art board

> Add a folk-art board **"Phad"** (Rajasthan scroll painting) with `kind: 'art'`, a short `desc` and a `STORY` entry. In `ART`, write `phad.top(g)` (ochre ground, small red-and-black horse-and-rider silhouettes via `scatter()`) and `phad.floor(g)` (deep red ground, a sun medallion of radius 1.8 round the centre). Set `lineWidth` before every stroke. Use it in two new Journey levels.

### 4.4 New Duel content

> In `duel.html`, make each match 5 rounds (first to 3). Add a fourth race board, `decagon`, and a "Sprint" option in the lobby that uses `nG: 4` mazes for quick games. Keep the message protocol backwards compatible: add fields, don't rename them.

### 4.5 Duel: up to 4 players

> In `duel.html`, let a host accept up to 3 guests (a star layout: the host relays every position to everyone). Show each friend's marble in their chosen ball style with a small coloured ring under it. Results list everyone's time. Keep 2-player rooms working exactly as now.

### 4.6 Duel: reliable rooms with your own relay

> Replace the PeerJS public broker in `duel.html` with Supabase Realtime broadcast channels (room = channel name). Keep the same message protocol. Put the project URL and anon key in a config block at the top of the script. Fall back to PeerJS if the config is empty.

### 4.7 Update the installed app

> I changed `index.html` and/or `duel.html`. Bump `VERSION` in `sw.js` (currently `chakrview-3`) so installed phones pick up the new version. If I added files, add them to `ASSETS`.

### 4.8 Accessibility and kids mode

> Add a "Gentle" setting: 20% lower `MAX_TILT`, higher `damp`, and holes become shallow dips that slow the ball instead of swallowing it. Add "Reduce motion": no home orbit, instant camera changes. Both off by default.

### 4.9 Localisation

> Move every user-facing string into a `STR` object keyed by language (`en`, `hi`, `ta`, `bn`, `mr`). Add a Language row in Settings. Default to `navigator.language`. Keep the wordmark as is.

---

## 5. Phone tilt: how it works (read before touching section 14)

- **Always listen.** The game listens to `deviceorientation` (and to `devicemotion` as a backup) from page load on touch devices. Newer Chrome versions expose `DeviceOrientationEvent.requestPermission` but still deliver events, so **never make listening depend on the permission answer**. That mistake made tilt silently dead in an earlier version.
- **iPhone.** Safari shows its motion prompt only when `requestPermission()` is called inside a tap. The game calls it on the very first tap anywhere (`firstTap`), on Play, and from the tilt chip and the Settings button.
- **Fallback.** If no orientation data arrives, tilt is derived from gravity (`accelerationIncludingGravity`).
- **Status chip.** When tilt isn't live during play, a chip explains why:
  - *Tap to turn on tilt*: iPhone permission is needed.
  - *Tilt is off*: permission was refused.
  - *Tilt needs the https link*: the page is not a secure context.
  - *Open in a browser for tilt*: the game is inside a preview iframe.
  - *No tilt here*: no sensor data.
- **Fallback controls.** Dragging always works as a backup.
- **Re-level.** ◎ re-zeroes the board to the way you're holding the phone.

## 6. Guard rails for any change

- **Keep each HTML self-contained.** Everything stays inline unless you add PWA files on purpose.
- **Rebuild `duel.html` when you change shared engine code** (sections 1–15 and 17–18), or the two versions will drift.
- **Seeds are content.** Don't change the generator in a way that alters existing seeds. Add new behaviour behind new `cfg` flags.
- **Check solvability** after touching `genLevel` or `CAMPAIGN` (see prompt 4.1).
- **No coplanar overlays.** Never lay transparent planes flat on the floor (decals, AO sheets). They flicker on phones. Paint them into the floor in `composeFloor()`, or raise real geometry, as the goal torus is raised.
- **No mid-game quality flips.** Don't toggle shadows or rebuild materials during play; it causes visible hitches.
- **Feel targets:**
  - about 60 fps on mid-range phones;
  - rolling sound below about 0.06 gain;
  - ambience only in Relax, kept to a whisper;
  - no jingles;
  - every failure is gentle.
- **Less text.** One short line per new mechanic. Art stories belong in the Gallery only.
- **Visual rule:** calm, earthy palettes; at most three colours plus black/white per board.

---

## 7. Repository layout and deploying

```
README.md               the game's page on GitHub
prompt_for_scaling.md   this file
media/                  screenshots used by the README
docs/                   the website (GitHub Pages serves this folder)
  index.html            solo game
  duel.html             1v1 duel
  manifest.webmanifest, sw.js, icons/, .nojekyll
```

**GitHub Pages:** in **Settings → Pages**, choose *Deploy from a branch*, then branch `main` and folder **`/docs`**. The solo game is at `https://<you>.github.io/<repo>/` and the duel at `…/duel.html`.

**Vercel:** set the project's *Root Directory* to `docs`. No build settings are needed.

**Updating:**
- Replace the files inside `docs/`.
- Bump `VERSION` in `docs/sw.js` so installed phones refresh.
- Add `?unlock=all` to the URL to test with everything unlocked.
- Progress is saved per device: Solo under `chakrview.v2`, Duel settings under `chakrview.duel`.

## 8. Roadmap ideas (ranked by delight per effort)

1. Several ghosts per challenge link (a family passing one maze around)
2. Duel: 3–4 players (4.5) and a Sprint option (4.4)
3. A share card image for the daily maze
4. Swinging gates, then two-ball levels
5. A Decagon world with new boards: Phad, Chikankari, Mata ni Pachedi, Thangka
6. Festival dailies: an Onam pookalam centre, a Pongal kolam
7. Gentle and Reduce-motion settings (4.8)
8. Leaderboards (needs a backend), including a daily bet leaderboard
