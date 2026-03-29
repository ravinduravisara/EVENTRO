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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold">Become a Sponsor</h1>
      <p className="mt-2 text-slate-600">
        Interested in sponsoring campus events? Submit your details and the
        organizers will contact you.
      </p>

      {error && (
        <div className="mt-4 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {success}
        </div>
      )}

      <form
        onSubmit={submit}
        className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Inquiry Type
          </label>
          <select
            value={form.inquiryType}
            onChange={(e) => update("inquiryType", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
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
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Company Name
          </label>
          <input
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Contact Name
          </label>
          <input
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            required
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone (optional)
            </label>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
            />
          </div>
        </div>

        {form.inquiryType === "sponsor-tier" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tier
              </label>
              <select
                value={form.tier}
                onChange={(e) => update("tier", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="gold">Gold</option>
                <option value="silver">Silver</option>
                <option value="bronze">Bronze</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Budget (optional)
              </label>
              <input
                type="number"
                min={0}
                value={form.budget}
                onChange={(e) => update("budget", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {form.inquiryType === "vendor-stall" && (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Stall Type
                </label>
                <input
                  value={form.stallType}
                  onChange={(e) => update("stallType", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  placeholder="e.g., Food, Drinks, Merchandise"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Number of Stalls
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.stallCount}
                  onChange={(e) => update("stallCount", e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.needsPower}
                  onChange={(e) => update("needsPower", e.target.checked)}
                />
                Needs power
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.needsWater}
                  onChange={(e) => update("needsWater", e.target.checked)}
                />
                Needs water
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expected Footfall (optional)
              </label>
              <input
                type="number"
                min={0}
                value={form.expectedFootfall}
                onChange={(e) => update("expectedFootfall", e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {form.inquiryType === "in-kind" && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              In-kind Items
            </label>
            <textarea
              rows={3}
              value={form.inKindItems}
              onChange={(e) => update("inKindItems", e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              placeholder="e.g., banners, printing, refreshments, gift packs"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Message (optional)
          </label>
          <textarea
            rows={4}
            value={form.message}
            onChange={(e) => update("message", e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          />
        </div>

        <button
          disabled={submitting}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Submit Inquiry"}
        </button>
      </form>
    </div>
  );
};

export default BecomeSponsor;
