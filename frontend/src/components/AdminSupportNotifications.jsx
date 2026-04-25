import { useEffect, useRef, useState } from 'react';
import { Bell, Mail, MessageSquareText, Send, ShieldAlert, UserRound, X } from 'lucide-react';
import api from '../services/api';

const formatTimestamp = (value) => {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const statusStyles = {
  guest: 'bg-slate-500/15 text-slate-300',
  registered: 'bg-emerald-500/15 text-emerald-300',
  banned: 'bg-rose-500/15 text-rose-300',
};

const statusLabels = {
  guest: 'Guest',
  registered: 'Registered',
  banned: 'Banned',
};

const senderLabels = {
  guest: 'Guest',
  'registered-user': 'User',
  'banned-user': 'Banned user',
  admin: 'Admin',
};

const AdminSupportNotifications = () => {
  const rootRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [threads, setThreads] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedThreadId, setSelectedThreadId] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [replyStatus, setReplyStatus] = useState({ type: '', message: '' });
  const [replyingThreadId, setReplyingThreadId] = useState('');

  const selectedThread = threads.find((thread) => thread._id === selectedThreadId) || threads[0] || null;

  const hydrateNotifications = (data, preserveSelection = true) => {
    const nextThreads = Array.isArray(data?.threads) ? data.threads : [];
    setThreads(nextThreads);
    setUnreadCount(Number(data?.unreadCount) || 0);

    setSelectedThreadId((current) => {
      if (preserveSelection && current && nextThreads.some((thread) => thread._id === current)) {
        return current;
      }
      return nextThreads[0]?._id || '';
    });
  };

  const loadNotifications = async (preserveSelection = true) => {
    try {
      setError('');
      if (!threads.length) {
        setIsLoading(true);
      }
      const { data } = await api.get('/support/admin/notifications');
      hydrateNotifications(data, preserveSelection);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(false);
    const timer = window.setInterval(() => {
      loadNotifications(true);
    }, 30000);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleOutsideClick = (event) => {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  const updateThread = (nextThread) => {
    setThreads((current) => {
      const rest = current.filter((thread) => thread._id !== nextThread._id);
      return [nextThread, ...rest];
    });
  };

  const markAsRead = async (thread) => {
    if (!thread || !thread.adminUnreadCount) return;

    try {
      const { data } = await api.post(`/support/admin/threads/${thread._id}/read`);
      updateThread(data.thread);
      setUnreadCount((current) => Math.max(0, current - (thread.adminUnreadCount || 0)));
    } catch {
      // Keep the dropdown usable even if the read marker fails.
    }
  };

  const handleOpen = async () => {
    setIsOpen((current) => !current);
    if (!isOpen) {
      await loadNotifications(true);
    }
  };

  const handleSelectThread = async (thread) => {
    setSelectedThreadId(thread._id);
    setReplyStatus({ type: '', message: '' });
    await markAsRead(thread);
  };

  const handleReplySubmit = async (threadId) => {
    const draft = String(replyDrafts[threadId] || '').trim();
    if (!draft) {
      setReplyStatus({ type: 'error', message: 'Enter a reply before sending.' });
      return;
    }

    setReplyingThreadId(threadId);
    setReplyStatus({ type: '', message: '' });
    try {
      const { data } = await api.post(`/support/admin/threads/${threadId}/reply`, { message: draft });
      updateThread(data.thread);
      setReplyDrafts((current) => ({ ...current, [threadId]: '' }));
      setReplyStatus({
        type: data.emailDelivered === false ? 'warning' : 'success',
        message: data.message || 'Reply sent successfully.',
      });
    } catch (requestError) {
      setReplyStatus({
        type: 'error',
        message: requestError.response?.data?.message || 'Failed to send reply.',
      });
    } finally {
      setReplyingThreadId('');
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={handleOpen}
        className="relative rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        aria-label="Open support notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-emerald-500 px-1.5 text-[10px] font-bold text-slate-950">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-[min(92vw,820px)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)] dark:border-slate-700/60 dark:bg-[#0F172A]">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700/60">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Admin messages</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Unregistered users and banned users can reach you here.</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
              aria-label="Close support notifications"
            >
              <X size={16} />
            </button>
          </div>

          {isLoading ? (
            <div className="flex h-72 items-center justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="p-5">
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </div>
            </div>
          ) : !threads.length ? (
            <div className="flex h-72 flex-col items-center justify-center gap-3 px-6 text-center text-slate-500 dark:text-slate-400">
              <MessageSquareText className="h-10 w-10" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">No support messages yet</p>
              <p className="max-w-sm text-xs">When someone writes to the admin from the account page, their thread will appear here.</p>
            </div>
          ) : (
            <div className="grid max-h-[70vh] min-h-[420px] grid-cols-1 md:grid-cols-[300px_minmax(0,1fr)]">
              <div className="border-b border-slate-200 md:border-b-0 md:border-r dark:border-slate-700/60">
                <div className="max-h-[70vh] overflow-y-auto p-3">
                  {threads.map((thread) => {
                    const isSelected = selectedThread?._id === thread._id;
                    return (
                      <button
                        key={thread._id}
                        type="button"
                        onClick={() => handleSelectThread(thread)}
                        className={`mb-2 w-full rounded-2xl border px-4 py-3 text-left transition ${
                          isSelected
                            ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-500/40 dark:bg-emerald-500/10'
                            : 'border-transparent bg-slate-50 hover:border-slate-200 hover:bg-slate-100 dark:bg-slate-900/70 dark:hover:border-slate-700 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{thread.email}</p>
                            <p className="mt-1 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{thread.lastMessagePreview}</p>
                          </div>
                          {thread.adminUnreadCount > 0 && (
                            <span className="rounded-full bg-emerald-500 px-2 py-1 text-[10px] font-bold text-slate-950">
                              {thread.adminUnreadCount}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusStyles[thread.requesterStatus] || statusStyles.guest}`}>
                            {statusLabels[thread.requesterStatus] || 'Guest'}
                          </span>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">{formatTimestamp(thread.lastMessageAt)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex min-h-0 flex-col">
                {selectedThread && (
                  <>
                    <div className="border-b border-slate-200 px-5 py-4 dark:border-slate-700/60">
                      <div className="flex flex-wrap items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{selectedThread.email}</span>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${statusStyles[selectedThread.requesterStatus] || statusStyles.guest}`}>
                          {statusLabels[selectedThread.requesterStatus] || 'Guest'}
                        </span>
                        {selectedThread.requesterStatus === 'banned' && <ShieldAlert className="h-4 w-4 text-rose-400" />}
                      </div>
                    </div>

                    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-5 py-4">
                      {selectedThread.messages.map((message, index) => {
                        const isAdminMessage = message.senderType === 'admin';
                        return (
                          <div
                            key={`${selectedThread._id}-${index}-${message.createdAt}`}
                            className={`max-w-[90%] rounded-2xl px-4 py-3 ${
                              isAdminMessage
                                ? 'ml-auto bg-blue-500 text-white'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100'
                            }`}
                          >
                            <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-80">
                              {isAdminMessage ? <ShieldAlert className="h-3.5 w-3.5" /> : <UserRound className="h-3.5 w-3.5" />}
                              <span>{senderLabels[message.senderType] || 'User'}</span>
                              <span>{formatTimestamp(message.createdAt)}</span>
                            </div>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
                          </div>
                        );
                      })}
                    </div>

                    <div className="border-t border-slate-200 px-5 py-4 dark:border-slate-700/60">
                      {replyStatus.message && (
                        <div
                          className={`mb-3 rounded-2xl px-4 py-3 text-sm ${
                            replyStatus.type === 'success'
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200'
                              : replyStatus.type === 'warning'
                                ? 'border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200'
                                : 'border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
                          }`}
                        >
                          {replyStatus.message}
                        </div>
                      )}

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/70">
                        <textarea
                          rows={4}
                          value={replyDrafts[selectedThread._id] || ''}
                          onChange={(event) =>
                            setReplyDrafts((current) => ({
                              ...current,
                              [selectedThread._id]: event.target.value,
                            }))
                          }
                          placeholder="Reply to this user. Your reply will be emailed to them."
                          className="w-full resize-none bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                        />
                        <div className="mt-3 flex items-center justify-between gap-3">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Replies are delivered to the email shown above.</p>
                          <button
                            type="button"
                            onClick={() => handleReplySubmit(selectedThread._id)}
                            disabled={replyingThreadId === selectedThread._id}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Send className="h-4 w-4" />
                            {replyingThreadId === selectedThread._id ? 'Emailing...' : 'Email reply'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminSupportNotifications;