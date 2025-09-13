// src/types/index.ts
// Sunucudan gelen Project objesinin nasıl görüneceğini tanımlıyoruz.
// Web sitendeki Prisma modeline göre bunu genişletebilirsin.
export interface Project {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  coverImagePublicId: string | null;
  type: string; // 'oyun' veya 'anime'
  releaseDate: string | null;
  // ... ihtiyaç duyacağın diğer alanlar
}