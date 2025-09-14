// src/components/project/SettingsModal.tsx
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { FolderOpen, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  projectSlug: string;
}

export default function SettingsModal({ isOpen, onClose, projectSlug }: Props) {
  const [installPath, setInstallPath] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      window.electronStore.get(`installPath_${projectSlug}`).then(path => {
        setInstallPath((path as string | null) || '');
        setIsLoading(false);
      });
    }
  }, [isOpen, projectSlug]);

  // Klasör seçme diyaloğunu açmak için main process'e istek gönder
  const handleSelectFolder = async () => {
    const selectedPath = await window.modInstaller.selectDirectory();
    if (selectedPath) {
      setInstallPath(selectedPath);
    }
  };
  
  // Seçilen yolu kaydetmek için main process'e istek gönder
  const handleSaveChanges = () => {
    window.electronStore.set(`installPath_${projectSlug}`, installPath);
    toast.success('Ayarlar kaydedildi!');
    onClose();
  };

  const handleResetInstallation = () => {
    if (confirm("Bu projenin kurulum durumunu sıfırlamak istediğinizden emin misiniz? Bu işlem dosyaları silmez, sadece uygulamanın modu 'kurulmamış' olarak görmesini sağlar.")) {
      window.electronStore.delete(`installStatus_${projectSlug}`);
      toast.success('Kurulum durumu sıfırlandı. Artık modu yeniden kurabilirsiniz.');
      onClose(); // Pencereyi kapat ki değişiklik ana sayfaya yansısın.
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* ... (Modal arkaplanı ve paneli için Headless UI kodları) ... */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-prestij-bg-dark-1 p-6 text-left align-middle shadow-xl transition-all border border-prestij-border-primary">
              <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-white flex justify-between items-center">
                Proje Ayarları
                <button onClick={onClose} className="p-1 rounded-full hover:bg-prestij-bg-button"><X size={20}/></button>
              </Dialog.Title>
              <div className="mt-4">
                <label className="block text-sm font-medium text-prestij-text-secondary mb-2">
                  Oyun Kurulum Yolu (.exe'nin olduğu klasör)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={isLoading ? 'Yükleniyor...' : installPath || 'Oyunun .exe dosyası seçilmedi'}
                    className="flex-grow bg-prestij-bg-dark-2 border border-prestij-border-secondary rounded-md px-3 py-2 text-prestij-text-primary placeholder-prestij-text-placeholder"
                  />
                  <button onClick={handleSelectFolder} className="p-2 bg-prestij-bg-button rounded-md hover:bg-prestij-purple/80">
                    <FolderOpen size={20} />
                  </button>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-prestij-border-secondary">
          <h4 className="text-sm font-medium text-prestij-text-secondary mb-2">Gelişmiş</h4>
          <button onClick={handleResetInstallation} className="w-full text-left text-sm text-red-400/80 hover:bg-red-500/20 hover:text-red-400 p-2 rounded-md transition-colors">
            Kurulumu Sıfırla
          </button>
          <p className="text-xs text-gray-500 mt-1 px-2">
            Eğer mod düzgün çalışmıyorsa veya yeniden kurmak istiyorsanız bu seçeneği kullanın.
          </p>
        </div>
              <div className="mt-6">
                <button onClick={handleSaveChanges} className="w-full py-2 bg-prestij-purple rounded-lg font-bold hover:bg-prestij-purple-darker">
                  Değişiklikleri Kaydet
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}