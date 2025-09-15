// src/components/FeaturedProjectCard.tsx
import type { Project } from '../types';
import { getCloudinaryImageUrl } from '../lib/cloudinary';
import { Link } from 'react-router-dom';
import { PlayCircle } from 'lucide-react';

interface Props {
  project: Project;
}

export default function FeaturedProjectCard({ project }: Props) {
  const bannerUrl = getCloudinaryImageUrl(project.bannerImagePublicId);

  return (
    <Link to={`/project/${project.slug}`} className="block h-full w-full relative group overflow-hidden">
      {/* Arka Plan Resmi */}
      <img src={bannerUrl || undefined} alt={project.title} className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110" />
      
      {/* Karartma Katmanı */}
      <div className="absolute inset-0 bg-hero-main-visual-overlay" />
      
      {/* İçerik */}
      <div className="absolute bottom-0 left-0 p-8 text-white w-full">
        <h2 className="text-4xl font-bold mb-2 [text-shadow:_1px_2px_4px_rgb(0_0_0_/_0.8)]">
          {project.title}
        </h2>
        <p className="text-lg text-gray-300 line-clamp-2 [text-shadow:_1px_1px_3px_rgb(0_0_0_/_0.8)] max-w-3xl">
          {project.description}
        </p>
        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="inline-flex items-center gap-2 bg-prestij-purple px-5 py-3 rounded-lg font-semibold">
            <PlayCircle />
            Detayları Gör
          </div>
        </div>
      </div>
    </Link>
  );
}