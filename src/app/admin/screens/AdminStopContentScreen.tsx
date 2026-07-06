import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, Pencil, Archive, ChevronUp, ChevronDown, Upload } from 'lucide-react';
import { adminContentService } from '@/services/admin/adminContentService';
import { contentSchema, type ContentInput } from '@/services/admin/schemas';
import type { ContentBlock, ContentStatus } from '@/lib/content/types';
import type { ContentTypeRow } from '@/lib/supabase/types';

const STATUS_STYLES: Record<ContentStatus, string> = {
  published: 'bg-[#AFFF00]/15 text-[#AFFF00] border-[#AFFF00]/20',
  draft: 'bg-[#FFB84D]/15 text-[#FFB84D] border-[#FFB84D]/20',
  archived: 'bg-[#6E6E6E]/15 text-[#6E6E6E] border-[#6E6E6E]/20',
};

const STATUS_LABELS: Record<ContentStatus, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  archived: 'Archivado',
};

export function AdminStopContentScreen() {
  const navigate = useNavigate();
  const { tourId, stopId } = useParams<{ tourId: string; stopId: string }>();
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [types, setTypes] = useState<ContentTypeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [creatingType, setCreatingType] = useState<ContentTypeRow | null>(null);

  useEffect(() => {
    if (!stopId) return;
    Promise.all([adminContentService.listByStop(stopId), adminContentService.listTypes()])
      .then(([b, t]) => {
        setBlocks(b);
        setTypes(t);
        setLoading(false);
      })
      .catch(() => navigate(`/admin/tours/${tourId}/stops`));
  }, [stopId, tourId, navigate]);

  const reload = async () => {
    if (!stopId) return;
    setBlocks(await adminContentService.listByStop(stopId));
  };

  const handleStatus = async (block: ContentBlock, status: ContentStatus) => {
    try {
      await adminContentService.setStatus(block.id, status);
      await reload();
    } catch {
      alert('Error al cambiar el estado');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const next = [...blocks];
    const swap = direction === 'up' ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setBlocks(next);
    try {
      await adminContentService.reorder(next.map((b) => b.id));
    } catch {
      alert('Error al reordenar');
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
      <button
        onClick={() => navigate(`/admin/tours/${tourId}/stops`)}
        className="flex items-center gap-2 text-sm text-[#6E6E6E] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a paradas
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Contenido de la parada</h1>
          <p className="text-sm text-[#6E6E6E] mt-1">
            Los bloques publicados definen la experiencia. Si hay bloque 3D, el lugar es Tipo 1.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {types.map((t) => (
            <button
              key={t.slug}
              onClick={() => setCreatingType(t)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#171717] border border-[#2C2C2C] text-white text-xs hover:border-[#E6FF00]/50 transition-colors"
            >
              <Plus className="w-3 h-3" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {blocks.length === 0 ? (
        <div className="bg-[#171717] border border-[#2C2C2C] rounded-2xl p-12 text-center">
          <p className="text-white mb-2">Sin bloques de contenido</p>
          <p className="text-sm text-[#6E6E6E]">Agregá el primero con los botones de arriba</p>
        </div>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, index) => {
            const type = types.find((t) => t.slug === block.type);
            return (
              <div
                key={block.id}
                className="bg-[#171717] border border-[#2C2C2C] rounded-xl p-4 flex items-center gap-4 hover:border-[#3C3C3C] transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-[#6E6E6E] hover:text-white disabled:opacity-20"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === blocks.length - 1}
                    className="p-1 text-[#6E6E6E] hover:text-white disabled:opacity-20"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-[#0E0E0E] border border-[#2C2C2C] text-xs text-[#A6A6A6]">
                  {type?.label ?? block.type}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{block.title || '(sin título)'}</p>
                  {block.fileUrl && <p className="text-[#6E6E6E] text-xs mt-0.5 truncate">{block.fileUrl}</p>}
                </div>

                <span className={`px-2.5 py-1 rounded-full border text-xs font-medium ${STATUS_STYLES[block.status]}`}>
                  {STATUS_LABELS[block.status]}
                </span>

                <div className="flex items-center gap-1">
                  {block.status !== 'published' ? (
                    <button
                      onClick={() => handleStatus(block, 'published')}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-[#111111] bg-[#E6FF00] hover:bg-[#D6F500] font-medium"
                    >
                      Publicar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatus(block, 'draft')}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-[#A6A6A6] bg-[#0E0E0E] hover:text-white"
                    >
                      Despublicar
                    </button>
                  )}
                  <button
                    onClick={() => setEditing(block)}
                    className="p-2 rounded-lg text-[#6E6E6E] hover:text-white hover:bg-[#0E0E0E]"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStatus(block, 'archived')}
                    className="p-2 rounded-lg text-[#6E6E6E] hover:text-[#FF4D67] hover:bg-[#0E0E0E]"
                    title="Archivar"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(creatingType || editing) && stopId && (
        <ContentFormModal
          stopId={stopId}
          block={editing}
          type={creatingType ?? types.find((t) => t.slug === editing?.type) ?? null}
          nextOrder={(blocks[blocks.length - 1]?.order ?? 0) + 10}
          onClose={() => {
            setCreatingType(null);
            setEditing(null);
          }}
          onSaved={async () => {
            setCreatingType(null);
            setEditing(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

interface ContentFormModalProps {
  stopId: string;
  block: ContentBlock | null;
  type: ContentTypeRow | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: () => void;
}

function ContentFormModal({ stopId, block, type, nextOrder, onClose, onSaved }: ContentFormModalProps) {
  const [title, setTitle] = useState(block?.title ?? '');
  const [description, setDescription] = useState(block?.description ?? '');
  const [filePath, setFilePath] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsFile = type != null && type.media_kind !== 'none';
  const accept =
    type?.media_kind === 'image' ? 'image/*' : type?.media_kind === 'audio' ? 'audio/*' : '.glb,.gltf';

  const handleSubmit = async () => {
    if (!type) return;
    setSaving(true);
    setError(null);
    try {
      let path = filePath;
      if (file && (type.media_kind === 'image' || type.media_kind === 'audio' || type.media_kind === 'model')) {
        path = await adminContentService.uploadMedia(stopId, file, type.media_kind);
      }
      const input: ContentInput = contentSchema.parse({
        type: type.slug,
        title,
        description,
        filePath: path,
        metadata: block?.metadata ?? {},
        order: block?.order ?? nextOrder,
        status: block?.status ?? 'draft',
      });
      if (block) {
        await adminContentService.update(block.id, input);
      } else {
        await adminContentService.create(stopId, input);
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-[#171717] border border-[#2C2C2C] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-white mb-4">
          {block ? 'Editar' : 'Agregar'} — {type?.label ?? block?.type}
        </h2>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="w-full rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] px-3 py-2 text-sm text-white placeholder-[#6E6E6E]"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descripción / texto"
            rows={4}
            className="w-full rounded-lg bg-[#0E0E0E] border border-[#2C2C2C] px-3 py-2 text-sm text-white placeholder-[#6E6E6E]"
          />
          {needsFile && (
            <label className="flex items-center gap-2 rounded-lg border border-dashed border-[#2C2C2C] px-3 py-3 text-sm text-[#A6A6A6] cursor-pointer hover:border-[#E6FF00]/40">
              <Upload className="w-4 h-4" />
              {file ? file.name : block?.fileUrl ? 'Reemplazar archivo' : 'Subir archivo'}
              <input
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          )}
          {error && <p className="text-xs text-[#FF4D67]">{error}</p>}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm text-[#A6A6A6] hover:text-white">
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving || (needsFile && !file && !block?.fileUrl)}
            className="px-4 py-2 rounded-lg bg-[#E6FF00] text-[#111111] text-sm font-medium hover:bg-[#D6F500] disabled:opacity-40"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
