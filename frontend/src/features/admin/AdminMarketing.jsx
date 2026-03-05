import { useState, useEffect } from 'react';
import {
  Megaphone,
  Mail,
  Send,
  Users,
  CalendarDays,
  TrendingUp,
  Inbox,
} from 'lucide-react';
import api from '../../services/api';

const AdminMarketing = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({ name: '', eventId: '', message: '' });

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

  const createCampaign = () => {
    if (!form.name.trim()) return;
    setCampaigns([
      ...campaigns,
      {
        id: Date.now(),
        name: form.name,
        eventId: form.eventId,
        eventTitle: events.find((e) => e._id === form.eventId)?.title || '—',
        message: form.message,
        status: 'draft',
        createdAt: new Date().toISOString(),
        sent: 0,
      },
    ]);
    setForm({ name: '', eventId: '', message: '' });
  };

  const sendCampaign = (id) =>
    setCampaigns(
      campaigns.map((c) =>
        c.id === id ? { ...c, status: 'sent', sent: Math.floor(Math.random() * 200) + 10 } : c
      )
    );

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
        <h1 className="text-2xl font-bold">Marketing</h1>
        <p className="text-slate-400 text-sm mt-1">Create and manage email campaigns</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Campaigns', value: campaigns.length, icon: Megaphone, color: 'text-indigo-400' },
          { label: 'Sent', value: campaigns.filter((c) => c.status === 'sent').length, icon: Send, color: 'text-emerald-400' },
          { label: 'Drafts', value: campaigns.filter((c) => c.status === 'draft').length, icon: Mail, color: 'text-amber-400' },
          { label: 'Total Reached', value: campaigns.reduce((s, c) => s + c.sent, 0), icon: Users, color: 'text-sky-400' },
        ].map((s, i) => (
          <div key={i} className="bg-[#141B2D] rounded-xl p-4 border border-slate-700/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-700/40 flex items-center justify-center">
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-slate-400 text-xs font-medium">{s.label}</p>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Campaign */}
      <div className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40 space-y-4">
        <h3 className="font-semibold text-white">Create Campaign</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Campaign name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          />
          <select
            value={form.eventId}
            onChange={(e) => setForm({ ...form, eventId: e.target.value })}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
          >
            <option value="">Select event (optional)</option>
            {events.map((e) => (
              <option key={e._id} value={e._id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>
        <textarea
          placeholder="Campaign message..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={3}
          className="w-full bg-slate-800/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 resize-none"
        />
        <button
          onClick={createCampaign}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2"
        >
          <Megaphone size={16} /> Create Campaign
        </button>
      </div>

      {/* Campaigns List */}
      <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 divide-y divide-slate-700/30">
        {campaigns.length > 0 ? (
          campaigns.map((c) => (
            <div key={c.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-800/30 transition">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                c.status === 'sent' ? 'bg-emerald-500/15' : 'bg-amber-500/15'
              }`}>
                {c.status === 'sent' ? (
                  <Send size={18} className="text-emerald-400" />
                ) : (
                  <Mail size={18} className="text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{c.name}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {c.eventTitle} &middot;{' '}
                  {new Date(c.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    c.status === 'sent'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}
                >
                  {c.status}
                </span>
                {c.sent > 0 && (
                  <p className="text-xs text-slate-500 mt-1">{c.sent} recipients</p>
                )}
              </div>
              {c.status === 'draft' && (
                <button
                  onClick={() => sendCampaign(c.id)}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                >
                  Send
                </button>
              )}
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-slate-700/40 flex items-center justify-center mb-3">
              <Inbox size={24} className="text-slate-500" />
            </div>
            <p className="text-slate-500 text-sm">No campaigns yet</p>
            <p className="text-slate-600 text-xs mt-1">Create your first campaign above</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMarketing;
