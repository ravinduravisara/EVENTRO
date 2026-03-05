import { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  MapPin,
  Users,
  Clock,
} from 'lucide-react';
import api from '../../services/api';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AdminCalendar = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/events');
        const data = res.data?.events || res.data || [];
        setEvents(Array.isArray(data) ? data : []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Build calendar cells
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;
  const todayDate = now.getDate();
  const isCurrentMonth = now.getFullYear() === year && now.getMonth() === month;

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // Map events to days
  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      const d = new Date(e.date);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!map[day]) map[day] = [];
        map[day].push(e);
      }
    });
    return map;
  }, [events, year, month]);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDay(null);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDay(null);
  };

  const selectedEvents = selectedDay ? eventsByDay[selectedDay] || [] : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Calendar</h1>
        <p className="text-slate-400 text-sm mt-1">View events on the calendar</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="xl:col-span-2 bg-[#141B2D] rounded-2xl p-6 border border-slate-700/40">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-6">
            <button onClick={prev} className="p-2 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-white">
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-lg font-bold">
              {MONTH_NAMES[month]} {year}
            </h2>
            <button onClick={next} className="p-2 hover:bg-slate-700/50 rounded-lg transition text-slate-400 hover:text-white">
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-slate-500 py-2">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-2">
            {cells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const hasEvents = !!eventsByDay[day];
              const isToday = isCurrentMonth && day === todayDate;
              const isSelected = selectedDay === day;

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                  className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition text-sm font-medium ${
                    isSelected
                      ? 'bg-emerald-500 text-white'
                      : isToday
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : hasEvents
                      ? 'bg-indigo-500/15 text-indigo-400 hover:bg-indigo-500/25'
                      : 'text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  {day}
                  {hasEvents && (
                    <span className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side panel */}
        <div className="bg-[#141B2D] rounded-2xl p-6 border border-slate-700/40">
          <h3 className="font-semibold text-white mb-4">
            {selectedDay
              ? `Events on ${MONTH_NAMES[month]} ${selectedDay}`
              : 'Select a day'}
          </h3>

          {selectedDay ? (
            selectedEvents.length > 0 ? (
              <div className="space-y-3">
                {selectedEvents.map((e) => (
                  <div key={e._id} className="bg-slate-800/60 rounded-xl p-4 space-y-2">
                    <p className="font-semibold text-white">{e.title}</p>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin size={12} /> {e.location}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={12} />{' '}
                      {new Date(e.date).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Users size={12} /> {e.availableTickets}/{e.totalTickets} tickets left
                    </div>
                    <span
                      className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                        e.status === 'approved'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : e.status === 'pending'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-slate-500/15 text-slate-400'
                      }`}
                    >
                      {e.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No events on this day.</p>
            )
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-slate-700/40 flex items-center justify-center mb-3">
                <CalendarDays size={24} className="text-slate-500" />
              </div>
              <p className="text-slate-500 text-sm text-center">
                {events.length > 0
                  ? 'Click a day to view events'
                  : 'No events yet. Create events to see them on the calendar.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCalendar;
