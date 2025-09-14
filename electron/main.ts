// electron/main.ts
import Store from 'electron-store';
import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { download } from 'electron-dl';
import AdmZip from 'adm-zip';
import fs from 'node:fs/promises';
import WinReg from 'winreg';

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
  ipcMain.handle('install-mod', async (event, { downloadUrl, projectTitle }) => {
    const win = BrowserWindow.getAllWindows()[0]; // Ana pencereyi bul

    try {
      // --- Adım 1: İndirme ---
      event.sender.send('installation-status', { status: 'downloading', progress: 0, message: 'Mod indiriliyor...' });
      
      const dl = await download(win, downloadUrl, {
        directory: app.getPath('temp'), // Dosyayı geçici bir klasöre indir
        onProgress: (progress) => {
          event.sender.send('installation-status', { status: 'downloading', progress: progress.percent * 100 });
        }
      });
      
      const downloadedZipPath = dl.getSavePath();
      event.sender.send('installation-status', { status: 'extracting', message: 'Dosyalar ayıklanıyor...' });

      // --- Adım 2: Oyun Yolunu Bulma (Örnek: Steam için Cyberpunk 2077) ---
      // BU BÖLÜM HER OYUN İÇİN ÖZELLEŞTİRİLMELİDİR.
      // Şimdilik varsayılan bir yol kullanıyoruz.
      // GERÇEK UYGULAMADA BURASI ÇOK DAHA KARMAŞIK OLACAK.
      const gameInstallPath = await findCyberpunkPath(); // Bu fonksiyonu aşağıda yazacağız
      if (!gameInstallPath) {
        throw new Error('Cyberpunk 2077 kurulumu bulunamadı. Lütfen oyun yolunu manuel seçin.');
      }
      
      // --- Adım 3: ZIP'i Ayıklama ve Kopyalama ---
      const zip = new AdmZip(downloadedZipPath);
      // Hedef klasörün var olduğundan emin ol (örneğin Cyberpunk için 'archive/pc/mod')
      const targetPath = path.join(gameInstallPath, 'archive', 'pc', 'mod');
      await fs.mkdir(targetPath, { recursive: true });
      
      zip.extractAllTo(targetPath, /*overwrite*/ true);
      event.sender.send('installation-status', { status: 'copying', message: 'Dosyalar kopyalanıyor...' });

      // --- Adım 4: Temizlik ---
      await fs.unlink(downloadedZipPath); // İndirilen ZIP dosyasını sil
      
      event.sender.send('installation-status', { status: 'success', message: `${projectTitle} başarıyla kuruldu!` });
      return { success: true };

    } catch (error) {
      console.error('Mod kurulum hatası:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
      event.sender.send('installation-status', { status: 'error', message: errorMessage });
      return { success: false, error: errorMessage };
    }
  });
});

// === YENİ YARDIMCI FONKSİYON (main.ts'in en altına ekle) ===
// Bu fonksiyon, Windows Kayıt Defteri'nden Steam'in nerede kurulu olduğunu
// ve Cyberpunk 2077'nin kütüphane manifest dosyasını bularak oyunun yolunu tespit etmeye çalışır.
// BU SADECE BİR ÖRNEKTİR ve daha sağlam hale getirilmesi gerekir.
async function findCyberpunkPath(): Promise<string | null> {
  try {
    const steamRegKey = new WinReg({
      hive: WinReg.HKLM,
      key: '\\SOFTWARE\\Wow6432Node\\Valve\\Steam'
    });
    
    const steamPathItem = await new Promise<WinReg.RegistryItem>((resolve, reject) => {
      steamRegKey.get('InstallPath', (err, item) => {
        if (err) return reject(err);
        resolve(item);
      });
    });

    if (!steamPathItem || !steamPathItem.value) return null;
    
    const steamPath = steamPathItem.value;
    const libraryFoldersPath = path.join(steamPath, 'steamapps', 'libraryfolders.vdf');
    const vdfContent = await fs.readFile(libraryFoldersPath, 'utf-8');

    // Bu VDF ayrıştırma işlemi çok basittir ve daha sağlam bir kütüphane gerektirebilir.
    const libraryPaths = [steamPath];
    const matches = vdfContent.match(/"path"\s+"(.+?)"/g) || [];
    for (const match of matches) {
      const libPath = match.replace(/"path"\s+"/, '').replace(/"/, '').replace(/\\\\/g, '\\');
      libraryPaths.push(libPath);
    }
    
    // Cyberpunk 2077'nin Steam App ID'si 1091500'dür
    const appManifestName = 'appmanifest_1091500.acf';

    for (const libPath of libraryPaths) {
      const manifestPath = path.join(libPath, 'steamapps', appManifestName);
      try {
        await fs.access(manifestPath);
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        const installDirMatch = manifestContent.match(/"installdir"\s+"(.+?)"/);
        if (installDirMatch && installDirMatch[1]) {
          return path.join(libPath, 'steamapps', 'common', installDirMatch[1]);
        }
      } catch {
        // Dosya bulunamadı, bu normal bir durum, devam et.
      }
    }

    return null;
  } catch (error) {
    console.error("Steam yolu bulunurken hata:", error);
    return null;
  }
}