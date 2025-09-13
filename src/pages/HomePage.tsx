// src/pages/HomePage.tsx
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../lib/api'; // Merkezi API istemcimizi import et
import type { Project } from '../types';
import ProjectCard from '../components/ProjectCard'; // Kart bileşenini import et

export default function HomePage() {
  const { user, logout } = useAuth(); // Çıkış yapmak için logout fonksiyonunu alalım
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Web sitendeki API endpoint'ine istek atıyoruz.
        // Bu endpoint'in tüm projeleri döndürdüğünden emin ol.
        const response = await api.get('/projects'); 
        setProjects(response.data);
      } catch (err) {
        console.error("Projeler çekilirken hata:", err);
        setError("Projeler yüklenirken bir sorun oluştu.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []); // Bu effect sadece bileşen ilk yüklendiğinde çalışır

  if (isLoading) {
    return <div className="text-white text-center p-10">Kütüphane Yükleniyor...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-center p-10">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-site-bg-main text-prestij-text-primary p-8">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Kütüphane</h1>
          <p className="text-prestij-text-muted">Hoş geldin, {user?.username}!</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-prestij-bg-button text-sm font-semibold rounded-md hover:bg-red-800/50 transition-colors"
        >
          Çıkış Yap
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}