import { useState, useEffect } from 'react';
import { getAllDrives, createDrive, updateDrive, deleteDrive } from '../../services/driveService';
import DriveAttendeesModal from '../../Components/admin/DriveAttendeesModal';
import AttendeeMessageModal from '../../Components/admin/AttendeeMessageModal';

const STATUS_STYLES = {
  Active:    { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Upcoming:  { dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  Completed: { dot: 'bg-gray-400',    badge: 'bg-gray-50 text-gray-600 border-gray-200' },
  Cancelled: { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 border-red-200' },
};

const EMPTY_FORM = {
  company_name: '', role: '', ctc: '', drive_date: '', application_deadline: '',
  min_cgpa: '', max_backlogs: '0', description: '', status: 'Upcoming', application_link: '',
};

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function PlacementDrivesPage() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');

  const [showAttendeesModal, setShowAttendeesModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const fetchDrives = async () => {
    try {
      setLoading(true);
      const res = await getAllDrives(filterStatus || null);
      setDrives(Array.isArray(res?.data) ? res.data : []);
    } catch {
      setDrives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrives(); }, [filterStatus]); // eslint-disable-line

  const g = (d, ...keys) => {
    for (const k of keys) if (d[k] !== undefined && d[k] !== null) return d[k];
    return '';
  };

  const openAdd = () => {
    setModalMode('add');
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowModal(true);
  };

  const openEdit = (drive) => {
    setModalMode('edit');
    setSelectedDrive(drive);
    setFormData({
      company_name: g(drive, 'company_name', 'company'),
      role: drive.role || '',
      ctc: drive.ctc || '',
      drive_date: (g(drive, 'drive_date', 'date') || '').split('T')[0],
      application_deadline: (g(drive, 'application_deadline', 'registration_deadline', 'deadline') || '').split('T')[0],
      min_cgpa: String(g(drive, 'min_cgpa', 'minCGPA') || ''),
      max_backlogs: String(g(drive, 'max_backlogs', 'maxBacklogs') || '0'),
      description: g(drive, 'description', 'job_description') || '',
      status: drive.status || 'Upcoming',
      application_link: g(drive, 'application_link', 'applicationLink') || '',
    });
    setFormError('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this placement drive? This cannot be undone.')) return;
    try {
      await deleteDrive(id);
      setDrives(prev => prev.filter(d => d.id !== id));
    } catch {
      alert('Failed to delete drive.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    // Map frontend snake_case form fields to backend camelCase field names
    const payload = {
      companyName:          formData.company_name,
      role:                 formData.role,
      ctc:                  formData.ctc || null,
      driveDate:            formData.drive_date,
      registrationDeadline: formData.application_deadline || null,
      minCgpa:              formData.min_cgpa || null,
      maxBacklogs:          formData.max_backlogs !== '' ? formData.max_backlogs : null,
      jobDescription:       formData.description || null,
      status:               formData.status,
      applicationLink:      formData.application_link || null,
    };
    try {
      setSaving(true);
      if (modalMode === 'add') {
        await createDrive(payload);
      } else {
        await updateDrive(selectedDrive.id, payload);
      }
      setShowModal(false);
      fetchDrives();
    } catch (err) {
      setFormError(err?.message || 'Failed to save drive. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const total = drives.length;
  const active = drives.filter(d => d.status === 'Active').length;
  const upcoming = drives.filter(d => d.status === 'Upcoming').length;
  const totalApplicants = drives.reduce((s, d) => s + Number(g(d, 'total_applicants', 'applicants') || 0), 0);
  const filtered = filterStatus ? drives.filter(d => d.status === filterStatus) : drives;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Placement Drives</h2>
          <p className="text-sm text-gray-500 mt-0.5">Create and manage recruitment drives</p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create Drive
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Drives',      value: total,           color: 'blue' },
          { label: 'Active',            value: active,          color: 'emerald' },
          { label: 'Upcoming',          value: upcoming,        color: 'amber' },
          { label: 'Total Applicants',  value: totalApplicants, color: 'violet' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
            {loading
              ? <Skeleton className="h-7 w-10 mt-2" />
              : <p className={`text-2xl font-bold mt-1 tabular-nums text-${color}-600`}>{value.toLocaleString()}</p>
            }
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-sm font-semibold text-gray-900">All Drives</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['', 'Active', 'Upcoming', 'Completed'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  filterStatus === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="divide-y divide-gray-50">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm font-medium text-gray-500">No drives found</p>
            <p className="text-xs text-gray-400 mt-0.5">Create a new drive to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  {['Company & Role', 'CTC', 'Drive Date', 'Deadline', 'Status', 'Applicants', 'Actions'].map(h => (
                    <th key={h} className={`px-5 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(drive => {
                  const company = g(drive, 'company_name', 'company');
                  const driveDate = g(drive, 'drive_date', 'date');
                  const deadline = g(drive, 'application_deadline', 'registration_deadline', 'deadline');
                  const applicants = Number(g(drive, 'total_applicants', 'applicants') || 0);
                  const style = STATUS_STYLES[drive.status] || STATUS_STYLES.Completed;

                  return (
                    <tr key={drive.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-gray-900">{company}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{drive.role}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-emerald-700">{drive.ctc || '—'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">
                        {driveDate
                          ? new Date(driveDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-600 text-xs">
                        {deadline
                          ? new Date(deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {drive.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-900 tabular-nums">
                        {applicants.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            onClick={() => { setSelectedDrive(drive); setShowAttendeesModal(true); }}
                            className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                            title="View Attendees"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { setSelectedDrive(drive); setShowMessageModal(true); }}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Send Message"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEdit(drive)}
                            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(drive.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => !saving && setShowModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {modalMode === 'add' ? 'Create Placement Drive' : 'Edit Drive'}
              </h3>
              <button
                onClick={() => !saving && setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
              {formError && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {formError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Company Name *</label>
                  <input
                    type="text" required
                    value={formData.company_name}
                    onChange={e => setFormData(p => ({ ...p, company_name: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Google"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Role / Position *</label>
                  <input
                    type="text" required
                    value={formData.role}
                    onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. Software Engineer"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">CTC / Package *</label>
                  <input
                    type="text" required
                    value={formData.ctc}
                    onChange={e => setFormData(p => ({ ...p, ctc: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 25 LPA"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    <option>Upcoming</option>
                    <option>Active</option>
                    <option>Completed</option>
                    <option>Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Drive Date *</label>
                  <input
                    type="date" required
                    value={formData.drive_date}
                    onChange={e => setFormData(p => ({ ...p, drive_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Application Deadline *</label>
                  <input
                    type="date" required
                    value={formData.application_deadline}
                    onChange={e => setFormData(p => ({ ...p, application_deadline: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Min. CGPA</label>
                  <input
                    type="number" step="0.01" min="0" max="10"
                    value={formData.min_cgpa}
                    onChange={e => setFormData(p => ({ ...p, min_cgpa: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="e.g. 7.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max. Backlogs Allowed</label>
                  <input
                    type="number" min="0"
                    value={formData.max_backlogs}
                    onChange={e => setFormData(p => ({ ...p, max_backlogs: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Job Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  placeholder="Role responsibilities and requirements..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Application Link</label>
                <input
                  type="url"
                  value={formData.application_link}
                  onChange={e => setFormData(p => ({ ...p, application_link: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="https://forms.google.com/... (Eligible students will receive this link)"
                />
              </div>
              <div className="sticky bottom-0 bg-white flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                  {saving ? 'Saving…' : modalMode === 'add' ? 'Create Drive' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attendees Modal */}
      <DriveAttendeesModal
        drive={selectedDrive}
        isOpen={showAttendeesModal}
        onClose={() => setShowAttendeesModal(false)}
        onAttendeesUpdated={fetchDrives}
      />

      {/* Message Modal */}
      <AttendeeMessageModal
        drive={selectedDrive}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        onMessageSent={() => {}}
      />
    </div>
  );
}

export default PlacementDrivesPage;
