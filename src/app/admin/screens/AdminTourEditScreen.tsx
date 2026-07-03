import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { tourSchema, type TourInput } from '@/services/admin/schemas';
import { adminTourService } from '@/services/admin/adminTourService';

export function AdminTourEditScreen() {
  const navigate = useNavigate();
  const { tourId } = useParams<{ tourId: string }>();
  const isNew = tourId === 'new';
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<TourInput>({
    resolver: zodResolver(tourSchema),
    defaultValues: {
      slug: '',
      name: '',
      description: '',
      totalDurationMinutes: 45,
    },
  });

  useEffect(() => {
    if (isNew || !tourId) return;
    adminTourService.get(tourId).then((tour) => {
      if (tour) {
        reset({
          slug: tour.slug,
          name: tour.name,
          description: tour.description,
          totalDurationMinutes: tour.totalDurationMinutes,
        });
      }
      setLoading(false);
    }).catch(() => {
      navigate('/admin/tours');
    });
  }, [tourId, isNew, reset, navigate]);

  const onSubmit = async (data: TourInput) => {
    setSaving(true);
    try {
      if (isNew) {
        await adminTourService.create(data);
      } else if (tourId) {
        await adminTourService.update(tourId, data);
      }
      navigate('/admin/tours');
    } catch {
      alert('Error al guardar');
    } finally {
      setSaving(false);
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
    <div className="p-8 max-w-2xl">
      <button
        onClick={() => navigate('/admin/tours')}
        className="flex items-center gap-2 text-sm text-[#6E6E6E] hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a tours
      </button>

      <h1 className="text-2xl font-bold text-white mb-8">
        {isNew ? 'Nuevo tour' : 'Editar tour'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm text-[#A0A0A0] mb-2">Slug</label>
          <input
            {...register('slug')}
            className="w-full h-11 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-4 text-sm text-white focus:outline-none focus:border-[#E6FF00]"
            placeholder="mi-tour-nuevo"
          />
          {errors.slug && <p className="text-[#FF4D67] text-xs mt-1">{errors.slug.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-[#A0A0A0] mb-2">Nombre</label>
          <input
            {...register('name')}
            className="w-full h-11 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-4 text-sm text-white focus:outline-none focus:border-[#E6FF00]"
            placeholder="Mi Tour Increíble"
          />
          {errors.name && <p className="text-[#FF4D67] text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-[#A0A0A0] mb-2">Descripción</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E6FF00] resize-none"
            placeholder="Descripción del tour..."
          />
          {errors.description && <p className="text-[#FF4D67] text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div>
          <label className="block text-sm text-[#A0A0A0] mb-2">Duración total (minutos)</label>
          <input
            type="number"
            {...register('totalDurationMinutes', { valueAsNumber: true })}
            className="w-full h-11 rounded-lg bg-[#1B1B1B] border border-[#2C2C2C] px-4 text-sm text-white focus:outline-none focus:border-[#E6FF00]"
          />
          {errors.totalDurationMinutes && <p className="text-[#FF4D67] text-xs mt-1">{errors.totalDurationMinutes.message}</p>}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-lg bg-[#E6FF00] text-[#111111] font-medium text-sm hover:bg-[#D6F500] transition-colors disabled:opacity-40"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/tours')}
            className="px-6 py-2.5 rounded-lg bg-[#1E1E1E] text-[#A0A0A0] font-medium text-sm hover:bg-[#2C2C2C] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
