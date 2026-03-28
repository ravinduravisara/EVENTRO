import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";

const AdminSponsorship = () => {
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dealForm, setDealForm] = useState({
    sponsorName: "",
    tier: "gold",
    amount: "",
    currency: "LKR",
    notes: "",
  });
  const [creating, setCreating] = useState(false);

  const eventOptions = useMemo(() => {
    const arr = Array.isArray(events) ? events : [];
    return arr.map((e) => ({ id: e._id, title: e.title }));
  }, [events]);

  const selectedAgg = useMemo(() => {
    const rows = analytics?.events || [];
    const found = rows.find((r) => String(r.eventId) === String(eventId));
    return (
      found || {
        totalRevenue: 0,
        totals: { deals: 0, impressions: 0, linkClicks: 0, qrScans: 0 },
        byTier: {},
      }
    );
  }, [analytics, eventId]);

  const fetchAll = async (eid) => {
    try {
      setError("");
      const [aRes, dRes] = await Promise.allSettled([
        api.get("/sponsorship/analytics/revenue"),
        eid
          ? api.get(`/sponsorship/deals/event/${eid}`)
          : Promise.resolve({ data: [] }),
      ]);
      setAnalytics(
        aRes.status === "fulfilled" ? aRes.value.data : { events: [] },
      );
      setDeals(
        dRes.status === "fulfilled"
          ? Array.isArray(dRes.value.data)
            ? dRes.value.data
            : []
          : [],
      );
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          e?.message ||
          "Failed to load sponsorship analytics",
      );
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const evRes = await api.get("/events");
        const list = Array.isArray(evRes.data?.events || evRes.data)
          ? evRes.data?.events || evRes.data
          : [];
        setEvents(list);
        const defaultId = list?.[0]?._id || "";
        setEventId((prev) => prev || defaultId);
        await fetchAll((prev) => prev);
      } catch (e) {
        setError(
          e?.response?.data?.message || e?.message || "Failed to load events",
        );
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!eventId) return;
    fetchAll(eventId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const createDeal = async (e) => {
    e.preventDefault();
    setError("");
    if (!eventId) {
      setError("Select an event");
      return;
    }
    if (!dealForm.sponsorName.trim()) {
      setError("Sponsor name is required");
      return;
    }
    const amt = Number(dealForm.amount);
    if (!Number.isFinite(amt) || amt < 0) {
      setError("Amount must be a non-negative number");
      return;
    }

    try {
      setCreating(true);
      await api.post("/sponsorship/deals", {
        eventId,
        sponsorName: dealForm.sponsorName,
        tier: dealForm.tier,
        amount: amt,
        currency: dealForm.currency,
        notes: dealForm.notes,
      });
      setDealForm({
        sponsorName: "",
        tier: "gold",
        amount: "",
        currency: "LKR",
        notes: "",
      });
      await fetchAll(eventId);
    } catch (err) {
      setError(
        err?.response?.data?.message || err?.message || "Failed to create deal",
      );
    } finally {
      setCreating(false);
    }
  };

  if (loading)
    return <p className="text-slate-600 dark:text-slate-300">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">
            Sponsorship Revenue & Analytics
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Track sponsor deals, revenue by tier, and exposure totals.
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
            {eventOptions.map((o) => (
              <option key={o.id} value={o.id}>
                {o.title}
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1629] p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">
            Total Revenue
          </div>
          <div className="mt-1 text-2xl font-bold">
            {selectedAgg.totalRevenue || 0} {dealForm.currency}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1629] p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">
            Deals
          </div>
          <div className="mt-1 text-2xl font-bold">
            {selectedAgg.totals?.deals || 0}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1629] p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">
            Impressions
          </div>
          <div className="mt-1 text-2xl font-bold">
            {selectedAgg.totals?.impressions || 0}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1629] p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">
            Clicks / Scans
          </div>
          <div className="mt-1 text-2xl font-bold">
            {selectedAgg.totals?.linkClicks || 0} /{" "}
            {selectedAgg.totals?.qrScans || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1629] p-5">
          <h2 className="font-semibold">Revenue by Tier</h2>
          <div className="mt-3 space-y-2 text-sm">
            {["gold", "silver", "bronze", "custom"].map((t) => (
              <div key={t} className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 capitalize">
                  {t}
                </span>
                <span className="font-semibold">
                  {selectedAgg.byTier?.[t]?.revenue || 0}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1629] p-5">
          <h2 className="font-semibold">Create Deal</h2>
          <form onSubmit={createDeal} className="mt-3 space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Sponsor Name
              </label>
              <input
                value={dealForm.sponsorName}
                onChange={(e) =>
                  setDealForm((p) => ({ ...p, sponsorName: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Tier
                </label>
                <select
                  value={dealForm.tier}
                  onChange={(e) =>
                    setDealForm((p) => ({ ...p, tier: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                >
                  <option value="gold">Gold</option>
                  <option value="silver">Silver</option>
                  <option value="bronze">Bronze</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  min={0}
                  value={dealForm.amount}
                  onChange={(e) =>
                    setDealForm((p) => ({ ...p, amount: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">
                Notes
              </label>
              <textarea
                rows={2}
                value={dealForm.notes}
                onChange={(e) =>
                  setDealForm((p) => ({ ...p, notes: e.target.value }))
                }
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
              />
            </div>
            <button
              disabled={creating}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400 px-4 py-2 text-sm font-semibold hover:bg-emerald-500/25 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create Deal"}
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#0F1629] p-5">
        <h2 className="font-semibold">Deals (Selected Event)</h2>
        <div className="mt-3 space-y-2">
          {deals.map((d) => (
            <div
              key={d._id}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 p-3"
            >
              <div>
                <div className="text-sm font-semibold">
                  {d.sponsor?.name || "Sponsor"}{" "}
                  <span className="text-xs text-slate-500">({d.tier})</span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  Impressions {d.exposures?.impressions || 0} • Clicks{" "}
                  {d.exposures?.linkClicks || 0} • Scans{" "}
                  {d.exposures?.qrScans || 0}
                </div>
              </div>
              <div className="text-sm font-bold">
                {d.amount} {d.currency || "LKR"}
              </div>
            </div>
          ))}
          {deals.length === 0 && (
            <div className="text-sm text-slate-600 dark:text-slate-400">
              No deals yet for this event.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSponsorship;
