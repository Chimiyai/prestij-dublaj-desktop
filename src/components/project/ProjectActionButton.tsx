// src/components/project/ProjectActionButton.tsx
import { useState, useEffect } from 'react';
import type { IpcRendererEvent } from 'electron';
import type { ProjectDataForDetail } from '../../types';
import { Download, ShoppingCart, CheckCircle, AlertTriangle, Play, Link2Off } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateQuickLaunchList } from '../../lib/quickLaunch';
import type { QuickLaunchItem } from '../Sidebar';
import api from '../../lib/api';

interface ProjectActionButtonProps {
  project: ProjectDataForDetail;
  userHasGame: boolean;
}

type InstallationStatus = {
  status: 'idle' | 'downloading' | 'extracting' | 'copying' | 'success' | 'error';
  progress?: number;
  message?: string;
  receivedBytes?: number; // Eklendi
  totalBytes?: number; // Eklendi
}

export default function ProjectActionButton({ project, userHasGame }: ProjectActionButtonProps) {
  const [status, setStatus] = useState<InstallationStatus>({ status: 'idle' });
  const [isInstalled, setIsInstalled] = useState(false);

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
        
        const addToQuickLaunch = async () => {
          const installPath = await window.electronStore.get(`installPath_${project.slug}`);
          if (typeof installPath === 'string' && installPath) {
            const newItem: QuickLaunchItem = {
              slug: project.slug,
              title: project.title,
              coverImagePublicId: project.coverImagePublicId,
              installPath: installPath,
            };
            await updateQuickLaunchList(newItem);
          }
        };
        addToQuickLaunch();
        
        toast.dismiss();
        toast.success(newStatus.message || 'Başarıyla kuruldu!');
      } else if (newStatus.status === 'error') {
        toast.dismiss();
        toast.error(newStatus.message || 'Bir hata oluştu.');
      }
    };
    
    window.ipcRenderer.on('installation-status', listener);
    return () => {
      window.ipcRenderer.removeListener('installation-status', listener as (...args: unknown[]) => void);
    };
  }, [project.slug, project.title, project.coverImagePublicId]);

  const handleLaunchGame = async () => {
    const installPath = await window.electronStore.get(`installPath_${project.slug}`) as string | null;
    if (!installPath) {
      toast.error("Oyun yolu bulunamadı. Lütfen ayarlardan kontrol edin.");
      return;
    }
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

    let installPath = await window.electronStore.get(`installPath_${project.slug}`) as string | null;

    if (!installPath) {
      toast.loading('Lütfen oyunun kurulum dosyasını (.exe) seçin...', { duration: 8000 });
      const selectedPath = await window.modInstaller.selectDirectory();
      toast.dismiss();

      if (selectedPath) {
        await window.electronStore.set(`installPath_${project.slug}`, selectedPath);
        installPath = selectedPath;
      } else {
        toast.error('Kurulum yolu seçilmedi, işlem iptal edildi.');
        return;
      }
    }

    setStatus({ status: 'downloading', message: 'Başlatılıyor...' });
    toast.loading('Kurulum başlıyor...');
    
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
      <button disabled={true} className="flex items-center gap-3 px-8 py-4 bg-gray-700 text-gray-400 font-bold rounded-lg cursor-not-allowed">
        <Link2Off size={24} />
        Link Bekleniyor
      </button>
    );
  }

  const handlePurchase = async () => {
    setStatus({ status: 'copying', message: 'Yönlendiriliyor...' }); // Butonu geçici olarak pasif hale getirelim
    toast.loading('Ödeme sayfasına yönlendiriliyorsunuz...');

    try {
      // 1. Sunucudan ödeme HTML'ini al
      const response = await api.post('/payment/create-session/shopier', {
        projectId: project.id,
      });
      const { paymentHTML } = response.data;

      if (!paymentHTML) {
        throw new Error('Ödeme formu alınamadı.');
      }
      
      toast.dismiss();

      // 2. Main process'e, bu HTML'i yeni bir pencerede açması için komut gönder
      const result = await window.modInstaller.openPaymentWindow(paymentHTML);

      // 3. Kullanıcı pencereyi kapattığında
      if (result.closed) {
        // Sayfanın yeniden yüklenmesini tetiklemek için bir olay yayınla
        // veya ProjectDetailPage'e bir fonksiyon prop'u geçerek yeniden veri çekmesini sağla.
        // En basit yöntem, kullanıcıya bir bildirim göstermektir.
        toast('Ödeme penceresi kapatıldı. Satın alım durumunuzu kontrol etmek için sayfayı yenileyebilirsiniz.', { icon: 'ℹ️' });
        // TODO: Proje detay sayfasını otomatik yenilemek için bir mekanizma kurulabilir.
      }

    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.message || 'Ödeme işlemi başlatılamadı.');
    } finally {
      setStatus({ status: 'idle' });
    }
  };

  const isLoading = ['downloading', 'extracting', 'copying'].includes(status.status);
  const isPaidGame = typeof project.price === 'number' && project.price > 0;
  
  const renderButtonIcon = () => {
    switch (status.status) {
        case 'downloading': return <Download size={24} className="animate-pulse" />;
        case 'extracting': return <Download size={24} className="animate-pulse" />;
        case 'copying': return <Download size={24} className="animate-pulse" />;
        case 'success': return <CheckCircle size={24} />;
        case 'error': return <AlertTriangle size={24} />;
        default:
            if (isPaidGame && !userHasGame) return <ShoppingCart size={24} />;
            return <Download size={24} />;
    }
  }

  const renderButtonText = () => {
    switch (status.status) {
      case 'downloading':
        if (status.totalBytes && status.totalBytes > 0) return `İndiriliyor... ${status.progress?.toFixed(0) || 0}%`;
        if (status.receivedBytes) return `İndiriliyor... (${(status.receivedBytes / 1024 / 1024).toFixed(1)} MB)`;
        return 'İndiriliyor...';
      case 'extracting': return 'Ayıklanıyor...';
      case 'copying': return 'Kopyalanıyor...';
      case 'success': return 'Başarıyla Kuruldu';
      case 'error': return 'Tekrar Dene';
      default:
        if (isPaidGame && userHasGame) return 'ŞİMDİ KUR';
        if (isPaidGame && !userHasGame) return `${project.price?.toFixed(2)} ${project.currency || 'TRY'} - SATIN AL`;
        if (!isPaidGame) return 'ÜCRETSİZ KUR';
        return 'Hata';
    }
  };

  // Tüm butonları tek bir yerde toplayalım
  if (isPaidGame) {
    if (userHasGame) {
      // Ücretli & Sahip
      return (
        <button onClick={handleInstallMod} disabled={isLoading || status.status === 'success'} className="flex items-center gap-3 px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100">
          {renderButtonIcon()}
          {renderButtonText()}
        </button>
      );
    } else {
      // Ücretli & Sahip Değil
      return (
        <button onClick={handlePurchase} className="flex items-center gap-3 px-8 py-4 bg-prestij-purple text-white font-bold rounded-lg hover:bg-prestij-purple-darker transition-all transform hover:scale-105">
          {renderButtonIcon()}
          {renderButtonText()}
        </button>
      );
    }
  } else {
    // Ücretsiz
    return (
      <button onClick={handleInstallMod} disabled={isLoading || status.status === 'success'} className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:scale-100">
        {renderButtonIcon()}
        {renderButtonText()}
      </button>
    );
  }
}
