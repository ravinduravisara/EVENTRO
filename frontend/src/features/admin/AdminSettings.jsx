import { useState } from 'react';
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

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'general', label: 'General', icon: Globe },
];

const AdminSettings = () => {
  const [tab, setTab] = useState('profile');
  const [saved, setSaved] = useState(false);

  const [profile, setProfile] = useState({
    name: 'Alex Rivera',
    email: 'alex@eventro.com',
    role: 'Admin',
  });

  const [notifications, setNotifications] = useState({
    emailOnBooking: true,
    emailOnNewEvent: true,
    emailOnFeedback: false,
    pushNotifications: true,
  });

  const [appearance, setAppearance] = useState('dark');

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition ${
        checked ? 'bg-emerald-500' : 'bg-slate-600'
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
        <p className="text-slate-400 text-sm mt-1">Manage your preferences</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Tabs */}
        <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-3 space-y-1 h-fit">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon size={18} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="xl:col-span-3 bg-[#141B2D] rounded-2xl border border-slate-700/40 p-6">
          {tab === 'profile' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-white text-lg">Profile Settings</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Role</label>
                  <input
                    type="text"
                    value={profile.role}
                    disabled
                    className="w-full bg-slate-800/30 border border-slate-700/30 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-white text-lg">Notification Preferences</h3>
              <div className="space-y-4 max-w-md">
                {[
                  { key: 'emailOnBooking', label: 'Email on new booking' },
                  { key: 'emailOnNewEvent', label: 'Email on new event submission' },
                  { key: 'emailOnFeedback', label: 'Email on new feedback' },
                  { key: 'pushNotifications', label: 'Push notifications' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-300">{item.label}</span>
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
              <h3 className="font-semibold text-white text-lg">Security</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Current Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                  />
                </div>
              </div>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="space-y-5">
              <h3 className="font-semibold text-white text-lg">Appearance</h3>
              <div className="flex gap-3">
                {['dark', 'light', 'system'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setAppearance(mode)}
                    className={`px-5 py-3 rounded-xl text-sm font-medium border transition capitalize ${
                      appearance === mode
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'text-slate-400 border-slate-700/50 hover:text-white hover:bg-slate-700/50'
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
              <h3 className="font-semibold text-white text-lg">General</h3>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Language</label>
                  <select className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                    <option>English</option>
                    <option>Sinhala</option>
                    <option>Tamil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Timezone</label>
                  <select className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40">
                    <option>Asia/Colombo (UTC+5:30)</option>
                    <option>UTC</option>
                    <option>America/New_York (EST)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="mt-6 pt-5 border-t border-slate-700/30">
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
