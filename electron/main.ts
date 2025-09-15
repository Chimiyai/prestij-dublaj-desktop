// electron/main.ts

import { app, BrowserWindow, ipcMain, dialog, session, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import Store from 'electron-store';
import { fileURLToPath } from 'node:url';
import { autoUpdater } from 'electron-updater';
import AdmZip from 'adm-zip'; // AdmZip'i en üste, statik olarak import edelim

// --- Gerekli Kurulumlar ---
const store = new Store();

// --- Vite & Electron Yolları ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const DIST_PATH = path.join(__dirname, '../dist');
const PUBLIC_PATH = VITE_DEV_SERVER_URL ? path.join(__dirname, '../public') : DIST_PATH;

// --- Pencere Oluşturma Fonksiyonu ---
function createWindow() {
  const win = new BrowserWindow({
    icon: path.join(PUBLIC_PATH, 'favicon.ico'),
    webPreferences: { preload: path.join(__dirname, 'preload.mjs') },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(DIST_PATH, 'index.html'));
  }
}

// --- Uygulama Hazır Olduğunda ---
app.whenReady().then(() => {
  createWindow();

  // --- Otomatik Güncelleme Mantığı ---
  // Geliştirme ortamında test için...
  Object.defineProperty(app, 'isPackaged', { get() { return true; } });

  const sendStatusToWindow = (text: string, data?: unknown) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) win.webContents.send('update-status', { text, data });
  };
  
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
    const win = BrowserWindow.getAllWindows()[0];
    const { canceled, filePaths } = await dialog.showOpenDialog(win, { 
      title: 'Oyunun .exe Dosyasını Seçin',
      properties: ['openFile'],
      filters: [{ name: 'Uygulama', extensions: ['exe'] }]
    });
    if (!canceled && filePaths.length > 0) return path.dirname(filePaths[0]);
    return null;
  });

  ipcMain.handle('install-mod', async (event, { downloadUrl, projectTitle, installPath }) => {
    const win = BrowserWindow.getAllWindows()[0];
    const driveWindow = new BrowserWindow({
      width: 800,
      height: 600,
      parent: win,
      modal: true,
      autoHideMenuBar: true,
      title: `${projectTitle} için dosyayı indir`,
      webPreferences: {
        // Bu pencerenin Node.js'e veya preload script'lerine erişmesine gerek yok, daha güvenli.
        nodeIntegration: false,
        contextIsolation: true,
      }
    });
    driveWindow.loadURL(downloadUrl);
    
    session.defaultSession.once('will-download', async (_e, item) => {
      driveWindow.on('close', () => item.cancel());
      driveWindow.close();
      
      const downloadedFilePath = path.join(app.getPath('temp'), item.getFilename());
      item.setSavePath(downloadedFilePath);

      item.on('updated', (_event, state) => {
        if (state === 'progressing' && item.getTotalBytes() > 0) {
          const progress = (item.getReceivedBytes() / item.getTotalBytes()) * 100;
          event.sender.send('installation-status', { status: 'downloading', progress });
        }
      });
      
      item.once('done', async (_event, state) => {
        if (state === 'completed') {
          try {
            event.sender.send('installation-status', { status: 'extracting', message: 'Dosyalar ayıklanıyor...' });
            const zip = new AdmZip(downloadedFilePath);
            await fs.mkdir(installPath, { recursive: true });
            zip.extractAllTo(installPath, true);
            await fs.unlink(downloadedFilePath);
            event.sender.send('installation-status', { status: 'success', message: `${projectTitle} başarıyla kuruldu!` });
          } catch (error) {
            const msg = error instanceof Error ? error.message : 'Dosya ayıklanamadı.';
            event.sender.send('installation-status', { status: 'error', message: msg });
            try { await fs.unlink(downloadedFilePath); } catch {}
          }
        } else {
          event.sender.send('installation-status', { status: 'error', message: `İndirme başarısız: ${state}` });
        }
      });
    });

    return { success: true, message: 'İndirme penceresi açıldı.' };
  });

  // --- 'launch-game' handler'ı DOĞRU YERDE ---
  ipcMain.handle('launch-game', async (_event, installPath: string) => {
    try {
        if (!installPath || typeof installPath !== 'string') throw new Error('Geçersiz kurulum yolu.');
        const files = await fs.readdir(installPath);
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

});

ipcMain.handle('open-payment-window', (_event, paymentHTML: string) => {
    return new Promise((resolve) => {
      const win = BrowserWindow.getAllWindows()[0];
      const paymentWindow = new BrowserWindow({
        width: 600,
        height: 800,
        parent: win,
        modal: true,
        autoHideMenuBar: true,
        title: 'Güvenli Ödeme',
        webPreferences: {
          nodeIntegration: false,
          contextIsolation: true,
        }
      });
      
      paymentWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(paymentHTML)}`);
      
      paymentWindow.on('closed', () => {
        resolve({ closed: true });
      });
    });
  });

// --- Diğer App Olayları (whenReady'nin DIŞINDA) ---
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
