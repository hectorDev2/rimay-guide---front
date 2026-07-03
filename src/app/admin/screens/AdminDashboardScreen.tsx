import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Map, MapPin, Languages, ArrowRight } from 'lucide-react';
import { adminTourService } from '@/services/admin/adminTourService';
import { adminStopService } from '@/services/admin/adminStopService';
import { adminTranslationService } from '@/services/admin/adminTranslationService';

export function AdminDashboardScreen() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ tours: 0, stops: 0, translations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [tours, translations] = await Promise.all([
          adminTourService.list(),
          adminTranslationService.list(),
        ]);
        let totalStops = 0;
        for (const tour of tours) {
          const stops = await adminStopService.listByTour(tour.id);
          totalStops += stops.length;
        }
        setStats({ tours: tours.length, stops: totalStops, translations: translations.length });
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    { icon: Map, label: 'Tours', value: stats.tours, to: '/admin/tours' },
    { icon: MapPin, label: 'Paradas', value: stats.stops, to: '/admin/tours' },
    { icon: Languages, label: 'Traducciones', value: stats.translations, to: '/admin/translations' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-8">Dashboard</h1>

      {loading ? (
        <div className="flex items-center gap-2 text-[#6E6E6E]">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#E6FF00] border-t-transparent" />
          Cargando...
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {cards.map((card) => (
            <button
              key={card.label}
              onClick={() => navigate(card.to)}
              className="bg-[#171717] border border-[#2C2C2C] rounded-2xl p-6 text-left hover:border-[#E6FF00] transition-colors group"
            >
              <card.icon className="w-8 h-8 text-[#E6FF00] mb-4" />
              <p className="text-3xl font-bold text-white mb-1">{card.value}</p>
              <p className="text-sm text-[#6E6E6E] flex items-center gap-1">
                {card.label}
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
