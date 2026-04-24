import { useEffect, useMemo, useState } from 'react';
import { RefreshCcw, Search, Wallet } from 'lucide-react';
import api from '../../services/api';

const refundBadge = {
  none: 'bg-slate-500/15 text-slate-300',
  pending: 'bg-amber-500/15 text-amber-300',
  approved: 'bg-emerald-500/15 text-emerald-300',
  rejected: 'bg-red-500/15 text-red-300',
};

const AdminRefunds = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionKey, setActionKey] = useState('');

  const loadRefunds = async () => {
    try {
      const res = await api.get('/bookings');
      const rows = res.data?.bookings || res.data || [];
      setBookings(Array.isArray(rows) ? rows : []);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRefunds();
  }, []);

  const reviewRefund = async (bookingId, decision) => {
    try {
      setActionKey(`${bookingId}:${decision}`);
      await api.patch(`/bookings/${bookingId}/refund-request`, { decision });
      await loadRefunds();
    } finally {
      setActionKey('');
    }
  };

  const filteredRefunds = useMemo(() => {
    return bookings.filter((item) => {
      const refundStatus = item.refundRequestStatus || 'none';
      const statusOk = statusFilter === 'all' ? refundStatus !== 'none' : refundStatus === statusFilter;

      const query = searchTerm.toLowerCase();
      const text = [
        item.event?.title,
        item.user?.firstName,
        item.user?.lastName,
        item.user?.email,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return statusOk && text.includes(query);
    });
  }, [bookings, searchTerm, statusFilter]);

  const counts = useMemo(
    () => ({
      pending: bookings.filter((b) => b.refundRequestStatus === 'pending').length,
      approved: bookings.filter((b) => b.refundRequestStatus === 'approved').length,
      rejected: bookings.filter((b) => b.refundRequestStatus === 'rejected').length,
    }),
    [bookings],
  );

  if (loading) {
    return (
      <div className="flex h-[55vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Refund Requests</h1>
        <p className="mt-1 text-sm text-slate-400">Review and approve or reject user refund requests.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Pending" value={counts.pending} tone="text-amber-300" />
        <StatCard label="Approved" value={counts.approved} tone="text-emerald-300" />
        <StatCard label="Rejected" value={counts.rejected} tone="text-red-300" />
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by event or user"
            className="w-full rounded-xl border border-slate-700/50 bg-[#141B2D] py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-slate-700/50 bg-[#141B2D] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="all">All</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700/40 bg-[#141B2D]">
        {filteredRefunds.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Wallet className="mx-auto mb-3 h-10 w-10 text-slate-500" />
            No refund requests found for the selected filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700/40 text-left text-slate-400">
                  <th className="px-5 py-3 font-medium">Event</th>
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium">Bank Details</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRefunds.map((item) => {
                  const status = item.refundRequestStatus || 'none';
                  const pending = status === 'pending';
                  return (
                    <tr key={item._id} className="border-b border-slate-700/30 last:border-0">
                      <td className="px-5 py-3 text-white">{item.event?.title || '—'}</td>
                      <td className="px-5 py-3 text-slate-300">
                        <div>{[item.user?.firstName, item.user?.lastName].filter(Boolean).join(' ') || '—'}</div>
                        <div className="text-xs text-slate-500">{item.user?.email || '—'}</div>
                      </td>
                      <td className="px-5 py-3 text-white">Rs. {Number(item.totalPrice || 0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-slate-400">{item.refundReason || '—'}</td>
                      <td className="px-5 py-3 text-xs text-slate-300">
                        {item.refundBankDetails?.bankName ? (
                          <div className="space-y-1">
                            <p>{item.refundBankDetails.bankName}</p>
                            <p className="text-slate-400">{item.refundBankDetails.accountHolderName}</p>
                            <p className="font-mono text-slate-200">{item.refundBankDetails.accountNumber}</p>
                            <p className="text-slate-500">{item.refundBankDetails.branchName}</p>
                          </div>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${refundBadge[status] || refundBadge.none}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {pending ? (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={Boolean(actionKey)}
                              onClick={() => reviewRefund(item._id, 'approve')}
                              className="rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50"
                            >
                              {actionKey === `${item._id}:approve` ? 'Approving...' : 'Approve'}
                            </button>
                            <button
                              type="button"
                              disabled={Boolean(actionKey)}
                              onClick={() => reviewRefund(item._id, 'reject')}
                              className="rounded-lg bg-red-500/15 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/25 disabled:opacity-50"
                            >
                              {actionKey === `${item._id}:reject` ? 'Rejecting...' : 'Reject'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500">No action</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, tone }) => (
  <div className="rounded-xl border border-slate-700/40 bg-[#141B2D] p-4">
    <p className="text-xs text-slate-400">{label}</p>
    <p className={`mt-1 text-2xl font-bold ${tone}`}>{value}</p>
  </div>
);

export default AdminRefunds;