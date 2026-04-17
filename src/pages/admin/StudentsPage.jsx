import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import studentService from '../../services/studentService';
import inboxService from '../../services/inboxService';
import { Skeleton } from '../../Components/common/Skeleton';

const BRANCHES = ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CIVIL', 'AI&ML', 'DS'];

export default function StudentsPage() {
  const { adminTheme, setIsModalOpen } = useOutletContext() || {};
  const isLight = adminTheme !== 'dark';

  const card    = isLight ? 'bg-white border border-gray-200 shadow-sm'  : 'bg-[#1e1e22] border border-[#2f2f34]';
  const txt     = isLight ? 'text-gray-900'   : 'text-[#e8e8ed]';
  const sub     = isLight ? 'text-gray-500'   : 'text-[#8e8e93]';
  const inp     = isLight ? 'bg-white border-gray-300 text-gray-900'     : 'bg-[#2a2a2f] border-[#3f3f46] text-[#e8e8ed]';
  const modalBg = isLight ? 'bg-white'        : 'bg-[#1e1e22]';
  const divider = isLight ? 'border-gray-200' : 'border-[#2f2f34]';
  const theadBg = isLight ? 'bg-gray-50'      : 'bg-[#252528]';
  const rowHov  = isLight ? 'hover:bg-gray-50/70' : 'hover:bg-[#28282c]';
  const overlay = isLight ? 'bg-gray-900/50'  : 'bg-black/60';
  const recipBg = isLight ? 'bg-gray-50 border-gray-200' : 'bg-[#28282c] border-[#3f3f46]';

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterPlaced, setFilterPlaced] = useState('');

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const [msgSubject, setMsgSubject] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [sending, setSending] = useState(false);

  const anyModal = showProfileModal || showMessageModal;
  useEffect(() => { setIsModalOpen?.(anyModal); }, [anyModal, setIsModalOpen]);

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await studentService.getAllStudents({
        search: search || undefined,
        branch: filterBranch || undefined,
        placed: filterPlaced === '' ? undefined : filterPlaced === 'placed' ? 'true' : 'false',
      });
      setStudents(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [search, filterBranch, filterPlaced]);

  useEffect(() => {
    const t = setTimeout(fetchStudents, 350);
    return () => clearTimeout(t);
  }, [fetchStudents]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !msgSubject.trim() || !msgBody.trim()) return;
    try {
      setSending(true);
      await inboxService.sendMessage({
        recipientId: selectedStudent.id,
        subject: msgSubject,
        message: msgBody,
        messageType: 'Announcement',
      });
      setShowMessageModal(false);
      setMsgSubject('');
      setMsgBody('');
      alert('Message sent successfully!');
    } catch {
      alert('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const placed  = students.filter((s) => s.is_placed);
  const unplaced = students.filter((s) => !s.is_placed);
  const avgCgpa = students.length
    ? (students.reduce((sum, s) => sum + Number(s.cgpa || 0), 0) / students.length).toFixed(2)
    : '—';

  const cgpaColor = (val) =>
    Number(val) >= 8.5 ? 'text-emerald-600' : Number(val) >= 7.0 ? 'text-indigo-600' : 'text-amber-600';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold ${txt}`}>Student Management</h2>
          <p className={`text-sm ${sub} mt-0.5`}>View and manage registered students</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: students.length,  color: txt },
          { label: 'Placed',         value: placed.length,    color: 'text-emerald-600' },
          { label: 'Unplaced',       value: unplaced.length,  color: 'text-amber-600' },
          { label: 'Avg. CGPA',      value: avgCgpa,          color: 'text-indigo-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${card} p-4`}>
            <p className={`text-xs font-semibold ${sub} uppercase tracking-wide mb-1`}>{label}</p>
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${card} p-4`}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, USN or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-4 h-9 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
            />
          </div>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className={`h-9 px-3 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
          >
            <option value="">All Branches</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={filterPlaced}
            onChange={(e) => setFilterPlaced(e.target.value)}
            className={`h-9 px-3 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
          >
            <option value="">All Status</option>
            <option value="placed">Placed</option>
            <option value="unplaced">Unplaced</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={`border ${isLight ? 'bg-red-50 border-red-200' : 'bg-red-950/30 border-red-900/50'} px-4 py-3 flex items-center gap-3`}>
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-red-600 flex-1">{error}</p>
          <button onClick={fetchStudents} className="text-sm text-red-600 font-semibold underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className={`${card} overflow-hidden`}>
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <Skeleton className="h-4" /><Skeleton className="h-4" />
                  <Skeleton className="h-4" /><Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className={`w-12 h-12 ${sub} mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
            </svg>
            <p className={`text-sm font-semibold ${txt}`}>No students found</p>
            <p className={`text-xs ${sub} mt-1`}>Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`${theadBg} border-b ${divider}`}>
                  {['Student', 'USN', 'Branch / Year', 'CGPA', 'Backlogs', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-5 py-3 text-[11px] font-semibold ${sub} uppercase tracking-wider ${i === 6 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {students.map((s) => (
                  <tr key={s.id} className={`${rowHov} transition-colors`}>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                          <span className="text-[#1a1a1e] font-bold text-xs">{(s.name || 'S').charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className={`font-semibold ${txt} truncate`}>{s.name}</p>
                          <p className={`${sub} text-xs truncate`}>{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className={`px-5 py-3.5 font-mono ${sub} text-xs`}>{s.usn || '—'}</td>
                    <td className={`px-5 py-3.5 ${txt}`}>{s.branch || '—'}{s.year ? ` · ${s.year}` : ''}</td>
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold tabular-nums ${cgpaColor(s.cgpa)}`}>
                        {s.cgpa ? Number(s.cgpa).toFixed(2) : '—'}
                      </span>
                    </td>
                    <td className={`px-5 py-3.5 ${txt} tabular-nums`}>{s.backlogs ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      {s.is_placed
                        ? <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                            Placed{s.placed_company ? ` @ ${s.placed_company}` : ''}
                          </span>
                        : <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800">Unplaced</span>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedStudent(s); setShowProfileModal(true); }}
                          className={`px-3 py-1.5 text-xs font-semibold ${isLight ? 'text-indigo-600 hover:bg-indigo-50 border border-indigo-200' : 'text-indigo-400 hover:bg-indigo-950/40 border border-indigo-900/50'} transition-colors`}
                        >
                          View
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(s); setShowMessageModal(true); }}
                          className={`px-3 py-1.5 text-xs font-semibold border ${divider} ${txt} hover:opacity-70 transition-opacity`}
                        >
                          Message
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className={`px-5 py-3 border-t ${divider} text-xs ${sub}`}>
              Showing <span className={`font-semibold ${txt}`}>{students.length}</span> student{students.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedStudent && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={() => setShowProfileModal(false)} />
          <div className={`relative w-full max-w-xl shadow-2xl overflow-hidden ${modalBg}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${divider}`}>
              <h3 className={`text-base font-semibold ${txt}`}>Student Profile</h3>
              <button onClick={() => setShowProfileModal(false)} className={`p-1.5 ${sub} hover:${txt} transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center text-[#1a1a1e] font-bold text-xl flex-shrink-0">
                  {(selectedStudent.name || 'S').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className={`text-lg font-bold ${txt}`}>{selectedStudent.name}</h4>
                  <p className={`text-sm ${sub}`}>{selectedStudent.usn}</p>
                </div>
                <div className="ml-auto">
                  {selectedStudent.is_placed
                    ? <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-100 text-emerald-800">Placed</span>
                    : <span className="px-2.5 py-0.5 text-[11px] font-semibold bg-amber-100 text-amber-800">Unplaced</span>
                  }
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                {[
                  ['Email', selectedStudent.email],
                  ['Phone', selectedStudent.phone || '—'],
                  ['Branch', selectedStudent.branch || '—'],
                  ['Batch Year', selectedStudent.year || '—'],
                  ['CGPA', selectedStudent.cgpa ? Number(selectedStudent.cgpa).toFixed(2) : '—'],
                  ['Backlogs', selectedStudent.backlogs ?? '—'],
                  ...(selectedStudent.placed_company ? [['Placed At', selectedStudent.placed_company]] : []),
                  ...(selectedStudent.ctc ? [['CTC', `${selectedStudent.ctc} LPA`]] : []),
                  ...(selectedStudent.whatsapp_number ? [['WhatsApp', selectedStudent.whatsapp_number]] : []),
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className={`text-xs ${sub} font-medium mb-0.5`}>{label}</p>
                    <p className={`text-sm font-semibold ${txt}`}>{value}</p>
                  </div>
                ))}
              </div>
              <div className={`mt-6 pt-4 border-t ${divider} flex justify-end gap-2`}>
                <button
                  onClick={() => { setShowProfileModal(false); setShowMessageModal(true); }}
                  style={{ background: '#f7b545' }}
                  className="px-4 py-2 text-sm font-semibold text-[#1a1a1e] hover:opacity-90 transition-opacity"
                >
                  Send Message
                </button>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className={`px-4 py-2 text-sm font-semibold border ${divider} ${txt} hover:opacity-70 transition-opacity`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Message Modal */}
      {showMessageModal && selectedStudent && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={() => setShowMessageModal(false)} />
          <div className={`relative w-full max-w-xl shadow-2xl overflow-hidden ${modalBg}`}>
            <div className={`flex items-center justify-between px-6 py-4 border-b ${divider}`}>
              <h3 className={`text-base font-semibold ${txt}`}>Message — {selectedStudent.name}</h3>
              <button onClick={() => setShowMessageModal(false)} className={`p-1.5 ${sub} hover:${txt} transition-colors`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-5">
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Recipient</label>
                  <div className={`flex items-center gap-3 px-3 py-2.5 border ${recipBg}`}>
                    <div className="w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center text-[#1a1a1e] font-bold text-xs flex-shrink-0">
                      {(selectedStudent.name || 'S').charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${txt}`}>{selectedStudent.name}</p>
                      <p className={`text-xs ${sub}`}>{selectedStudent.email}</p>
                    </div>
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Subject</label>
                  <input
                    type="text"
                    value={msgSubject}
                    onChange={(e) => setMsgSubject(e.target.value)}
                    required
                    placeholder="e.g., Interview Invitation — Google"
                    className={`w-full h-10 px-3 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Message</label>
                  <textarea
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    required
                    rows={5}
                    placeholder="Type your official message here…"
                    className={`w-full px-3 py-2 border ${inp} text-sm outline-none focus:border-[#f7b545] resize-none`}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMessageModal(false)}
                    className={`px-4 py-2 text-sm font-semibold border ${divider} ${txt} hover:opacity-70 transition-opacity`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    style={{ background: '#f7b545' }}
                    className="px-5 py-2 text-sm font-semibold text-[#1a1a1e] disabled:opacity-50 hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    {sending && <span className="w-4 h-4 border-2 border-[#1a1a1e]/40 border-t-[#1a1a1e] rounded-full animate-spin" />}
                    {sending ? 'Sending…' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
