// src/components/project/VideoBackground.tsx
'use client'; 

import { useState } from 'react';
import { Volume2, VolumeX, Pause, Play } from 'lucide-react';

interface Props {
  videoUrl: string | null | undefined;
  fallbackImageUrl: string | null;
}

// YENİ YARDIMCI FONKSİYON: Herhangi bir YouTube linkinden Video ID'sini çeker
function getYouTubeID(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function VideoBackground({ videoUrl, fallbackImageUrl }: Props) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const videoId = videoUrl ? getYouTubeID(videoUrl) : null;

  // Eğer geçerli bir YouTube ID'si yoksa veya oynatma durdurulmuşsa, banner'ı göster
  if (!videoId || !isPlaying) {
    return (
      <div className="absolute inset-0 bg-prestij-bg-dark-1">
        {fallbackImageUrl && <img src={fallbackImageUrl} alt="Proje Banner" className="w-full h-full object-cover opacity-70" />}
        <VideoControls 
            isPlaying={false} 
            isMuted={isMuted}
            togglePlaying={() => { if (videoId) setIsPlaying(true); }}
            toggleMuting={() => setIsMuted(!isMuted)}
            showPlayButton={!!videoId}
        />
      </div>
    );
  }

  // YouTube'un gömülü oynatıcısının URL'ini oluşturuyoruz
  // Parametreler: autoplay=1 (otomatik oynat), controls=0 (kontrolleri gizle), loop=1 (döngüye al), playlist=videoId (döngü için gerekli) vb.
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&loop=1&playlist=${videoId}&mute=${isMuted ? 1 : 0}&iv_load_policy=3&modestbranding=1&showinfo=0&rel=0`;

  return (
    <div className="absolute inset-0 bg-black">
      <iframe
        src={embedUrl}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="w-full h-full pointer-events-none"
      ></iframe>
      <VideoControls 
          isPlaying={isPlaying} 
          isMuted={isMuted}
          togglePlaying={() => setIsPlaying(!isPlaying)}
          toggleMuting={() => setIsMuted(!isMuted)}
          showPlayButton={true}
      />
    </div>
  );
}


function VideoControls({ 
  isPlaying, 
  isMuted, 
  togglePlaying, 
  toggleMuting, 
  showPlayButton
}: {
  isPlaying: boolean; 
  isMuted: boolean; 
  togglePlaying: () => void; 
  toggleMuting: () => void;
  showPlayButton: boolean;
}) {
  return (
    <div className="absolute bottom-6 right-6 z-30 flex items-center gap-3 pointer-events-auto">
      {showPlayButton && (
        <button onClick={togglePlaying} className="p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors">
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
      )}
      <button onClick={toggleMuting} className="p-2 bg-black/50 rounded-full text-white hover:bg-white/20 transition-colors">
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>
    </div>
  );
}