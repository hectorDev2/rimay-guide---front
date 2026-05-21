import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fetchTranslations } from '@/services/translationService';

i18n.use(initReactI18next);

function detectLang(): string {
  if (typeof window === 'undefined') return 'es';
  const saved = localStorage.getItem('rimay-lang');
  if (saved) return saved;
  return navigator.language.split('-')[0];
}

async function loadLang(lang: string) {
  const bundle = await fetchTranslations(lang);
  const flat: Record<string, string> = {};
  for (const [ns, keys] of Object.entries(bundle)) {
    for (const [key, value] of Object.entries(keys)) {
      flat[`${ns}.${key}`] = value;
    }
  }
  if (!i18n.isInitialized) {
    i18n.init({
      resources: { [lang]: { translation: flat } },
      lng: lang,
      fallbackLng: 'es',
      interpolation: { escapeValue: false },
    });
  } else {
    i18n.addResourceBundle(lang, 'translation', flat, true, true);
    i18n.changeLanguage(lang);
  }
}

const initialLang = detectLang();
await loadLang(initialLang);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('rimay-lang', lng);
  loadLang(lng);
});

export default i18n;
