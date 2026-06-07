# Celebrity Bingo — Hosting Setup Summary
**Date:** 2026-06-07
**Goal:** Deploy the game to a free hosting platform

---

## Project Details

- **Name:** celebrity-bingo (Celebrity spin-wheel bingo game)
- **Location:** `C:\Users\alex_\Desktop\Claude Code\Other\celebrity-bingo`
- **Stack:** Node.js + Express + Socket.io (real-time multiplayer via WebSockets)
- **Start command:** `node server.js` (already has a `Procfile` set up — was Railway/Heroku-ready)
- **GitHub:** pushed and live at `github.com/alxkim97/celebrity-bingo` (Public, branch: `master`)

---

## Why Not Railway

- Railway's free trial is limited (28 days / $4.98 credits remaining as of 2026-06-07)
- After the trial, it requires a paid plan (Hobby $5/mo minimum) to keep services online
- Looking for a genuinely free alternative for a casual game

---

## Hosting Recommendation

Because this app uses **Socket.io / persistent WebSocket connections**, serverless platforms
(Vercel, Netlify) are NOT a good fit — need a platform that keeps a Node process running.

### Option 1 — Render (recommended starting point)
- Free tier supports Node.js web services + WebSockets
- Deploys directly from the `alxkim97/celebrity-bingo` GitHub repo, auto-redeploys on push
- Already has a `Procfile`, so Render should pick up `npm start` → `node server.js` with minimal config
- **Tradeoff:** free web services spin down after ~15 min inactivity, ~30-60s cold start on next request
  (minor inconvenience for a casually-played game with friends)

### Option 2 — Fly.io (no-sleep alternative)
- Free allowance includes small always-on VMs — no spin-down, instantly responsive
- More setup involved (CLI-based deploys, Docker-ish config via `fly.toml`)
- Better if you want the game to feel "always on"

---

## Next Steps

1. Pick a platform (Render suggested first)
2. Connect it to `github.com/alxkim97/celebrity-bingo`
3. Configure build/start commands (likely auto-detected via `Procfile` / `package.json`)
4. Set any required environment variables (check `server.js` / `main.js` for `process.env` usage)
5. Deploy and test multiplayer functionality (Socket.io connections)
6. Share the live URL with friends to test

---

## Useful Context

- The repo also contains `host/`, `player/`, `shared/` folders and `wheelbingo.html` — likely
  separate host/player views for the game
- A `HOW_IT_WORKS.md` file exists in the repo root with more details on the game's architecture
- An empty `railway` file and `Procfile` remain from the original Railway setup attempt — may
  need adjustment or removal depending on the new platform's requirements
