import { useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/Button';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialEmail = useMemo(() => searchParams.get('email') || '', [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim() || !otp.trim()) {
      setError('Email and OTP are required.');
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError('OTP must be a 6-digit code.');
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await api.post('/users/verify-email-otp', {
        email: email.trim(),
        otp: otp.trim(),
      });

      setSuccess(data.message || 'Email verified successfully. You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    
    
    <div className="relative isolate min-h-screen overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
        <div><br></br><br></br><br></br><br></br><br></br><br></br></div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(50rem_40rem_at_90%_10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(40rem_30rem_at_10%_40%,rgba(168,85,247,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto w-full max-w-md">
        <div className="relative">
          <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-cyan-500/20 blur-2xl" />
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-white">Verify Your Email</h1>
              <p className="mt-2 text-sm text-white/65">
                Enter the 6-digit OTP sent to your email.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4">
                <p className="text-sm text-rose-100">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                <p className="text-sm text-emerald-100">{success}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 transition duration-200 hover:border-white/25 focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  required
                />
              </div>

              <div>
                <label htmlFor="otp" className="mb-2 block text-sm font-medium text-white/80">
                  OTP Code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.4em] text-white placeholder:text-white/30 transition duration-200 hover:border-white/25 focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="mt-2 w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-semibold text-slate-950 transition-all hover:scale-[1.01] hover:from-violet-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-white/65">
              Didn't receive the code?{' '}
              <Link to="/resend-verification" className="font-semibold text-cyan-200 hover:text-cyan-100 hover:underline">
                Resend OTP
              </Link>
            </div>

            <div className="mt-3 text-center text-sm">
              <Link to="/login" className="font-medium text-white/70 hover:text-white">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
