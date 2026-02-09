import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';

const BookingHistory = () => {
  const { data: bookings, loading, error } = useFetch('/bookings/my');

  if (loading) return <p>Loading bookings...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">My Bookings</h1>
      <div className="space-y-4">
        {bookings?.map((booking) => (
          <div key={booking._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{booking.event?.title}</h3>
              <p className="text-sm text-gray-500">{new Date(booking.event?.date).toLocaleDateString()}</p>
              <span className={`text-xs px-2 py-1 rounded-full ${
                booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-700'
              }`}>{booking.status}</span>
            </div>
            {booking.status === 'confirmed' && (
              <Link to={`/bookings/${booking._id}/ticket`} className="text-primary hover:underline">
                View Ticket
              </Link>
            )}
          </div>
        ))}
        {(!bookings || bookings.length === 0) && <p className="text-gray-500">No bookings yet.</p>}
      </div>
    </div>
  );
};

export default BookingHistory;
