import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import api from '../services/api';

const ResendVerificationEmail = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.post('/users/resend-verification-email', { email });
      setSuccess(response.data.message || 'Verification OTP sent! Check your inbox.');
      setEmail('');
      
      // Redirect to OTP page after 2 seconds
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend verification email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(50rem_40rem_at_90%_10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(40rem_30rem_at_10%_40%,rgba(168,85,247,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto mt-12 w-full max-w-5xl">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="pt-4 text-center lg:pt-10 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-xl">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
              Secure email verification
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Resend your{' '}
              <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                OTP code
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              Enter your registered email and we will send a fresh verification OTP instantly.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Fast</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">Delivery</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Secure</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">OTP flow</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Simple</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">1 step</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-cyan-500/20 blur-2xl" />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8">
              <div className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-bold text-white">Resend Verification OTP</h2>
                <p className="mt-2 text-sm text-white/65">
                  Use the same email you registered with.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4">
                    <p className="text-sm text-rose-100">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                    <p className="text-sm text-emerald-100">{success}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    disabled={isLoading}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 transition duration-200 hover:border-white/25 focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  />
                </div>

                <Button
                  type="submit"
                  className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-semibold text-slate-950 transition-all hover:scale-[1.01] hover:from-violet-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending OTP...' : 'Resend Verification OTP'}
                </Button>
              </form>

              <div className="relative mt-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/15"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-slate-950/60 px-4 text-white/60">Remembered your login details?</span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Link
                  to="/login"
                  className="font-semibold text-cyan-200 transition-colors hover:text-cyan-100 hover:underline"
                >
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendVerificationEmail;
