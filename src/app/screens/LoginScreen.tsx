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
    <div className="min-h-screen w-full bg-[var(--warm-white)] flex flex-col">
      {/* Hero Image Section */}
      <div className="relative h-[40vh] overflow-hidden">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800&q=85"
          alt="Sacsayhuamán - Cusco"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[var(--warm-white)]" />

        {/* Logo Overlay */}
        <div className="absolute top-12 left-0 right-0 text-center px-6">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="w-8 h-8 bg-[var(--terracotta)] rounded-lg flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <span
              className="text-xl text-[var(--dark-charcoal)]"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              Rimay Guide
            </span>
          </div>
        </div>
      </div>

      {/* Login Content */}
      <div className="flex-1 px-6 pb-8 -mt-8 relative z-10">
        {/* Title */}
        <div className="text-center mb-8">
          <h1
            className="text-3xl text-[var(--dark-charcoal)] mb-2"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Bienvenido
          </h1>
          <p className="text-[var(--muted-foreground)] text-base">
            Escuchá el Cusco como lo cuenta su gente
          </p>
        </div>

        {/* Social Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            type="button"
            className="flex-1 h-12 flex items-center justify-center rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--warm-white)] transition-colors"
            aria-label="Iniciar sesión con Google"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
          </button>
          <button
            type="button"
            className="flex-1 h-12 flex items-center justify-center rounded-xl border border-[var(--border)] bg-white hover:bg-[var(--warm-white)] transition-colors"
            aria-label="Iniciar sesión con Apple"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-sm text-[var(--muted-foreground)]">o</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[var(--dark-charcoal)]"
            >
              Correo electrónico
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl border-[var(--border)] bg-white px-4 text-base focus:border-[var(--terracotta)] focus:ring-[var(--terracotta)]/20"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-[var(--dark-charcoal)]"
            >
              Contraseña
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-xl border-[var(--border)] bg-white px-4 text-base focus:border-[var(--terracotta)] focus:ring-[var(--terracotta)]/20"
              placeholder=""
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full h-12 rounded-xl bg-[var(--terracotta)] hover:bg-[#8B4513] text-white text-base font-medium mt-6"
          >
            Continuar
          </Button>
        </form>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-base text-[var(--muted-foreground)]">
          ¿No tenés cuenta?{' '}
          <button
            type="button"
            onClick={onSignUp}
            className="text-[var(--terracotta)] font-medium hover:underline"
          >
            Registrate
          </button>
        </p>
      </div>
    </div>
  );
}
