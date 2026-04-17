import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import {
  MdClose, MdPeopleAlt, MdPersonAdd, MdPersonRemove,
  MdSearch, MdAdd, MdCheckBox, MdCheckBoxOutlineBlank,
} from 'react-icons/md';
import { getDriveAttendees, addDriveAttendees, removeDriveAttendee, getNonAttendees } from '../../services/attendeeService';

function DriveAttendeesModal({ drive, isOpen, onClose, onAttendeesUpdated }) {
  const { adminTheme } = useOutletContext() || {};
  const isLight = adminTheme !== 'dark';

  const modalBg = isLight ? 'bg-white'        : 'bg-[#1e1e22]';
  const txt     = isLight ? 'text-gray-900'   : 'text-[#e8e8ed]';
  const sub     = isLight ? 'text-gray-500'   : 'text-[#8e8e93]';
  const inp     = isLight ? 'bg-white border-gray-300 text-gray-900'    : 'bg-[#2a2a2f] border-[#3f3f46] text-[#e8e8ed]';
  const divider = isLight ? 'border-gray-200' : 'border-[#2f2f34]';
  const theadBg = isLight ? 'bg-gray-50'      : 'bg-[#252528]';
  const rowHov  = isLight ? 'hover:bg-gray-50' : 'hover:bg-[#28282c]';
  const overlay = isLight ? 'bg-gray-900/50'  : 'bg-black/60';
  const panelBg = isLight ? 'bg-blue-50 border-blue-200' : 'bg-blue-950/30 border-blue-900/50';

  const [attendees, setAttendees] = useState([]);
  const [nonAttendees, setNonAttendees] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [tab, setTab] = useState('attendees');
  const [addingAttendees, setAddingAttendees] = useState(false);

  useEffect(() => {
    if (isOpen && drive) fetchAttendees();
  }, [isOpen, drive]);

  const fetchAttendees = async () => {
    try {
      setLoading(true); setError(null);
      const res = await getDriveAttendees(drive.id);
      if (res.success) setAttendees(res.data);
      else setError('Failed to load attendees');
    } catch { setError('Error loading attendees'); }
    finally { setLoading(false); }
  };

  const fetchNonAttendees = async () => {
    try {
      setLoading(true); setError(null);
      const res = await getNonAttendees(drive.id, {
        search: searchTerm || undefined,
        filter: filterType === 'all' ? undefined : filterType,
      });
      if (res.success) setNonAttendees(res.data);
      else setError('Failed to load students');
    } catch { setError('Error loading student list'); }
    finally { setLoading(false); }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === 'add') { setSelectedStudents([]); setSearchTerm(''); fetchNonAttendees(); }
  };

  const handleStudentSelect = (id) =>
    setSelectedStudents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleAddAttendees = async () => {
    if (!selectedStudents.length) { setError('Please select at least one student'); return; }
    try {
      setAddingAttendees(true); setError(null);
      const res = await addDriveAttendees(drive.id, selectedStudents);
      if (res.success) {
        setSuccessMessage(`Successfully added ${selectedStudents.length} attendee(s)`);
        setSelectedStudents([]);
        setTab('attendees');
        fetchAttendees();
        onAttendeesUpdated?.();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else setError(res.message || 'Failed to add attendees');
    } catch { setError('Error adding attendees'); }
    finally { setAddingAttendees(false); }
  };

  const handleRemoveAttendee = async (attendeeId, studentName) => {
    if (!confirm(`Remove ${studentName} from attendees?`)) return;
    try {
      const res = await removeDriveAttendee(drive.id, attendeeId);
      if (res.success) {
        setAttendees(attendees.filter(a => a.user_id !== attendeeId));
        setSuccessMessage(`${studentName} removed from attendees`);
        onAttendeesUpdated?.();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else setError('Failed to remove attendee');
    } catch { setError('Error removing attendee'); }
  };

  if (!isOpen || !drive) return null;

  const allSelected = nonAttendees.length > 0 && selectedStudents.length === nonAttendees.length;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={onClose} />

      <div className={`relative w-full max-w-4xl flex flex-col shadow-2xl ${modalBg} z-10 max-h-[90vh]`}>
        {/* Header */}
        <div className={`flex items-start justify-between px-6 py-5 border-b ${divider} flex-shrink-0`}>
          <div>
            <h3 className={`text-xl font-bold ${txt}`}>{drive.company_name} — Manage Attendees</h3>
            <p className={`text-sm ${sub} mt-1`}>
              Drive Date: {new Date(drive.drive_date).toLocaleDateString()} · Total Attended: {attendees.length}
            </p>
          </div>
          <button onClick={onClose} className={`${sub} hover:opacity-70 transition-opacity mt-0.5`}>
            <MdClose size={24} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className={`mx-6 mt-4 px-4 py-3 border ${isLight ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-950/30 border-red-900/50 text-red-400'} text-sm`}>
            {error}
          </div>
        )}
        {successMessage && (
          <div className={`mx-6 mt-4 px-4 py-3 border ${isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-400'} text-sm`}>
            {successMessage}
          </div>
        )}

        {/* Tabs */}
        <div className={`flex border-b ${divider} flex-shrink-0 mx-0`}>
          <button
            onClick={() => handleTabChange('attendees')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors ${
              tab === 'attendees'
                ? `${txt} border-b-2 border-[#f7b545]`
                : `${sub} hover:opacity-80`
            }`}
          >
            <MdPeopleAlt size={18} />
            Current Attendees ({attendees.length})
          </button>
          <button
            onClick={() => handleTabChange('add')}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-semibold transition-colors ${
              tab === 'add'
                ? `${txt} border-b-2 border-[#f7b545]`
                : `${sub} hover:opacity-80`
            }`}
          >
            <MdPersonAdd size={18} />
            Add Students
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {tab === 'attendees' ? (
            <div className="p-6">
              {loading ? (
                <div className="text-center py-10">
                  <div className={`inline-block h-8 w-8 animate-spin border-b-2 border-[#f7b545]`} style={{ borderRadius: '50%' }} />
                  <p className={`mt-3 text-sm ${sub}`}>Loading attendees…</p>
                </div>
              ) : attendees.length === 0 ? (
                <div className="text-center py-14">
                  <MdPeopleAlt size={48} className={`mx-auto mb-3 ${sub}`} />
                  <p className={`text-sm font-semibold ${txt}`}>No attendees marked yet</p>
                  <button
                    onClick={() => handleTabChange('add')}
                    style={{ background: '#f7b545' }}
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-[#1a1a1e] text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <MdPersonAdd size={18} />
                    Add First Attendees
                  </button>
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className={`${theadBg} border-b ${divider} sticky top-0`}>
                    <tr>
                      {['Name', 'USN', 'Attendance Key', 'CGPA', 'Action'].map((h, i) => (
                        <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${sub} uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${divider}`}>
                    {attendees.map(a => (
                      <tr key={a.user_id} className={`${rowHov} transition-colors`}>
                        <td className={`px-4 py-3 font-semibold ${txt}`}>{a.full_name}</td>
                        <td className={`px-4 py-3 font-mono text-xs ${sub}`}>{a.usn}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 text-xs font-bold tracking-wide ${isLight ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-amber-950/30 text-amber-400 border border-amber-900/40'}`}>
                            {a.attendance_key}
                          </span>
                        </td>
                        <td className={`px-4 py-3 ${sub}`}>{a.cgpa ? a.cgpa.toFixed(2) : 'N/A'}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => handleRemoveAttendee(a.user_id, a.full_name)}
                            className="inline-flex items-center gap-1 text-red-500 hover:opacity-70 text-xs font-semibold transition-opacity"
                          >
                            <MdPersonRemove size={16} />
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : (
            <div className="p-6">
              {/* Search & Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div className="relative sm:col-span-2">
                  <MdSearch size={18} className={`absolute left-3 top-1/2 -translate-y-1/2 ${sub}`} />
                  <input
                    type="text"
                    placeholder="Search by name, USN or email…"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                  />
                </div>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className={`w-full px-3 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                >
                  <option value="all">All Students</option>
                  <option value="applied">Applied for this drive</option>
                  <option value="not_applied">Haven't applied</option>
                </select>
              </div>
              <button
                onClick={fetchNonAttendees}
                disabled={loading}
                style={{ background: '#f7b545' }}
                className="mb-5 flex items-center gap-2 px-4 py-2 text-[#1a1a1e] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <MdSearch size={18} />
                {loading ? 'Searching…' : 'Search'}
              </button>

              {loading ? (
                <div className="text-center py-10">
                  <div className={`inline-block h-8 w-8 animate-spin border-b-2 border-[#f7b545]`} style={{ borderRadius: '50%' }} />
                  <p className={`mt-3 text-sm ${sub}`}>Loading students…</p>
                </div>
              ) : nonAttendees.length === 0 ? (
                <div className={`text-center py-8 text-sm ${sub}`}>No students found matching criteria</div>
              ) : (
                <>
                  <div className={`mb-4 px-4 py-2.5 border ${panelBg} text-sm ${isLight ? 'text-blue-800' : 'text-blue-300'}`}>
                    Selected: <strong>{selectedStudents.length}</strong> student(s)
                  </div>
                  <table className="w-full text-sm">
                    <thead className={`${theadBg} border-b ${divider} sticky top-0`}>
                      <tr>
                        <th className="px-4 py-3">
                          <button onClick={() => setSelectedStudents(allSelected ? [] : nonAttendees.map(s => s.id))}>
                            {allSelected
                              ? <MdCheckBox size={18} className="text-[#f7b545]" />
                              : <MdCheckBoxOutlineBlank size={18} className={sub} />
                            }
                          </button>
                        </th>
                        {['Name', 'USN', 'CGPA', 'Applied'].map(h => (
                          <th key={h} className={`px-4 py-3 text-left text-xs font-semibold ${sub} uppercase tracking-wider`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${divider}`}>
                      {nonAttendees.map(s => {
                        const checked = selectedStudents.includes(s.id);
                        return (
                          <tr key={s.id} className={`${rowHov} transition-colors cursor-pointer`} onClick={() => handleStudentSelect(s.id)}>
                            <td className="px-4 py-3">
                              {checked
                                ? <MdCheckBox size={18} className="text-[#f7b545]" />
                                : <MdCheckBoxOutlineBlank size={18} className={sub} />
                              }
                            </td>
                            <td className={`px-4 py-3 font-semibold ${txt}`}>{s.full_name}</td>
                            <td className={`px-4 py-3 font-mono text-xs ${sub}`}>{s.usn}</td>
                            <td className={`px-4 py-3 ${sub}`}>{s.cgpa ? s.cgpa.toFixed(2) : 'N/A'}</td>
                            <td className="px-4 py-3">
                              {s.applied_count > 0
                                ? <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700">Yes</span>
                                : <span className={`px-2 py-0.5 text-xs font-semibold ${isLight ? 'bg-gray-100 text-gray-600' : 'bg-[#2a2a2f] text-[#8e8e93]'}`}>No</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex justify-end gap-3 px-6 py-5 border-t ${divider} ${isLight ? 'bg-gray-50' : 'bg-[#252528]'} flex-shrink-0`}>
          {tab === 'add' && selectedStudents.length > 0 && (
            <button
              onClick={handleAddAttendees}
              disabled={addingAttendees}
              style={{ background: '#f7b545' }}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-[#1a1a1e] text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              <MdAdd size={18} />
              {addingAttendees ? 'Adding…' : `Add Selected (${selectedStudents.length})`}
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-5 py-2.5 border ${divider} ${txt} text-sm font-semibold hover:opacity-70 transition-opacity`}
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default DriveAttendeesModal;
