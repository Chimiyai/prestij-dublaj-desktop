// src/components/Sidebar.tsx
import { Fragment } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Compass, Library, User, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Menu, Transition } from '@headlessui/react'; // Headless UI importları

// Aktif link stili için bir yardımcı değişken
const activeLinkStyle = {
  backgroundColor: '#8B4EFF', // prestij-purple
  color: 'white',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    const profileUrl = `http://localhost:3000/profil/${user?.username}`;
    window.electronShell.openExternal(profileUrl);
  };

  const handleLogout = () => {
    logout();
    navigate('/login'); // Çıkış yaptıktan sonra login sayfasına yönlendir
  };

  return (
    <aside className="w-64 bg-prestij-bg-dark-2 flex flex-col p-4 border-r border-prestij-border-primary">
      {/* 1. Logo Bölümü */}
      <div className="h-20 flex-shrink-0 flex items-center justify-center mb-4">
        <img src="/logo.png" alt="PrestiJ Studio Logo" className="h-32 w-auto" />
      </div>

      {/* 2. Navigasyon (Ortalanmış) */}
      <div className="flex-grow flex flex-col justify-center">
        <nav className="flex flex-col space-y-2">
          <NavLink to="/discover" end
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-prestij-text-secondary hover:bg-prestij-bg-button transition-colors"
          style={({ isActive }) => isActive ? activeLinkStyle : undefined}
        >
          <Compass size={20} />
          <span>Keşfet</span>
        </NavLink>
        <NavLink 
          to="/library"
          className="flex items-center space-x-3 px-4 py-3 rounded-lg text-prestij-text-secondary hover:bg-prestij-bg-button transition-colors"
          style={({ isActive }) => isActive ? activeLinkStyle : undefined}
        >
          <Library size={20} />
          <span>Kütüphane</span>
          </NavLink>
        </nav>
      </div>
      
      {/* 3. Profil Menüsü (En Altta) */}
      <div className="flex-shrink-0">
        <div className="border-t border-prestij-border-secondary mb-2"></div>
        <Menu as="div" className="relative">
          <Menu.Button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-prestij-text-secondary hover:bg-prestij-bg-button transition-colors">
            <User size={20} />
            <span className="flex-grow text-left font-semibold">{user?.username || 'Profil'}</span>
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
            <Menu.Items className="absolute bottom-full left-0 mb-2 w-full origin-bottom-right rounded-md bg-prestij-bg-dark-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <div className="py-1">
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={handleProfileClick} className={`${active ? 'bg-prestij-bg-button text-white' : 'text-prestij-text-secondary'} group flex w-full items-center rounded-md px-4 py-2 text-sm`}>
                      <ExternalLink className="mr-2 h-5 w-5" />
                      Profili Görüntüle
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <button onClick={handleLogout} className={`${active ? 'bg-red-500/20 text-red-400' : 'text-red-400/80'} group flex w-full items-center rounded-md px-4 py-2 text-sm`}>
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
