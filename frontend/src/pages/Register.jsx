import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import api from '../services/api';

const Register = () => {
  const [form, setForm] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    password: ''
  });
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendClicks, setResendClicks] = useState(0);
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [supportForm, setSupportForm] = useState({ email: '', description: '' });
  const [supportNotice, setSupportNotice] = useState({ type: '', message: '' });
  const [isSendingSupport, setIsSendingSupport] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validateField = (name, value) => {
    const trimmedValue = value.trim();

    if (name === 'firstName' || name === 'lastName') {
      if (!trimmedValue) return 'This field is required.';
      if (trimmedValue.length < 2) return 'Must be at least 2 characters.';
      if (!/^[A-Za-z\s'-]+$/.test(trimmedValue)) return 'Use letters only.';
      return '';
    }

    if (name === 'email') {
      if (!trimmedValue) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) return 'Enter a valid email address.';
      return '';
    }

    if (name === 'password') {
      if (!value) return 'Password is required.';
      if (value.length < 8) return 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(value)) return 'Include at least one uppercase letter.';
      if (!/[a-z]/.test(value)) return 'Include at least one lowercase letter.';
      if (!/[0-9]/.test(value)) return 'Include at least one number.';
      return '';
    }

    return '';
  };

  const validateAvatar = (file) => {
    if (!file) return '';
    if (!file.type.startsWith('image/')) return 'Avatar must be an image file.';
    if (file.size > 2 * 1024 * 1024) return 'Avatar must be smaller than 2MB.';
    return '';
  };

  const validateForm = (values, file) => {
    const nextErrors = {
      firstName: validateField('firstName', values.firstName),
      lastName: validateField('lastName', values.lastName),
      email: validateField('email', values.email),
      password: validateField('password', values.password),
      avatar: validateAvatar(file),
    };

    Object.keys(nextErrors).forEach((key) => {
      if (!nextErrors[key]) delete nextErrors[key];
    });

    return nextErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (touched[name] || validationErrors[name]) {
      const message = validateField(name, value);
      setValidationErrors((prev) => {
        const next = { ...prev };
        if (message) next[name] = message;
        else delete next[name];
        return next;
      });
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const message = validateField(name, value);
    setValidationErrors((prev) => {
      const next = { ...prev };
      if (message) next[name] = message;
      else delete next[name];
      return next;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const avatarError = validateAvatar(file);
    setTouched((prev) => ({ ...prev, avatar: true }));

    setValidationErrors((prev) => {
      const next = { ...prev };
      if (avatarError) next.avatar = avatarError;
      else delete next.avatar;
      return next;
    });

    if (file && !avatarError) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      return;
    }

    setAvatar(null);
    setAvatarPreview('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm(form, avatar);

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      avatar: true,
    });
    setValidationErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setError('Please fix the highlighted fields and try again.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');
    setResendMessage('');
    setResendClicks(0);
    try {
      await register(form.firstName, form.lastName, form.email, form.password, avatar);
      setSuccess('Registration successful! Enter the OTP sent to your email to verify your account.');
      // Redirect to OTP verification after 2 seconds
      setTimeout(() => {
        navigate(`/verify-email?email=${encodeURIComponent(form.email)}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!form.email) return;

    setIsResendingOtp(true);
    setResendMessage('');

    try {
      const response = await api.post('/users/resend-verification-email', {
        email: form.email,
      });
      setResendClicks((prev) => prev + 1);
      setResendMessage(response.data?.message || 'OTP resent successfully.');
    } catch (err) {
      setResendMessage(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();

    const supportEmail = String(supportForm.email || form.email || '').trim();
    const description = String(supportForm.description || '').trim();

    if (!supportEmail) {
      setSupportNotice({ type: 'error', message: 'Enter your email address to message the admin.' });
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
      setSupportNotice({ type: 'error', message: 'Enter a valid email address.' });
      return;
    }

    if (description.length < 10) {
      setSupportNotice({ type: 'error', message: 'Describe your issue in at least 10 characters.' });
      return;
    }

    setIsSendingSupport(true);
    setSupportNotice({ type: '', message: '' });

    try {
      const { data } = await api.post('/support/messages', {
        email: supportEmail,
        description,
      });

      setSupportForm((prev) => ({ ...prev, email: supportEmail, description: '' }));
      setSupportNotice({
        type: 'success',
        message: data?.message || 'Your message has been sent to the admin.',
      });
    } catch (err) {
      setSupportNotice({
        type: 'error',
        message: err.response?.data?.message || 'Failed to send your message.',
      });
    } finally {
      setIsSendingSupport(false);
    }
  };

  const fieldBaseClass =
    'w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 transition focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40';

  const getFieldClass = (name, extraClass = '') =>
    `${fieldBaseClass} ${validationErrors[name] ? 'border-rose-400/70 focus:ring-rose-400/40' : ''} ${extraClass}`.trim();

  return (
    <div className="relative isolate min-h-screen overflow-hidden px-4 py-12 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(50rem_40rem_at_90%_10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(40rem_30rem_at_10%_40%,rgba(168,85,247,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto w-full max-w-5xl">
        <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
          <div className="pt-4 text-center lg:pt-10 lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 backdrop-blur-xl">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
              Join Eventro and start managing events smarter
            </div>

            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Create your{' '}
              <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                account
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/70">
              Build events, publish beautiful pages, and track attendance from one dashboard.
              Your next event starts here.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 sm:max-w-md">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Fast</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">Setup</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Smart</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">Check-ins</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                <div className="text-xl font-bold text-white">Live</div>
                <div className="mt-1 text-xs uppercase tracking-wider text-white/60">Insights</div>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200/80">Need admin help first?</p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">
                    Guests and banned users can contact the admin before creating an account.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden rounded-2xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-100 sm:block">
                    Guests + banned users
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSupportOpen((prev) => !prev)}
                    className="inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
                  >
                    {isSupportOpen ? 'Hide admin message form' : 'Contact admin'}
                  </button>
                </div>
              </div>

              {isSupportOpen && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <h2 className="text-2xl font-bold text-white">Send a message before creating your account</h2>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">
                    Use this if you are blocked from signing up, appealing a ban, or need help before registration.
                    The admin will receive your message in the dashboard notification bell and can reply by email.
                  </p>

                  <form onSubmit={handleSupportSubmit} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="support-email" className="mb-2 block text-sm font-medium text-white/80">
                        Your email
                      </label>
                      <input
                        id="support-email"
                        type="email"
                        value={supportForm.email || form.email}
                        onChange={(e) => setSupportForm((prev) => ({ ...prev, email: e.target.value }))}
                        placeholder="name@example.com"
                        className={fieldBaseClass}
                      />
                    </div>

                    <div>
                      <label htmlFor="support-description" className="mb-2 block text-sm font-medium text-white/80">
                        Description
                      </label>
                      <textarea
                        id="support-description"
                        rows={4}
                        value={supportForm.description}
                        onChange={(e) => setSupportForm((prev) => ({ ...prev, description: e.target.value }))}
                        placeholder="Tell the admin what you need help with."
                        className={`${fieldBaseClass} resize-none`}
                      />
                    </div>

                    {supportNotice.message && (
                      <div
                        className={`rounded-2xl border px-4 py-3 text-sm ${
                          supportNotice.type === 'success'
                            ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100'
                            : 'border-rose-400/30 bg-rose-500/10 text-rose-100'
                        }`}
                      >
                        {supportNotice.message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSendingSupport}
                      className="inline-flex items-center rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSendingSupport ? 'Sending message...' : 'Message admin'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            
            <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-cyan-500/20 blur-2xl" />
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8">
              {/* <div className="mb-6 text-center ">
                <h2 className="text-2xl font-bold   text-white">Create your account</h2>
                <p className="mt-2 text-sm text-white/65">Sign up to create and manage your events.</p>
              </div> */}

          {success ? (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 pt-0.5">
                  <svg className="h-5 w-5 text-emerald-300" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-emerald-100">{success}</p>
                  <p className="mt-2 text-sm text-emerald-200/85">Redirecting to OTP verification in 2 seconds...</p>
                  <Link to={`/verify-email?email=${encodeURIComponent(form.email)}`} className="mt-3 inline-block text-sm font-semibold text-emerald-100 hover:text-emerald-50">
                    Verify with OTP now
                  </Link>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isResendingOtp}
                      className="rounded-lg border border-emerald-300/40 bg-emerald-400/10 px-3 py-1.5 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isResendingOtp ? 'Resending OTP...' : 'Resend OTP'}
                    </button>
                    {resendClicks > 0 && (
                      <span className="text-xs text-emerald-200/80">Resend clicks: {resendClicks}</span>
                    )}
                  </div>

                  {resendMessage && (
                    <p className="mt-2 text-xs text-emerald-100/90">{resendMessage}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {error && (
                <div className="animate-shake rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 pt-0.5">
                      <svg className="h-5 w-5 text-rose-300" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-rose-100">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <div className="h-28 w-28 overflow-hidden rounded-full border-2 border-white/20 bg-white/10 shadow-lg transition-transform group-hover:scale-105">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar preview" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500/90 to-cyan-500/80">
                      <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-white/95 p-2 text-slate-900 shadow-lg transition-all hover:scale-110 hover:bg-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-sm text-white/60">Upload your profile photo</p>
              {touched.avatar && validationErrors.avatar && (
                <p className="text-sm text-rose-300">{validationErrors.avatar}</p>
              )}
            </div>

              {/* Name Fields in Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-white/80">
                    First Name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="John"
                    className={getFieldClass('firstName')}
                    required
                  />
                  {touched.firstName && validationErrors.firstName && (
                    <p className="mt-2 text-sm text-rose-300">{validationErrors.firstName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-white/80">
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Doe"
                    className={getFieldClass('lastName')}
                    required
                  />
                  {touched.lastName && validationErrors.lastName && (
                    <p className="mt-2 text-sm text-rose-300">{validationErrors.lastName}</p>
                  )}
                </div>
            </div>

            {/* Email */}
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
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="john@example.com"
                className={getFieldClass('email', 'pl-10')}
                required
              />
              {touched.email && validationErrors.email && (
                <p className="mt-2 text-sm text-rose-300">{validationErrors.email}</p>
              )}
            </div>

            {/* Password */}
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
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="********"
                className={getFieldClass('password', 'pl-10 pr-16')}
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
              {touched.password && validationErrors.password && (
                <p className="mt-2 text-sm text-rose-300">{validationErrors.password}</p>
              )}
            </div>
            <div><br /></div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 py-3 font-semibold text-slate-950 transition-all hover:scale-[1.01] hover:from-violet-400 hover:to-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/15"></div>
                </div>
                <div><br /><br /></div>
                <div className="relative flex justify-center text-sm">
                  
                  <span className="bg-slate-950/0 px-4 text-white/60">Already have an account?</span>
                </div>
              </div>

              {/* Login Link */}
              <div className="text-center">
                <Link 
                  to="/login" 
                  className="font-semibold text-cyan-200 transition-colors hover:text-cyan-100 hover:underline"
                >
                  Sign in instead
                </Link>
              </div>
            </>
          )}

              <p className="mt-6 text-center text-sm text-white/50">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
