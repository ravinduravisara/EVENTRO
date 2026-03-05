import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import logoImg from '../assets/icons/logo.png';
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Ticket,
  Calendar,
  CheckSquare,
  Megaphone,
  FileBarChart,
  Settings,
  HelpCircle,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: CalendarDays, label: 'Events', path: '/admin/events' },
  { icon: Users, label: 'Attendees', path: '/admin/users' },
  { icon: Ticket, label: 'Tickets', path: '/admin/tickets' },
  { icon: Calendar, label: 'Calendar', path: '/admin/calendar' },
  { icon: CheckSquare, label: 'Tasks', path: '/admin/tasks' },
  { icon: Megaphone, label: 'Marketing', path: '/admin/marketing' },
  { icon: FileBarChart, label: 'Reports', path: '/admin/reports' },
];

const bottomItems = [
  { icon: Settings, label: 'Settings', path: '/admin/settings' },
  { icon: HelpCircle, label: 'Help', path: '/admin/help' },
];

const EventroDashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('eventro_admin_authenticated');
    navigate('/eventro-admin', { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#0B1120] text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-64'
        } flex flex-col bg-[#0F1629] border-r border-slate-700/50 transition-all duration-300 shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-700/50">
          <img src={logoImg} alt="Eventro" className="h-9 w-9 rounded-xl shrink-0" />
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight">Eventro</span>
          )}
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div className="px-3 py-4 border-t border-slate-700/50 space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="mx-3 mb-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition flex items-center justify-center"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-8 py-4 bg-[#0F1629] border-b border-slate-700/50 shrink-0">
          <h1 className="text-xl font-bold">Eventro Dashboard</h1>

          <div className="flex items-center gap-5">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search"
                className="bg-slate-800 border border-slate-600/50 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 w-56"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-400 hover:text-white transition">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>

            {/* User */}
            <div className="flex items-center gap-3">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex"
                alt="Avatar"
                className="w-9 h-9 rounded-full ring-2 ring-slate-600"
              />
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold leading-tight">Alex Rivera</p>
                <p className="text-xs text-slate-400">Admin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EventroDashboardLayout;
