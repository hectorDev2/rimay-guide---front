import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminTranslationService } from '@/services/admin/adminTranslationService';
import { translationSchema, type TranslationInput } from '@/services/admin/schemas';
import type { TranslationRow } from '@/lib/supabase/types';

export function AdminTranslationScreen() {
  const [translations, setTranslations] = useState<TranslationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLang, setFilterLang] = useState<string>('');
  const [filterNamespace, setFilterNamespace] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [editingRow, setEditingRow] = useState<TranslationRow | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const filters: { lang?: string; namespace?: string } = {};
      if (filterLang) filters.lang = filterLang;
      if (filterNamespace) filters.namespace = filterNamespace;
      setTranslations(await adminTranslationService.list(filters));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterLang, filterNamespace]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta traducción?')) return;
    try {
      await adminTranslationService.remove(id);
      setTranslations((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert('Error al eliminar');
    }
  };

  const namespaces = [...new Set(translations.map((t) => t.namespace))].sort();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Traducciones</h1>
        <button
          onClick={() => { setEditingRow(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E6FF00] text-[#111111] font-medium text-sm hover:bg-[#D6F500] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
          className="h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]"
        >
          <option value="">Todos los idiomas</option>
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
        <select
          value={filterNamespace}
          onChange={(e) => setFilterNamespace(e.target.value)}
          className="h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]"
        >
          <option value="">Todos los namespaces</option>
          {namespaces.map((ns) => (
            <option key={ns} value={ns}>{ns}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[#6E6E6E]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E6FF00] border-t-transparent" />
          Cargando...
        </div>
      ) : (
        <div className="bg-[#171717] border border-[#2C2C2C] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2C2C2C]">
                <th className="text-left text-xs text-[#6E6E6E] font-medium px-4 py-3">Namespace</th>
                <th className="text-left text-xs text-[#6E6E6E] font-medium px-4 py-3">Key</th>
                <th className="text-left text-xs text-[#6E6E6E] font-medium px-4 py-3">Lang</th>
                <th className="text-left text-xs text-[#6E6E6E] font-medium px-4 py-3">Valor</th>
                <th className="text-right text-xs text-[#6E6E6E] font-medium px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {translations.map((row) => (
                <tr key={row.id} className="border-b border-[#2C2C2C] last:border-0 hover:bg-[#1E1E1E] transition-colors">
                  <td className="px-4 py-3">
                    <code className="text-xs bg-[#0E0E0E] px-2 py-0.5 rounded text-[#E6FF00]">{row.namespace}</code>
                  </td>
                  <td className="px-4 py-3 text-sm text-white">{row.key}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${row.lang === 'es' ? 'bg-blue-900/30 text-blue-300' : 'bg-green-900/30 text-green-300'}`}>
                      {row.lang}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#A0A0A0] max-w-xs truncate">{row.value}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => { setEditingRow(row); setShowForm(true); }}
                        className="p-2 rounded-lg text-[#6E6E6E] hover:text-white hover:bg-[#0E0E0E] transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="p-2 rounded-lg text-[#6E6E6E] hover:text-[#FF4D67] hover:bg-[#0E0E0E] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <TranslationFormModal
          row={editingRow}
          onClose={() => setShowForm(false)}
          onSaved={(saved) => {
            if (editingRow) {
              setTranslations((prev) => prev.map((t) => (t.id === saved.id ? saved : t)));
            } else {
              setTranslations((prev) => [...prev, saved]);
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function TranslationFormModal({ row, onClose, onSaved }: {
  row: TranslationRow | null;
  onClose: () => void;
  onSaved: (row: TranslationRow) => void;
}) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<TranslationInput>({
    resolver: zodResolver(translationSchema),
    defaultValues: row ? {
      namespace: row.namespace,
      key: row.key,
      lang: row.lang as 'es' | 'en',
      value: row.value,
    } : {
      namespace: '',
      key: '',
      lang: 'es',
      value: '',
    },
  });

  const onSubmit = async (data: TranslationInput) => {
    setSaving(true);
    try {
      const saved = await adminTranslationService.upsert(data);
      onSaved(saved);
    } catch {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#171717] border border-[#2C2C2C] rounded-2xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">
            {row ? 'Editar traducción' : 'Nueva traducción'}
          </h2>
          <button onClick={onClose} className="p-2 text-[#6E6E6E] hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A0A0A0] mb-1">Namespace</label>
              <input {...register('namespace')} className="w-full h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]" />
              {errors.namespace && <p className="text-[#FF4D67] text-xs mt-1">{errors.namespace.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-[#A0A0A0] mb-1">Key</label>
              <input {...register('key')} className="w-full h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]" />
              {errors.key && <p className="text-[#FF4D67] text-xs mt-1">{errors.key.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A0A0A0] mb-1">Idioma</label>
            <select {...register('lang')} className="w-full h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]">
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
            {errors.lang && <p className="text-[#FF4D67] text-xs mt-1">{errors.lang.message}</p>}
          </div>

          <div>
            <label className="block text-xs text-[#A0A0A0] mb-1">Valor</label>
            <textarea {...register('value')} rows={3} className="w-full rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E6FF00] resize-none" />
            {errors.value && <p className="text-[#FF4D67] text-xs mt-1">{errors.value.message}</p>}
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" disabled={saving} className="px-6 py-2.5 rounded-lg bg-[#E6FF00] text-[#111111] font-medium text-sm hover:bg-[#D6F500] transition-colors disabled:opacity-40">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={onClose} className="px-6 py-2.5 rounded-lg bg-[#1E1E1E] text-[#A0A0A0] font-medium text-sm hover:bg-[#2C2C2C] transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
