// src/pages/DiscoverPage.tsx
import { useEffect, useState, useRef } from 'react'; // useRef'i import et
import { Filter, Search } from 'lucide-react';
import api from '../lib/api';
import type { Project } from '../types';
import ProjectCard from '../components/ProjectCard';
import FeaturedProjectCard from '../components/FeaturedProjectCard';
import FilterSidebar, { type Filters } from '../components/FilterSidebar';
import { useDebounce } from '../hooks/useDebounce';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
// @ts-expect-error
import 'swiper/css';
// @ts-expect-error
import 'swiper/css/navigation';
// @ts-expect-error
import 'swiper/css/pagination';
// @ts-expect-error
import 'swiper/css/autoplay';

export default function DiscoverPage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [popularProjects, setPopularProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const [activeFilters, setActiveFilters] = useState<Filters>({
    categories: [],
    price: 'all',
    libraryStatus: 'all',
  });

  // OPTİMİZASYON 1: İlk yüklemenin yapılıp yapılmadığını takip etmek için bir ref oluşturalım.
  const isInitialMount = useRef(true);

  // useEffect'i, filtreler ve arama ile çalışacak şekilde güncelleyelim
  useEffect(() => {
    // OPTİMİZASYON 2: Eğer bu ilk render ise, bu useEffect'in çalışmasını engelle.
    // Çünkü ilk veriler aşağıdaki diğer useEffect tarafından zaten çekiliyor.
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const fetchFilteredProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (activeFilters.categories.length > 0) {
            // Birden fazla kategori için destek ekleyelim
            params.append('categories', activeFilters.categories.join(','));
        }
        if (activeFilters.price !== 'all') {
          params.append('price', activeFilters.price);
        }
        if (activeFilters.libraryStatus !== 'all') {
          params.append('libraryStatus', activeFilters.libraryStatus);
        }
        if (debouncedSearchTerm) {
          params.append('title_contains', debouncedSearchTerm);
        }
        
        const response = await api.get(`/projects?${params.toString()}`);
        // Web sitesindeki API'den gelen yanıta uygun hale getirelim
        setAllProjects(response.data.projects || []);

      } catch {
        setError("Projeler yüklenirken bir sorun oluştu.");
        setAllProjects([]); // Hata durumunda listeyi boşalt
      } finally {
        setIsLoading(false);
      }
    };

    fetchFilteredProjects();
  }, [activeFilters, debouncedSearchTerm]);

  // Sadece ilk yüklemede çalışacak olan useEffect
  useEffect(() => {
    const fetchInitialData = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const featuredPromise = api.get('/projects?sortBy=popular&limit=5');
            const popularPromise = api.get('/projects?sortBy=popular&limit=10');
            // HATA DÜZELTME 1: Tüm projeleri çekecek olan eksik promise'i ekledik.
            const allPromise = api.get('/projects'); 
            
            // HATA DÜZELTME 2: `allPromise`'i `Promise.all` dizisine ekledik.
            const [featuredResponse, popularResponse, allResponse] = await Promise.all([
                featuredPromise, 
                popularPromise, 
                allPromise 
            ]);

            // API'den gelen `{ projects: [...] }` yapısına uygun olarak `.projects` ekledik.
            setFeaturedProjects(featuredResponse.data.projects || []);
            setPopularProjects(popularResponse.data.projects || []);
            setAllProjects(allResponse.data.projects || []);

        } catch {
            setError("Öne çıkan projeler yüklenirken bir sorun oluştu.");
        } finally {
            setIsLoading(false); // Tüm veriler yüklendikten sonra loading'i kapat
        }
    };
    fetchInitialData();
  }, []); // Bu useEffect sadece bir kez çalışır.

  const handleApplyFilters = (newFilters: Filters) => {
    setActiveFilters(newFilters);
    setIsFilterOpen(false);
  };

  return (
    <>
      <div className="p-8 h-full overflow-y-auto">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
          <h1 className="text-4xl font-bold">Keşfet</h1>
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
              className="flex items-center space-x-2 px-4 py-2 bg-prestij-bg-button rounded-md hover:bg-prestij-purple/80 transition-colors h-full"
            >
              <Filter size={20} />
            </button>
          </div>
        </header>

        {/* Öne Çıkanlar Slider'ı */}
        <section className="mb-12 h-[50vh] min-h-[400px]">
          {isLoading && featuredProjects.length === 0 ? (
             <div className="h-full w-full rounded-2xl bg-prestij-bg-dark-2 animate-pulse"></div>
          ) : (
            <Swiper
              modules={[Navigation, Pagination, Autoplay]}
              pagination={{ clickable: true }}
              loop={true}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="h-full w-full rounded-2xl"
            >
              {featuredProjects.map(project => (
                <SwiperSlide key={project.id}>
                  <FeaturedProjectCard project={project} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </section>
        
        {/* Popüler Projeler */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Popüler Projeler</h2>
          <Swiper
            modules={[Navigation]}
            spaceBetween={24}
            slidesPerView={'auto'}
            className="!-mx-8 !px-8"
          >
            {popularProjects.map(project => (
              <SwiperSlide key={project.id} className="!w-48">
                <ProjectCard project={project}/>
              </SwiperSlide>
            ))}
          </Swiper>
        </section>

        {/* Tüm Projeler */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Tüm Projeler</h2>
          {isLoading && allProjects.length === 0 ? (
            <p className="text-center mt-8 text-prestij-text-muted">Yükleniyor...</p>
          ) : error ? (
            <p className="text-center mt-8 text-red-400">{error}</p>
          ) : allProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {allProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <p className="text-center mt-8 text-prestij-text-muted">Arama kriterlerinize uygun proje bulunamadı.</p>
          )}
        </section>
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