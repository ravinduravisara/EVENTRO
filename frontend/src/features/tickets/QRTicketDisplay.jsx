import { useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';

const QRTicketDisplay = () => {
  const { id } = useParams();
  const { data: booking, loading, error } = useFetch(`/bookings/${id}`);

  const handleDownloadQr = async () => {
    if (!booking?.qrCode) return;

    const filename = `eventro-ticket-${id || 'qr'}.png`;

    try {
      // Convert data URL -> Blob so downloads work consistently.
      const res = await fetch(booking.qrCode);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      // Fallback: direct data URL download.
      const a = document.createElement('a');
      a.href = booking.qrCode;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  };

  if (loading) return <p>Loading ticket...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!booking) return <p>Ticket not found.</p>;

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">{booking.event?.title}</h2>
      <p className="text-gray-500 mb-6">
        {booking.event?.date ? new Date(booking.event.date).toLocaleDateString('en-GB') : 'Date TBA'}
      </p>
      <div className="flex justify-center mb-6">
        {booking.qrCode ? (
          <img
            src={booking.qrCode}
            alt="QR Ticket"
            className="h-[220px] w-[220px] rounded-xl border border-gray-200"
          />
        ) : (
          <p className="text-sm text-gray-500">QR not available</p>
        )}
      </div>

      {booking.qrCode && (
        <button
          type="button"
          onClick={handleDownloadQr}
          className="mb-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition"
        >
          Download QR
        </button>
      )}

      <div className="mb-4">
        <span
          className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
            booking.status === 'confirmed'
              ? 'bg-emerald-100 text-emerald-700'
              : booking.status === 'used'
              ? 'bg-sky-100 text-sky-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {booking.status}
        </span>
        {booking.checkedInAt && (
          <p className="mt-2 text-xs text-gray-500">
            Checked in: {new Date(booking.checkedInAt).toLocaleString()}
          </p>
        )}
      </div>
      <p className="text-sm text-gray-500">Tickets: {booking.ticketCount}</p>
      <p className="text-sm text-gray-500">Total: Rs. {booking.totalPrice}</p>
    </div>
  );
};

export default QRTicketDisplay;
