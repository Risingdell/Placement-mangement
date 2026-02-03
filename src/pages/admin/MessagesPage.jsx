import { useState } from 'react';

function MessagesPage() {
  const [messages, setMessages] = useState([
    { id: 1, from: 'Rajesh Kumar', subject: 'Query about Google Drive', preview: 'Hello admin, I have a question regarding...', date: '2026-02-25', unread: true },
    { id: 2, from: 'Priya Sharma', subject: 'Thank you for the placement', preview: 'I wanted to thank you for all the support...', date: '2026-02-24', unread: false },
    { id: 3, from: 'Amit Patel', subject: 'Profile Update Request', preview: 'Can you please review my updated profile...', date: '2026-02-23', unread: true },
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeData, setComposeData] = useState({ to: '', subject: '', message: '' });

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
    setMessages(messages.map(m => m.id === message.id ? { ...m, unread: false } : m));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages & Inbox</h2>
          <p className="text-gray-600 mt-1">Communicate with students</p>
        </div>
        <button
          onClick={() => setShowComposeModal(true)}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-all duration-200"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Compose Message
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="col-span-1 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {messages.map((message) => (
              <div
                key={message.id}
                onClick={() => handleMessageClick(message)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                } ${message.unread ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <p className={`text-sm ${message.unread ? 'font-bold' : 'font-medium'} text-gray-900`}>
                    {message.from}
                  </p>
                  {message.unread && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700 mb-1">{message.subject}</p>
                <p className="text-xs text-gray-500 truncate">{message.preview}</p>
                <p className="text-xs text-gray-400 mt-1">{message.date}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Message Content */}
        <div className="col-span-2 bg-white rounded-xl shadow-md">
          {selectedMessage ? (
            <div className="p-6">
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h3 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h3>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-600">From: {selectedMessage.from}</p>
                  <p className="text-sm text-gray-500">{selectedMessage.date}</p>
                </div>
              </div>
              <div className="prose max-w-none">
                <p className="text-gray-700">{selectedMessage.preview}</p>
                <p className="text-gray-700 mt-4">Full message content would appear here...</p>
              </div>
              <div className="mt-6 flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Reply
                </button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Forward
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">Select a message to view</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowComposeModal(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Compose Message</h3>
                <button onClick={() => setShowComposeModal(false)}>
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">To</label>
                  <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Student email or USN" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input type="text" className="w-full px-4 py-2 border rounded-lg" placeholder="Message subject" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea rows={6} className="w-full px-4 py-2 border rounded-lg" placeholder="Type your message..."></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowComposeModal(false)} className="px-6 py-2 border rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg">Send</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagesPage;
