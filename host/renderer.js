// ════════════════════════════════════════════════════════
// THEMES / SETTINGS
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
  if (document.getElementById('ww-grid')) renderWWPool();
  if (document.getElementById('nm-grid')) renderNMPool();
  if (currentWheelWords && currentWheelWords.length && !S.spinning) drawWheel(currentWheelWords, S.wheelAngle);
  const srEl = document.getElementById('sr-word');
  if (srEl && S.currentSpin) srEl.textContent = wwTranslate(S.currentSpin);
}
function toggleLang() { setLang(currentLang === 'en' ? 'th' : 'en'); }
const wwTranslate = w => (currentLang === 'th' && window.WW_TH?.[w]) || w;

// ── photos setting ─────────────────────────────────────
let showPhotos = true;
function setPhotos(val, save=true) {
  showPhotos = val;
  if (save) localStorage.setItem('cb-photos', val ? '1' : '0');
  const chk = document.getElementById('chk-photos');
  if (chk) chk.checked = val;
}

function resetSettings() {
  localStorage.removeItem('cb-theme');
  localStorage.removeItem('cb-font-family');
  localStorage.removeItem('cb-font-size');
  localStorage.removeItem('cb-lang');
  localStorage.removeItem('cb-photos');
  localStorage.removeItem('cb-wheel-size');
  applyTheme('dark-purple');
  applyFontDirect('Segoe UI', 14);
  setLang('en');
  setPhotos(true);
  document.getElementById('font-family-sel').value = 'Segoe UI';
  document.getElementById('font-size-range').value = '14';
  document.getElementById('fs-val').textContent = '14px';
  document.getElementById('wheel-size-range').value = '480';
  applyWheelSize(480, false);
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
  const wSz = parseInt(localStorage.getItem('cb-wheel-size') || '480');
  applyWheelSize(wSz, false);
  document.getElementById('wheel-size-range').value = wSz;
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
// POOL DATA
// ════════════════════════════════════════════════════════
const WW_PRESETS = [
  'Billionaire','American','Scientist','Athlete','Actor / Actress','Musician','Politician',
  'Fictional character','Non-human','Female','Male','Under 30 years old','Over 60 years old',
  'Taller than 180 cm','Nobel Prize winner','Olympic gold medalist','Has a PhD','Born in Asia',
  'Born in Europe','Has a superpower','Villain','Hero','Royalty','Deceased','Currently alive',
  'CEO or Founder','Anime character','Movie character','Book character','Cartoon character',
  'From the 1900s','From the 2000s','Married','Single','Animal','Robot or AI','Alien',
  'Speaks multiple languages','Has red hair','Person of color','From a franchise',
  'Won a Grammy','Has been to space',
  // funny / convoluted
  'Has been arrested','Has won an Oscar','Is a meme','Has a biopic',
  'Has a nemesis','Probably owns a yacht','Has a fragrance line',
  'Has been in a video game','Born before the internet','Could beat Goku',
  'Would be a terrible roommate','Wikipedia has a Controversy section',
  'Knows martial arts','Has broken a world record','Has merchandise',
  'Been cancelled online','Has a catchphrase','Would survive the apocalypse',
  'Speaks only one language','Has a statue','Might be immortal',
  'Never won a major award','Is probably a spy','Would join reality TV',
  'Has a secret lair','Canonically stronger than your dad',
  'Would be sorted into Slytherin',
];
const NM_PRESETS = [
  {n:'Elon Musk',w:'https://en.wikipedia.org/wiki/Elon_Musk'},
  {n:'Albert Einstein',w:'https://en.wikipedia.org/wiki/Albert_Einstein'},
  {n:'Marie Curie',w:'https://en.wikipedia.org/wiki/Marie_Curie'},
  {n:'Nikola Tesla',w:'https://en.wikipedia.org/wiki/Nikola_Tesla'},
  {n:'Barack Obama',w:'https://en.wikipedia.org/wiki/Barack_Obama'},
  {n:'Taylor Swift',w:'https://en.wikipedia.org/wiki/Taylor_Swift'},
  {n:'Beyoncé',w:'https://en.wikipedia.org/wiki/Beyonc%C3%A9'},
  {n:'LeBron James',w:'https://en.wikipedia.org/wiki/LeBron_James'},
  {n:'Harry Potter',w:'https://en.wikipedia.org/wiki/Harry_Potter_(character)'},
  {n:'Hermione Granger',w:'https://en.wikipedia.org/wiki/Hermione_Granger'},
  {n:'Tony Stark',w:'https://en.wikipedia.org/wiki/Iron_Man'},
  {n:'Batman',w:'https://en.wikipedia.org/wiki/Batman'},
  {n:'Spider-Man',w:'https://en.wikipedia.org/wiki/Spider-Man'},
  {n:'Oprah Winfrey',w:'https://en.wikipedia.org/wiki/Oprah_Winfrey'},
  {n:'Stephen Hawking',w:'https://en.wikipedia.org/wiki/Stephen_Hawking'},
  {n:'Nelson Mandela',w:'https://en.wikipedia.org/wiki/Nelson_Mandela'},
  {n:'Cristiano Ronaldo',w:'https://en.wikipedia.org/wiki/Cristiano_Ronaldo'},
  {n:'Lionel Messi',w:'https://en.wikipedia.org/wiki/Lionel_Messi'},
  {n:'Serena Williams',w:'https://en.wikipedia.org/wiki/Serena_Williams'},
  {n:'Simone Biles',w:'https://en.wikipedia.org/wiki/Simone_Biles'},
  {n:'Leonardo da Vinci',w:'https://en.wikipedia.org/wiki/Leonardo_da_Vinci'},
  {n:'Shakespeare',w:'https://en.wikipedia.org/wiki/William_Shakespeare'},
  {n:'Cleopatra',w:'https://en.wikipedia.org/wiki/Cleopatra'},
  {n:'Napoleon Bonaparte',w:'https://en.wikipedia.org/wiki/Napoleon'},
  {n:'Abraham Lincoln',w:'https://en.wikipedia.org/wiki/Abraham_Lincoln'},
  {n:'Martin Luther King Jr.',w:'https://en.wikipedia.org/wiki/Martin_Luther_King_Jr.'},
  {n:'Mahatma Gandhi',w:'https://en.wikipedia.org/wiki/Mahatma_Gandhi'},
  {n:'Jeff Bezos',w:'https://en.wikipedia.org/wiki/Jeff_Bezos'},
  {n:'Mark Zuckerberg',w:'https://en.wikipedia.org/wiki/Mark_Zuckerberg'},
  {n:'Bill Gates',w:'https://en.wikipedia.org/wiki/Bill_Gates'},
  {n:'Steve Jobs',w:'https://en.wikipedia.org/wiki/Steve_Jobs'},
  {n:'Marilyn Monroe',w:'https://en.wikipedia.org/wiki/Marilyn_Monroe'},
  {n:'Elvis Presley',w:'https://en.wikipedia.org/wiki/Elvis_Presley'},
  {n:'Michael Jackson',w:'https://en.wikipedia.org/wiki/Michael_Jackson'},
  {n:'Darth Vader',w:'https://en.wikipedia.org/wiki/Darth_Vader'},
  {n:'Yoda',w:'https://en.wikipedia.org/wiki/Yoda'},
  {n:'Gandalf',w:'https://en.wikipedia.org/wiki/Gandalf'},
  {n:'Sherlock Holmes',w:'https://en.wikipedia.org/wiki/Sherlock_Holmes'},
  {n:'Mickey Mouse',w:'https://en.wikipedia.org/wiki/Mickey_Mouse'},
  {n:'Pikachu',w:'https://en.wikipedia.org/wiki/Pikachu'},
  {n:'Goku',w:'https://en.wikipedia.org/wiki/Goku'},
  {n:'Wonder Woman',w:'https://en.wikipedia.org/wiki/Wonder_Woman'},
  {n:'Black Panther',w:'https://en.wikipedia.org/wiki/Black_Panther_(character)'},
  {n:'Frodo Baggins',w:'https://en.wikipedia.org/wiki/Frodo_Baggins'},
  {n:'Daenerys Targaryen',w:'https://en.wikipedia.org/wiki/Daenerys_Targaryen'},
  // Real celebrities — fan favourites & funny matches
  {n:'The Rock',w:'https://en.wikipedia.org/wiki/Dwayne_Johnson'},
  {n:'Nicolas Cage',w:'https://en.wikipedia.org/wiki/Nicolas_Cage'},
  {n:'Keanu Reeves',w:'https://en.wikipedia.org/wiki/Keanu_Reeves'},
  {n:'Morgan Freeman',w:'https://en.wikipedia.org/wiki/Morgan_Freeman'},
  {n:'Jeff Goldblum',w:'https://en.wikipedia.org/wiki/Jeff_Goldblum'},
  {n:'Chuck Norris',w:'https://en.wikipedia.org/wiki/Chuck_Norris'},
  {n:'Arnold Schwarzenegger',w:'https://en.wikipedia.org/wiki/Arnold_Schwarzenegger'},
  {n:'Tom Hanks',w:'https://en.wikipedia.org/wiki/Tom_Hanks'},
  {n:'Angelina Jolie',w:'https://en.wikipedia.org/wiki/Angelina_Jolie'},
  {n:'Will Smith',w:'https://en.wikipedia.org/wiki/Will_Smith'},
  {n:'Johnny Depp',w:'https://en.wikipedia.org/wiki/Johnny_Depp'},
  {n:'Eminem',w:'https://en.wikipedia.org/wiki/Eminem'},
  {n:'Kanye West',w:'https://en.wikipedia.org/wiki/Kanye_West'},
  {n:'Lady Gaga',w:'https://en.wikipedia.org/wiki/Lady_Gaga'},
  {n:'Drake',w:'https://en.wikipedia.org/wiki/Drake_(musician)'},
  {n:'Nicki Minaj',w:'https://en.wikipedia.org/wiki/Nicki_Minaj'},
  {n:'Michael Jordan',w:'https://en.wikipedia.org/wiki/Michael_Jordan'},
  {n:'Kobe Bryant',w:'https://en.wikipedia.org/wiki/Kobe_Bryant'},
  {n:'Muhammad Ali',w:'https://en.wikipedia.org/wiki/Muhammad_Ali'},
  {n:'Usain Bolt',w:'https://en.wikipedia.org/wiki/Usain_Bolt'},
  {n:'Roger Federer',w:'https://en.wikipedia.org/wiki/Roger_Federer'},
  {n:'Bruce Lee',w:'https://en.wikipedia.org/wiki/Bruce_Lee'},
  {n:'Jackie Chan',w:'https://en.wikipedia.org/wiki/Jackie_Chan'},
  {n:'Sylvester Stallone',w:'https://en.wikipedia.org/wiki/Sylvester_Stallone'},
  {n:'Ryan Reynolds',w:'https://en.wikipedia.org/wiki/Ryan_Reynolds'},
  {n:'Dua Lipa',w:'https://en.wikipedia.org/wiki/Dua_Lipa'},
  {n:'Bad Bunny',w:'https://en.wikipedia.org/wiki/Bad_Bunny'},
  {n:'BTS (group)',w:'https://en.wikipedia.org/wiki/BTS'},
  // Historical — funny matches
  {n:'Julius Caesar',w:'https://en.wikipedia.org/wiki/Julius_Caesar'},
  {n:'Genghis Khan',w:'https://en.wikipedia.org/wiki/Genghis_Khan'},
  {n:'King Henry VIII',w:'https://en.wikipedia.org/wiki/Henry_VIII'},
  {n:'Alexander the Great',w:'https://en.wikipedia.org/wiki/Alexander_the_Great'},
  {n:'Vlad the Impaler',w:'https://en.wikipedia.org/wiki/Vlad_the_Impaler'},
  {n:'Nikola Tesla',w:'https://en.wikipedia.org/wiki/Nikola_Tesla'},
  // Fictional icons
  {n:'Shrek',w:'https://en.wikipedia.org/wiki/Shrek_(character)'},
  {n:'SpongeBob',w:'https://en.wikipedia.org/wiki/SpongeBob_SquarePants_(character)'},
  {n:'Homer Simpson',w:'https://en.wikipedia.org/wiki/Homer_Simpson'},
  {n:'Bart Simpson',w:'https://en.wikipedia.org/wiki/Bart_Simpson'},
  {n:'Walter White',w:'https://en.wikipedia.org/wiki/Walter_White_(Breaking_Bad)'},
  {n:'Pennywise',w:'https://en.wikipedia.org/wiki/Pennywise_(character)'},
  {n:'Hannibal Lecter',w:'https://en.wikipedia.org/wiki/Hannibal_Lecter'},
  {n:'Rick Sanchez',w:'https://en.wikipedia.org/wiki/Rick_and_Morty'},
  {n:'Patrick Star',w:'https://en.wikipedia.org/wiki/Patrick_Star'},
  {n:'Gollum',w:'https://en.wikipedia.org/wiki/Gollum'},
  // Anime heroes
  {n:'Naruto Uzumaki',w:'https://en.wikipedia.org/wiki/Naruto_Uzumaki'},
  {n:'Monkey D. Luffy',w:'https://en.wikipedia.org/wiki/Monkey_D._Luffy'},
  {n:'Roronoa Zoro',w:'https://en.wikipedia.org/wiki/Roronoa_Zoro'},
  {n:'Vegeta',w:'https://en.wikipedia.org/wiki/Vegeta_(Dragon_Ball)'},
  {n:'Sasuke Uchiha',w:'https://en.wikipedia.org/wiki/Sasuke_Uchiha'},
  {n:'Itachi Uchiha',w:'https://en.wikipedia.org/wiki/Itachi_Uchiha'},
  {n:'Saitama',w:'https://en.wikipedia.org/wiki/Saitama_(One-Punch_Man)'},
  {n:'Levi Ackerman',w:'https://en.wikipedia.org/wiki/Levi_Ackerman'},
  {n:'Tanjiro Kamado',w:'https://en.wikipedia.org/wiki/Tanjiro_Kamado'},
  {n:'Nezuko Kamado',w:'https://en.wikipedia.org/wiki/Nezuko_Kamado'},
  {n:'Light Yagami',w:'https://en.wikipedia.org/wiki/Light_Yagami'},
  {n:'L Lawliet',w:'https://en.wikipedia.org/wiki/L_(Death_Note)'},
  {n:'All Might',w:'https://en.wikipedia.org/wiki/List_of_My_Hero_Academia_characters'},
  {n:'Izuku Midoriya',w:'https://en.wikipedia.org/wiki/Izuku_Midoriya'},
  {n:'Edward Elric',w:'https://en.wikipedia.org/wiki/Edward_Elric'},
  {n:'Natsu Dragneel',w:'https://en.wikipedia.org/wiki/Natsu_Dragneel'},
  {n:'Ichigo Kurosaki',w:'https://en.wikipedia.org/wiki/Ichigo_Kurosaki'},
  // Movie / TV heroes
  {n:'Captain America',w:'https://en.wikipedia.org/wiki/Captain_America'},
  {n:'Thor',w:'https://en.wikipedia.org/wiki/Thor_(Marvel_Comics)'},
  {n:'Thanos',w:'https://en.wikipedia.org/wiki/Thanos'},
  {n:'Loki',w:'https://en.wikipedia.org/wiki/Loki_(Marvel_Comics)'},
  {n:'Doctor Strange',w:'https://en.wikipedia.org/wiki/Doctor_Strange'},
  {n:'Deadpool',w:'https://en.wikipedia.org/wiki/Deadpool'},
  {n:'Wolverine',w:'https://en.wikipedia.org/wiki/Wolverine_(character)'},
  {n:'Superman',w:'https://en.wikipedia.org/wiki/Superman'},
  {n:'The Flash',w:'https://en.wikipedia.org/wiki/Flash_(DC_Comics)'},
  {n:'Aquaman',w:'https://en.wikipedia.org/wiki/Aquaman'},
  {n:'Joker',w:'https://en.wikipedia.org/wiki/Joker_(character)'},
  {n:'Lord Voldemort',w:'https://en.wikipedia.org/wiki/Lord_Voldemort'},
  {n:'Katniss Everdeen',w:'https://en.wikipedia.org/wiki/Katniss_Everdeen'},
  {n:'Jack Sparrow',w:'https://en.wikipedia.org/wiki/Jack_Sparrow'},
  {n:'James Bond',w:'https://en.wikipedia.org/wiki/James_Bond'},
  {n:'John Wick',w:'https://en.wikipedia.org/wiki/John_Wick_(character)'},
  // Thai stars
  {n:'Lisa (BLACKPINK)',w:'https://en.wikipedia.org/wiki/Lisa_(rapper)',th:'ลิซ่า (BLACKPINK)'},
  {n:'Bright Vachirawit',w:'https://en.wikipedia.org/wiki/Bright_Vachirawit',th:'ไบรท์ วชิรวิชญ์'},
  {n:'Gulf Kanawut',w:'https://en.wikipedia.org/wiki/Gulf_Kanawut',th:'กัลฟ์ กาณวุฒิ'},
  {n:'Mew Suppasit',w:'https://en.wikipedia.org/wiki/Mew_Suppasit',th:'มิว ศุภศิษฏ์'},
  {n:'Mario Maurer',w:'https://en.wikipedia.org/wiki/Mario_Maurer',th:'มาริโอ้ เมาเรอร์'},
  {n:'Nadech Kugimiya',w:'https://en.wikipedia.org/wiki/Nadech_Kugimiya',th:'ณเดชน์ คูกิมิยะ'},
  {n:'Davika Hoorne',w:'https://en.wikipedia.org/wiki/Davika_Hoorne',th:'ดาวิกา โฮร์เน่'},
  {n:'Jeff Satur',w:'https://en.wikipedia.org/wiki/Jeff_Satur',th:'เจฟ สาทร'},
  {n:'Billkin Putthipong',w:'https://en.wikipedia.org/wiki/Billkin_Putthipong',th:'บิลล์กิ้น พุทธิพงศ์'},
  {n:'Win Metawin',w:'https://en.wikipedia.org/wiki/Win_Metawin',th:'วิน เมธวิน'},
  {n:'Apo Nattawin',w:'https://en.wikipedia.org/wiki/Apo_Nattawin',th:'อาโป้ ณัฐวิญญ์'},
  // Controversial politicians
  {n:'Donald Trump',w:'https://en.wikipedia.org/wiki/Donald_Trump',th:'โดนัลด์ ทรัมป์'},
  {n:'Vladimir Putin',w:'https://en.wikipedia.org/wiki/Vladimir_Putin',th:'วลาดิมีร์ ปูติน'},
  {n:'Kim Jong-un',w:'https://en.wikipedia.org/wiki/Kim_Jong-un',th:'คิม จอง-อึน'},
  {n:'Thaksin Shinawatra',w:'https://en.wikipedia.org/wiki/Thaksin_Shinawatra',th:'ทักษิณ ชินวัตร'},
  {n:'Xi Jinping',w:'https://en.wikipedia.org/wiki/Xi_Jinping',th:'สี จิ้นผิง'},
  {n:'Boris Johnson',w:'https://en.wikipedia.org/wiki/Boris_Johnson',th:'บอริส จอห์นสัน'},
];
const COLORS = ['#e63946','#457b9d','#2d6a4f','#e9c46a','#9d4edd','#f4a261','#2a9d8f','#e76f51',
  '#6d6875','#b5e48c','#f77f00','#4cc9f0','#c77dff','#80b918','#ff6b6b','#48cae4',
  '#023e8a','#d62828','#588157','#e07a5f'];

let wwPool = WW_PRESETS.map(t => ({text:t, isPreset:true, active:false}));
let nmPool = NM_PRESETS.map(p => ({text:p.n, isPreset:true, active:false, wiki:p.w}));

// ════════════════════════════════════════════════════════
// STATE
// ════════════════════════════════════════════════════════
const S = { gridSize:4, numPlayers:4, playerNames:[], freeCenter:true, namesRepeat:true,
  phase:'welcome', playersDone:new Set(), voteState:null, wheelAngle:0, spinning:false,
  currentSpin:null };
let playerNamesAll = [];
let socket;

// ════════════════════════════════════════════════════════
// POOL UI
// ════════════════════════════════════════════════════════
function renderWWPool() {
  const g = document.getElementById('ww-grid'); g.innerHTML='';
  wwPool.forEach((item,i) => {
    const c = document.createElement('button'); c.className='pc'+(item.active?' on':'');
    c.onclick = () => { item.active=!item.active; renderWWPool(); };
    const label = wwTranslate(item.text);
    const inner = label !== item.text
      ? `<span>${label}</span><span style="font-size:9px;opacity:.55;display:block;line-height:1">${item.text}</span>`
      : `<span>${label}</span>`;
    c.insertAdjacentHTML('beforeend', inner);
    if (!item.isPreset) {
      const rm = document.createElement('button'); rm.className='pcrm'; rm.textContent='✕';
      rm.onclick = e => { e.stopPropagation(); wwPool.splice(i,1); renderWWPool(); };
      c.appendChild(rm);
    }
    g.appendChild(c);
  });
  const a = wwPool.filter(i=>i.active).length;
  document.getElementById('ww-count').textContent=`${a} of ${wwPool.length} active`;
}
function renderNMPool() {
  const g = document.getElementById('nm-grid'); g.innerHTML='';
  nmPool.forEach((item,i) => {
    const c = document.createElement('button'); c.className='pc'+(item.active?' on':'');
    c.onclick = () => { item.active=!item.active; renderNMPool(); };
    const showTh = currentLang === 'th' && item.th;
    const inner = showTh
      ? `<span>${item.th}</span><span style="font-size:9px;opacity:.55;display:block;line-height:1">${item.text}</span>`
      : `<span>${item.text}</span>`;
    c.insertAdjacentHTML('beforeend', inner);
    if (item.wiki) {
      const wl = document.createElement('button'); wl.className='pcwiki'; wl.textContent='🔗';
      wl.onclick = e => { e.stopPropagation(); openWiki(item.wiki); }; c.appendChild(wl);
    }
    if (!item.isPreset) {
      const rm = document.createElement('button'); rm.className='pcrm'; rm.textContent='✕';
      rm.onclick = e => { e.stopPropagation(); nmPool.splice(i,1); renderNMPool(); }; c.appendChild(rm);
    }
    g.appendChild(c);
  });
  const a = nmPool.filter(i=>i.active).length;
  document.getElementById('nm-count').textContent=`${a} of ${nmPool.length} active`;
}
const wwSelectAll = () => { wwPool.forEach(i=>i.active=true); renderWWPool(); };
const wwClearAll  = () => { wwPool.forEach(i=>i.active=false); renderWWPool(); };
const nmSelectAll = () => { nmPool.forEach(i=>i.active=true); renderNMPool(); };
const nmClearAll  = () => { nmPool.forEach(i=>i.active=false); renderNMPool(); };
function addWWCustom() {
  const el=document.getElementById('ww-in'), t=el.value.trim(); if(!t) return;
  if(!wwPool.find(i=>i.text===t)) { wwPool.push({text:t,isPreset:false,active:true}); renderWWPool(); }
  el.value=''; el.focus();
}
function addNMCustom() {
  const el=document.getElementById('nm-in'), t=el.value.trim(); if(!t) return;
  if(!nmPool.find(i=>i.text===t)) { nmPool.push({text:t,isPreset:false,active:true,wiki:null}); renderNMPool(); }
  el.value=''; el.focus();
}
function addBulk() {
  const ta=document.getElementById('bulk-ta');
  ta.value.split('\n').map(l=>l.trim()).filter(Boolean).forEach(t=>{
    if(!nmPool.find(i=>i.text===t)) nmPool.push({text:t,isPreset:false,active:true,wiki:null});
  });
  ta.value=''; renderNMPool();
}

function openWiki(url) {
  if (window.api) window.api.openUrl(url);
  else window.open(url,'_blank');
}

// ── Firewall ───────────────────────────────────────────
let firewallListenerSet = false;
function fixFirewall() {
  const btn = document.getElementById('btn-firewall');
  const msg = document.getElementById('firewall-msg');
  if (!window.api?.fixFirewall) {
    if (msg) { msg.style.display='block'; msg.style.color='var(--muted)'; msg.textContent='(Only available in the desktop app)'; }
    return;
  }
  if (btn) { btn.disabled=true; btn.textContent='⏳ Waiting for UAC confirmation…'; }
  if (msg) msg.style.display='none';

  window.api.fixFirewall();

  if (!firewallListenerSet) {
    firewallListenerSet = true;
    window.api.onFirewallResult(({ ok, batPath, err }) => {
      const b = document.getElementById('btn-firewall');
      const m = document.getElementById('firewall-msg');
      if (b) { b.disabled=false; b.textContent='🛡️ Allow through Windows Firewall (UAC)'; }
      if (m) {
        m.style.display='block';
        if (ok) {
          m.style.color='#52b788';
          m.innerHTML='✓ A CMD window opened — approve it and wait for "Done!"<br>'
            +'Then <b>restart the app</b> and click 🔍 Test network connection.<br>'
            +`<span style="color:var(--dim);font-size:10px">If auto-run failed, right-click <b>fix-firewall.bat</b> in the app folder and choose "Run as administrator".</span>`;
        } else {
          m.style.color='var(--red)';
          m.innerHTML=`✗ Could not launch automatically.<br>`
            +`<b>Manual fix:</b> Right-click <code style="font-size:10px">fix-firewall.bat</code> in the app folder → "Run as administrator".<br>`
            +`<span style="color:var(--dim);font-size:10px">If still blocked, check your router for "AP Isolation" or "Client Isolation" settings.</span>`;
        }
      }
    });
  }
}

// ── Network test ───────────────────────────────────────
// Fetches /ping via the NETWORK IP (not localhost) to verify external reachability
let currentNetworkUrl = null;
function testConnection() {
  const btn = document.getElementById('btn-test-conn');
  const msg = document.getElementById('test-msg');
  if (!currentNetworkUrl) {
    if (msg) { msg.style.display='block'; msg.style.color='var(--muted)'; msg.textContent='Start card setup first to get the network URL.'; }
    return;
  }
  if (btn) { btn.disabled=true; btn.textContent='Testing…'; }
  if (msg) { msg.style.display='none'; }
  // Use the network IP (not localhost) — if this fails, it's definitely Firewall
  fetch(currentNetworkUrl + '/ping', { mode: 'cors', cache: 'no-store' })
    .then(r => r.json())
    .then(d => {
      if (msg) { msg.style.display='block'; msg.style.color='#52b788'; msg.textContent=`✓ Network OK — server reachable at ${currentNetworkUrl}`; }
    })
    .catch(() => {
      if (msg) { msg.style.display='block'; msg.style.color='var(--red)'; msg.textContent=`✗ Cannot reach ${currentNetworkUrl} — click "Allow through Windows Firewall" above.`; }
    })
    .finally(() => { if (btn) { btn.disabled=false; btn.textContent='🔍 Test network connection'; } });
}

// ── Random pool selection ──────────────────────────────
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function wwRandom(n = 20) {
  wwPool.forEach(i => i.active = false);
  const indices = shuffle([...Array(wwPool.length).keys()]);
  indices.slice(0, Math.min(n, wwPool.length)).forEach(i => wwPool[i].active = true);
  renderWWPool();
  const wrap = document.querySelector('#p-ww .pool-wrap');
  if (wrap) { wrap.scrollTop = 0; wrap.style.outline = '2px solid var(--accent)'; setTimeout(() => { wrap.style.outline = ''; }, 500); }
}

function nmRandom(n = 30) {
  nmPool.forEach(i => i.active = false);
  const indices = shuffle([...Array(nmPool.length).keys()]);
  indices.slice(0, Math.min(n, nmPool.length)).forEach(i => nmPool[i].active = true);
  renderNMPool();
  const wrap = document.querySelector('#p-nm .pool-wrap');
  if (wrap) { wrap.scrollTop = 0; wrap.style.outline = '2px solid var(--accent)'; setTimeout(() => { wrap.style.outline = ''; }, 500); }
}

// ════════════════════════════════════════════════════════
// TABS / SETTINGS UI
// ════════════════════════════════════════════════════════
function tab(id,btn) {
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active'); document.getElementById(`p-${id}`).classList.add('active');
}
function setGrid(n,btn) {
  S.gridSize=n;
  document.querySelectorAll('.sz').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
}
function adjP(d) {
  S.numPlayers=Math.max(2,Math.min(12,S.numPlayers+d));
  document.getElementById('np').value=S.numPlayers; renderPNames();
}
function renderPNames() {
  const list=document.getElementById('pnames-list'); list.innerHTML='';
  for(let i=0;i<S.numPlayers;i++){
    const inp=document.createElement('input');
    inp.type='text'; inp.id=`pn-${i}`; inp.placeholder=`Player ${i+1} name`;
    inp.value=S.playerNames[i]||''; inp.style.marginBottom='5px'; list.appendChild(inp);
  }
}

// ════════════════════════════════════════════════════════
// NAV
// ════════════════════════════════════════════════════════
function show(id) {
  ['ph-welcome','ph-setup','ph-cards','ph-game'].forEach(s=>document.getElementById(s).classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
}
function showSetup() { show('ph-setup'); renderWWPool(); renderNMPool(); renderPNames(); }

// ════════════════════════════════════════════════════════
// START CARDS
// ════════════════════════════════════════════════════════
function startCards() {
  const err=document.getElementById('setup-err');
  const activeWW=wwPool.filter(i=>i.active).map(i=>i.text);
  const activeNM=nmPool.filter(i=>i.active);
  const activeNMNames=activeNM.map(i=>i.text);
  if(activeWW.length<5){err.textContent='Select at least 5 wheel words.';return;}
  const minN=S.gridSize*S.gridSize-(S.gridSize%2===1?1:0);
  if(activeNMNames.length<minN){err.textContent=`Need at least ${minN} active names.`;return;}
  err.textContent='';
  S.playerNames=[];
  for(let i=0;i<S.numPlayers;i++){
    const el=document.getElementById(`pn-${i}`);
    S.playerNames.push((el?el.value.trim():'')||`Player ${i+1}`);
  }
  S.freeCenter=document.getElementById('chk-free').checked;
  S.namesRepeat=document.getElementById('chk-repeat').checked;
  playerNamesAll=[...S.playerNames];
  const wikiMap={};
  activeNM.forEach(i=>{if(i.wiki) wikiMap[i.text]=i.wiki;});
  socket.emit('host-setup',{
    wheelWords:activeWW, names:activeNMNames, wikiMap,
    gridSize:S.gridSize, playerNames:S.playerNames,
    freeCenter:S.freeCenter, namesRepeat:S.namesRepeat,
  });
  // Build status rows
  const status=document.getElementById('setup-status'); status.innerHTML='';
  S.playerNames.forEach((name,i)=>{
    const row=document.createElement('div'); row.className='p-status'; row.id=`ps-${i}`;
    row.innerHTML=`<span class="pname">${name}</span>
      <span class="psbadge pending" id="psb-${i}">Waiting to join…</span>`;
    status.appendChild(row);
  });
  show('ph-cards');
}

function hostStartGame() {
  socket.emit('host-game-start');
  startGame();
}

// ════════════════════════════════════════════════════════
// SOCKET EVENTS
// ════════════════════════════════════════════════════════
function setupSocket() {
  socket = io({ query:{ role:'host' } });

  socket.on('server-info', ({url, qr, allUrls, isCloud}) => {
    currentNetworkUrl = url;
    const img=document.getElementById('qr-img'); if(img){ img.src=qr; img.style.display='block'; }
    const urlEl=document.getElementById('join-url');
    if (urlEl) {
      urlEl.textContent = url;
      // Make the URL clickable in browser (no Electron api needed)
      urlEl.style.cursor = 'pointer';
      urlEl.onclick = () => openWiki(url);
      if (isCloud) urlEl.style.fontWeight = '700';
    }
    // Alternate IPs (LAN mode only)
    if (!isCloud && allUrls && allUrls.length > 1) {
      const extra=document.getElementById('extra-urls'), list=document.getElementById('other-urls-list');
      if (extra && list) {
        list.innerHTML = allUrls.slice(1)
          .map(u=>`<a href="#" onclick="openWiki('${u.url}');return false" style="display:block;color:var(--accent)">${u.url} <span style="color:var(--dim)">(${u.name})</span></a>`)
          .join('');
        extra.style.display='block';
      }
    }
    // In cloud mode, hide the Windows Firewall section — irrelevant online
    if (isCloud) {
      const fw = document.getElementById('fw-section');
      if (fw) fw.style.display = 'none';
      const hintEl = document.querySelector('.join-panel .join-hint');
      if (hintEl) hintEl.textContent = 'Share this URL — players open it in any browser from anywhere';
    }
  });

  socket.on('lobby-update', ({players}) => {
    if(!players) return;
    players.forEach(({idx,taken,done})=>{
      const badge=document.getElementById(`psb-${idx}`); if(!badge) return;
      if(done)        { badge.className='psbadge done';   badge.textContent='✓ Card ready'; }
      else if(taken)  { badge.className='psbadge joined'; badge.textContent='● Joined'; }
      else            { badge.className='psbadge pending';badge.textContent='Waiting to join…'; }
    });
    const allDone = players.every(p=>p.done);
    const btn=document.getElementById('btn-start-game'); if(btn) btn.disabled=!allDone;
  });

  socket.on('player-joined', ({playerIdx, name}) => {
    addLog(`👋 ${name} joined`, 'spin');
  });

  socket.on('player-closed', ({playerIdx}) => {
    const badge=document.getElementById(`psb-${playerIdx}`);
    const gpEl=document.getElementById(`gp-status-${playerIdx}`);
    if(badge){badge.className='psbadge closed'; badge.textContent='✕ Disconnected';}
    if(gpEl){gpEl.textContent='disconnected'; gpEl.style.color='var(--red)';}
  });

  socket.on('player-done', ({playerIdx}) => {
    const badge=document.getElementById(`psb-${playerIdx}`);
    if(badge){badge.className='psbadge done'; badge.textContent='✓ Card ready';}
  });

  socket.on('all-done', () => {
    const btn=document.getElementById('btn-start-game'); if(btn) btn.disabled=false;
  });

  socket.on('spin-reveal', ({word, history}) => {
    S.currentSpin = word;
    const el=document.getElementById('sr-word');
    el.textContent=wwTranslate(word); el.classList.remove('revealed');
    void el.offsetWidth; el.classList.add('revealed');
    playRevealSound();
    const histEl=document.getElementById('hist'), lbl=document.getElementById('hist-lbl');
    histEl.innerHTML=(history||[]).map(w=>`<span>${w}</span>`).join('');
    lbl.style.display=history&&history.length?'block':'none';
    addLog(t('tpl-spin', word),'spin');
    lbl.textContent = t('hist-label');
    document.getElementById('btn-spin').disabled=false;
  });

  socket.on('vote-open', ({announcerName,cellName,characteristic,wikiUrl}) => {
    S.voteState={announcerName,cellName,characteristic};
    document.getElementById('vp-name').textContent=cellName;
    document.getElementById('vp-char').textContent=`"${characteristic}"`;
    const we=document.getElementById('vp-wiki');
    we.innerHTML=wikiUrl?`<a href="#" onclick="openWiki('${wikiUrl}');return false">${t('wiki-link')}</a>`:'';
    document.getElementById('vp-tally').innerHTML=`<b>1</b> / ${playerNamesAll.length} voted`;
    renderVoterList();
    document.getElementById('vote-panel').classList.remove('hidden');
  });

  socket.on('vote-update', ({voted,total,yes,no}) => {
    document.getElementById('vp-tally').innerHTML=
      `<b>${voted}</b> / ${total} voted &nbsp;·&nbsp; ✓ <b style="color:#52b788">${yes}</b> &nbsp; ✗ <b style="color:var(--red)">${no}</b>`;
  });

  socket.on('vote-cancelled', () => {
    S.voteState = null;
    document.getElementById('vote-panel').classList.add('hidden');
    addLog('↩ Vote cancelled by announcer', 'spin');
    document.getElementById('btn-spin').disabled = false;
  });

  socket.on('vote-result', ({pass,yes,no,playerIdx}) => {
    const pname=playerNamesAll[playerIdx]||`Player ${playerIdx+1}`;
    const vname=S.voteState?S.voteState.cellName:'?';
    const usedChar=S.voteState?.characteristic;
    addLog(pass ? t('tpl-approved-log', pname, vname, yes, no)
               : t('tpl-rejected-log', pname, vname, yes, no), pass?'pass':'fail');
    S.voteState=null;
    document.getElementById('vote-panel').classList.add('hidden');
    // remove used characteristic from wheel so it can't be spun again
    if (pass && usedChar) {
      wwPool.forEach(item => { if (item.text === usedChar) item.active = false; });
      currentWheelWords = wwPool.filter(i=>i.active).map(i=>i.text);
      drawWheel(currentWheelWords, S.wheelAngle);
      addLog(`🚫 "${wwTranslate(usedChar)}" removed from wheel`, 'spin');
    }
    // auto-refresh cards panel if expanded
    if (cardsExpanded) socket.emit('host-request-cards');
  });

  socket.on('cards-data', ({players, gridSize, wikiMap}) => {
    renderCards(players, gridSize, wikiMap);
  });

  socket.on('game-won', ({winnerName}) => {
    addLog(t('tpl-won', winnerName),'pass');
    document.getElementById('btn-spin').disabled=true;
  });
}

// ════════════════════════════════════════════════════════
// CARDS VIEWER
// ════════════════════════════════════════════════════════
const hostImgCache = {};
async function hostFetchThumb(name, wikiUrl) {
  if (name in hostImgCache) return hostImgCache[name];
  hostImgCache[name] = null;
  try {
    const title = wikiUrl ? wikiUrl.split('/wiki/')[1] : encodeURIComponent(name.replace(/ /g,'_'));
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    hostImgCache[name] = data.thumbnail?.source || null;
  } catch { hostImgCache[name] = null; }
  return hostImgCache[name];
}

let cardsExpanded = false;
function toggleCards() {
  cardsExpanded = !cardsExpanded;
  const body = document.getElementById('cards-panel-body');
  const icon = document.getElementById('cards-toggle-icon');
  body.classList.toggle('hidden', !cardsExpanded);
  icon.textContent = cardsExpanded ? '▲ collapse' : '▼ expand';
  if (cardsExpanded) socket.emit('host-request-cards');
}
function renderCards(players, gridSize, wikiMap) {
  const grid = document.getElementById('cards-grid');
  grid.innerHTML = '';
  const cellPx = Math.max(52, Math.round(600 / (players.length * gridSize + 1)));
  const cardW = Math.max(180, gridSize * cellPx + 16);
  grid.style.gridTemplateColumns = `repeat(auto-fill,minmax(${cardW}px,1fr))`;
  players.forEach(p => {
    const wrap = document.createElement('div');
    wrap.className = 'player-card-wrap' + (p.hasBingo ? ' bingo' : '');
    const nameEl = document.createElement('div');
    nameEl.className = 'player-card-name';
    nameEl.textContent = (p.hasBingo ? '🏆 ' : '') + p.name;
    wrap.appendChild(nameEl);
    const miniGrid = document.createElement('div');
    miniGrid.className = 'mini-card';
    miniGrid.style.gridTemplateColumns = `repeat(${gridSize},1fr)`;
    const fetchQueue = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = document.createElement('div');
        const name = p.grid[r][c];
        const isFree = name === 'FREE';
        const isMarked = p.marked[r][c];
        cell.className = 'mc2' + (isFree ? ' free' : '') + (isMarked ? ' marked' : '');
        cell.style.height = cellPx * 1.3 + 'px';
        if (isFree) {
          cell.textContent = '★';
        } else if (name) {
          cell.title = name;
          const label = document.createElement('div');
          label.className = 'mc2-label';
          label.textContent = name;
          cell.appendChild(label);
          fetchQueue.push({ name, cell, wikiUrl: wikiMap[name] || null });
        }
        miniGrid.appendChild(cell);
      }
    }
    wrap.appendChild(miniGrid);
    grid.appendChild(wrap);
    fetchQueue.forEach(({ name, cell, wikiUrl }) => {
      hostFetchThumb(name, wikiUrl).then(src => {
        if (!src) return;
        const img = document.createElement('img');
        img.className = 'mc2-img'; img.src = src; img.alt = name;
        img.onerror = () => img.remove();
        cell.insertBefore(img, cell.firstChild);
        cell.classList.add('has-img');
      });
    });
  });
}

function goBackToSetup() {
  socket.emit('host-back-to-setup');
  show('ph-setup');
  renderWWPool(); renderNMPool(); renderPNames();
}

// ════════════════════════════════════════════════════════
// GAME
// ════════════════════════════════════════════════════════
let currentWheelWords = [];

function startGame() {
  show('ph-game'); S.spinning=false; S.wheelAngle=0;
  const wSz = parseInt(localStorage.getItem('cb-wheel-size') || '480');
  const cv = document.getElementById('wheel-canvas');
  if (cv) { cv.width = wSz; cv.height = wSz; }
  currentWheelWords = wwPool.filter(i=>i.active).map(i=>i.text);
  playerNamesAll = [...S.playerNames];
  // Build player list
  const list=document.getElementById('game-player-list'); list.innerHTML='';
  playerNamesAll.forEach((name,i)=>{
    const row=document.createElement('div'); row.className='game-player-row';
    row.innerHTML=`<span style="font-weight:600;font-size:12px">${name}</span>
      <span id="gp-status-${i}" style="font-size:11px;color:var(--muted)">connected</span>`;
    list.appendChild(row);
  });
  drawWheel(currentWheelWords,0);
}

function applyWheelSize(size, save=true) {
  const sz = Math.max(300, Math.min(580, parseInt(size)));
  document.documentElement.style.setProperty('--wheel-size', sz + 'px');
  const canvas = document.getElementById('wheel-canvas');
  if (canvas) { canvas.width = sz; canvas.height = sz; }
  const valEl = document.getElementById('wheel-size-val');
  if (valEl) valEl.textContent = sz + 'px';
  if (save) localStorage.setItem('cb-wheel-size', sz);
  if (currentWheelWords.length && !S.spinning) drawWheel(currentWheelWords, S.wheelAngle);
}

function drawWheel(words,angle) {
  const canvas=document.getElementById('wheel-canvas'); if(!canvas) return;
  const SIZE=canvas.width||480, ctx=canvas.getContext('2d'), cx=SIZE/2, cy=SIZE/2, r=cx-4, n=words.length;
  ctx.clearRect(0,0,SIZE,SIZE);
  if(!n){ctx.fillStyle='var(--surface)';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();return;}
  const sa=(2*Math.PI)/n;
  for(let i=0;i<n;i++){
    const s=angle+i*sa,e=s+sa;
    ctx.beginPath();ctx.moveTo(cx,cy);ctx.arc(cx,cy,r,s,e);ctx.closePath();
    ctx.fillStyle=COLORS[i%COLORS.length];ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1;ctx.stroke();
    if(n<=50){
      const mid=s+sa/2;
      ctx.save();ctx.translate(cx,cy);ctx.rotate(mid);ctx.textAlign='right';
      ctx.fillStyle='#ffffffdd';ctx.shadowColor='rgba(0,0,0,.6)';ctx.shadowBlur=3;
      const maxC=n>25?10:n>15?13:16;
      const disp=wwTranslate(words[i]);
      const lbl=disp.length>maxC?disp.slice(0,maxC)+'…':disp;
      const fs=n>30?8:n>20?9:n>10?11:13;
      ctx.font=`bold ${fs}px Segoe UI`;ctx.fillText(lbl,r-8,4);ctx.restore();
    }
  }
  ctx.beginPath();ctx.arc(cx,cy,24,0,Math.PI*2);
  ctx.fillStyle='#0f0e17';ctx.fill();ctx.strokeStyle='#333';ctx.lineWidth=2;ctx.stroke();
}

function doSpin() {
  if(S.spinning) return;
  S.spinning=true; document.getElementById('btn-spin').disabled=true;
  document.getElementById('sr-word').textContent='…';
  const words=currentWheelWords, n=words.length;
  const idx=Math.floor(Math.random()*n), sa=(2*Math.PI)/n;
  const tOff=((-(idx*sa+sa/2))%(2*Math.PI)+2*Math.PI)%(2*Math.PI);
  const curMod=((S.wheelAngle%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
  let delta=tOff-curMod; if(delta<0) delta+=2*Math.PI;
  const extra=(5+Math.floor(Math.random()*5))*2*Math.PI;
  const target=S.wheelAngle+delta+extra, dur=3200+Math.random()*1600;
  const t0=performance.now(), start=S.wheelAngle, easeOut=t=>1-Math.pow(1-t,4);
  (function frame(now){
    const t=Math.min((now-t0)/dur,1);
    S.wheelAngle=start+(target-start)*easeOut(t); drawWheel(words,S.wheelAngle);
    if(t<1){requestAnimationFrame(frame);return;}
    S.wheelAngle=target; S.spinning=false;
    socket.emit('host-spin-complete',{word:words[idx]});
  })(t0);
}

function renderVoterList() {
  const list=document.getElementById('voter-list'); list.innerHTML='';
  playerNamesAll.forEach(name=>{
    const row=document.createElement('div'); row.className='voter-item';
    row.innerHTML=`<span>${name}</span><span class="v-tag wait">…</span>`;
    list.appendChild(row);
  });
}

function addLog(html,cls) {
  const log=document.getElementById('game-log');
  const empty=log.querySelector('p'); if(empty) empty.remove();
  const e=document.createElement('div'); e.className=`log-entry ${cls}`; e.innerHTML=html;
  log.prepend(e);
  const entries=log.querySelectorAll('.log-entry');
  if(entries.length>25) entries[entries.length-1].remove();
}

function playRevealSound() {
  try {
    const ctx=new AudioContext();
    [523,659,784].forEach((freq,i)=>{
      const osc=ctx.createOscillator(),gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);
      osc.type='sine';osc.frequency.value=freq;
      const t=ctx.currentTime+i*.1;
      gain.gain.setValueAtTime(.25,t);gain.gain.exponentialRampToValueAtTime(.001,t+.5);
      osc.start(t);osc.stop(t+.5);
    });
  } catch(e){}
}

// ════════════════════════════════════════════════════════
// WELCOME PAGE ANIMATIONS
// ════════════════════════════════════════════════════════
function spawnBalls() {
  const container = document.getElementById('ph-welcome');
  if (!container) return;
  const defs = [
    {l:'5%', sz:42, bg:'#e63946', dur:'6.5s', delay:'0s',   letter:'B'},
    {l:'14%',sz:30, bg:'#f4a261', dur:'8.2s', delay:'1.8s', letter:'I'},
    {l:'27%',sz:52, bg:'#2a9d8f', dur:'7.1s', delay:'3.2s', letter:'N'},
    {l:'43%',sz:36, bg:'#457b9d', dur:'9.4s', delay:'0.6s', letter:'G'},
    {l:'58%',sz:46, bg:'#9d4edd', dur:'5.8s', delay:'2.4s', letter:'O'},
    {l:'72%',sz:33, bg:'#e63946', dur:'7.6s', delay:'4.1s', letter:'B'},
    {l:'83%',sz:28, bg:'#ffd700', dur:'6.3s', delay:'1.1s', letter:'I', color:'#222'},
    {l:'91%',sz:44, bg:'#80b918', dur:'8.9s', delay:'2.9s', letter:'N'},
    {l:'20%',sz:38, bg:'#ff6b6b', dur:'10s',  delay:'0.3s', letter:'G'},
    {l:'65%',sz:40, bg:'#4cc9f0', dur:'6.8s', delay:'3.7s', letter:'O'},
  ];
  defs.forEach(d => {
    const b = document.createElement('div');
    b.className = 'bball';
    b.textContent = d.letter;
    b.style.cssText = `left:${d.l};bottom:-60px;width:${d.sz}px;height:${d.sz}px;
      font-size:${Math.round(d.sz*.42)}px;background:${d.bg};color:${d.color||'#fff'};
      animation-duration:${d.dur};animation-delay:${d.delay}`;
    container.appendChild(b);
  });
}

// ════════════════════════════════════════════════════════
// INIT
// ════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  buildThemeGrid();
  loadSettings();
  spawnBalls();
  setupSocket();
});
