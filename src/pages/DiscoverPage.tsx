// src/pages/DiscoverPage.tsx
import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { Project } from '../types';
import ProjectCard from '../components/ProjectCard';
import FeaturedProjectCard from '../components/FeaturedProjectCard'; // Bu importun doğru olduğundan emin ol

// Swiper bileşenlerini ve stillerini import et
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
// TypeScript'e bu satırları görmezden gelmesini söylüyoruz.
// @ts-expect-error: Swiper CSS modules do not have TypeScript definitions
import 'swiper/css';
// @ts-expect-error: Swiper navigation CSS does not have TypeScript definitions
import 'swiper/css/navigation';
// @ts-expect-error: Swiper pagination CSS does not have TypeScript definitions
import 'swiper/css/pagination';
// @ts-expect-error: Swiper autoplay CSS does not have TypeScript definitions
import 'swiper/css/autoplay';

export default function DiscoverPage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [popularProjects, setPopularProjects] = useState<Project[]>([]);
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDiscoverData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const featuredPromise = api.get('/projects?sortBy=popular&limit=5');
        const popularPromise = api.get('/projects?sortBy=popular&limit=10');
        const allPromise = api.get('/projects');

        const [featuredResponse, popularResponse, allResponse] = await Promise.all([
          featuredPromise,
          popularPromise,
          allPromise,
        ]);

        setFeaturedProjects(featuredResponse.data);
        setPopularProjects(popularResponse.data);
        setAllProjects(allResponse.data);

      } catch { // Kullanılmayan değişken uyarısını çöz
        setError("Veriler yüklenirken bir sorun oluştu.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiscoverData();
  }, []);

  if (isLoading) {
    return <div className="text-center p-10 text-white">Keşfet Sayfası Yükleniyor...</div>;
  }
  if (error) {
    return <div className="text-center p-10 text-red-400">{error}</div>;
  }

  return (
    <div className="p-8 h-full overflow-y-auto">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Keşfet</h1>
        {/* TODO: Arama ve Filtre butonu buraya yeniden eklenecek */}
      </header>

      {/* 1. BÖLÜM: Öne Çıkanlar Slider'ı */}
      <section className="mb-12 h-[50vh] min-h-[400px]">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
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
      </section>
      
      {/* 2. BÖLÜM: Popüler Projeler (Yatay Scroll) */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Popüler Projeler</h2>
        <div className="flex space-x-6 overflow-x-auto pb-4 -mx-8 px-8 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
            {popularProjects.map(project => (
                <div key={project.id} className="w-48 flex-shrink-0">
                    <ProjectCard project={project}/>
                </div>
            ))}
        </div>
      </section>

      {/* 3. BÖLÜM: Tüm Projeler */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Tüm Projeler</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {allProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </div>
  );
}