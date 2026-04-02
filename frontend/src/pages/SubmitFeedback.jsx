import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const SubmitFeedback = () => {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fieldBaseClass =
    "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 transition duration-200 hover:border-white/25 focus:border-indigo-300/70 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:cursor-not-allowed disabled:opacity-60";
  const cacheKey = "eventro_attended_events_cache_v1";
  const cacheMaxAgeMs = 2 * 60 * 1000;

  const options = useMemo(() => {
    const arr = Array.isArray(events) ? events : [];
    return arr.map((e) => ({ id: e._id, title: e.title }));
  }, [events]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoadingEvents(true);

        try {
          const raw = sessionStorage.getItem(cacheKey);
          if (raw) {
            const parsed = JSON.parse(raw);
            const cachedAt = Number(parsed?.cachedAt) || 0;
            const cachedEvents = Array.isArray(parsed?.events)
              ? parsed.events
              : [];

            if (cachedEvents.length && Date.now() - cachedAt < cacheMaxAgeMs) {
              setEvents(cachedEvents);
              setEventId((current) => current || cachedEvents?.[0]?._id || "");
              setLoadingEvents(false);
            }
          }
        } catch {
          // ignore cache errors
        }

        const res = await api.get("/bookings/my-attended-events");
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.events)
            ? res.data.events
            : [];
        setEvents(list);

        setEventId((current) => {
          if (current && list.some((e) => e?._id === current)) {
            return current;
          }
          return list?.[0]?._id || "";
        });

        try {
          sessionStorage.setItem(
            cacheKey,
            JSON.stringify({ cachedAt: Date.now(), events: list }),
          );
        } catch {
          // ignore storage errors
        }
      } catch (e) {
        setError(
          e?.response?.data?.message || e?.message || "Failed to load events",
        );
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchEvents();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!eventId) {
      setError("Select an event");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/feedback", {
        event: eventId,
        rating: Number(rating),
        comment,
      });
      setSuccess("Feedback submitted. Thanks!");
      setComment("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit feedback",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate min-h-screen overflow-hidden px-4 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(50rem_40rem_at_90%_10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(40rem_30rem_at_10%_40%,rgba(168,85,247,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto w-full max-w-3xl py-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Submit{" "}
          <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
            Feedback
          </span>
        </h1>
        <p className="mt-3 text-white/70">
          Only attendees who checked-in (QR) can submit feedback. You will only
          see events you attended.
        </p>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="mt-5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {success}
          </div>
        )}

        <div className="mt-8 relative">
          <div className="absolute -inset-2 -z-10 rounded-3xl bg-gradient-to-br from-violet-500/25 via-indigo-500/15 to-cyan-500/20 blur-2xl" />
          <form
            onSubmit={submit}
            className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:p-8"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label className="block text-sm font-medium text-white/80">
                    Event
                  </label>
                  {loadingEvents && (
                    <span className="inline-flex items-center gap-2 text-xs text-white/60">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/15 border-t-indigo-300" />
                      Loading…
                    </span>
                  )}
                </div>
                <select
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  disabled={loadingEvents || options.length === 0}
                  className={fieldBaseClass}
                >
                  {loadingEvents && (
                    <option value="">Loading attended events…</option>
                  )}
                  {!loadingEvents && options.length === 0 && (
                    <option value="">No attended events found</option>
                  )}
                  {options.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white/80">
                  Rating
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className={fieldBaseClass}
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r === 1 ? "" : "s"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className={fieldBaseClass}
                placeholder="Tell us what worked well and what could improve"
              />
            </div>

            <div className="pt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                disabled={submitting || loadingEvents || options.length === 0}
                className="inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-violet-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-24px_rgba(34,211,238,0.55)] transition hover:from-violet-400 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>

          {options.length === 0 && (
            <div className="mt-4 text-sm text-white/60">
              No attended events found yet. Check-in to an event first, then you
              can submit feedback.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmitFeedback;
