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
        // Update local state to reflect read status
        setMessages(prev => prev.map(m =>
          m.id === message.id ? { ...m, is_read: true } : m
        ));
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
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const toggleReadStatus = async (e, message) => {
    e.stopPropagation();
    try {
      if (message.is_read) {
        await inboxService.markAsUnread(message.id);
      } else {
        await inboxService.markAsRead(message.id);
      }
      setMessages(prev => prev.map(m =>
        m.id === message.id ? { ...m, is_read: !m.is_read } : m
      ));
    } catch (err) {
      alert('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Inbox</h2>
          <p className="text-slate-600 mt-1">Messages and notifications from placement office</p>
        </div>
        <button
          onClick={() => fetchMessages(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px]">
        {/* Message List */}
        <div className={`lg:col-span-5 border-r border-slate-200 flex flex-col ${selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-slate-200 bg-slate-50/50">
            <h3 className="font-semibold text-slate-700">All Messages</h3>
          </div>
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <span className="text-4xl mb-4">📬</span>
                <h4 className="text-lg font-medium text-slate-700">Your inbox is empty</h4>
                <p className="text-sm text-slate-500 max-w-[200px]">When you receive notifications, they will appear here.</p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg)}
                  className={`p-4 border-b border-slate-100 cursor-pointer transition-colors relative group ${selectedMessage?.id === msg.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : 'hover:bg-slate-50'
                    } ${!msg.is_read ? 'font-semibold' : ''}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${msg.message_type === 'Notification' ? 'bg-blue-100 text-blue-700' :
                      msg.message_type === 'Official' ? 'bg-indigo-100 text-indigo-700 font-bold border border-indigo-200' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                      {msg.message_type === 'Official' ? 'Verified Official' : msg.message_type}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {format(new Date(msg.sent_at), 'MMM d, p')}
                    </span>
                  </div>
                  <h4 className="text-sm text-slate-800 line-clamp-1 pr-8">{msg.subject}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1">{msg.message}</p>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => toggleReadStatus(e, msg)}
                      className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-indigo-600 transition-colors shadow-sm bg-slate-50"
                      title={msg.is_read ? 'Mark as unread' : 'Mark as read'}
                    >
                      {msg.is_read ? '📩' : '📖'}
                    </button>
                    <button
                      onClick={(e) => handleDeleteMessage(e, msg.id)}
                      className="p-1.5 hover:bg-white rounded-md text-slate-400 hover:text-red-600 transition-colors shadow-sm bg-slate-50"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`lg:col-span-7 flex flex-col ${!selectedMessage ? 'hidden lg:flex' : 'flex'}`}>
          {selectedMessage ? (
            <div className="flex flex-col h-full bg-white">
              <div className="p-4 border-b border-slate-200 flex items-center justify-between lg:justify-end gap-2">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg"
                >
                  ← Back
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleReadStatus(e, selectedMessage)}
                    className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    {selectedMessage.is_read ? 'Mark as Unread' : 'Mark as Read'}
                  </button>
                  <button
                    onClick={(e) => handleDeleteMessage(e, selectedMessage.id)}
                    className="px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="p-8 flex-1 overflow-y-auto">
                <div className="mb-6 pb-6 border-b border-slate-100">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                      {selectedMessage.subject}
                    </h2>
                    <span className="text-sm text-slate-400 bg-slate-50 px-3 py-1 rounded-full whitespace-nowrap">
                      {format(new Date(selectedMessage.sent_at), 'MMMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                      PO
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-800">Placement Office</p>
                        {selectedMessage.message_type === 'Official' && (
                          <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <span>✓</span> OFFICIAL
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">to me</p>
                    </div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed">
                  {selectedMessage.company_name && (
                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6">
                      <p className="text-sm text-indigo-800 flex items-center gap-2">
                        <span>🏢</span>
                        Related Drive: <strong>{selectedMessage.company_name}</strong> {selectedMessage.role && `- ${selectedMessage.role}`}
                      </p>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>

                {selectedMessage.action_url && (
                  <div className="mt-10">
                    <a
                      href={selectedMessage.action_url}
                      className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                    >
                      View Details →
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12 text-center bg-slate-50/30">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-4xl">
                ✉️
              </div>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Select a message to read</h3>
              <p className="text-sm max-w-xs leading-relaxed">
                Click on any notification in the list on the left to view the full content and related details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InboxPage;
