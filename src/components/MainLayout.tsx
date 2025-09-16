// src/components/MainLayout.tsx
import React from 'react'; // React'ı import et
import Sidebar from './Sidebar';

// Bileşenin, 'children' adında bir prop alacağını belirtiyoruz
interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen w-screen bg-site-bg-main text-prestij-text-primary">
      <div className="relative z-30">
        <Sidebar />
      </div>
      <main className="flex-1 overflow-y-auto custom-scrollbar">
  {children}
</main>
    </div>
  );
}