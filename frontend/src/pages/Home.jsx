import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { CalendarX } from "lucide-react";
import Button from "../components/Button";
import api from "../services/api";

const FeatureCard = ({ title, desc, icon }) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl transition hover:bg-white/10">
    <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-400/10 blur-2xl transition group-hover:from-violet-500/30 group-hover:to-cyan-400/20" />
    <div className="relative">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
        <span className="text-xl">{icon}</span>
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-white/70">{desc}</p>
    </div>
  </div>
);

const Stat = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="mt-1 text-xs uppercase tracking-wider text-white/60">{label}</div>
  </div>
);

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data?.events || res.data || []);
      } catch {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const approvedEvents = events.filter((e) => e.status === 'approved');
  const upcomingEvents = approvedEvents.filter(
    (e) => new Date(e.date) >= new Date()
  );
  const nextEvent = upcomingEvents.sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  )[0];

  const totalCreators = [...new Set(events.map((e) => e.organizer?._id || e.organizer))].length;

  return (
    <div className="relative isolate overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(50rem_40rem_at_90%_10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(40rem_30rem_at_10%_40%,rgba(168,85,247,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Top badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 shadow-[0_10px_40px_-25px_rgba(0,0,0,0.8)] backdrop-blur-xl">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.15)]" />
            Plan events faster • Manage smarter • Share instantly
          </div>
        </div>

        {/* Hero */}
        <div className="mt-10 grid items-center gap-10 lg:grid-cols-2">
          <div className="text-center lg:text-left">
            <h1 className="text-balance text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Welcome to{" "}
              <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                Eventro
              </span>
            </h1>

            <p className="mt-5 text-pretty text-lg leading-relaxed text-white/70 sm:text-xl">
              Discover events, create unforgettable experiences, and manage
              everything in one sleek dashboard.
            </p>

            {/* CTA */}
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link to="/events" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  Browse Events
                </Button>
              </Link>

              <Link to="/events/create" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full sm:w-auto">
                  Create Event
                </Button>
              </Link>
            </div>

            {/* Helper text */}
            <div className="mt-4 text-sm text-white/60">
              No credit card needed • Works great on mobile • Fast setup
            </div>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
              <Stat label="Events" value={approvedEvents.length} />
              <Stat label="Creators" value={totalCreators} />
              <Stat label="Upcoming" value={upcomingEvents.length} />
            </div>
          </div>

          {/* Right panel – upcoming event or empty state */}
          <div className="relative">
            <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-cyan-500/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
                </div>
              ) : nextEvent ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-white/70">
                        Upcoming Highlight
                      </div>
                      <div className="mt-1 text-xl font-semibold text-white">
                        {nextEvent.title}
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/70 ring-1 ring-white/10">
                      {new Date(nextEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' • '}
                      {new Date(nextEvent.date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-wider text-white/60">
                        Location
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {nextEvent.location || 'TBA'}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs uppercase tracking-wider text-white/60">
                        Capacity
                      </div>
                      <div className="mt-2 text-sm font-semibold text-white">
                        {nextEvent.totalTickets || 0} Seats
                      </div>
                      <div className="mt-1 text-sm text-white/60">
                        {nextEvent.availableTickets ?? nextEvent.totalTickets ?? 0} spots left
                      </div>
                    </div>
                  </div>

                  {nextEvent.totalTickets > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center justify-between text-sm text-white/70">
                        <span>Registrations</span>
                        <span className="font-semibold text-white">
                          {(nextEvent.totalTickets || 0) - (nextEvent.availableTickets || 0)} / {nextEvent.totalTickets}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-cyan-300"
                          style={{
                            width: `${Math.round(
                              ((nextEvent.totalTickets - (nextEvent.availableTickets || 0)) /
                                nextEvent.totalTickets) *
                                100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-2">
                    {["Live updates", "QR check-in", "Smart reminders", "Analytics"].map(
                      (t) => (
                        <span
                          key={t}
                          className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70"
                        >
                          {t}
                        </span>
                      )
                    )}
                  </div>
                </>
              ) : (
                /* Empty state – no upcoming events */
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                    <CalendarX className="h-7 w-7 text-white/40" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">No upcoming events yet</h3>
                  <p className="mt-2 max-w-xs text-sm text-white/50">
                    Be the first to create an event and it will be highlighted right here.
                  </p>
                  <Link to="/events/create" className="mt-5">
                    <Button className="text-sm">Create Your First Event</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-14">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Everything you need to run events like a pro
            </h2>
            <p className="mt-3 text-white/70">
              Beautiful pages, easy management, and the tools to grow attendance.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon="✨"
              title="Stunning Event Pages"
              desc="Clean, modern layouts that make your events look premium and trustworthy."
            />
            <FeatureCard
              icon="🗓️"
              title="Simple Scheduling"
              desc="Create, edit, and organize events quickly with a smooth flow."
            />
            <FeatureCard
              icon="📈"
              title="Insights & Growth"
              desc="Track interest and attendance so you can improve each next event."
            />
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-8 text-center shadow-[0_20px_60px_-40px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-10">
          <h3 className="text-2xl font-bold text-white sm:text-3xl">
            Ready to launch your next event?
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-white/70">
            Create an event in minutes and share it anywhere. Keep everything organized,
            from planning to the final check-in.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/events/create" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Create Event</Button>
            </Link>
            <Link to="/events" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full sm:w-auto">
                Explore Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;