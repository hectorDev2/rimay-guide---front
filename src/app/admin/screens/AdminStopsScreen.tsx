import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Eye, LayoutGrid } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminStopService } from '@/services/admin/adminStopService';
import { adminTourService } from '@/services/admin/adminTourService';
import { stopSchema, type StopInput } from '@/services/admin/schemas';
import type { TourStop, Tour } from '@/lib/tour/types';

export function AdminStopsScreen() {
  const navigate = useNavigate();
  const { tourId } = useParams<{ tourId: string }>();
  const [tour, setTour] = useState<Tour | null>(null);
  const [stops, setStops] = useState<TourStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStop, setEditingStop] = useState<TourStop | null>(null);

  useEffect(() => {
    if (!tourId) return;
    Promise.all([
      adminTourService.get(tourId),
      adminStopService.listByTour(tourId),
    ]).then(([t, s]) => {
      setTour(t);
      setStops(s);
      setLoading(false);
    }).catch(() => navigate('/admin/tours'));
  }, [tourId, navigate]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar parada "${name}"?`)) return;
    try {
      await adminStopService.remove(id);
      setStops((prev) => prev.filter((s) => s.id !== id));
    } catch {
      alert('Error al eliminar');
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newStops = [...stops];
    const swapIdx = direction === 'up' ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newStops.length) return;
    [newStops[index], newStops[swapIdx]] = [newStops[swapIdx], newStops[index]];
    setStops(newStops);
    try {
      await adminStopService.reorder(tourId!, newStops.map((s) => s.id));
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
        onClick={() => navigate('/admin/tours')}
        className="flex items-center gap-2 text-sm text-[#6E6E6E] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a tours
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Paradas</h1>
          <p className="text-sm text-[#6E6E6E] mt-1">{tour?.name}</p>
        </div>
        <button
          onClick={() => { setEditingStop(null); setShowForm(true); }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E6FF00] text-[#111111] font-medium text-sm hover:bg-[#D6F500] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva parada
        </button>
      </div>

      {stops.length === 0 ? (
        <div className="bg-[#171717] border border-[#2C2C2C] rounded-2xl p-12 text-center">
          <p className="text-white mb-2">No hay paradas todavía</p>
          <p className="text-sm text-[#6E6E6E]">Agregá la primera parada del tour</p>
        </div>
      ) : (
        <div className="space-y-2">
          {stops.map((stop, index) => (
            <div
              key={stop.id}
              className="bg-[#171717] border border-[#2C2C2C] rounded-xl p-4 flex items-center gap-4 hover:border-[#3C3C3C] transition-colors"
            >
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-[#6E6E6E] hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === stops.length - 1}
                  className="p-1 text-[#6E6E6E] hover:text-white disabled:opacity-20 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              <div className="w-8 h-8 rounded-full bg-[#E6FF00] text-[#111111] flex items-center justify-center text-sm font-bold">
                {stop.order}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{stop.name}</p>
                <p className="text-[#6E6E6E] text-xs mt-0.5 truncate">{stop.description.slice(0, 80)}</p>
              </div>

              <div className="text-xs text-[#6E6E6E] whitespace-nowrap">
                {Math.round(stop.durationSeconds / 60)} min
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => navigate(`/admin/tours/${tourId}/stops/${stop.id}/preview`)}
                  className="p-2 rounded-lg text-[#6E6E6E] hover:text-[#E6FF00] hover:bg-[#0E0E0E] transition-colors"
                  title="Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setEditingStop(stop); setShowForm(true); }}
                  className="p-2 rounded-lg text-[#6E6E6E] hover:text-white hover:bg-[#0E0E0E] transition-colors"
                  title="Editar"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate(`/admin/tours/${tourId}/stops/${stop.id}/content`)}
                  className="p-2 rounded-lg text-[#6E6E6E] hover:text-[#E6FF00] hover:bg-[#0E0E0E] transition-colors"
                  title="Contenido"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(stop.id, stop.name)}
                  className="p-2 rounded-lg text-[#6E6E6E] hover:text-[#FF4D67] hover:bg-[#0E0E0E] transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <StopFormModal
          tourId={tourId!}
          stop={editingStop}
          nextOrder={stops.length + 1}
          onClose={() => setShowForm(false)}
          onSaved={(saved) => {
            if (editingStop) {
              setStops((prev) => prev.map((s) => (s.id === saved.id ? saved : s)));
            } else {
              setStops((prev) => [...prev, saved]);
            }
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function StopFormModal({ tourId, stop, nextOrder, onClose, onSaved }: {
  tourId: string;
  stop: TourStop | null;
  nextOrder: number;
  onClose: () => void;
  onSaved: (stop: TourStop) => void;
}) {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<StopInput>({
    resolver: zodResolver(stopSchema),
    defaultValues: stop ? {
      order: stop.order,
      name: stop.name,
      description: stop.description,
      culturalContext: stop.culturalContext || '',
      latitude: stop.latitude,
      longitude: stop.longitude,
      radiusMeters: stop.radiusMeters,
      audioSrc: stop.audioSrc,
      durationSeconds: stop.durationSeconds,
    } : {
      order: nextOrder,
      name: '',
      description: '',
      culturalContext: '',
      latitude: -13.5078,
      longitude: -71.9815,
      radiusMeters: 15,
      audioSrc: '/voices/sacsayhuaman_es.mp3',
      durationSeconds: 180,
    },
  });

  const onSubmit = async (data: StopInput) => {
    setSaving(true);
    try {
      const saved = stop
        ? await adminStopService.update(stop.id, data)
        : await adminStopService.create(tourId, data);
      onSaved(saved);
    } catch {
      alert('Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#171717] border border-[#2C2C2C] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold text-white mb-6">
          {stop ? 'Editar parada' : 'Nueva parada'}
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-[#A0A0A0] mb-1">Orden</label>
              <input type="number" {...register('order', { valueAsNumber: true })} className="w-full h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]" />
              {errors.order && <p className="text-[#FF4D67] text-xs mt-1">{errors.order.message}</p>}
            </div>
            <div>
              <label className="block text-xs text-[#A0A0A0] mb-1">Duración (seg)</label>
              <input type="number" {...register('durationSeconds', { valueAsNumber: true })} className="w-full h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]" />
              {errors.durationSeconds && <p className="text-[#FF4D67] text-xs mt-1">{errors.durationSeconds.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A0A0A0] mb-1">Nombre</label>
            <input {...register('name')} className="w-full h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]" />
            {errors.name && <p className="text-[#FF4D67] text-xs mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-xs text-[#A0A0A0] mb-1">Descripción</label>
            <textarea {...register('description')} rows={3} className="w-full rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E6FF00] resize-none" />
            {errors.description && <p className="text-[#FF4D67] text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-xs text-[#A0A0A0] mb-1">Contexto cultural</label>
            <textarea {...register('culturalContext')} rows={3} className="w-full rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 py-2 text-sm text-white focus:outline-none focus:border-[#E6FF00] resize-none" />
            {errors.culturalContext && <p className="text-[#FF4D67] text-xs mt-1">{errors.culturalContext.message}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-[#A0A0A0] mb-1">Latitud</label>
              <input type="number" step="any" {...register('latitude', { valueAsNumber: true })} className="w-full h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]" />
            </div>
            <div>
              <label className="block text-xs text-[#A0A0A0] mb-1">Longitud</label>
              <input type="number" step="any" {...register('longitude', { valueAsNumber: true })} className="w-full h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]" />
            </div>
            <div>
              <label className="block text-xs text-[#A0A0A0] mb-1">Radio (m)</label>
              <input type="number" {...register('radiusMeters', { valueAsNumber: true })} className="w-full h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-[#A0A0A0] mb-1">Audio (URL o path)</label>
            <input {...register('audioSrc')} className="w-full h-10 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-3 text-sm text-white focus:outline-none focus:border-[#E6FF00]" />
            {errors.audioSrc && <p className="text-[#FF4D67] text-xs mt-1">{errors.audioSrc.message}</p>}
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
