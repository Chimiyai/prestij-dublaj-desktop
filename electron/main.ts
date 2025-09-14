// electron/main.ts

import { app, BrowserWindow, ipcMain, dialog, session, shell } from 'electron';
import path from 'node:path';
import fs from 'node:fs/promises';
import Store from 'electron-store';
import { fileURLToPath } from 'node:url';
import { autoUpdater } from 'electron-updater';

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


  // Geliştirme ortamında otomatik güncellemeyi test etmeyi kolaylaştırır.
  // Uygulamayı paketlediğinde bu satırları silebilir veya yoruma alabilirsin.
  Object.defineProperty(app, 'isPackaged', {
    get() {
      return true;
    }
  });

  // Arayüze mesaj göndermek için bir yardımcı fonksiyon
  const sendStatusToWindow = (text: string, data?: unknown) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (win) {
      win.webContents.send('update-status', { text, data });
    }
  };

  // Güncelleme kontrolü başladığında
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Güncellemeler kontrol ediliyor...');
  });

  // Yeni bir güncelleme bulunduğunda
  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Yeni bir güncelleme mevcut!', info);
  });

  // Herhangi bir güncelleme bulunamadığında
  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Uygulama güncel.', info);
    // Belirli bir süre sonra bu mesajı gizlemek için arayüze bir komut gönderebiliriz.
    setTimeout(() => sendStatusToWindow('hide-status'), 3000);
  });

  // Güncelleme sırasında bir hata oluştuğunda
  autoUpdater.on('error', (err) => {
    sendStatusToWindow('Güncelleme hatası: ' + err.message);
  });

  // Güncelleme indirme ilerlemesi
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = `İndirme hızı: ${Math.round(progressObj.bytesPerSecond / 1024)} KB/s`;
    log_message = log_message + ` - İndirilen ${Math.round(progressObj.percent)}%`;
    log_message = log_message + ` (${Math.round(progressObj.transferred / 1024 / 1024)}MB / ${Math.round(progressObj.total / 1024 / 1024)}MB)`;
    sendStatusToWindow(log_message, progressObj);
  });

  // Güncelleme indirilip kurulmaya hazır olduğunda
  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Güncelleme indirildi. Uygulama yeniden başlatılacak...', info);
    
    // Kullanıcıya sormadan direkt yeniden başlatıp kurmak için:
    autoUpdater.quitAndInstall();

    // VEYA kullanıcıya bir butonla onaylatmak istersen,
    // arayüze özel bir mesaj gönderip ('update-ready' gibi),
    // arayüzden gelen 'restart-and-install' komutunu dinleyebilirsin.
  });

  // Uygulama başladığında güncelleme kontrolünü tetikle
  autoUpdater.checkForUpdatesAndNotify();

  // --- IPC İletişim Kanalları ---

  // 1. electron-store için
  ipcMain.handle('electron-store-get', async (_event, key) => store.get(key));
  ipcMain.handle('electron-store-set', async (_event, key, val) => store.set(key, val));
  ipcMain.handle('electron-store-delete', async (_event, key) => store.delete(key));

  // 2. Klasör Seçme Diyaloğu için
  ipcMain.handle('select-directory', async () => {
    const win = BrowserWindow.getAllWindows()[0];
    const { canceled, filePaths } = await dialog.showOpenDialog(win, { 
      title: 'Oyunun .exe Dosyasını Seçin',
      properties: ['openFile'],
      filters: [
        { name: 'Uygulama', extensions: ['exe'] }
      ]
    });
    // Kullanıcı .exe'yi seçtiğinde, biz o dosyanın bulunduğu KLASÖRÜN yolunu kaydedeceğiz.
    if (!canceled && filePaths.length > 0) {
      return path.dirname(filePaths[0]); // .exe'nin bulunduğu klasörün yolu
    }
    return null;
  });

  // 3. Mod Kurulumu için (Kullanıcı Tarafından Tetiklenen İndirme Yöntemi)
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
      driveWindow.close();
      
      const tempDir = app.getPath('temp');
      const downloadedFilePath = path.join(tempDir, item.getFilename());
      item.setSavePath(downloadedFilePath);

      event.sender.send('installation-status', { status: 'downloading', progress: 0, message: `İndiriliyor: ${item.getFilename()}` });

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
            
            // --- EKSİK OLAN VE GERİ EKLENEN KRİTİK BÖLÜM ---
            const AdmZip = (await import('adm-zip')).default;
            const zip = new AdmZip(downloadedFilePath);
            
            if (!installPath || typeof installPath !== 'string') {
                throw new Error("Kurulum yolu geçersiz veya bulunamadı.");
            }
            
            await fs.mkdir(installPath, { recursive: true });
            zip.extractAllTo(installPath, true); // Dosyaları ayıkla ve üzerine yaz
            
            await fs.unlink(downloadedFilePath); // İndirilen geçici ZIP dosyasını sil
            // --- BİTİŞ ---

            event.sender.send('installation-status', { status: 'success', message: `${projectTitle} başarıyla kuruldu!` });
          
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Dosya ayıklanırken bir hata oluştu.';
            event.sender.send('installation-status', { status: 'error', message: errorMessage });
            // Hata durumunda da geçici dosyayı silmeye çalış
            try { await fs.unlink(downloadedFilePath); } catch { /* ignore error */ }
          }
        } else {
          event.sender.send('installation-status', { status: 'error', message: `İndirme başarısız oldu: ${state}` });
        }
      });
    });

    return { success: true, message: 'İndirme penceresi açıldı.' };
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// BU FONKSİYONU GÜNCELLE
ipcMain.handle('launch-game', async (_event, installPath: string) => {
    try {
        if (!installPath || typeof installPath !== 'string') {
            throw new Error('Geçersiz kurulum yolu.');
        }
        
        // Klasördeki .exe'yi bul
        const files = await fs.readdir(installPath);
        const exeFile = files.find(file => file.toLowerCase().endsWith('.exe'));

        if (!exeFile) {
            throw new Error('.exe dosyası bu klasörde bulunamadı.');
        }

        const fullExePath = path.join(installPath, exeFile);
        const error = await shell.openPath(fullExePath); // .exe'yi çalıştır
        if (error) throw new Error(error);

        return { success: true };
    } catch (e) {
        console.error("Oyun başlatılamadı:", e);
        return { success: false, error: (e as Error).message };
    }
});
