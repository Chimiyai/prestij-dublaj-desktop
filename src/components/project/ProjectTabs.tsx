// src/components/project/ProjectTabs.tsx
import { useState } from 'react';
import type { ProjectDataForDetail } from '../../types';
import { getCloudinaryImageUrl } from '../../lib/cloudinary';
import type { RoleInProject } from '../../types';
import { formatProjectRole } from '../../lib/utils';
import CommentsSection from './CommentsSection';
import { UserCircle2 } from 'lucide-react';

interface Props {
  project: ProjectDataForDetail;
}

type Tab = 'team' | 'comments';

export default function ProjectTabs({ project }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('team');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'team': { // <-- Süslü parantez ekle
        if (!project.assignments || project.assignments.length === 0) {
            return <p>Bu proje için ekip bilgisi bulunmuyor.</p>;
        }
        const groupedAssignments = new Map<RoleInProject, typeof project.assignments>();
        project.assignments.forEach(assignment => {
            const roleKey = assignment.role;
            if (!groupedAssignments.has(roleKey)) {
                groupedAssignments.set(roleKey, []);
            }
            groupedAssignments.get(roleKey)!.push(assignment);
        });

        const roleOrder: RoleInProject[] = ['DIRECTOR', 'SCRIPT_WRITER', 'TRANSLATOR', 'VOICE_ACTOR', 'MIX_MASTER', 'MODDER'];
        const sortedGroupedRolesArray = Array.from(groupedAssignments.entries())
            .sort(([roleA], [roleB]) => roleOrder.indexOf(roleA) - roleOrder.indexOf(roleB));
        
        return (
            <div className="space-y-10">
                {sortedGroupedRolesArray.map(([role, assignmentsInRole]) => (
                    <div key={role}>
                        <h3 className="text-xl font-semibold mb-5 border-b border-prestij-border-secondary pb-2 text-prestij-purple-light">
                            {/* ARTIK DOĞRUDAN YAZMAK YERİNE FONKSİYONU ÇAĞIRIYORUZ */}
                            {formatProjectRole(role)}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {assignmentsInRole.map((assignment) => {
                                const artist = assignment.artist;
                                // HATA BURADAYDI: Bu değişkeni şimdi kullanacağız
                                const charactersPlayed = assignment.role === 'VOICE_ACTOR' && assignment.voiceRoles?.length > 0
                                    ? assignment.voiceRoles.map(vr => vr.character.name).join(', ')
                                    : null;
                                const artistImageUrl = getCloudinaryImageUrl(artist.imagePublicId);

                                return (
                                    <div key={assignment.id} className="group flex flex-col items-center text-center space-y-2">
                                        <div className="w-20 h-20 rounded-full border-2 border-prestij-border-primary group-hover:border-prestij-purple transition-colors overflow-hidden flex items-center justify-center bg-prestij-bg-dark-2">
                                            {artistImageUrl ? (
                                                <img
                                                    src={artistImageUrl}
                                                    alt={`${artist.firstName} ${artist.lastName}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <UserCircle2 className="w-16 h-16 text-gray-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white text-sm">
                                                {`${artist.firstName} ${artist.lastName}`}
                                            </p>
                                            {/* DEĞİŞİKLİK BURADA: charactersPlayed'i gösteriyoruz */}
                                            {charactersPlayed && (
                                                <p className="text-xs text-prestij-purple-light" title={charactersPlayed}>
                                                    {charactersPlayed}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        );
      }
      case 'comments': {
        return <CommentsSection projectId={project.id} />;
      }
      default:
        return null;
    }
  };

  return (
    // Ana kapsayıcı
    <div className="bg-prestij-bg-dark-1 p-6 rounded-lg shadow-lg">
      
      {/* 1. BÖLÜM: Sabit Açıklama */}
      {project.description && (
        <>
          <h2 className="text-2xl font-bold text-white mb-4">Proje Açıklaması</h2>
          <p className="whitespace-pre-line leading-relaxed text-prestij-text-secondary">
            {project.description}
          </p>
          <div className="my-6 border-t border-prestij-border-primary"></div> {/* Ayraç Çizgisi */}
        </>
      )}

      {/* 2. BÖLÜM: Sekmeler */}
      <div>
        <div className="mb-6">
          <nav className="flex space-x-6 border-b border-prestij-border-primary">
            <button 
              onClick={() => setActiveTab('team')} 
              className={`pb-3 font-semibold transition-colors ${activeTab === 'team' 
                ? 'text-white border-b-2 border-prestij-purple' 
                : 'text-prestij-text-muted hover:text-white'}`}
            >
              Katkıda Bulunanlar
            </button>
            <button 
              onClick={() => setActiveTab('comments')} 
              className={`pb-3 font-semibold transition-colors ${activeTab === 'comments' 
                ? 'text-white border-b-2 border-prestij-purple' 
                : 'text-prestij-text-muted hover:text-white'}`}
            >
              Yorumlar
            </button>
          </nav>
        </div>
        <div className="text-prestij-text-secondary">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}