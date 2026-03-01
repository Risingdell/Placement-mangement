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
      <div style={styles.container}>
        <h3 style={styles.title}>Recent Messages</h3>
        <div style={styles.loadingText}>Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Recent Messages</h3>
        <div style={styles.errorText}>
          {error}
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Recent Messages</h3>
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>ðŸ“¬</span>
          <p style={styles.emptyText}>Your inbox is empty</p>
          <p style={styles.emptySubtext}>No new messages</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <h3 style={styles.title}>Recent Messages</h3>
          {unreadCount > 0 && (
            <span style={styles.unreadBadge}>{unreadCount}</span>
          )}
        </div>
        <button
          onClick={() => navigate('/dashboard/inbox')}
          style={styles.viewAllLink}
        >
          View All â†’
        </button>
      </div>

      <div style={styles.messagesList}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              ...styles.messageItem,
              ...(message.is_read === false ? styles.messageItemUnread : {}),
            }}
            onClick={() => navigate('/dashboard/inbox')}
          >
            <div style={styles.messageHeader}>
              <div style={styles.messageTopRow}>
                {message.is_read === false && (
                  <span style={styles.unreadDot} />
                )}
                <h4
                  style={{
                    ...styles.messageTitle,
                    ...(message.is_read === false ? styles.messageTitleUnread : {}),
                  }}
                >
                  {message.title}
                </h4>
              </div>
              {message.type && (
                <span
                  style={{
                    ...styles.typeBadge,
                    backgroundColor: getMessageTypeColor(message.type),
                  }}
                  title={message.type}
                >
                  {message.type === 'Info' && 'ðŸ“‹'}
                  {message.type === 'Success' && 'âœ“'}
                  {message.type === 'Warning' && 'âš '}
                  {message.type === 'Error' && 'âœ—'}
                </span>
              )}
            </div>

            <p style={styles.messagePreview}>
              {message.message && message.message.length > 80
                ? `${message.message.substring(0, 80)}...`
                : message.message || 'No preview available'}
            </p>

            <div style={styles.messageFooter}>
              <span style={styles.messageTime}>
                {formatTimeAgo(message.created_at)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/dashboard/inbox')}
        style={styles.viewAllButton}
      >
        View All Messages
        {unreadCount > 0 && ` (${unreadCount} unread)`}
      </button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#f44336',
    color: '#fff',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
    minWidth: '20px',
    textAlign: 'center',
  },
  viewAllLink: {
    background: 'none',
    border: 'none',
    color: '#2196F3',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    padding: '4px 8px',
    transition: 'color 0.3s',
  },
  messagesList: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '16px',
  },
  messageItem: {
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '14px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
  },
  messageItemUnread: {
    borderLeft: '4px solid #2196F3',
    backgroundColor: '#f5f9ff',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    gap: '8px',
  },
  messageTopRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#2196F3',
    borderRadius: '50%',
    flexShrink: 0,
  },
  messageTitle: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#555',
  },
  messageTitleUnread: {
    fontWeight: '600',
    color: '#333',
  },
  typeBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    color: '#fff',
    flexShrink: 0,
  },
  messagePreview: {
    margin: '0 0 8px 0',
    fontSize: '0.85rem',
    color: '#666',
    lineHeight: '1.4',
  },
  messageFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: '0.75rem',
    color: '#999',
  },
  viewAllButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  loadingText: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999',
    fontSize: '0.95rem',
  },
  errorText: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#f44336',
    fontSize: '0.95rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '16px',
  },
  emptyText: {
    margin: '0 0 8px 0',
    color: '#666',
    fontSize: '1rem',
    fontWeight: '500',
  },
  emptySubtext: {
    margin: 0,
    color: '#999',
    fontSize: '0.9rem',
  },
};

export default InboxPreview;

