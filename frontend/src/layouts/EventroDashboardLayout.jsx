import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import logoImg from "../assets/icons/logo.png";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Ticket,
  QrCode,
  Calendar,
  CheckSquare,
  Megaphone,
  FileBarChart,
  MessageSquare,
  HandCoins,
  Settings,
  HelpCircle,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: CalendarDays, label: "Events", path: "/admin/events" },
  { icon: Users, label: "Attendees", path: "/admin/users" },
  { icon: Ticket, label: "Tickets", path: "/admin/tickets" },
  { icon: QrCode, label: "Check-in", path: "/admin/check-in" },
  { icon: Calendar, label: "Calendar", path: "/admin/calendar" },
  { icon: CheckSquare, label: "Tasks", path: "/admin/tasks" },
  { icon: Megaphone, label: "Marketing", path: "/admin/marketing" },
  { icon: FileBarChart, label: "Reports", path: "/admin/reports" },
  { icon: MessageSquare, label: "Feedback", path: "/admin/feedback" },
  { icon: HandCoins, label: "Sponsorship", path: "/admin/sponsorship" },
];

const bottomItems = [
  { icon: Settings, label: "Settings", path: "/admin/settings" },
  { icon: HelpCircle, label: "Help", path: "/admin/help" },
];

const EventroDashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const storageKey = "eventro_admin_settings";

  const loadAdminProfile = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return { name: "Alex Rivera", role: "Admin" };
      }
      const parsed = JSON.parse(raw);
      const name =
        typeof parsed?.profile?.name === "string" && parsed.profile.name.trim()
          ? parsed.profile.name.trim()
          : "Alex Rivera";
      const role =
        typeof parsed?.profile?.role === "string" && parsed.profile.role.trim()
          ? parsed.profile.role.trim()
          : "Admin";
      return { name, role };
    } catch {
      return { name: "Alex Rivera", role: "Admin" };
    }
  };

  const [adminProfile, setAdminProfile] = useState(() => loadAdminProfile());

  useEffect(() => {
    const updateFromStorage = () => setAdminProfile(loadAdminProfile());

    window.addEventListener(
      "eventro_admin_settings_updated",
      updateFromStorage,
    );
    window.addEventListener("storage", updateFromStorage);
    return () => {
      window.removeEventListener(
        "eventro_admin_settings_updated",
        updateFromStorage,
      );
      window.removeEventListener("storage", updateFromStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avatarSeed = useMemo(
    () => encodeURIComponent(adminProfile.name || "Admin"),
    [adminProfile.name],
  );

  const isActivePath = (currentPath, itemPath) => {
    if (itemPath === "/admin") {
      return currentPath === itemPath;
    }
    return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
  };

  const handleLogout = () => {
    localStorage.removeItem("eventro_admin_authenticated");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/eventro-admin", { replace: true });
  };

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-[#0B1120] text-slate-900 dark:text-white overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? "w-20" : "w-64"
        } flex flex-col bg-white dark:bg-[#0F1629] border-r border-slate-200 dark:border-slate-700/50 transition-all duration-300 shrink-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-slate-200 dark:border-slate-700/50">
          <img
            src={logoImg}
            alt="Eventro"
            className="h-9 w-9 rounded-xl shrink-0"
          />
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight">Eventro</span>
          )}
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(location.pathname, item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50"
                }`}
              >
                <Icon size={20} className="shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Bottom Nav */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-700/50 space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActivePath(location.pathname, item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-emerald-500/15 text-emerald-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50"
                }`}
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
        <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#0F1629] border-b border-slate-200 dark:border-slate-700/50 shrink-0">
          <h1 className="text-xl font-bold">Eventro Dashboard</h1>

          <div className="flex items-center gap-5">
            {/* Search */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400"
              />
              <input
                type="text"
                placeholder="Search"
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600/50 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 w-56"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </button>

            {/* User */}
            <div className="flex items-center gap-3">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarSeed}`}
                alt="Avatar"
                className="w-9 h-9 rounded-full ring-2 ring-slate-300 dark:ring-slate-600"
              />
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold leading-tight">
                  {adminProfile.name}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {adminProfile.role}
                </p>
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
