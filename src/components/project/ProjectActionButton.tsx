// src/components/project/ProjectActionButton.tsx
import { useState, useEffect } from 'react';
import type { IpcRendererEvent } from 'electron';
import type { ProjectDataForDetail } from '../../types';
import { Download, ShoppingCart, CheckCircle, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

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

  useEffect(() => {
    // HATA 1 ÇÖZÜMÜ: Gelen argümanı güvenli bir şekilde cast ediyoruz.
    const listener = (_event: IpcRendererEvent, ...args: unknown[]) => {
      const newStatus = args[0] as InstallationStatus; // Tip güvencesi
      setStatus(newStatus);
      
      if (newStatus.status === 'success' || newStatus.status === 'error') {
        toast.dismiss();
        if (newStatus.status === 'success') toast.success(newStatus.message || 'Başarılı!');
        if (newStatus.status === 'error') toast.error(newStatus.message || 'Hata!');
      }
    };
    
    window.ipcRenderer.on('installation-status', listener);

    return () => {
      window.ipcRenderer.removeListener('installation-status', listener as (...args: unknown[]) => void);
    };
  }, []);

  const handleInstallMod = async () => {
    const downloadUrl = project.externalWatchUrl;
    if (!downloadUrl) {
      toast.error('Bu proje için bir indirme linki bulunamadı.');
      return;
    }
    setStatus({ status: 'downloading', message: 'Başlatılıyor...' });
    toast.loading('Kurulum başlıyor...');
    await window.modInstaller.install({
      downloadUrl,
      projectTitle: project.title,
    });
  };

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