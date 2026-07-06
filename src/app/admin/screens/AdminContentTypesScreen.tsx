import { useEffect, useState } from 'react';
import { Plus, Box } from 'lucide-react';
import { adminContentService } from '@/services/admin/adminContentService';
import type { ContentTypeRow } from '@/lib/supabase/types';

const MEDIA_KINDS: ContentTypeRow['media_kind'][] = ['image', 'audio', 'model', 'video', 'none'];

const MEDIA_KIND_LABELS: Record<ContentTypeRow['media_kind'], string> = {
  image: 'Imagen',
  audio: 'Audio',
  model: 'Modelo 3D',
  video: 'Video',
  none: 'Solo texto',
};

export function AdminContentTypesScreen() {
  const [types, setTypes] = useState<ContentTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const reload = async () => setTypes(await adminContentService.listAllTypes());

  useEffect(() => {
    reload()
      .catch(() => setTypes([]))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async (t: ContentTypeRow) => {
    try {
      await adminContentService.setTypeEnabled(t.slug, !t.enabled);
      await reload();
    } catch {
      alert('Error al actualizar el tipo');
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-[#6E6E6E]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E6FF00] border-t-transparent" />
        Cargando...
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Tipos de contenido</h1>
          <p className="text-sm text-[#6E6E6E] mt-1">
            Registrar un tipo nuevo (video, AR...) lo habilita en toda la app sin cambios de código de base.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E6FF00] text-[#111111] font-medium text-sm hover:bg-[#D6F500] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo tipo
        </button>
      </div>

      <div className="space-y-2">
        {types.map((t) => (
          <div
            key={t.slug}
            className="bg-[#171717] border border-[#2C2C2C] rounded-xl p-4 flex items-center gap-4"
          >
            <div className="w-9 h-9 rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] flex items-center justify-center text-[#A6A6A6]">
              <Box className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">
                {t.label} <span className="text-[#6E6E6E] font-normal">· {t.slug}</span>
              </p>
              <p className="text-xs text-[#6E6E6E] mt-0.5">{MEDIA_KIND_LABELS[t.media_kind]}</p>
            </div>
            <button
              onClick={() => handleToggle(t)}
              role="switch"
              aria-checked={t.enabled}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                t.enabled ? 'bg-[#E6FF00]' : 'bg-[#2C2C2C]'
              }`}
              title={t.enabled ? 'Deshabilitar' : 'Habilitar'}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-[#111111] transition-transform ${
                  t.enabled ? 'translate-x-[22px]' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      {showForm && (
        <TypeFormModal
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false);
            await reload();
          }}
        />
      )}
    </div>
  );
}

interface TypeFormModalProps {
  onClose: () => void;
  onSaved: () => void;
}

function TypeFormModal({ onClose, onSaved }: TypeFormModalProps) {
  const [slug, setSlug] = useState('');
  const [label, setLabel] = useState('');
  const [mediaKind, setMediaKind] = useState<ContentTypeRow['media_kind']>('none');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!/^[a-z0-9_]{2,30}$/.test(slug)) {
      setError('Slug inválido: minúsculas, números y guión bajo (2-30)');
      return;
    }
    if (label.trim().length < 2) {
      setError('Etiqueta requerida');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await adminContentService.createType({ slug, label: label.trim(), icon: null, media_kind: mediaKind });
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al crear el tipo');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-[#171717] border border-[#2C2C2C] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-1">Nuevo tipo de contenido</h2>
        <p className="text-xs text-[#6E6E6E] mb-4">
          El tipo aparecerá en el menú "Agregar contenido". La app lo mostrará cuando exista un renderer
          registrado para su slug; mientras tanto se ignora sin romper nada.
        </p>

        <div className="space-y-3">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="slug (ej. video, ar_experience)"
            className="w-full rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] px-3 py-2 text-sm text-white placeholder-[#6E6E6E]"
          />
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Etiqueta (ej. Video)"
            className="w-full rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] px-3 py-2 text-sm text-white placeholder-[#6E6E6E]"
          />
          <select
            value={mediaKind}
            onChange={(e) => setMediaKind(e.target.value as ContentTypeRow['media_kind'])}
            className="w-full rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] px-3 py-2 text-sm text-white"
          >
            {MEDIA_KINDS.map((k) => (
              <option key={k} value={k}>
                {MEDIA_KIND_LABELS[k]}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-[#FF4D67]">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-[#A6A6A6] hover:text-white">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[#E6FF00] text-[#111111] text-sm font-medium hover:bg-[#D6F500] disabled:opacity-40"
          >
            {saving ? 'Creando…' : 'Crear'}
          </button>
        </div>
      </div>
    </div>
  );
}
