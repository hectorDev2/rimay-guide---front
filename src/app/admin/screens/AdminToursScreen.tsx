import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Pencil, Trash2, MapPin, Map } from 'lucide-react';
import { adminTourService } from '@/services/admin/adminTourService';
import type { Tour } from '@/lib/tour/types';

export function AdminToursScreen() {
  const navigate = useNavigate();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setTours(await adminTourService.list());
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(id);
    try {
      await adminTourService.remove(id);
      setTours((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert('Error al eliminar');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">Tours</h1>
        <button
          onClick={() => navigate('/admin/tours/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#E6FF00] text-[#111111] font-medium text-sm hover:bg-[#D6F500] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo tour
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-[#6E6E6E]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E6FF00] border-t-transparent" />
          Cargando...
        </div>
      ) : tours.length === 0 ? (
        <div className="bg-[#171717] border border-[#2C2C2C] rounded-2xl p-12 text-center">
          <Map className="w-12 h-12 text-[#6E6E6E] mx-auto mb-4" />
          <p className="text-white mb-2">No hay tours todavía</p>
          <p className="text-sm text-[#6E6E6E]">Creá el primero para empezar</p>
        </div>
      ) : (
        <div className="bg-[#171717] border border-[#2C2C2C] rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2C2C2C]">
                <th className="text-left text-xs text-[#6E6E6E] font-medium px-6 py-3">Nombre</th>
                <th className="text-left text-xs text-[#6E6E6E] font-medium px-6 py-3">Slug</th>
                <th className="text-left text-xs text-[#6E6E6E] font-medium px-6 py-3">Duración</th>
                <th className="text-right text-xs text-[#6E6E6E] font-medium px-6 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {tours.map((tour) => (
                <tr key={tour.id} className="border-b border-[#2C2C2C] last:border-0 hover:bg-[#1E1E1E] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white text-sm font-medium">{tour.name}</p>
                    <p className="text-[#6E6E6E] text-xs mt-0.5">{tour.description.slice(0, 60)}...</p>
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-[#0E0E0E] px-2 py-1 rounded text-[#E6FF00]">{tour.slug}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#A0A0A0]">{tour.totalDurationMinutes} min</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/admin/tours/${tour.id}/stops`)}
                        className="p-2 rounded-lg text-[#6E6E6E] hover:text-[#E6FF00] hover:bg-[#0E0E0E] transition-colors"
                        title="Paradas"
                      >
                        <MapPin className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/tours/${tour.id}`)}
                        className="p-2 rounded-lg text-[#6E6E6E] hover:text-white hover:bg-[#0E0E0E] transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tour.id, tour.name)}
                        disabled={deleting === tour.id}
                        className="p-2 rounded-lg text-[#6E6E6E] hover:text-[#FF4D67] hover:bg-[#0E0E0E] transition-colors disabled:opacity-40"
                        title="Eliminar"
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
    </div>
  );
}
