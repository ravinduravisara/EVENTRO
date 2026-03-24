import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User, Mail, Shield, Calendar, Pencil, Plus, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', avatar: '' });
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setProfileUser(user);
  }, [user]);

  useEffect(() => {
    if (!user?._id) return;

    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        setProfileUser(data);

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          localStorage.setItem('user', JSON.stringify({ ...parsedUser, ...data }));
        }
      } catch {
        setProfileUser(user);
      }
    };

    fetchProfile();
  }, [user]);

  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <User className="h-16 w-16 mx-auto text-slate-600" />
          <p className="text-slate-400 text-lg">Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  const fullName = [profileUser?.firstName, profileUser?.lastName].filter(Boolean).join(' ').trim() || profileUser?.name || 'User';
  const avatarLetter = fullName.charAt(0).toUpperCase();

  const avatarSrc = (() => {
    const rawAvatar = profileUser?.avatar || profileUser?.avatarUrl || profileUser?.photo || profileUser?.image || '';
    if (!rawAvatar || typeof rawAvatar !== 'string') return '';
    if (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('data:')) {
      return rawAvatar;
    }
    if (rawAvatar.startsWith('/')) return rawAvatar;
    return `/${rawAvatar}`;
  })();

  const infoItems = [
    { icon: Mail,     label: 'Email',     value: profileUser?.email },
    { icon: Shield,   label: 'Role',      value: profileUser?.role },
    { icon: Calendar, label: 'Joined',    value: profileUser?.createdAt ? new Date(profileUser.createdAt).toLocaleDateString() : null },
  ].filter((i) => i.value);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const openEdit = () => {
    setSaveError('');
    setEditForm({
      firstName: profileUser?.firstName || '',
      lastName: profileUser?.lastName || '',
      avatar: profileUser?.avatar || '',
    });
    setIsEditing(true);
  };

  const closeEdit = () => {
    if (saving) return;
    setIsEditing(false);
    setSaveError('');
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveProfile = async (e) => {
    e?.preventDefault?.();
    if (!user?._id) return;

    setSaving(true);
    setSaveError('');
    try {
      const payload = {
        firstName: String(editForm.firstName || '').trim(),
        lastName: String(editForm.lastName || '').trim(),
        avatar: String(editForm.avatar || '').trim(),
      };

      if (!payload.firstName || !payload.lastName) {
        setSaveError('First name and last name are required.');
        return;
      }

      const { data } = await api.put('/users/profile', payload);
      setProfileUser(data);

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const merged = { ...parsedUser, ...data };
        localStorage.setItem('user', JSON.stringify(merged));
        updateUser?.(merged);
      } else {
        updateUser?.(data);
      }

      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      {/* Profile card */}
      <div className="rounded-2xl border border-white/[0.06] bg-[#141B2D] overflow-hidden">
        {/* Banner */}
        <div className="relative h-36 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
        </div>

        {/* Avatar + Name */}
        <div className="relative px-8 pb-8">
          <div className="-mt-16 flex flex-col items-center sm:flex-row sm:items-end sm:gap-6">
            {/* Avatar */}
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="User profile"
                className="h-32 w-32 shrink-0 rounded-2xl border-4 border-[#141B2D] object-cover shadow-xl"
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />
            ) : (
              <div className="grid h-32 w-32 shrink-0 place-items-center rounded-2xl border-4 border-[#141B2D] bg-gradient-to-br from-indigo-500 to-purple-600 text-5xl font-bold text-white shadow-xl">
                {avatarLetter}
              </div>
            )}

            {/* Name + role */}
            <div className="mt-4 text-center sm:mt-0 sm:pb-1 sm:text-left">
              <h1 className="text-3xl font-bold text-white">{fullName}</h1>
              {profileUser?.role && (
                <span className="mt-1 inline-block rounded-full bg-indigo-500/15 px-3 py-0.5 text-sm font-medium capitalize text-indigo-400">
                  {profileUser.role}
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={openEdit}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </button>
            <button
              onClick={() => navigate('/events/create')}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10"
            >
              <Plus className="h-4 w-4" />
              Add Event
            </button>
            <button
              onClick={handleLogout}
              className="ml-auto flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Info section */}
      {infoItems.length > 0 && (
        <div className="mt-4 rounded-2xl border border-white/[0.06] bg-[#141B2D] p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Account Details</h2>
          <div className="divide-y divide-white/[0.06]">
            {infoItems.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-4 py-3.5">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/5">
                  <Icon className="h-4 w-4 text-slate-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="truncate text-sm font-medium capitalize text-slate-200">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="absolute inset-0 bg-black/60" onClick={closeEdit} />

          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Edit profile</h3>
              <button
                onClick={closeEdit}
                className="rounded-lg px-2 py-1 text-white/60 hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={saveProfile} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">First name</label>
                  <input
                    name="firstName"
                    value={editForm.firstName}
                    onChange={onEditChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none"
                    placeholder="First name"
                    autoComplete="given-name"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Last name</label>
                  <input
                    name="lastName"
                    value={editForm.lastName}
                    onChange={onEditChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none"
                    placeholder="Last name"
                    autoComplete="family-name"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">Avatar URL (optional)</label>
                <input
                  name="avatar"
                  value={editForm.avatar}
                  onChange={onEditChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none"
                  placeholder="https://..."
                  autoComplete="url"
                />
                <p className="mt-1 text-xs text-white/40">Tip: paste a direct image URL.</p>
              </div>

              {saveError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {saveError}
                </div>
              )}

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closeEdit}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                  disabled={saving}
                >
                  {saving ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
