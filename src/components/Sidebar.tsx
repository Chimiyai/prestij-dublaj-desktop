// src/components/Sidebar.tsx
import { useState, useEffect, Fragment } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Compass, Library, User, LogOut, ExternalLink, Play, UserCircle2 } from 'lucide-react'; // Play ikonunu ekle
import { useAuth } from '../hooks/useAuth';
import { Menu, Transition } from '@headlessui/react';
import { getCloudinaryImageUrl } from '../lib/cloudinary'; // Resimler için yardımcıyı import et
import toast from 'react-hot-toast';
import { updateQuickLaunchList } from '../lib/quickLaunch';
import logoUrl from '/logo.png';
import { UserCircle} from 'lucide-react';

// Hızlı Başlatma öğesinin tipini tanımlayalım
export interface QuickLaunchItem {
  slug: string;
  title: string;
  coverImagePublicId: string | null;
  installPath: string;
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [quickLaunchItems, setQuickLaunchItems] = useState<QuickLaunchItem[]>([]);

  // Bileşen yüklendiğinde Hızlı Başlatma listesini çek
  useEffect(() => {
    window.electronStore.get('quickLaunchList').then(items => {
      if (items && Array.isArray(items)) {
        setQuickLaunchItems(items);
      }
    });
  }, []); // Bu sadece başlangıçta çalışır.
  
  const fetchQuickLaunchItems = async () => {
    const items = await window.electronStore.get('quickLaunchList');
    if (items && Array.isArray(items)) {
      setQuickLaunchItems(items);
    }
  };

  useEffect(() => {
    fetchQuickLaunchItems(); // Başlangıçta listeyi çek

    // Hızlı Başlat listesi güncellendiğinde tetiklenecek bir dinleyici ekle
    const handleUpdate = () => fetchQuickLaunchItems();
    window.addEventListener('quickLaunchUpdated', handleUpdate);

    // Bileşen kaldırıldığında dinleyiciyi temizle
    return () => {
      window.removeEventListener('quickLaunchUpdated', handleUpdate);
    };
  }, []);

  const handleLaunchGame = (item: QuickLaunchItem) => {
    if (item.installPath) {
      toast.loading(`${item.title} başlatılıyor...`);
      window.modInstaller.launchGame(item.installPath).then(result => {
        toast.dismiss();
        if (!result.success) {
          toast.error(`Oyun başlatılamadı: ${result.error}`);
        }
      });
      updateQuickLaunchList(item);
    } else {
      toast.error("Oyun yolu bulunamadı.");
    }
  };

  const activeLinkStyle = {
  backgroundColor: '#8B4EFF',
  color: 'white',
};
  return (
    <aside className="w-16 h-full flex flex-col items-center p-3 border-prestij-border-primary">
      {/* 1. Logo Bölümü */}
      <div className="flex-shrink-0 mb-8 h-20 w-20"> {/* Boyutu div'e verelim */}
        {/* DEĞİŞİKLİK BURADA */}
        <img 
          src={logoUrl} 
          alt="PrestiJ Studio Logo" 
          className="h-full w-full object-contain" // object-contain oranını korur
        />
      </div>

      {/* 2. Navigasyon (Ortalanmış) */}
      <div className="flex-grow flex flex-col justify-center w-full">
        <nav className="flex flex-col items-center space-y-4">
          <NavLink to="/discover" title="Keşfet" end
            className="p-3 rounded-lg text-prestij-text-muted hover:bg-prestij-bg-button hover:text-white transition-colors"
            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
          >
            <Compass size={22} />
          </NavLink>
          <NavLink to="/library" title="Kütüphane" 
            className="p-3 rounded-lg text-prestij-text-muted hover:bg-prestij-bg-button hover:text-white transition-colors"
            style={({ isActive }) => isActive ? activeLinkStyle : undefined}
          >
            <Library size={22} />
          </NavLink>
        </nav>
      </div>

      {/* 3. BÖLÜM: Hızlı Başlatma */}
      {quickLaunchItems.length > 0 && (
        <div className="flex-shrink-0 my-4 space-y-2">
          {quickLaunchItems.map(item => (
            <div key={item.slug} className="group relative">
              <button 
                onClick={() => handleLaunchGame(item)}
                className="w-10 h-10 flex items-center justify-center rounded-full overflow-hidden border-2 border-transparent hover:border-prestij-purple transition-colors"
              >
                {getCloudinaryImageUrl(item.coverImagePublicId) ? (
                   <img 
                      src={getCloudinaryImageUrl(item.coverImagePublicId) || undefined} 
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                ) : <Play size={16} className="text-gray-400"/> }
              </button>
              {/* --- YENİ: Hızlı Başlat Tooltip --- */}
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-prestij-bg-dark-1 text-white text-sm font-semibold rounded-md shadow-lg whitespace-nowrap
                            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {item.title}
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-prestij-bg-dark-1 transform rotate-45"></div> {/* Tooltip oku */}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 4. BÖLÜM: Profil Menüsü */}
      <div className="flex-shrink-0 mt-auto">
        <Menu as="div" className="relative">
          <Menu.Button className="w-10 h-10 rounded-full overflow-hidden bg-prestij-bg-dark-1 border-2 border-transparent hover:border-prestij-purple focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-prestij-bg-dark-2 focus:ring-prestij-purple transition-all">
            {getCloudinaryImageUrl(user?.profileImagePublicId) ? (
              <img 
                src={getCloudinaryImageUrl(user?.profileImagePublicId) || undefined}
                alt="Profil"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserCircle2 className="w-full h-full text-gray-500" />
            )}
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute bottom-0 left-full ml-3 w-48 origin-bottom-left rounded-md bg-prestij-bg-dark-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="px-1 py-1">
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
                  <p className="text-xs text-prestij-text-muted">Profil</p>
                </div>
                <div className="h-px bg-prestij-border-primary my-1"></div>
                <Menu.Item>
                  {({ active }) => (
                    // --- DEĞİŞİKLİK BURADA ---
                    <button 
                      onClick={() => {
                        console.log("Profili Görüntüle butonuna tıklandı!");
                        const profileUrl = `https://prestijstudio.com/profil/${user?.username}`;
                        window.electronShell.openExternal(profileUrl);
                      }} 
                      className={`${active ? 'bg-prestij-bg-button text-white' : 'text-prestij-text-secondary'} group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                    >
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Profili Görüntüle
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button 
                      onClick={() => {
                        console.log("Çıkış Yap butonuna tıklandı!");
                        logout();
                        navigate('/login');
                      }} 
                      className={`${active ? 'bg-red-500/20 text-red-400' : 'text-red-400/80'} group flex w-full items-center rounded-md px-4 py-2 text-sm`}
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Çıkış Yap
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </aside>
  );
}