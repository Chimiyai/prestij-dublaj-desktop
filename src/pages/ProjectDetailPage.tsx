// src/pages/ProjectDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft } from 'lucide-react';
import type { ProjectDataForDetail, UserInteractionData } from '../types';
import { getCloudinaryImageUrl } from '../lib/cloudinary'; // Yeni yardımcıyı import et
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ProjectActionButton from '../components/project/ProjectActionButton';
import ProjectInteractionButtons from '../components/project/ProjectInteractionButtons';
import ProjectTabs from '../components/project/ProjectTabs';

// API'dan dönen verinin tam yapısı
interface ProjectDetailResponse {
  projectDetails: ProjectDataForDetail;
  userStatus: {
    userHasGame: boolean;
    userInitialInteraction: UserInteractionData;
  };
}

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [data, setData] = useState<ProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/projects/${slug}`);
        setData(response.data);
      } catch (err) {
        console.error("Proje detayı çekilirken hata:", err);
        setError("Proje yüklenirken bir sorun oluştu veya proje bulunamadı.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  if (loading) {
    return <div className="flex items-center justify-center h-full text-white">Yükleniyor...</div>;
  }
  if (error) {
    return <div className="flex items-center justify-center h-full text-red-400">{error}</div>;
  }
  if (!data) {
    return <div className="flex items-center justify-center h-full text-white">Proje bulunamadı.</div>;
  }

  const { projectDetails, userStatus } = data;
  const bannerUrl = getCloudinaryImageUrl(projectDetails.bannerImagePublicId);
  const coverUrl = getCloudinaryImageUrl(projectDetails.coverImagePublicId);

  return (
    <div className="min-h-full bg-prestij-bg-dark-3 text-prestij-text-primary overflow-y-auto">
      <button 
        onClick={() => navigate(-1)}
        className="fixed top-6 left-[calc(16rem+2rem)] z-50 flex items-center space-x-2 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
      >
        <ArrowLeft size={20} />
      </button>

      {/* 1. SECTION: Banner Alanı */}
      <section className="relative w-full h-[50vh] min-h-[350px] bg-prestij-bg-dark-1">
        <img src={bannerUrl} alt={`${projectDetails.title} Banner`} className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-prestij-bg-dark-3 via-prestij-bg-dark-3/70 to-transparent" />
      </section>
      
      {/* 2. SECTION: Bilgi Bloğu */}
      <section className="relative z-10 -mt-48 container mx-auto px-8">
        <div className="flex flex-col md:flex-row items-start gap-8">
          
          {/* Sol Taraf: Kapak Resmi */}
          <div className="flex-shrink-0 w-48 lg:w-64 -mt-12">
            <img src={coverUrl} alt={`${projectDetails.title} Kapak`} className="w-full h-auto rounded-lg shadow-2xl border-4 border-prestij-bg-dark-2" />
          </div>

          {/* Sağ Taraf: Başlık, Butonlar ve Detaylar */}
          <div className="flex-grow pt-4">
            <h1 className="text-4xl lg:text-6xl font-bold text-white [text-shadow:_2px_3px_5px_rgb(0_0_0_/_0.7)]">
              {projectDetails.title}
            </h1>
            
            <div className="flex items-center gap-4 mt-4 text-sm text-prestij-text-muted">
              <span>{projectDetails.categories.map(c => c.category.name).join(', ')}</span>
              <span>|</span>
              <span>{projectDetails.releaseDate ? format(new Date(projectDetails.releaseDate), 'dd MMMM yyyy', {locale: tr}) : 'Tarih Belirsiz'}</span>
            </div>

            <p className="mt-6 text-prestij-text-secondary line-clamp-3 leading-relaxed max-w-3xl">
              {projectDetails.description}
            </p>

            {/* Aksiyon ve Etkileşim Butonları */}
            <div className="mt-8 flex items-center gap-4">
              {/* TODO 1 TAMAMLANDI */}
              <ProjectActionButton 
                project={projectDetails} 
                userHasGame={userStatus.userHasGame} 
              />
              
              {/* TODO 2 TAMAMLANDI */}
              <ProjectInteractionButtons 
                projectId={projectDetails.id} 
                initialData={userStatus.userInitialInteraction} 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-8 py-12">
        {/* TODO 3 TAMAMLANDI */}
        <ProjectTabs project={projectDetails} />
      </section>
    </div>
  );
}