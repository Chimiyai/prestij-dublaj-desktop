// src/components/MainLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Birazdan oluşturacağız

export default function MainLayout() {
  return (
    <div className="flex h-screen w-screen bg-site-bg-main text-prestij-text-primary">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet /> {/* Burası, aktif rotanın (Kütüphane, Keşfet vb.) içeriğinin gösterileceği yer */}
      </main>
    </div>
  );
}