import { useParams } from 'react-router-dom';
import QRCode from 'react-qr-code';
import useFetch from '../../hooks/useFetch';

const QRTicketDisplay = () => {
  const { id } = useParams();
  const { data: booking, loading, error } = useFetch(`/bookings/${id}`);

  if (loading) return <p>Loading ticket...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!booking) return <p>Ticket not found.</p>;

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow p-6 text-center">
      <h2 className="text-2xl font-bold mb-4">{booking.event?.title}</h2>
      <p className="text-gray-500 mb-6">{new Date(booking.event?.date).toLocaleDateString()}</p>
      <div className="flex justify-center mb-6">
        <QRCode value={JSON.stringify({ bookingId: booking._id, eventId: booking.event?._id })} size={200} />
      </div>
      <p className="text-sm text-gray-500">Tickets: {booking.ticketCount}</p>
      <p className="text-sm text-gray-500">Total: Rs. {booking.totalPrice}</p>
    </div>
  );
};

export default QRTicketDisplay;
