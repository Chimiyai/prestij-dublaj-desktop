// src/pages/ForgotPasswordPage.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api'; // Merkezi API istemcimizi import et
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basit bir ön kontrol
    if (!email || !recoveryCode || !newPassword) {
        toast.error("Tüm alanlar zorunludur.");
        setIsLoading(false);
        return;
    }

    try {
      const response = await api.post('/auth/reset-password-with-code', {
        email,
        recoveryCode,
        newPassword,
      });

      toast.success(response.data.message || 'Şifreniz başarıyla sıfırlandı! Lütfen yeni şifrenizle giriş yapın.');
      // Başarılı olursa, kullanıcıyı giriş sayfasına yönlendir
      navigate('/login');

    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Şifre sıfırlanırken bir hata oluştu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen overflow-hidden bg-hero-bg">
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-site-bg-main/90" />
      
      <div className="relative z-10 w-full max-w-md p-8 space-y-6 bg-hero-top-card-bg/80 backdrop-blur-sm rounded-xl shadow-2xl shadow-prestij-purple/10 border border-prestij-border-primary">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold text-prestij-text-primary">
            Şifre Sıfırla
          </h1>
          <p className="mt-2 text-prestij-text-muted">
            Hesap bilgilerinizi ve kurtarma kodunuzu girin.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-prestij-text-secondary mb-2">
              E-posta veya Kullanıcı Adı
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-prestij-bg-input border border-prestij-border-secondary rounded-md text-prestij-text-primary placeholder-prestij-text-placeholder focus:outline-none focus:ring-2 focus:ring-prestij-purple focus:border-prestij-purple transition"
              placeholder="Hesabınızın e-postası veya kullanıcı adı"
            />
          </div>

          <div>
            <label htmlFor="recoveryCode" className="block text-sm font-medium text-prestij-text-secondary mb-2">
              Kurtarma Kodu
            </label>
            <input
              id="recoveryCode"
              type="text"
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value)}
              required
              className="w-full px-4 py-2 bg-prestij-bg-input border border-prestij-border-secondary rounded-md text-prestij-text-primary placeholder-prestij-text-placeholder focus:outline-none focus:ring-2 focus:ring-prestij-purple focus:border-prestij-purple transition"
              placeholder="Size verilen kurtarma kodu (örn: PRESTIJ-XXXX-...)"
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-prestij-text-secondary mb-2">
              Yeni Şifre
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-prestij-bg-input border border-prestij-border-secondary rounded-md text-prestij-text-primary placeholder-prestij-text-placeholder focus:outline-none focus:ring-2 focus:ring-prestij-purple focus:border-prestij-purple transition"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-prestij-purple hover:bg-prestij-purple-darker focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-prestij-bg-dark-1 focus:ring-prestij-purple transition-transform duration-150 ease-in-out hover:scale-105 disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? 'Sıfırlanıyor...' : 'Şifreyi Sıfırla'}
            </button>
          </div>
        </form>
        
        <Link to="/login" className="block text-center text-sm text-prestij-purple-light hover:underline pt-2">
          Giriş ekranına geri dön
        </Link>

      </div>
    </div>
  );
}