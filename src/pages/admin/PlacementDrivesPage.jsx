import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { getAllDrives, createDrive, updateDrive, deleteDrive, previewEligibleStudents, getAllStudents, enrollStudents } from '../../services/driveService';
import DriveAttendeesModal from '../../Components/admin/DriveAttendeesModal';
import AttendeeMessageModal from '../../Components/admin/AttendeeMessageModal';

const STATUS_STYLES = {
  Active:    { dot: 'bg-emerald-400', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  Upcoming:  { dot: 'bg-blue-400',    badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  Completed: { dot: 'bg-gray-400',    badge: 'bg-gray-50 text-gray-600 border-gray-200' },
  Cancelled: { dot: 'bg-red-400',     badge: 'bg-red-50 text-red-700 border-red-200' },
};

const BRANCHES = ['CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CIVIL', 'AI&ML', 'DS'];

const EMPTY_FORM = {
  company_name: '', role: '', ctc: '', drive_date: '', application_deadline: '',
  min_cgpa: '', max_backlogs: '0', description: '', status: 'Upcoming', application_link: '',
  allowed_branches: [],
};

function Skeleton({ className, dark }) {
  return <div className={`animate-pulse ${dark ? 'bg-[#2f2f34]' : 'bg-gray-200'} ${className}`} />;
}

function PlacementDrivesPage() {
  const { adminTheme, setIsModalOpen } = useOutletContext() || {};
  const isLight = adminTheme !== 'dark';

  const card    = isLight ? 'bg-white border border-gray-100 shadow-sm'  : 'bg-[#1e1e22] border border-[#2f2f34]';
  const txt     = isLight ? 'text-gray-900'   : 'text-[#e8e8ed]';
  const sub     = isLight ? 'text-gray-500'   : 'text-[#8e8e93]';
  const inp     = isLight ? 'bg-white border-gray-200 text-gray-900'     : 'bg-[#2a2a2f] border-[#3f3f46] text-[#e8e8ed]';
  const modalBg = isLight ? 'bg-white'        : 'bg-[#1e1e22]';
  const divider = isLight ? 'border-gray-100' : 'border-[#2f2f34]';
  const theadBg = isLight ? 'bg-gray-50/60'   : 'bg-[#252528]';
  const rowHov  = isLight ? 'hover:bg-gray-50/50' : 'hover:bg-[#28282c]';
  const panelBg = isLight ? 'bg-gray-50'      : 'bg-[#252528]';
  const overlay = isLight ? 'bg-gray-900/40'  : 'bg-black/60';
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

  // Preview eligible students state
  const [eligiblePreview, setEligiblePreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [localFilter, setLocalFilter] = useState({ branch: '', year: '' });

  // Right-panel tab: 'eligible' | 'manual'
  const [rightTab, setRightTab] = useState('eligible');

  // Manual enrollment state
  const [allStudents, setAllStudents] = useState([]);
  const [allStudentsLoading, setAllStudentsLoading] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollResult, setEnrollResult] = useState(null); // { enrolled, skipped }

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

  useEffect(() => { setIsModalOpen?.(showModal); }, [showModal, setIsModalOpen]);

  // Debounced preview of eligible students as criteria change
  useEffect(() => {
    if (!showModal) return;
    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await previewEligibleStudents({
          minCgpa: formData.min_cgpa,
          maxBacklogs: formData.max_backlogs,
          branches: formData.allowed_branches,
        });
        setEligiblePreview(res?.data || null);
      } catch (error) {
        console.error('Error fetching eligible students:', error);
        setEligiblePreview(null);
      } finally {
        setPreviewLoading(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.min_cgpa, formData.max_backlogs, formData.allowed_branches, showModal]);

  const g = (d, ...keys) => {
    for (const k of keys) if (d[k] !== undefined && d[k] !== null) return d[k];
    return '';
  };

  // Load all students when switching to manual tab
  useEffect(() => {
    if (rightTab !== 'manual' || !showModal) return;
    if (allStudents.length > 0) return; // already loaded
    setAllStudentsLoading(true);
    getAllStudents()
      .then(res => setAllStudents(Array.isArray(res?.data) ? res.data : []))
      .catch(() => setAllStudents([]))
      .finally(() => setAllStudentsLoading(false));
  }, [rightTab, showModal]); // eslint-disable-line

  const handleEnroll = async () => {
    if (!selectedDrive || selectedStudentIds.length === 0) return;
    setEnrolling(true);
    setEnrollResult(null);
    try {
      const res = await enrollStudents(selectedDrive.id, selectedStudentIds);
      setEnrollResult({ enrolled: res.enrolled, skipped: res.skipped });
      setSelectedStudentIds([]);
      fetchDrives();
    } catch (err) {
      setEnrollResult({ error: err?.message || 'Enrollment failed' });
    } finally {
      setEnrolling(false);
    }
  };

  const toggleStudent = (id) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const openAdd = () => {
    setModalMode('add');
    setFormData(EMPTY_FORM);
    setFormError('');
    setRightTab('eligible');
    setSelectedStudentIds([]);
    setEnrollResult(null);
    setShowModal(true);
  };

  const openEdit = (drive) => {
    setModalMode('edit');
    setSelectedDrive(drive);
    const allowedBranches = drive.allowed_branches
      ? (typeof drive.allowed_branches === 'string' ? JSON.parse(drive.allowed_branches) : drive.allowed_branches)
      : [];
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
      allowed_branches: Array.isArray(allowedBranches) ? allowedBranches : [],
    });
    setFormError('');
    setRightTab('eligible');
    setSelectedStudentIds([]);
    setEnrollResult(null);
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
      allowedBranches:      formData.allowed_branches.length > 0 ? formData.allowed_branches : null,
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
          <h2 className={`text-xl font-bold ${txt}`}>Placement Drives</h2>
          <p className={`text-sm ${sub} mt-0.5`}>Create and manage recruitment drives</p>
        </div>
        <button
          onClick={openAdd}
          style={{ background: '#f7b545' }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-[#1a1a1e] text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity"
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
          { label: 'Total Drives',     value: total,           color: 'text-blue-600' },
          { label: 'Active',           value: active,          color: 'text-emerald-600' },
          { label: 'Upcoming',         value: upcoming,        color: 'text-amber-600' },
          { label: 'Total Applicants', value: totalApplicants, color: 'text-violet-600' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`${card} p-4`}>
            <p className={`text-[11px] font-semibold ${sub} uppercase tracking-wider`}>{label}</p>
            {loading
              ? <Skeleton className="h-7 w-10 mt-2" dark={!isLight} />
              : <p className={`text-2xl font-bold mt-1 tabular-nums ${color}`}>{value.toLocaleString()}</p>
            }
          </div>
        ))}
      </div>

      {/* Table */}
      <div className={`${card} overflow-hidden`}>
        <div className={`px-5 py-4 border-b ${divider} flex items-center justify-between gap-3 flex-wrap`}>
          <h3 className={`text-sm font-semibold ${txt}`}>All Drives</h3>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['', 'Active', 'Upcoming', 'Completed'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={filterStatus === s ? { background: '#f7b545', color: '#1a1a1e' } : {}}
                className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                  filterStatus === s ? '' : isLight ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-[#2a2a2f] text-[#8e8e93] hover:bg-[#323236]'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={`divide-y ${divider}`}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-5 py-4 flex items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-36" dark={!isLight} />
                  <Skeleton className="h-3 w-24" dark={!isLight} />
                </div>
                <Skeleton className="h-4 w-16" dark={!isLight} />
                <Skeleton className="h-4 w-24" dark={!isLight} />
                <Skeleton className="h-5 w-16" dark={!isLight} />
                <Skeleton className="h-4 w-8" dark={!isLight} />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className={`w-12 h-12 ${sub} mb-3`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className={`text-sm font-medium ${sub}`}>No drives found</p>
            <p className={`text-xs ${sub} mt-0.5 opacity-60`}>Create a new drive to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${divider} ${theadBg}`}>
                  {['Company & Role', 'CTC', 'Drive Date', 'Deadline', 'Status', 'Applicants', 'Actions'].map(h => (
                    <th key={h} className={`px-5 py-3 text-[11px] font-semibold ${sub} uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {filtered.map(drive => {
                  const company = g(drive, 'company_name', 'company');
                  const driveDate = g(drive, 'drive_date', 'date');
                  const deadline = g(drive, 'application_deadline', 'registration_deadline', 'deadline');
                  const applicants = Number(g(drive, 'total_applicants', 'applicants') || 0);
                  const style = STATUS_STYLES[drive.status] || STATUS_STYLES.Completed;

                  return (
                    <tr key={drive.id} className={`${rowHov} transition-colors`}>
                      <td className="px-5 py-3.5">
                        <p className={`font-semibold ${txt}`}>{company}</p>
                        <p className={`text-xs ${sub} mt-0.5`}>{drive.role}</p>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-emerald-600">{drive.ctc || '—'}</span>
                      </td>
                      <td className={`px-5 py-3.5 ${sub} text-xs`}>
                        {driveDate
                          ? new Date(driveDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className={`px-5 py-3.5 ${sub} text-xs`}>
                        {deadline
                          ? new Date(deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-xs font-semibold border ${style.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          {drive.status}
                        </span>
                      </td>
                      <td className={`px-5 py-3.5 font-medium ${txt} tabular-nums`}>
                        {applicants.toLocaleString()}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-0.5">
                          <button
                            onClick={() => { setSelectedDrive(drive); setShowAttendeesModal(true); }}
                            className="p-1.5 text-violet-500 hover:bg-violet-50/50 transition-colors"
                            title="View Attendees"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => { setSelectedDrive(drive); setShowMessageModal(true); }}
                            className="p-1.5 text-emerald-500 hover:bg-emerald-50/50 transition-colors"
                            title="Send Message"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEdit(drive)}
                            className="p-1.5 text-indigo-500 hover:bg-indigo-50/50 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(drive.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50/50 transition-colors"
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
      {showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4">
          <div
            className={`absolute inset-0 ${overlay} backdrop-blur-sm`}
            onClick={() => !saving && setShowModal(false)}
          />
          <div className={`relative ${modalBg} shadow-2xl w-full max-w-6xl flex flex-col z-10 max-h-[98vh]`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b ${divider} flex-shrink-0`}>
              <h3 className={`text-lg font-bold ${txt}`}>
                {modalMode === 'add' ? 'Create Placement Drive' : 'Edit Drive'}
              </h3>
              <button
                onClick={() => !saving && setShowModal(false)}
                className={`p-1.5 ${sub} hover:${txt} transition-colors`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Two-Column Layout */}
            <div className="flex flex-1 min-h-0 overflow-hidden">
              {/* Left Column - Form */}
              <div className="w-3/5 pr-4 overflow-y-auto flex-1">
                <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-6 space-y-5">
                  {formError && (
                    <div className={`px-4 py-3 border ${isLight ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-950/30 border-red-900/50 text-red-400'} text-sm`}>
                      {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-xs font-semibold ${txt} mb-1.5`}>Company Name *</label>
                      <input
                        type="text" required
                        value={formData.company_name}
                        onChange={e => setFormData(p => ({ ...p, company_name: e.target.value }))}
                        className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                        placeholder="e.g. Google"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold ${txt} mb-1.5`}>Role / Position *</label>
                      <input
                        type="text" required
                        value={formData.role}
                        onChange={e => setFormData(p => ({ ...p, role: e.target.value }))}
                        className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                        placeholder="e.g. Software Engineer"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-xs font-semibold ${txt} mb-1.5`}>CTC / Package *</label>
                      <input
                        type="text" required
                        value={formData.ctc}
                        onChange={e => setFormData(p => ({ ...p, ctc: e.target.value }))}
                        className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                        placeholder="e.g. 25 LPA"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold ${txt} mb-1.5`}>Status</label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData(p => ({ ...p, status: e.target.value }))}
                        className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
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
                      <label className={`block text-xs font-semibold ${txt} mb-1.5`}>Drive Date *</label>
                      <input
                        type="date" required
                        value={formData.drive_date}
                        onChange={e => setFormData(p => ({ ...p, drive_date: e.target.value }))}
                        className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold ${txt} mb-1.5`}>Application Deadline *</label>
                      <input
                        type="date" required
                        value={formData.application_deadline}
                        onChange={e => setFormData(p => ({ ...p, application_deadline: e.target.value }))}
                        className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className={`block text-xs font-semibold ${txt} mb-1.5`}>Min. CGPA</label>
                      <input
                        type="number" step="0.01" min="0" max="10"
                        value={formData.min_cgpa}
                        onChange={e => setFormData(p => ({ ...p, min_cgpa: e.target.value }))}
                        className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                        placeholder="e.g. 7.5"
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold ${txt} mb-1.5`}>Max. Backlogs Allowed</label>
                      <input
                        type="number" min="0"
                        value={formData.max_backlogs}
                        onChange={e => setFormData(p => ({ ...p, max_backlogs: e.target.value }))}
                        className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${txt} mb-2`}>Allowed Branches</label>
                    <div className="grid grid-cols-2 gap-2">
                      {BRANCHES.map(branch => (
                        <button
                          key={branch}
                          type="button"
                          onClick={() => {
                            setFormData(p => ({
                              ...p,
                              allowed_branches: p.allowed_branches.includes(branch)
                                ? p.allowed_branches.filter(b => b !== branch)
                                : [...p.allowed_branches, branch]
                            }));
                          }}
                          style={formData.allowed_branches.includes(branch) ? { background: '#f7b545', color: '#1a1a1e' } : {}}
                          className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                            formData.allowed_branches.includes(branch)
                              ? ''
                              : `border ${divider} ${txt} hover:opacity-70`
                          }`}
                        >
                          {branch}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${txt} mb-1.5`}>Job Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                      className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545] resize-none`}
                      placeholder="Role responsibilities and requirements..."
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-semibold ${txt} mb-1.5`}>Application Link</label>
                    <input
                      type="url"
                      value={formData.application_link}
                      onChange={e => setFormData(p => ({ ...p, application_link: e.target.value }))}
                      className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                      placeholder="https://forms.google.com/... (Eligible students will receive this link)"
                    />
                  </div>
                </form>
              </div>

              {/* Right Column - Tabs: Eligible Preview | Manual Add */}
              <div className={`w-2/5 pl-4 border-l ${divider} flex flex-col ${panelBg}`}>
                {/* Tab header */}
                <div className={`flex border-b ${divider} flex-shrink-0`}>
                  <button
                    type="button"
                    onClick={() => setRightTab('eligible')}
                    className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors ${
                      rightTab === 'eligible'
                        ? `${txt} border-b-2 border-[#f7b545] ${modalBg}`
                        : `${sub} hover:opacity-80`
                    }`}
                  >
                    Eligible Preview
                    {eligiblePreview && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px]">
                        {eligiblePreview.totalEligible}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRightTab('manual')}
                    className={`flex-1 px-3 py-2.5 text-xs font-semibold transition-colors ${
                      rightTab === 'manual'
                        ? `${txt} border-b-2 border-[#f7b545] ${modalBg}`
                        : `${sub} hover:opacity-80`
                    }`}
                  >
                    Manual Add
                    {selectedStudentIds.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-700 text-[10px]">
                        {selectedStudentIds.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* ── Tab: Eligible Preview ── */}
                {rightTab === 'eligible' && (
                  <>
                    {!formData.min_cgpa && formData.max_backlogs === '0' && formData.allowed_branches.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center p-4 text-center">
                        <p className={`text-sm ${sub}`}>Set eligibility criteria to preview eligible students</p>
                      </div>
                    ) : previewLoading ? (
                      <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className={`h-12 ${isLight ? 'bg-gray-200' : 'bg-[#2f2f34]'} animate-pulse`} />
                        ))}
                      </div>
                    ) : eligiblePreview?.students?.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center p-4 text-center">
                        <p className={`text-sm ${sub}`}>No students match these criteria</p>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {eligiblePreview?.students?.map(student => (
                          <div key={student.id} className={`${modalBg} p-3 border ${divider}`}>
                            <div className={`font-medium text-sm ${txt}`}>{student.name}</div>
                            <div className={`text-xs ${sub} mt-0.5`}>{student.email}</div>
                            <div className="flex gap-2 mt-2">
                              <span className={`px-2 py-0.5 text-xs font-semibold ${
                                student.cgpa >= 8.5 ? 'bg-emerald-100 text-emerald-700'
                                  : student.cgpa >= 7.0 ? 'bg-blue-100 text-blue-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}>{student.cgpa}</span>
                              <span className={`px-2 py-0.5 text-xs font-medium ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-[#2a2a2f] text-[#8e8e93]'}`}>{student.branch}</span>
                              {student.year && <span className={`px-2 py-0.5 text-xs font-medium ${isLight ? 'bg-gray-100 text-gray-700' : 'bg-[#2a2a2f] text-[#8e8e93]'}`}>Yr {student.year}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* ── Tab: Manual Add ── */}
                {rightTab === 'manual' && (
                  <div className="flex flex-col flex-1 min-h-0">
                    {modalMode === 'add' ? (
                      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center gap-2">
                        <svg className={`w-8 h-8 ${sub}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className={`text-sm ${sub}`}>Save the drive first, then manually add students here.</p>
                      </div>
                    ) : (
                      <>
                        {/* Search */}
                        <div className="p-3 flex-shrink-0">
                          <input
                            type="text"
                            placeholder="Search by name, email or USN..."
                            value={manualSearch}
                            onChange={e => setManualSearch(e.target.value)}
                            className={`w-full px-3 py-2 border ${inp} text-xs outline-none focus:border-[#f7b545]`}
                          />
                        </div>

                        {/* Student list */}
                        {allStudentsLoading ? (
                          <div className="flex-1 p-3 space-y-2">
                            {[1,2,3,4].map(i => <div key={i} className={`h-10 ${isLight ? 'bg-gray-200' : 'bg-[#2f2f34]'} animate-pulse`} />)}
                          </div>
                        ) : (
                          <div className="flex-1 overflow-y-auto px-3 pb-2 space-y-1.5">
                            {allStudents
                              .filter(s => {
                                const q = manualSearch.toLowerCase();
                                return !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.usn?.toLowerCase().includes(q);
                              })
                              .map(student => {
                                const checked = selectedStudentIds.includes(student.id);
                                return (
                                  <label
                                    key={student.id}
                                    style={checked ? { borderColor: '#f7b545', background: isLight ? '#fffbeb' : '#2a2500' } : {}}
                                    className={`flex items-center gap-2.5 p-2.5 border cursor-pointer transition-colors ${
                                      checked ? '' : `${divider.replace('border-', 'border-')} ${modalBg} ${rowHov}`
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={checked}
                                      onChange={() => toggleStudent(student.id)}
                                      className="w-3.5 h-3.5 flex-shrink-0 accent-amber-400"
                                    />
                                    <div className="min-w-0 flex-1">
                                      <p className={`text-xs font-semibold ${txt} truncate`}>{student.name}</p>
                                      <p className={`text-[10px] ${sub} truncate`}>{student.usn} · {student.email}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                                      {student.cgpa && (
                                        <span className="text-[10px] font-bold text-amber-600">{parseFloat(student.cgpa).toFixed(2)}</span>
                                      )}
                                      {student.branch && (
                                        <span className={`text-[10px] ${sub}`}>{student.branch}</span>
                                      )}
                                    </div>
                                  </label>
                                );
                              })
                            }
                            {allStudents.filter(s => {
                              const q = manualSearch.toLowerCase();
                              return !q || s.name?.toLowerCase().includes(q) || s.email?.toLowerCase().includes(q) || s.usn?.toLowerCase().includes(q);
                            }).length === 0 && (
                              <p className={`text-xs ${sub} text-center py-6`}>No students found</p>
                            )}
                          </div>
                        )}

                        {/* Enroll footer */}
                        <div className={`p-3 border-t ${divider} flex-shrink-0 space-y-2`}>
                          {enrollResult && (
                            <p className={`text-xs text-center font-medium ${enrollResult.error ? 'text-red-600' : 'text-emerald-600'}`}>
                              {enrollResult.error || `✓ ${enrollResult.enrolled} enrolled${enrollResult.skipped > 0 ? `, ${enrollResult.skipped} already added` : ''}`}
                            </p>
                          )}
                          <button
                            type="button"
                            onClick={handleEnroll}
                            disabled={selectedStudentIds.length === 0 || enrolling}
                            style={{ background: '#f7b545' }}
                            className="w-full py-2 text-[#1a1a1e] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                          >
                            {enrolling && <div className="w-3 h-3 border-2 border-[#1a1a1e]/30 border-t-[#1a1a1e] rounded-full animate-spin" />}
                            {enrolling ? 'Enrolling…' : `Enroll ${selectedStudentIds.length > 0 ? `${selectedStudentIds.length} ` : ''}Student${selectedStudentIds.length !== 1 ? 's' : ''}`}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className={`flex justify-end gap-3 px-4 sm:px-6 py-4 sm:py-5 border-t ${divider} ${panelBg} flex-shrink-0`}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={saving}
                className={`px-5 py-2.5 border ${divider} ${txt} text-sm font-semibold hover:opacity-70 transition-opacity disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                style={{ background: '#f7b545' }}
                className="px-6 py-2.5 text-[#1a1a1e] text-sm font-semibold shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                onClick={handleSubmit}
              >
                {saving && <div className="w-4 h-4 border-2 border-[#1a1a1e]/30 border-t-[#1a1a1e] rounded-full animate-spin" />}
                {saving ? 'Saving…' : modalMode === 'add' ? 'Create Drive' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>,
        document.body
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
