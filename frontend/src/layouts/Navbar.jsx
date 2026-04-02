import { Link, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import logoImg from "../assets/icons/logo.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = useMemo(() => {
    const links = [{ to: "/events", label: "Events" }];

    if (user) {
      links.push({ to: "/bookings", label: "My Bookings" });
      links.push({ to: "/transactions", label: "Transactions" });
      links.push({ to: "/profile", label: "Profile" });
      if (user.role === "admin") links.push({ to: "/admin", label: "Admin" });
    } else {
      links.push({ to: "/login", label: "Login" });
    }

    return links;
  }, [user]);

  return (
    <header className="sticky top-0 z-50">
      {/* Glass background */}
      <div className="border-b border-white/10 bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-slate-950/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <Link to="/" className="group flex items-center gap-2">
                <img src={logoImg} alt="Eventro" className="h-9 w-9 rounded-xl shadow-sm" />
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Eventro
                </span>
              </Link>

              {/* Small badge */}
              <span className="hidden md:inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/60">
                Discover • Create • Manage
              </span>
            </div>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className={[
                    "px-3 py-2 rounded-xl text-sm font-medium transition",
                    isActive(l.to)
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "text-white/60 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              ))}

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="ml-1 inline-flex items-center justify-center rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white transition"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              {/* User area */}
              {user && (
                <div className="relative ml-1">
                  <button
                    onClick={() => setUserMenuOpen((s) => !s)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/80 shadow-sm hover:bg-white/10 transition"
                    aria-label="Open user menu"
                  >
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 text-white grid place-items-center text-xs font-bold">
                      {String(user?.name?.[0] || user?.email?.[0] || "U").toUpperCase()}
                    </div>
                    <span className="hidden lg:block max-w-[140px] truncate">
                      {user?.name || user?.email || "Account"}
                    </span>
                    <span className="text-white/40">▾</span>
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg shadow-black/30"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-white/10">
                        <div className="text-sm font-semibold text-white">
                          {user?.name || "User"}
                        </div>
                        <div className="text-xs text-white/50 truncate">
                          {user?.email || ""}
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          to="/profile"
                          className="block rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Profile
                        </Link>

                        <Link
                          to="/bookings"
                          className="block rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          My Bookings
                        </Link>

                        <Link
                          to="/transactions"
                          className="block rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          Transactions
                        </Link>

                        {user.role === "admin" && (
                          <Link
                            to="/admin"
                            className="block rounded-xl px-3 py-2 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                            onClick={() => setUserMenuOpen(false)}
                          >
                            Admin Dashboard
                          </Link>
                        )}

                        <button
                          onClick={handleLogout}
                          className="mt-1 w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-red-400 hover:bg-red-500/10"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Mobile buttons */}
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className="inline-flex items-center justify-center rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Toggle theme"
              >
                {darkMode ? "☀️" : "🌙"}
              </button>

              <button
                onClick={() => setMobileOpen((s) => !s)}
                className="inline-flex items-center justify-center rounded-xl p-2 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Open menu"
              >
                {mobileOpen ? "✕" : "☰"}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-950/90 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
              {navLinks.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-medium transition",
                    isActive(l.to)
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "text-white/60 hover:text-white hover:bg-white/10",
                  ].join(" ")}
                >
                  {l.label}
                </Link>
              ))}

              {user && (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="mt-1 rounded-xl px-3 py-2 text-left text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;