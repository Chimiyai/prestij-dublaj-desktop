// src/lib/quickLaunch.ts
import type { QuickLaunchItem } from "../components/Sidebar";

export async function updateQuickLaunchList(itemToAdd: QuickLaunchItem) {
  if (!itemToAdd || !itemToAdd.slug) return;

  try {
    const currentList = (await window.electronStore.get('quickLaunchList') as QuickLaunchItem[]) || [];
    const filteredList = currentList.filter(item => item.slug !== itemToAdd.slug);
    const newList = [itemToAdd, ...filteredList];
    const finalList = newList.slice(0, 3);
    await window.electronStore.set('quickLaunchList', finalList);
    
    // Değişikliğin diğer bileşenler tarafından anında fark edilmesi için bir olay yayınlayabiliriz.
    window.dispatchEvent(new CustomEvent('quickLaunchUpdated'));

  } catch (error) {
    console.error("Hızlı Başlatma listesi güncellenirken hata:", error);
  }
}