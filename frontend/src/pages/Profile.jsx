import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { User, Mail, Shield, Calendar, Pencil, Plus, LogOut, CreditCard, Star, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  createSavedCardRecord,
  formatCardNumber,
  formatExpiry,
  getCardExpiryLabel,
  getMaskedCardNumber,
} from '../utils/paymentCards';

const EMPTY_CARD_FORM = {
  bankName: '',
  cardholderName: '',
  cardNumber: '',
  expiryDate: '',
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const [profileUser, setProfileUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ firstName: '', lastName: '', avatar: '' });
  const [editAvatarFile, setEditAvatarFile] = useState(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState('');
  const [preferencesForm, setPreferencesForm] = useState({
    emailNotifications: true,
    marketingEmails: false,
    eventReminders: true,
    preferredLanguage: 'en',
    preferredTheme: 'system',
  });
  const [saveError, setSaveError] = useState('');
  const [preferencesError, setPreferencesError] = useState('');
  const [cardForm, setCardForm] = useState(EMPTY_CARD_FORM);
  const [cardsError, setCardsError] = useState('');
  const [cardsSuccess, setCardsSuccess] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeletingProfile, setIsDeletingProfile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savingPreferences, setSavingPreferences] = useState(false);
  const [savingCards, setSavingCards] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false);

  const syncProfileState = (data) => {
    setProfileUser(data);

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const merged = { ...parsedUser, ...data };
      localStorage.setItem('user', JSON.stringify(merged));
      updateUser?.(merged);
      return;
    }

    updateUser?.(data);
  };

  useEffect(() => {
    setProfileUser(user);
  }, [user]);

  useEffect(() => {
    const prefs = profileUser?.preferences || {};
    setPreferencesForm({
      emailNotifications:
        typeof prefs.emailNotifications === 'boolean' ? prefs.emailNotifications : true,
      marketingEmails:
        typeof prefs.marketingEmails === 'boolean' ? prefs.marketingEmails : false,
      eventReminders: typeof prefs.eventReminders === 'boolean' ? prefs.eventReminders : true,
      preferredLanguage: ['en', 'si', 'ta'].includes(prefs.preferredLanguage)
        ? prefs.preferredLanguage
        : 'en',
      preferredTheme: ['light', 'dark', 'system'].includes(prefs.preferredTheme)
        ? prefs.preferredTheme
        : 'system',
    });
  }, [profileUser]);

  useEffect(() => {
    if (!user?._id) return;

    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        syncProfileState(data);
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
    const rawAvatar = String(
      profileUser?.avatar || profileUser?.avatarUrl || profileUser?.photo || profileUser?.image || ''
    ).trim();
    if (!rawAvatar || typeof rawAvatar !== 'string') return '';
    if (rawAvatar.startsWith('http://') || rawAvatar.startsWith('https://') || rawAvatar.startsWith('data:')) {
      return rawAvatar;
    }
    if (rawAvatar.startsWith('/')) return rawAvatar;
    return `/${rawAvatar}`;
  })();

  useEffect(() => {
    setAvatarLoadFailed(false);
  }, [avatarSrc]);

  const infoItems = [
    { icon: Mail,     label: 'Email',     value: profileUser?.email },
    { icon: Shield,   label: 'Role',      value: profileUser?.role },
    { icon: Calendar, label: 'Joined',    value: profileUser?.createdAt ? new Date(profileUser.createdAt).toLocaleDateString() : null },
  ].filter((i) => i.value);
  const paymentCards = Array.isArray(profileUser?.paymentCards) ? profileUser.paymentCards : [];

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
    setEditAvatarFile(null);
    setEditAvatarPreview('');
    setIsEditing(true);
  };

  const closeEdit = () => {
    if (saving) return;
    setIsEditing(false);
    setSaveError('');
    setEditAvatarFile(null);
    setEditAvatarPreview('');
  };

  const onEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const onAvatarFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setSaveError('');

    if (!file) {
      setEditAvatarFile(null);
      setEditAvatarPreview('');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setSaveError('Please select a valid image file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSaveError('Profile photo must be smaller than 5MB.');
      return;
    }

    setEditAvatarFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatarPreview(String(reader.result || ''));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async (e) => {
    e?.preventDefault?.();
    if (!user?._id) return;

    setSaving(true);
    setSaveError('');
    try {
      const firstName = String(editForm.firstName || '').trim();
      const lastName = String(editForm.lastName || '').trim();
      const avatar = String(editForm.avatar || '').trim();

      if (!firstName || !lastName) {
        setSaveError('First name and last name are required.');
        return;
      }

      const payload = new FormData();
      payload.append('firstName', firstName);
      payload.append('lastName', lastName);
      payload.append('avatarUrl', avatar);

      if (editAvatarFile) {
        payload.append('avatar', editAvatarFile);
      }

      const { data } = await api.put('/users/profile', payload);
      syncProfileState(data);

      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const onPreferenceToggle = (key) => {
    setPreferencesForm((prev) => ({ ...prev, [key]: !prev[key] }));
    setPreferencesError('');
  };

  const onPreferenceSelect = (e) => {
    const { name, value } = e.target;
    setPreferencesForm((prev) => ({ ...prev, [name]: value }));
    setPreferencesError('');
  };

  const savePreferences = async () => {
    if (!user?._id) return;

    setSavingPreferences(true);
    setPreferencesError('');

    try {
      const { data } = await api.put('/users/profile', {
        preferences: preferencesForm,
      });

      syncProfileState(data);
    } catch (err) {
      setPreferencesError(err.response?.data?.message || 'Failed to save preferences.');
    } finally {
      setSavingPreferences(false);
    }
  };

  const onCardFormChange = (e) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === 'cardNumber') nextValue = formatCardNumber(value);
    if (name === 'expiryDate') nextValue = formatExpiry(value);

    setCardForm((prev) => ({ ...prev, [name]: nextValue }));
    setCardsError('');
    setCardsSuccess('');
  };

  const persistPaymentCards = async (nextCards, successMessage) => {
    if (!user?._id) return;

    setSavingCards(true);
    setCardsError('');
    setCardsSuccess('');

    try {
      const { data } = await api.put('/users/profile', {
        paymentCards: nextCards,
      });

      syncProfileState(data);
      setCardsSuccess(successMessage);
    } catch (err) {
      setCardsError(err.response?.data?.message || 'Failed to update saved cards.');
      throw err;
    } finally {
      setSavingCards(false);
    }
  };

  const handleAddCard = async (e) => {
    e.preventDefault();

    const bankName = String(cardForm.bankName || '').trim();
    const cardholderName = String(cardForm.cardholderName || '').trim();
    const cardDigits = String(cardForm.cardNumber || '').replace(/\D/g, '');
    const expiryDate = String(cardForm.expiryDate || '').trim();

    if (!bankName || !cardholderName) {
      setCardsError('Bank name and cardholder name are required.');
      return;
    }

    if (cardDigits.length !== 16) {
      setCardsError('Enter a valid 16-digit card number.');
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      setCardsError('Enter the expiry date as MM/YY.');
      return;
    }

    const nextCards = [
      ...paymentCards,
      createSavedCardRecord({
        bankName,
        cardholderName,
        cardNumber: cardDigits,
        expiryDate,
        isDefault: paymentCards.length === 0,
      }),
    ];

    try {
      await persistPaymentCards(nextCards, 'Card saved successfully.');
      setCardForm(EMPTY_CARD_FORM);
    } catch {
      // Error state is handled in persistPaymentCards.
    }
  };

  const handleSetDefaultCard = async (cardId) => {
    const currentDefault = paymentCards.find((card) => card.isDefault)?._id;
    if (!cardId || currentDefault === cardId) return;

    const nextCards = paymentCards.map((card) => ({
      ...card,
      isDefault: card._id === cardId,
    }));

    try {
      await persistPaymentCards(nextCards, 'Default card updated.');
    } catch {
      // Error state is handled in persistPaymentCards.
    }
  };

  const handleRemoveCard = async (cardId) => {
    const remainingCards = paymentCards.filter((card) => card._id !== cardId);
    const nextCards = remainingCards.map((card, index) => ({
      ...card,
      isDefault: remainingCards.length > 0 && (card.isDefault || index === 0)
        ? index === (remainingCards.findIndex((item) => item.isDefault) === -1 ? 0 : remainingCards.findIndex((item) => item.isDefault))
        : false,
    }));

    try {
      await persistPaymentCards(nextCards, 'Saved card removed.');
    } catch {
      // Error state is handled in persistPaymentCards.
    }
  };

  const onPasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const validatePasswordForm = () => {
    const currentPassword = String(passwordForm.currentPassword || '');
    const newPassword = String(passwordForm.newPassword || '');
    const confirmPassword = String(passwordForm.confirmPassword || '');

    if (!currentPassword || !newPassword || !confirmPassword) {
      return 'All password fields are required.';
    }

    if (newPassword.length < 8) {
      return 'New password must be at least 8 characters long.';
    }

    if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return 'New password must include uppercase, lowercase, and a number.';
    }

    if (newPassword !== confirmPassword) {
      return 'New password and confirm password do not match.';
    }

    if (currentPassword === newPassword) {
      return 'New password must be different from current password.';
    }

    return '';
  };

  const savePassword = async (e) => {
    e.preventDefault();
    if (!user?._id) return;

    const validationMessage = validatePasswordForm();
    if (validationMessage) {
      setPasswordError(validationMessage);
      return;
    }

    setSavingPassword(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      const { data } = await api.put('/users/profile/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      });

      setPasswordSuccess(data?.message || 'Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteProfile = async (e) => {
    e.preventDefault();

    if (!deletePassword) {
      setDeleteError('Please enter your current password.');
      return;
    }

    if (deleteConfirmText !== 'DELETE') {
      setDeleteError('Type DELETE to confirm profile deletion.');
      return;
    }

    setDeleteError('');
    setIsDeletingProfile(true);
    try {
      await api.delete('/users/profile', {
        data: { currentPassword: deletePassword },
      });

      logout();
      navigate('/register', { replace: true });
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete profile.');
    } finally {
      setIsDeletingProfile(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
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
            {avatarSrc && !avatarLoadFailed ? (
              <img
                src={avatarSrc}
                alt="User profile"
                className="h-32 w-32 shrink-0 rounded-2xl border-4 border-[#141B2D] object-cover shadow-xl"
                onError={() => setAvatarLoadFailed(true)}
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

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Info section */}
        {infoItems.length > 0 && (
          <div className="rounded-2xl border border-white/[0.06] bg-[#141B2D] p-6 xl:col-span-1">
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

        <div className="rounded-2xl border border-white/[0.06] bg-[#141B2D] p-6 xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Preferences</h2>

          <div className="space-y-3">
            <PreferenceToggle
              label="Email Notifications"
              description="Receive account and activity notifications by email."
              checked={preferencesForm.emailNotifications}
              onChange={() => onPreferenceToggle('emailNotifications')}
            />
            <PreferenceToggle
              label="Marketing Emails"
              description="Receive promotions, product updates, and offers."
              checked={preferencesForm.marketingEmails}
              onChange={() => onPreferenceToggle('marketingEmails')}
            />
            <PreferenceToggle
              label="Event Reminders"
              description="Get reminder messages before your events start."
              checked={preferencesForm.eventReminders}
              onChange={() => onPreferenceToggle('eventReminders')}
            />
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">Preferred Language</label>
              <select
                name="preferredLanguage"
                value={preferencesForm.preferredLanguage}
                onChange={onPreferenceSelect}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-indigo-500/50 focus:outline-none"
              >
                <option value="en">English</option>
                <option value="si">Sinhala</option>
                <option value="ta">Tamil</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/70">Preferred Theme</label>
              <select
                name="preferredTheme"
                value={preferencesForm.preferredTheme}
                onChange={onPreferenceSelect}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white focus:border-indigo-500/50 focus:outline-none"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          {preferencesError && (
            <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {preferencesError}
            </div>
          )}

          <div className="mt-5 flex justify-end">
            <button
              type="button"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
              disabled={savingPreferences}
              onClick={savePreferences}
            >
              {savingPreferences ? 'Saving preferences…' : 'Save Preferences'}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#141B2D] p-6 xl:col-span-3">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500">Security</h2>

          <form onSubmit={savePassword} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={onPasswordChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none"
                  autoComplete="current-password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={onPasswordChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none"
                  autoComplete="new-password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/70">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={onPasswordChange}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none"
                  autoComplete="new-password"
                />
              </div>
            </div>

            <p className="text-xs text-white/50">
              Password must be at least 8 characters and include uppercase, lowercase, and a number.
            </p>

            {passwordError && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                {passwordSuccess}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                disabled={savingPassword}
              >
                {savingPassword ? 'Updating password…' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-[#141B2D] p-6 xl:col-span-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Saved Cards</h2>
              <p className="mt-2 text-sm text-slate-400">
                Manage multiple bank cards for checkout. Only one saved card can be selected when you pay.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300">
              <CreditCard className="h-3.5 w-3.5" />
              Only masked card details are stored
            </div>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-3">
              {paymentCards.length > 0 ? (
                paymentCards.map((card) => (
                  <div
                    key={card._id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-semibold text-white">{card.bankName}</p>
                          {card.isDefault && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300">
                              <Star className="h-3 w-3" />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-300">{card.brand} · {getMaskedCardNumber(card)}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {card.cardholderName} · Expires {getCardExpiryLabel(card)}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSetDefaultCard(card._id)}
                          disabled={savingCards || card.isDefault}
                          className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Set Default
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveCard(card._id)}
                          disabled={savingCards}
                          className="inline-flex items-center gap-1 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-sm text-slate-400">
                  No saved cards yet. Add one to reuse it during checkout.
                </div>
              )}
            </div>

            <form onSubmit={handleAddCard} className="rounded-2xl border border-white/10 bg-[#0B1120] p-5">
              <h3 className="text-base font-semibold text-white">Add Bank Card</h3>
              <p className="mt-1 text-sm text-slate-400">Store a masked card for faster payment next time.</p>

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Bank Name</label>
                  <input
                    name="bankName"
                    value={cardForm.bankName}
                    onChange={onCardFormChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none"
                    placeholder="Bank of Ceylon"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Cardholder Name</label>
                  <input
                    name="cardholderName"
                    value={cardForm.cardholderName}
                    onChange={onCardFormChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none"
                    placeholder="Name on card"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Card Number</label>
                  <input
                    name="cardNumber"
                    value={cardForm.cardNumber}
                    onChange={onCardFormChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-white/70">Expiry Date</label>
                  <input
                    name="expiryDate"
                    value={cardForm.expiryDate}
                    onChange={onCardFormChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-indigo-500/50 focus:outline-none"
                    placeholder="MM/YY"
                  />
                </div>
              </div>

              {cardsError && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {cardsError}
                </div>
              )}

              {cardsSuccess && (
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                  {cardsSuccess}
                </div>
              )}

              <div className="mt-5 flex justify-end">
                <button
                  type="submit"
                  disabled={savingCards}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
                >
                  {savingCards ? 'Saving card...' : 'Save Card'}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="rounded-2xl border border-red-500/30 bg-red-950/30 p-6 xl:col-span-3">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-red-300">Danger Zone</h2>
          <p className="mb-4 text-sm text-red-200/90">
            Permanently delete your account and profile data. This action cannot be undone.
          </p>

          <form onSubmit={handleDeleteProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-red-100">Current Password</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    setDeleteError('');
                  }}
                  className="w-full rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-2.5 text-white placeholder:text-red-200/50 focus:border-red-300/70 focus:outline-none"
                  autoComplete="current-password"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-red-100">Type DELETE to Confirm</label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => {
                    setDeleteConfirmText(e.target.value);
                    setDeleteError('');
                  }}
                  className="w-full rounded-xl border border-red-400/30 bg-red-950/40 px-4 py-2.5 text-white placeholder:text-red-200/50 focus:border-red-300/70 focus:outline-none"
                  placeholder="DELETE"
                />
              </div>
            </div>

            {deleteError && (
              <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isDeletingProfile}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500 disabled:opacity-60"
              >
                {isDeletingProfile ? 'Deleting profile…' : 'Delete My Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>

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
                  <label className="mb-2 block text-sm font-medium text-white/70">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onAvatarFileChange}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-indigo-500"
                  />
                  {editAvatarPreview && (
                    <img
                      src={editAvatarPreview}
                      alt="Selected profile preview"
                      className="mt-3 h-20 w-20 rounded-xl border border-white/10 object-cover"
                    />
                  )}
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

const PreferenceToggle = ({ label, description, checked, onChange }) => {
  return (
    <label className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="pr-4">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-white/20 bg-white/5 text-indigo-400 focus:ring-indigo-400/60"
      />
    </label>
  );
};

export default Profile;
