// src/types/index.ts


export interface Category {
  id: number;
  name: string;
  slug: string;
}
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImagePublicId: string | null;
  bannerImagePublicId: string | null;
  type: string;
  releaseDate: string | null;
  price?: number | null;
  categories: Category[];
}

// --- YENİ EKLENEN TİPLER ---

// Bu tiplerin çalışması için gereken alt tipleri de import etmemiz veya tanımlamamız gerekebilir.
// Şimdilik any olarak bırakabilir veya web sitesindeki projenizden kopyalayabilirsiniz.
// Örnek: type RoleInProject = 'VOICE_ACTOR' | 'DIRECTOR' | ...;

export type RoleInProject = 
  | 'VOICE_ACTOR'
  | 'MIX_MASTER'
  | 'MODDER'
  | 'TRANSLATOR'
  | 'SCRIPT_WRITER'
  | 'DIRECTOR';

export interface ContributionCharacter {
    // Web projenizdeki tanımını buraya ekleyin
    id: number;
    name: string;
    // ... diğer alanlar
}

export interface ContributionSubmission {
    // Web projenizdeki tanımını buraya ekleyin
    id: number;
    audioFilePublicId: string;
    // ... diğer alanlar
}

export interface ProjectDataForDetail {
    id: number;
    slug: string;
    title: string;
    type: 'oyun' | 'anime';
    description: string | null;
    bannerImagePublicId: string | null;
    coverImagePublicId: string | null;
    releaseDate: Date | null;
    trailerUrl?: string | null;
    price?: number | null;
    currency?: string | null;
    externalWatchUrl?: string | null;
    likeCount: number;
    dislikeCount: number;
    favoriteCount: number;
    averageRating?: number;
    assignments: Array<{
        id: number;
        role: RoleInProject;
        artist: { id: number; firstName: string; lastName: string; imagePublicId: string | null; slug?: string | null; };
        voiceRoles: Array<{ character: { id: number; name: string; } }>;
    }>;
    categories: Array<{ category: { name: string; slug: string } }>;
    steamAppId?: number | null;
    _count: { comments?: number; ratings?: number };
    volunteerCharacters: ContributionCharacter[];
    currentUserSubmissions?: Array<{ id: number; audioFilePublicId: string; }>;
}

export interface UserInteractionData {
    liked: boolean;
    disliked: boolean;
    favorited: boolean;
}

export interface CommentUser {
  id: number;
  username: string;
  profileImagePublicId: string | null;
  role: string;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  user: CommentUser;
}

export interface FetchCommentsResponse {
  comments: Comment[];
  totalPages: number;
  currentPage: number;
  totalComments: number;
}
