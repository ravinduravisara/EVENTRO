import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const SubmitFeedback = () => {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const options = useMemo(() => {
    const arr = Array.isArray(events) ? events : [];
    return arr.map((e) => ({ id: e._id, title: e.title }));
  }, [events]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await api.get("/bookings/my-attended-events");
        const list = Array.isArray(res.data) ? res.data : [];
        setEvents(list);
        if (list?.[0]?._id) setEventId(list[0]._id);
      } catch (e) {
        setError(
          e?.response?.data?.message || e?.message || "Failed to load events",
        );
      } finally {
        setLoading(false);
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

  if (loading) {
    return (
      <div className="relative isolate overflow-hidden">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" />
        <div className="mx-auto max-w-3xl px-4 py-16">
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-indigo-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(50rem_40rem_at_90%_10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(40rem_30rem_at_10%_40%,rgba(168,85,247,0.18),transparent_55%)]" />
      <div className="mx-auto max-w-3xl px-4 py-16">
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
            className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.85)] backdrop-blur-xl"
          >
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Event
              </label>
              <select
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              >
                {options.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Rating
              </label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              >
                {[5, 4, 3, 2, 1].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r === 1 ? "" : "s"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                placeholder="Tell us what worked well and what could improve"
              />
            </div>

            <button
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-2xl bg-indigo-500/25 px-4 py-2 text-sm font-semibold text-indigo-100 ring-1 ring-indigo-300/20 hover:bg-indigo-500/35 disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit"}
            </button>
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
