// src/App.tsx
import { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import type { IpcRendererEvent } from 'electron';

import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/MainLayout';
import LibraryPage from './pages/LibraryPage';
import DiscoverPage from './pages/DiscoverPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import UpdateNotification from './components/UpdateNotification';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// --- Bileşenler ---

// Bu bileşen, protokol dinleyicisini ve korumalı rotaları yönetir.
function AppRoutes() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // HATA 1 ÇÖZÜMÜ: Gelen argümanı güvenli bir şekilde cast et
    const handleProtocolAction = (
      _event: IpcRendererEvent, 
      ...args: unknown[]
    ) => {
      const action = args[0] as { command: string; slug: string }; // Tip güvencesi
      
      console.log('Protokol eylemi alındı:', action);
      if (action.command === 'install' || action.command === 'launch') {
        navigate(`/project/${action.slug}`, { 
          state: { autoInstall: true }
        });
      }
    };
    window.ipcRenderer.on('protocol-action', handleProtocolAction);
    return () => {
      window.ipcRenderer.removeListener('protocol-action', handleProtocolAction as (...args: unknown[]) => void);
    };
  }, [navigate]);

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        {/* Giriş yapmamış kullanıcı başka bir sayfaya gitmeye çalışırsa login'e yönlendir */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/discover" replace />} />
        <Route path="/library" element={<LibraryPage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/project/:slug" element={<ProjectDetailPage />} />
        {/* Giriş yapmış kullanıcı login sayfasına gitmeye çalışırsa ana sayfaya yönlendir */}
        <Route path="/login" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}


// Ana App bileşeni
export default function App() {
  const { isLoading } = useAuth();

  // Oturum durumu kontrol edilirken boş bir ekran göster
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-site-bg-main"></div>;
  }

  return (
    <>
      <HashRouter>
        <AppRoutes />
      </HashRouter>
      <UpdateNotification />
    </>
  );
}