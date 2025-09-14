// src/lib/cloudinary.ts

export const getCloudinaryImageUrl = (
  publicId: string | null | undefined
): string | null => { // Artık string VEYA null döndürebilir
  if (!publicId) {
    return null; // ID yoksa null döndür
  }
  
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    console.error("Cloudinary cloud name .env'de tanımlanmamış!");
    return null; // Yapılandırma hatası varsa da null döndür
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,q_auto,f_auto/${publicId}`;
};