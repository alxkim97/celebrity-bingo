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
}
function toggleLang() { setLang(currentLang === 'en' ? 'th' : 'en'); }

// ── photos setting ─────────────────────────────────────
let showPhotos = true;
function setPhotos(val, save=true) {
  showPhotos = val;
  if (save) localStorage.setItem('cb-photos', val ? '1' : '0');
  const chk = document.getElementById('chk-photos');
  if (chk) chk.checked = val;
  if (P.phase === 'game') renderGameGrid(); // re-render to show/hide images
}

function resetSettings() {
  localStorage.removeItem('cb-theme');
  localStorage.removeItem('cb-font-family');
  localStorage.removeItem('cb-font-size');
  localStorage.removeItem('cb-lang');
  localStorage.removeItem('cb-photos');
  applyTheme('dark-purple');
  applyFontDirect('Segoe UI', 14);
  setLang('en');
  setPhotos(true);
  document.getElementById('font-family-sel').value = 'Segoe UI';
  document.getElementById('font-size-range').value = '14';
  document.getElementById('fs-val').textContent = '14px';
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
    const el = document.getElementById('spin-word');
    el.textContent = word; el.classList.remove('revealed');
    void el.offsetWidth; el.classList.add('revealed');
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
    document.getElementById('v-name').textContent = cellName;
    document.getElementById('v-char').textContent = t('tpl-matches', characteristic);
    const we = document.getElementById('v-wiki');
    we.innerHTML = wikiUrl ? `<a href="${wikiUrl}" target="_blank" rel="noopener">${t('wiki-link')}</a>` : '';
    document.getElementById('vote-res').className = 'vote-res hidden';
    document.getElementById('btn-close-vote').classList.add('hidden');
    renderVoteList();
    document.getElementById('vote-overlay').classList.remove('hidden');
  });

  socket.on('vote-update', () => { /* tally shown after result */ });

  socket.on('vote-result', ({ pass, yes, no }) => {
    P.voteResolved = true;
    const res = document.getElementById('vote-res');
    res.className = `vote-res ${pass?'pass':'fail'}`;
    res.textContent = pass ? t('tpl-approved', yes, no) : t('tpl-rejected', yes, no);
    res.classList.remove('hidden');
    document.getElementById('btn-close-vote').classList.remove('hidden');
    document.querySelectorAll('.bv-yes,.bv-no').forEach(b => b.disabled = true);
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
function renderDragNames() {
  const list = document.getElementById('drag-names'); list.innerHTML = '';
  const used = usedNames();
  P.names.forEach(name => {
    const unavail = used.has(name) || (!P.namesRepeat && P.takenNames.has(name));
    const item = document.createElement('div');
    item.className = 'n-item' + (unavail ? ' used' : '');
    item.textContent = name;
    if (!unavail) {
      item.draggable = true;
      item.addEventListener('dragstart', e => { dragName=name; item.classList.add('dragging'); e.dataTransfer.effectAllowed='move'; });
      item.addEventListener('dragend', () => item.classList.remove('dragging'));
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
  const used = usedNames();
  const available = shuffle(P.names.filter(n =>
    !used.has(n) && (P.namesRepeat || !P.takenNames.has(n))
  ));
  let idx = 0;
  for (let r = 0; r < P.gridSize; r++) {
    for (let c = 0; c < P.gridSize; c++) {
      const isFree = P.freeCenter && P.gridSize % 2 === 1 && r === mid && c === mid;
      if (isFree || P.grid[r][c]) continue;
      if (idx < available.length) P.grid[r][c] = available[idx++];
    }
  }
  renderSetupGrid(); renderDragNames(); updateProg();
}

function clearCard() {
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
    const cell=document.createElement('div');
    cell.className='mc'+(isFree?' free-c':'')+(P.marked[r][c]?' marked':'');

    // Celebrity photo (if available and enabled)
    if(!isFree && name && showPhotos && imgCache[name]) {
      const img=document.createElement('img');
      img.className='cell-img'; img.src=imgCache[name]; img.alt=name;
      img.onerror=()=>img.remove();
      cell.appendChild(img);
    }

    const span=document.createElement('span');
    span.textContent=isFree?'FREE':(name||'');
    span.style.cssText='padding:2px 3px;text-align:center;font-size:calc(var(--fs) - 4px);line-height:1.2;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical';
    cell.appendChild(span);

    if(!isFree&&name&&P.wikiMap[name]){
      const wb=document.createElement('button'); wb.className='wiki-btn'; wb.textContent='🔗'; wb.title='Wikipedia';
      wb.onclick=e=>{e.stopPropagation();window.open(P.wikiMap[name],'_blank','noopener');};
      cell.appendChild(wb);
    }
    grid.appendChild(cell);
  }
}

// ════════════════════════════════════════════════════════
// ANNOUNCE
// ════════════════════════════════════════════════════════
function openAnnounce() {
  if(!P.currentSpin) return;
  P.annCell=null; document.getElementById('ann-char').textContent=`"${P.currentSpin}"`;
  document.getElementById('btn-confirm-ann').disabled=true;
  const list=document.getElementById('ann-list'); list.innerHTML='';
  const mid=Math.floor(P.gridSize/2);
  for(let r=0;r<P.gridSize;r++) for(let c=0;c<P.gridSize;c++){
    const isFree=P.freeCenter&&P.gridSize%2===1&&r===mid&&c===mid;
    if(isFree||P.marked[r][c]) continue;
    const name=P.grid[r][c]; if(!name) continue;
    const item=document.createElement('div'); item.className='nsl-item';
    const ns=document.createElement('span'); ns.textContent=name; item.appendChild(ns);
    if(P.wikiMap[name]){
      const wb=document.createElement('button'); wb.className='nsl-wiki'; wb.textContent=t('wiki-btn');
      wb.onclick=e=>{e.stopPropagation();window.open(P.wikiMap[name],'_blank','noopener');}; item.appendChild(wb);
    }
    item.onclick=()=>{
      document.querySelectorAll('.nsl-item').forEach(i=>i.classList.remove('sel'));
      item.classList.add('sel'); P.annCell={row:r,col:c,name};
      document.getElementById('btn-confirm-ann').disabled=false;
    };
    list.appendChild(item);
  }
  if(!list.children.length) list.innerHTML='<p style="color:var(--dim);font-size:12px;text-align:center;padding:10px">All cells already marked!</p>';
  document.getElementById('ann-overlay').classList.remove('hidden');
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
    const row=document.createElement('div'); row.className='vi';
    if(i===P.currentAnnouncerIdx){
      row.innerHTML=`<span class="vn">${name} <span style="font-size:10px;color:var(--muted)">${t('announcer-lbl')}</span></span>
        <span style="font-size:11px;font-weight:700;color:#52b788">${t('auto-yes')}</span>`;
    } else {
      row.innerHTML=`<span class="vn">${name}</span>
        <div class="vb">
          <button class="bv-yes" onclick="castVote(${i},true)">${t('vote-yes')}</button>
          <button class="bv-no"  onclick="castVote(${i},false)">${t('vote-no')}</button>
        </div>`;
    }
    list.appendChild(row);
  });
}
function castVote(voterIdx,value) {
  if(P.voteResolved) return;
  const rows=document.querySelectorAll('.vi');
  if(rows[voterIdx]){
    rows[voterIdx].querySelectorAll('button').forEach(b=>b.disabled=true);
    rows[voterIdx].querySelector(value?'.bv-yes':'.bv-no').className=value?'bv-yes voted':'bv-no voted';
  }
  socket.emit('player-vote',{voterIdx,value});
}
function closeVote() { document.getElementById('vote-overlay').classList.add('hidden'); }

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
    loadSettings();
    dbg('⏳ Settings loaded, connecting…');
    setupSocket();
  } catch(e) {
    dbg(`❌ Init error: ${e.message}`, '#e63946');
  }
});
