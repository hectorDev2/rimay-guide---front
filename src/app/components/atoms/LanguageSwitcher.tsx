import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language;
  const isEs = current === 'es' || current === 'es-ES';

  const toggle = () => {
    const next = isEs ? 'en' : 'es';
    i18n.changeLanguage(next);
    localStorage.setItem('rimay-lang', next);
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-white/10 hover:bg-white/20 text-white border border-white/20"
      aria-label={isEs ? 'Switch to English' : 'Cambiar a Español'}
    >
      <span className={isEs ? 'opacity-50' : 'opacity-100 font-semibold'}>EN</span>
      <span className="text-white/30">/</span>
      <span className={isEs ? 'opacity-100 font-semibold' : 'opacity-50'}>ES</span>
    </button>
  );
}
