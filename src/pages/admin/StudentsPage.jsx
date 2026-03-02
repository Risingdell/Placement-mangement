import { useState, useEffect, useCallback } from 'react';
import studentService from '../../services/studentService';
import inboxService from '../../services/inboxService';
import { Skeleton } from '../../Components/common/Skeleton';

const BRANCHES = ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CIVIL', 'AI&ML', 'DS'];

function Badge({ children, color = 'gray' }) {
  const map = {
    green:  'bg-emerald-100 text-emerald-800 border border-emerald-200',
    yellow: 'bg-amber-100 text-amber-800 border border-amber-200',
    red:    'bg-red-100 text-red-800 border border-red-200',
    blue:   'bg-blue-100 text-blue-800 border border-blue-200',
    gray:   'bg-gray-100 text-gray-700 border border-gray-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${map[color]}`}>
      {children}
    </span>
  );
}


export default function StudentsPage() {
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
    } catch (e) {
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
        messageType: 'Official',
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

  const placed = students.filter((s) => s.is_placed);
  const unplaced = students.filter((s) => !s.is_placed);
  const avgCgpa = students.length
    ? (students.reduce((sum, s) => sum + Number(s.cgpa || 0), 0) / students.length).toFixed(2)
    : '—';

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Student Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">View and manage registered students</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: students.length, color: 'text-gray-900' },
          { label: 'Placed', value: placed.length, color: 'text-emerald-600' },
          { label: 'Unplaced', value: unplaced.length, color: 'text-amber-600' },
          { label: 'Avg. CGPA', value: avgCgpa, color: 'text-indigo-600' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{item.label}</p>
            <p className={`text-2xl font-bold tabular-nums ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, USN or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 h-9 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="h-9 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Branches</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <select
            value={filterPlaced}
            onChange={(e) => setFilterPlaced(e.target.value)}
            className="h-9 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="placed">Placed</option>
            <option value="unplaced">Unplaced</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={fetchStudents} className="text-sm text-red-700 font-medium underline">Retry</button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-4 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2">
                <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
                <div className="flex-1 grid grid-cols-4 gap-4">
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-4" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197" />
            </svg>
            <p className="text-sm font-semibold text-gray-600">No students found</p>
            <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">USN</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Branch / Year</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">CGPA</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Backlogs</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-indigo-700 font-bold text-xs">{(s.name || 'S').charAt(0).toUpperCase()}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                          <p className="text-gray-400 text-xs truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-700 text-xs">{s.usn || '—'}</td>
                    <td className="px-5 py-3.5 text-gray-700">
                      {s.branch || '—'}{s.year ? ` · ${s.year}` : ''}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-semibold tabular-nums ${
                        Number(s.cgpa) >= 8.5 ? 'text-emerald-700' :
                        Number(s.cgpa) >= 7.0 ? 'text-indigo-700' :
                        'text-amber-700'
                      }`}>
                        {s.cgpa ? Number(s.cgpa).toFixed(2) : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-700 tabular-nums">{s.backlogs ?? '—'}</td>
                    <td className="px-5 py-3.5">
                      {s.is_placed
                        ? <Badge color="green">Placed{s.placed_company ? ` @ ${s.placed_company}` : ''}</Badge>
                        : <Badge color="yellow">Unplaced</Badge>
                      }
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedStudent(s); setShowProfileModal(true); }}
                          className="px-3 py-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg border border-transparent hover:border-indigo-200 transition-all"
                        >
                          View
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(s); setShowMessageModal(true); }}
                          className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                        >
                          Message
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-5 py-3 border-t border-gray-100 text-xs text-gray-500">
              Showing <span className="font-semibold text-gray-700">{students.length}</span> student{students.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      {showProfileModal && selectedStudent && (
        <Modal title="Student Profile" onClose={() => setShowProfileModal(false)}>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
              {(selectedStudent.name || 'S').charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">{selectedStudent.name}</h4>
              <p className="text-sm text-gray-500">{selectedStudent.usn}</p>
            </div>
            <div className="ml-auto">
              {selectedStudent.is_placed
                ? <Badge color="green">Placed</Badge>
                : <Badge color="yellow">Unplaced</Badge>
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
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-gray-500 font-medium mb-0.5">{label}</p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end gap-2">
            <button
              onClick={() => { setShowProfileModal(false); setShowMessageModal(true); }}
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              Send Message
            </button>
            <button onClick={() => setShowProfileModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
              Close
            </button>
          </div>
        </Modal>
      )}

      {/* Message Modal */}
      {showMessageModal && selectedStudent && (
        <Modal title={`Message — ${selectedStudent.name}`} onClose={() => setShowMessageModal(false)}>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Recipient</label>
              <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  {(selectedStudent.name || 'S').charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{selectedStudent.name}</p>
                  <p className="text-xs text-gray-500">{selectedStudent.email}</p>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Subject</label>
              <input
                type="text"
                value={msgSubject}
                onChange={(e) => setMsgSubject(e.target.value)}
                required
                placeholder="e.g., Interview Invitation — Google"
                className="w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                value={msgBody}
                onChange={(e) => setMsgBody(e.target.value)}
                required
                rows={5}
                placeholder="Type your official message here…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sending}
                className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {sending && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {sending ? 'Sending…' : 'Send Message'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
