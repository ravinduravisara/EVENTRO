import {
  HelpCircle,
  BookOpen,
  MessageCircle,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    q: 'How do I create a new event?',
    a: 'Navigate to Events in the sidebar, then click "Create Event". Fill in the event details including title, description, date, location, and ticket information, then submit for approval.',
  },
  {
    q: 'How do I approve/reject events?',
    a: 'Go to the Dashboard or Events page. Pending events will show an "Approve" or "Reject" button. Click to change the event status.',
  },
  {
    q: 'How does the ticket system work?',
    a: 'When users book an event, a ticket with a QR code is generated. Organizers can scan QR codes at the venue to validate tickets. View all tickets in the Tickets section.',
  },
  {
    q: 'How do I view reports and analytics?',
    a: 'The Reports section shows revenue trends, event categories, booking stats, and more. Data is automatically pulled from your events and bookings.',
  },
  {
    q: 'How do I manage users?',
    a: 'Go to Attendees to see all registered users. You can filter by role (user, organizer, admin) and search by name or email.',
  },
  {
    q: 'How do marketing campaigns work?',
    a: 'The Marketing section lets you create email campaigns. Select a target event, write your message, and send to your audience. Campaign stats are tracked automatically.',
  },
];

const AdminHelp = () => {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Help Center</h1>
        <p className="text-slate-400 text-sm mt-1">
          Find answers and get support
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: BookOpen,
            title: 'Documentation',
            desc: 'Read the full admin guide',
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/15',
          },
          {
            icon: MessageCircle,
            title: 'Live Chat',
            desc: 'Chat with support team',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/15',
          },
          {
            icon: Mail,
            title: 'Email Support',
            desc: 'support@eventro.com',
            color: 'text-amber-400',
            bg: 'bg-amber-500/15',
          },
        ].map((item, i) => (
          <button
            key={i}
            className="bg-[#141B2D] rounded-2xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition text-left group"
          >
            <div className={`w-11 h-11 rounded-xl ${item.bg} flex items-center justify-center mb-3`}>
              <item.icon size={20} className={item.color} />
            </div>
            <p className="font-semibold text-white group-hover:text-emerald-400 transition">
              {item.title}
            </p>
            <p className="text-slate-500 text-sm mt-0.5">{item.desc}</p>
          </button>
        ))}
      </div>

      {/* FAQs */}
      <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-6">
        <h3 className="font-semibold text-white text-lg mb-4">
          Frequently Asked Questions
        </h3>
        <div className="divide-y divide-slate-700/30">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left group"
              >
                <span className="text-sm font-medium text-slate-200 group-hover:text-white transition pr-4">
                  {faq.q}
                </span>
                {openFaq === i ? (
                  <ChevronUp size={18} className="text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <div className="pb-4 -mt-1">
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact Card */}
      <div className="bg-[#141B2D] rounded-2xl border border-slate-700/40 p-6">
        <h3 className="font-semibold text-white text-lg mb-2">
          Still need help?
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Our support team is available 24/7. Reach out to us and we&apos;ll get
          back to you as soon as possible.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2">
            <MessageCircle size={16} /> Start Live Chat
          </button>
          <button className="bg-slate-700/50 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2">
            <Mail size={16} /> Email Us
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHelp;
