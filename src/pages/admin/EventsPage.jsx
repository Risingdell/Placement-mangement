import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../../services/eventService';
import { invalidateCache } from '../../services/api';
import { createPortal } from 'react-dom';

const TYPE_COLORS = {
  Talk:      { text: 'text-blue-400',    border: 'border-blue-500/30',    bg: 'bg-blue-500/10'    },
  Workshop:  { text: 'text-emerald-400', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10' },
  Interview: { text: 'text-violet-400',  border: 'border-violet-500/30',  bg: 'bg-violet-500/10'  },
  Seminar:   { text: 'text-amber-400',   border: 'border-amber-500/30',   bg: 'bg-amber-500/10'   },
  Other:     { text: 'text-zinc-400',    border: 'border-zinc-500/30',    bg: 'bg-zinc-500/10'    },
};

const EVENT_TYPES = ['Talk', 'Workshop', 'Interview', 'Seminar', 'Other'];

const EMPTY_FORM = {
  title: '', description: '', event_date: '', event_time: '',
  location: '', type: '', max_attendees: '',
};

function EventsPage() {
  const { adminTheme } = useOutletContext() || {};
  const isLight = adminTheme === 'light';

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  // theme tokens
  const txt     = isLight ? 'text-[#111827]' : 'text-zinc-100';
  const sub     = isLight ? 'text-[#6b7280]' : 'text-zinc-400';
  const card    = isLight ? 'bg-white border-[#d1d5db]'      : 'bg-[#1f1f24] border-[#2f2f34]';
  const cardHov = isLight ? 'hover:bg-[#f9fafb]'             : 'hover:bg-[#26262d]';
  const divider = isLight ? 'border-[#e5e7eb]'               : 'border-[#2f2f34]';
  const inp     = isLight
    ? 'bg-white border-[#d1d5db] text-[#111827] placeholder-[#9ca3af] focus:border-[#f7b545]'
    : 'bg-[#26262d] border-[#3a3a40] text-zinc-100 placeholder-[#71717a] focus:border-[#f7b545]';
  const modalBg = isLight ? 'bg-white border-[#d1d5db]'      : 'bg-[#1a1a1e] border-[#2f2f34]';
  const label   = `block text-[10px] font-semibold uppercase tracking-widest mb-1.5 ${sub}`;

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await getAllEvents(filterType || null);
      setEvents(Array.isArray(res?.data) ? res.data : []);
    } catch { setEvents([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, [filterType]); // eslint-disable-line

  const openAdd = () => {
    setModalMode('add'); setFormData(EMPTY_FORM); setFormError(''); setShowModal(true);
  };
  const openEdit = (ev) => {
    setModalMode('edit'); setSelectedEvent(ev);
    setFormData({
      title: ev.title || '',
      description: ev.description || '',
      event_date: (ev.event_date || ev.date || '').split('T')[0],
      event_time: ev.event_time || ev.time || '',
      location: ev.location || '',
      type: ev.type || ev.event_type || '',
      max_attendees: String(ev.max_attendees || ''),
    });
    setFormError(''); setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      invalidateCache('/events');
    } catch { alert('Failed to delete event.'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setFormError('');
    const payload = {
      title: formData.title, eventType: formData.type,
      eventDate: formData.event_date, location: formData.location,
      description: formData.description,
    };
    try {
      setSaving(true);
      if (modalMode === 'add') {
        const res = await createEvent(payload);
        setEvents(prev => [{
          id: res?.data?.id ?? Date.now(),
          title: formData.title, event_type: formData.type || 'Other',
          description: formData.description, event_date: formData.event_date,
          event_time: formData.event_time, location: formData.location,
          max_attendees: formData.max_attendees || null,
        }, ...prev]);
      } else {
        await updateEvent(selectedEvent.id, payload);
        setEvents(prev => prev.map(ev =>
          ev.id === selectedEvent.id
            ? { ...ev, title: formData.title, event_type: formData.type || ev.event_type,
                description: formData.description, event_date: formData.event_date,
                event_time: formData.event_time, location: formData.location,
                max_attendees: formData.max_attendees || ev.max_attendees }
            : ev
        ));
      }
      invalidateCache('/events');
      setShowModal(false);
    } catch (err) {
      setFormError(err?.message || 'Failed to save event.');
    } finally { setSaving(false); }
  };

  const filtered = filterType ? events.filter(e => (e.type || e.event_type) === filterType) : events;

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className={`text-xl font-bold ${txt}`}>Events</h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#f7b545] hover:bg-[#e5a530] text-[#1a1a1e] text-sm font-bold tracking-wide transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Event
        </button>
      </div>

      {/* Type filter chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {['', ...EVENT_TYPES].map(t => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`px-3 py-1 text-xs font-semibold border transition-colors ${
              filterType === t
                ? 'bg-[#f7b545] border-[#f7b545] text-[#1a1a1e]'
                : `${isLight ? 'border-[#d1d5db] text-[#6b7280] hover:bg-[#f3f4f6]' : 'border-[#3a3a40] text-zinc-400 hover:bg-[#26262d]'}`
            }`}
          >
            {t || 'All'}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`border p-5 space-y-3 ${card}`}>
              <div className={`h-4 w-20 animate-pulse ${isLight ? 'bg-gray-200' : 'bg-[#2f2f34]'}`} />
              <div className={`h-4 w-3/4 animate-pulse ${isLight ? 'bg-gray-200' : 'bg-[#2f2f34]'}`} />
              <div className={`h-4 w-1/2 animate-pulse ${isLight ? 'bg-gray-200' : 'bg-[#2f2f34]'}`} />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className={`border flex flex-col items-center justify-center py-20 text-center ${card}`}>
          <svg className={`w-10 h-10 mb-3 opacity-30 ${sub}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className={`text-sm font-medium ${sub}`}>No events scheduled</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(ev => {
            const type = ev.type || ev.event_type || 'Other';
            const c = TYPE_COLORS[type] || TYPE_COLORS.Other;
            const dateStr = ev.event_date || ev.date || '';
            const timeStr = ev.event_time || ev.time || '';
            return (
              <div key={ev.id} className={`border p-5 flex flex-col transition-colors ${card} ${cardHov}`}>
                <div className="flex items-start justify-between mb-3">
                  <span className={`text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 border ${c.text} ${c.border} ${c.bg}`}>
                    {type}
                  </span>
                  <div className="flex items-center gap-0.5 ml-2">
                    <button onClick={() => openEdit(ev)} className={`p-1.5 transition-colors ${isLight ? 'text-[#6b7280] hover:bg-[#f3f4f6]' : 'text-zinc-400 hover:bg-[#26262d]'}`} title="Edit">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <h3 className={`text-sm font-bold mb-2 flex-1 leading-snug ${txt}`}>{ev.title}</h3>
                {ev.description && (
                  <p className={`text-xs mb-3 line-clamp-2 leading-relaxed ${sub}`}>{ev.description}</p>
                )}

                <div className={`space-y-1.5 text-xs border-t pt-3 mt-auto ${sub} ${divider}`}>
                  {(dateStr || timeStr) && (
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{dateStr ? new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : ''}{timeStr ? ` · ${timeStr}` : ''}</span>
                    </div>
                  )}
                  {ev.location && (
                    <div className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{ev.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal via Portal */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !saving && setShowModal(false)} />
          <div className={`relative w-full max-w-lg border shadow-2xl overflow-hidden ${modalBg}`}>

            {/* Modal header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${divider}`}>
              <div>
                <p className={`text-sm font-bold tracking-wide ${txt}`}>
                  {modalMode === 'add' ? 'Create Event' : 'Edit Event'}
                </p>
              </div>
              <button
                onClick={() => !saving && setShowModal(false)}
                className={`h-8 w-8 flex items-center justify-center transition-colors ${isLight ? 'hover:bg-[#f3f4f6] text-[#6b7280]' : 'hover:bg-[#2a2a2e] text-zinc-400'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 overflow-y-auto max-h-[75vh]">
              {formError && (
                <div className="px-3 py-2 border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
                  {formError}
                </div>
              )}

              <div>
                <label className={label}>Event Title *</label>
                <input type="text" required value={formData.title}
                  onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                  className={`w-full h-10 px-3 border text-sm outline-none transition-colors ${inp}`}
                  placeholder="e.g. Google Pre-Placement Talk" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Event Type</label>
                  <select value={formData.type}
                    onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                    className={`w-full h-10 px-3 border text-sm outline-none transition-colors ${inp}`}>
                    <option value="">Select type</option>
                    {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={label}>Location</label>
                  <input type="text" value={formData.location}
                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                    className={`w-full h-10 px-3 border text-sm outline-none transition-colors ${inp}`}
                    placeholder="e.g. Auditorium" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={label}>Event Date *</label>
                  <input type="date" required value={formData.event_date}
                    onChange={e => setFormData(p => ({ ...p, event_date: e.target.value }))}
                    className={`w-full h-10 px-3 border text-sm outline-none transition-colors ${inp}`} />
                </div>
                <div>
                  <label className={label}>Event Time</label>
                  <input type="time" value={formData.event_time}
                    onChange={e => setFormData(p => ({ ...p, event_time: e.target.value }))}
                    className={`w-full h-10 px-3 border text-sm outline-none transition-colors ${inp}`} />
                </div>
              </div>

              <div>
                <label className={label}>Max Attendees</label>
                <input type="number" min="1" value={formData.max_attendees}
                  onChange={e => setFormData(p => ({ ...p, max_attendees: e.target.value }))}
                  className={`w-full h-10 px-3 border text-sm outline-none transition-colors ${inp}`}
                  placeholder="Leave blank for unlimited" />
              </div>

              <div>
                <label className={label}>Description</label>
                <textarea rows={3} value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className={`w-full px-3 py-2.5 border text-sm outline-none transition-colors resize-none ${inp}`}
                  placeholder="Event details and agenda…" />
              </div>

              <div className={`flex justify-end gap-2 pt-3 border-t ${divider}`}>
                <button type="button" onClick={() => setShowModal(false)} disabled={saving}
                  className={`px-4 py-2 border text-sm font-semibold transition-colors disabled:opacity-50 ${isLight ? 'border-[#d1d5db] hover:bg-[#f3f4f6] text-[#374151]' : 'border-[#3a3a40] hover:bg-[#2a2a2e] text-zinc-300'}`}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-[#f7b545] hover:bg-[#e5a530] text-[#1a1a1e] text-sm font-bold transition-colors disabled:opacity-50">
                  {saving && <div className="h-3.5 w-3.5 border-2 border-[#1a1a1e] border-t-transparent rounded-full animate-spin" />}
                  {saving ? 'Saving…' : modalMode === 'add' ? 'Create Event' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </div>
  );
}

export default EventsPage;
