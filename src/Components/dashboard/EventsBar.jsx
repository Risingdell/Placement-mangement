import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllEvents } from '../../services/eventService';

const TYPE_CONFIG = {
  Talk:      { bg: 'bg-blue-500/10',    border: 'border-blue-500/30',    text: 'text-blue-300',    dot: 'bg-blue-400' },
  Workshop:  { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-300', dot: 'bg-emerald-400' },
  Interview: { bg: 'bg-violet-500/10',  border: 'border-violet-500/30',  text: 'text-violet-300',  dot: 'bg-violet-400' },
  Seminar:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/30',   text: 'text-amber-300',   dot: 'bg-amber-400' },
  Other:     { bg: 'bg-zinc-500/10',    border: 'border-zinc-500/30',    text: 'text-zinc-400',    dot: 'bg-zinc-500' },
};

function EventsBar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllEvents(null, true)
      .then(res => setEvents(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Upcoming Events
        </h3>
        <button
          onClick={() => navigate('/dashboard/events')}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors border-none bg-transparent cursor-pointer"
        >
          View all →
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-[#2f2f36] bg-[#24242b] p-4 space-y-2">
              <div className="skeleton-dark h-3 w-16 rounded" />
              <div className="skeleton-dark h-4 w-3/4 rounded" />
              <div className="skeleton-dark h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <svg className="w-10 h-10 text-zinc-700 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-zinc-500">No upcoming events scheduled</p>
          <p className="text-xs text-zinc-600 mt-1">Check back later</p>
        </div>
      ) : (
        <div className="space-y-3 overflow-y-auto max-h-[420px] pr-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {events.map(ev => {
            const type = ev.event_type || ev.type || 'Other';
            const cfg = TYPE_CONFIG[type] || TYPE_CONFIG.Other;
            const dateStr = ev.event_date || ev.date || '';
            const formatted = dateStr
              ? new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
              : null;

            return (
              <div
                key={ev.id}
                onClick={() => navigate('/dashboard/events')}
                className="border border-[#2f2f36] bg-[#24242b] p-4 cursor-pointer hover:border-[#3d3d47] hover:bg-[#26262e] transition-all group"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                    {type}
                  </span>
                  {formatted && (
                    <span className="text-[11px] text-zinc-500">{formatted}</span>
                  )}
                </div>

                <h4 className="text-sm font-semibold text-zinc-100 group-hover:text-white leading-snug">
                  {ev.title}
                </h4>

                {ev.description && (
                  <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{ev.description}</p>
                )}

                {ev.location && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <svg className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs text-zinc-500 truncate">{ev.location}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EventsBar;
