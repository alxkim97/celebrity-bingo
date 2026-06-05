'use strict';
const express  = require('express');
const http     = require('http');
const { Server } = require('socket.io');
const path     = require('path');
const os       = require('os');
const QRCode   = require('qrcode');

// Cloud platforms inject PORT; fall back to 3847 for local dev
const PORT = parseInt(process.env.PORT) || 3847;

// Detect public URL from common cloud platform env vars
function getPublicUrl() {
  if (process.env.RAILWAY_PUBLIC_DOMAIN)  return `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`;
  if (process.env.RENDER_EXTERNAL_URL)    return process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '');
  if (process.env.FLY_APP_NAME)           return `https://${process.env.FLY_APP_NAME}.fly.dev`;
  return `http://${getLocalIP()}:${PORT}`; // local dev
}

function isCloud() {
  return !!(process.env.RAILWAY_PUBLIC_DOMAIN ||
            process.env.RENDER_EXTERNAL_URL   ||
            process.env.FLY_APP_NAME);
}

// ── Local IP ────────────────────────────────────────────
// Skip virtual adapters (VirtualBox, VMware, Hyper-V) that are NOT reachable
// by other devices on the physical network.
const VIRTUAL_ADAPTER_KEYWORDS = [
  'virtual', 'vmware', 'vmnet', 'vethernet', 'hyper-v',
  'pseudo', 'tunnel', 'teredo', 'isatap', '6to4', 'loopback',
];

function isVirtual(name) {
  const l = name.toLowerCase();
  return VIRTUAL_ADAPTER_KEYWORDS.some(k => l.includes(k));
}

function getAllLocalIPs() {
  const results = [];
  for (const [name, addrs] of Object.entries(os.networkInterfaces())) {
    if (isVirtual(name)) continue;
    for (const a of addrs) {
      if (a.family === 'IPv4' && !a.internal) {
        const l = name.toLowerCase();
        const score = (l.includes('wi-fi') || l.includes('wifi') || l.includes('wlan') || l.includes('wireless')) ? 3
                    : (l.includes('ethernet') || l.includes('local area') || l === 'en0' || l === 'eth0')         ? 2
                    : 1;
        results.push({ address: a.address, name, score });
      }
    }
  }
  results.sort((a, b) => b.score - a.score);
  return results.length ? results : [{ address: '127.0.0.1', name: 'localhost', score: 0 }];
}

function getLocalIP() {
  return getAllLocalIPs()[0].address;
}

// ── Express + Socket.io ─────────────────────────────────
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET','POST'] } });

// Allow all origins on plain Express routes (needed for /ping test from host window)
app.use((_, res, next) => { res.setHeader('Access-Control-Allow-Origin', '*'); next(); });

// Player files served at root (phones open http://ip:PORT)
// Host files served at /host/
// Shared files served at /shared/
app.use('/host',   express.static(path.join(__dirname, 'host')));
app.use('/shared', express.static(path.join(__dirname, 'shared')));
app.use(express.static(path.join(__dirname, 'player')));

// Connectivity test — other devices can GET /ping to verify they can reach the server
app.get('/ping', (_, res) => res.json({ ok: true, port: PORT }));

// Simple HTML test page — if mobile can see this, the server is reachable
app.get('/test', (_, res) => res.send(`<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>CB Test</title></head>
<body style="background:#1a1a2e;color:#fffffe;font-family:sans-serif;padding:24px;text-align:center">
<h2 style="color:#a786df">✓ Celebrity Bingo Server is reachable!</h2>
<p>Port ${PORT} is open and serving.</p>
<p><a href="/" style="color:#ffd700">← Go to game</a></p>
</body></html>`
));

// ── Game state ──────────────────────────────────────────
const gs = {
  wheelWords: [], names: [], wikiMap: {}, gridSize: 4,
  playerNames: [], freeCenter: true, namesRepeat: true,
  players: [], phase: 'setup',
  currentSpin: null, spinHistory: [],
  vote: null, setupCount: 0,
  takenNames: new Set(), setupDone: new Set(),
};

let hostSocket = null;
const playerSockets = {}; // { playerIdx: socket | null }

// ── Helpers ─────────────────────────────────────────────
const toHost      = (ch, d) => { if (hostSocket?.connected) hostSocket.emit(ch, d); };
const toPlayer    = (i, ch, d) => { if (playerSockets[i]?.connected) playerSockets[i].emit(ch, d); };
const toAllPlayers= (ch, d) => Object.keys(playerSockets).forEach(i => toPlayer(+i, ch, d));
const toAll       = (ch, d) => { toHost(ch, d); toAllPlayers(ch, d); };

function lobbyState() {
  return {
    phase: gs.phase,
    players: gs.players.map((p, i) => ({
      idx: i, name: p.name,
      taken:  !!(playerSockets[i]?.connected),
      done:   gs.setupDone.has(i),
    })),
  };
}
function broadcastLobby() { io.emit('lobby-update', lobbyState()); }

async function serverInfo(socket) {
  const cloud = isCloud();
  const url   = getPublicUrl();
  const qr    = await QRCode.toDataURL(url, { width: 200, margin: 1 });
  const allUrls = cloud
    ? [{ url, name: 'Public URL — share with players' }]
    : getAllLocalIPs().map(i => ({ url: `http://${i.address}:${PORT}`, name: i.name }));
  socket.emit('server-info', { url, qr, allUrls, isCloud: cloud });
}

// ── HOST socket ─────────────────────────────────────────
function handleHost(socket) {
  hostSocket = socket;
  serverInfo(socket);

  socket.on('host-setup', async (data) => {
    Object.assign(gs, {
      wheelWords: data.wheelWords, names: data.names,
      wikiMap: data.wikiMap || {},
      gridSize: data.gridSize, playerNames: data.playerNames,
      freeCenter: data.freeCenter, namesRepeat: data.namesRepeat,
      phase: 'cards', takenNames: new Set(),
      setupCount: 0, setupDone: new Set(),
    });
    Object.keys(playerSockets).forEach(k => delete playerSockets[k]);

    const mid = Math.floor(gs.gridSize / 2);
    gs.players = gs.playerNames.map(name => {
      const grid   = Array.from({ length: gs.gridSize }, () => Array(gs.gridSize).fill(null));
      const marked = Array.from({ length: gs.gridSize }, () => Array(gs.gridSize).fill(false));
      if (gs.freeCenter && gs.gridSize % 2 === 1) {
        grid[mid][mid] = 'FREE'; marked[mid][mid] = true;
      }
      return { name, grid, marked, hasBingo: false };
    });

    await serverInfo(socket);
    broadcastLobby();
  });

  socket.on('host-game-start', () => {
    gs.phase = 'game'; gs.spinHistory = []; gs.currentSpin = null;
    toAllPlayers('game-start', { playerNames: gs.playerNames, gridSize: gs.gridSize });
    broadcastLobby();
  });

  socket.on('host-spin-complete', ({ word }) => {
    gs.currentSpin = word;
    gs.spinHistory.unshift(word);
    if (gs.spinHistory.length > 8) gs.spinHistory.pop();
    toAll('spin-reveal', { word, history: gs.spinHistory.slice(1) });
  });

  socket.on('host-new-game', () => {
    gs.phase = 'setup'; gs.players = []; gs.vote = null;
    gs.spinHistory = []; gs.currentSpin = null;
    gs.takenNames = new Set(); gs.setupCount = 0; gs.setupDone = new Set();
    Object.keys(playerSockets).forEach(k => delete playerSockets[k]);
    io.emit('game-reset');
  });

  socket.on('host-back-to-setup', () => {
    gs.phase = 'setup'; gs.players = []; gs.vote = null;
    gs.spinHistory = []; gs.currentSpin = null;
    gs.takenNames = new Set(); gs.setupCount = 0; gs.setupDone = new Set();
    Object.keys(playerSockets).forEach(k => delete playerSockets[k]);
    toAllPlayers('game-reset', {}); // reset players only — host navigates back itself
  });

  socket.on('host-request-cards', () => {
    hostSocket?.emit('cards-data', {
      players: gs.players.map((p, i) => ({
        name: p.name, idx: i, grid: p.grid, marked: p.marked, hasBingo: p.hasBingo,
      })),
      gridSize: gs.gridSize,
      wikiMap: gs.wikiMap,
    });
  });

  socket.on('disconnect', () => { if (hostSocket === socket) hostSocket = null; });
}

// ── PLAYER socket ────────────────────────────────────────
function handlePlayer(socket) {
  // Always send current lobby state so the player page knows what to show
  socket.emit('lobby-update', lobbyState());

  socket.on('player-claim', ({ playerIdx }) => {
    if (gs.phase === 'setup') {
      socket.emit('claim-failed', 'Host has not started the game yet.');
      return;
    }
    if (playerSockets[playerIdx]?.connected) {
      socket.emit('claim-failed', 'This slot is taken — choose another.');
      return;
    }
    playerSockets[playerIdx] = socket;
    socket.playerIdx = playerIdx;
    const p = gs.players[playerIdx];

    socket.emit('player-init', {
      playerIdx, playerName: p.name,
      names: gs.names, wikiMap: gs.wikiMap,
      gridSize: gs.gridSize, freeCenter: gs.freeCenter,
      namesRepeat: gs.namesRepeat, takenNames: [...gs.takenNames],
      savedGrid:     gs.setupDone.has(playerIdx) ? p.grid   : null,
      savedMarked:   gs.setupDone.has(playerIdx) ? p.marked : null,
      cardSetupDone: gs.setupDone.has(playerIdx),
      gamePhase:     gs.phase,
      currentSpin:   gs.currentSpin,
      spinHistory:   gs.spinHistory,
      playerNames:   gs.playerNames,
    });

    toHost('player-joined', { playerIdx, name: p.name });
    broadcastLobby();

    // Resend active vote so a reconnecting player sees the modal
    if (gs.phase === 'game' && gs.vote && !gs.vote.resolved) {
      const vp = gs.vote.playerIdx;
      socket.emit('vote-open', {
        announcerIdx: vp, announcerName: gs.players[vp].name,
        cellName: gs.vote.name, characteristic: gs.currentSpin,
        wikiUrl: gs.wikiMap[gs.vote.name] || null,
      });
      const vals = Object.values(gs.vote.votes);
      socket.emit('vote-update', {
        voted: vals.filter(v=>v!==null).length, total: vals.length,
        yes: vals.filter(v=>v===true).length, no: vals.filter(v=>v===false).length,
      });
    }
  });

  socket.on('player-card-done', ({ playerIdx, grid }) => {
    if (socket.playerIdx !== playerIdx) return;
    gs.setupDone.add(playerIdx);
    const mid = Math.floor(gs.gridSize / 2);
    gs.players[playerIdx].grid = grid;
    if (gs.freeCenter && gs.gridSize % 2 === 1) {
      gs.players[playerIdx].grid[mid][mid] = 'FREE';
      gs.players[playerIdx].marked[mid][mid] = true;
    }
    if (!gs.namesRepeat) {
      grid.flat().forEach(n => { if (n && n !== 'FREE') gs.takenNames.add(n); });
      Object.keys(playerSockets).forEach(i => {
        if (+i !== playerIdx) toPlayer(+i, 'taken-update', { takenNames: [...gs.takenNames] });
      });
    }
    gs.setupCount++;
    toHost('player-done', { playerIdx, name: gs.players[playerIdx].name });
    if (gs.setupCount === gs.players.length) toHost('all-done', {});
    broadcastLobby();
  });

  socket.on('player-announce', ({ playerIdx, row, col, name }) => {
    if (socket.playerIdx !== playerIdx) { socket.emit('announce-failed', 'not-claimed'); return; }
    if (gs.vote) { socket.emit('announce-failed', 'vote-active'); return; }
    if (!gs.currentSpin) { socket.emit('announce-failed', 'no-spin'); return; }
    gs.vote = {
      playerIdx, row, col, name,
      votes: Object.fromEntries(gs.players.map((_, i) => [i, null])),
      resolved: false,
    };
    gs.vote.votes[playerIdx] = true; // announcer auto-votes Yes

    toAll('vote-open', {
      announcerIdx: playerIdx,
      announcerName: gs.players[playerIdx].name,
      cellName: name, characteristic: gs.currentSpin,
      wikiUrl: gs.wikiMap[name] || null,
    });

    const vals = Object.values(gs.vote.votes);
    toAll('vote-update', {
      voted: vals.filter(v => v !== null).length,
      total: vals.length,
      yes: vals.filter(v => v === true).length,
      no:  vals.filter(v => v === false).length,
    });
    if (vals.every(v => v !== null)) resolveVote();
  });

  socket.on('player-vote', ({ voterIdx, value }) => {
    if (!gs.vote || gs.vote.resolved || gs.vote.votes[voterIdx] !== null) return;
    gs.vote.votes[voterIdx] = value;
    const vals = Object.values(gs.vote.votes);
    toAll('vote-update', {
      voted: vals.filter(v => v !== null).length,
      total: vals.length,
      yes: vals.filter(v => v === true).length,
      no:  vals.filter(v => v === false).length,
    });
    if (vals.every(v => v !== null)) resolveVote();
  });

  socket.on('player-cancel-vote', ({ playerIdx }) => {
    if (!gs.vote || gs.vote.playerIdx !== playerIdx || gs.vote.resolved) return;
    if (socket.playerIdx !== playerIdx) return;
    gs.vote = null;
    toAll('vote-cancelled', {});
  });

  socket.on('disconnect', () => {
    const idx = socket.playerIdx;
    if (idx !== undefined && playerSockets[idx] === socket) {
      playerSockets[idx] = null;
      toHost('player-closed', { playerIdx: idx });
      broadcastLobby();

      // Prevent vote stalemate when a player disconnects mid-vote
      if (gs.vote && !gs.vote.resolved) {
        if (gs.vote.playerIdx === idx) {
          // Announcer disconnected — cancel the whole vote
          gs.vote = null;
          toAll('vote-cancelled', {});
        } else if (gs.vote.votes[idx] === null) {
          // Pending voter disconnected — drop their slot so others can resolve
          delete gs.vote.votes[idx];
          const vals = Object.values(gs.vote.votes);
          toAll('vote-update', {
            voted: vals.filter(v=>v!==null).length, total: vals.length,
            yes: vals.filter(v=>v===true).length, no: vals.filter(v=>v===false).length,
          });
          if (!vals.length || vals.every(v=>v!==null)) resolveVote();
        }
      }
    }
  });
}

// ── Vote resolution ─────────────────────────────────────
function resolveVote() {
  gs.vote.resolved = true;
  const vals = Object.values(gs.vote.votes);
  const yes  = vals.filter(v => v === true).length;
  const no   = vals.filter(v => v === false).length;
  const pass = yes > no;
  const { playerIdx, row, col } = gs.vote;
  if (pass) {
    gs.players[playerIdx].marked[row][col] = true;
    toPlayer(playerIdx, 'mark-cell', { row, col });
    gs.currentSpin = null; // consumed — prevents re-announcing same characteristic
    checkBingo(playerIdx);
  }
  toAll('vote-result', { pass, yes, no, playerIdx, row, col });
  gs.vote = null;
}

function checkBingo(pi) {
  const { marked: m, name } = gs.players[pi];
  const n = gs.gridSize;
  let win = false;
  for (let r = 0; r < n && !win; r++) if (m[r].every(Boolean)) win = true;
  for (let c = 0; c < n && !win; c++) if (m.every(r => r[c])) win = true;
  if (!win && m.every((r, i) => r[i])) win = true;
  if (!win && m.every((r, i) => r[n - 1 - i])) win = true;
  if (win) { gs.players[pi].hasBingo = true; toAll('game-won', { winnerName: name }); }
}

// ── Socket routing ──────────────────────────────────────
io.on('connection', socket => {
  if (socket.handshake.query.role === 'host') handleHost(socket);
  else handlePlayer(socket);
});

// ── Export ──────────────────────────────────────────────
function start(port = PORT) {
  httpServer.listen(port, '0.0.0.0', () => {
    const url = getPublicUrl();
    console.log(`\n🎡 Celebrity Bingo running!`);
    console.log(`   Host:    ${url}/host/index.html`);
    console.log(`   Players: ${url}\n`);
  });
}

module.exports = { start, PORT, getLocalIP };

if (require.main === module) start();
