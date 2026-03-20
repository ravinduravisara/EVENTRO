import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import api from '../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-red-500 px-4 py-12">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-bold text-white">A</span>
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Login</h1>
              <p className="text-gray-600 text-sm mt-2">Enter your credentials to access the admin panel</p>
            </div>
          </div>

          {/* Demo Credentials Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Note:</span> Use an account with role <b>admin</b> or <b>organizer</b>.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <span className="text-red-600 text-2xl flex-shrink-0">⚠️</span>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email"
              name="email"
              type="email"
              value={credentials.email}
              onChange={handleChange}
              placeholder="admin@example.com"
              required
              disabled={isLoading}
              autoComplete="email"
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter admin password"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold"
            >
              <span>🔐</span>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              This is a secure area. Unauthorized access is prohibited.
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center text-sm text-white">
          <p>🔒 Secure Admin Portal • © 2026 Eventro</p>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;
