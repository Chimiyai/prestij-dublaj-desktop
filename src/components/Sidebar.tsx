// src/components/Sidebar.tsx
import { NavLink } from 'react-router-dom';
import { Compass, Library, User } from 'lucide-react'; // İkonları import et
import { useAuth } from '../hooks/useAuth';

// Aktif link stili için bir yardımcı değişken
const activeLinkStyle = {
  backgroundColor: '#8B4EFF', // prestij-purple
  color: 'white',
};

export default function Sidebar() {
  const { user } = useAuth();

  const handleProfileClick = () => {
    // Web sitenizin profil sayfasının URL yapısı
    const profileUrl = `http://localhost:3000/profil/${user?.username}`;
    window.electronShell.openExternal(profileUrl);
  };

  return (
    <aside className="w-64 bg-prestij-bg-dark-2 flex flex-col p-4 border-r border-prestij-border-primary">
      <div className="mb-8 text-center">
        {/* Buraya logonuz gelebilir */}
        <h1 className="text-2xl font-bold text-white">PrestiJ Dublaj</h1>
      </div>
      
      <nav className="flex flex-col space-y-2">
        <NavLink 
          to="/discover" 
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

      <div className="mt-auto">
        <div className="border-t border-prestij-border-secondary my-4"></div>
        <button
          onClick={handleProfileClick}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-prestij-text-secondary hover:bg-prestij-bg-button transition-colors"
        >
          <User size={20} />
          <span>{user?.username || 'Profil'}</span>
        </button>
      </div>
    </aside>
  );
}