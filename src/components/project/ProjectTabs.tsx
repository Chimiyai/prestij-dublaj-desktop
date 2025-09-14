// src/components/project/ProjectTabs.tsx
import { useState } from 'react';
import type { ProjectDataForDetail } from '../../types';

interface Props {
  project: ProjectDataForDetail;
}

type Tab = 'description' | 'team' | 'comments';

export default function ProjectTabs({ project }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('description');

  const renderContent = () => {
    switch (activeTab) {
      case 'team':
        return (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {project.assignments.map(assignment => (
              <div key={assignment.id} className="text-center">
                {/* TODO: Sanatçı kapak resmi */}
                <div className="w-24 h-24 bg-prestij-bg-dark-2 rounded-full mx-auto mb-2"></div>
                <p className="font-semibold text-white">{`${assignment.artist.firstName} ${assignment.artist.lastName}`}</p>
                <p className="text-sm text-prestij-text-muted">{assignment.role}</p>
              </div>
            ))}
          </div>
        );
      case 'comments':
        return <p>Yorumlar özelliği yakında eklenecektir.</p>;
      case 'description':
      default:
        return <p className="whitespace-pre-line leading-relaxed">{project.description}</p>;
    }
  };

  return (
    <div>
      <div className="border-b border-prestij-border-primary mb-6">
        <nav className="flex space-x-6">
          <button onClick={() => setActiveTab('description')} className={`py-3 font-semibold ${activeTab === 'description' ? 'text-white border-b-2 border-prestij-purple' : 'text-prestij-text-muted'}`}>Açıklama</button>
          <button onClick={() => setActiveTab('team')} className={`py-3 font-semibold ${activeTab === 'team' ? 'text-white border-b-2 border-prestij-purple' : 'text-prestij-text-muted'}`}>Ekip</button>
          <button onClick={() => setActiveTab('comments')} className={`py-3 font-semibold ${activeTab === 'comments' ? 'text-white border-b-2 border-prestij-purple' : 'text-prestij-text-muted'}`}>Yorumlar</button>
        </nav>
      </div>
      <div className="p-2 text-prestij-text-secondary">
        {renderContent()}
      </div>
    </div>
  );
}