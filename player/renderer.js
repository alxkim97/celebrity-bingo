// ════════════════════════════════════════════════════════
// THEMES / SETTINGS  (same palette as host)
// ════════════════════════════════════════════════════════
const THEMES = {
  'dark-purple':  { label:'Dark Purple',  swatch:'#a786df', vars:{'--bg':'#0f0e17','--surface':'#1a1a2e','--surface2':'#1e1b4b','--border':'#2a2a4e','--accent':'#a786df','--accent2':'#7c53c3','--gold':'#ffd700','--red':'#e63946','--green':'#2d6a4f','--text':'#fffffe','--muted':'#888','--dim':'#444','--card':'#12111e'} },
  'dark-blue':    { label:'Dark Blue',    swatch:'#4cc9f0', vars:{'--bg':'#06090f','--surface':'#0d1b2a','--surface2':'#112233','--border':'#1a3a5c','--accent':'#4cc9f0','--accent2':'#2575e8','--gold':'#ffd700','--red':'#e63946','--green':'#2d6a4f','--text':'#e8f4fd','--muted':'#7a9fbb','--dim':'#3a6080','--card':'#080f18'} },
  'dark-emerald': { label:'Emerald',      swatch:'#52b788', vars:{'--bg':'#050e0a','--surface':'#0a1f14','--surface2':'#0f2b1c','--border':'#1a4028','--accent':'#52b788','--accent2':'#2d6a4f','--gold':'#ffd700','--red':'#e63946','--green':'#52b788','--text':'#d8f3dc','--muted':'#74b992','--dim':'#2a5c3a','--card':'#040c08'} },
  'midnight':     { label:'Midnight',     swatch:'#c77dff', vars:{'--bg':'#020007','--surface':'#0d0818','--surface2':'#14102a','--border':'#251d45','--accent':'#c77dff','--accent2':'#9d4edd','--gold':'#ffd700','--red':'#ff6b6b','--green':'#40916c','--text':'#f0e6ff','--muted':'#9a7fc0','--dim':'#3d2c5c','--card':'#08040f'} },
  'light':        { label:'Light',        swatch:'#7c53c3', vars:{'--bg':'#f0eef8','--surface':'#ffffff','--surface2':'#e8e3f5','--border':'#c9c0e8','--accent':'#7c53c3','--accent2':'#5a3aa0','--gold':'#b8860b','--red':'#c0392b','--green':'#1a6b45','--text':'#1a1a2e','--muted':'#666','--dim':'#999','--card':'#f8f5ff'} },
};
const FONTS = {
  'Segoe UI':"'Segoe UI',Tahoma,Geneva,sans-serif", 'Arial':'Arial,Helvetica,sans-serif',
  'Georgia':"Georgia,'Times New Roman',serif", 'Courier New':"'Courier New',Courier,monospace",
  'Trebuchet MS':"'Trebuchet MS',sans-serif",
};
// ── i18n ──────────────────────────────────────────────
let currentLang = 'en';
const t = (key, ...args) => {
  const val = (window.I18N?.[currentLang]?.[key]) ?? (window.I18N?.en?.[key]) ?? key;
  return typeof val === 'function' ? val(...args) : val;
};
function setLang(lang, save=true) {
  currentLang = lang;
  if (save) localStorage.setItem('cb-lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = t(el.dataset.i18n); if (v !== el.dataset.i18n) el.textContent = v;
  });
  const btn = document.getElementById('lang-btn');
  if (btn) btn.textContent = lang === 'en' ? '🇹🇭 ภาษาไทย' : '🇬🇧 English';
  // update spin word display if active
  const spinEl = document.getElementById('spin-word');
  if (spinEl && P.currentSpin) spinEl.textContent = wwTranslate(P.currentSpin);
}
function toggleLang() { setLang(currentLang === 'en' ? 'th' : 'en'); }
const wwTranslate = w => (currentLang === 'th' && window.WW_TH?.[w]) || w;

// ── mark style ─────────────────────────────────────────
const MARK_STYLES = {
  cross: { char:'✕',  bg:'#e6394650', color:'var(--red)',  label:'✕' },
  coin:  { char:'🪙', bg:'#ffd70030', color:'var(--gold)', label:'🪙' },
  fire:  { char:'🔥', bg:'#ff450030', color:'#ff6600',     label:'🔥' },
  star:  { char:'⭐', bg:'#ffd70030', color:'var(--gold)', label:'⭐' },
  skull: { char:'💀', bg:'#ffffff18', color:'#ccc',        label:'💀' },
  crown: { char:'👑', bg:'#ffd70030', color:'var(--gold)', label:'👑' },
};
function setMarkStyle(id, save=true) {
  const s = MARK_STYLES[id] || MARK_STYLES.cross;
  document.documentElement.style.setProperty('--mark-char', `"${s.char}"`);
  document.documentElement.style.setProperty('--mark-bg', s.bg);
  document.documentElement.style.setProperty('--mark-color', s.color);
  if (save) localStorage.setItem('cb-mark-style', id);
  document.querySelectorAll('.mark-swatch').forEach(el => el.classList.toggle('active', el.dataset.style === id));
}

// ── photos setting ─────────────────────────────────────
let showPhotos = true;
function setPhotos(val, save=true) {
  showPhotos = val;
  if (save) localStorage.setItem('cb-photos', val ? '1' : '0');
  const chk = document.getElementById('chk-photos');
  if (chk) chk.checked = val;
  if (P.phase === 'game') renderGameGrid(); // re-render to show/hide images
}

function applyCellMax(save=true) {
  const val = parseInt(document.getElementById('cell-max-range').value);
  document.documentElement.style.setProperty('--cell-max', val + 'px');
  document.getElementById('cell-max-val').textContent = val + 'px';
  if (save) localStorage.setItem('cb-cell-max', val);
}

function resetSettings() {
  localStorage.removeItem('cb-theme');
  localStorage.removeItem('cb-font-family');
  localStorage.removeItem('cb-font-size');
  localStorage.removeItem('cb-lang');
  localStorage.removeItem('cb-photos');
  localStorage.removeItem('cb-cell-max');
  localStorage.removeItem('cb-mark-style');
  applyTheme('dark-purple');
  applyFontDirect('Segoe UI', 14);
  setLang('en');
  setPhotos(true);
  setMarkStyle('cross', false);
  document.getElementById('font-family-sel').value = 'Segoe UI';
  document.getElementById('font-size-range').value = '14';
  document.getElementById('fs-val').textContent = '14px';
  document.getElementById('cell-max-range').value = '120';
  document.getElementById('cell-max-val').textContent = '155px';
  document.documentElement.style.setProperty('--cell-max', '155px');
}

// ── Wiki image cache ───────────────────────────────────
const imgCache = {}; // { name: url | null }

async function fetchThumb(name, wikiUrl) {
  if (name in imgCache) return imgCache[name];
  imgCache[name] = null; // mark as fetching
  try {
    let title = wikiUrl
      ? wikiUrl.split('/wiki/')[1]
      : encodeURIComponent(name.replace(/ /g, '_'));
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    imgCache[name] = data.thumbnail?.source || null;
  } catch { imgCache[name] = null; }
  return imgCache[name];
}

async function prefetchGridImages() {
  const names = P.grid.flat().filter(n => n && n !== 'FREE' && !(n in imgCache));
  if (!names.length) return;
  await Promise.all(names.map(n => fetchThumb(n, P.wikiMap[n])));
  if (P.phase === 'game') renderGameGrid();
}

function loadSettings() {
  applyTheme(localStorage.getItem('cb-theme') || 'dark-purple', false);
  const fam = localStorage.getItem('cb-font-family') || 'Segoe UI';
  const sz  = parseInt(localStorage.getItem('cb-font-size') || '14');
  applyFontDirect(fam, sz, false);
  document.getElementById('font-family-sel').value = fam;
  document.getElementById('font-size-range').value = sz;
  document.getElementById('fs-val').textContent = sz + 'px';
  setLang(localStorage.getItem('cb-lang') || 'en', false);
  setPhotos(localStorage.getItem('cb-photos') !== '0', false);
  setMarkStyle(localStorage.getItem('cb-mark-style') || 'cross', false);
  const cm = parseInt(localStorage.getItem('cb-cell-max') || '155');
  document.documentElement.style.setProperty('--cell-max', cm + 'px');
  document.getElementById('cell-max-range').value = cm;
  document.getElementById('cell-max-val').textContent = cm + 'px';
}
function applyTheme(name, save=true) {
  const t = THEMES[name]; if (!t) return;
  Object.entries(t.vars).forEach(([k,v]) => document.documentElement.style.setProperty(k,v));
  if (save) localStorage.setItem('cb-theme', name);
  document.querySelectorAll('.tswatch').forEach(s => s.classList.toggle('active', s.dataset.theme===name));
}
function applyFont() {
  const fam = document.getElementById('font-family-sel').value;
  const sz  = parseInt(document.getElementById('font-size-range').value);
  document.getElementById('fs-val').textContent = sz + 'px';
  applyFontDirect(fam, sz);
}
function applyFontDirect(fam, sz, save=true) {
  document.documentElement.style.setProperty('--font', FONTS[fam] || fam);
  document.documentElement.style.setProperty('--fs', sz + 'px');
  if (save) { localStorage.setItem('cb-font-family', fam); localStorage.setItem('cb-font-size', sz); }
}
function toggleSettings() {
  document.getElementById('settings-drawer').classList.toggle('open');
  document.getElementById('drawer-overlay').classList.toggle('show');
}
function closeSettings() {
  document.getElementById('settings-drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('show');
}
function buildThemeGrid() {
  const g = document.getElementById('theme-grid');
  Object.entries(THEMES).forEach(([id,t]) => {
    const sw = document.createElement('div');
    sw.className='tswatch'; sw.title=t.label; sw.dataset.theme=id; sw.style.background=t.swatch;
    sw.onclick = () => applyTheme(id); g.appendChild(sw);
  });
}
function buildMarkGrid() {
  const g = document.getElementById('mark-grid'); if (!g) return;
  Object.entries(MARK_STYLES).forEach(([id, s]) => {
    const btn = document.createElement('button');
    btn.className = 'mark-swatch'; btn.title = id; btn.dataset.style = id;
    btn.textContent = s.char; btn.onclick = () => setMarkStyle(id);
    g.appendChild(btn);
  });
}

// ════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════
const P = {
  playerIdx:-1, playerName:'', names:[], wikiMap:{},
  gridSize:4, freeCenter:true, namesRepeat:true,
  takenNames:new Set(), grid:[], marked:[],
  playerNames:[], currentSpin:null,
  phase:'lobby', annCell:null, voteResolved:false,
  currentAnnouncerIdx:-1,
};
let dragName = null;
let selectedName = null;
let socket;

// ════════════════════════════════════════════════════════
// DEBUG STATUS BAR
// ════════════════════════════════════════════════════════
function dbg(msg, color) {
  try {
    const el = document.getElementById('dbg');
    if (el) { el.textContent = msg; if (color) el.style.color = color; }
  } catch(e) {}
  console.log('[CB]', msg);
}

// ════════════════════════════════════════════════════════
// SCREENS
// ════════════════════════════════════════════════════════
function show(id) {
  ['ph-lobby','ph-setup','ph-waiting','ph-game'].forEach(s =>
    document.getElementById(s).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}

// ════════════════════════════════════════════════════════
// LOBBY
// ════════════════════════════════════════════════════════
function renderLobby(players, phase) {
  const sub    = document.getElementById('lobby-sub');
  const spinner= document.getElementById('lobby-spinner');
  const grid   = document.getElementById('slot-grid');
  const err    = document.getElementById('lobby-err');

  if (phase === 'setup') {
    sub.textContent = t('lobby-wait-host');
    spinner.classList.remove('hidden');
    grid.classList.add('hidden');
    return;
  }
  sub.textContent = phase === 'game' ? t('lobby-in-progress') : t('lobby-select');
  spinner.classList.add('hidden');
  grid.classList.remove('hidden');
  grid.innerHTML = '';
  players.forEach(({idx, name, taken}) => {
    const btn = document.createElement('button');
    btn.className = 'slot-btn';
    btn.disabled = taken;
    btn.innerHTML = `<span class="slot-name">${name}</span>
      <span class="slot-badge ${taken?'taken':'open'}">${taken ? t('slot-taken') : t('slot-join')}</span>`;
    btn.onclick = () => {
      err.classList.add('hidden');
      socket.emit('player-claim', { playerIdx: idx });
    };
    grid.appendChild(btn);
  });
}

// ════════════════════════════════════════════════════════
// SOCKET SETUP
// ════════════════════════════════════════════════════════
function setupSocket() {
  dbg('⏳ Connecting to server…');
  // Start with polling for maximum compatibility, upgrade to WebSocket if possible
  socket = io({ query: { role: 'player' }, transports: ['polling', 'websocket'] });

  socket.on('connect', () => {
    dbg(`✓ Connected (${socket.id}) — waiting for lobby…`, '#52b788');
    // Auto-reclaim slot on reconnect so the server knows who this socket is
    if (P.playerIdx >= 0 && P.phase !== 'lobby') {
      dbg('↺ Reconnected — reclaiming slot…', '#ffd700');
      socket.emit('player-claim', { playerIdx: P.playerIdx });
    }
  });

  socket.on('announce-failed', (reason) => {
    const msgs = { 'no-spin':'Wait for the host to spin first', 'vote-active':'A vote is already in progress', 'not-claimed':'Reconnecting…' };
    dbg(`⚠ Announce blocked: ${msgs[reason]||reason}`, '#ffd700');
    if (reason === 'not-claimed' && P.playerIdx >= 0) socket.emit('player-claim', { playerIdx: P.playerIdx });
  });

  socket.on('connect_error', (err) => {
    dbg(`❌ Connection error: ${err.message}`, '#e63946');
  });

  socket.on('disconnect', (reason) => {
    dbg(`⚠ Disconnected: ${reason}`, '#ffd700');
  });

  socket.on('lobby-update', ({ phase, players }) => {
    dbg(`📋 Lobby: phase=${phase}, ${players?.length ?? 0} players`, '#a786df');
    if (P.phase === 'lobby') renderLobby(players, phase);
  });

  socket.on('claim-failed', (msg) => {
    const err = document.getElementById('lobby-err');
    err.textContent = msg; err.classList.remove('hidden');
  });

  socket.on('game-reset', () => location.reload());

  socket.on('player-init', (data) => {
    dbg(`✓ Slot claimed: ${data.playerName} (idx ${data.playerIdx})`, '#52b788');
    P.playerIdx   = data.playerIdx;
    P.playerName  = data.playerName;
    P.names       = data.names;
    P.wikiMap     = data.wikiMap || {};
    P.gridSize    = data.gridSize;
    P.freeCenter  = data.freeCenter;
    P.namesRepeat = data.namesRepeat;
    P.takenNames  = new Set(data.takenNames || []);
    P.playerNames = data.playerNames || [];
    document.documentElement.style.setProperty('--gsize', P.gridSize);
    document.title = `Celebrity Bingo — ${P.playerName}`;

    const mid = Math.floor(P.gridSize / 2);
    if (data.savedGrid) {
      P.grid = data.savedGrid; P.marked = data.savedMarked;
    } else {
      P.grid   = Array.from({length:P.gridSize}, () => Array(P.gridSize).fill(null));
      P.marked = Array.from({length:P.gridSize}, () => Array(P.gridSize).fill(false));
      if (P.freeCenter && P.gridSize % 2 === 1) {
        P.grid[mid][mid] = 'FREE'; P.marked[mid][mid] = true;
      }
    }

    if (data.gamePhase === 'game') {
      P.currentSpin = data.currentSpin; P.phase = 'game';
      show('ph-game');
      document.getElementById('player-name-label').textContent = P.playerName;
      document.getElementById('spin-word').textContent = P.currentSpin || t('spin-waiting');
      renderGameGrid();
      prefetchGridImages();
      if (P.currentSpin) document.getElementById('ann-btn').disabled = false;
      const hist = document.getElementById('hist-small');
      if (data.spinHistory) hist.innerHTML = data.spinHistory.slice(0,5).map(w=>`<span>${w}</span>`).join('');
    } else if (data.gamePhase === 'cards' && data.cardSetupDone) {
      P.phase = 'waiting'; show('ph-waiting');
    } else {
      P.phase = 'setup';
      document.getElementById('setup-title').textContent = `${P.playerName}'s Card`;
      show('ph-setup');
      renderDragNames(); renderSetupGrid(); updateProg();
    }
  });

  socket.on('taken-update', ({ takenNames }) => {
    P.takenNames = new Set(takenNames);
    if (P.phase === 'setup') renderDragNames();
  });

  socket.on('game-start', ({ playerNames, gridSize }) => {
    P.playerNames = playerNames; P.phase = 'game';
    show('ph-game');
    document.getElementById('player-name-label').textContent = P.playerName;
    renderGameGrid();
    prefetchGridImages(); // background fetch; re-renders when ready
  });

  socket.on('spin-reveal', ({ word, history }) => {
    P.currentSpin = word;
    clearAnnounceSelection();
    const el = document.getElementById('spin-word');
    el.textContent = wwTranslate(word); el.classList.remove('revealed');
    void el.offsetWidth; el.classList.add('revealed');
    const banner = document.querySelector('.spin-banner');
    if (banner) { banner.classList.remove('spin-lit'); void banner.offsetWidth; banner.classList.add('spin-lit'); }
    const flash = document.getElementById('flash');
    flash.classList.remove('go'); void flash.offsetWidth; flash.classList.add('go');
    playRevealSound();
    const hist = document.getElementById('hist-small');
    if (hist) hist.innerHTML = (history||[]).slice(0,5).map(w=>`<span>${w}</span>`).join('');
    const btn = document.getElementById('ann-btn');
    if (btn) btn.disabled = false;
  });

  socket.on('vote-open', ({ announcerIdx, announcerName, cellName, characteristic, wikiUrl }) => {
    P.voteResolved = false; P.currentAnnouncerIdx = announcerIdx;
    clearAnnounceSelection();
    document.getElementById('v-name').textContent = cellName;
    document.getElementById('v-char').textContent = t('tpl-matches', characteristic);
    const we = document.getElementById('v-wiki');
    we.innerHTML = wikiUrl ? `<a href="${wikiUrl}" target="_blank" rel="noopener">${t('wiki-link')}</a>` : '';
    const vImg = document.getElementById('v-img');
    if (vImg) { vImg.src = ''; vImg.classList.add('hidden'); fetchThumb(cellName, wikiUrl).then(src => { if (src) { vImg.src = src; vImg.classList.remove('hidden'); } }); }
    document.getElementById('vote-res').className = 'vote-res hidden';
    document.getElementById('btn-close-vote').classList.add('hidden');
    // Show cancel button only for the announcer, before vote resolves
    const cancelBtn = document.getElementById('btn-cancel-vote');
    if (cancelBtn) cancelBtn.classList.toggle('hidden', announcerIdx !== P.playerIdx);
    // Disable announce button while vote is in progress
    const annBtn = document.getElementById('ann-btn');
    if (annBtn) annBtn.disabled = true;
    renderVoteList();
    document.getElementById('vote-overlay').classList.remove('hidden');
  });

  socket.on('vote-update', () => { /* tally shown after result */ });

  socket.on('vote-result', ({ pass, yes, no }) => {
    P.voteResolved = true;
    clearAnnounceSelection();
    const res = document.getElementById('vote-res');
    res.className = `vote-res ${pass?'pass':'fail'}`;
    res.textContent = pass ? t('tpl-approved', yes, no) : t('tpl-rejected', yes, no);
    res.classList.remove('hidden');
    document.getElementById('btn-cancel-vote').classList.add('hidden');
    document.getElementById('btn-close-vote').classList.remove('hidden');
    document.querySelectorAll('.bv-yes,.bv-no').forEach(b => b.disabled = true);
    const annBtn = document.getElementById('ann-btn');
    if (pass) {
      P.currentSpin = null; // characteristic consumed, wait for next spin
      if (annBtn) annBtn.disabled = true;
    } else {
      if (annBtn && P.currentSpin) annBtn.disabled = false;
    }
  });

  socket.on('vote-cancelled', () => {
    document.getElementById('vote-overlay').classList.add('hidden');
    P.voteResolved = false;
    clearAnnounceSelection();
    document.getElementById('btn-cancel-vote').classList.add('hidden');
    const annBtn = document.getElementById('ann-btn');
    if (annBtn && P.currentSpin) annBtn.disabled = false;
  });

  socket.on('mark-cell', ({ row, col }) => {
    P.marked[row][col] = true; renderGameGrid();
  });

  socket.on('game-won', ({ winnerName }) => {
    document.getElementById('win-name').textContent = `${winnerName} wins! 🎉`;
    document.getElementById('win-overlay').classList.remove('hidden');
    const btn = document.getElementById('ann-btn'); if (btn) btn.disabled = true;
  });
}

// ════════════════════════════════════════════════════════
// CARD SETUP — DRAG & DROP
// ════════════════════════════════════════════════════════
function usedNames() {
  const s = new Set();
  P.grid.flat().forEach(n => { if (n && n !== 'FREE') s.add(n); });
  return s;
}
let setupPhotosOn = false;
function toggleSetupPhotos() {
  setupPhotosOn = !setupPhotosOn;
  const btn = document.getElementById('btn-setup-photos');
  const list = document.getElementById('drag-names');
  if (btn) btn.textContent = setupPhotosOn ? '📷 Hide Photos' : '📷 Show Photos';
  if (list) list.classList.toggle('setup-photos-on', setupPhotosOn);
  if (setupPhotosOn) {
    // Fetch any missing images
    P.names.forEach(n => { if (!(n in imgCache)) fetchThumb(n, P.wikiMap[n]).then(() => renderDragNames()); });
  }
  renderDragNames();
}

function setSelectionIndicator(name) {
  const ind = document.getElementById('sel-indicator');
  if (name) {
    ind.textContent = `Placing: ${name} — tap a cell`;
    ind.classList.remove('hidden');
  } else {
    ind.classList.add('hidden');
  }
  document.getElementById('setup-grid')?.classList.toggle('has-sel', !!name);
}

function renderDragNames() {
  const list = document.getElementById('drag-names'); list.innerHTML = '';
  const used = usedNames();
  P.names.forEach(name => {
    const unavail = used.has(name) || (!P.namesRepeat && P.takenNames.has(name));
    const item = document.createElement('div');
    item.className = 'n-item' + (unavail ? ' used' : '') + (selectedName === name ? ' selected' : '');

    // Thumbnail (visible only when setup photos on)
    const thumb = document.createElement('img');
    thumb.className = 'n-item-thumb'; thumb.alt = name;
    if (imgCache[name]) { thumb.src = imgCache[name]; }
    else { thumb.style.display = 'none'; }
    item.appendChild(thumb);

    const nameSpan = document.createElement('span');
    nameSpan.textContent = name;
    nameSpan.style.flex = '1';
    item.appendChild(nameSpan);

    if (P.wikiMap[name]) {
      const wb = document.createElement('button');
      wb.className = 'n-item-wiki'; wb.textContent = '🔗'; wb.title = 'Wikipedia';
      wb.onclick = e => { e.stopPropagation(); window.open(P.wikiMap[name], '_blank', 'noopener'); };
      item.appendChild(wb);
    }

    if (!unavail) {
      item.draggable = true;
      item.addEventListener('dragstart', e => {
        dragName = name;
        // Don't call renderDragNames() here — it destroys the DOM element mid-drag
        // Just visually clear any selection state directly
        selectedName = null; setSelectionIndicator(null);
        document.querySelectorAll('.n-item.selected').forEach(el => el.classList.remove('selected'));
        item.classList.add('dragging'); e.dataTransfer.effectAllowed = 'move';
      });
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        dragName = null;
        renderDragNames(); // safe to re-render after drag is fully done
      });
      item.addEventListener('click', e => {
        if (e.defaultPrevented) return; // ignore if drag just ended
        selectedName = selectedName === name ? null : name;
        setSelectionIndicator(selectedName);
        renderDragNames();
      });
    }
    list.appendChild(item);
  });
}
function renderSetupGrid() {
  const grid = document.getElementById('setup-grid');
  grid.style.gridTemplateColumns = `repeat(${P.gridSize}, 1fr)`; grid.innerHTML = '';
  const mid = Math.floor(P.gridSize / 2);
  for (let r = 0; r < P.gridSize; r++) for (let c = 0; c < P.gridSize; c++) {
    const isFree = P.freeCenter && P.gridSize%2===1 && r===mid && c===mid;
    const cell = document.createElement('div');
    if (isFree) { cell.className='bc free'; cell.textContent='★ FREE'; }
    else {
      const name = P.grid[r][c];
      cell.className = 'bc' + (name?' filled':''); cell.textContent = name||'Drop here';
      if (name) {
        const x = document.createElement('button'); x.className='cx'; x.textContent='×';
        x.onclick = e => { e.stopPropagation(); clearCell(r,c); }; cell.appendChild(x);
      }
      cell.addEventListener('dragover', e => { e.preventDefault(); cell.classList.add('hover-over'); });
      cell.addEventListener('dragleave', () => cell.classList.remove('hover-over'));
      cell.addEventListener('drop', e => { e.preventDefault(); cell.classList.remove('hover-over'); if(dragName) dropCell(r,c,dragName); });
      cell.addEventListener('click', () => {
        if (!selectedName) return;
        const oldName = P.grid[r][c];
        P.grid[r][c] = null; // temporarily clear so usedNames() doesn't count it
        if (usedNames().has(selectedName)) { P.grid[r][c] = oldName; return; }
        P.grid[r][c] = selectedName;
        selectedName = null; setSelectionIndicator(null);
        renderSetupGrid(); renderDragNames(); updateProg();
      });
    }
    grid.appendChild(cell);
  }
}
function dropCell(r,c,name) {
  if(usedNames().has(name)) return;
  P.grid[r][c]=name; renderSetupGrid(); renderDragNames(); updateProg();
}
function clearCell(r,c) { P.grid[r][c]=null; renderSetupGrid(); renderDragNames(); updateProg(); }
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function autoFill() {
  const mid = Math.floor(P.gridSize / 2);
  // Always clear first so re-clicking gives a fully new random card
  for (let r = 0; r < P.gridSize; r++)
    for (let c = 0; c < P.gridSize; c++) {
      const isFree = P.freeCenter && P.gridSize % 2 === 1 && r === mid && c === mid;
      if (!isFree) P.grid[r][c] = null;
    }
  const available = shuffle(P.names.filter(n => P.namesRepeat || !P.takenNames.has(n)));
  let idx = 0;
  for (let r = 0; r < P.gridSize; r++)
    for (let c = 0; c < P.gridSize; c++) {
      const isFree = P.freeCenter && P.gridSize % 2 === 1 && r === mid && c === mid;
      if (!isFree && idx < available.length) P.grid[r][c] = available[idx++];
    }
  renderSetupGrid(); renderDragNames(); updateProg();
}

function clearCard() {
  selectedName = null; setSelectionIndicator(null);
  const mid=Math.floor(P.gridSize/2);
  for(let r=0;r<P.gridSize;r++) for(let c=0;c<P.gridSize;c++){
    if(P.freeCenter&&P.gridSize%2===1&&r===mid&&c===mid) continue;
    P.grid[r][c]=null;
  }
  renderSetupGrid(); renderDragNames(); updateProg();
}
function filledCount() {
  const mid=Math.floor(P.gridSize/2); let n=0;
  for(let r=0;r<P.gridSize;r++) for(let c=0;c<P.gridSize;c++){
    if(P.freeCenter&&P.gridSize%2===1&&r===mid&&c===mid) continue;
    if(P.grid[r][c]) n++;
  }
  return n;
}
function totalCells() { return P.gridSize*P.gridSize-(P.freeCenter&&P.gridSize%2===1?1:0); }
function updateProg() {
  const left=totalCells()-filledCount();
  document.getElementById('cells-left').textContent=left;
  document.getElementById('prog').style.display=left===0?'none':'block';
  document.getElementById('btn-done').disabled=left>0;
}
function doneSetup() {
  if(filledCount()<totalCells()) return;
  socket.emit('player-card-done',{playerIdx:P.playerIdx, grid:P.grid});
  prefetchGridImages(); // start fetching while waiting for game to start
  show('ph-waiting');
}

// ════════════════════════════════════════════════════════
// GAME GRID
// ════════════════════════════════════════════════════════
function renderGameGrid() {
  const grid=document.getElementById('game-grid');
  grid.style.gridTemplateColumns=`repeat(${P.gridSize},1fr)`; grid.innerHTML='';
  const mid=Math.floor(P.gridSize/2);
  for(let r=0;r<P.gridSize;r++) for(let c=0;c<P.gridSize;c++){
    const isFree=P.freeCenter&&P.gridSize%2===1&&r===mid&&c===mid;
    const name=P.grid[r][c];
    const hasImg=!isFree&&name&&showPhotos&&imgCache[name];
    const cell=document.createElement('div');
    cell.className='mc'+(isFree?' free-c':'')+(P.marked[r][c]?' marked':'')+(hasImg?' has-img':'');

    if(isFree){
      const span=document.createElement('span');
      span.textContent='FREE';
      span.style.cssText='font-weight:700;font-size:11px;color:var(--accent)';
      cell.appendChild(span);
    } else {
      if(hasImg){
        const img=document.createElement('img');
        img.className='cell-img'; img.src=imgCache[name]; img.alt=name;
        img.onerror=()=>{cell.classList.remove('has-img');img.remove();};
        cell.appendChild(img);
      }
      const label=document.createElement('div');
      label.className='cell-label';
      label.textContent=name||'';
      cell.appendChild(label);
      if(P.wikiMap[name]){
        const wb=document.createElement('button'); wb.className='wiki-btn'; wb.textContent='🔗'; wb.title='Wikipedia';
        wb.onclick=e=>{e.stopPropagation();window.open(P.wikiMap[name],'_blank','noopener');};
        cell.appendChild(wb);
      }
      if(!P.marked[r][c]){
        cell.style.cursor='pointer';
        cell.addEventListener('click',()=>selectCellForAnnounce(cell,r,c,name));
      }
    }
    grid.appendChild(cell);
  }
}

// ════════════════════════════════════════════════════════
// ANNOUNCE — hybrid tap-to-select on card
// ════════════════════════════════════════════════════════
function clearAnnounceSelection() {
  P.annCell = null;
  document.querySelectorAll('.mc.sel-ann').forEach(el => el.classList.remove('sel-ann'));
  const hint = document.getElementById('ann-pre-hint');
  const content = document.getElementById('ann-pre-content');
  if (hint) hint.classList.remove('hidden');
  if (content) content.classList.add('hidden');
}

function selectCellForAnnounce(cellEl, r, c, name) {
  if (!P.currentSpin) return;
  document.querySelectorAll('.mc.sel-ann').forEach(el => el.classList.remove('sel-ann'));
  cellEl.classList.add('sel-ann');
  P.annCell = { row: r, col: c, name };
  const hint = document.getElementById('ann-pre-hint');
  const content = document.getElementById('ann-pre-content');
  const nameEl = document.getElementById('ann-pre-name');
  const imgEl = document.getElementById('ann-pre-img');
  const wikiEl = document.getElementById('ann-pre-wiki');
  if (hint) hint.classList.add('hidden');
  if (content) content.classList.remove('hidden');
  if (nameEl) nameEl.textContent = name;
  if (imgEl) { imgEl.src = ''; imgEl.classList.add('hidden'); }
  if (wikiEl) {
    if (P.wikiMap[name]) { wikiEl.href = P.wikiMap[name]; wikiEl.classList.remove('hidden'); }
    else wikiEl.classList.add('hidden');
  }
  if (imgEl) fetchThumb(name, P.wikiMap[name]).then(src => {
    if (src) { imgEl.src = src; imgEl.classList.remove('hidden'); }
  });
}

function doAnnounceBtn() {
  if (!P.currentSpin) return;
  if (!P.annCell) {
    const hint = document.getElementById('ann-pre-hint');
    if (hint) { hint.style.color = 'var(--gold)'; hint.textContent = 'Tap a cell first!'; setTimeout(() => { hint.style.color = ''; hint.textContent = 'Tap a cell on your card to select it'; }, 1800); }
    return;
  }
  socket.emit('player-announce', { playerIdx: P.playerIdx, row: P.annCell.row, col: P.annCell.col, name: P.annCell.name });
  clearAnnounceSelection();
}

function openAnnounce() {
  if(!P.currentSpin) return;
  P.annCell=null; document.getElementById('ann-char').textContent=`"${P.currentSpin}"`;
  document.getElementById('btn-confirm-ann').disabled=true;
  const list=document.getElementById('ann-list'); list.innerHTML='';
  const mid=Math.floor(P.gridSize/2);
  const items=[];
  for(let r=0;r<P.gridSize;r++) for(let c=0;c<P.gridSize;c++){
    const isFree=P.freeCenter&&P.gridSize%2===1&&r===mid&&c===mid;
    if(isFree||P.marked[r][c]) continue;
    const name=P.grid[r][c]; if(!name) continue;
    const item=document.createElement('div'); item.className='nsl-item';
    // thumbnail
    const img=document.createElement('img'); img.className='nsl-thumb'; img.alt='';
    img.src=''; img.style.display='none';
    item.appendChild(img);
    // info section
    const info=document.createElement('div'); info.className='nsl-info';
    const ns=document.createElement('span'); ns.textContent=name; info.appendChild(ns);
    if(P.wikiMap[name]){
      const wb=document.createElement('button'); wb.className='nsl-wiki'; wb.textContent=t('wiki-btn');
      wb.onclick=e=>{e.stopPropagation();window.open(P.wikiMap[name],'_blank','noopener');}; info.appendChild(wb);
    }
    item.appendChild(info);
    item.onclick=()=>{
      document.querySelectorAll('.nsl-item').forEach(i=>i.classList.remove('sel'));
      item.classList.add('sel'); P.annCell={row:r,col:c,name};
      document.getElementById('btn-confirm-ann').disabled=false;
    };
    list.appendChild(item);
    items.push({name, img, wikiUrl: P.wikiMap[name]||null});
  }
  if(!list.children.length) list.innerHTML='<p style="color:var(--dim);font-size:12px;text-align:center;padding:10px">All cells already marked!</p>';
  document.getElementById('ann-overlay').classList.remove('hidden');
  // load thumbnails async
  items.forEach(({name,img,wikiUrl})=>{
    fetchThumb(name,wikiUrl).then(src=>{
      if(src){ img.src=src; img.style.display='block'; }
    });
  });
}
function closeAnnounce() { document.getElementById('ann-overlay').classList.add('hidden'); P.annCell=null; }
function confirmAnnounce() {
  if(!P.annCell) return;
  document.getElementById('ann-overlay').classList.add('hidden');
  socket.emit('player-announce',{playerIdx:P.playerIdx,row:P.annCell.row,col:P.annCell.col,name:P.annCell.name});
  P.annCell=null;
}

// ════════════════════════════════════════════════════════
// VOTE
// ════════════════════════════════════════════════════════
function renderVoteList() {
  const list=document.getElementById('vote-list'); list.innerHTML='';
  P.playerNames.forEach((name,i)=>{
    const row=document.createElement('div'); row.className='vi'; row.id=`vi-row-${i}`;
    if(i===P.currentAnnouncerIdx){
      // Announcer: auto-yes, no buttons
      row.innerHTML=`<span class="vn">${name} <span style="font-size:10px;color:var(--muted)">${t('announcer-lbl')}</span></span>
        <span style="font-size:11px;font-weight:700;color:#52b788">${t('auto-yes')}</span>`;
    } else if(i===P.playerIdx){
      // My row: show my vote buttons
      row.innerHTML=`<span class="vn">${name}</span>
        <div class="vb">
          <button class="bv-yes" id="my-vote-yes" onclick="castVote(${i},true)">${t('vote-yes')}</button>
          <button class="bv-no"  id="my-vote-no"  onclick="castVote(${i},false)">${t('vote-no')}</button>
        </div>`;
    } else {
      // Other players: show waiting status only
      row.innerHTML=`<span class="vn">${name}</span>
        <span id="vi-status-${i}" style="font-size:11px;color:var(--dim)">…</span>`;
    }
    list.appendChild(row);
  });
}
function castVote(voterIdx,value) {
  if(P.voteResolved) return;
  const yBtn=document.getElementById('my-vote-yes');
  const nBtn=document.getElementById('my-vote-no');
  if(yBtn) yBtn.disabled=true;
  if(nBtn) nBtn.disabled=true;
  if(yBtn&&value)  yBtn.className='bv-yes voted';
  if(nBtn&&!value) nBtn.className='bv-no voted';
  socket.emit('player-vote',{voterIdx,value});
}
function closeVote() { document.getElementById('vote-overlay').classList.add('hidden'); }
function requestCancelVote() {
  if (!confirm('Cancel your announcement? The vote will close for all players.')) return;
  socket.emit('player-cancel-vote', { playerIdx: P.playerIdx });
}

// ════════════════════════════════════════════════════════
// SOUND
// ════════════════════════════════════════════════════════
function playRevealSound() {
  try {
    const ctx=new AudioContext();
    [523,659,784].forEach((freq,i)=>{
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='sine';osc.frequency.value=freq;
      const t=ctx.currentTime+i*.1;
      gain.gain.setValueAtTime(.2,t);gain.gain.exponentialRampToValueAtTime(.001,t+.5);
      osc.start(t);osc.stop(t+.5);
    });
  } catch(e){}
}

// ════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════
// Catch any uncaught JS errors and show them in the status bar
window.addEventListener('error', (e) => {
  dbg(`❌ JS Error: ${e.message} (${e.filename?.split('/').pop()}:${e.lineno})`, '#e63946');
});
window.addEventListener('unhandledrejection', (e) => {
  dbg(`❌ Promise error: ${e.reason}`, '#e63946');
});

window.addEventListener('DOMContentLoaded', () => {
  dbg('⏳ DOM ready, initialising…');
  try {
    buildThemeGrid();
    buildMarkGrid();
    loadSettings();
    dbg('⏳ Settings loaded, connecting…');
    setupSocket();
  } catch(e) {
    dbg(`❌ Init error: ${e.message}`, '#e63946');
  }
});
