// src/components/project/ProjectInteractionButtons.tsx
import { useState, useEffect } from 'react';
import type { UserInteractionData } from '../../types';
import { Heart, ThumbsDown, ThumbsUp } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface Props {
  projectId: number;
  initialInteraction: UserInteractionData;
  initialCounts: {
    likes: number;
    dislikes: number;
    favorites: number;
  };
}

export default function ProjectInteractionButtons({ projectId, initialInteraction, initialCounts }: Props) {
  const [interaction, setInteraction] = useState(initialInteraction);
  const [counts, setCounts] = useState(initialCounts);
  
  useEffect(() => {
    setInteraction(initialInteraction);
    setCounts(initialCounts);
  }, [initialInteraction, initialCounts]);

  const handleInteraction = async (type: 'like' | 'dislike' | 'favorite') => {
    const previousInteraction = { ...interaction };
    const previousCounts = { ...counts };
    
    // DEĞİŞİKLİK BURADA: let -> const
    const newInteraction = { ...interaction };
    const newCounts = { ...counts };

    const isActive = newInteraction[`${type}d` as keyof typeof newInteraction];

    // --- YENİ RADYO BUTONU MANTIĞI ---
    if (type === 'like' && !isActive) {
        // Eğer 'like'a basılıyorsa ve daha önce 'dislike' basılıysa, 'dislike'ı sıfırla
        if (newInteraction.disliked) {
            newInteraction.disliked = false;
            newCounts.dislikes = Math.max(0, newCounts.dislikes - 1);
        }
    } else if (type === 'dislike' && !isActive) {
        // Eğer 'dislike'a basılıyorsa ve daha önce 'like' basılıysa, 'like'ı sıfırla
        if (newInteraction.liked) {
            newInteraction.liked = false;
            newCounts.likes = Math.max(0, newCounts.likes - 1);
        }
    }
    // --- BİTİŞ ---

    // Ana eylemi gerçekleştir (toggle)
    newInteraction[`${type}d` as keyof typeof newInteraction] = !isActive;
    newCounts[`${type}s` as keyof typeof newCounts] = isActive 
        ? newCounts[`${type}s` as keyof typeof newCounts] - 1 
        : newCounts[`${type}s` as keyof typeof newCounts] + 1;
    
    // Optimistic UI: Hesaplanan yeni state'leri set et
    setInteraction(newInteraction);
    setCounts(newCounts);
    
    try {
      if (isActive) {
        await api.delete(`/projects/${projectId}/${type}`);
      } else {
        await api.post(`/projects/${projectId}/${type}`);
      }
    } catch {
      toast.error('İşlem sırasında bir hata oluştu.');
      setInteraction(previousInteraction); // Hata olursa her şeyi eski haline döndür
      setCounts(previousCounts);
    }
  };

  return (
    <div className="flex items-center gap-4 bg-prestij-bg-dark-1/50 backdrop-blur-sm p-2 rounded-full border border-white/10">
      <button 
        onClick={() => handleInteraction('like')} 
        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all text-sm ${
          interaction.liked 
          ? 'bg-blue-500/20 text-blue-300' 
          : 'text-prestij-text-muted hover:bg-prestij-bg-button hover:text-white'
        }`}
      >
        <ThumbsUp size={16} />
        <span>{counts.likes.toLocaleString('tr-TR')}</span>
      </button>
      
      <button 
        onClick={() => handleInteraction('dislike')}
        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all text-sm ${
          interaction.disliked 
          ? 'bg-red-500/20 text-red-400' 
          : 'text-prestij-text-muted hover:bg-prestij-bg-button hover:text-white'
        }`}
      >
        <ThumbsDown size={16} />
        <span>{counts.dislikes.toLocaleString('tr-TR')}</span>
      </button>

      <div className="w-px h-5 bg-white/10"></div>

      <button 
        onClick={() => handleInteraction('favorite')}
        className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all text-sm ${
          interaction.favorited 
          ? 'bg-yellow-500/20 text-yellow-400' 
          : 'text-prestij-text-muted hover:bg-prestij-bg-button hover:text-white'
        }`}
      >
        <Heart size={16} />
        <span>{counts.favorites.toLocaleString('tr-TR')}</span>
      </button>
    </div>
  );
}