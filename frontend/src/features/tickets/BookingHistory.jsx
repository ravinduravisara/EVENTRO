import { Link } from 'react-router-dom';
import { Calendar, Ticket, ChevronRight, Inbox } from 'lucide-react';
import useFetch from '../../hooks/useFetch';
import api from '../../services/api';
import { useState } from 'react';

const statusStyles = {
  confirmed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border border-red-500/20',
  used:      'bg-sky-500/15 text-sky-400 border border-sky-500/20',
  pending:   'bg-amber-500/15 text-amber-400 border border-amber-500/20',
};

const refundStatusStyles = {
  pending: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
  approved: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
  rejected: 'bg-red-500/15 text-red-300 border border-red-500/20',
};

const BookingHistory = () => {
  // Avoid caching so new bookings appear immediately.
  const { data: bookings, loading, error, refetch } = useFetch('/bookings/my', { cache: false });
  const [transferOpenId, setTransferOpenId] = useState(null);
  const [transferEmail, setTransferEmail] = useState('');
  const [transferLoadingId, setTransferLoadingId] = useState(null);
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [refundOpenId, setRefundOpenId] = useState(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundBankDetails, setRefundBankDetails] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    branchName: '',
  });
  const [refundLoadingId, setRefundLoadingId] = useState(null);
  const [refundError, setRefundError] = useState('');
  const [refundSuccess, setRefundSuccess] = useState('');

  const openTransfer = (bookingId) => {
    setTransferSuccess('');
    setTransferError('');
    setTransferEmail('');
    setTransferOpenId((prev) => (prev === bookingId ? null : bookingId));
  };

  const openRefund = (bookingId) => {
    setRefundSuccess('');
    setRefundError('');
    setRefundReason('');
    setRefundBankDetails({
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      branchName: '',
    });
    setRefundOpenId((prev) => (prev === bookingId ? null : bookingId));
  };

  const confirmTransfer = async (bookingId) => {
    const toEmail = String(transferEmail || '').trim();
    if (!toEmail) {
      setTransferError('Recipient email is required.');
      return;
    }

    try {
      setTransferSuccess('');
      setTransferError('');
      setTransferLoadingId(bookingId);
      await api.post(`/bookings/${bookingId}/transfer`, { toEmail });
      await refetch?.();
      setTransferSuccess('Ticket transferred successfully.');
      setTransferOpenId(null);
      setTransferEmail('');
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Transfer failed';
      setTransferError(message);
    } finally {
      setTransferLoadingId(null);
    }
  };

  const submitRefundRequest = async (bookingId) => {
    const bankName = String(refundBankDetails.bankName || '').trim();
    const accountHolderName = String(refundBankDetails.accountHolderName || '').trim();
    const accountNumber = String(refundBankDetails.accountNumber || '').trim();
    const branchName = String(refundBankDetails.branchName || '').trim();

    if (!bankName || !accountHolderName || !accountNumber || !branchName) {
      setRefundError('Please provide your complete bank details for the refund.');
      return;
    }

    try {
      setRefundSuccess('');
      setRefundError('');
      setRefundLoadingId(bookingId);
      await api.post(`/bookings/${bookingId}/refund-request`, {
        reason: String(refundReason || '').trim(),
        bankDetails: {
          bankName,
          accountHolderName,
          accountNumber,
          branchName,
        },
      });
      await refetch?.();
      setRefundSuccess('Refund request submitted. Awaiting admin approval.');
      setRefundOpenId(null);
      setRefundReason('');
      setRefundBankDetails({
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        branchName: '',
      });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Failed to submit refund request';
      setRefundError(message);
    } finally {
      setRefundLoadingId(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );

  if (error)
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
          {error}
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/15">
          <Ticket className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">My Bookings</h1>
          <p className="text-sm text-slate-400">
            {bookings?.length || 0} booking{bookings?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Bookings list */}
      {bookings && bookings.length > 0 ? (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="group rounded-xl border border-white/[0.06] bg-[#141B2D] p-5 transition-all hover:border-indigo-500/30 hover:bg-[#1a2235]"
            >
              <div className="flex items-center justify-between gap-4">
                {/* Left: event info */}
                <div className="min-w-0 flex-1 space-y-2">
                  <h3 className="truncate text-lg font-semibold text-white">
                    {booking.event?.title || 'Untitled Event'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {(booking.createdAt || booking.bookingDate)
                        ? new Date(booking.createdAt || booking.bookingDate).toLocaleDateString('en-GB')
                        : booking.event?.date
                          ? new Date(booking.event.date).toLocaleDateString('en-GB')
                          : 'Date TBA'}
                    </span>
                    {booking.ticketTier && (
                      <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-slate-300">
                        {booking.ticketTier}
                      </span>
                    )}
                    {booking.ticketCount > 1 && (
                      <span className="text-xs text-slate-500">×{booking.ticketCount}</span>
                    )}
                  </div>

                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      statusStyles[booking.status] || statusStyles.pending
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>

                {/* Right: action */}
                <div className="flex shrink-0 items-center gap-2">
                  {booking.status === 'confirmed' && (
                    <button
                      type="button"
                      onClick={() => openTransfer(booking._id)}
                      disabled={transferLoadingId === booking._id}
                      className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Transfer
                    </button>
                  )}

                  {booking.status === 'confirmed' && Number(booking.totalPrice || 0) > 0 && booking.refundRequestStatus !== 'pending' && (
                    <button
                      type="button"
                      onClick={() => openRefund(booking._id)}
                      disabled={refundLoadingId === booking._id}
                      className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Request Refund
                    </button>
                  )}

                  <Link
                    to={`/bookings/${booking._id}/ticket`}
                    state={{ booking }}
                    className="flex items-center gap-1 rounded-lg bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/25"
                  >
                    View Ticket
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {transferOpenId === booking._id && (
                <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/5 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-slate-300">Recipient email</label>
                      <input
                        value={transferEmail}
                        onChange={(e) => setTransferEmail(e.target.value)}
                        placeholder="student@example.com"
                        className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0f1526] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/40 focus:outline-none"
                      />
                      <p className="mt-1 text-xs text-slate-400">Recipient must already have an Eventro account.</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => confirmTransfer(booking._id)}
                        disabled={transferLoadingId === booking._id}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {transferLoadingId === booking._id ? 'Transferring…' : 'Confirm'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransferOpenId(null)}
                        disabled={transferLoadingId === booking._id}
                        className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>

                  {transferError && (
                    <div className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                      {transferError}
                    </div>
                  )}
                  {transferSuccess && (
                    <div className="mt-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                      {transferSuccess}
                    </div>
                  )}
                </div>
              )}

              {booking.refundRequestStatus && booking.refundRequestStatus !== 'none' && (
                <div className="mt-3">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium capitalize ${refundStatusStyles[booking.refundRequestStatus] || refundStatusStyles.pending}`}
                  >
                    Refund {booking.refundRequestStatus}
                  </span>
                  {booking.refundReviewNote && (
                    <p className="mt-2 text-xs text-slate-400">Admin note: {booking.refundReviewNote}</p>
                  )}
                </div>
              )}

              {refundOpenId === booking._id && (
                <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/5 p-4">
                  <label className="block text-xs font-medium text-slate-300">Reason for refund request (optional)</label>
                  <textarea
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    rows={3}
                    placeholder="Tell us why you need a refund..."
                    className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0f1526] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/40 focus:outline-none"
                  />

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-300">Bank Name</label>
                      <input
                        value={refundBankDetails.bankName}
                        onChange={(e) => setRefundBankDetails((prev) => ({ ...prev, bankName: e.target.value }))}
                        placeholder="Bank of Ceylon"
                        className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0f1526] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/40 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300">Account Holder Name</label>
                      <input
                        value={refundBankDetails.accountHolderName}
                        onChange={(e) => setRefundBankDetails((prev) => ({ ...prev, accountHolderName: e.target.value }))}
                        placeholder="Name as per bank account"
                        className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0f1526] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/40 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300">Account Number</label>
                      <input
                        value={refundBankDetails.accountNumber}
                        onChange={(e) => setRefundBankDetails((prev) => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="0123456789"
                        className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0f1526] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/40 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300">Branch Name</label>
                      <input
                        value={refundBankDetails.branchName}
                        onChange={(e) => setRefundBankDetails((prev) => ({ ...prev, branchName: e.target.value }))}
                        placeholder="Colombo Main"
                        className="mt-1 w-full rounded-lg border border-white/[0.08] bg-[#0f1526] px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-indigo-500/40 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => submitRefundRequest(booking._id)}
                      disabled={refundLoadingId === booking._id}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {refundLoadingId === booking._id ? 'Submitting…' : 'Submit Request'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRefundOpenId(null)}
                      disabled={refundLoadingId === booking._id}
                      className="rounded-lg bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.06] bg-[#141B2D] py-20 text-center">
          <Inbox className="mb-4 h-12 w-12 text-slate-600" />
          <p className="text-lg font-medium text-slate-400">No bookings yet</p>
          <p className="mt-1 text-sm text-slate-500">Your confirmed tickets will appear here</p>
          <Link
            to="/events"
            className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500"
          >
            Browse Events
          </Link>
        </div>
      )}

      {refundError && (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {refundError}
        </div>
      )}
      {refundSuccess && (
        <div className="mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          {refundSuccess}
        </div>
      )}
    </div>
  );
};

export default BookingHistory;
