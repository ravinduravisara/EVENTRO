import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
<<<<<<< HEAD
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { API_BASE_URL } from '../../services/api';

const STATUS_BADGE = {
  draft:    'bg-slate-500/15 text-slate-400',
  pending:  'bg-amber-500/15 text-amber-400',
  approved: 'bg-blue-500/15 text-blue-400',
  live:     'bg-emerald-500/15 text-emerald-400',
  closed:   'bg-red-500/15 text-red-400',
  cancelled:'bg-red-500/15 text-red-400',
};

const TABS = ['all', 'upcoming', 'ongoing', 'past'];

const getLowestPrice = (ev) => {
  if (ev.ticketTiers?.length) return Math.min(...ev.ticketTiers.map((t) => t.price));
  return ev.ticketPrice ?? 0;
};

const getTotalSeats = (ev) => {
  if (ev.ticketTiers?.length) return ev.ticketTiers.reduce((s, t) => s + (t.totalQuantity || 0), 0);
  return ev.totalTickets ?? 0;
};

const getAvailableSeats = (ev) => {
  if (ev.ticketTiers?.length)
    return ev.ticketTiers.reduce((s, t) => s + ((t.totalQuantity || 0) - (t.soldQuantity || 0)), 0);
  return ev.availableTickets ?? 0;
};

const EventCard = ({ event, currentUserId, onDelete }) => {
  const navigate = useNavigate();
  const [imgFailed, setImgFailed] = useState(false);
  const now = new Date();
  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : null;
  const isLive = start <= now && (!end || end >= now);
  const isPast = end ? end < now : start < now;
  const available = getAvailableSeats(event);
  const total = getTotalSeats(event);

  const imageVersion = event.updatedAt ? new Date(event.updatedAt).getTime() : null;
  const imageSrc = imageVersion
    ? `${API_BASE_URL}/events/${event._id}/image?v=${imageVersion}`
    : `${API_BASE_URL}/events/${event._id}/image`;

  const isOwner = currentUserId && (
    event.organizer === currentUserId ||
    event.organizer?._id === currentUserId
  );

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/events/${event._id}/edit`);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(event);
  };

  return (
    <Link
      to={`/events/${event._id}`}
      className="group bg-[#141B2D] rounded-2xl border border-slate-700/40 overflow-hidden hover:border-indigo-500/40 transition-all duration-300 relative"
    >
      {/* Edit / Delete buttons */}
      {isOwner && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleEdit}
            className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-500/80 text-white backdrop-blur-sm hover:bg-indigo-500 transition"
            title="Edit event"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/80 text-white backdrop-blur-sm hover:bg-red-500 transition"
            title="Delete event"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
      {/* Image */}
      <div className="relative h-52 sm:h-56 bg-slate-800 overflow-hidden">
        {!imgFailed ? (
          <img
            src={imageSrc}
            alt={event.title}
            loading="lazy"
            decoding="async"
            onError={() => setImgFailed(true)}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-600">
            <CalendarDays className="w-12 h-12" />
          </div>
        )}
        {/* Status badge */}
        <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize ${STATUS_BADGE[event.status] || STATUS_BADGE.draft}`}>
          {event.status || 'draft'}
        </span>
        {/* Category pill */}
        {event.category && (
          <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-medium bg-black/50 text-white backdrop-blur-sm">
            {event.category}
          </span>
        )}
=======

const EventCard = ({ event }) => (
  <Link to={`/events/${event._id}`} className="block bg-white rounded-xl shadow hover:shadow-lg transition-shadow overflow-hidden">
    {event.image && <img src={event.image} alt={event.title} className="w-full h-48 object-cover" />}
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-1">{event.title}</h3>
      <p className="text-sm text-gray-500 mb-2">{new Date(event.date).toLocaleDateString()} · {event.location}</p>
      <div className="flex justify-between items-center">
        <span className="text-primary font-bold">Rs. {event.ticketPrice}</span>
        <span className="text-sm text-gray-400">{event.availableTickets} left</span>
>>>>>>> parent of a197612 (Event management)
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
