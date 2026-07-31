import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, ListTree, ShieldBan, Network, Settings as SettingsIcon, Shield, Menu, X } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/queries', label: 'Query Log', icon: ListTree, end: false },
  { to: '/blocklist', label: 'Blocklist', icon: ShieldBan, end: false },
  { to: '/local-dns', label: 'Local DNS', icon: Network, end: false },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, end: false },
];

export default function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-gray-950 text-gray-100 lg:flex">
      <header className="flex items-center justify-between border-b border-gray-800 px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="text-emerald-400" size={20} />
          <span>DNS Dashboard</span>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="rounded-md p-2 text-gray-300 hover:bg-gray-800"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-800 bg-gray-950 transition-transform duration-200 ease-in-out lg:static lg:z-auto lg:w-56 lg:shrink-0 lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-5">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Shield className="text-emerald-400" size={22} />
            <span>DNS Dashboard</span>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-800 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>
        <nav className="flex flex-col gap-1 px-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setMenuOpen(false)}
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

      <main className="flex-1 overflow-y-auto p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}
