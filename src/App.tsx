// src/App.tsx
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import { useAuth } from './hooks/useAuth';

function App() {
  const { isAuthenticated, isLoading } = useAuth(); // <-- Context'ten gerçek durumu al

  // Oturum durumu kontrol edilirken bir yüklenme ekranı göster
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-site-bg-main text-white">
        <h1>Yükleniyor...</h1>
      </div>
    );
  }

  return (
    <HashRouter>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} 
        />
        <Route 
          path="/" 
          element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} 
        />
      </Routes>
    </HashRouter>
  );
}

export default App;