import { supabase } from '@/lib/supabaseClient';
import type { TranslationRow } from '@/lib/supabase/types';
import type { TranslationInput } from './schemas';

export const adminTranslationService = {
  list: async (filters?: { lang?: string; namespace?: string }): Promise<TranslationRow[]> => {
    let query = supabase.from('translations').select('*');
    if (filters?.lang) query = query.eq('lang', filters.lang);
    if (filters?.namespace) query = query.eq('namespace', filters.namespace);
    query = query.order('namespace').order('key').order('lang');
    const { data, error } = await query;
    if (error) throw error;
    return data as TranslationRow[];
  },

  upsert: async (input: TranslationInput): Promise<TranslationRow> => {
    const { data, error } = await supabase
      .from('translations')
      .upsert(
        { namespace: input.namespace, key: input.key, lang: input.lang, value: input.value },
        { onConflict: 'namespace,key,lang' }
      )
      .select('*')
      .single();
    if (error) throw error;
    return data as TranslationRow;
  },

  remove: async (id: number): Promise<void> => {
    const { error } = await supabase.from('translations').delete().eq('id', id);
    if (error) throw error;
  },
};
