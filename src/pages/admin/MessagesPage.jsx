import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import inboxService from '../../services/inboxService';
import studentService from '../../services/studentService';
import { format } from 'date-fns';

function MessagesPage() {
  const { setIsModalOpen } = useOutletContext() || {};
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);

  const openModal = () => { setShowComposeModal(true); setIsModalOpen?.(true); };
  const closeModal = () => { setShowComposeModal(false); setIsModalOpen?.(false); };
  const [sending, setSending] = useState(false);

  // Search and Select Students
  const [studentSearch, setStudentSearch] = useState('');
  const [studentResults, setStudentResults] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isSearchingStudents, setIsSearchingStudents] = useState(false);

  const [composeData, setComposeData] = useState({ subject: '', message: '' });

  const fetchSentMessages = async () => {
    try {
      setLoading(true);
      const response = await inboxService.getSentMessages();
      setMessages(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching sent messages:', err);
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSentMessages();
  }, []);

  const handleStudentSearch = useCallback(async (val) => {
    setStudentSearch(val);
    if (val.length < 2) {
      setStudentResults([]);
      return;
    }

    try {
      setIsSearchingStudents(true);
      const response = await studentService.getAllStudents({ search: val });
      setStudentResults(response.data || []);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearchingStudents(false);
    }
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedStudent || !composeData.subject || !composeData.message) {
      alert('Please fill all fields and select a student');
      return;
    }

    try {
      setSending(true);
      await inboxService.sendMessage({
        recipientId: selectedStudent.id,
        subject: composeData.subject,
        message: composeData.message,
        messageType: 'Official'
      });

      alert('Message sent successfully!');
      closeModal();
      setComposeData({ subject: '', message: '' });
      setSelectedStudent(null);
      setStudentSearch('');
      fetchSentMessages(); // Refresh list
    } catch (err) {
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Official Communications</h2>
          <p className="text-gray-600 mt-1">Send and manage official messages to students</p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all duration-200 font-semibold"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Message
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[700px]">
          <div className="p-4 border-b border-gray-100 bg-gray-50/50">
            <h3 className="font-semibold text-gray-700">Sent Messages</h3>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center h-full opacity-60">
                <span className="text-4xl mb-4">📨</span>
                <p className="text-gray-500">No sent messages yet</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors relative ${selectedMessage?.id === message.id ? 'bg-indigo-50 border-r-4 border-r-indigo-500' : ''
                    }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900 truncate flex-1 pr-2">
                      To: {message.recipient_name}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {format(new Date(message.sent_at), 'MMM d')}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-indigo-600 mb-1">{message.subject}</p>
                  <p className="text-xs text-gray-500 line-clamp-2">{message.message}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                      {message.recipient_usn}
                    </span>
                    {message.is_read ? (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        ✓ Read
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                        Unread
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-2xl shadow-sm border border-gray-100 h-[700px] flex flex-col">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                      {selectedMessage.recipient_name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {selectedMessage.recipient_name}
                        <span className="text-gray-400 font-normal ml-2">({selectedMessage.recipient_email})</span>
                      </p>
                      <p className="text-xs text-gray-500">Sent on {format(new Date(selectedMessage.sent_at), 'MMMM d, p')}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedMessage.message_type === 'Official' && (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                      <span className="text-blue-500">✓</span> Official
                    </span>
                  )}
                  {selectedMessage.is_read ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100">
                      ✓ Read {selectedMessage.read_at ? `· ${format(new Date(selectedMessage.read_at), 'MMM d, p')}` : ''}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-100">
                      Pending Read
                    </span>
                  )}
                </div>
              </div>
              <div className="p-8 flex-1 overflow-y-auto">
                <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedMessage.message}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-12">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">Select a communication record</h3>
              <p className="text-sm text-gray-500 max-w-sm">
                Click on any message from the list to view the full details of the conversation sent to the student.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal — rendered via Portal to escape stacking context */}
      {showComposeModal && createPortal(
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => !sending && closeModal()}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-2xl transform overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Official Communication</h3>
                <button onClick={() => !sending && closeModal()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-6">
                <div className="relative">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Student Recipient</label>
                  <div className="relative">
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all pl-10"
                      placeholder="Search by USN or Name..."
                      value={studentSearch}
                      onChange={(e) => handleStudentSearch(e.target.value)}
                      disabled={sending || selectedStudent}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                    {selectedStudent && (
                      <button
                        type="button"
                        onClick={() => { setSelectedStudent(null); setStudentSearch(''); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 p-1 rounded-md text-xs hover:bg-gray-200"
                      >
                        Change
                      </button>
                    )}
                  </div>

                  {/* Search Results Dropdown */}
                  {!selectedStudent && studentResults.length > 0 && studentSearch.length >= 2 && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl max-h-60 overflow-y-auto divide-y divide-gray-50 border-t-0">
                      {studentResults.map(s => (
                        <div
                          key={s.id}
                          onClick={() => { setSelectedStudent(s); setStudentSearch(`${s.name} (${s.usn})`); }}
                          className="p-3 hover:bg-indigo-50 cursor-pointer flex items-center justify-between transition-colors"
                        >
                          <div>
                            <p className="text-sm font-bold text-gray-900">{s.name}</p>
                            <p className="text-xs text-gray-500">{s.usn} • {s.branch}</p>
                          </div>
                          <span className="text-[10px] text-gray-400">{s.email}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {isSearchingStudents && (
                    <div className="absolute right-12 top-1/2 -translate-y-1/2">
                      <div className="animate-spin h-4 w-4 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject Line</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="e.g., Regarding your interview schedule..."
                    value={composeData.subject}
                    onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                    required
                    disabled={sending}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Message Content</label>
                  <textarea
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                    placeholder="Type the official notification content here..."
                    value={composeData.message}
                    onChange={(e) => setComposeData({ ...composeData, message: e.target.value })}
                    required
                    disabled={sending}
                  ></textarea>
                </div>

                <div className="flex justify-end items-center gap-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                    <span>📢</span> Sent as <strong>Official Communication</strong>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2.5 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    disabled={sending}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50 flex items-center gap-2"
                    disabled={sending || !selectedStudent}
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent"></div>
                        Sending...
                      </>
                    ) : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      , document.body)}
    </div>
  );
}

export default MessagesPage;
