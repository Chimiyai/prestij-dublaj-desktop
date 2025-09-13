// electron/main.ts
import Store from 'electron-store';
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

  // ... (mevcut app.on('activate') vb. kodların)
});
