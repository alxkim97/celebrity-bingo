const { app, BrowserWindow, ipcMain, shell, nativeImage } = require('electron');
const path = require('path');
const fs   = require('fs');
const os   = require('os');
const { exec }  = require('child_process');
const { start, PORT } = require('./server');

// Start the game server before opening any window
start(PORT);

// ── Icon ────────────────────────────────────────────────
function createIcon() {
  const size = 64, buf = Buffer.alloc(size * size * 4);
  const cx = size / 2, cy = size / 2, r = size / 2 - 1;
  const COLS = [[230,57,70],[69,123,157],[45,106,79],[233,196,106],
                [157,78,221],[244,162,97],[42,157,143],[231,111,81]];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = x - cx + .5, py = y - cy + .5, d = Math.sqrt(px*px + py*py);
      const i = (y * size + x) * 4;
      if (d > r) { buf[i+3] = 0; continue; }
      if (d < r * .18) { buf[i]=15; buf[i+1]=14; buf[i+2]=23; buf[i+3]=255; continue; }
      const ang = (Math.atan2(py, px) + Math.PI) / (2 * Math.PI);
      const sec = Math.floor(ang * 8) % 8, sp = (ang * 8) % 1;
      if (sp < .05 || sp > .95) { buf[i]=buf[i+1]=buf[i+2]=0; buf[i+3]=210; continue; }
      const [rv,gv,bv] = COLS[sec];
      buf[i]=rv; buf[i+1]=gv; buf[i+2]=bv; buf[i+3]=255;
    }
  }
  return nativeImage.createFromBuffer(buf, { width: size, height: size });
}

// ── Host window ─────────────────────────────────────────
function createHostWin() {
  const win = new BrowserWindow({
    width: 1100, height: 800, minWidth: 860, minHeight: 640,
    title: 'Celebrity Bingo — Host',
    icon: createIcon(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true, nodeIntegration: false,
    },
  });
  // Load from the Express server so socket.io scripts are same-origin
  win.loadURL(`http://localhost:${PORT}/host/index.html`);
}

ipcMain.on('open-url', (_, url) => shell.openExternal(url));

// ── Firewall helper ─────────────────────────────────────
// Write a permanent .bat next to the app so there is no race condition
// (a temp file can be deleted before the elevated process reads it).
// Launching a .bat with -Verb RunAs is simpler and more reliable than
// nested PowerShell elevation; the visible CMD window confirms success.
ipcMain.on('fix-firewall', (e) => {
  const batPath = path.join(__dirname, 'fix-firewall.bat');

  const bat = [
    '@echo off',
    'echo === Celebrity Bingo — Windows Firewall Fix ===',
    'echo.',
    'echo Removing old rules (if any)...',
    'netsh advfirewall firewall delete rule name="Celebrity Bingo" >nul 2>&1',
    'netsh advfirewall firewall delete rule name="Celebrity Bingo Server" >nul 2>&1',
    'netsh advfirewall firewall delete rule name="Celebrity Bingo App" >nul 2>&1',
    `echo Adding port rule for TCP ${PORT}...`,
    `netsh advfirewall firewall add rule name="Celebrity Bingo" dir=in action=allow protocol=TCP localport=${PORT} profile=any`,
    'echo Adding app rule for electron.exe...',
    `netsh advfirewall firewall add rule name="Celebrity Bingo App" dir=in action=allow program="${process.execPath}" profile=any`,
    'echo.',
    'echo Done! Both firewall rules added.',
    'echo If other devices still cannot connect, check your router settings:',
    'echo some routers have "AP Isolation" or "Client Isolation" that blocks',
    'echo devices from talking to each other on the same WiFi.',
    'pause',
  ].join('\r\n');

  try {
    fs.writeFileSync(batPath, bat, 'utf8');
  } catch (writeErr) {
    e.sender.send('firewall-result', { ok: false, batPath: null, err: writeErr.message });
    return;
  }

  // Launch the .bat elevated — UAC dialog appears. No -Wait so the callback
  // fires immediately; the CMD window with `pause` stays open for the user to read.
  const safePathForPS = batPath.replace(/'/g, "''");
  exec(`powershell -NoProfile -Command "Start-Process -FilePath '${safePathForPS}' -Verb RunAs"`, (err) => {
    e.sender.send('firewall-result', { ok: !err, batPath, err: err?.message });
  });
});

ipcMain.on('open-firewall-settings', () => {
  exec('mmc.exe wf.msc', () => {});
});

app.whenReady().then(createHostWin);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
