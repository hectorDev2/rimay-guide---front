import { Outlet, NavLink, useNavigate } from 'react-router';
import { useAuthStore } from '@/stores/authStore';
import { LayoutDashboard, Map, MapPin, Languages, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/tours', label: 'Tours', icon: Map },
  { to: '/admin/translations', label: 'Traducciones', icon: Languages },
];

export function AdminLayout() {
  const logout = useAuthStore((s) => s.logout);
  const profile = useAuthStore((s) => s.profile);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#0E0E0E] text-white">
      <aside className="w-64 border-r border-[#2C2C2C] flex flex-col">
        <div className="p-6 border-b border-[#2C2C2C]">
          <h1 className="text-xl font-bold text-[#E6FF00]">Rimay Admin</h1>
          {profile?.display_name && (
            <p className="text-xs text-[#6E6E6E] mt-1">{profile.display_name}</p>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-[#E6FF00] text-[#111111] font-medium'
                    : 'text-[#A0A0A0] hover:bg-[#1E1E1E] hover:text-white'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#2C2C2C]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[#A0A0A0] hover:bg-[#1E1E1E] hover:text-white transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Salir
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
