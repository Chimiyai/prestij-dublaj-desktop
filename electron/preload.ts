// electron/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// 1. electron-store API'ı
contextBridge.exposeInMainWorld('electronStore', {
  get: (key: string) => ipcRenderer.invoke('electron-store-get', key),
  set: (key: string, val: unknown) => ipcRenderer.invoke('electron-store-set', key, val),
  delete: (key: string) => ipcRenderer.invoke('electron-store-delete', key),
});

// 2. Genel ipcRenderer API'ı (olay dinleme için)
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, data?: unknown) => ipcRenderer.send(channel, data),
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
    ipcRenderer.on(channel, listener);
  },
  removeListener: (channel: string, listener: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, listener);
  },
});

// 3. Mod Kurulumu ve Başlatma API'ı
contextBridge.exposeInMainWorld('modInstaller', {
  install: (args: { downloadUrl: string; projectTitle: string; installPath: string }) => 
    ipcRenderer.invoke('install-mod', args),
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  launchGame: (path: string) => ipcRenderer.invoke('launch-game', path),
  openPaymentWindow: (html: string) => ipcRenderer.invoke('open-payment-window', html),
});

// 4. Harici Link Açma API'ı (EKSİK OLAN KISIM MUHTEMELEN BURASI)
contextBridge.exposeInMainWorld('electronShell', {
  openExternal: (url: string) => ipcRenderer.invoke('open-external-url', url),
});