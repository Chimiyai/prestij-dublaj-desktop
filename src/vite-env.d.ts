// src/vite-env.d.ts

/// <reference types="vite/client" />
import type { IpcRendererEvent } from 'electron';


export interface IElectronShell {
  openExternal: (url: string) => Promise<void>;
}


interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly VITE_GOOGLE_DRIVE_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export interface IpcRenderer {
  send: (channel: string, data?: unknown) => void;
  on: (channel: string, listener: (event: IpcRendererEvent, ...args: unknown[]) => void) => void;
  removeListener: (channel: string, listener: (...args: unknown[]) => void) => void;
}
declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    electronShell: IElectronShell;
  }
}

export interface IElectronStore {
  get: (key: string) => Promise<unknown>; 
  set: (key: string, val: unknown) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

export interface IModInstaller {
  install: (args: { downloadUrl: string; projectTitle: string; installPath: string }) => Promise<{ success: boolean; error?: string }>;
  selectDirectory: () => Promise<string | null>;
  launchGame: (path: string) => Promise<{ success: boolean; error?: string }>;
}

declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
    electronStore: IElectronStore;
    modInstaller: IModInstaller;
  }
}
declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}