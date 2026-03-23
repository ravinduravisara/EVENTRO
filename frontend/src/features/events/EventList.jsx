import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Tag, Search, Plus, Users, Clock, Filter,
  CalendarDays, Ticket, AlertCircle, RefreshCw, Pencil, Trash2, X,
} from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const STATUS_BADGE = {
  draft:    'bg-slate-500/15 text-slate-400',
  pending:  'bg-amber-500/15 text-amber-400',
  approved: 'bg-blue-500/15 text-blue-400',
  live:     'bg-emerald-500/15 text-emerald-400',
  closed:   'bg-red-500/15 text-red-400',
  cancelled:'bg-red-500/15 text-red-400',
};

const TABS = ['all', 'upcoming', 'ongoing', 'past'];

const getLowestPrice = (ev) => {
  if (ev.ticketTiers?.length) return Math.min(...ev.ticketTiers.map((t) => t.price));
  return ev.ticketPrice ?? 0;
};

const getTotalSeats = (ev) => {
  if (ev.ticketTiers?.length) return ev.ticketTiers.reduce((s, t) => s + (t.totalQuantity || 0), 0);
  return ev.totalTickets ?? 0;
};

const getAvailableSeats = (ev) => {
  if (ev.ticketTiers?.length)
    return ev.ticketTiers.reduce((s, t) => s + ((t.totalQuantity || 0) - (t.soldQuantity || 0)), 0);
  return ev.availableTickets ?? 0;
};

const EventCard = ({ event, currentUserId, onDelete }) => {
  const navigate = useNavigate();
  const [imgFailed, setImgFailed] = useState(false);
  const now = new Date();
  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : null;
  const isLive = start <= now && (!end || end >= now);
  const isPast = end ? end < now : start < now;
  const available = getAvailableSeats(event);
  const total = getTotalSeats(event);

  const isOwner = currentUserId && (
    event.organizer === currentUserId ||
    event.organizer?._id === currentUserId
  );

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/events/${event._id}/edit`);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(event);
  };

  return (
    <Link
      to={`/events/${event._id}`}
      className="group bg-[#141B2D] rounded-2xl border border-slate-700/40 overflow-hidden hover:border-indigo-500/40 transition-all duration-300 relative"
    >
      {/* Edit / Delete buttons */}
      {isOwner && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/80 text-white backdrop-blur-sm hover:bg-indigo-500 transition"
            title="Edit event"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/80 text-white backdrop-blur-sm hover:bg-red-500 transition"
            title="Delete event"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {/* Image */}
      <div className="relative h-44 bg-slate-800 overflow-hidden">
        {!imgFailed ? (
          <img
            src={`/api/events/${event._id}/image`}
            alt={event.title}
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <CalendarDays className="w-12 h-12" />
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${STATUS_BADGE[event.status] || STATUS_BADGE.draft}`}>
          {event.status || 'draft'}
        </span>
        {/* Category pill */}
        {event.category && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
            {event.category}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <h3 className="text-lg font-semibold text-white truncate group-hover:text-indigo-300 transition">{event.title}</h3>

        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{start.toLocaleDateString()}</span>
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{event.location}</span>
        </div>

        {/* Tiers preview */}
        {event.ticketTiers?.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.ticketTiers.slice(0, 3).map((t, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                {t.name} — Rs. {t.price}
              </span>
            ))}
            {event.ticketTiers.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-lg bg-slate-700/40 text-slate-400">+{event.ticketTiers.length - 3} more</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-700/30">
          <span className="text-sm font-bold text-indigo-400">
            {getLowestPrice(event) === 0 ? 'Free' : `From Rs. ${getLowestPrice(event).toLocaleString()}`}
          </span>
          <span className={`text-xs font-medium ${available === 0 ? 'text-red-400' : 'text-slate-400'}`}>
            <Users className="inline w-3.5 h-3.5 mr-0.5 -mt-0.5" />
            {available === 0 ? 'Sold Out' : `${available}/${total} left`}
          </span>
        </div>
      </div>
    </Link>
  );
};

const EventList = () => {
  const { data, loading, error, refetch } = useFetch('/events');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const events = data?.events || [];

  const categories = useMemo(() => {
    const set = new Set(events.map((e) => e.category).filter(Boolean));
    return [...set].sort();
  }, [events]);

  const filtered = useMemo(() => {
    const now = new Date();
    return events.filter((ev) => {
      // tab filter
      if (tab === 'upcoming' && new Date(ev.date) <= now) return false;
      if (tab === 'ongoing') {
        const s = new Date(ev.date);
        const e = ev.endDate ? new Date(ev.endDate) : null;
        if (s > now || (e && e < now)) return false;
      }
      if (tab === 'past') {
        const e = ev.endDate ? new Date(ev.endDate) : new Date(ev.date);
        if (e >= now) return false;
      }
      // search
      if (search && !ev.title.toLowerCase().includes(search.toLowerCase())) return false;
      // category
      if (catFilter && ev.category !== catFilter) return false;
      // hide draft/rejected for regular users
      if (['draft', 'rejected', 'cancelled'].includes(ev.status)) return false;
      return true;
    });
  }, [events, tab, search, catFilter]);

  /* ── UI ── */
  const inputCls =
    'px-4 py-2.5 bg-[#0B1120] border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-sm';

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <span className="h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );

  if (error)
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={refetch} className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm hover:bg-indigo-600 transition flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> Retry
        </button>
      </div>
    );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Events</h1>
          <p className="text-slate-400 mt-1">{filtered.length} event{filtered.length !== 1 ? 's' : ''} found</p>
        </div>
        <button
          onClick={() => navigate('/events/create')}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-medium transition"
        >
          <Plus className="w-4 h-4" /> Create Event
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition ${
              tab === t
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'bg-[#141B2D] text-slate-500 border border-slate-700/40 hover:text-slate-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Search & filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} pl-10 w-full`}
            placeholder="Search events…"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className={`${inputCls} pl-10 pr-8 appearance-none`}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              currentUserId={user?._id || user?.id}
              onDelete={(ev) => setDeleteTarget(ev)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">
          <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No events found</p>
          <p className="text-sm mt-1">Try adjusting your filters or create a new event</p>
        </div>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#141B2D] p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-red-500/15">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <button onClick={() => setDeleteTarget(null)} className="text-slate-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">Delete Event</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-medium text-white">"{deleteTarget.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setDeleting(true);
                  try {
                    await api.delete(`/events/${deleteTarget._id}`);
                    setDeleteTarget(null);
                    refetch();
                  } catch (err) {
                    alert(err.response?.data?.message || 'Failed to delete event');
                  } finally {
                    setDeleting(false);
                  }
                }}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-sm text-white hover:bg-red-500 transition disabled:opacity-50"
              >
                {deleting ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
