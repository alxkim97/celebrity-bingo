# Celebrity Bingo — How It Works

A real-time multiplayer bingo game where a host spins a wheel of traits, and players match those traits to celebrities on their cards.

---

## Table of Contents
1. [Game Flow](#game-flow)
2. [Architecture](#architecture)
3. [File Structure](#file-structure)
4. [Roles: Host vs Player](#roles-host-vs-player)
5. [Setup Phase](#setup-phase)
6. [Card Setup Phase](#card-setup-phase)
7. [Game Phase](#game-phase)
8. [The Vote System](#the-vote-system)
9. [Real-time Communication (Socket.io)](#real-time-communication-socketio)
10. [Deployment (Railway)](#deployment-railway)
11. [Settings & Themes](#settings--themes)
12. [i18n — Thai / English](#i18n--thai--english)

---

## Game Flow

```
HOST                                PLAYERS
 │                                     │
 │  1. Enter wheel words + name pool   │
 │  2. Set grid size + player names    │
 │  3. Click "Open Lobby" ─────────────┼──> Players see QR / URL
 │                                     │
 │  4. Players join by tapping name ───┼──< player-claim
 │  5. Players fill their bingo cards  │
 │  6. Host sees each player go ✓ done │
 │  7. Click "Start Game →" ───────────┼──> game-start event
 │                                     │
 │  8. Spin the wheel                  │
 │  9. Wheel reveals a trait ──────────┼──> spin-reveal event
 │                                     │
 │  10. Player taps "Announce Match!" ─┼──< player-announce
 │  11. Vote opens for everyone ───────┼──> vote-open event
 │  12. Players vote Yes / No          │
 │  13. Majority wins ─────────────────┼──> vote-result event
 │      ↳ If pass: cell is marked      │
 │                                     │
 │  14. First player with a full       │
 │      row / column / diagonal ───────┼──> game-won event
 │      wins! (BINGO)                  │
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Railway Cloud                      │
│                                                      │
│   ┌─────────────────────────────────────────────┐   │
│   │              server.js                       │   │
│   │         (Express + Socket.io)                │   │
│   │                                              │   │
│   │  GET /host/index.html  ──>  Host window      │   │
│   │  GET /                 ──>  Player window     │   │
│   │  GET /shared/i18n.js   ──>  Translations      │   │
│   │  GET /ping             ──>  Health check      │   │
│   │                                              │   │
│   │  io.on('connection')                         │   │
│   │    role=host  ──>  handleHost()              │   │
│   │    role=player ─>  handlePlayer()            │   │
│   └─────────────────────────────────────────────┘   │
│            ↑ WebSocket / HTTP polling                │
└────────────┼────────────────────────────────────────┘
             │
    ┌────────┴──────────┐
    │                   │
┌───▼────┐         ┌────▼───────────────┐
│  Host  │         │  Player (phone /   │
│ Browser│         │   other browser)   │
│        │         │                    │
│Spin    │         │ Lobby → Card Setup │
│wheel   │         │ → Game grid        │
│Vote    │         │ → Announce / Vote  │
│panel   │         │                    │
└────────┘         └────────────────────┘
```

---

## File Structure

```
celebrity-bingo/
│
├── server.js              ← Express + Socket.io server (runs on Railway)
├── main.js                ← Electron entry (local dev only)
├── preload.js             ← Electron context bridge (local dev only)
├── package.json           ← Dependencies & scripts
├── Procfile               ← Railway: "web: node server.js"
│
├── host/
│   ├── index.html         ← Host UI (wheel, vote panel, player list)
│   └── renderer.js        ← Host logic (pools, wheel canvas, socket events)
│
├── player/
│   ├── index.html         ← Player UI (lobby, card setup, game grid)
│   └── renderer.js        ← Player logic (drag/tap, announce, vote)
│
└── shared/
    └── i18n.js            ← Thai / English translations
```

---

## Roles: Host vs Player

| Feature               | Host                    | Player                   |
|-----------------------|-------------------------|--------------------------|
| URL                   | `/host/index.html`      | `/` (root)               |
| Socket role           | `role=host`             | `role=player`            |
| Controls spin wheel   | ✓ Yes                   | No                       |
| Fills bingo card      | No                      | ✓ Yes                    |
| Can announce a match  | No                      | ✓ Yes                    |
| Can vote              | Via host panel          | ✓ Yes (button)           |
| Sees all player cards | ✓ (done status)         | Only their own           |

---

## Setup Phase

The host fills three tabs before opening the lobby:

### Tab 1 — Wheel Words
Characteristics that go on the spin wheel (e.g. "Has been in a Marvel movie", "Dated another celebrity").

```
[ ✓ Has been in a movie ]  [ ✓ Singer ]  [ Won an Oscar ]
[ ✓ Reality TV star     ]  [ ✓ Athlete ]  ...
         ↑ click to toggle on/off
```

- Active words (highlighted) = go on the wheel
- Click **Select All** / **Clear All** / type + **Add** custom ones
- **🎲 Random (20)** picks 20 randomly

### Tab 2 — Name Pool
Celebrity names players can place on their cards.

- Same toggle system as wheel words
- Each name shows a **🔗** Wikipedia link
- **🎲 Random (30)** picks 30 randomly

### Tab 3 — Game Settings

| Setting           | Default | Description                            |
|-------------------|---------|----------------------------------------|
| Grid Size         | 4×4     | 3×3, 4×4, or 5×5                       |
| Players           | 2       | Number of player slots (add names)     |
| Free Center       | On      | Odd grids get a free ★ center cell     |
| Allow Repeats     | On      | Same name can appear on multiple cards |

---

## Card Setup Phase

After the host clicks **Open Lobby →**, players see this screen on their devices:

```
┌──────────────────────────────────┐
│         Celebrity Bingo          │
│    Tap your name below to join   │
│                                  │
│  [ Alex  — Join ]                │
│  [ Jamie — Join ]                │
└──────────────────────────────────┘
```

Once a player claims a slot, they see the **Card Setup** screen:

```
┌──────────────┬────────────────────────┐
│  Name Pool   │                        │
│              │   [ Taylor S. ] [ ? ]  │
│  Taylor S.🔗 │   [  Ariana G.] [ ? ]  │
│  Ariana G.🔗 │   [  Billie E.] [ ? ]  │
│  Billie E.🔗 │   [  Dua Lipa ] [ ? ]  │
│  Dua Lipa 🔗 │                        │
│  ...         │   [ Prog: 0 left ]     │
│              │   [Clear][Auto][Done→] │
└──────────────┴────────────────────────┘
```

### How to fill the card

| Method       | Desktop               | Mobile                          |
|--------------|-----------------------|---------------------------------|
| Drag & Drop  | Drag name → drop cell | Not available                   |
| Tap to place | Click name → click cell | Tap name → tap cell           |
| Auto Fill    | Click 🎲 Auto Fill    | Tap 🎲 Auto Fill                |

**Tap-to-place flow:**
1. Tap a name → it highlights in **gold** and a banner appears: _"Placing: Taylor Swift — tap a cell"_
2. Tap any empty (or filled) cell → name is placed there
3. Tap the same name again to **deselect**

**Wiki links (🔗)** next to each name open Wikipedia in a new tab.

The host's screen shows live status per player:

```
  Player 1 — Alex   ● Joined   ✓ Done
  Player 2 — Jamie  ○ Waiting to join…
```

When all players are done, the host can click **Start Game →**.

---

## Game Phase

```
┌────────────────────────────────────┐   ← HOST SCREEN
│        Celebrity Bingo             │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Has been in a Marvel movie  │  │  ← Current characteristic
│  └──────────────────────────────┘  │
│                                    │
│       ╔══════╗                     │
│      ╔╝      ╚╗  ← Animated       │
│      ║  SPIN  ║    wheel canvas   │
│      ╚╗      ╔╝    (420×420 px)   │
│       ╚══════╝                     │
│                                    │
│  [ SPIN THE WHEEL ]                │
│                                    │
│  Game Log          Players         │
│  🎡 Spun: "Singer" Alex ✓  Jamie   │
│  ✓ Alex: Taylor..  (dots for done) │
└────────────────────────────────────┘

┌────────────────────────────────────┐   ← PLAYER SCREEN
│  Current Characteristic:           │
│  ► Has been in a Marvel movie      │
│                                    │
│  ┌──────┬──────┬──────┬──────┐    │
│  │Taylor│Ariana│Billie│ Dua  │    │
│  ├──────┼──────┼──────┼──────┤    │
│  │  ✕   │ Zend │  ★   │ Bad  │    │  ← ✕ = marked, ★ = FREE
│  ├──────┼──────┼──────┼──────┤    │
│  │ Chris│ Selena│ Post│ Cardi│    │
│  ├──────┼──────┼──────┼──────┤    │
│  │ ...  │ ...  │ ...  │ ...  │    │
│  └──────┴──────┴──────┴──────┘    │
│                                    │
│  [ Announce Match! ]               │
│  Previous: "Singer" · "Actress"    │
└────────────────────────────────────┘
```

---

## The Vote System

When a player taps **Announce Match!**:

1. A modal opens listing all unmarked cells on their card
2. They select the celebrity that matches the current characteristic
3. They tap **Confirm →**
4. A **vote modal** opens for ALL players simultaneously

```
┌────────────────────────────────────┐
│        Cast Your Vote              │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Taylor Swift                │  │
│  │  matches "Was in a film"?    │  │
│  │  🔗 Wikipedia                │  │
│  └──────────────────────────────┘  │
│                                    │
│  Alex (Announcer)   Auto Yes ✓     │
│  Jamie              [✓ Yes][✗ No]  │
│  Sam                [✓ Yes][✗ No]  │
│                                    │
│  (waiting for votes…)              │
└────────────────────────────────────┘
```

**Rules:**
- The announcer automatically votes Yes (they claimed the match)
- Everyone else votes manually
- **Majority wins** (yes > no = approved)
- If approved → the cell is marked ✕ on the announcer's card
- If rejected → nothing happens

---

## Real-time Communication (Socket.io)

All events flow through a single Socket.io connection. Here's the full event map:

### Host → Server
| Event             | Payload                        | Trigger                        |
|-------------------|--------------------------------|--------------------------------|
| `host-setup`      | wheel words, names, settings   | Host clicks "Open Lobby"       |
| `host-game-start` | —                              | Host clicks "Start Game"       |
| `host-spin-complete` | `{ word }`                  | Wheel animation finishes       |
| `host-new-game`   | —                              | Host clicks "New Game"         |

### Server → Host
| Event             | Payload                        | When                           |
|-------------------|--------------------------------|--------------------------------|
| `server-info`     | url, qr, allUrls, isCloud      | On connect & after setup       |
| `lobby-update`    | phase, players array           | Any player joins/finishes      |
| `player-joined`   | playerIdx, name                | Player claims slot             |
| `player-done`     | playerIdx, name                | Player submits card            |
| `all-done`        | —                              | Every player submitted         |
| `vote-open`       | announcer, name, characteristic| Player announces               |
| `vote-update`     | voted, total, yes, no          | Each vote cast                 |
| `vote-result`     | pass, yes, no, row, col        | All votes in                   |
| `game-won`        | winnerName                     | Bingo detected                 |

### Player → Server
| Event             | Payload                        | Trigger                        |
|-------------------|--------------------------------|--------------------------------|
| `player-claim`    | `{ playerIdx }`                | Tap name in lobby              |
| `player-card-done`| `{ playerIdx, grid }`          | Tap "Done →"                   |
| `player-announce` | `{ playerIdx, row, col, name }`| Confirm announce modal         |
| `player-vote`     | `{ voterIdx, value }`          | Tap Yes/No                     |

### Server → Player
| Event             | Payload                        | When                           |
|-------------------|--------------------------------|--------------------------------|
| `lobby-update`    | phase, players                 | Any lobby change               |
| `claim-failed`    | message string                 | Slot already taken             |
| `player-init`     | full game state                | After successful claim         |
| `taken-update`    | takenNames array               | When repeat=off, card submitted|
| `game-start`      | playerNames, gridSize          | Host starts game               |
| `spin-reveal`     | word, history                  | Host spins wheel               |
| `vote-open`       | announcer, name, characteristic| Someone announces              |
| `vote-result`     | pass, yes, no                  | All votes tallied              |
| `mark-cell`       | row, col                       | Approved announce              |
| `game-won`        | winnerName                     | Bingo!                         |
| `game-reset`      | —                              | Host starts new game           |

---

## Deployment (Railway)

The app runs as a single Node.js process on Railway's cloud.

```
Local files
    │
    ▼  railway up
┌─────────────────────────────────┐
│  Railway builds Docker image    │
│  1. npm ci (install deps)       │
│  2. node server.js (start)      │
└─────────────────────────────────┘
    │
    ▼
https://hearty-friendship-production.up.railway.app
    │
    ├── /host/index.html    ← Host opens this
    └── /                   ← Players open this (share via QR)
```

**Environment variables Railway injects automatically:**
- `PORT` — Railway assigns a random port; server listens on it
- `RAILWAY_PUBLIC_DOMAIN` — used to build the public URL for QR code

**To redeploy after changes:**
```
cd "C:\Users\alex_\Desktop\Claude Code\Other\celebrity-bingo"
railway up
```

---

## Settings & Themes

Both host and player windows share identical settings, saved to `localStorage`.

### 5 Themes

| Name         | Accent Color | Vibe              |
|--------------|--------------|-------------------|
| Dark Purple  | `#a786df`    | Default — deep space |
| Dark Blue    | `#4cc9f0`    | Ocean night       |
| Emerald      | `#52b788`    | Forest dark       |
| Midnight     | `#c77dff`    | Ultra deep purple |
| Light        | `#7c53c3`    | Bright daytime    |

### Other Settings
- **Font Family** — Segoe UI, Arial, Georgia, Courier New, Trebuchet MS
- **Font Size** — 11px to 20px slider
- **Language** — English / ภาษาไทย
- **Show Celebrity Photos** — loads thumbnails from Wikipedia API
- **Reset to Default** — clears all localStorage keys

---

## i18n — Thai / English

All UI strings live in `shared/i18n.js` and are loaded by both windows.

```javascript
// Static string
t('btn-done')             // → "Done →" or "เสร็จสิ้น →"

// Template function
t('tpl-approved', 3, 1)  // → "✓ Approved! (3 yes / 1 no)"
```

HTML elements use `data-i18n` attributes that get updated when the language toggles:

```html
<button data-i18n="btn-done">Done →</button>
```

---

## Wikipedia Integration

Celebrity thumbnails and article links come from the **Wikipedia REST API**:

```
GET https://en.wikipedia.org/api/rest_v1/page/summary/{title}
```

- The host can assign a specific Wikipedia URL per name (via the 🔗 button in the name pool)
- If no URL is set, the name itself is used as the article title
- Images are cached in `imgCache` for the session
- Photos can be toggled off in Settings if bandwidth is a concern
- Images appear on the bingo card grid cells and in the announce modal

---

## Running Locally (Electron)

For development without deploying:

```bash
npm install        # install all deps including electron
npm run dev        # starts Electron app (main.js)
```

The Electron window opens the host UI. Players connect via LAN IP shown in the QR panel.

> **Note:** School / AP-isolated networks block LAN connections. Use Railway for those environments.
