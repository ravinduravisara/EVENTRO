import { useState, useEffect } from 'react';
import { Ticket, Search, Filter, Download, Eye, XCircle, CheckCircle } from 'lucide-react';
import api from '../../services/api';

const AdminTickets = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refundActionId, setRefundActionId] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings');
        const data = res.data?.bookings || res.data || [];
        setBookings(Array.isArray(data) ? data : []);
      } catch {
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      const data = res.data?.bookings || res.data || [];
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      setBookings([]);
    }
  };

  const reviewRefund = async (bookingId, decision) => {
    try {
      setRefundActionId(`${bookingId}:${decision}`);
      await api.patch(`/bookings/${bookingId}/refund-request`, { decision });
      await fetchBookings();
    } finally {
      setRefundActionId(null);
    }
  };

  const filtered = bookings.filter((b) => {
    const matchSearch =
      (b.event?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.user?.firstName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusColor = (s) => {
    if (s === 'confirmed') return 'bg-emerald-500/15 text-emerald-400';
    if (s === 'cancelled') return 'bg-red-500/15 text-red-400';
    if (s === 'used') return 'bg-sky-500/15 text-sky-400';
    return 'bg-slate-500/15 text-slate-400';
  };

  const stats = {
    total: bookings.reduce((s, b) => s + (b.ticketCount || 1), 0),
    confirmed: bookings.filter((b) => b.status === 'confirmed').reduce((s, b) => s + (b.ticketCount || 1), 0),
    cancelled: bookings.filter((b) => b.status === 'cancelled').reduce((s, b) => s + (b.ticketCount || 1), 0),
    used: bookings.filter((b) => b.status === 'used').reduce((s, b) => s + (b.ticketCount || 1), 0),
    revenue: bookings.reduce((s, b) => s + (b.totalPrice || 0), 0),
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
        <h1 className="text-2xl font-bold">Tickets</h1>
        <p className="text-slate-400 text-sm mt-1">Manage all ticket bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total Tickets', value: stats.total, color: 'text-white' },
          { label: 'Confirmed', value: stats.confirmed, color: 'text-emerald-400' },
          { label: 'Used', value: stats.used, color: 'text-sky-400' },
          { label: 'Cancelled', value: stats.cancelled, color: 'text-red-400' },
          { label: 'Revenue', value: `Rs. ${stats.revenue.toLocaleString()}`, color: 'text-violet-400' },
        ].map((s, i) => (
          <div key={i} className="bg-[#141B2D] rounded-xl p-4 border border-slate-700/40">
            <p className="text-slate-400 text-xs font-medium">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event, user or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#141B2D] border border-slate-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[#141B2D] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="used">Used</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 overflow-hidden">
        {filtered.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 border-b border-slate-700/50">
                  <th className="text-left font-medium px-5 py-3">Ticket ID</th>
                  <th className="text-left font-medium px-5 py-3">Event</th>
                  <th className="text-left font-medium px-5 py-3">Buyer</th>
                  <th className="text-left font-medium px-5 py-3">Qty</th>
                  <th className="text-left font-medium px-5 py-3">Total</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-left font-medium px-5 py-3">Refund</th>
                  <th className="text-left font-medium px-5 py-3">Action</th>
                  <th className="text-left font-medium px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b._id || i} className="border-b border-slate-700/30 last:border-0 hover:bg-slate-800/30 transition">
                    <td className="px-5 py-3 text-slate-300 font-mono text-xs">
                      #{(b._id || '').slice(-6).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-white font-medium">{b.event?.title || '—'}</td>
                    <td className="px-5 py-3 text-slate-400">
                      {b.user?.firstName || b.user?.name || '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-400">{b.ticketCount || 1}</td>
                    <td className="px-5 py-3 text-white font-medium">
                      Rs. {(b.totalPrice || 0).toLocaleString()}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor(b.status)}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-300 capitalize">
                      {b.refundRequestStatus || 'none'}
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {b.refundRequestStatus === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => reviewRefund(b._id, 'approve')}
                            disabled={Boolean(refundActionId)}
                            className="rounded-md bg-emerald-500/15 px-2.5 py-1 font-medium text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
                          >
                            {refundActionId === `${b._id}:approve` ? 'Approving…' : 'Approve'}
                          </button>
                          <button
                            type="button"
                            onClick={() => reviewRefund(b._id, 'reject')}
                            disabled={Boolean(refundActionId)}
                            className="rounded-md bg-red-500/15 px-2.5 py-1 font-medium text-red-300 hover:bg-red-500/25 disabled:opacity-50"
                          >
                            {refundActionId === `${b._id}:reject` ? 'Rejecting…' : 'Reject'}
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {b.createdAt ? new Date(b.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-700/40 flex items-center justify-center mb-3">
              <Ticket size={24} className="text-slate-500" />
            </div>
            <p className="text-slate-500 text-sm">No tickets found</p>
            <p className="text-slate-600 text-xs mt-1">Tickets will appear here once bookings are made</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTickets;
