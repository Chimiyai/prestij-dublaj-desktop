// electron/main.ts

import AdmZip from 'adm-zip';
import path from 'node:path';
import fs from 'node:fs'; // promises yerine normal fs'i kullanalım (stream için daha kolay)
import util from 'node:util';
import { pipeline } from 'node:stream';
import axios from 'axios'; // axios'u import et
import Store from 'electron-store';
import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron';
import { fileURLToPath } from 'node:url';

const streamPipeline = util.promisify(pipeline);

const store = new Store();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const DIST_PATH = path.join(__dirname, '../dist');
const PUBLIC_PATH = VITE_DEV_SERVER_URL ? path.join(__dirname, '../public') : DIST_PATH;

function createWindow() {
  const win = new BrowserWindow({
    icon: path.join(PUBLIC_PATH, 'favicon.ico'), // public'e bir ikon koy
    webPreferences: { preload: path.join(__dirname, 'preload.mjs'), },
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(DIST_PATH, 'index.html'));
  }
}

// YENİ YARDIMCI FONKSİYON: Google Drive linkini dönüştürür
function getGoogleDriveDirectDownloadUrl(originalUrl: string): string {
  // DEĞİŞİKLİK BURADA: fileId'nin tipini string veya null olarak belirtiyoruz.
  let fileId: string | null = null;
  
  // Örnek: https://drive.google.com/file/d/FILE_ID/view...
  let match = originalUrl.match(/file\/d\/([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    fileId = match[1];
  } else {
    // Örnek: https://drive.google.com/uc?id=FILE_ID...
    match = originalUrl.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      fileId = match[1];
    }
  }

  if (fileId) {
    return `https://drive.google.com/uc?export=download&id=${fileId}&confirm=t`;
  }
  
  return originalUrl;
}

app.whenReady().then(() => {
  
  // --- YENİ IPC HANDLER'LAR ---
  // Arayüzden gelen 'electron-store-get' isteğini dinle
  ipcMain.handle('electron-store-get', async (event, key) => {
    return store.get(key);
  });
  // Arayüzden gelen 'electron-store-set' isteğini dinle
  ipcMain.handle('electron-store-set', async (event, key, val) => {
    store.set(key, val);
  });
  // Arayüzden gelen 'electron-store-delete' isteğini dinle
  ipcMain.handle('electron-store-delete', async (event, key) => {
    store.delete(key);
  });
  // --- BİTİŞ ---

  ipcMain.handle('open-external-url', (event, url) => {
    // Güvenlik için sadece http veya https ile başlayan linkleri aç
    if (url && (url.startsWith('http:') || url.startsWith('https:'))) {
      shell.openExternal(url);
    }
  });

  createWindow();

  // Arayüzden (Renderer) gelen 'open-login-window' mesajını dinle
  ipcMain.on('open-login-window', () => {
    console.log("Giriş penceresi açma komutu alındı!");
    
    // Yeni bir tarayıcı penceresi oluştur
    const loginWindow = new BrowserWindow({
      width: 500,
      height: 700,
      webPreferences: {
        // preload script'i burada GEREKMEZ, çünkü bu pencere dış bir siteyi yüklüyor
      },
      autoHideMenuBar: true,
    });

    // Web sitenizin giriş sayfasının tam URL'ini buraya yazın
    loginWindow.loadURL('http://localhost:3000/giris'); // Geliştirme ortamındaki URL
    loginWindow.webContents.openDevTools();
  });

  // === YENİ MOD KURULUM HANDLER'I ===
  ipcMain.handle('install-mod', async (event, { downloadUrl, projectTitle, installPath }) => {
    // HATA 1 ÇÖZÜMÜ: Bu satırı siliyoruz, artık kullanılmıyor.
    // const win = BrowserWindow.getAllWindows()[0]; 
    const tempDir = app.getPath('temp');
    const downloadedZipPath = path.join(tempDir, `${projectTitle.replace(/\s/g, '_')}-${Date.now()}.zip`);

    try {
      event.sender.send('installation-status', { status: 'downloading', progress: 0, message: 'Mod indiriliyor...' });
      const directDownloadUrl = getGoogleDriveDirectDownloadUrl(downloadUrl);
      
      const response = await axios({
        method: 'get',
        url: directDownloadUrl,
        responseType: 'stream',
      });

      const totalLength = response.headers['content-length'];
      let downloadedLength = 0;
      response.data.on('data', (chunk: Buffer) => {
        downloadedLength += chunk.length;
        if (totalLength) {
          const percentage = (downloadedLength / parseInt(totalLength, 10)) * 100;
          event.sender.send('installation-status', { status: 'downloading', progress: percentage });
        }
      });
      
      await streamPipeline(response.data, fs.createWriteStream(downloadedZipPath));

      event.sender.send('installation-status', { status: 'extracting', message: 'Dosyalar ayıklanıyor...' });
      
      const gameInstallPath = installPath;
      if (!gameInstallPath) throw new Error('Oyun kurulum yolu belirtilmemiş.');
      
      const zip = new AdmZip(downloadedZipPath);
      await fs.promises.mkdir(gameInstallPath, { recursive: true });
      zip.extractAllTo(gameInstallPath, true);
      
      event.sender.send('installation-status', { status: 'copying', message: 'Dosyalar kopyalanıyor...' });
      
      await fs.promises.unlink(downloadedZipPath);
      
      event.sender.send('installation-status', { status: 'success', message: `${projectTitle} başarıyla kuruldu!` });
      return { success: true };

    } catch (error) {
      console.error('Mod kurulum hatası:', error);
      try { 
        await fs.promises.unlink(downloadedZipPath); 
      } catch {
        // HATA 2 ÇÖZÜMÜ: Buraya bir yorum ekliyoruz.
        // Dosya zaten yoksa veya silinemiyorsa bu hatayı görmezden gel.
      }
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
      event.sender.send('installation-status', { status: 'error', message: errorMessage });
      return { success: false, error: errorMessage };
    }
  });

  ipcMain.handle('select-directory', async () => {
    const win = BrowserWindow.getAllWindows()[0];
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ['openDirectory']
    });
    if (!canceled && filePaths.length > 0) {
      return filePaths[0];
    }
    return null;
  });
});