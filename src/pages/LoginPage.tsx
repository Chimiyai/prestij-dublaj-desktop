// src/pages/LoginPage.tsx

import { useState } from 'react';
import type { FormEvent } from 'react';
import axios, { isAxiosError } from 'axios'; // axios import'u kalıyor
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast'; // Hata gösterimi için toast'ı import edelim

const API_URL = `${import.meta.env.VITE_API_BASE_URL}/auth/desktop-login`;

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // Bu state kalabilir

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // axios.post çağrısı aynı kalıyor, çünkü API_URL artık dinamik
      const response = await axios.post(API_URL, {
        email: email,
        password: password,
      });

      await login(response.data.user, response.data.token);
      
    } catch (err) {
      // Hata gösterimini <p> etiketi yerine toast ile yapmak daha tutarlı
      if (isAxiosError(err) && err.response?.data?.message) {
        toast.error(err.response.data.message);
      } else {
        toast.error('Giriş yapılırken bir sorun oluştu. Lütfen tekrar deneyin.');
      }
      // setError'u yine de kullanabiliriz, form içinde göstermek istersek
      setError((isAxiosError(err) && err.response?.data?.message) || 'Giriş yapılırken bir sorun oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center h-screen w-screen overflow-hidden bg-hero-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-site-bg-main/90" />
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-hero-top-card-bg/80 backdrop-blur-sm rounded-xl shadow-2xl shadow-prestij-purple/10 border border-prestij-border-primary">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-prestij-text-primary">PrestiJ Studio</h1>
          <p className="mt-2 text-prestij-text-muted">Hesabınıza giriş yapın</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-900/50 border border-red-500/50 text-red-200 rounded-md text-center text-sm">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-prestij-text-secondary mb-2">E-posta veya Kullanıcı Adı</label>
            <input
              id="email" type="text" autoComplete="email" required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-prestij-bg-input border border-prestij-border-secondary rounded-md text-prestij-text-primary placeholder-prestij-text-placeholder focus:outline-none focus:ring-2 focus:ring-prestij-purple focus:border-prestij-purple transition"
              placeholder="kullanici@prestij.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-prestij-text-secondary mb-2">Şifre</label>
            <input
              id="password" type="password" autoComplete="current-password" required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-prestij-bg-input border border-prestij-border-secondary rounded-md text-prestij-text-primary placeholder-prestij-text-placeholder focus:outline-none focus:ring-2 focus:ring-prestij-purple focus:border-prestij-purple transition"
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-prestij-purple bg-gray-700 border-gray-600 rounded focus:ring-prestij-purple"/>
              <label htmlFor="remember-me" className="ml-2 block text-sm text-prestij-text-secondary">Beni Hatırla</label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-prestij-purple-light hover:text-prestij-purple transition">
                Şifreni mi unuttun?
              </Link>
            </div>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-prestij-purple hover:bg-prestij-purple-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-prestij-bg-dark-1 focus:ring-prestij-purple transition-transform duration-150 ease-in-out hover:scale-105 disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
          <p className="text-center text-sm text-prestij-text-muted">
            Hesabın yok mu?{' '}
            <a href="#" className="font-medium text-prestij-purple-light hover:text-prestij-purple transition">Hemen kayıt ol</a>
          </p>
        </form>
      </div>
    </div>
  );
}