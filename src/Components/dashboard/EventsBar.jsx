import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService';
import { Skeleton } from '../common/Skeleton';

function EventsBar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUpcomingEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await eventService.getUpcomingEvents();
        if (response.success) {
          setEvents(response.data || []);
        } else {
          setError(response.message || 'Failed to load upcoming events');
        }
      } catch (err) {
        console.error('Failed to fetch upcoming events:', err);
        setError(err.message || 'Failed to load upcoming events');
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingEvents();
  }, []);

  const getEventTypeBadgeColor = (eventType) => {
    const colors = {
      Workshop: '#2196F3',
      Seminar: '#9C27B0',
      'Mock Interview': '#FF9800',
      'Career Fair': '#4CAF50',
      Drive: '#4CAF50',
      Other: '#FF9800',
    };
    return colors[eventType] || '#9E9E9E';
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatEventTime = (dateString) => {
    const date = new Date(dateString);
    const options = { hour: 'numeric', minute: '2-digit', hour12: true };
    return date.toLocaleTimeString('en-US', options);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Upcoming Events</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
          {[...Array(3)].map((_, i) => (
            <div key={i} style={{ border: '1px solid #e0e0e0', borderRadius: '6px', padding: '16px', display: 'flex', gap: '12px' }}>
              <div style={{ width: '4px', backgroundColor: '#e0e0e0', borderRadius: '2px', flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Upcoming Events</h3>
        <div style={styles.errorText}>
          {error}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Upcoming Events</h3>
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>ðŸ“…</span>
          <p style={styles.emptyText}>No upcoming events scheduled</p>
          <p style={styles.emptySubtext}>Stay tuned for workshops and seminars</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Upcoming Events</h3>
        <button
          onClick={() => navigate('/dashboard/events')}
          style={styles.viewAllLink}
        >
          View All â†’
        </button>
      </div>

      <div style={styles.eventsList}>
        {events.map((event) => (
          <div
            key={event.id}
            style={styles.eventItem}
            onClick={() => navigate('/dashboard/events')}
          >
            <div style={styles.eventLeftBorder} />
            <div style={styles.eventContent}>
              <div style={styles.eventHeader}>
                <h4 style={styles.eventTitle}>{event.title}</h4>
                <span
                  style={{
                    ...styles.typeBadge,
                    backgroundColor: getEventTypeBadgeColor(event.event_type),
                  }}
                >
                  {event.event_type}
                </span>
              </div>

              <div style={styles.eventDetails}>
                <div style={styles.eventDetailRow}>
                  <span style={styles.eventIcon}>ðŸ“…</span>
                  <span style={styles.eventDetailText}>
                    {formatEventDate(event.event_date)}
                  </span>
                </div>

                <div style={styles.eventDetailRow}>
                  <span style={styles.eventIcon}>ðŸ•’</span>
                  <span style={styles.eventDetailText}>
                    {formatEventTime(event.event_date)}
                  </span>
                </div>

                {event.location && (
                  <div style={styles.eventDetailRow}>
                    <span style={styles.eventIcon}>ðŸ“</span>
                    <span style={styles.eventDetailText}>
                      {event.location}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/dashboard/events')}
        style={styles.viewAllButton}
      >
        View All Events
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
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#333',
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
  eventsList: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '16px',
  },
  eventItem: {
    position: 'relative',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    gap: '12px',
    ':hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
  },
  eventLeftBorder: {
    width: '4px',
    backgroundColor: '#2196F3',
    borderRadius: '2px',
    flexShrink: 0,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px',
  },
  eventTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  typeBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '0.7rem',
    fontWeight: '600',
    color: '#fff',
    whiteSpace: 'nowrap',
  },
  eventDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  eventDetailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  eventIcon: {
    fontSize: '0.9rem',
  },
  eventDetailText: {
    fontSize: '0.85rem',
    color: '#666',
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

export default EventsBar;

