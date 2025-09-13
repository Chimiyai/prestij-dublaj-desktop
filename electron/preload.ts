// electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronStore', {
  get: (key: string) => ipcRenderer.invoke('electron-store-get', key),
  set: (key: string, val: unknown) => ipcRenderer.invoke('electron-store-set', key, val),
  delete: (key: string) => ipcRenderer.invoke('electron-store-delete', key),
});

// Eski ipcRenderer'ı da bırakabiliriz, belki ileride lazım olur
contextBridge.exposeInMainWorld('ipcRenderer', {
  send: (channel: string, data?: unknown) => ipcRenderer.send(channel, data),
});