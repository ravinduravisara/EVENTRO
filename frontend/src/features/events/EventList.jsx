import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';

const EventCard = ({ event }) => (
  <Link to={`/events/${event._id}`} className="block bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden">
    {event.image && <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />}
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{new Date(event.date).toLocaleDateString()} · {event.location}</p>
      <div className="flex justify-between items-center">
        <span className="text-primary font-bold">Rs. {event.ticketPrice}</span>
        <span className="text-sm text-gray-400">{event.availableTickets} left</span>
      </div>
    </div>
  </Link>
);

const EventList = () => {
  const { data, loading, error } = useFetch('/events');

  if (loading) return <p>Loading events...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.events?.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
      {(!data?.events || data.events.length === 0) && <p className="text-gray-500">No events found.</p>}
    </div>
  );
};

export default EventList;
