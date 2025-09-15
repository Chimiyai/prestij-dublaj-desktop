// src/pages/ProjectDetailPage.tsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../lib/api';
import type { ProjectDataForDetail, UserInteractionData } from '../types';
import { getCloudinaryImageUrl } from '../lib/cloudinary';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import ProjectActionButton from '../components/project/ProjectActionButton';
import ProjectInteractionButtons from '../components/project/ProjectInteractionButtons';
import ProjectTabs from '../components/project/ProjectTabs';
import { ArrowLeft, Image as ImageIcon, Settings } from 'lucide-react';
import SettingsModal from '../components/project/SettingsModal';
import toast from 'react-hot-toast'; // toast'ı import et

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
  const location = useLocation(); // Yönlendirme ile gelen state'i okumak için
  
  const [data, setData] = useState<ProjectDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Otomatik kurulumun birden fazla kez tetiklenmesini engellemek için bir referans
  const autoInstallTriggered = useRef(false);

  useEffect(() => {
    // Sayfaya her girildiğinde veya slug değiştiğinde, tetikleyiciyi sıfırla
    autoInstallTriggered.current = false;
    
    const fetchProject = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(`/projects/${slug}`);
        setData(response.data);
      } catch (err) {
        setError("Proje yüklenirken bir sorun oluştu.");
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);


  // --- YENİ BÖLÜM: Otomatik Kurulumu Tetikleme ---
  useEffect(() => {
    // Veri henüz yüklenmediyse, state boşsa veya tetik zaten çalıştıysa bir şey yapma
    if (loading || !data || autoInstallTriggered.current) return;

    const autoInstallRequest = location.state?.autoInstall;

    if (autoInstallRequest) {
      // Bu fonksiyonu sadece bir kez çalıştır
      autoInstallTriggered.current = true;
      
      // ProjectActionButton'daki handleInstallMod mantığının aynısını burada çalıştır
      const handleAutoInstall = async () => {
        const { projectDetails } = data;
        const downloadUrl = projectDetails.externalWatchUrl;
        if (!downloadUrl) return;

        let installPath = await window.electronStore.get(`installPath_${projectDetails.slug}`) as string | null;
        if (!installPath) {
          toast.loading('Lütfen oyunun kurulum dosyasını (.exe) seçin...', { duration: 8000 });
          const selectedPath = await window.modInstaller.selectDirectory();
          toast.dismiss();

          if (selectedPath) {
            await window.electronStore.set(`installPath_${projectDetails.slug}`, selectedPath);
            installPath = selectedPath;
          } else {
            toast.error('Kurulum yolu seçilmedi, işlem iptal edildi.');
            return;
          }
        }
        
        // Bu noktada ProjectActionButton bileşeni zaten arayüzde olduğu için,
        // onun kendi içindeki "kurulum durumu" güncellemeleri devreye girecektir.
        // Bizim burada sadece kurulum komutunu göndermemiz yeterli.
        toast.loading('Kurulum başlıyor...');
        window.modInstaller.install({
          downloadUrl,
          projectTitle: projectDetails.title,
          installPath: installPath,
        });
      };
      
      handleAutoInstall();
    }
  }, [loading, data, location.state]);
  // --- BİTİŞ ---


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
      {/* YENİ: Ayarlar Butonu */}
      <button 
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-6 right-8 z-50 flex items-center space-x-2 text-white bg-black/50 p-2 rounded-full hover:bg-black/80 transition-colors"
      >
        <Settings size={20} />
      </button>

      {/* 1. SECTION: Banner Alanı */}
      <section className="relative w-full h-[60vh] min-h-[400px] bg-prestij-bg-dark-1">
        {/* HATA 3 ÇÖZÜMÜ: bannerUrl null ise ne yapılacağını belirt */}
        {bannerUrl ? (
          <img src={bannerUrl} alt={`${projectDetails.title} Banner`} className="w-full h-full object-cover opacity-30" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-prestij-bg-dark-2">
            <ImageIcon className="w-24 h-24 text-gray-600" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-prestij-bg-dark-3 via-prestij-bg-dark-3/80 to-transparent" />
      </section>
      
      {/* 2. SECTION: Bilgi Bloğu */}
      <section className="relative z-10 -mt-48 container mx-auto px-8">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
          
          <div className="flex-shrink-0 w-48 lg:w-64">
            {/* HATA 4 ÇÖZÜMÜ: coverUrl null ise ne yapılacağını belirt */}
            <div className="w-full h-auto rounded-lg shadow-2xl border-4 border-prestij-bg-dark-2 bg-prestij-bg-dark-1 aspect-[3/4] flex items-center justify-center">
              {coverUrl ? (
                <img src={coverUrl} alt={`${projectDetails.title} Kapak`} className="w-full h-full object-cover rounded-md" />
              ) : (
                <ImageIcon className="w-16 h-16 text-gray-600" />
              )}
            </div>
          </div>

          {/* Sağ Taraf: Başlık, Butonlar ve Detaylar */}
          <div className="flex-grow flex flex-col items-center md:items-start text-center md:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-white [text-shadow:_2px_3px_5px_rgb(0_0_0_/_0.7)]">
              {projectDetails.title}
            </h1>
            
            <div className="flex items-center gap-4 mt-4 text-sm text-prestij-text-muted">
              <span>{projectDetails.categories.map(c => c.category.name).join(', ')}</span>
              <span>|</span>
              <span>{projectDetails.releaseDate ? format(new Date(projectDetails.releaseDate), 'dd MMMM yyyy', {locale: tr}) : 'Tarih Belirsiz'}</span>
            </div>

            {/* Aksiyon ve Etkileşim Butonları (Grup Halinde) */}
            <div className="mt-8 flex items-center gap-4">
              <ProjectActionButton 
                project={projectDetails} 
                userHasGame={userStatus.userHasGame} 
              />
              <ProjectInteractionButtons 
                projectId={projectDetails.id} 
                initialInteraction={userStatus.userInitialInteraction} // Eskiden 'initialData' idi, adı değişti
                initialCounts={{ // YENİ PROP
                  likes: projectDetails.likeCount,
                  dislikes: projectDetails.dislikeCount,
                  favorites: projectDetails.favoriteCount,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-8 py-12">
        <ProjectTabs project={projectDetails} />
      </section>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projectSlug={projectDetails.slug}
      />
    </div>
  );
}