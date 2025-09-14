// src/lib/cloudinary.ts
export const getCloudinaryImageUrl = (publicId: string | null | undefined) => {
  if (!publicId) {
    // ID yoksa genel bir yedek resim döndür
    return 'https://via.placeholder.com/1280x720.png?text=Resim+Bulunamadi';
  }
  
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!cloudName) {
    console.error("Cloudinary cloud name .env'de VITE_CLOUDINARY_CLOUD_NAME olarak tanımlanmamış!");
    return 'https://via.placeholder.com/1280x720.png?text=Yapilandirma+Hatasi';
  }

  // Optimize edilmiş bir URL döndürür (otomatik format, kalite ve doldurma)
  return `https://res.cloudinary.com/${cloudName}/image/upload/c_fill,q_auto,f_auto/${publicId}`;
};