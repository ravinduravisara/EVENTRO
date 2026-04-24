import { useEffect, useState } from "react";
import api from "../../services/api";

const SENTIMENT_COLORS = {
  positive: "text-green-600",
  neutral: "text-yellow-600",
  negative: "text-red-600",
};

const StarRating = ({ rating }) => (
  <span className="text-yellow-400">
    {"★".repeat(rating)}
    <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
  </span>
);

const AdminFeedback = () => {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [feedbacks, setFeedbacks] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/events")
      .then((res) => {
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.events || [];
        setEvents(list);
      })
      .catch(() => setError("Failed to load events."));
  }, []);

  useEffect(() => {
    if (!eventId) {
      setFeedbacks([]);
      setAnalytics(null);
      return;
    }
    setLoading(true);
    setError("");
    Promise.allSettled([
      api.get(`/feedback/event/${eventId}`),
      api.get(`/feedback/analytics/${eventId}`),
    ])
      .then(([fbRes, anRes]) => {
        if (fbRes.status === "fulfilled") {
          const data = fbRes.value.data;
          setFeedbacks(Array.isArray(data) ? data : data?.feedbacks || []);
        }
        if (anRes.status === "fulfilled") {
          setAnalytics(anRes.value.data);
        }
      })
      .catch(() => setError("Failed to load feedback."))
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Feedback Management</h1>

      {/* Event selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Event
        </label>
        <select
          className="border border-gray-300 rounded px-3 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={eventId}
          onChange={(e) => setEventId(e.target.value)}
        >
          <option value="">-- Choose an event --</option>
          {events.map((ev) => (
            <option key={ev._id} value={ev._id}>
              {ev.title}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">
          {error}
        </div>
      )}

      {/* Analytics summary */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">
              {analytics.totalFeedbacks ?? feedbacks.length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Total Responses</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-yellow-500">
              {typeof analytics.averageRating === "number"
                ? analytics.averageRating.toFixed(1)
                : "—"}
            </p>
            <p className="text-sm text-gray-500 mt-1">Avg Rating</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {analytics.sentimentBreakdown?.positive ?? 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Positive</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-3xl font-bold text-red-600">
              {analytics.sentimentBreakdown?.negative ?? 0}
            </p>
            <p className="text-sm text-gray-500 mt-1">Negative</p>
          </div>
        </div>
      )}

      {/* Feedback list */}
      {loading ? (
        <p className="text-gray-500">Loading feedback…</p>
      ) : feedbacks.length === 0 && eventId ? (
        <p className="text-gray-500">No feedback found for this event.</p>
      ) : (
        feedbacks.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Rating</th>
                  <th className="px-4 py-3 text-left">Sentiment</th>
                  <th className="px-4 py-3 text-left">Comment</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {feedbacks.map((fb) => (
                  <tr key={fb._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {fb.user?.name || fb.user?.email || fb.user || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StarRating rating={fb.rating} />
                    </td>
                    <td className="px-4 py-3 capitalize">
                      <span
                        className={
                          SENTIMENT_COLORS[fb.sentiment] || "text-gray-600"
                        }
                      >
                        {fb.sentiment || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {fb.comment || <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                      {fb.createdAt
                        ? new Date(fb.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default AdminFeedback;
