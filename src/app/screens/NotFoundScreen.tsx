import { useNavigate } from 'react-router';
import { MapPin } from 'lucide-react';

export function NotFoundScreen() {
  const navigate = useNavigate();

  return (
    <div className="h-full bg-[#0E0E0E] flex flex-col items-center justify-center px-5 text-center">
      <div className="w-20 h-20 rounded-[22px] bg-[#1E1E1E] border border-[#2C2C2C] flex items-center justify-center mb-6">
        <MapPin className="w-10 h-10 text-[#6E6E6E]" />
      </div>
      <h1 className="text-[36px] font-bold text-white mb-2">404</h1>
      <p className="text-[15px] text-[#6E6E6E] mb-8">
        Esta página no existe en el tour
      </p>
      <button
        onClick={() => navigate('/')}
        className="h-14 px-8 rounded-full bg-[#E6FF00] text-[#111111] font-semibold text-[15px] shadow-[0_8px_20px_rgba(230,255,0,0.3)] active:scale-[0.96] transition-all"
      >
        Volver al inicio
      </button>
    </div>
  );
}
