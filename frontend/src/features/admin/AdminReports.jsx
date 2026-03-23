import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  FileBarChart,
  DollarSign,
  Users,
  CalendarDays,
  Ticket,
  TrendingUp,
  Download,
} from 'lucide-react';
import api from '../../services/api';

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white text-sm font-semibold">
          {label || payload[0].payload.name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
}

const AdminReports = () => {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [evRes, bkRes, usRes] = await Promise.allSettled([
          api.get('/events'),
          api.get('/bookings'),
          api.get('/users'),
        ]);
        setEvents(
          evRes.status === 'fulfilled'
            ? Array.isArray(evRes.value.data?.events || evRes.value.data)
              ? evRes.value.data?.events || evRes.value.data
              : []
            : []
        );
        setBookings(
          bkRes.status === 'fulfilled'
            ? Array.isArray(bkRes.value.data?.bookings || bkRes.value.data)
              ? bkRes.value.data?.bookings || bkRes.value.data
              : []
            : []
        );
        setUsers(
          usRes.status === 'fulfilled'
            ? Array.isArray(usRes.value.data?.users || usRes.value.data)
              ? usRes.value.data?.users || usRes.value.data
              : []
            : []
        );
      } catch {
        // empty state
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const totalRevenue = bookings.reduce((s, b) => s + (b.totalPrice || 0), 0);
  const totalTickets = bookings.reduce((s, b) => s + (b.ticketCount || 1), 0);

  // Revenue by month
  const revenueByMonth = (() => {
    const months = {};
    bookings.forEach((b) => {
      const d = new Date(b.createdAt || b.bookingDate);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months[key] = (months[key] || 0) + (b.totalPrice || 0);
    });
    return Object.entries(months).map(([name, revenue]) => ({ name, revenue }));
  })();

  // Events by category
  const eventsByCategory = (() => {
    const cats = {};
    events.forEach((e) => {
      const c = e.category || 'Uncategorized';
      cats[c] = (cats[c] || 0) + 1;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  })();

  // Events by status
  const eventsByStatus = (() => {
    const statuses = {};
    events.forEach((e) => {
      const s = e.status || 'unknown';
      statuses[s] = (statuses[s] || 0) + 1;
    });
    return Object.entries(statuses).map(([name, value]) => ({ name, value }));
  })();

  const hasData = events.length > 0 || bookings.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-slate-400 text-sm mt-1">Analytics and insights</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: `Rs. ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400' },
          { label: 'Total Events', value: events.length, icon: CalendarDays, color: 'text-indigo-400' },
          { label: 'Total Users', value: users.length, icon: Users, color: 'text-sky-400' },
          { label: 'Tickets Sold', value: totalTickets, icon: Ticket, color: 'text-violet-400' },
        ].map((s, i) => (
          <div key={i} className="bg-[#141B2D] rounded-xl p-4 border border-slate-700/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700/40 flex items-center justify-center">
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {hasData ? (
        <>
          {/* Revenue Chart */}
          {revenueByMonth.length > 0 && (
            <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
              <h3 className="font-semibold text-white mb-4">Revenue Over Time</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueByMonth}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `Rs.${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {/* Events by Category */}
            {eventsByCategory.length > 0 && (
              <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
                <h3 className="font-semibold text-white mb-4">Events by Category</h3>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eventsByCategory}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={{ stroke: '#1e293b' }} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {eventsByCategory.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Events by Status */}
            {eventsByStatus.length > 0 && (
              <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
                <h3 className="font-semibold text-white mb-4">Events by Status</h3>
                <div className="flex items-center justify-center h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={eventsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {eventsByStatus.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center gap-4 mt-2">
                  {eventsByStatus.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-slate-300 capitalize">{s.name} <span className="text-slate-500">{s.value}</span></span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 py-16 flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-700/40 flex items-center justify-center mb-3">
            <FileBarChart size={24} className="text-slate-500" />
          </div>
          <p className="text-slate-500 text-sm">No data available yet</p>
          <p className="text-slate-600 text-xs mt-1">Reports will populate as events and bookings are created</p>
        </div>
      )}
    </div>
  );
};

export default AdminReports;
