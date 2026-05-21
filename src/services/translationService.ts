import { supabase } from '@/lib/supabaseClient';

export interface TranslationRow {
  namespace: string;
  key: string;
  value: string;
}

const CACHE_PREFIX = 'rimay-i18n-';
const CACHE_TTL = 24 * 60 * 60 * 1000;

export async function fetchTranslations(lang: string): Promise<Record<string, Record<string, string>>> {
  const cached = getCache(lang);
  if (cached) return cached;

  const { data, error } = await supabase
    .from('translations')
    .select('namespace, key, value')
    .eq('lang', lang);

  if (error) {
    console.warn(`i18n: falló fetch para ${lang}`, error.message);
    return {};
  }

  const bundle: Record<string, Record<string, string>> = {};
  for (const row of data as TranslationRow[]) {
    if (!bundle[row.namespace]) bundle[row.namespace] = {};
    bundle[row.namespace][row.key] = row.value;
  }

  setCache(lang, bundle);
  return bundle;
}

function getCache(lang: string): Record<string, Record<string, string>> | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + lang);
    if (!raw) return null;
    const { ttl, data } = JSON.parse(raw);
    if (Date.now() - ttl > CACHE_TTL) {
      localStorage.removeItem(CACHE_PREFIX + lang);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCache(lang: string, data: Record<string, Record<string, string>>) {
  try {
    localStorage.setItem(
      CACHE_PREFIX + lang,
      JSON.stringify({ ttl: Date.now(), data }),
    );
  } catch {
    // localStorage lleno, ignorar
  }
}
