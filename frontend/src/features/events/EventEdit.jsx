import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  X, Plus, Trash2, Calendar, MapPin, Tag, FileText,
  Clock, Ticket, ImageIcon, ChevronDown, AlertCircle, Loader2,
} from 'lucide-react';
import api from '../../services/api';

const CATEGORIES = [
  'Music', 'Tech', 'Sports', 'Business', 'Art', 'Food & Drink',
  'Health', 'Education', 'Community', 'Other',
];

const toLocalDatetime = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
};

const EventEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', date: '', endDate: '',
    registrationDeadline: '', location: '', category: '',
    rules: '', schedule: '', totalTickets: 100,
  });
  const [ticketTiers, setTicketTiers] = useState([
    { name: 'General Admission', price: 0, totalQuantity: 100 },
  ]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImage, setExistingImage] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  /* ── Fetch existing event ── */
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await api.get(`/events/${id}`);
        setForm({
          title: data.title || '',
          description: data.description || '',
          date: toLocalDatetime(data.date),
          endDate: toLocalDatetime(data.endDate),
          registrationDeadline: toLocalDatetime(data.registrationDeadline),
          location: data.location || '',
          category: data.category || '',
          rules: data.rules || '',
          schedule: data.schedule || '',
          totalTickets: data.totalTickets || 100,
        });
        if (data.ticketTiers?.length) {
          setTicketTiers(data.ticketTiers.map((t) => ({
            name: t.name, price: t.price, totalQuantity: t.totalQuantity,
          })));
        }
        if (data.image) {
          setExistingImage(data.image);
          setImagePreview(data.image);
        }
      } catch (err) {
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  /* ── Handlers ── */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be under 5 MB');
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setExistingImage(null);
    setError('');
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setExistingImage(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  /* ticket tier helpers */
  const addTier = () =>
    setTicketTiers([...ticketTiers, { name: '', price: 0, totalQuantity: 50 }]);

  const removeTier = (i) =>
    setTicketTiers(ticketTiers.filter((_, idx) => idx !== i));

  const updateTier = (i, field, value) => {
    const copy = [...ticketTiers];
    copy[i] = { ...copy[i], [field]: value };
    setTicketTiers(copy);
  };

  /* validation */
  const validateStep = () => {
    if (step === 1) {
      if (!form.title.trim()) return 'Title is required';
      if (!form.description.trim()) return 'Description is required';
      if (!form.date) return 'Event date is required';
      if (!form.location.trim()) return 'Location is required';
      if (!form.category) return 'Category is required';
    }
    if (step === 2) {
      for (const t of ticketTiers) {
        if (!t.name.trim()) return 'Every ticket tier needs a name';
        if (t.totalQuantity <= 0) return 'Quantity must be > 0';
      }
    }
    return null;
  };

  const nextStep = () => {
    const err = validateStep();
    if (err) return setError(err);
    setError('');
    setStep(step + 1);
  };

  /* submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateStep();
    if (err) return setError(err);

    setSubmitting(true);
    setError('');

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('date', form.date);
      if (form.endDate) fd.append('endDate', form.endDate);
      if (form.registrationDeadline) fd.append('registrationDeadline', form.registrationDeadline);
      fd.append('location', form.location);
      fd.append('category', form.category);
      if (form.rules) fd.append('rules', form.rules);
      if (form.schedule) fd.append('schedule', form.schedule);

      const total = ticketTiers.reduce((s, t) => s + Number(t.totalQuantity || 0), 0);
      fd.append('totalTickets', total);
      fd.append('availableTickets', total);
      fd.append('ticketTiers', JSON.stringify(ticketTiers));

      if (imageFile) fd.append('image', imageFile);

      await api.put(`/events/${id}`, fd);

      navigate(`/events/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── UI ── */
  const inputCls =
    'w-full px-4 py-3 bg-[#0B1120] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition';
  const labelCls = 'block text-sm font-medium text-slate-300 mb-1.5';

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Event</h1>
        <p className="text-slate-400 mt-1">Update the details of your event</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {['Details', 'Tickets', 'Extras'].map((label, i) => {
          const idx = i + 1;
          const active = step === idx;
          const done = step > idx;
          return (
            <button
              key={label}
              type="button"
              onClick={() => idx < step && setStep(idx)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition ${
                active
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : done
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-[#141B2D] text-slate-500 border border-slate-700/40'
              }`}
            >
              {done ? '✓ ' : `${idx}. `}
              {label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="mb-6 flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ── STEP 1: Details ── */}
        {step === 1 && (
          <div className="space-y-5 bg-[#141B2D] rounded-2xl border border-slate-700/40 p-6">
            {/* Image upload */}
            <div>
              <label className={labelCls}>Event Poster / Image</label>
              {imagePreview ? (
                <div className="relative rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="Preview" className="w-full h-52 object-cover" />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-lg text-white hover:bg-black/80 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-slate-700/50 rounded-xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-indigo-500/40 hover:text-indigo-400 transition"
                >
                  <ImageIcon className="w-8 h-8" />
                  <span className="text-sm">Click to upload (max 5 MB)</span>
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImage}
              />
            </div>

            {/* Title */}
            <div>
              <label className={labelCls}>Event Title *</label>
              <input name="title" value={form.title} onChange={handleChange} className={inputCls} placeholder="e.g. Summer Music Festival" />
            </div>

            {/* Description */}
            <div>
              <label className={labelCls}>Description *</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4} className={inputCls} placeholder="Tell people what your event is about…" />
            </div>

            {/* Date row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  <Calendar className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />Start Date & Time *
                </label>
                <input type="datetime-local" name="date" value={form.date} onChange={handleChange} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>
                  <Clock className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />End Date & Time
                </label>
                <input type="datetime-local" name="endDate" value={form.endDate} onChange={handleChange} className={inputCls} />
              </div>
            </div>

            {/* Registration deadline */}
            <div>
              <label className={labelCls}>Registration Deadline</label>
              <input type="datetime-local" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} className={inputCls} />
            </div>

            {/* Location */}
            <div>
              <label className={labelCls}>
                <MapPin className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />Venue / Location *
              </label>
              <input name="location" value={form.location} onChange={handleChange} className={inputCls} placeholder="e.g. Colombo Exhibition Hall" />
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>
                <Tag className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />Category *
              </label>
              <div className="relative">
                <select name="category" value={form.category} onChange={handleChange} className={`${inputCls} appearance-none pr-10`}>
                  <option value="">Select category…</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button type="button" onClick={nextStep} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium text-sm transition">
                Next: Tickets →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Tickets ── */}
        {step === 2 && (
          <div className="space-y-5 bg-[#141B2D] rounded-2xl border border-slate-700/40 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-indigo-400" /> Ticket Tiers
                </h2>
                <p className="text-sm text-slate-400 mt-0.5">Update ticket types and pricing</p>
              </div>
              <button type="button" onClick={addTier} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/15 text-indigo-400 rounded-xl text-sm font-medium hover:bg-indigo-500/25 transition">
                <Plus className="w-4 h-4" /> Add Tier
              </button>
            </div>

            <div className="space-y-4">
              {ticketTiers.map((tier, i) => (
                <div key={i} className="bg-[#0B1120] rounded-xl border border-slate-700/40 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tier {i + 1}</span>
                    {ticketTiers.length > 1 && (
                      <button type="button" onClick={() => removeTier(i)} className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Tier Name *</label>
                      <input value={tier.name} onChange={(e) => updateTier(i, 'name', e.target.value)} className={inputCls} placeholder="e.g. VIP, General" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Price (Rs.) *</label>
                      <input type="number" min="0" value={tier.price} onChange={(e) => updateTier(i, 'price', e.target.value)} className={inputCls} placeholder="0" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500 mb-1 block">Quantity *</label>
                      <input type="number" min="1" value={tier.totalQuantity} onChange={(e) => updateTier(i, 'totalQuantity', e.target.value)} className={inputCls} placeholder="100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-[#0B1120] rounded-xl border border-slate-700/40 p-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">Total capacity</span>
              <span className="text-lg font-bold text-white">
                {ticketTiers.reduce((s, t) => s + Number(t.totalQuantity || 0), 0)} seats
              </span>
            </div>

            <div className="pt-2 flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-medium text-sm transition">
                ← Back
              </button>
              <button type="button" onClick={nextStep} className="px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium text-sm transition">
                Next: Extras →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Extras ── */}
        {step === 3 && (
          <div className="space-y-5 bg-[#141B2D] rounded-2xl border border-slate-700/40 p-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" /> Schedule & Rules
            </h2>

            <div>
              <label className={labelCls}>Event Schedule</label>
              <textarea name="schedule" value={form.schedule} onChange={handleChange} rows={3} className={inputCls} placeholder="e.g. 9:00 AM - Registration, 10:00 AM - Opening..." />
            </div>

            <div>
              <label className={labelCls}>Event Rules / Guidelines</label>
              <textarea name="rules" value={form.rules} onChange={handleChange} rows={3} className={inputCls} placeholder="e.g. No outside food, Dress code: Smart casual..." />
            </div>

            {/* Review summary */}
            <div className="bg-[#0B1120] rounded-xl border border-slate-700/40 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Review</h3>
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-slate-500">Title</span>
                <span className="text-white truncate">{form.title || '—'}</span>
                <span className="text-slate-500">Date</span>
                <span className="text-white">{form.date ? new Date(form.date).toLocaleString() : '—'}</span>
                <span className="text-slate-500">Location</span>
                <span className="text-white truncate">{form.location || '—'}</span>
                <span className="text-slate-500">Category</span>
                <span className="text-white">{form.category || '—'}</span>
                <span className="text-slate-500">Ticket Tiers</span>
                <span className="text-white">{ticketTiers.length}</span>
                <span className="text-slate-500">Total Seats</span>
                <span className="text-white">{ticketTiers.reduce((s, t) => s + Number(t.totalQuantity || 0), 0)}</span>
                <span className="text-slate-500">Image</span>
                <span className="text-white">{imageFile ? '✓ New image' : existingImage ? '✓ Existing' : 'None'}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="px-5 py-2.5 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl font-medium text-sm transition">
                ← Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default EventEdit;
