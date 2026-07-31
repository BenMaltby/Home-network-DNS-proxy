import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ListTree, ShieldBan, Network, Settings as SettingsIcon, Shield } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/queries', label: 'Query Log', icon: ListTree, end: false },
  { to: '/blocklist', label: 'Blocklist', icon: ShieldBan, end: false },
  { to: '/local-dns', label: 'Local DNS', icon: Network, end: false },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, end: false },
];

export default function AppShell() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      <aside className="w-56 shrink-0 border-r border-gray-800 flex flex-col">
        <div className="flex items-center gap-2 px-4 py-5 text-lg font-semibold">
          <Shield className="text-emerald-400" size={22} />
          <span>DNS Dashboard</span>
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-emerald-500/10 text-emerald-400' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
