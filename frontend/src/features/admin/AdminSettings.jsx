import { useEffect, useMemo, useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Check,
} from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'general', label: 'General', icon: Globe },
];

const AdminSettings = () => {
  const { themePreference, setThemePreference } = useTheme();

  const [tab, setTab] = useState('profile');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const storageKey = 'eventro_admin_settings';
  const credentialsStorageKey = 'eventro_admin_credentials';
  const defaultCredentials = { username: 'EVENTRO', password: 'EVENTRO1234' };

  const defaults = useMemo(
    () => ({
      profile: {
        name: 'Alex Rivera',
        email: 'alex@eventro.com',
        role: 'Admin',
      },
      notifications: {
        emailOnBooking: true,
        emailOnNewEvent: true,
        emailOnFeedback: false,
        pushNotifications: true,
      },
      appearance: themePreference ?? 'dark',
      general: {
        language: 'English',
        timezone: 'Asia/Colombo (UTC+5:30)',
      },
    }),
    [themePreference]
  );

  const [profile, setProfile] = useState(defaults.profile);

  const [notifications, setNotifications] = useState(defaults.notifications);

  const [appearance, setAppearance] = useState(defaults.appearance);

  const [general, setGeneral] = useState(defaults.general);

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw);

      if (parsed?.profile) {
        setProfile((previous) => ({ ...previous, ...parsed.profile }));
      }
      if (parsed?.notifications) {
        setNotifications((previous) => ({ ...previous, ...parsed.notifications }));
      }
      if (parsed?.general) {
        setGeneral((previous) => ({ ...previous, ...parsed.general }));
      }
      if (parsed?.appearance) {
        setAppearance(parsed.appearance);
        if (typeof setThemePreference === 'function') {
          setThemePreference(parsed.appearance);
        }
      }
    } catch {
      // ignore invalid stored settings
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // Keep UI in sync with global theme.
    if (themePreference && appearance !== themePreference) {
      setAppearance(themePreference);
    }
    // Only react to external theme changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [themePreference]);

  const handleSave = () => {
    setError('');

    const hasSecurityInput =
      security.currentPassword || security.newPassword || security.confirmNewPassword;

    if (hasSecurityInput) {
      if (!security.currentPassword) {
        setError('Enter your current password to change it.');
        return;
      }
      if (!security.newPassword || !security.confirmNewPassword) {
        setError('Enter and confirm your new password.');
        return;
      }
      if (security.newPassword.length < 8) {
        setError('New password must be at least 8 characters.');
        return;
      }
      if (security.newPassword !== security.confirmNewPassword) {
        setError('New password and confirmation do not match.');
        return;
      }
      if (security.newPassword === security.currentPassword) {
        setError('New password must be different from current password.');
        return;
      }

      // Update stored admin password (used by AdminLogin).
      let currentCredentials = defaultCredentials;
      try {
        const raw = localStorage.getItem(credentialsStorageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed?.username && parsed?.password) {
            currentCredentials = parsed;
          }
        }
      } catch {
        // ignore
      }

      if (security.currentPassword !== currentCredentials.password) {
        setError('Current password is incorrect.');
        return;
      }

      try {
        localStorage.setItem(
          credentialsStorageKey,
          JSON.stringify({ ...currentCredentials, password: security.newPassword })
        );
      } catch {
        setError('Unable to update admin password in this browser.');
        return;
      }

      setSecurity({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    }

    const payload = {
      profile,
      notifications,
      appearance,
      general,
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(payload));
    } catch {
      setError('Unable to save settings in this browser.');
      return;
    }

    if (typeof setThemePreference === 'function') {
      setThemePreference(appearance);
    }

    // Let other admin components refresh immediately (same tab).
    window.dispatchEvent(new Event('eventro_admin_settings_updated'));

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition ${
        checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Manage your preferences</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="bg-white dark:bg-[#141B2D] rounded-2xl border border-slate-200 dark:border-slate-700/40 p-3 space-y-1 h-fit">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50'
                }`}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="xl:col-span-3 bg-white dark:bg-[#141B2D] rounded-2xl border border-slate-200 dark:border-slate-700/40 p-6">
          {tab === 'profile' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Profile Settings</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Role</label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full bg-slate-100 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-700/30 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Notification Preferences</h3>
              <div className="space-y-4 max-w-md">
                {[
                  { key: 'emailOnBooking', label: 'Email on new booking' },
                  { key: 'emailOnNewEvent', label: 'Email on new event submission' },
                  { key: 'emailOnFeedback', label: 'Email on new feedback' },
                  { key: 'pushNotifications', label: 'Push notifications' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item.label}</span>
                    <Toggle
                      checked={notifications[item.key]}
                      onChange={() =>
                        setNotifications({
                          ...notifications,
                          [item.key]: !notifications[item.key],
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'security' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Security</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={security.currentPassword}
                    onChange={(e) =>
                      setSecurity((previous) => ({
                        ...previous,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={security.newPassword}
                    onChange={(e) =>
                      setSecurity((previous) => ({
                        ...previous,
                        newPassword: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={security.confirmNewPassword}
                    onChange={(e) =>
                      setSecurity((previous) => ({
                        ...previous,
                        confirmNewPassword: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  This updates the admin login password for this browser (local demo auth).
                </p>
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">Appearance</h3>
              <div className="flex gap-3">
                {['dark', 'light', 'system'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => {
                      setAppearance(mode);
                      if (typeof setThemePreference === 'function') {
                        setThemePreference(mode);
                      }
                    }}
                    className={`px-5 py-3 rounded-xl text-sm font-medium border transition capitalize ${
                      appearance === mode
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700/50 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'general' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">General</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Language</label>
                  <select
                    value={general.language}
                    onChange={(e) =>
                      setGeneral((previous) => ({ ...previous, language: e.target.value }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="English">English</option>
                    <option value="Sinhala">Sinhala</option>
                    <option value="Tamil">Tamil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-600 dark:text-slate-400 mb-1.5">Timezone</label>
                  <select
                    value={general.timezone}
                    onChange={(e) =>
                      setGeneral((previous) => ({ ...previous, timezone: e.target.value }))
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  >
                    <option value="Asia/Colombo (UTC+5:30)">Asia/Colombo (UTC+5:30)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York (EST)">America/New_York (EST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="mt-6 pt-5 border-t border-slate-700/30">
            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition ${
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
              }`}
            >
              {saved ? <Check size={16} /> : <Save size={16} />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
