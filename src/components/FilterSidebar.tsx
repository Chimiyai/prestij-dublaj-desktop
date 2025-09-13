// src/components/FilterSidebar.tsx
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../lib/api';

// --- BU BÖLÜMÜ GÜNCELLİYORUZ ---
// Bu dosyanın kullandığı ve dışarıya bildirdiği tek bir doğru tip tanımı yapıyoruz.
export interface Filters {
  categories: string[]; // Kategori slug'ları (string)
  price: 'all' | 'paid' | 'free';
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: Filters; // DiscoverPage'den bu tipte veri bekliyoruz
  onApplyFilters: (filters: Filters) => void; // DiscoverPage'e bu tipte veri göndereceğiz
}
// --- BİTİŞ ---

export default function FilterSidebar({ isOpen, onClose, currentFilters, onApplyFilters }: FilterSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [localFilters, setLocalFilters] = useState<Filters>(currentFilters);

  useEffect(() => {
    if (isOpen) {
      setLocalFilters(currentFilters);
    }
  }, [isOpen, currentFilters]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/categories');
        setCategories(response.data);
      } catch (error) {
        console.error("Kategoriler çekilirken hata oluştu:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (categorySlug: string) => {
    setLocalFilters(prevFilters => {
      const newCategories = prevFilters.categories.includes(categorySlug)
        ? prevFilters.categories.filter(slug => slug !== categorySlug)
        : [...prevFilters.categories, categorySlug];
      return { ...prevFilters, categories: newCategories };
    });
  };
  
  const handlePriceChange = (price: Filters['price']) => {
    setLocalFilters(prevFilters => ({ ...prevFilters, price }));
  };
  
  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-30 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <aside 
        className={`fixed top-0 right-0 h-full w-80 bg-prestij-bg-dark-1 z-40 p-6 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Filtrele</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-prestij-bg-button">
            <X size={24} />
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Kategoriler</h3>
            <div className="space-y-2">
              {loading ? ( <p className="text-prestij-text-muted">Yükleniyor...</p> ) : (
                categories.map(category => (
                  <div key={category.id} className="flex items-center">
                    <input 
                      type="checkbox" 
                      id={`cat-${category.id}`}
                      checked={localFilters.categories.includes(category.slug)}
                      onChange={() => handleCategoryChange(category.slug)}
                      className="h-4 w-4 rounded bg-prestij-bg-input border-prestij-border-secondary text-prestij-purple focus:ring-prestij-purple"
                    />
                    <label htmlFor={`cat-${category.id}`} className="ml-3 text-prestij-text-secondary">{category.name}</label>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-prestij-border-primary"></div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Fiyat</h3>
            <div className="space-y-2">
              <div className="flex items-center">
                <input type="radio" id="price-all" name="price"
                  checked={localFilters.price === 'all'}
                  onChange={() => handlePriceChange('all')}
                  className="h-4 w-4 bg-prestij-bg-input border-prestij-border-secondary text-prestij-purple focus:ring-prestij-purple"
                />
                <label htmlFor="price-all" className="ml-3 text-prestij-text-secondary">Tümü</label>
              </div>
              <div className="flex items-center">
                <input type="radio" id="price-paid" name="price"
                  checked={localFilters.price === 'paid'}
                  onChange={() => handlePriceChange('paid')}
                  className="h-4 w-4 bg-prestij-bg-input border-prestij-border-secondary text-prestij-purple focus:ring-prestij-purple"
                />
                <label htmlFor="price-paid" className="ml-3 text-prestij-text-secondary">Ücretli</label>
              </div>
              <div className="flex items-center">
                <input type="radio" id="price-free" name="price"
                  checked={localFilters.price === 'free'}
                  onChange={() => handlePriceChange('free')}
                  className="h-4 w-4 bg-prestij-bg-input border-prestij-border-secondary text-prestij-purple focus:ring-prestij-purple"
                />
                <label htmlFor="price-free" className="ml-3 text-prestij-text-secondary">Ücretsiz</label>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <button 
            onClick={handleApply}
            className="w-full py-3 bg-prestij-purple rounded-lg font-bold hover:bg-prestij-purple-darker transition-colors"
          >
            Filtreleri Uygula
          </button>
        </div>
      </aside>
    </>
  );
}