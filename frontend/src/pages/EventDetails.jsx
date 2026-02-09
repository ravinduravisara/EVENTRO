import { useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Button from '../components/Button';

const EventDetails = () => {
  const { id } = useParams();
  const { data: event, loading, error } = useFetch(`/events/${id}`);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!event) return <p>Event not found.</p>;

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow p-6">
      {event.image && <img src={event.image} alt={event.title} className="w-full h-64 object-cover rounded-lg mb-4" />}
      <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
      <p className="text-gray-500 mb-4">{new Date(event.date).toLocaleDateString()} · {event.location}</p>
      <p className="text-gray-700 mb-6">{event.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-primary">Rs. {event.ticketPrice}</span>
        <Button>Book Ticket</Button>
      </div>
    </div>
  );
};

export default EventDetails;
