// src/App.tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Sayfaları ve Layout'u import et
import LoginPage from './pages/LoginPage';
import MainLayout from './components/MainLayout';
import LibraryPage from './pages/LibraryPage'; // HomePage'in yeni adı olacak
import DiscoverPage from './pages/DiscoverPage'; // Yeni sayfa

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
          <Route path="/" element={<Navigate to="/library" />} /> {/* Ana yolu Kütüphane'ye yönlendir */}
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;