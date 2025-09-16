// electron/main.ts

import { app, BrowserWindow, ipcMain, dialog, session, shell } from 'electron';
import path from 'node:path';
import fsPromises from 'node:fs/promises';
import fs from 'node:fs'; 
import { pipeline } from 'node:stream';
import util from 'node:util';
import axios from 'axios';
import Store from 'electron-store';
import { fileURLToPath } from 'node:url';
import { autoUpdater } from 'electron-updater';
import AdmZip from 'adm-zip';

// --- Global Değişkenler ve Sabitler ---
let mainWindow: BrowserWindow | null = null;
const store = new Store();
const PROTOCOL = 'prestijdublaj';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const DIST_PATH = path.join(__dirname, '../dist');
const PUBLIC_PATH = VITE_DEV_SERVER_URL ? path.join(__dirname, '../public') : DIST_PATH;
let initialUrl: string | undefined = undefined;
const streamPipeline = util.promisify(pipeline); // stream için

// --- Fonksiyonlar ---
function handleProtocolUrl(url: string) {
  if (!mainWindow) {
    initialUrl = url;
    return;
  }
  try {
    const urlObj = new URL(url);
    const command = urlObj.hostname;
    const slug = urlObj.pathname.substring(1);
    mainWindow.webContents.send('protocol-action', { command, slug });
  } catch (e) {
    console.error('Protokol URL işlenemedi:', url, e);
  }
}

// --- Uygulama Protokol Kaydı ve Tek Örnek (Single Instance) Kontrolü ---
if (process.env.NODE_ENV === 'development' && process.platform === 'win32') {
  app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (_event, commandLine) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      const url = commandLine.find(arg => arg.startsWith(`${PROTOCOL}://`));
      if (url) handleProtocolUrl(url);
    }
  });
}

// --- Pencere Oluşturma Fonksiyonu ---
function createWindow() {
  mainWindow = new BrowserWindow({
    icon: path.join(PUBLIC_PATH, 'favicon.ico'),
    webPreferences: { preload: path.join(__dirname, 'preload.mjs') },
    width: 1280,
    height: 720,
    minWidth: 940,
    minHeight: 560,
  });

  mainWindow.setMenuBarVisibility(false);

  // --- YENİ VE KRİTİK BÖLÜM: İÇERİK GÜVENLİK POLİTİKASI ---
  // YouTube ve Vimeo gibi harici kaynaklardan 'iframe' yüklemeye izin ver.
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        // "frame-src" direktifi, hangi kaynaklardan iframe yüklenebileceğini belirtir.
        // "'self'" uygulamanın kendi kaynağından, geri kalanı ise güvendiğimiz dış kaynaklardır.
        'Content-Security-Policy': [ "frame-src 'self' https://www.youtube.com https://player.vimeo.com" ]
      }
    });
  });

  mainWindow.on('closed', () => { mainWindow = null; });
  
  mainWindow.webContents.on('did-finish-load', () => {
    if (initialUrl) {
      handleProtocolUrl(initialUrl);
      initialUrl = undefined;
    }
  });

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL); // Artık VITE_DEV_SERVER_URL'i tanır
  } else {
    mainWindow.loadFile(path.join(DIST_PATH, 'index.html')); // Artık DIST_PATH'i tanır
  }
}

// --- Uygulama Yaşam Döngüsü Olayları ---
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('open-url', (event, url) => {
  event.preventDefault();
  if (app.isReady()) {
    // Uygulama zaten hazırsa, hemen işle
    handleProtocolUrl(url);
  } else {
    // Hazır değilse, sakla (bu genellikle macOS için bir yedektir)
    initialUrl = url;
  }
});

// Windows'ta, uygulama kapalıyken gelen link, commandLine'ın bir parçası olur.
// `second-instance`'tan önce bunu kontrol edelim.
const urlFromCmd = process.argv.find(arg => arg.startsWith(`${PROTOCOL}://`));
if (urlFromCmd) {
    initialUrl = urlFromCmd;
}

// --- Uygulama Hazır Olduğunda Çalışacak Ana Blok ---
app.whenReady().then(() => {
  createWindow();
  const sendStatusToWindow = (text: string, data?: unknown) => {
    mainWindow?.webContents.send('update-status', { text, data });
  };
  Object.defineProperty(app, 'isPackaged', { get() { return true; } });
  autoUpdater.on('checking-for-update', () => sendStatusToWindow('Güncellemeler kontrol ediliyor...'));
  autoUpdater.on('update-available', (info) => sendStatusToWindow('Yeni bir güncelleme mevcut!', info));
  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Uygulama güncel.', info);
    setTimeout(() => sendStatusToWindow('hide-status'), 3000);
  });
  autoUpdater.on('error', (err) => sendStatusToWindow('Güncelleme hatası: ' + err.message));
  autoUpdater.on('download-progress', (p) => sendStatusToWindow(`İndiriliyor ${Math.round(p.percent)}%`));
  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Güncelleme indirildi. Yeniden başlatılıyor...', info);
    autoUpdater.quitAndInstall();
  });
  autoUpdater.checkForUpdatesAndNotify();

  // --- IPC İletişim Kanalları ---
  ipcMain.handle('electron-store-get', async (_event, key) => store.get(key));
  ipcMain.handle('electron-store-set', async (_event, key, val) => store.set(key, val));
  ipcMain.handle('electron-store-delete', async (_event, key) => store.delete(key));

  ipcMain.handle('select-directory', async () => {
    if (!mainWindow) return null;
    const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow!, {
      title: 'Oyunun .exe Dosyasını Seçin',
      properties: ['openFile'],
      filters: [{ name: 'Uygulama', extensions: ['exe'] }]
    });
    if (!canceled && filePaths.length > 0) return path.dirname(filePaths[0]);
    return null;
  });

  // --- YENİ VE BASİTLEŞTİRİLMİŞ 'install-mod' HANDLER'I ---
  ipcMain.handle('install-mod', async (event, { downloadUrl, projectTitle, installPath }) => {
    const tempDir = app.getPath('temp');
    const downloadedFilePath = path.join(tempDir, `${projectTitle.replace(/\s/g, '_')}-${Date.now()}.zip`);

    try {
      event.sender.send('installation-status', { status: 'downloading', progress: 0, message: 'Mod indiriliyor...' });
      
      const response = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'stream',
      });

      const totalLength = response.headers['content-length'];
      let downloadedLength = 0;
      response.data.on('data', (chunk: Buffer) => {
        downloadedLength += chunk.length;
        if (totalLength) {
          const percentage = (downloadedLength / parseInt(totalLength, 10)) * 100;
          event.sender.send('installation-status', { status: 'downloading', progress: percentage });
        } else {
          event.sender.send('installation-status', { status: 'downloading', receivedBytes: downloadedLength });
        }
      });
      
      // DEĞİŞİKLİK BURADA: createWriteStream'i standart 'fs' modülünden çağırıyoruz
      await streamPipeline(response.data, fs.createWriteStream(downloadedFilePath));

      event.sender.send('installation-status', { status: 'extracting', message: 'Dosyalar ayıklanıyor...' });
      
      const zip = new AdmZip(downloadedFilePath);
      // DEĞİŞİKLİK BURADA: Promise bazlı fonksiyonları 'fsPromises' üzerinden çağırıyoruz
      await fsPromises.mkdir(installPath, { recursive: true });
      zip.extractAllTo(installPath, true);
      await fsPromises.unlink(downloadedFilePath);
      
      event.sender.send('installation-status', { status: 'success', message: `${projectTitle} başarıyla kuruldu!` });
      return { success: true };

    } catch (error) {
      console.error('Mod kurulum hatası:', error);
      // DEĞİŞİKLİK BURADA: Promise bazlı fonksiyonları 'fsPromises' üzerinden çağırıyoruz
      try { await fsPromises.unlink(downloadedFilePath); } catch {}
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
      event.sender.send('installation-status', { status: 'error', message: errorMessage });
      return { success: false, error: errorMessage };
    }
  });

  // launch-game handler'ını da güncelle
  ipcMain.handle('launch-game', async (_event, installPath: string) => {
    try {
      if (!installPath || typeof installPath !== 'string') throw new Error('Geçersiz kurulum yolu.');
      // DEĞİŞİKLİK BURADA: Promise bazlı fonksiyonları 'fsPromises' üzerinden çağırıyoruz
      const files = await fsPromises.readdir(installPath);
      const exeFile = files.find(file => file.toLowerCase().endsWith('.exe'));
      if (!exeFile) throw new Error('.exe dosyası bu klasörde bulunamadı.');
      const fullExePath = path.join(installPath, exeFile);
      const error = await shell.openPath(fullExePath);
      if (error) throw new Error(error);
      return { success: true };
    } catch (e) {
      console.error("Oyun başlatılamadı:", e);
      return { success: false, error: (e as Error).message };
    }
  });
  
  ipcMain.handle('open-payment-window', (_event, paymentHTML: string) => {
    return new Promise((resolve) => {
      if (!mainWindow) return resolve({ closed: true });
      const paymentWindow = new BrowserWindow({
        width: 600,
        height: 800,
        parent: mainWindow,
        modal: true,
        autoHideMenuBar: true,
        title: 'Güvenli Ödeme',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });
      
      paymentWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(paymentHTML)}`);
      paymentWindow.on('closed', () => resolve({ closed: true }));
    });
  });

  ipcMain.handle('open-external-url', async (_event, url: string) => {
    if (url && (url.startsWith('http:') || url.startsWith('https:'))) {
      await shell.openExternal(url);
      return { success: true };
    }
    return { success: false, error: 'Geçersiz veya güvenli olmayan URL.' };
  });

});
