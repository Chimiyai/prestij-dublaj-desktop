// src/pages/ProjectDetailPage.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { ProjectDataForDetail, UserInteractionData } from '../types';
import { ArrowLeft, Settings } from 'lucide-react';
import SettingsModal from '../components/project/SettingsModal';
import ProjectDetailTabs from '../components/project/ProjectDetailTabs'; // Yeni ana bileşenimiz

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // ... (veri çekme ve otomatik kurulum mantığı aynı kalabilir, şimdilik kaldıralım)
    const fetchProject = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/projects/${slug}`);
            setData(response.data);
        } catch (err) {
            // setError("Proje yüklenirken bir sorun oluştu.");
        } finally {
            setLoading(false);
        }
    };
    fetchProject();
  }, [slug]);

  if (loading || !data) {
    return <div className="flex items-center justify-center h-full text-white">Yükleniyor...</div>;
  }
  
  const { projectDetails, userStatus } = data;

  return (
    <div className="h-full w-full relative">
      <button onClick={() => navigate(-1)} className="fixed top-6 left-[calc(5rem+2rem)] z-50 ..."><ArrowLeft size={20} /></button>
      <button onClick={() => setIsSettingsOpen(true)} className="fixed top-6 right-8 z-50 ..."><Settings size={20} /></button>
      
      <ProjectDetailTabs project={projectDetails} userStatus={userStatus} />
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        projectSlug={projectDetails.slug}
      />
    </div>
  );
}