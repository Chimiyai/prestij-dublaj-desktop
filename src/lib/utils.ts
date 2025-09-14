// src/lib/utils.ts
import type { RoleInProject } from '../types';

export function formatProjectRole(role: RoleInProject): string {
  switch (role) {
    case 'VOICE_ACTOR':
      return 'Seslendirme Sanatçısı';
    case 'MIX_MASTER':
      return 'Mix & Mastering';
    case 'MODDER':
      return 'Mod Geliştiricisi';
    case 'TRANSLATOR':
      return 'Çevirmen';
    case 'SCRIPT_WRITER':
      return 'Senaryo Yazarı';
    case 'DIRECTOR':
      return 'Yönetmen';
    default: { // <-- Süslü parantez ekleyerek 'no-case-declarations' hatasını çöz
      // exhaustiveCheck değişkenini kaldırarak 'unused-vars' hatasını çöz
      return String(role)
        .replace(/_/g, ' ')
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }
  }
}