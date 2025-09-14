// src/pages/LibraryPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { Filter } from 'lucide-react';
import api from '../lib/api';
import type { Project } from '../types';
import ProjectCard from '../components/ProjectCard';
import FilterSidebar, { type Filters } from '../components/FilterSidebar';

export default function LibraryPage() {
  const [ownedProjects, setOwnedProjects] = useState<Project[]>([]);
  const [freeProjects, setFreeProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [activeFilters, setActiveFilters] = useState<Partial<Filters>>({
    categories: [],
    price: 'all',
  });

  useEffect(() => {
    const fetchLibraryData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const ownedPromise = api.get('/projects?libraryStatus=in');
        const freePromise = api.get('/projects?price=free');
        const [ownedResponse, freeResponse] = await Promise.all([ownedPromise, freePromise]);
        setOwnedProjects(ownedResponse.data);
        setFreeProjects(freeResponse.data);
      } catch {
        setError("Kütüphane yüklenirken bir sorun oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLibraryData();
  }, []);

  const displayedProjects = useMemo(() => {
    const combined = [...ownedProjects]; // HATA 2 ÇÖZÜMÜ: let -> const
    const ownedIds = new Set(ownedProjects.map(p => p.id));
    freeProjects.forEach(p => {
      if (!ownedIds.has(p.id)) combined.push(p);
    });

    return combined.filter(project => {
      // Kategori filtresi henüz tam çalışmıyor, şimdilik geçici olarak kaldıralım
      // const categoryMatch = activeFilters.categories?.length 
      //   ? activeFilters.categories.includes(project.slug) 
      //   : true;

      // HATA 3 & 4 ÇÖZÜMÜ: Project tipinde artık 'price' var
      const priceMatch = activeFilters.price !== 'all'
        ? (activeFilters.price === 'free' ? project.price == null : project.price != null)
        : true;
      return priceMatch; // Şimdilik sadece fiyata göre filtrele
    });
  }, [ownedProjects, freeProjects, activeFilters]);

  const handleApplyFilters = (newFilters: Filters) => {
    setActiveFilters(newFilters);
    setIsFilterOpen(false);
  };

  const renderContent = () => {
     if (isLoading) return <p className="text-center mt-16 text-prestij-text-muted">Yükleniyor...</p>;
     if (error) return <p className="text-center mt-16 text-red-400">{error}</p>;
     if (displayedProjects.length === 0) return <p className="text-center mt-16 text-prestij-text-muted">Kütüphanenizde gösterilecek proje yok.</p>;
     
     return (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
             {displayedProjects.map(p => <ProjectCard key={p.id} project={p} />)}
         </div>
     );
  }
  
  return (
     <>
         <div className="p-8">
             <header className="flex justify-between items-center mb-8">
                 <h1 className="text-4xl font-bold">Kütüphane</h1>
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
             hideLibraryStatusFilter={true} 
             currentFilters={activeFilters as Filters}
             onApplyFilters={handleApplyFilters}
         />
     </>
  );
}