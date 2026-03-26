import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isUnverifiedEmail, setIsUnverifiedEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const fieldBaseClass =
    'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 transition duration-200 hover:border-white/25 focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setIsUnverifiedEmail(false);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Login failed';
      if (errorMsg.includes('verify your email')) {
        setIsUnverifiedEmail(true);
        setError(errorMsg);
      } else {
        setError(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden px-4 py-0 sm:px-6 lg:px-8">
      <div><br /><br /><br /><br /><br /><br /><br /></div>
      
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(50rem_40rem_at_90%_10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(40rem_30rem_at_10%_40%,rgba(168,85,247,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto w-full max-w-5xl">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="pt-4 text-center lg:pt-10 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-xl">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
              Welcome back to Eventro
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Sign in and{' '}
              <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                keep events moving
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              Manage registrations, monitor activity, and run every event from a single dashboard.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Real-time</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">Check-ins</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Smart</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">Reminders</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Live</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">Analytics</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-cyan-500/20 blur-2xl" />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white">Sign in</h2>
                <p className="mt-2 text-sm text-white/65">Access your account and continue where you left off.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className={`animate-shake rounded-2xl border p-4 ${isUnverifiedEmail ? 'border-amber-400/30 bg-amber-500/10' : 'border-rose-400/30 bg-rose-500/10'}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 pt-0.5">
                        <svg className={`h-5 w-5 ${isUnverifiedEmail ? 'text-amber-300' : 'text-rose-300'}`} viewBox="0 0 20 20" fill="currentColor">
                          {isUnverifiedEmail ? (
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          )}
                        </svg>
                      </div>
                      <div>
                        <p className={`text-sm ${isUnverifiedEmail ? 'text-amber-100' : 'text-rose-100'}`}>{error}</p>
                        {isUnverifiedEmail && (
                          <p className="mt-2 text-sm text-amber-200/85">
                            Please check your email for the verification link, or{' '}
                            <Link
                              to="/resend-verification"
                              className="font-semibold underline transition hover:text-amber-100"
                            >
                              resend verification email
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative">
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                    Email Address
                  </label>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="mt-7 h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className={`${fieldBaseClass} pl-10`}
                    required
                  />
                </div>

                <div className="relative">
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-white/80">
                    Password
                  </label>
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <svg className="mt-7 h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    className={`${fieldBaseClass} pl-10 pr-16`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-[42px] text-xs font-medium text-blue-500 transition hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400/40"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-300 focus:ring-indigo-400/60"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-white/70">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <a href="#" className="font-medium text-cyan-200 transition-colors hover:text-cyan-100">
                      Forgot password?
                    </a>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-semibold text-slate-950 transition-all hover:scale-[1.01] hover:from-violet-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="-ml-1 mr-3 h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </span>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/15"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-slate-950/60 px-4 text-white/60">New to Eventro?</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/register"
                  className="font-semibold text-cyan-200 transition-colors hover:text-cyan-100 hover:underline"
                >
                  Create an account
                </Link>
              </div>

              <p className="mt-6 text-center text-sm text-white/50">
                Protected by reCAPTCHA and subject to the Eventro Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
