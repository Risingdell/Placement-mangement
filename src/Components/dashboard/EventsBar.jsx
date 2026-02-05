import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import eventService from '../../services/eventService';

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
      <div className="neo-card !h-full !bg-white p-6">
        <h3 className="neo-widget-header">UPCOMING EVENTS</h3>
        <div className="neo-subtitle animate-pulse text-center p-8">LOADING UPCOMING EVENTS...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="neo-card !h-full !bg-white p-6 border-red-500">
        <h3 className="neo-widget-header">UPCOMING EVENTS</h3>
        <div className="neo-error">{error}</div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="neo-card !h-full !bg-white p-6 text-center">
        <h3 className="neo-widget-header">UPCOMING EVENTS</h3>
        <div className="py-12">
          <span className="text-5xl block mb-4">📅</span>
          <p className="neo-title !text-lg">NO UPCOMING EVENTS</p>
          <p className="neo-subtitle">STAY TUNED FOR WORKSHOPS AND SEMINARS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card !h-full !bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="neo-widget-header !mb-0 border-none !pb-0">UPCOMING EVENTS</h3>
        <button
          onClick={() => navigate('/events')}
          className="neo-subtitle font-bold hover:underline cursor-pointer"
        >
          VIEW ALL →
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-6">
        {events.map((event) => (
          <div
            key={event.id}
            className="neo-list-item cursor-pointer flex gap-4"
            onClick={() => navigate('/events')}
          >
            <div className="w-1.5 h-full bg-[#323232] rounded-full shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-3 gap-4">
                <h4 className="neo-title !text-lg !mb-0 leading-tight">{event.title.toUpperCase()}</h4>
                <div
                  className="px-2 py-0.5 border-2 border-[#323232] rounded text-[10px] font-bold shadow-[1px_1px_0px_#323232] bg-indigo-100"
                >
                  {event.event_type.toUpperCase()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">📅</span>
                  <span className="neo-subtitle !text-[11px]">{formatEventDate(event.event_date).toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px]">🕒</span>
                  <span className="neo-subtitle !text-[11px]">{formatEventTime(event.event_date).toUpperCase()}</span>
                </div>
                {event.location && (
                  <div className="flex items-center gap-2 col-span-2">
                    <span className="text-[14px]">📍</span>
                    <span className="neo-subtitle !text-[11px] truncate">{event.location.toUpperCase()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/events')}
        className="neo-button"
      >
        VIEW ALL EVENTS
      </button>
    </div>
  );
}

export default EventsBar;
