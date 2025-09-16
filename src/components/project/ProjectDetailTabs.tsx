// src/components/project/ProjectDetailTabs.tsx
import { useState, useEffect } from 'react';
import type { ProjectDataForDetail, UserInteractionData, Comment } from '../../types';
import { Download, Users, MessageSquare } from 'lucide-react';
import api from '../../lib/api';

// Alt bileşenleri import et
import VideoBackground from './VideoBackground';
import { getCloudinaryImageUrl } from '../../lib/cloudinary';
import ProjectActionButton from './ProjectActionButton';
import ProjectInteractionButtons from './ProjectInteractionButtons';
import CommentsSection from './CommentsSection';
import TeamSection from './TeamSection';

interface Props {
  project: ProjectDataForDetail;
  userStatus: {
    userHasGame: boolean;
    userInitialInteraction: UserInteractionData;
  };
}

type Tab = 'download' | 'team' | 'comments';

export default function ProjectDetailTabs({ project, userStatus }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('download');
  const coverUrl = getCloudinaryImageUrl(project.coverImagePublicId);
  const [latestComments, setLatestComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (activeTab === 'download') {
      api.get(`/projects/${project.id}/comments?limit=2&page=1`)
        .then((response: { data: { comments: Comment[] } }) => setLatestComments(response.data.comments))
        .catch((err: Error) => console.error("Son yorumlar çekilemedi:", err));
    }
  }, [activeTab, project.id]);
  
  // --- HATA ÇÖZÜMÜ: EKSİK OLAN renderTabContent FONKSİYONUNU GERİ EKLE ---
  const renderTabContent = () => {
    switch (activeTab) {
      case 'team':
        return <TeamSection assignments={project.assignments} />;
      case 'comments':
        return <CommentsSection projectId={project.id} />;
      default:
        return null;
    }
  };
  // --- BİTİŞ ---

  const getGradientClassName = () => {
    switch (activeTab) {
      case 'team':
      case 'comments':
        return 'bg-black/70'; // Veya 'bg-prestij-bg-dark-1/80' gibi daha yumuşak bir ton
      
      case 'download':
      default:
        // "İndir" sekmesi için özel, sağdan sola gradyanımız
        // Bu sınıfın tailwind.config.js'de tanımlı olduğundan emin ol
        return 'bg-video-fade-to-left'; 
    }
  };

  const getTabClassName = (tabName: Tab) => {
    return `flex items-center gap-2 px-4 py-3 font-semibold transition-colors rounded-t-lg ${
      activeTab === tabName
        ? 'bg-prestij-bg-dark-3 text-white'
        : 'text-prestij-text-muted hover:bg-prestij-bg-dark-2'
    }`;
  };

  return (
    // Ana kapsayıcı, tüm ekranı kaplar
    <div className="h-full w-full flex flex-col">
      {/* 1. BÖLÜM: Sekme Butonları */}
      {/* 2. KATMAN: Sekme Butonları (Yüzen Navigasyon) */}
      <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-2 p-2 mt-4 bg-black/30 backdrop-blur-sm rounded-xl border border-white/10">
        <button onClick={() => setActiveTab('download')} className={getTabClassName('download')}>
          <Download size={16} />
          <span>İndir</span>
        </button>
        <button onClick={() => setActiveTab('team')} className={getTabClassName('team')}>
          <Users size={16} />
          <span>Katkıda Bulunanlar</span>
        </button>
        <button onClick={() => setActiveTab('comments')} className={getTabClassName('comments')}>
          <MessageSquare size={16} />
          <span>Yorumlar</span>
        </button>
      </nav>

      {/* 2. BÖLÜM: Sekme İçeriği */}
      <div className="flex-grow relative bg-prestij-bg-dark-3">
        {/* --- ANA DEĞİŞİKLİK BURADA: Video ve Gradyan artık sekme içeriğinin DIŞINDA --- */}
        {/* Bu bölüm artık her zaman render edilecek ve görünür olacak */}
        <div className="absolute inset-0 w-full h-full">
            <VideoBackground
              videoUrl={project.trailerUrl}
              fallbackImageUrl={getCloudinaryImageUrl(project.bannerImagePublicId)}
            />
            {/* Gradyan artık dinamik */}
            <div className={`absolute inset-0 transition-all duration-500 pointer-events-none ${getGradientClassName()}`} />
        </div>
        {/* --- BİTİŞ --- */}
        
        {/* "İndir" sekmesinin içeriği */}
        <div className={`absolute inset-0 w-full h-full transition-opacity duration-300 z-20 ${activeTab === 'download' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <div className="absolute inset-0 z-10"></div> {/* Tıklama Engeli */}
          
          {/* --- ANA YERLEŞİM (flex justify-between) --- */}
          <div className="relative w-full h-full p-8 flex justify-between items-center z-20">
            
            {/* SOL SÜTUN (Kapak, Açıklama, Etkileşim Butonları, Yorumlar) */}
            <div className="w-full max-w-lg flex flex-col justify-center items-start gap-8">
              <div className="flex flex-col items-start gap-6">
                {coverUrl && (
                  <div className="relative w-48 lg:w-56">
                      <div className="absolute -inset-2 bg-white/10 rounded-xl blur-md"></div>
                      <img src={coverUrl} alt={`${project.title} Kapak`} className="relative w-full h-auto rounded-lg shadow-2xl border-4 border-prestij-bg-dark-2" />
                  </div>
                )}
                <div>
                  <h1 className="text-4xl font-bold text-white mb-3">{project.title}</h1>
                  <p className="text-sm text-prestij-text-muted line-clamp-4 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-start gap-4">
                {/* --- DEĞİŞİKLİK: Etkileşim Butonları Sola Geri Geldi --- */}
                <ProjectInteractionButtons 
                  projectId={project.id} 
                  initialInteraction={userStatus.userInitialInteraction}
                  initialCounts={{
                    likes: project.likeCount,
                    dislikes: project.dislikeCount,
                    favorites: project.favoriteCount,
                  }}
                />
                
                {/* Son Yorumlar Bölümü (Etkileşim butonlarının hemen altında) */}
                {latestComments.length > 0 && (
                  <div className="w-full border-t border-white/10 pt-4 space-y-3">
                  {latestComments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3 text-xs">
                  {/* HATA ÇÖZÜMÜ: İkinci parametreyi kaldır */}
                  <img 
                    src={getCloudinaryImageUrl(comment.user.profileImagePublicId) || undefined} 
                    className="w-6 h-6 rounded-full"
                  />
                  <div>
                    <span className="font-semibold text-white">{comment.user.username}:</span>
                    <p className="text-prestij-text-muted line-clamp-2">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
              </div>
              </div>

            {/* SAĞ SÜTUN */}
            <div className="absolute bottom-40 right-40 -translate-y-1/2 pr-24">
              <ProjectActionButton 
                project={project} 
                userHasGame={userStatus.userHasGame} 
              />
            </div>
</div>
          {/* --- BİTİŞ --- */}
        </div>
{activeTab !== 'download' && (
          <div className="absolute inset-0 w-full h-full p-8 overflow-y-auto z-20 custom-scrollbar">
  {renderTabContent()}
</div>
        )}
      </div>
    </div>
  );
}