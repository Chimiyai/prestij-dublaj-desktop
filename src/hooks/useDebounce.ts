// src/hooks/useDebounce.ts
import { useState, useEffect } from 'react';

// Bu hook, bir değeri alır ve sadece belirli bir süre boyunca değişmediğinde güncellenmiş halini döndürür.
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Değer değiştiğinde bir zamanlayıcı kur
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Bir sonraki etki çalışmadan veya bileşen kaldırılmadan önce zamanlayıcıyı temizle
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}