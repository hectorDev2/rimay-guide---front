import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ImageWithFallback } from '../components/atoms/ImageWithFallback';
import { useAuthStore } from '@/stores/authStore';
import { Mail, Lock, ArrowLeft } from 'lucide-react';

interface LoginScreenProps {
  onLogin?: () => void;
  onSignUp?: () => void;
}

export function LoginScreen({ onLogin, onSignUp }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useAuthStore((s) => s.login);
  const socialLogin = useAuthStore((s) => s.socialLogin);
  const isLoading = useAuthStore((s) => s.isLoading);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);
    onLogin?.();
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    clearError();
    await socialLogin(provider);
    onLogin?.();
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

      <div className="relative flex-1 flex flex-col justify-end">
        <div className="bg-[#171717] rounded-t-[30px] px-5 pt-8 pb-6 border-t border-[#2C2C2C]/50 shadow-[0_-10px_30px_rgba(0,0,0,0.35)]">
          <div className="text-center mb-8">
            <h1 className="text-[28px] font-semibold text-white mb-2">
              Bienvenido
            </h1>
            <p className="text-[#6E6E6E] text-[15px]">
              Escucha el Cusco como lo cuenta su gente
            </p>
          </div>

          {/* Social Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="flex-1 h-12 flex items-center justify-center rounded-full bg-[#1E1E1E] border border-[#2C2C2C] hover:bg-[#232323] transition-all disabled:opacity-50 active:scale-[0.97]"
              aria-label="Iniciar sesión con Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading}
              className="flex-1 h-12 flex items-center justify-center rounded-full bg-[#1E1E1E] border border-[#2C2C2C] hover:bg-[#232323] transition-all disabled:opacity-50 active:scale-[0.97]"
              aria-label="Iniciar sesión con Apple"
            >
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-[#2C2C2C]" />
            <span className="text-[13px] text-[#6E6E6E]">o</span>
            <div className="flex-1 h-px bg-[#2C2C2C]" />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-[16px] bg-[#FF4D67]/10 border border-[#FF4D67]/20 text-[#FF4D67] text-[13px] text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[13px] font-medium text-white/80">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#6E6E6E]" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 w-full rounded-full bg-[#1E1E1E] border border-[#2C2C2C] pl-12 pr-4 text-[15px] text-white placeholder:text-[#6E6E6E] focus:border-[#E6FF00] focus:ring-[#E6FF00]/20"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-[13px] font-medium text-white/80">
                Contraseña
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
              {isLoading ? 'Ingresando...' : 'Continuar'}
            </Button>
          </form>

          <p className="text-center mt-8 text-[15px] text-[#6E6E6E]">
            ¿No tienes cuenta?{' '}
            <button type="button" onClick={onSignUp} className="text-[#E6FF00] font-medium hover:underline">
              Regístrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
