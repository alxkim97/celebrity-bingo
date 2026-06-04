// Preload is only used by the Electron host window.
// Its sole job: open external URLs via the system browser.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  openUrl:             (url) => ipcRenderer.send('open-url', url),
  fixFirewall:         ()    => ipcRenderer.send('fix-firewall'),
  openFirewallSettings:()    => ipcRenderer.send('open-firewall-settings'),
  onFirewallResult:    (cb)  => ipcRenderer.on('firewall-result', (_, d) => cb(d)),
});
