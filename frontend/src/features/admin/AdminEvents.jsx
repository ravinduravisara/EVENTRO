import { useState, useEffect, useMemo } from 'react';
import {
  CalendarDays, Search, MapPin, Users, Eye, CheckCircle, XCircle,
  Clock, Trash2, Play, Lock, RotateCcw, ChevronDown, AlertTriangle,
  Ticket, ImageIcon, X,
} from 'lucide-react';
import api from '../../services/api';
import { API_BASE_URL } from '../../services/api';

const STATUS_CFG = {
  draft:     { color: 'bg-slate-500/15 text-slate-400',     icon: Clock },
  pending:   { color: 'bg-amber-500/15 text-amber-400',     icon: Clock },
  approved:  { color: 'bg-blue-500/15 text-blue-400',       icon: CheckCircle },
  rejected:  { color: 'bg-red-500/15 text-red-400',         icon: XCircle },
  live:      { color: 'bg-emerald-500/15 text-emerald-400', icon: Play },
  closed:    { color: 'bg-purple-500/15 text-purple-400',   icon: Lock },
  cancelled: { color: 'bg-red-500/15 text-red-400',         icon: XCircle },
};

const STATUS_TABS = ['all', 'pending', 'approved', 'live', 'closed', 'rejected', 'cancelled'];

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionMsg, setActionMsg] = useState({ text: '', type: 'success' });
  const [selected, setSelected] = useState(null); // event detail modal
  const [selectedLoading, setSelectedLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/events');
      const data = res.data?.events || res.data || [];
      setEvents(Array.isArray(data) ? data : []);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const showMsg = (text, type = 'success') => {
    setActionMsg({ text, type });
    setTimeout(() => setActionMsg({ text: '', type: 'success' }), 3000);
  };

  const openDetails = async (event) => {
    try {
      setSelected(event);
      setSelectedLoading(true);
      const { data } = await api.get(`/events/${event._id}`);
      setSelected(data);
    } catch {
      // Best-effort; keep list data in modal
    } finally {
      setSelectedLoading(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await api.patch(`/events/${id}/status`, { status });
      showMsg(`Event ${status} successfully`);
      fetchEvents();
    } catch {
      showMsg(`Failed to change status to ${status}`, 'error');
    }
  };

  const deleteEvent = async (id) => {
    try {
      await api.delete(`/events/${id}/admin`);
      showMsg('Event deleted');
      setConfirmDelete(null);
      fetchEvents();
    } catch {
      showMsg('Failed to delete event', 'error');
    }
  };

  const filtered = useMemo(() => events.filter((e) => {
    const matchSearch = (e.title || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || e.status === filterStatus;
    return matchSearch && matchStatus;
  }), [events, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const s = { total: events.length };
    STATUS_TABS.slice(1).forEach((st) => {
      s[st] = events.filter((e) => e.status === st).length;
    });
    return s;
  }, [events]);

  const getLowestPrice = (ev) => {
    if (ev.ticketTiers?.length) return Math.min(...ev.ticketTiers.map((t) => t.price));
    return ev.ticketPrice ?? 0;
  };

  const getAvailable = (ev) => {
    if (ev.ticketTiers?.length) return ev.ticketTiers.reduce((s, t) => s + ((t.totalQuantity || 0) - (t.soldQuantity || 0)), 0);
    return ev.availableTickets ?? 0;
  };

  const getTotal = (ev) => {
    if (ev.ticketTiers?.length) return ev.ticketTiers.reduce((s, t) => s + (t.totalQuantity || 0), 0);
    return ev.totalTickets ?? 0;
  };

  /* ── Status action buttons ── */
  const StatusActions = ({ event }) => {
    const st = event.status;
    const btn = (label, icon, status, cls) => (
      <button
        onClick={() => changeStatus(event._id, status)}
        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${cls}`}
      >
        {icon} {label}
      </button>
    );
    return (
      <div className="flex flex-wrap gap-1.5">
        {st === 'pending' && (
          <>
            {btn('Approve', <CheckCircle size={13} />, 'approved', 'bg-emerald-500 hover:bg-emerald-600 text-white')}
            {btn('Reject', <XCircle size={13} />, 'rejected', 'bg-red-500/15 hover:bg-red-500/25 text-red-400')}
          </>
        )}
        {st === 'approved' && btn('Go Live', <Play size={13} />, 'live', 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400')}
        {st === 'live' && btn('Close', <Lock size={13} />, 'closed', 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-400')}
        {(st === 'rejected' || st === 'closed') && btn('Re-open', <RotateCcw size={13} />, 'pending', 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400')}
        {!['cancelled'].includes(st) && btn('Cancel', <XCircle size={13} />, 'cancelled', 'bg-red-500/10 hover:bg-red-500/20 text-red-400')}
        <button
          onClick={() => setConfirmDelete(event)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
        >
          <Trash2 size={13} /> Delete
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Events Management</h1>
        <p className="text-slate-400 text-sm mt-1">Full event lifecycle control — approve, reject, publish, close or delete</p>
      </div>

      {/* Toast */}
      {actionMsg.text && (
        <div className={`px-4 py-3 rounded-xl text-sm border ${
          actionMsg.type === 'error'
            ? 'bg-red-500/15 border-red-500/30 text-red-400'
            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
        }`}>{actionMsg.text}</div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Total', value: stats.total, cls: 'text-white' },
          { label: 'Pending', value: stats.pending, cls: 'text-amber-400' },
          { label: 'Approved', value: stats.approved, cls: 'text-blue-400' },
          { label: 'Live', value: stats.live, cls: 'text-emerald-400' },
          { label: 'Closed', value: stats.closed, cls: 'text-purple-400' },
          { label: 'Rejected', value: stats.rejected, cls: 'text-red-400' },
          { label: 'Cancelled', value: stats.cancelled, cls: 'text-red-400' },
        ].map((s, i) => (
          <div key={i} className="bg-[#141B2D] rounded-xl p-3 border border-slate-700/40 text-center">
            <p className="text-slate-500 text-[10px] font-medium uppercase tracking-wider">{s.label}</p>
            <p className={`text-xl font-bold mt-0.5 ${s.cls}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs + Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {STATUS_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setFilterStatus(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium capitalize transition ${
                filterStatus === t
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                  : 'bg-[#141B2D] text-slate-500 border border-slate-700/40 hover:text-slate-300'
              }`}
            >
              {t} {t !== 'all' && `(${stats[t] || 0})`}
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search events…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141B2D] border border-slate-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
      </div>

      {/* Events List (table-like cards) */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((event) => {
            const cfg = STATUS_CFG[event.status] || STATUS_CFG.draft;
            const Icon = cfg.icon;
            return (
              <div key={event._id} className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-4 hover:border-slate-600/60 transition">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Image thumb */}
                  <div className="relative w-full lg:w-28 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center text-slate-600">
                      <CalendarDays size={24} />
                    </div>
                    <img
                      src={`${API_BASE_URL}/events/${event._id}/image`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white text-sm truncate">{event.title}</h3>
                      <span className={`flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full ${cfg.color}`}>
                        <Icon size={12} /> {event.status}
                      </span>
                      {event.category && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-700/40 text-slate-400">{event.category}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><CalendarDays size={12} />{event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span>
                      <span className="flex items-center gap-1"><MapPin size={12} />{event.location || '—'}</span>
                      <span className="flex items-center gap-1"><Ticket size={12} />Rs. {getLowestPrice(event)} {event.ticketTiers?.length > 1 ? `(${event.ticketTiers.length} tiers)` : ''}</span>
                      <span className="flex items-center gap-1"><Users size={12} />{getAvailable(event)}/{getTotal(event)} seats</span>
                    </div>
                    {/* Tiers mini */}
                    {event.ticketTiers?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {event.ticketTiers.map((t, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {t.name}: Rs. {t.price} ({(t.totalQuantity || 0) - (t.soldQuantity || 0)} left)
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex flex-col gap-2 items-end">
                    <button
                      onClick={() => openDetails(event)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-700/40 hover:bg-slate-700 text-slate-300 transition"
                    >
                      <Eye size={13} /> View
                    </button>
                    <StatusActions event={event} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 py-16 flex flex-col items-center justify-center">
          <CalendarDays size={32} className="text-slate-600 mb-3" />
          <p className="text-slate-500 text-sm">No events match your filter</p>
        </div>
      )}

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="bg-[#0F1629] rounded-2xl border border-slate-700/40 max-w-lg w-full max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-48 overflow-hidden rounded-t-2xl bg-slate-800">
              <div className="absolute inset-0 w-full h-full flex items-center justify-center text-slate-600">
                <ImageIcon size={28} />
              </div>
              <img
                src={`${API_BASE_URL}/events/${selected._id}/image`}
                alt=""
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold text-white">{selected.title}</h2>
                <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-slate-700/40 text-slate-400"><X size={18} /></button>
              </div>
              {selectedLoading ? (
                <p className="text-sm text-slate-500">Loading details…</p>
              ) : (
                <p className="text-sm text-slate-400 leading-relaxed">{selected.description}</p>
              )}
              <div className="grid grid-cols-2 gap-y-2 text-sm">
                <span className="text-slate-500">Status</span>
                <span className={`capitalize font-medium ${(STATUS_CFG[selected.status] || STATUS_CFG.draft).color.split(' ')[1]}`}>{selected.status}</span>
                <span className="text-slate-500">Date</span>
                <span className="text-white">{selected.date ? new Date(selected.date).toLocaleString() : '—'}</span>
                {selected.endDate && <>
                  <span className="text-slate-500">End Date</span>
                  <span className="text-white">{new Date(selected.endDate).toLocaleString()}</span>
                </>}
                <span className="text-slate-500">Location</span>
                <span className="text-white">{selected.location}</span>
                <span className="text-slate-500">Category</span>
                <span className="text-white">{selected.category || '—'}</span>
                <span className="text-slate-500">Organizer</span>
                <span className="text-white">{selected.organizer?.firstName} {selected.organizer?.lastName}</span>
              </div>
              {selected.ticketTiers?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ticket Tiers</h4>
                  <div className="space-y-2">
                    {selected.ticketTiers.map((t, i) => (
                      <div key={i} className="flex items-center justify-between bg-[#141B2D] rounded-lg p-3 text-sm">
                        <span className="text-white font-medium">{t.name}</span>
                        <div className="flex items-center gap-4 text-slate-400">
                          <span>Rs. {t.price}</span>
                          <span>{(t.totalQuantity || 0) - (t.soldQuantity || 0)}/{t.totalQuantity} left</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selected.schedule && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Schedule</h4>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{selected.schedule}</p>
                </div>
              )}
              {selected.rules && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Rules</h4>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{selected.rules}</p>
                </div>
              )}
              <div className="pt-2">
                <StatusActions event={selected} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmDelete(null)}>
          <div className="bg-[#0F1629] rounded-2xl border border-red-500/30 max-w-sm w-full p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">Delete Event?</h3>
            <p className="text-sm text-slate-400 mb-5">This will permanently delete "<span className="text-white">{confirmDelete.title}</span>". This action cannot be undone.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setConfirmDelete(null)} className="px-5 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition">Cancel</button>
              <button onClick={() => deleteEvent(confirmDelete._id)} className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-medium transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvents;
