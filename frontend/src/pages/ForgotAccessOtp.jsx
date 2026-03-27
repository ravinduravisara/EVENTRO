import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const ForgotAccessOtp = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const initialEmail = searchParams.get('email') || '';
  const isAdminFlow = searchParams.get('admin') === '1';

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(
    () => (isAdminFlow ? 'Admin Access Recovery' : 'Account Access Recovery'),
    [isAdminFlow]
  );

  const sendOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      await api.post('/users/forgot-access-otp/request', { email });
      setStep('otp');
      setMessage('OTP sent to your email. Enter it below to continue.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      const { data } = await api.post('/users/forgot-access-otp/verify', {
        email,
        otp,
      });

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      updateUser(data);

      if (isAdminFlow && (data.role === 'admin' || data.role === 'organizer')) {
        localStorage.setItem('eventro_admin_authenticated', 'true');
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendOtp = async () => {
    setIsSubmitting(true);
    setMessage('');
    setError('');

    try {
      await api.post('/users/forgot-access-otp/request', { email });
      setMessage('A new OTP has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(50rem_40rem_at_90%_10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(40rem_30rem_at_10%_40%,rgba(168,85,247,0.18),transparent_55%)]" />

      <div className="mx-auto mt-20 max-w-xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8">
        <h1 className="text-3xl font-extrabold text-white">{title}</h1>
        <p className="mt-2 text-sm text-white/70">
          Enter your email, receive OTP, verify it, and access your account.
        </p>

        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-3 text-sm text-rose-100">
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={sendOtp} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-white/80">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-semibold text-slate-950 transition-all hover:from-violet-400 hover:to-cyan-300 disabled:opacity-50"
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="mt-6 space-y-4">
            <div>
              <label htmlFor="otp" className="mb-2 block text-sm font-medium text-white/80">
                OTP code
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                required
                disabled={isSubmitting}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-semibold text-slate-950 transition-all hover:from-violet-400 hover:to-cyan-300 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : 'Verify OTP and Access'}
            </button>

            <button
              type="button"
              onClick={resendOtp}
              disabled={isSubmitting}
              className="w-full rounded-xl border border-white/20 bg-white/5 py-3 font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
            >
              Resend OTP
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-white/60">
          Back to{' '}
          <Link
            to={isAdminFlow ? '/eventro-admin' : '/login'}
            className="font-semibold text-cyan-200 hover:text-cyan-100 hover:underline"
          >
            sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotAccessOtp;
