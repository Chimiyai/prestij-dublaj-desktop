// src/App.tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import MainLayout from './components/MainLayout';
import LibraryPage from './pages/LibraryPage'; // Geri ekle
import DiscoverPage from './pages/DiscoverPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import UpdateNotification from './components/UpdateNotification';

// Bu, giriş yapmış kullanıcıları koruyan bir sarmalayıcı bileşen
function ProtectedRoutes() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <MainLayout /> : <Navigate to="/login" />;
}

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-site-bg-main"></div>;
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoutes />}>
          <Route path="/" element={<Navigate to="/discover" />} />
          <Route path="/library" element={<LibraryPage />} /> {/* ARTIK AYRI BİR ROTA */}
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/project/:slug" element={<ProjectDetailPage />} />
        </Route>
      </Routes>
      <UpdateNotification />
    </HashRouter>
  );
}


export default App;