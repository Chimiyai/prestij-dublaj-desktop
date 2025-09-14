// src/pages/DiscoverPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, Search } from 'lucide-react'; // Search ikonunu import et
import api from '../lib/api';
import type { Project } from '../types';
import ProjectCard from '../components/ProjectCard';
import FilterSidebar, { type Filters } from '../components/FilterSidebar';
import { useDebounce } from '../hooks/useDebounce'; // Yeni hook'umuzu import et

export default function DiscoverPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [searchParams] = useSearchParams();
  const initialView = searchParams.get('view');

  const [activeFilters, setActiveFilters] = useState<Filters>({
    categories: [],
    price: 'all',
    libraryStatus: initialView === 'library' ? 'in' : 'all',
  });
  
  // Arama metni için yeni state
  const [searchTerm, setSearchTerm] = useState('');
  // Gecikmeli arama değeri
  const debouncedSearchTerm = useDebounce(searchTerm, 300); // Kullanıcı yazmayı bıraktıktan 300ms sonra güncellenir

  const fetchProjects = useCallback(async (filters: Filters, search: string) => {
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
        if (search) {
        params.append('title_contains', search);
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
    fetchProjects(activeFilters, debouncedSearchTerm);
  }, [activeFilters, debouncedSearchTerm, fetchProjects]);

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
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold">Keşfet</h1>
          
          {/* YENİ ARAMA ÇUBUĞU VE FİLTRE BUTONU GRUBU */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-prestij-text-placeholder" />
              <input
                type="text"
                placeholder="Proje ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48 sm:w-64 bg-prestij-bg-dark-2 border border-prestij-border-primary rounded-md pl-10 pr-4 py-2 text-prestij-text-primary focus:outline-none focus:ring-2 focus:ring-prestij-purple"
              />
            </div>
            <button 
              onClick={() => setIsFilterOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-prestij-bg-button rounded-md hover:bg-prestij-purple/80 transition-colors"
            >
              <Filter size={20} />
            </button>
          </div>
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