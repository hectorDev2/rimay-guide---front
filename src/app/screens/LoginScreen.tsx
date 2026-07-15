import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ImageWithFallback } from '../components/atoms/ImageWithFallback';
import { LanguageSwitcher } from '../components/atoms/LanguageSwitcher';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

function GoogleIcon() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 12.54c-.03-2.98 2.44-4.41 2.55-4.48-1.39-2.03-3.56-2.31-4.33-2.34-1.84-.19-3.6 1.08-4.53 1.08-.93 0-2.37-1.06-3.9-1.03-2-.03-3.85 1.16-4.88 2.95-2.08 3.6-.53 8.94 1.5 11.86 1 1.43 2.18 3.03 3.72 2.97 1.5-.06 2.06-.97 3.86-.97 1.8 0 2.3.97 3.87.94 1.6-.03 2.6-1.44 3.58-2.88 1.13-1.65 1.6-3.25 1.62-3.33-.04-.02-3.1-1.19-3.13-4.77z" />
      <path d="M14.72 3.6c.82-1 1.38-2.38 1.22-3.76-1.19.05-2.62.79-3.47 1.79-.76.88-1.43 2.3-1.25 3.65 1.32.1 2.67-.67 3.5-1.68z" />
    </svg>
  );
}

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
  const socialLogin = useAuthStore((s) => s.socialLogin);
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

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    clearError();
    try {
      await socialLogin(provider, redirectPath);
    } catch {
      // el error ya queda en el store y se muestra abajo
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

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[#2C2C2C]" />
            <span className="text-[#6E6E6E] text-[12px] uppercase tracking-wide">{t('login.orContinueWith', 'o continuá con')}</span>
            <div className="flex-1 h-px bg-[#2C2C2C]" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="h-12 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center gap-2 text-white text-[14px] font-medium hover:bg-[#2C2C2C] transition-colors disabled:opacity-50 active:scale-[0.97]"
            >
              <GoogleIcon />
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
              className="h-12 rounded-full bg-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center gap-2 text-white text-[14px] font-medium hover:bg-[#2C2C2C] transition-colors disabled:opacity-50 active:scale-[0.97]"
            >
              <AppleIcon />
              Apple
            </button>
          </div>

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
