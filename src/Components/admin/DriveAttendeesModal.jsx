import { useState, useEffect } from 'react';
import { getDriveAttendees, addDriveAttendees, removeDriveAttendee, getNonAttendees } from '../../services/attendeeService';

function DriveAttendeesModal({ drive, isOpen, onClose, onAttendeesUpdated }) {
  const [attendees, setAttendees] = useState([]);
  const [nonAttendees, setNonAttendees] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [tab, setTab] = useState('attendees'); // 'attendees' or 'add'
  const [addingAttendees, setAddingAttendees] = useState(false);

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

  const fetchNonAttendees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getNonAttendees(drive.id, {
        search: searchTerm || undefined,
        filter: filterType === 'all' ? undefined : filterType
      });

      if (response.success) {
        setNonAttendees(response.data);
      } else {
        setError('Failed to load non-attendees');
      }
    } catch (err) {
      console.error('Error fetching non-attendees:', err);
      setError('Error loading student list');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === 'add') {
      setSelectedStudents([]);
      setSearchTerm('');
      fetchNonAttendees();
    }
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents(prev =>
      prev.includes(studentId)
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAddAttendees = async () => {
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    try {
      setAddingAttendees(true);
      setError(null);
      const response = await addDriveAttendees(drive.id, selectedStudents);

      if (response.success) {
        setSuccessMessage(`Successfully added ${selectedStudents.length} attendee(s)`);
        setSelectedStudents([]);
        setTab('attendees');
        fetchAttendees();
        onAttendeesUpdated?.();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(response.message || 'Failed to add attendees');
      }
    } catch (err) {
      console.error('Error adding attendees:', err);
      setError('Error adding attendees');
    } finally {
      setAddingAttendees(false);
    }
  };

  const handleRemoveAttendee = async (attendeeId, studentName) => {
    if (!confirm(`Remove ${studentName} from attendees?`)) {
      return;
    }

    try {
      const response = await removeDriveAttendee(drive.id, attendeeId);

      if (response.success) {
        setAttendees(attendees.filter(a => a.user_id !== attendeeId));
        setSuccessMessage(`${studentName} removed from attendees`);
        onAttendeesUpdated?.();
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError('Failed to remove attendee');
      }
    } catch (err) {
      console.error('Error removing attendee:', err);
      setError('Error removing attendee');
    }
  };

  if (!isOpen || !drive) return null;

  const stats = {
    totalAttended: attendees.length,
    totalApplied: nonAttendees.filter(s => s.applied_count > 0).length,
    applied: nonAttendees.filter(s => s.applied_count > 0),
    notApplied: nonAttendees.filter(s => s.applied_count === 0)
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        <div className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {drive.company_name} - Manage Attendees
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Drive Date: {new Date(drive.drive_date).toLocaleDateString()} | Total Attended: {stats.totalAttended}
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
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => handleTabChange('attendees')}
              className={`px-6 py-3 font-medium transition-colors ${
                tab === 'attendees'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Current Attendees ({stats.totalAttended})
            </button>
            <button
              onClick={() => handleTabChange('add')}
              className={`px-6 py-3 font-medium transition-colors ${
                tab === 'add'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Add Students
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[600px] overflow-y-auto">
            {tab === 'attendees' ? (
              // Attendees List
              <div>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading attendees...</p>
                  </div>
                ) : attendees.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">No attendees marked yet</p>
                    <button
                      onClick={() => handleTabChange('add')}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Add First Attendees
                    </button>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">USN</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Attendance Key</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">CGPA</th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-700">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {attendees.map(attendee => (
                        <tr key={attendee.user_id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">{attendee.full_name}</td>
                          <td className="px-4 py-3 text-gray-600">{attendee.usn}</td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-900 rounded-full font-bold text-sm tracking-wide">
                              {attendee.attendance_key}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {attendee.cgpa ? attendee.cgpa.toFixed(2) : 'N/A'}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleRemoveAttendee(attendee.user_id, attendee.full_name)}
                              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded transition"
                            >
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
              // Add Attendees
              <div>
                {/* Search and Filter */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Search Students</label>
                    <input
                      type="text"
                      placeholder="Search by name, USN, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filter</label>
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Students</option>
                      <option value="applied">Applied for this drive</option>
                      <option value="not_applied">Haven't applied</option>
                    </select>
                  </div>

                  <button
                    onClick={fetchNonAttendees}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 disabled:opacity-50"
                  >
                    {loading ? 'Searching...' : 'Search'}
                  </button>
                </div>

                {/* Student List */}
                {loading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-2 text-gray-600">Loading students...</p>
                  </div>
                ) : nonAttendees.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No students found matching criteria</p>
                  </div>
                ) : (
                  <div>
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Selected: {selectedStudents.length} student(s)
                      </p>
                    </div>

                    <table className="w-full text-sm mb-4">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left">
                            <input
                              type="checkbox"
                              checked={selectedStudents.length === nonAttendees.length && nonAttendees.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudents(nonAttendees.map(s => s.id));
                                } else {
                                  setSelectedStudents([]);
                                }
                              }}
                            />
                          </th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">USN</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">CGPA</th>
                          <th className="px-4 py-3 text-left font-semibold text-gray-700">Applied</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {nonAttendees.map(student => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={selectedStudents.includes(student.id)}
                                onChange={() => handleStudentSelect(student.id)}
                              />
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">{student.full_name}</td>
                            <td className="px-4 py-3 text-gray-600">{student.usn}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {student.cgpa ? student.cgpa.toFixed(2) : 'N/A'}
                            </td>
                            <td className="px-4 py-3">
                              {student.applied_count > 0 ? (
                                <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                                  Yes
                                </span>
                              ) : (
                                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                  No
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-gray-200">
            {tab === 'add' && selectedStudents.length > 0 && (
              <button
                onClick={handleAddAttendees}
                disabled={addingAttendees}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition"
              >
                {addingAttendees ? 'Adding...' : `Add Selected (${selectedStudents.length})`}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DriveAttendeesModal;
