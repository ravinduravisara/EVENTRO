import { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import Button from '../../components/Button';

const AdminDashboard = () => {
  const { data, loading } = useFetch('/events?status=pending');
  const [actionStatus, setActionStatus] = useState('');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  const totalPending = data?.events?.length || 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage events and monitor platform activity</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="⏳"
          label="Pending Events"
          value={totalPending}
          color="amber"
        />
        <StatCard
          icon="✅"
          label="Approved"
          value="24"
          color="green"
        />
        <StatCard
          icon="❌"
          label="Rejected"
          value="3"
          color="red"
        />
        <StatCard
          icon="📈"
          label="Total Events"
          value="40"
          color="blue"
        />
      </div>

      {/* Pending Events Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Pending Events</h2>
            <p className="text-gray-600 text-sm mt-1">{totalPending} event(s) waiting for approval</p>
          </div>
        </div>

        {actionStatus && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {actionStatus}
          </div>
        )}

        {totalPending === 0 ? (
          <div className="text-center py-12">
            <span className="text-6xl mb-4 block">✅</span>
            <p className="text-gray-600 text-lg">All events have been reviewed!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.events?.map((event) => (
              <div
                key={event._id}
                className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg border border-gray-200 hover:border-indigo-300 transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-semibold">Organizer:</span>{' '}
                        {event.organizer?.name || 'Unknown'}
                      </p>
                      <p>
                        <span className="font-semibold">Date:</span>{' '}
                        {event.date
                          ? new Date(event.date).toLocaleDateString()
                          : 'Not specified'}
                      </p>
                      <p>
                        <span className="font-semibold">Category:</span> {event.category || 'Uncategorized'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      variant="primary"
                      onClick={() =>
                        setActionStatus(`✓ Event "${event.title}" approved successfully`)
                      }
                      className="flex items-center gap-2"
                    >
                      <span>✅</span>
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        setActionStatus(`✗ Event "${event.title}" rejected`)
                      }
                    >
                      <span>❌</span>
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    amber: 'bg-amber-50 border-amber-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    blue: 'bg-blue-50 border-blue-200',
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-3xl opacity-50">{icon}</div>
      </div>
    </div>
  );
};

export default AdminDashboard;
