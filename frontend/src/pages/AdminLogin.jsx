import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import api from '../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fieldBaseClass =
    'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 transition duration-200 hover:border-white/25 focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40';

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? (() => { try { return JSON.parse(storedUser); } catch { return null; } })() : null;
    const isRoleAllowed = user?.role === 'admin' || user?.role === 'organizer';
    if (token && isRoleAllowed) {
      localStorage.setItem('eventro_admin_authenticated', 'true');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((previous) => ({ ...previous, [name]: value }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    (async () => {
      try {
        const { data } = await api.post('/users/login', {
          email: credentials.email,
          password: credentials.password,
        });

        const isRoleAllowed = data?.role === 'admin' || data?.role === 'organizer';
        if (!isRoleAllowed) {
          setError('Access denied: admin/organizer account required.');
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('eventro_admin_authenticated', 'true');
        navigate('/admin', { replace: true });
      } catch (err) {
        setError(err.response?.data?.message || 'Admin login failed');
      } finally {
        setIsLoading(false);
      }
    })();
  };

  return (
    
    <div className="relative isolate min-h-screen overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div><br></br><br></br><br></br><br></br><br></br><br></br></div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(50rem_40rem_at_90%_10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(40rem_30rem_at_10%_40%,rgba(168,85,247,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto w-full max-w-5xl">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="pt-4 text-center lg:pt-10 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-xl">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
              Restricted access • Admin portal only
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Admin{' '}
              <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                Sign In
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              Access Eventro admin tools to review events, monitor activity, and manage platform operations.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Role</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">Protected</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Live</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">Monitoring</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Event</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">Control</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-cyan-500/20 blur-2xl" />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white">Admin Login</h2>
                <p className="mt-2 text-sm text-white/65">Use an account with admin or organizer role.</p>
              </div>

              {error && (
                <div className="mb-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4">
                  <p className="text-sm text-rose-100">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="relative">
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={credentials.email}
                    onChange={handleChange}
                    placeholder="admin@example.com"
                    className={fieldBaseClass}
                    required
                    disabled={isLoading}
                    autoComplete="email"
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
                    Password
                  </label>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    placeholder="Enter admin password"
                    className={`${fieldBaseClass} pr-16`}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-[42px] text-xs font-medium text-cyan-200 transition hover:text-cyan-100"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="flex justify-end">
                  <Link
                    to={`/forgot-access?admin=1&email=${encodeURIComponent(credentials.email)}`}
                    className="text-sm font-medium text-cyan-200 transition hover:text-cyan-100 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-semibold text-slate-950 transition-all hover:scale-[1.01] hover:from-violet-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

             
              <p className="mt-6 text-center text-sm text-white/50">
                This is a secure area. Unauthorized access is prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
