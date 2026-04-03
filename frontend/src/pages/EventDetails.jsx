import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Clock, Users, Ticket, Tag, User,
  AlertCircle, RefreshCw, ArrowLeft, CalendarDays, FileText,
} from 'lucide-react';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';

const STATUS_BADGE = {
  draft:     'bg-slate-500/15 text-slate-400',
  pending:   'bg-amber-500/15 text-amber-400',
  approved:  'bg-blue-500/15 text-blue-400',
  live:      'bg-emerald-500/15 text-emerald-400',
  closed:    'bg-red-500/15 text-red-400',
  cancelled: 'bg-red-500/15 text-red-400',
  rejected:  'bg-red-500/15 text-red-400',
};

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: event, loading, error, refetch } = useFetch(`/events/${id}`);
  const { user } = useAuth();

  const [selectedTier, setSelectedTier] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [redirectingToPayment, setRedirectingToPayment] = useState(false);
  const [bookError, setBookError] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [imgFailed, setImgFailed] = useState(false);

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

  if (!event)
    return <p className="text-center py-20 text-slate-400">Event not found.</p>;

  const tiers = event.ticketTiers || [];
  const hasTiers = tiers.length > 0;
  const totalSeats = hasTiers ? tiers.reduce((s, t) => s + (t.totalQuantity || 0), 0) : (event.totalTickets || 0);
  const availSeats = hasTiers ? tiers.reduce((s, t) => s + ((t.totalQuantity || 0) - (t.soldQuantity || 0)), 0) : (event.availableTickets || 0);
  const deadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();
  const canBook = event.status === 'approved' || event.status === 'live';

  const handleBook = () => {
    if (!canBook) return;
    if (hasTiers && selectedTier === null) return setBookError('Select a ticket tier');

    const selectedTicketTier = hasTiers ? tiers[selectedTier] : null;
    const selectedTierAvailability = selectedTicketTier ? tierAvail(selectedTicketTier) : availSeats;

    if (selectedTierAvailability <= 0) {
      setBookError('Selected ticket tier is sold out');
      return;
    }

    if (ticketCount > selectedTierAvailability) {
      setBookError(`Only ${selectedTierAvailability} ticket${selectedTierAvailability === 1 ? '' : 's'} left for this selection`);
      return;
    }

    if (!user) {
      setBookError('Please login to book tickets');
      navigate('/login', { state: { from: location.pathname }, replace: true });
      return;
    }

    setRedirectingToPayment(true);
    setBookError('');

    const searchParams = new URLSearchParams({
      ticketCount: String(ticketCount),
    });

    if (selectedTier !== null) {
      searchParams.set('tier', String(selectedTier));
    }

    if (whatsappNumber.trim()) {
      searchParams.set('whatsapp', whatsappNumber.trim());
    }

    navigate(`/events/${event._id}/payment?${searchParams.toString()}`);
  };

  const tierAvail = (t) => (t.totalQuantity || 0) - (t.soldQuantity || 0);

  const imageVersion = event.updatedAt ? new Date(event.updatedAt).getTime() : null;
  const eventImageSrc = imageVersion
    ? `${API_BASE_URL}/events/${event._id}/image?v=${imageVersion}`
    : `${API_BASE_URL}/events/${event._id}/image`;

  return (
    <div className="mx-auto max-w-4xl">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to events
      </button>

      {/* Hero image */}
      <div className="rounded-2xl overflow-hidden bg-slate-800 mb-8">
        {event.image && !imgFailed ? (
          <img
            src={eventImageSrc}
            alt={event.title}
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
            className="w-full h-64 sm:h-80 object-cover"
          />
        ) : (
          <div className="w-full h-64 sm:h-80 flex items-center justify-center text-slate-600">
            <CalendarDays className="w-16 h-16" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── LEFT: Details ── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title & status */}
          <div>
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="text-3xl font-bold text-white">{event.title}</h1>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${STATUS_BADGE[event.status] || STATUS_BADGE.draft}`}>
                {event.status}
              </span>
            </div>
            {event.category && (
              <span className="inline-flex items-center gap-1 text-sm text-indigo-400">
                <Tag className="w-3.5 h-3.5" /> {event.category}
              </span>
            )}
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-[#141B2D] rounded-xl p-4 border border-slate-700/40">
              <Calendar className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Date & Time</p>
                <p className="text-sm text-white">{new Date(event.date).toLocaleString()}</p>
                {event.endDate && <p className="text-xs text-slate-400">to {new Date(event.endDate).toLocaleString()}</p>}
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#141B2D] rounded-xl p-4 border border-slate-700/40">
              <MapPin className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm text-white">{event.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-[#141B2D] rounded-xl p-4 border border-slate-700/40">
              <Users className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-500">Seats</p>
                <p className="text-sm text-white">{availSeats} / {totalSeats} available</p>
              </div>
            </div>
            {event.organizer && (
              <div className="flex items-center gap-3 bg-[#141B2D] rounded-xl p-4 border border-slate-700/40">
                <User className="w-5 h-5 text-pink-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500">Organizer</p>
                  <p className="text-sm text-white">{event.organizer.firstName} {event.organizer.lastName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-6">
            <h2 className="text-lg font-semibold text-white mb-3">About this Event</h2>
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Schedule */}
          {event.schedule && (
            <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-400" /> Schedule
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{event.schedule}</p>
            </div>
          )}

          {/* Rules */}
          {event.rules && (
            <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-6">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Rules & Guidelines
              </h2>
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{event.rules}</p>
            </div>
          )}
        </div>

        {/* ── RIGHT: Booking sidebar ── */}
        <div className="space-y-5">
          {/* Ticket tiers */}
          {hasTiers && (
            <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-5 space-y-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Ticket className="w-4 h-4 text-indigo-400" /> Select Ticket
              </h3>
              {tiers.map((tier, i) => {
                const avail = tierAvail(tier);
                const soldOut = avail <= 0;
                return (
                  <button
                    key={i}
                    disabled={soldOut || !canBook}
                    onClick={() => setSelectedTier(i)}
                    className={`w-full text-left p-3 rounded-xl border transition ${
                      selectedTier === i
                        ? 'border-indigo-500 bg-indigo-500/10'
                        : soldOut
                        ? 'border-slate-700/40 bg-slate-800/40 opacity-50 cursor-not-allowed'
                        : 'border-slate-700/40 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-white">{tier.name}</span>
                      <span className="text-sm font-bold text-indigo-400">
                        {tier.price === 0 ? 'Free' : `Rs. ${tier.price.toLocaleString()}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {soldOut ? 'Sold out' : `${avail} seat${avail !== 1 ? 's' : ''} left`}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          {/* Quantity + Book */}
          <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-5 space-y-4">
            {/* Price summary */}
            {!hasTiers && (
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  {(event.ticketPrice || 0) === 0 ? 'Free' : `Rs. ${(event.ticketPrice || 0).toLocaleString()}`}
                </p>
                <p className="text-xs text-slate-500">per ticket</p>
              </div>
            )}

            {hasTiers && selectedTier !== null && (
              <div className="text-center">
                <p className="text-2xl font-bold text-white">
                  Rs. {(tiers[selectedTier].price * ticketCount).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500">{tiers[selectedTier].name} × {ticketCount}</p>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-xs text-slate-500 block mb-1">Tickets</label>
              <div className="flex items-center gap-3">
                <button onClick={() => setTicketCount(Math.max(1, ticketCount - 1))} className="w-9 h-9 rounded-lg bg-[#0B1120] border border-slate-700/50 text-white flex items-center justify-center hover:bg-slate-700/50 transition">−</button>
                <span className="text-lg font-bold text-white w-8 text-center">{ticketCount}</span>
                <button onClick={() => setTicketCount(ticketCount + 1)} className="w-9 h-9 rounded-lg bg-[#0B1120] border border-slate-700/50 text-white flex items-center justify-center hover:bg-slate-700/50 transition">+</button>
              </div>
            </div>

            {/* WhatsApp (optional) */}
            <div>
              <label className="text-xs text-slate-500 block mb-1">WhatsApp number (optional)</label>
              <input
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="+94XXXXXXXXX"
                className="w-full rounded-xl bg-[#0B1120] border border-slate-700/50 px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
              <p className="mt-1 text-[11px] text-slate-500">Used only for ticket delivery (if enabled).</p>
            </div>

            {/* Deadline warning */}
            {deadlinePassed && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" /> Registration deadline has passed
              </p>
            )}

            {event.registrationDeadline && !deadlinePassed && (
              <p className="text-xs text-amber-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Deadline: {new Date(event.registrationDeadline).toLocaleString()}
              </p>
            )}

            {bookError && <p className="text-xs text-red-400">{bookError}</p>}

            <button
              onClick={handleBook}
              disabled={redirectingToPayment || deadlinePassed || !canBook || availSeats === 0}
              className="w-full py-3 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed bg-indigo-500 hover:bg-indigo-600 text-white"
            >
              {redirectingToPayment ? (
                <>
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Opening checkout…
                </>
              ) : availSeats === 0 ? 'Sold Out' : deadlinePassed ? 'Registration Closed' : !canBook ? 'Not Available' : (
                'Book Now'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
