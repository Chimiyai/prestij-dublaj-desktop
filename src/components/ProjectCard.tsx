// src/components/ProjectCard.tsx
import { Link } from 'react-router-dom';
import type { Project } from '../types';

interface ProjectCardProps {
  project: Project;
}

// Cloudinary resim URL'ini oluşturan yardımcı fonksiyon
const getImageUrl = (publicId: string) => {
  // .env dosyasından güvenli bir şekilde alıyoruz
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  // Değişkenin tanımlı olup olmadığını kontrol etmek her zaman iyidir.
  if (!cloudName) {
    console.error("Cloudinary cloud name .env dosyasında VITE_CLOUDINARY_CLOUD_NAME olarak tanımlanmamış!");
    // Hata durumunda bir yedek resim döndür
    return 'https://via.placeholder.com/300x400.png?text=Yapilandirma+Hatasi';
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,q_auto,f_auto/${publicId}`;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const imageUrl = project.coverImagePublicId
    ? getImageUrl(project.coverImagePublicId)
    : 'https://via.placeholder.com/300x400.png?text=Resim+Yok';

  return (
    // Kartın tamamını tıklanabilir bir link haline getiriyoruz
    <Link to={`/project/${project.slug}`} className="block group">
      <div className="relative overflow-hidden rounded-lg bg-prestij-bg-card-1 shadow-lg transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:shadow-prestij-purple/20 group-hover:scale-105">
        <img src={imageUrl} alt={project.title} className="w-full h-full object-cover aspect-[3/4]" />
        <div className="absolute inset-0 bg-hero-top-card-gradient" />
        <div className="absolute bottom-0 left-0 p-4">
          <h3 className="font-bold text-lg text-white group-hover:text-prestij-purple-light transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-prestij-text-muted capitalize">
            {project.type}
          </p>
        </div>
      </div>
    </Link>
  );
}
