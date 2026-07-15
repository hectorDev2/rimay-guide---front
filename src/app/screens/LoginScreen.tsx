import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ImageWithFallback } from '../components/atoms/ImageWithFallback';
import { LanguageSwitcher } from '../components/atoms/LanguageSwitcher';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

interface LoginScreenProps {
  onLogin?: () => void;
  onSignUp?: (email: string, password: string) => Promise<void>;
  isSignUpMode?: boolean;
  onToggleMode?: () => void;
  redirectPath?: string;
  initialEmail?: string;
}

export function LoginScreen({ onLogin, onSignUp, isSignUpMode, onToggleMode, redirectPath, initialEmail }: LoginScreenProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState(initialEmail ?? '');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (isSignUpMode && onSignUp) {
      await onSignUp(email, password);
    } else {
      await login(email, password);
      onLogin?.();
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0E0E0E] flex flex-col">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=85"
          alt="Sacsayhuamán - Cusco"
          className="w-full h-full object-cover opacity-40"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E0E] via-[#0E0E0E]/30 to-transparent" />
      </div>

      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      <div className="relative flex-1 flex flex-col justify-end">
        <div className="bg-[#171717] rounded-t-[30px] px-5 pt-8 pb-6 border-t border-[#2C2C2C]/50 shadow-[0_-10px_30px_rgba(0,0,0,0.35)]">
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-semibold text-white mb-2">
              {isSignUpMode ? t('login.signUpTitle', 'Crear cuenta') : t('login.title')}
            </h1>
            <p className="text-[#6E6E6E] text-[15px]">
              {isSignUpMode ? t('login.signUpSubtitle', 'Creá tu cuenta para empezar') : t('login.subtitle')}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[16px] bg-[#FF4D67]/10 border border-[#FF4D67]/20 text-[#FF4D67] text-[13px] text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[13px] font-medium text-white/80">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6E6E6E]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-full bg-[#1E1E1E] border border-[#2C2C2C] pl-12 pr-4 text-[15px] text-white placeholder:text-[#6E6E6E] focus:border-[#E6FF00] focus:ring-[#E6FF00]/20"
                  placeholder={t('login.emailPlaceholder')}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[13px] font-medium text-white/80">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6E6E6E]" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 w-full rounded-full bg-[#1E1E1E] border border-[#2C2C2C] pl-12 pr-4 text-[15px] text-white placeholder:text-[#6E6E6E] focus:border-[#E6FF00] focus:ring-[#E6FF00]/20"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 rounded-full bg-[#E6FF00] hover:bg-[#D6F500] text-[#111111] text-[15px] font-semibold shadow-[0_8px_20px_rgba(230,255,0,0.3)] disabled:opacity-50 active:scale-[0.97] transition-all"
            >
              {isLoading ? t('login.loggingIn') : isSignUpMode ? t('login.createAccount', 'Crear cuenta') : t('login.continue')}
            </Button>
          </form>

          <p className="text-center mt-8 text-[15px] text-[#6E6E6E]">
            {isSignUpMode ? t('login.hasAccount', '¿Ya tenés cuenta?') : t('login.noAccount')}{' '}
            <button type="button" onClick={onToggleMode} className="text-[#E6FF00] font-medium hover:underline">
              {isSignUpMode ? t('login.signIn', 'Iniciar sesión') : t('login.signUp')}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
