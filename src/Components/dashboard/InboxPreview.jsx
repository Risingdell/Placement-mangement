import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import inboxService from '../../services/inboxService';

function InboxPreview() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadInboxData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Load messages and unread count in parallel
        const [messagesResponse, unreadResponse] = await Promise.all([
          inboxService.getInboxPreview(),
          inboxService.getUnreadCount(),
        ]);

        if (messagesResponse.success) {
          setMessages(messagesResponse.data || []);
        }

        if (unreadResponse.success) {
          setUnreadCount(unreadResponse.data.count || 0);
        }
      } catch (err) {
        console.error('Failed to fetch inbox data:', err);
        setError(err.message || 'Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    loadInboxData();
  }, []);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const sent = new Date(timestamp);
    const diffMs = now - sent;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return sent.toLocaleDateString();
  };

  const getMessageTypeColor = (type) => {
    const colors = {
      Info: '#2196F3',
      Success: '#4CAF50',
      Warning: '#FF9800',
      Error: '#f44336',
    };
    return colors[type] || '#9E9E9E';
  };

  if (loading) {
    return (
      <div className="neo-card !h-full !bg-white p-6">
        <h3 className="neo-widget-header">RECENT MESSAGES</h3>
        <div className="neo-subtitle animate-pulse text-center p-8">LOADING MESSAGES...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="neo-card !h-full !bg-white p-6 border-red-500">
        <h3 className="neo-widget-header">RECENT MESSAGES</h3>
        <div className="neo-error">{error}</div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="neo-card !h-full !bg-white p-6 text-center">
        <h3 className="neo-widget-header">RECENT MESSAGES</h3>
        <div className="py-12">
          <span className="text-5xl block mb-4">📬</span>
          <p className="neo-title !text-lg">INBOX IS EMPTY</p>
          <p className="neo-subtitle">NO NEW MESSAGES</p>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card !h-full !bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h3 className="neo-widget-header !mb-0 border-none !pb-0">RECENT MESSAGES</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold border-2 border-[#323232] rounded shadow-[2px_2px_0px_#323232]">
              {unreadCount} NEW
            </span>
          )}
        </div>
        <button
          onClick={() => navigate('/inbox')}
          className="neo-subtitle font-bold hover:underline cursor-pointer"
        >
          VIEW ALL →
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`neo-list-item cursor-pointer ${!message.is_read ? 'bg-blue-50 !border-blue-600 shadow-[3px_3px_0px_#2563eb]' : ''}`}
            onClick={() => navigate('/inbox')}
          >
            <div className="flex justify-between items-start mb-3 gap-4">
              <div className="flex items-center gap-2">
                {!message.is_read && <div className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />}
                <h4 className={`neo-title !text-[15px] !mb-0 leading-tight ${!message.is_read ? 'text-blue-900' : ''}`}>
                  {message.title.toUpperCase()}
                </h4>
              </div>
              {message.type && (
                <div className="w-6 h-6 border-2 border-[#323232] rounded bg-white flex items-center justify-center text-[12px] shadow-[1px_1px_0px_#323232]">
                  {message.type === 'Info' && '📋'}
                  {message.type === 'Success' && '✓'}
                  {message.type === 'Warning' && '⚠'}
                  {message.type === 'Error' && '✗'}
                </div>
              )}
            </div>

            <p className="neo-subtitle !text-[12px] line-clamp-2 opacity-80 mb-3">
              {message.message}
            </p>

            <div className="flex justify-start">
              <span className="neo-subtitle !text-[10px] font-bold opacity-60 italic">
                {formatTimeAgo(message.created_at).toUpperCase()}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/inbox')}
        className="neo-button"
      >
        VIEW ALL MESSAGES {unreadCount > 0 && `(${unreadCount} UNREAD)`}
      </button>
    </div>
  );
}

export default InboxPreview;
