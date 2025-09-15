// electron/preload.ts
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// electron-store için olan kod
contextBridge.exposeInMainWorld('electronStore', {
  get: (key: string) => ipcRenderer.invoke('electron-store-get', key),
  set: (key: string, val: unknown) => ipcRenderer.invoke('electron-store-set', key, val),
  delete: (key: string) => ipcRenderer.invoke('electron-store-delete', key),
});

// ipcRenderer için olan (eski) kod
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, data?: unknown) => ipcRenderer.send(channel, data),
  // Tip olarak 'any' yerine daha spesifik tipler kullanalım
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => {
    ipcRenderer.on(channel, listener);
  },
  removeListener: (channel: string, listener: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, listener);
  },
});

contextBridge.exposeInMainWorld('modInstaller', {
  install: (args: { downloadUrl: string; projectTitle: string; installPath: string }) => 
    ipcRenderer.invoke('install-mod', args),
  // YENİ: Klasör seçme fonksiyonunu ekle
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  launchGame: (path: string) => ipcRenderer.invoke('launch-game', path),
  openPaymentWindow: (html: string) => ipcRenderer.invoke('open-payment-window', html), // YENİ
});