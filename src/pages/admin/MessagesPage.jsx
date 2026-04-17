import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import inboxService from '../../services/inboxService';
import studentService from '../../services/studentService';
import { format } from 'date-fns';

function MessagesPage() {
  const { setIsModalOpen, adminTheme } = useOutletContext() || {};
  const isLight = adminTheme === 'light';

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [sending, setSending] = useState(false);

  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);
  const [composeData, setComposeData] = useState({ subject: '', message: '' });

  const openModal = () => { setShowComposeModal(true); setIsModalOpen?.(true); };
  const closeModal = () => { setShowComposeModal(false); setIsModalOpen?.(false); };

  const fetchSentMessages = async () => {
    try {
      setLoading(true);
      const response = await inboxService.getSentMessages();
      setMessages(response.data || []);
    } catch (err) {
      console.error('Error fetching sent messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSentMessages(); }, []);

  const handleStudentSearch = useCallback(async (val) => {
    setStudentSearch(val);
    if (val.length < 2) { setStudentResults([]); return; }
    try {
      setIsSearchingStudents(true);
      const response = await studentService.getAllStudents({ search: val });
      setStudentResults(response.data || []);
    } catch { /* ignore */ } finally {
      setIsSearchingStudents(false);
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !composeData.subject || !composeData.message) return;
    try {
      setSending(true);
      await inboxService.sendMessage({
        recipientId: selectedStudent.id,
        subject: composeData.subject,
        message: composeData.message,
        messageType: 'Official',
      });
      closeModal();
      setComposeData({ subject: '', message: '' });
      setSelectedStudent(null);
      setStudentSearch('');
      fetchSentMessages();
    } catch { /* ignore */ } finally {
      setSending(false);
    }
  };

  // theme tokens
  const card   = isLight ? 'bg-white border-[#d1d5db]'         : 'bg-[#1f1f24] border-[#2f2f34]';
  const cardHd = isLight ? 'bg-[#f8fafc] border-[#d1d5db]'     : 'bg-[#17171b] border-[#2f2f34]';
  const row    = isLight ? 'hover:bg-[#f3f4f6] border-[#f0f0f0]' : 'hover:bg-[#26262d] border-[#2a2a2e]';
  const rowSel = isLight ? 'bg-[#eef2ff] border-r-4 border-r-[#6366f1]' : 'bg-[#22223a] border-r-4 border-r-[#6366f1]';
  const txt    = isLight ? 'text-[#111827]' : 'text-zinc-100';
  const sub    = isLight ? 'text-[#6b7280]' : 'text-zinc-400';
  const inp    = isLight
    ? 'bg-white border-[#d1d5db] text-[#111827] placeholder-[#9ca3af] focus:border-[#6366f1]'
    : 'bg-[#26262d] border-[#3a3a40] text-zinc-100 placeholder-[#71717a] focus:border-[#6366f1]';
  const modalBg = isLight ? 'bg-white border-[#d1d5db]' : 'bg-[#1a1a1e] border-[#2f2f34]';
  const divider = isLight ? 'border-[#e5e7eb]' : 'border-[#2f2f34]';

  return (
    <div className="space-y-5 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`text-xl font-bold ${txt}`}>OFFCIAL MESSENGER</h2>
          {/* <p className={`text-xs mt-0.5 ${sub}`}>Send and manage official messages to students</p> */}
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#f7b545] hover:bg-[#e5a530] text-[#1a1a1e] rounded-md text-sm font-bold tracking-wide transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Message
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">

        {/* Sent list */}
        <div className={`col-span-12 lg:col-span-4 rounded-xl border overflow-hidden flex flex-col h-[680px] ${card}`}>
          <div className={`px-4 py-3 border-b ${cardHd}`}>
            <p className={`text-xs font-semibold uppercase tracking-widest ${sub}`}>Sent Messages</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="h-7 w-7 rounded-full border-2 border-[#f7b545] border-t-transparent animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className={`flex flex-col items-center justify-center h-full gap-2 ${sub}`}>
                <svg className="w-10 h-10 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No sent messages yet</p>
              </div>
            ) : messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => setSelectedMessage(msg)}
                className={`p-4 cursor-pointer transition-colors ${row} ${selectedMessage?.id === msg.id ? rowSel : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm font-semibold truncate flex-1 pr-2 ${txt}`}>
                    To: {msg.recipient_name}
                  </p>
                  <span className={`text-[10px] whitespace-nowrap ${sub}`}>
                    {format(new Date(msg.sent_at), 'MMM d')}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#f7b545] truncate mb-1">{msg.subject}</p>
                <p className={`text-xs line-clamp-2 ${sub}`}>{msg.message}</p>
                <div className="mt-2 flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${isLight ? 'bg-[#f3f4f6] border-[#e5e7eb] text-[#6b7280]' : 'bg-[#26262d] border-[#3a3a40] text-zinc-400'}`}>
                    {msg.recipient_usn}
                  </span>
                  {msg.is_read ? (
                    <span className="text-[10px] px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">✓ Read</span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400">Unread</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail panel */}
        <div className={`col-span-12 lg:col-span-8 rounded-xl border h-[680px] flex flex-col ${card}`}>
          {selectedMessage ? (
            <>
              <div className={`px-6 py-4 border-b flex items-start justify-between gap-4 ${divider}`}>
                <div className="min-w-0">
                  <h3 className={`text-base font-bold truncate ${txt}`}>{selectedMessage.subject}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-8 w-8 rounded-md bg-[#f7b545]/20 flex items-center justify-center text-[#f7b545] font-bold text-xs shrink-0">
                      {selectedMessage.recipient_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold truncate ${txt}`}>
                        {selectedMessage.recipient_name}
                        <span className={`font-normal ml-1.5 ${sub}`}>({selectedMessage.recipient_email})</span>
                      </p>
                      <p className={`text-xs ${sub}`}>
                        {format(new Date(selectedMessage.sent_at), 'MMMM d, yyyy · p')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedMessage.message_type === 'Official' && (
                    <span className={`text-[10px] px-2 py-1 rounded border font-semibold tracking-wide ${isLight ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                      OFFICIAL
                    </span>
                  )}
                  {selectedMessage.is_read ? (
                    <span className="text-[10px] px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-semibold">
                      ✓ READ
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold">
                      PENDING
                    </span>
                  )}
                </div>
              </div>
              <div className="p-6 flex-1 overflow-y-auto">
                <p className={`text-sm leading-relaxed whitespace-pre-wrap ${isLight ? 'text-[#374151]' : 'text-zinc-300'}`}>
                  {selectedMessage.message}
                </p>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className={`h-16 w-16 rounded-xl flex items-center justify-center ${isLight ? 'bg-[#f3f4f6]' : 'bg-[#26262d]'}`}>
                <svg className={`w-8 h-8 ${sub}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <p className={`text-sm font-semibold ${txt}`}>Select a message to view</p>
              <p className={`text-xs text-center max-w-xs ${sub}`}>Click any sent message from the list to read its full content.</p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !sending && closeModal()} />
          <div className={`relative w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden ${modalBg}`}>

            {/* Modal header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${divider}`}>
              <div>
                <p className={`text-sm font-bold tracking-wide ${txt}`}>Official Communication</p>
                <p className={`text-xs ${sub}`}>Send a message to a student</p>
              </div>
              <button
                onClick={() => !sending && closeModal()}
                className={`h-8 w-8 flex items-center justify-center rounded-md transition-colors ${isLight ? 'hover:bg-[#f3f4f6] text-[#6b7280]' : 'hover:bg-[#2a2a2e] text-zinc-400'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={handleSendMessage} className="px-6 py-5 space-y-4">

              {/* Recipient */}
              <div className="relative">
                <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${sub}`}>Recipient</label>
                <div className="relative">
                  <input
                    type="text"
                    className={`w-full h-10 pl-9 pr-20 rounded-md border text-sm outline-none transition-colors ${inp}`}
                    placeholder="Search by USN or Name…"
                    value={studentSearch}
                    onChange={(e) => handleStudentSearch(e.target.value)}
                    disabled={sending || !!selectedStudent}
                  />
                  <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${sub}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                  </svg>
                  {isSearchingStudents && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 border-[#f7b545] border-t-transparent animate-spin" />
                  )}
                  {selectedStudent && !isSearchingStudents && (
                    <button
                      type="button"
                      onClick={() => { setSelectedStudent(null); setStudentSearch(''); }}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 text-[10px] px-2 py-0.5 rounded border font-semibold transition-colors ${isLight ? 'border-[#d1d5db] hover:bg-[#f3f4f6] text-[#374151]' : 'border-[#3a3a40] hover:bg-[#2a2a2e] text-zinc-300'}`}
                    >
                      Change
                    </button>
                  )}
                </div>
                {!selectedStudent && studentResults.length > 0 && (
                  <div className={`absolute z-10 w-full mt-1 rounded-md border shadow-xl overflow-hidden ${modalBg} ${divider}`}>
                    {studentResults.map(s => (
                      <div
                        key={s.id}
                        onClick={() => { setSelectedStudent(s); setStudentSearch(`${s.name} (${s.usn})`); }}
                        className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${isLight ? 'hover:bg-[#f3f4f6]' : 'hover:bg-[#26262d]'}`}
                      >
                        <div>
                          <p className={`text-sm font-semibold ${txt}`}>{s.name}</p>
                          <p className={`text-xs ${sub}`}>{s.usn} · {s.branch}</p>
                        </div>
                        <span className={`text-[10px] ${sub}`}>{s.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Subject */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${sub}`}>Subject</label>
                <input
                  type="text"
                  className={`w-full h-10 px-3 rounded-md border text-sm outline-none transition-colors ${inp}`}
                  placeholder="e.g., Interview schedule update…"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  required
                  disabled={sending}
                />
              </div>

              {/* Message */}
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-widest mb-1.5 ${sub}`}>Message</label>
                <textarea
                  rows={6}
                  className={`w-full px-3 py-2.5 rounded-md border text-sm outline-none transition-colors resize-none ${inp}`}
                  placeholder="Type the official notification here…"
                  value={composeData.message}
                  onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                  required
                  disabled={sending}
                />
              </div>

              {/* Footer */}
              <div className={`flex items-center justify-between pt-3 border-t ${divider}`}>
                <span className="text-[10px] px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-amber-400 font-semibold tracking-wide">
                  OFFICIAL COMMUNICATION
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={sending}
                    className={`px-4 py-2 rounded-md text-sm font-semibold border transition-colors ${isLight ? 'border-[#d1d5db] hover:bg-[#f3f4f6] text-[#374151]' : 'border-[#3a3a40] hover:bg-[#2a2a2e] text-zinc-300'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending || !selectedStudent}
                    className="flex items-center gap-2 px-5 py-2 rounded-md text-sm font-bold bg-[#f7b545] hover:bg-[#e5a530] text-[#1a1a1e] transition-colors disabled:opacity-50"
                  >
                    {sending ? (
                      <><div className="h-3.5 w-3.5 rounded-full border-2 border-[#1a1a1e] border-t-transparent animate-spin" /> Sending…</>
                    ) : 'Send Message'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      , document.body)}
    </div>
  );
}

export default MessagesPage;
