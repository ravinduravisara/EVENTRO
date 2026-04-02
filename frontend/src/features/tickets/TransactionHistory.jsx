import { Link } from 'react-router-dom';
import { ArrowUpRight, Calendar, CreditCard, ReceiptText } from 'lucide-react';
import useFetch from '../../hooks/useFetch';

const paymentBadge = {
  paid: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/20',
  free: 'bg-sky-500/15 text-sky-300 border border-sky-500/20',
  refunded: 'bg-amber-500/15 text-amber-300 border border-amber-500/20',
};

const formatLkr = (amount) => `Rs. ${Number(amount || 0).toLocaleString()}`;

const TransactionHistory = () => {
  const { data: bookings, loading, error } = useFetch('/bookings/my', { cache: false });

  const transactions = (Array.isArray(bookings) ? bookings : []).map((booking) => {
    const amount = Number(booking?.totalPrice || 0);
    const isCancelled = booking?.status === 'cancelled';
    const paymentType = isCancelled ? 'refunded' : amount > 0 ? 'paid' : 'free';

    return {
      id: booking?._id,
      eventTitle: booking?.event?.title || 'Untitled Event',
      date: booking?.createdAt || booking?.updatedAt,
      amount,
      ticketCount: Number(booking?.ticketCount || 1),
      bookingStatus: booking?.status || 'confirmed',
      paymentType,
    };
  });

  const totalSpent = transactions
    .filter((item) => item.paymentType === 'paid')
    .reduce((sum, item) => sum + item.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-28">
        <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="mt-1 text-sm text-slate-400">
            Review all your event payment records in one place.
          </p>
        </div>

        <div className="min-w-[220px] rounded-2xl border border-white/10 bg-[#141B2D] p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Total Spent</p>
          <p className="mt-2 text-2xl font-bold text-white">{formatLkr(totalSpent)}</p>
          <p className="mt-1 text-xs text-slate-400">Paid bookings only</p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#141B2D] p-10 text-center">
          <ReceiptText className="mx-auto h-10 w-10 text-slate-500" />
          <p className="mt-4 text-lg font-medium text-slate-300">No transactions yet</p>
          <p className="mt-1 text-sm text-slate-500">Your paid and free booking records will appear here.</p>
          <Link
            to="/events"
            className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500"
          >
            Browse Events
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-[#141B2D] p-5 transition hover:border-indigo-500/40"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-white">{item.eventTitle}</h2>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.date ? new Date(item.date).toLocaleString() : 'Date unavailable'}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CreditCard className="h-3.5 w-3.5" />
                      {item.ticketCount} ticket{item.ticketCount === 1 ? '' : 's'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-base font-semibold text-white">{formatLkr(item.amount)}</span>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${paymentBadge[item.paymentType] || paymentBadge.paid}`}>
                    {item.paymentType}
                  </span>
                  <Link
                    to={`/bookings/${item.id}/ticket`}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-500/15 px-3 py-2 text-xs font-medium text-indigo-300 hover:bg-indigo-500/25"
                  >
                    View Ticket <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;