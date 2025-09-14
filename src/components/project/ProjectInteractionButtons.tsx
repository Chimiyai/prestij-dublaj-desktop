// src/components/project/ProjectInteractionButtons.tsx
import { useState } from 'react';
import type { UserInteractionData } from '../../types';
import { Heart, ThumbsDown, ThumbsUp } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Props {
  projectId: number;
  initialData: UserInteractionData;
}

export default function ProjectInteractionButtons({ projectId, initialData }: Props) {
  const [interaction, setInteraction] = useState(initialData);

  const handleInteraction = async (type: 'like' | 'dislike' | 'favorite') => {
    const previousState = { ...interaction };
    setInteraction(prev => ({ ...prev, [`${type}d`]: !prev[`${type}d`] }));

    try {
      await api.post(`/projects/${projectId}/${type}`);
    } catch {
      toast.error('İşlem sırasında bir hata oluştu.');
      setInteraction(previousState);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button 
        onClick={() => handleInteraction('like')} 
        className={`flex items-center gap-2 p-2 rounded-full transition-colors ${interaction.liked ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-prestij-bg-button'}`}
      >
        <ThumbsUp size={18} />
      </button>
      <button 
        onClick={() => handleInteraction('dislike')}
        className={`flex items-center gap-2 p-2 rounded-full transition-colors ${interaction.disliked ? 'bg-red-500/20 text-red-400' : 'hover:bg-prestij-bg-button'}`}
      >
        <ThumbsDown size={18} />
      </button>
      <button 
        onClick={() => handleInteraction('favorite')}
        className={`flex items-center gap-2 p-2 rounded-full transition-colors ${interaction.favorited ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-prestij-bg-button'}`}
      >
        <Heart size={18} />
      </button>
    </div>
  );
}