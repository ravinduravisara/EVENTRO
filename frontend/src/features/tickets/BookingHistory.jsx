import { Link } from 'react-router-dom';
import { Calendar, Ticket, ChevronRight, Inbox } from 'lucide-react';
import useFetch from '../../hooks/useFetch';

const statusStyles = {
  confirmed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border border-red-500/20',
  used:      'bg-sky-500/15 text-sky-400 border border-sky-500/20',
  pending:   'bg-amber-500/15 text-amber-400 border border-amber-500/20',
};

const BookingHistory = () => {
  const { data: bookings, loading, error } = useFetch('/bookings/my');

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
                      {new Date(booking.event?.date).toLocaleDateString()}
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
                {booking.status === 'confirmed' && (
                  <Link
                    to={`/bookings/${booking._id}/ticket`}
                    className="flex shrink-0 items-center gap-1 rounded-lg bg-indigo-500/15 px-4 py-2 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/25"
                  >
                    View Ticket
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
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
    </div>
  );
};

export default BookingHistory;
