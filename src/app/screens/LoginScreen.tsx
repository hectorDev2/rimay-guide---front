import { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ImageWithFallback } from '../components/atoms/ImageWithFallback';

interface LoginScreenProps {
  onLogin?: () => void;
  onSignUp?: () => void;
}

export function LoginScreen({ onLogin, onSignUp }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin?.();
  };

  return (
    <div className="min-h-screen w-full bg-black flex flex-col">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=85"
          alt="Sacsayhuamán - Cusco"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
      </div>

      <div className="relative flex-1 flex flex-col justify-end">
        <div className="bg-white rounded-t-3xl p-8 mt-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl text-gray-800 mb-2" style={{ fontFamily: 'var(--font-heading)' }}>
              Bienvenido
            </h1>
            <p className="text-gray-500 text-base">Escuchá el Cusco como lo cuenta su gente</p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              type="button"
              className="flex-1 h-12 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
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
              className="flex-1 h-12 flex items-center justify-center rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
              aria-label="Iniciar sesión con Apple"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">o</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Correo electrónico
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-gray-300 bg-white px-4 text-base focus:border-[#1a365d] focus:ring-[#1a365d]/20"
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Contraseña
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-gray-300 bg-white px-4 text-base focus:border-[#1a365d] focus:ring-[#1a365d]/20"
                placeholder=""
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-2xl bg-[#1a365d] hover:bg-[#1a365d]/90 text-white text-base font-medium mt-6 shadow-lg shadow-[#1a365d]/30"
            >
              Continuar
            </Button>
          </form>

          <p className="text-center mt-8 text-base text-gray-500">
            ¿No tenés cuenta?{' '}
            <button type="button" onClick={onSignUp} className="text-[#1a365d] font-medium hover:underline">
              Registrate
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
