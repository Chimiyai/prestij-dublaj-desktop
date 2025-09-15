// src/components/project/ProjectActionButton.tsx
import { useState, useEffect } from 'react';
import type { IpcRendererEvent } from 'electron';
import type { ProjectDataForDetail } from '../../types';
import { Download, Library, ShoppingCart, CheckCircle, AlertTriangle, Play, Link2Off } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateQuickLaunchList } from '../../lib/quickLaunch';

interface ProjectActionButtonProps {
  project: ProjectDataForDetail;
  userHasGame: boolean;
}

type InstallationStatus = {
  status: 'idle' | 'downloading' | 'extracting' | 'copying' | 'success' | 'error';
  progress?: number;
  message?: string;
}

export default function ProjectActionButton({ project, userHasGame }: ProjectActionButtonProps) {
  const [status, setStatus] = useState<InstallationStatus>({ status: 'idle' });
  const [isInstalled, setIsInstalled] = useState(false); // YENİ: Kalıcı kurulum durumu

  // Bileşen yüklendiğinde ve proje değiştiğinde kurulum durumunu kontrol et
  useEffect(() => {
    window.electronStore.get(`installStatus_${project.slug}`).then(installedStatus => {
      setIsInstalled(installedStatus === 'installed');
    });
  }, [project.slug]);

  useEffect(() => {
    const listener = (_event: IpcRendererEvent, ...args: unknown[]) => {
      const newStatus = args[0] as InstallationStatus;
      setStatus(newStatus);
      if (newStatus.status === 'success') {
        window.electronStore.set(`installStatus_${project.slug}`, 'installed');
        setIsInstalled(true);
        
        // --- BU BÖLÜMÜN TAMAMINI SİLİYORUZ ---
        // const addToQuickLaunch = async () => { ... };
        // addToQuickLaunch();
        // --- BİTİŞ ---

        toast.dismiss();
        toast.success(newStatus.message || 'Başılı!');
      }
    };
    
    window.ipcRenderer.on('installation-status', listener);
    return () => {
      window.ipcRenderer.removeListener('installation-status', listener as (...args: unknown[]) => void);
    };
  }, [project.slug]);

  const handleLaunchGame = async () => {
    const installPath = await window.electronStore.get(`installPath_${project.slug}`);
    if (typeof installPath !== 'string' || !installPath) {
      toast.error("Oyun yolu bulunamadı. Lütfen ayarlardan kontrol edin.");
      return;
    }
    // main process'e oyunu başlatma komutu gönder
    window.modInstaller.launchGame(installPath); 
    updateQuickLaunchList({
      slug: project.slug,
      title: project.title,
      coverImagePublicId: project.coverImagePublicId,
      installPath: installPath,
    });
  };

  const handleInstallMod = async () => {
    const downloadUrl = project.externalWatchUrl;
    if (!downloadUrl) {
      toast.error('Bu proje için bir indirme linki bulunamadı.');
      return;
    }

    // YENİ: Kurulumdan önce kayıtlı yolu kontrol et
    const installPath = await window.electronStore.get(`installPath_${project.slug}`);
    
    // --- SORUNUN KAYNAĞI BURASI ---
    if (typeof installPath !== 'string' || installPath.trim() === '') {
      toast.error('Lütfen önce sağ üstteki ayarlar menüsünden oyunun kurulum yolunu belirtin.');
      return; // <-- FONKSİYON BURADA DURUYOR!
    }
    // --- BİTİŞ ---

    setStatus({ status: 'downloading', message: 'Başlatılıyor...' });
    toast.loading('Kurulum başlıyor...');
    
    // Kod bu satıra hiç ulaşamıyor
    await window.modInstaller.install({
      downloadUrl,
      projectTitle: project.title,
      installPath: installPath,
    });
  };

  if (isInstalled) {
    return (
      <button onClick={handleLaunchGame} className="flex items-center gap-3 px-8 py-4 bg-teal-500 text-white font-bold rounded-lg hover:bg-teal-600 transition-all transform hover:scale-105">
        <Play size={24} />
        OYUNU BAŞLAT
      </button>
    );
  }

  if (!project.externalWatchUrl) {
    return (
      <button 
        disabled={true}
        className="flex items-center gap-3 px-8 py-4 bg-gray-700 text-gray-400 font-bold rounded-lg cursor-not-allowed"
      >
        <Link2Off size={24} />
        Link Bekleniyor
      </button>
    );
  }

  const handlePurchase = () => {
    toast.error('Masaüstü uygulamasından satın alma henüz aktif değil. Lütfen web sitemizi ziyaret edin.');
  };

  const isLoading = ['downloading', 'extracting', 'copying'].includes(status.status);
  const isPaidGame = typeof project.price === 'number' && project.price > 0;
  
  // 1. Ücretli ve Kullanıcı Sahip
  if (isPaidGame && userHasGame) {
    return (
      <button onClick={handleInstallMod} disabled={isLoading || status.status === 'success'} className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100">
        {status.status === 'downloading' && <><Download size={24} /> {`İndiriliyor... ${status.progress?.toFixed(0) || 0}%`}</>}
        {status.status === 'extracting' && <><Download size={24} /> Ayıklanıyor...</>}
        {status.status === 'copying' && <><Download size={24} /> Kopyalanıyor...</>}
        {status.status === 'success' && <><CheckCircle size={24} /> Başarıyla Kuruldu</>}
        {status.status === 'error' && <><AlertTriangle size={24} /> Tekrar Dene</>}
        {status.status === 'idle' && <><Download size={24} /> ŞİMDİ KUR</>}
      </button>
    );
  }

  // 2. Ücretli ve Kullanıcı Sahip Değil
  if (isPaidGame && !userHasGame) {
    return (
      <button onClick={handlePurchase} className="flex items-center gap-3 px-8 py-4 bg-prestij-purple text-white font-bold rounded-lg hover:bg-prestij-purple-darker transition-all transform hover:scale-105">
        <ShoppingCart size={24} />
        {`${project.price?.toFixed(2)} ${project.currency || 'TRY'} - SATIN AL`}
      </button>
    );
  }

  // 3. Ücretsiz
  if (!isPaidGame) {
    return (
      // Butonun onClick'i artık doğrudan handleInstallMod'u çağırıyor.
      <button onClick={handleInstallMod} disabled={isLoading || status.status === 'success'} className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100">
        {status.status === 'downloading' && <><Download size={24} /> {`İndiriliyor... ${status.progress?.toFixed(0) || 0}%`}</>}
        {status.status === 'extracting' && <><Download size={24} /> Ayıklanıyor...</>}
        {status.status === 'copying' && <><Download size={24} /> Kopyalanıyor...</>}
        {status.status === 'success' && <><CheckCircle size={24} /> Başarıyla Kuruldu</>}
        {status.status === 'error' && <><AlertTriangle size={24} /> Tekrar Dene</>}
        {status.status === 'idle' && <><Download size={24} /> ÜCRETSİZ KUR</>}
      </button>
    );
  }

  return null;
}