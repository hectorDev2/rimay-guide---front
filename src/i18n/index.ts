import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { fetchTranslations } from '@/services/translationService';
import { FALLBACK_ES, FALLBACK_EN } from './fallback';

const BUNDLES: Record<string, Record<string, string>> = {
  es: FALLBACK_ES,
  en: FALLBACK_EN,
};

function detectLang(): string {
  if (typeof window === 'undefined') return 'es';
  const saved = localStorage.getItem('rimay-lang');
  if (saved) return saved;
  const nav = navigator.language.split('-')[0];
  return nav === 'en' ? 'en' : 'es';
}

async function loadLang(lang: string) {
  const flat: Record<string, string> = { ...(BUNDLES[lang] ?? FALLBACK_ES) };

  try {
    const remote = await fetchTranslations(lang);
    for (const [ns, keys] of Object.entries(remote)) {
      for (const [key, value] of Object.entries(keys)) {
        flat[`${ns}.${key}`] = value;
      }
    }
  } catch (e) {
    console.warn('i18n: error fetching remote translations, using fallback', e);
  }

  if (!i18n.isInitialized) {
    i18n.init({
      resources: { [lang]: { translation: flat } },
      lng: lang,
      fallbackLng: 'es',
      interpolation: { escapeValue: false },
      returnNull: false,
      returnEmptyString: false,
    });
  } else {
    i18n.addResourceBundle(lang, 'translation', flat, true, true);
    if (i18n.language !== lang) {
      i18n.changeLanguage(lang);
    }
  }
}

const initialLang = detectLang();

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: { [initialLang]: { translation: BUNDLES[initialLang] ?? FALLBACK_ES } },
    lng: initialLang,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
    returnNull: false,
    returnEmptyString: false,
  });
}

loadLang(initialLang);

i18n.on('languageChanged', (lng) => {
  localStorage.setItem('rimay-lang', lng);
  loadLang(lng);
});

export default i18n;
