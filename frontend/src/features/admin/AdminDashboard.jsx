import useFetch from '../../hooks/useFetch';
import Button from '../../components/Button';

const AdminDashboard = () => {
  const { data, loading } = useFetch('/events?status=pending');

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <h2 className="text-xl font-semibold mb-4">Pending Events</h2>
      <div className="space-y-4">
        {data?.events?.map((event) => (
          <div key={event._id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-sm text-gray-500">{event.organizer?.name}</p>
            </div>
            <div className="space-x-2">
              <Button variant="primary">Approve</Button>
              <Button variant="danger">Reject</Button>
            </div>
          </div>
        ))}
        {(!data?.events || data.events.length === 0) && <p className="text-gray-500">No pending events.</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;
