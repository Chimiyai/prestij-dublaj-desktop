// src/vite-env.d.ts

/// <reference types="vite/client" />
import type { IpcRendererEvent } from 'electron';


export interface IElectronShell {
  openExternal: (url: string) => Promise<void>;
}

// --- BU BÖLÜMÜ EKLEYİN ---

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  // Gelecekte başka değişkenler eklersen buraya yazabilirsin
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Electron ve React arasında köprü kuracak olan API'mızın arayüzünü (interface) tanımlıyoruz.
export interface IpcRenderer {
  send: (channel: string, data?: unknown) => void;
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => void;
  removeListener: (channel: string, listener: (...args: unknown[]) => void) => void;
}
// Global `Window` arayüzünü genişleterek kendi 'ipcRenderer' özelliğimizi ekliyoruz.
declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    electronShell: IElectronShell;
  }
}

// --- EKLEME BÖLÜMÜ SONU ---

export interface IElectronStore {
  // 'any' yerine 'unknown' kullanıyoruz
  get: (key: string) => Promise<unknown>; 
  set: (key: string, val: unknown) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

// Yeni modInstaller için bir arayüz
export interface IModInstaller {
  install: (args: { downloadUrl: string; projectTitle: string }) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    electronStore: IElectronStore;
    modInstaller: IModInstaller; // Yeni arayüzü ekle
  }
}