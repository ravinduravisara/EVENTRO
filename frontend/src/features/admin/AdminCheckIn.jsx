import { useCallback, useMemo, useState } from 'react';
import { QrCode, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import QRScanner from '../../components/QRScanner';
import api from '../../services/api';

const AdminCheckIn = () => {
  const [lastResult, setLastResult] = useState(null);
  const [checking, setChecking] = useState(false);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  const [scannerKey, setScannerKey] = useState(0);

  const eventId = useMemo(() => lastResult?.booking?.event?._id || null, [lastResult]);

  const fetchStats = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await api.get(`/events/${id}/attendance`);
      setStats(res.data);
    } catch {
      setStats(null);
    }
  }, []);

  const onScanSuccess = useCallback(
    async (decodedText) => {
      setError('');
      setChecking(true);
      setLastResult(null);

      try {
        const res = await api.post('/bookings/validate-qr', { ticketToken: decodedText });
        setLastResult(res.data);
        if (res.data?.valid && res.data?.booking?.event?._id) {
          await fetchStats(res.data.booking.event._id);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Validation failed');
      } finally {
        setChecking(false);
      }
    },
    [fetchStats]
  );

  const reset = () => {
    setLastResult(null);
    setStats(null);
    setError('');
    setScannerKey((k) => k + 1);
  };

  const booking = lastResult?.booking;
  const isValid = Boolean(lastResult?.valid);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 rounded-2xl bg-emerald-500/15 grid place-items-center">
          <QrCode className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">QR Check-in</h1>
          <p className="text-sm text-slate-400">Scan a ticket QR to validate entry (one-time).</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Scanner</h2>
            <button
              onClick={reset}
              className="text-slate-400 hover:text-white flex items-center gap-2 text-sm"
              disabled={checking}
            >
              <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} />
              Reset
            </button>
          </div>

          <QRScanner key={scannerKey} onScanSuccess={onScanSuccess} />

          {checking && (
            <p className="mt-3 text-sm text-slate-400">Validating…</p>
          )}
          {error && (
            <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
              {error}
            </div>
          )}
          {lastResult && !isValid && (
            <div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-200">
              {lastResult.message || 'Invalid ticket'}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-5">
            <h2 className="font-semibold text-white mb-4">Last Scan</h2>

            {lastResult?.valid ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="font-semibold">Valid — checked in</span>
                </div>
                <div className="text-sm text-slate-300 space-y-1">
                  <div><span className="text-slate-400">Event:</span> {booking?.event?.title || '—'}</div>
                  <div><span className="text-slate-400">Attendee:</span> {booking?.user ? `${booking.user.firstName || ''} ${booking.user.lastName || ''}`.trim() : '—'}</div>
                  <div><span className="text-slate-400">Email:</span> {booking?.user?.email || '—'}</div>
                  <div><span className="text-slate-400">Tickets:</span> {booking?.ticketCount || 1}</div>
                  <div><span className="text-slate-400">Time:</span> {booking?.checkedInAt ? new Date(booking.checkedInAt).toLocaleString() : '—'}</div>
                </div>
              </div>
            ) : lastResult ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="h-5 w-5" />
                  <span className="font-semibold">Rejected</span>
                </div>
                <p className="text-sm text-slate-300">{lastResult.message || 'Invalid ticket'}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No scans yet.</p>
            )}
          </div>

          {stats && (
            <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-5">
              <h2 className="font-semibold text-white mb-4">Attendance</h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3">
                  <p className="text-xs text-slate-400">Tickets sold</p>
                  <p className="text-xl font-bold text-white mt-1">{stats.soldTickets || 0}</p>
                </div>
                <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3">
                  <p className="text-xs text-slate-400">Live check-ins</p>
                  <p className="text-xl font-bold text-emerald-400 mt-1">{stats.checkedInTickets || 0}</p>
                </div>
                <div className="rounded-xl border border-slate-700/40 bg-slate-800/30 p-3">
                  <p className="text-xs text-slate-400">Remaining seats</p>
                  <p className="text-xl font-bold text-sky-400 mt-1">{stats.remainingSeats ?? '—'}</p>
                </div>
              </div>
            </div>
          )}

          {eventId && !stats && (
            <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-5">
              <button
                onClick={() => fetchStats(eventId)}
                className="rounded-xl bg-emerald-500/15 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/25"
              >
                Load attendance stats
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCheckIn;
