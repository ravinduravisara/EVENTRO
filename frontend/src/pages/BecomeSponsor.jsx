import { useState } from "react";
import api from "../services/api";

const BecomeSponsor = () => {
  const [form, setForm] = useState({
    inquiryType: "custom",
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    tier: "custom",
    budget: "",
    stallType: "",
    stallCount: "",
    needsPower: false,
    needsWater: false,
    expectedFootfall: "",
    inKindItems: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      setSubmitting(true);
      await api.post("/sponsorship/inquiries", {
        ...form,
        budget: form.budget === "" ? 0 : Number(form.budget),
        stallCount: form.stallCount === "" ? 0 : Number(form.stallCount),
        expectedFootfall:
          form.expectedFootfall === "" ? 0 : Number(form.expectedFootfall),
      });
      setSuccess("Thanks! Your sponsorship inquiry has been submitted.");
      setForm({
        inquiryType: "custom",
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        tier: "custom",
        budget: "",
        stallType: "",
        stallCount: "",
        needsPower: false,
        needsWater: false,
        expectedFootfall: "",
        inKindItems: "",
        message: "",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit inquiry",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-slate-950" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60rem_40rem_at_50%_-10%,rgba(99,102,241,0.35),transparent_60%),radial-gradient(50rem_40rem_at_90%_10%,rgba(34,211,238,0.18),transparent_55%),radial-gradient(40rem_30rem_at_10%_40%,rgba(168,85,247,0.18),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Become a{" "}
          <span className="bg-gradient-to-r from-violet-300 via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
            Sponsor
          </span>
        </h1>
        <p className="mt-3 text-white/70">
          Interested in sponsoring campus events? Share your details and the organizers will contact you.
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
            Inquiry Type
          </label>
          <select
            value={form.inquiryType}
            onChange={(e) => update("inquiryType", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
          >
            <option value="sponsor-tier">
              Sponsor Tier (Gold/Silver/Bronze)
            </option>
            <option value="vendor-stall">Vendor / Vending Stall</option>
            <option value="in-kind">In-Kind Support</option>
            <option value="custom">Custom</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Company Name
          </label>
          <input
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Contact Name
          </label>
          <input
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              Phone (optional)
            </label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
            />
          </div>
        </div>

        {form.inquiryType === "sponsor-tier" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Tier
              </label>
              <select
                value={form.tier}
                onChange={(e) => update("tier", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              >
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Budget (optional)
              </label>
              <input
                type="number"
                min={0}
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
            </div>
          </div>
        )}

        {form.inquiryType === "vendor-stall" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Stall Type
                </label>
                <input
                  value={form.stallType}
                  onChange={(e) => update("stallType", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  placeholder="e.g., Food, Drinks, Merchandise"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/80 mb-1">
                  Number of Stalls
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.stallCount}
                  onChange={(e) => update("stallCount", e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={form.needsPower}
                  onChange={(e) => update("needsPower", e.target.checked)}
                  className="h-4 w-4 accent-indigo-400"
                />
                Needs power
              </label>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={form.needsWater}
                  onChange={(e) => update("needsWater", e.target.checked)}
                  className="h-4 w-4 accent-indigo-400"
                />
                Needs water
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-1">
                Expected Footfall (optional)
              </label>
              <input
                type="number"
                min={0}
                value={form.expectedFootfall}
                onChange={(e) => update("expectedFootfall", e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              />
            </div>
          </div>
        )}

        {form.inquiryType === "in-kind" && (
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1">
              In-kind Items
            </label>
            <textarea
              rows={3}
              value={form.inKindItems}
              onChange={(e) => update("inKindItems", e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
              placeholder="e.g., banners, printing, refreshments, gift packs"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-white/80 mb-1">
            Message (optional)
          </label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm text-white/90 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
          />
        </div>

        <button
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-[0_18px_40px_-24px_rgba(34,211,238,0.55)] transition hover:from-violet-400 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-indigo-400/40 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Inquiry"}
        </button>
      </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeSponsor;
