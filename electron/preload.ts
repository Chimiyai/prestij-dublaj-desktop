// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron'; // ipcRenderer'ın import edildiğinden emin ol

// electron-store için olan kod
contextBridge.exposeInMainWorld('electronStore', {
  get: (key: string) => ipcRenderer.invoke('electron-store-get', key),
  set: (key: string, val: unknown) => ipcRenderer.invoke('electron-store-set', key, val),
  delete: (key: string) => ipcRenderer.invoke('electron-store-delete', key),
});

// ipcRenderer için olan (eski) kod
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, data?: unknown) => ipcRenderer.send(channel, data),
});

// shell (harici link açma) için olan kod - DÜZELTİLMİŞ HALİ
contextBridge.exposeInMainWorld('electronShell', {
  // HATA BURADAYDI: ipcMain yerine ipcRenderer kullanılmalı.
  openExternal: (url: string) => ipcRenderer.invoke('open-external-url', url),
});