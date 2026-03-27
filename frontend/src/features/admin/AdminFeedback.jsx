import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const AdminFeedback = () => {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [error, setError] = useState("");

  const eventOptions = useMemo(() => {
    const arr = Array.isArray(events) ? events : [];
    return arr.map((e) => ({ id: e._id, title: e.title }));
  }, [events]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/events");
        const list = Array.isArray(res.data?.events || res.data)
          ? res.data?.events || res.data
          : [];
        setEvents(list);
        if (!eventId && list?.[0]?._id) setEventId(list[0]._id);
      } catch (e) {
        setError(
          e?.response?.data?.message || e?.message || "Failed to load events",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFeedback = async (eid) => {
    if (!eid) return;
    try {
      setLoadingFeedback(true);
      setError("");
      const res = await api.get(`/feedback/moderation/event/${eid}`);
      setFeedback(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to load feedback",
      );
    } finally {
      setLoadingFeedback(false);
    }
  };

  useEffect(() => {
    fetchFeedback(eventId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const setStatus = async (feedbackId, status) => {
    try {
      await api.patch(`/feedback/moderation/${feedbackId}`, { status });
      setFeedback((prev) =>
        prev.map((f) => (f._id === feedbackId ? { ...f, status } : f)),
      );
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to update moderation",
      );
    }
  };

  if (loading) {
    return <p className="text-slate-600 dark:text-slate-300">Loading...</p>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Feedback Moderation</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Approve or reject attendance-verified feedback.
          </p>
        </div>

        <div className="w-full md:w-96">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Event
          </label>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            {eventOptions.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-300 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {loadingFeedback ? (
        <p className="text-slate-600 dark:text-slate-300">
          Loading feedback...
        </p>
      ) : (
        <div className="space-y-3">
          {feedback.map((fb) => (
            <div
              key={fb._id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1629] p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">
                    {fb.user?.firstName
                      ? `${fb.user.firstName} ${fb.user?.lastName || ""}`
                      : fb.user?.email || "User"}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">
                    Rating: {fb.rating} • Sentiment: {fb.sentiment} • Status:{" "}
                    {fb.status}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setStatus(fb._id, "approved")}
                    className="rounded-xl px-3 py-2 text-sm font-medium bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setStatus(fb._id, "rejected")}
                    className="rounded-xl px-3 py-2 text-sm font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25"
                  >
                    Reject
                  </button>
                </div>
              </div>

              {fb.comment ? (
                <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">
                  {fb.comment}
                </p>
              ) : (
                <p className="mt-3 text-sm text-slate-500">(No comment)</p>
              )}

              {Array.isArray(fb.tags) && fb.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {fb.tags.map((t) => (
                    <span
                      key={t}
                      className="text-xs rounded-full px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {feedback.length === 0 && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1629] p-6 text-slate-600 dark:text-slate-300">
              No feedback found for this event.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminFeedback;
