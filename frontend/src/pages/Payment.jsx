import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  createSavedCardRecord,
  formatCardNumber,
  formatExpiry,
  getCardExpiryLabel,
  getMaskedCardNumber,
} from '../utils/paymentCards';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [searchParams] = useSearchParams();
  const { data: event, loading, error } = useFetch(id ? `/events/${id}` : null);
  const { data: profile, loading: profileLoading } = useFetch('/users/profile', { cache: false });

  const [paymentMethod, setPaymentMethod] = useState('new');
  const [selectedSavedCardId, setSelectedSavedCardId] = useState('');
  const [saveCardForFuture, setSaveCardForFuture] = useState(false);
  const [bankName, setBankName] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [processing, setProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const savedCards = Array.isArray(profile?.paymentCards) ? profile.paymentCards : [];

  useEffect(() => {
    if (!savedCards.length) {
      setPaymentMethod('new');
      setSelectedSavedCardId('');
      return;
    }

    if (!selectedSavedCardId || !savedCards.some((card) => card._id === selectedSavedCardId)) {
      const defaultCard = savedCards.find((card) => card.isDefault) || savedCards[0];
      setSelectedSavedCardId(defaultCard?._id || '');
    }
  }, [savedCards, selectedSavedCardId]);

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/30 border-t-indigo-500" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-300">
          {error || 'Event not found.'}
        </div>
      </div>
    );
  }

  const tiers = event.ticketTiers || [];
  const hasTiers = tiers.length > 0;
  const tierParam = searchParams.get('tier');
  const parsedTierIndex = tierParam === null ? null : Number.parseInt(tierParam, 10);
  const selectedTier = Number.isInteger(parsedTierIndex) ? tiers[parsedTierIndex] : null;
  const requestedTicketCount = Number.parseInt(searchParams.get('ticketCount') || '1', 10);
  const ticketCount = Number.isInteger(requestedTicketCount) && requestedTicketCount > 0 ? requestedTicketCount : 1;
  const whatsappNumber = (searchParams.get('whatsapp') || '').trim();
  const unitPrice = selectedTier ? selectedTier.price || 0 : event.ticketPrice || 0;
  const totalPrice = unitPrice * ticketCount;
  const availableTickets = selectedTier
    ? Math.max((selectedTier.totalQuantity || 0) - (selectedTier.soldQuantity || 0), 0)
    : Math.max(event.availableTickets || 0, 0);
  const registrationClosed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();
  const canBook = event.status === 'approved' || event.status === 'live';
  const hasValidTierSelection = !hasTiers || (selectedTier && parsedTierIndex !== null);
  const usingSavedCard = totalPrice > 0 && paymentMethod === 'saved' && savedCards.length > 0;
  const activeSavedCard = usingSavedCard
    ? savedCards.find((card) => card._id === selectedSavedCardId) || null
    : null;
  const hasSelectablePaymentMethod = totalPrice === 0 || !usingSavedCard || Boolean(activeSavedCard);
  const canProceed =
    canBook &&
    !registrationClosed &&
    hasValidTierSelection &&
    availableTickets > 0 &&
    ticketCount <= availableTickets &&
    hasSelectablePaymentMethod;

  const syncUserProfile = (data) => {
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

  const handleConfirmPayment = async (eventObj) => {
    eventObj.preventDefault();
    setPaymentError('');

    if (!canProceed) {
      setPaymentError('This booking can no longer be completed. Please review the event availability again.');
      return;
    }

    if (totalPrice > 0) {
      if (usingSavedCard) {
        if (!activeSavedCard) {
          setPaymentError('Select one saved card to continue.');
          return;
        }
      } else {
        if (!String(bankName || '').trim()) {
          setPaymentError('Bank name is required.');
          return;
        }
        if (!cardholderName.trim()) {
          setPaymentError('Cardholder name is required.');
          return;
        }
        if (cardNumber.replace(/\s/g, '').length !== 16) {
          setPaymentError('Enter a valid 16-digit card number.');
          return;
        }
        if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
          setPaymentError('Enter the expiry date as MM/YY.');
          return;
        }
      }

    }

    const payload = {
      event: event._id,
      ticketCount,
      totalPrice,
    };

    if (selectedTier) payload.tierName = selectedTier.name;
    if (whatsappNumber) payload.whatsappNumber = whatsappNumber;

    try {
      setProcessing(true);
      const response = await api.post('/bookings', payload);
      const booking = response.data?.booking || response.data;
      let cardSaveWarning = '';

      if (totalPrice > 0 && saveCardForFuture && !usingSavedCard) {
        const nextCards = [
          ...savedCards,
          createSavedCardRecord({
            bankName,
            cardholderName,
            cardNumber,
            expiryDate,
            isDefault: savedCards.length === 0,
          }),
        ];

        try {
          const profileResponse = await api.put('/users/profile', { paymentCards: nextCards });
          syncUserProfile(profileResponse.data);
        } catch (saveErr) {
          cardSaveWarning = saveErr.response?.data?.message || 'Payment completed, but the card could not be saved.';
        }
      }

      if (booking?._id) {
        navigate(`/bookings/${booking._id}/ticket`, {
          replace: true,
          state: { booking, warning: cardSaveWarning },
        });
        return;
      }

      navigate('/bookings', {
        replace: true,
        state: {
          success: 'Payment completed and booking confirmed.',
          warning: cardSaveWarning,
        },
      });
    } catch (err) {
      setPaymentError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <button
        type="button"
        onClick={() => navigate(`/events/${event._id}`)}
        className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to event
      </button>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <form
          onSubmit={handleConfirmPayment}
          className="rounded-3xl border border-slate-700/40 bg-[#141B2D] p-6 shadow-[0_24px_80px_rgba(2,6,23,0.32)]"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Checkout</p>
              <h1 className="mt-2 text-3xl font-bold text-white">Payment Details</h1>
              <p className="mt-2 max-w-xl text-sm text-slate-400">
                Review your booking and confirm the payment to generate your ticket instantly.
              </p>
            </div>
            <div className="hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 sm:block">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Secure checkout
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-700/40 bg-[#0B1120] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Event</p>
              <p className="mt-2 text-lg font-semibold text-white">{event.title}</p>
              <div className="mt-3 space-y-2 text-sm text-slate-400">
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-indigo-300" />
                  {event.date ? new Date(event.date).toLocaleString() : 'Date TBA'}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-indigo-300" />
                  {event.location || 'Location TBA'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/40 bg-[#0B1120] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Booking Summary</p>
              <div className="mt-3 space-y-2 text-sm text-slate-300">
                <p className="flex items-center justify-between gap-3">
                  <span className="flex items-center gap-2 text-slate-400">
                    <Ticket className="h-4 w-4 text-indigo-300" />
                    Ticket type
                  </span>
                  <span>{selectedTier?.name || 'General Admission'}</span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">Quantity</span>
                  <span>{ticketCount}</span>
                </p>
                <p className="flex items-center justify-between gap-3">
                  <span className="text-slate-400">Price per ticket</span>
                  <span>{unitPrice === 0 ? 'Free' : `Rs. ${unitPrice.toLocaleString()}`}</span>
                </p>
                {whatsappNumber && (
                  <p className="flex items-center justify-between gap-3">
                    <span className="text-slate-400">WhatsApp</span>
                    <span>{whatsappNumber}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {totalPrice > 0 ? (
            <div className="space-y-4">
              {savedCards.length > 0 && (
                <div className="rounded-2xl border border-slate-700/40 bg-[#0B1120] p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">Choose one card for this payment</p>
                      <p className="text-xs text-slate-400">Only one saved card can be used per transaction.</p>
                    </div>
                    <div className="inline-flex rounded-xl border border-white/10 bg-white/5 p-1">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('saved')}
                        className={`rounded-lg px-3 py-2 text-sm transition ${paymentMethod === 'saved' ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                      >
                        Saved Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('new')}
                        className={`rounded-lg px-3 py-2 text-sm transition ${paymentMethod === 'new' ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                      >
                        New Card
                      </button>
                    </div>
                  </div>

                  {paymentMethod === 'saved' && (
                    <div className="mt-4 space-y-3">
                      {savedCards.map((card) => (
                        <label
                          key={card._id}
                          className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${selectedSavedCardId === card._id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/5 hover:bg-white/[0.08]'}`}
                        >
                          <input
                            type="radio"
                            name="savedCard"
                            checked={selectedSavedCardId === card._id}
                            onChange={() => setSelectedSavedCardId(card._id)}
                            className="mt-1 h-4 w-4"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-white">{card.bankName}</p>
                              {card.isDefault && (
                                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-slate-300">{card.brand} - {getMaskedCardNumber(card)}</p>
                            <p className="mt-1 text-xs text-slate-500">
                              {card.cardholderName} - Expires {getCardExpiryLabel(card)}
                            </p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {paymentMethod === 'new' && (
                <>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">Bank Name</label>
                    <input
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Bank of Ceylon"
                      className="w-full rounded-2xl border border-slate-700/50 bg-[#0B1120] px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">Cardholder Name</label>
                    <input
                      value={cardholderName}
                      onChange={(e) => setCardholderName(e.target.value)}
                      placeholder="Name on card"
                      className="w-full rounded-2xl border border-slate-700/50 bg-[#0B1120] px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">Card Number</label>
                    <div className="relative">
                      <CreditCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="1234 5678 9012 3456"
                        className="w-full rounded-2xl border border-slate-700/50 bg-[#0B1120] py-3 pl-11 pr-4 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">Expiry Date</label>
                    <input
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      className="w-full rounded-2xl border border-slate-700/50 bg-[#0B1120] px-4 py-3 text-white placeholder:text-slate-500 focus:border-indigo-500/50 focus:outline-none"
                    />
                  </div>

                  <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={saveCardForFuture}
                      onChange={(e) => setSaveCardForFuture(e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    Save this card for future payments
                  </label>
                </>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
              This event is free. Confirm the booking to generate your ticket.
            </div>
          )}

          {!hasValidTierSelection && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Select a valid ticket tier before proceeding to payment.
            </div>
          )}

          {registrationClosed && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Registration for this event has already closed.
            </div>
          )}

          {!registrationClosed && ticketCount > availableTickets && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              Only {availableTickets} ticket{availableTickets === 1 ? '' : 's'} remain for this selection.
            </div>
          )}

          {paymentError && (
            <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {paymentError}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-700/40 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-400">
              <p className="font-medium text-slate-300">Total payable</p>
              <p className="mt-1 text-3xl font-bold text-white">
                {totalPrice === 0 ? 'Free' : `Rs. ${totalPrice.toLocaleString()}`}
              </p>
            </div>

            <button
              type="submit"
              disabled={processing || !canProceed}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {processing ? 'Processing payment...' : totalPrice === 0 ? 'Confirm Booking' : 'Pay Now'}
            </button>
          </div>
        </form>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-slate-700/40 bg-[#141B2D] p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-500/10 p-3 text-indigo-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Why pay here?</h2>
                <p className="text-sm text-slate-400">Your order is reviewed before the booking is finalized.</p>
              </div>
            </div>

            <div className="mt-5 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-slate-700/40 bg-[#0B1120] p-4">
                Tickets are issued immediately after successful confirmation.
              </div>
              <div className="rounded-2xl border border-slate-700/40 bg-[#0B1120] p-4">
                Your QR ticket will be available on the next screen and under My Bookings.
              </div>
              <div className="rounded-2xl border border-slate-700/40 bg-[#0B1120] p-4">
                Seat availability is validated again before the booking is created.
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/40 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.25),_rgba(15,23,42,0.96))] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200/80">Need changes?</p>
            <h2 className="mt-2 text-xl font-semibold text-white">Update your booking selection</h2>
            <p className="mt-2 text-sm text-slate-300">
              Go back to the event page if you need a different ticket type, quantity, or WhatsApp number.
            </p>
            <button
              type="button"
              onClick={() => navigate(`/events/${event._id}`)}
              className="mt-5 inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Edit selection
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Payment;