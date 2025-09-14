// src/pages/DiscoverPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { Filter } from 'lucide-react';
import api from '../lib/api';
import type { Project } from '../types';
import ProjectCard from '../components/ProjectCard';
// Filters tipini artık FilterSidebar'dan alıyoruz.
import FilterSidebar, { type Filters } from '../components/FilterSidebar';


export default function DiscoverPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState<Filters>({
        categories: [],
        price: 'all',
        libraryStatus: 'all', // Keşfet için varsayılan 'all'
    });

    const fetchProjects = useCallback(async (filters: Filters) => {
        setIsLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters.categories.length > 0) {
                params.append('category', filters.categories[0]);
            }
            if (filters.price !== 'all') {
                params.append('price', filters.price);
            }
            if (filters.libraryStatus !== 'all') {
                params.append('libraryStatus', filters.libraryStatus);
            }
            const response = await api.get(`/projects?${params.toString()}`);
            setProjects(response.data);
        } catch (err) {
      console.error("Projeler çekilirken hata:", err);
      setError("Projeler yüklenirken bir sorun oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects(activeFilters);
  }, [activeFilters, fetchProjects]);

  const handleApplyFilters = (newFilters: Filters) => {
    setActiveFilters(newFilters);
    setIsFilterOpen(false);
  };
  
  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center mt-16 text-prestij-text-muted">Projeler Yükleniyor...</p>;
    }
  
    if (error) {
      return <p className="text-center mt-16 text-red-400">{error}</p>;
    }
  
    if (projects.length === 0) {
      return <p className="text-center mt-16 text-prestij-text-muted">Seçilen filtrelere uygun proje bulunamadı.</p>;
    }
  
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Keşfet</h1>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-prestij-bg-button rounded-md hover:bg-prestij-purple/80 transition-colors"
          >
            <Filter size={20} />
            <span>Filtrele</span>
          </button>
        </header>

        {renderContent()}

      </div>
      
      <FilterSidebar 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)}
        currentFilters={activeFilters}
        onApplyFilters={handleApplyFilters} 
      />
    </>
  );
}