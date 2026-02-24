import { useState, useEffect } from 'react';
import { getDriveAttendees, sendMessageToAttendees } from '../../services/attendeeService';

function AttendeeMessageModal({ drive, isOpen, onClose, onMessageSent }) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    examLink: '',
    messageType: 'exam_link'
  });

  // Fetch attendees on modal open
  useEffect(() => {
    if (isOpen && drive) {
      fetchAttendees();
    }
  }, [isOpen, drive]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getDriveAttendees(drive.id);

      if (response.success) {
        setAttendees(response.data);
      } else {
        setError('Failed to load attendees');
      }
    } catch (err) {
      console.error('Error fetching attendees:', err);
      setError('Error loading attendees');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!formData.subject || !formData.message) {
      setError('Please fill in subject and message');
      return;
    }

    if (formData.messageType !== 'general' && !formData.examLink) {
      setError('Please provide exam/meeting link');
      return;
    }

    if (attendees.length === 0) {
      setError('No attendees to send message to');
      return;
    }

    try {
      setSending(true);
      setError(null);
      const response = await sendMessageToAttendees(drive.id, formData);

      if (response.success) {
        setSuccessMessage(
          `Message sent successfully to ${attendees.length} attendee(s)!`
        );
        setFormData({
          subject: '',
          message: '',
          examLink: '',
          messageType: 'exam_link'
        });
        onMessageSent?.();

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
        }, 2000);
      } else {
        setError(response.message || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Error sending message to attendees');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen || !drive) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                📧 Send Message to Attendees
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {drive.company_name} | Attendees: {attendees.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">❌ {error}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">✅ {successMessage}</p>
            </div>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading attendees...</p>
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-8 bg-blue-50 rounded-lg">
              <svg className="w-12 h-12 mx-auto text-blue-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5-4a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-600 font-medium">No attendees marked yet</p>
              <p className="text-sm text-gray-500 mt-1">Add students to this drive to send them messages</p>
            </div>
          ) : (
            <form onSubmit={handleSendMessage} className="space-y-4">
              {/* Message Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message Type
                </label>
                <div className="flex gap-2">
                  {[
                    { value: 'exam_link', label: '📝 Exam Link' },
                    { value: 'interview_link', label: '🎥 Interview Link' },
                    { value: 'general', label: '💬 General Message' }
                  ].map(type => (
                    <label key={type.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="messageType"
                        value={type.value}
                        checked={formData.messageType === type.value}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-gray-600">{type.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="e.g., Your Coding Test Link - Google"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your message here. Include any important instructions or details."
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  required
                />
              </div>

              {/* Exam Link */}
              {formData.messageType !== 'general' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {formData.messageType === 'exam_link' ? 'Exam Link' : 'Interview Link'} *
                  </label>
                  <input
                    type="url"
                    name="examLink"
                    value={formData.examLink}
                    onChange={handleInputChange}
                    placeholder="https://example.com/exam-link"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    required={formData.messageType !== 'general'}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This link will be sent to all {attendees.length} attendee(s)
                  </p>
                </div>
              )}

              {/* Preview */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-2">📋 PREVIEW</p>
                <div className="text-sm text-gray-700 space-y-2">
                  <p><strong>To:</strong> {attendees.length} attendee(s)</p>
                  {formData.subject && (
                    <p><strong>Subject:</strong> {formData.subject}</p>
                  )}
                  {formData.message && (
                    <p><strong>Message:</strong> {formData.message}</p>
                  )}
                  {formData.examLink && (
                    <p><strong>Link:</strong> <span className="text-blue-600 break-all">{formData.examLink}</span></p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || attendees.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                >
                  {sending ? (
                    <>
                      <span className="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      📤 Send to {attendees.length} Student{attendees.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AttendeeMessageModal;
