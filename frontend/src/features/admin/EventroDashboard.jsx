import { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Zap,
  Users,
  DollarSign,
  CalendarDays,
  MoreHorizontal,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Star,
  CalendarX,
  Inbox,
  BarChart3,
  MessageSquare,
  ListChecks,
} from 'lucide-react';
import api from '../../services/api';

// ─── Helper Components ──────────────────────────────────────

function StatCard({ icon: Icon, iconBg, label, value, subtitle, change }) {
  return (
    <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-slate-400 text-sm font-medium">{label}</p>
          <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
        </div>
        <div className={`${iconBg} p-2.5 rounded-xl`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <span className="text-slate-500">{subtitle}</span>
        {change && (
          <span className="text-emerald-400 font-medium flex items-center gap-0.5">
            <TrendingUp size={14} /> {change}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-700/40 flex items-center justify-center mb-3">
        <Icon size={24} className="text-slate-500" />
      </div>
      <p className="text-slate-500 text-sm max-w-[200px]">{message}</p>
    </div>
  );
}

function CircularProgress({ value, color, size = 80 }) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#1e293b"
          strokeWidth="6"
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold">{value}%</span>
      </div>
    </div>
  );
}

function MiniCalendar() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const todayDate = now.getDate();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Calendar Overview</h3>
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <button onClick={prev} className="hover:text-white transition">
            <ChevronLeft size={16} />
          </button>
          <span className="font-medium text-white">
            {monthNames[month]} {year}
          </span>
          <button onClick={next} className="hover:text-white transition">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="text-slate-500 font-medium py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={i} className="py-1.5" />;
          const isToday = isCurrentMonth && day === todayDate;
          return (
            <div
              key={i}
              className={`py-1.5 rounded-lg cursor-pointer transition text-sm ${
                isToday
                  ? 'bg-emerald-500/20 text-emerald-400 font-semibold'
                  : 'text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}
        />
      ))}
    </div>
  );
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-white text-sm font-semibold">
          {payload[0].payload.date}: {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
}

const TICKET_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444', '#8b5cf6'];

// ─── Main Dashboard ─────────────────────────────────────────

const EventroDashboard = () => {
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    totalRevenue: 0,
    upcomingEvents: 0,
  });
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [eventsRes, bookingsRes, feedbackRes] = await Promise.allSettled([
          api.get('/events'),
          api.get('/bookings/my'),
          api.get('/feedback'),
        ]);

        const allEvents =
          eventsRes.status === 'fulfilled'
            ? eventsRes.value.data?.events || eventsRes.value.data || []
            : [];
        const allBookings =
          bookingsRes.status === 'fulfilled'
            ? bookingsRes.value.data?.bookings || bookingsRes.value.data || []
            : [];
        const allFeedback =
          feedbackRes.status === 'fulfilled'
            ? feedbackRes.value.data?.feedback || feedbackRes.value.data || []
            : [];

        const safeEvents = Array.isArray(allEvents) ? allEvents : [];
        const safeBookings = Array.isArray(allBookings) ? allBookings : [];
        const safeFeedback = Array.isArray(allFeedback) ? allFeedback : [];

        const now = new Date();
        const upcoming = safeEvents.filter((e) => new Date(e.date) > now);
        const totalAttendees = safeBookings.length;
        const totalRevenue = safeBookings.reduce(
          (sum, b) => sum + (b.totalPrice || 0),
          0
        );

        setEvents(safeEvents);
        setBookings(safeBookings);
        setFeedback(safeFeedback);
        setStats({
          totalEvents: safeEvents.length,
          totalAttendees,
          totalRevenue,
          upcomingEvents: upcoming.length,
        });
      } catch {
        // Empty state will be shown
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Derived data
  const now = new Date();

  const upcomingEventsList = events
    .filter((e) => new Date(e.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 5);

  const latestEvents = [...events]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
    )
    .slice(0, 5);

  // Registration trend — group bookings by day (last 30 days)
  const registrationData = (() => {
    if (!bookings.length) return [];
    const days = {};
    const thirtyAgo = new Date(now);
    thirtyAgo.setDate(thirtyAgo.getDate() - 30);
    bookings.forEach((b) => {
      const d = new Date(b.createdAt || b.bookingDate);
      if (d >= thirtyAgo) {
        const key = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        days[key] = (days[key] || 0) + 1;
      }
    });
    return Object.entries(days).map(([date, value]) => ({ date, value }));
  })();

  // Ticket breakdown
  const ticketBreakdown = (() => {
    if (!bookings.length) return [];
    const types = {};
    bookings.forEach((b) => {
      const t = b.ticketType || 'General';
      types[t] = (types[t] || 0) + 1;
    });
    return Object.entries(types).map(([name, value], i) => ({
      name,
      value,
      color: TICKET_COLORS[i % TICKET_COLORS.length],
    }));
  })();

  const hasEvents = events.length > 0;
  const hasBookings = bookings.length > 0;
  const hasFeedback = feedback.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent mb-4" />
          <p className="text-slate-400 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Stat Cards ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Zap}
          iconBg="bg-indigo-500"
          label="Total Events"
          value={stats.totalEvents}
          subtitle={stats.totalEvents > 0 ? 'Active' : 'No events yet'}
        />
        <StatCard
          icon={Users}
          iconBg="bg-emerald-500"
          label="Total Attendees"
          value={stats.totalAttendees.toLocaleString()}
          subtitle={
            stats.totalAttendees > 0 ? 'Registered' : 'No attendees yet'
          }
        />
        <StatCard
          icon={DollarSign}
          iconBg="bg-violet-500"
          label="Total Revenue"
          value={`Rs. ${stats.totalRevenue.toLocaleString()}`}
          subtitle={stats.totalRevenue > 0 ? 'Earned' : 'No revenue yet'}
        />
        <StatCard
          icon={CalendarDays}
          iconBg="bg-sky-500"
          label="Upcoming Events"
          value={stats.upcomingEvents}
          subtitle={
            stats.upcomingEvents > 0 ? 'Scheduled' : 'None scheduled'
          }
        />
      </div>

      {/* ── Row 2: Trends + Calendar + Activities ─────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Registration Trends */}
        <div className="xl:col-span-2 bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">
              Registration Trends (Last 30 Days)
            </h3>
            <span className="text-xs text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-full">
              0-25k Attendees
            </span>
          </div>
          {registrationData.length > 0 ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationData}>
                  <defs>
                    <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="#10b981"
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor="#10b981"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#1e293b' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) =>
                      v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v
                    }
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#colorReg)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: '#10b981',
                      stroke: '#0B1120',
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState
              icon={BarChart3}
              message="No registration data yet. Trends will appear once attendees register."
            />
          )}
        </div>

        {/* Calendar */}
        <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
          <MiniCalendar />
        </div>

        {/* Recent Activities */}
        <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Recent Activities</h3>
            <button className="text-slate-400 hover:text-white">
              <MoreHorizontal size={18} />
            </button>
          </div>
          {hasBookings ? (
            <div className="space-y-4">
              {bookings.slice(0, 4).map((b, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                    {(b.user?.firstName || b.user?.name || 'U')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 leading-snug">
                      {b.user?.firstName || b.user?.name || 'User'} booked{' '}
                      {b.event?.title || 'an event'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleDateString()
                        : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Inbox}
              message="No activity yet. Events and bookings will show up here."
            />
          )}
        </div>
      </div>

      {/* ── Row 3: Events + Upcoming + Tickets ────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
        {/* Latest Events Table */}
        <div className="xl:col-span-2 bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Latest Events</h3>
            <button className="text-slate-400 hover:text-white">
              <MoreHorizontal size={18} />
            </button>
          </div>
          {hasEvents ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-700/50">
                    <th className="text-left font-medium pb-3">Event Name</th>
                    <th className="text-left font-medium pb-3">Date</th>
                    <th className="text-left font-medium pb-3">Attendees</th>
                    <th className="text-left font-medium pb-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {latestEvents.map((event, i) => (
                    <tr
                      key={event._id || i}
                      className="border-b border-slate-700/30 last:border-0"
                    >
                      <td className="py-3 text-white font-medium">
                        {event.title}
                      </td>
                      <td className="py-3 text-slate-400">
                        {event.date
                          ? new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="py-3 text-slate-400">
                        {event.attendees?.length || 0}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            event.status === 'approved'
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : event.status === 'pending'
                              ? 'bg-amber-500/15 text-amber-400'
                              : 'bg-slate-500/15 text-slate-400'
                          }`}
                        >
                          {event.status || 'Draft'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState
              icon={CalendarX}
              message="No events created yet. Create your first event to get started!"
            />
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Upcoming Events</h3>
          </div>
          {upcomingEventsList.length > 0 ? (
            <div className="space-y-3">
              {upcomingEventsList.map((event, i) => (
                <div
                  key={event._id || i}
                  className="flex items-center gap-3 bg-slate-800/50 rounded-xl p-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center text-lg">
                    📅
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {event.title}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={12} />{' '}
                        {new Date(event.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={12} /> {event.attendees?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={CalendarDays}
              message="No upcoming events scheduled."
            />
          )}
        </div>

        {/* Ticket Sales Breakdown */}
        <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-white">Ticket Sales Breakdown</h3>
          </div>
          {ticketBreakdown.length > 0 ? (
            <>
              <div className="flex items-center justify-center">
                <div className="w-40 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={ticketBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={42}
                        outerRadius={65}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {ticketBreakdown.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-1">
                {ticketBreakdown.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-xs">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-300">
                      {item.name}{' '}
                      <span className="text-slate-500">{item.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyState
              icon={BarChart3}
              message="No ticket sales yet. Data will appear once tickets are sold."
            />
          )}
        </div>
      </div>

      {/* ── Row 4: Feedback + Task Progress ───────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Attendee Feedback */}
        <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white">Attendee Feedback</h3>
            <button className="text-slate-400 hover:text-white">
              <MoreHorizontal size={18} />
            </button>
          </div>
          {hasFeedback ? (
            <div className="space-y-4">
              {feedback.slice(0, 4).map((fb, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${
                      fb.user?.firstName || fb.user?.name || i
                    }`}
                    alt="avatar"
                    className="w-9 h-9 rounded-full ring-2 ring-slate-600"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <StarRating rating={fb.rating || 0} />
                      <span className="text-xs text-slate-400">Rating</span>
                    </div>
                    <p className="text-sm text-slate-300 truncate mt-0.5">
                      {fb.user?.firstName || fb.user?.name || 'Anonymous'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={MessageSquare}
              message="No feedback received yet. Feedback will show after events."
            />
          )}
        </div>

        {/* Task Progress */}
        <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40">
          <h3 className="font-semibold text-white mb-5">Task Progress</h3>
          {hasEvents ? (
            <div className="flex items-center justify-around">
              {[
                { label: 'Venue Booking', value: 0, color: '#6366f1' },
                { label: 'Marketing', value: 0, color: '#10b981' },
                { label: 'Speaker Outreach', value: 0, color: '#f59e0b' },
              ].map((task, i) => (
                <div key={i} className="flex flex-col items-center gap-2">
                  <CircularProgress value={task.value} color={task.color} />
                  <span className="text-xs text-slate-400 text-center leading-tight">
                    {task.label}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ListChecks}
              message="No tasks yet. Create events to start tracking progress."
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventroDashboard;
