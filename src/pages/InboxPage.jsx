import { useState, useEffect } from 'react';
import inboxService from '../services/inboxService';
import { format } from 'date-fns';

function InboxPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchMessages = async (quiet = false) => {
    try {
      if (!quiet) setLoading(true);
      else setIsRefreshing(true);

      const response = await inboxService.getMyMessages();
      setMessages(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages. Please try again later.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      try {
        await inboxService.markAsRead(message.id);
        setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m)));
      } catch (err) {
        console.error('Error marking as read:', err);
      }
    }
  };

  const handleDeleteMessage = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await inboxService.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const toggleReadStatus = async (e, message) => {
    e.stopPropagation();
    try {
      if (message.is_read) await inboxService.markAsUnread(message.id);
      else await inboxService.markAsRead(message.id);
      setMessages((prev) => prev.map((m) => (m.id === message.id ? { ...m, is_read: !m.is_read } : m)));
      if (selectedMessage?.id === message.id) {
        setSelectedMessage((prev) => ({ ...prev, is_read: !prev.is_read }));
      }
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-zinc-400">Loading inbox...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6 flex justify-between items-center gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">Inbox</h2>
          <p className="text-zinc-400 mt-1 text-sm">Messages and notifications from placement office</p>
        </div>
        <button
          onClick={() => fetchMessages(true)}
          disabled={isRefreshing}
          className="px-4 py-2 rounded-lg border border-[#34343d] bg-[#1f1f24] text-sm text-zinc-300 hover:bg-[#282830] cursor-pointer"
        >
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 rounded-2xl border border-[#2f2f36] bg-[#1d1d22] overflow-hidden min-h-[620px]">
        <div className={`lg:col-span-5 border-r border-[#2a2a31] flex flex-col ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-[#2a2a31]">
            <h3 className="font-semibold text-zinc-100">All Messages</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[620px]">
            {messages.length === 0 ? (
              <div className="h-full grid place-items-center p-10 text-center">
                <div>
                  <p className="text-zinc-300 font-medium">Your inbox is empty</p>
                  <p className="text-xs text-zinc-500 mt-1">New notifications will appear here.</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 border-b border-[#27272f] cursor-pointer transition-colors relative group ${
                    selectedMessage?.id === msg.id ? 'bg-[#25252d] border-l-2 border-l-[#f7b545]' : 'hover:bg-[#23232a]'
                  } ${!msg.is_read ? 'font-semibold' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider bg-[#2b2b33] text-zinc-300 border border-[#3a3a43]">
                      {msg.message_type}
                    </span>
                    <span className="text-[11px] text-zinc-500">{format(new Date(msg.sent_at), 'MMM d, p')}</span>
                  </div>
                  <h4 className="text-sm text-zinc-100 line-clamp-1 pr-8">{msg.subject}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{msg.message}</p>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => toggleReadStatus(e, msg)}
                      className="px-2 py-1 rounded bg-[#2b2b33] text-zinc-300 text-xs border border-[#3a3a43] cursor-pointer"
                    >
                      {msg.is_read ? 'Unread' : 'Read'}
                    </button>
                    <button
                      onClick={(e) => handleDeleteMessage(e, msg.id)}
                      className="px-2 py-1 rounded bg-red-500/15 text-red-300 text-xs border border-red-500/30 cursor-pointer"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={`lg:col-span-7 flex flex-col ${!selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-[#2a2a31] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="lg:hidden px-3 py-1.5 rounded-lg bg-[#25252d] text-zinc-300 text-xs border border-[#35353f] cursor-pointer"
                >
                  Back
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={(e) => toggleReadStatus(e, selectedMessage)}
                    className="px-3 py-1.5 text-xs border border-[#35353f] rounded-lg bg-[#25252d] text-zinc-300 cursor-pointer"
                  >
                    {selectedMessage.is_read ? 'Mark Unread' : 'Mark Read'}
                  </button>
                  <button
                    onClick={(e) => handleDeleteMessage(e, selectedMessage.id)}
                    className="px-3 py-1.5 text-xs border border-red-500/30 bg-red-500/10 text-red-300 rounded-lg cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="p-6 md:p-8 flex-1 overflow-y-auto">
                <div className="mb-6 pb-6 border-b border-[#2a2a31]">
                  <div className="flex justify-between items-start gap-3">
                    <h2 className="text-2xl font-semibold text-zinc-100 leading-tight">{selectedMessage.subject}</h2>
                    <span className="text-xs text-zinc-400 bg-[#25252d] px-3 py-1 rounded-full whitespace-nowrap border border-[#35353f]">
                      {format(new Date(selectedMessage.sent_at), 'MMMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 mt-3">Placement Office</p>
                </div>

                {selectedMessage.company_name && (
                  <div className="rounded-xl border border-[#3b3320] bg-[#2b2419] p-4 mb-5">
                    <p className="text-sm text-amber-200">
                      Related Drive: <strong>{selectedMessage.company_name}</strong> {selectedMessage.role && `- ${selectedMessage.role}`}
                    </p>
                  </div>
                )}

                <p className="text-sm leading-7 text-zinc-300 whitespace-pre-wrap">{selectedMessage.message}</p>

                {selectedMessage.action_url && (
                  <div className="mt-8">
                    <a
                      href={selectedMessage.action_url}
                      className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#f7b545] text-[#1a1a1f] font-semibold text-sm hover:bg-[#f9c46c]"
                    >
                      View Details
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full grid place-items-center text-center p-10">
              <div>
                <h3 className="text-lg font-semibold text-zinc-300 mb-2">Select a message to read</h3>
                <p className="text-sm text-zinc-500">Choose any item from the left panel.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InboxPage;
