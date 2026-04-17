import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { getAdminApplications, updateApplicationStatus } from '../../services/applicationService';

const STATUS_STYLES = {
  Applied:               'bg-blue-100 text-blue-800',
  Shortlisted:           'bg-yellow-100 text-yellow-800',
  'Exam Scheduled':      'bg-purple-100 text-purple-800',
  'Interview Scheduled': 'bg-indigo-100 text-indigo-800',
  Selected:              'bg-emerald-100 text-emerald-800',
  Rejected:              'bg-red-100 text-red-800',
};
const getStatusStyle = (s) => STATUS_STYLES[s] || 'bg-gray-100 text-gray-700';
const STATUS_KEYS = Object.keys(STATUS_STYLES);

function ApplicationsPage() {
  const { adminTheme, setIsModalOpen } = useOutletContext() || {};
  const isLight = adminTheme !== 'dark';

  const card    = isLight ? 'bg-white border border-gray-200 shadow-sm'        : 'bg-[#1e1e22] border border-[#2f2f34]';
  const txt     = isLight ? 'text-gray-900'   : 'text-[#e8e8ed]';
  const sub     = isLight ? 'text-gray-500'   : 'text-[#8e8e93]';
  const inp     = isLight ? 'bg-white border-gray-300 text-gray-900'           : 'bg-[#2a2a2f] border-[#3f3f46] text-[#e8e8ed]';
  const modalBg = isLight ? 'bg-white'        : 'bg-[#1e1e22]';
  const divider = isLight ? 'border-gray-200' : 'border-[#2f2f34]';
  const theadBg = isLight ? 'bg-gray-50'      : 'bg-[#252528]';
  const rowHov  = isLight ? 'hover:bg-gray-50': 'hover:bg-[#28282c]';
  const overlay = isLight ? 'bg-gray-900/50'  : 'bg-black/60';

  const [applications, setApplications]         = useState([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [filterStatus, setFilterStatus]         = useState('');
  const [filterCompany, setFilterCompany]       = useState('');
  const [searchTerm, setSearchTerm]             = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);
  const [remarks, setRemarks]                   = useState('');
  const [groupByCompany, setGroupByCompany]     = useState(true);
  const [collapsedGroups, setCollapsedGroups]   = useState({});

  useEffect(() => { setIsModalOpen?.(showDetailsModal); }, [showDetailsModal, setIsModalOpen]);
  useEffect(() => { fetchApplications(); }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAdminApplications({});
      if (response.success && Array.isArray(response.data)) {
        setApplications(response.data.map(app => ({
          id: app.id,
          student: app.student_name || 'Unknown',
          usn: app.usn || '',
          company: app.company_name || '',
          role: app.role || '',
          appliedDate: app.applied_at,
          status: app.status,
          cgpa: app.cgpa ? parseFloat(app.cgpa) : 0,
          email: app.email,
          branch: app.branch,
          year: app.year,
        })));
      } else {
        setError('Failed to load applications');
      }
    } catch {
      setError('Error loading applications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      setStatusUpdateLoading(id);
      const response = await updateApplicationStatus(id, newStatus, remarks || '');
      if (response.success) {
        setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
        if (selectedApplication?.id === id) setSelectedApplication(prev => ({ ...prev, status: newStatus }));
        setRemarks('');
      } else {
        alert(response.message || 'Failed to update status');
      }
    } catch {
      alert('Error updating application status');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const uniqueCompanies = [...new Set(applications.map(a => a.company).filter(Boolean))].sort();

  const filteredApplications = applications.filter(app => {
    const q = searchTerm.toLowerCase();
    return (
      (app.student.toLowerCase().includes(q) || app.usn.toLowerCase().includes(q) || app.email?.toLowerCase().includes(q)) &&
      (filterStatus  === '' || app.status  === filterStatus) &&
      (filterCompany === '' || app.company === filterCompany)
    );
  });

  // Group filtered apps by company
  const grouped = filteredApplications.reduce((acc, app) => {
    const key = app.company || 'Unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(app);
    return acc;
  }, {});

  const toggleGroup = (company) =>
    setCollapsedGroups(prev => ({ ...prev, [company]: !prev[company] }));

  const stats = [
    { label: 'Total',       count: applications.length,                                         color: txt },
    { label: 'Applied',     count: applications.filter(a => a.status === 'Applied').length,     color: 'text-blue-600' },
    { label: 'Shortlisted', count: applications.filter(a => a.status === 'Shortlisted').length, color: 'text-yellow-600' },
    { label: 'Selected',    count: applications.filter(a => a.status === 'Selected').length,    color: 'text-emerald-600' },
    { label: 'Rejected',    count: applications.filter(a => a.status === 'Rejected').length,    color: 'text-red-600' },
  ];

  const AppRow = ({ app }) => (
    <tr className={`${rowHov} transition-colors`}>
      <td className="px-5 py-3.5 whitespace-nowrap">
        <div className={`text-sm font-semibold ${txt}`}>{app.student}</div>
        <div className={`text-xs ${sub}`}>{app.usn}</div>
        <div className={`text-xs ${sub}`}>{app.email}</div>
      </td>
      {!groupByCompany && (
        <td className="px-5 py-3.5 whitespace-nowrap">
          <div className={`text-sm font-semibold ${txt}`}>{app.company}</div>
          <div className={`text-xs ${sub}`}>{app.role}</div>
        </td>
      )}
      {groupByCompany && (
        <td className={`px-5 py-3.5 whitespace-nowrap text-xs ${sub}`}>{app.role}</td>
      )}
      <td className={`px-5 py-3.5 whitespace-nowrap text-sm ${txt}`}>
        {new Date(app.appliedDate).toLocaleDateString()}
      </td>
      <td className={`px-5 py-3.5 whitespace-nowrap text-sm font-semibold ${txt}`}>
        {app.cgpa.toFixed(2)}
      </td>
      <td className="px-5 py-3.5 whitespace-nowrap">
        <select
          value={app.status}
          onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
          disabled={statusUpdateLoading === app.id}
          className={`px-2.5 py-1 text-xs font-semibold border-0 cursor-pointer ${getStatusStyle(app.status)} disabled:opacity-50`}
        >
          {STATUS_KEYS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </td>
      <td className="px-5 py-3.5 whitespace-nowrap text-right">
        <button
          onClick={() => { setSelectedApplication(app); setShowDetailsModal(true); }}
          className="text-indigo-500 hover:text-indigo-700 text-xs font-semibold"
        >
          Details
        </button>
      </td>
    </tr>
  );

  const TableHead = ({ showCompanyCol }) => (
    <thead className={`${theadBg} border-b ${divider}`}>
      <tr>
        {['Student', showCompanyCol ? 'Company & Role' : 'Role', 'Applied', 'CGPA', 'Status', 'Action'].map((h, i) => (
          <th key={h} className={`px-5 py-3 text-xs font-semibold ${sub} uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}>
            {h}
          </th>
        ))}
      </tr>
    </thead>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${txt}`}>Applications</h2>
          <p className={`${sub} mt-1 text-sm`}>{applications.length} total · {uniqueCompanies.length} companies</p>
        </div>
        {/* View toggle */}
        <div className={`flex border ${divider} text-sm font-semibold`}>
          <button
            onClick={() => setGroupByCompany(true)}
            className={`px-4 py-2 transition-colors ${groupByCompany ? 'bg-[#f7b545] text-[#1a1a1f]' : `${sub} hover:opacity-80`}`}
          >
            By Company
          </button>
          <button
            onClick={() => setGroupByCompany(false)}
            className={`px-4 py-2 transition-colors border-l ${divider} ${!groupByCompany ? 'bg-[#f7b545] text-[#1a1a1f]' : `${sub} hover:opacity-80`}`}
          >
            All Flat
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className={`border ${isLight ? 'bg-red-50 border-red-200' : 'bg-red-950/30 border-red-900/50'} px-4 py-3 flex items-center justify-between gap-3`}>
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchApplications} className="text-sm font-semibold text-red-600 underline">Retry</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map(({ label, count, color }) => (
          <div key={label} className={`${card} p-4`}>
            <p className={`text-xs font-semibold ${sub} uppercase tracking-wide mb-1`}>{label}</p>
            <p className={`text-2xl font-bold tabular-nums ${color}`}>{count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className={`${card} p-5`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Search</label>
            <input
              type="text"
              placeholder="Name, USN, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
            >
              <option value="">All Status</option>
              {STATUS_KEYS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Company</label>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
            >
              <option value="">All Companies</option>
              {uniqueCompanies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className={`${card} p-10 text-center`}>
          <div className="inline-block animate-spin h-8 w-8 border-b-2 border-[#f7b545]" style={{ borderRadius: '50%' }} />
          <p className={`mt-3 text-sm ${sub}`}>Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className={`${card} p-10 text-center text-sm ${sub}`}>No applications found</div>
      ) : groupByCompany ? (
        /* ── GROUPED BY COMPANY ── */
        <div className="space-y-4">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([company, apps]) => {
            const isOpen = !collapsedGroups[company];
            const selected   = apps.filter(a => a.status === 'Selected').length;
            const shortlisted = apps.filter(a => a.status === 'Shortlisted').length;
            const rejected   = apps.filter(a => a.status === 'Rejected').length;
            return (
              <div key={company} className={`${card} overflow-hidden`}>
                {/* Company header row */}
                <button
                  onClick={() => toggleGroup(company)}
                  className={`w-full flex items-center justify-between px-5 py-4 border-b ${divider} hover:opacity-80 transition-opacity text-left`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Caret */}
                    <svg
                      className={`w-4 h-4 ${sub} flex-shrink-0 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <div>
                      <span className={`text-base font-bold ${txt}`}>{company}</span>
                      <span className={`ml-3 text-xs font-semibold ${sub}`}>{apps[0]?.role}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className={`text-xs px-2.5 py-0.5 font-semibold bg-blue-100 text-blue-800`}>{apps.length} applied</span>
                    {shortlisted > 0 && <span className="text-xs px-2.5 py-0.5 font-semibold bg-yellow-100 text-yellow-800">{shortlisted} shortlisted</span>}
                    {selected > 0 && <span className="text-xs px-2.5 py-0.5 font-semibold bg-emerald-100 text-emerald-800">{selected} selected</span>}
                    {rejected > 0 && <span className="text-xs px-2.5 py-0.5 font-semibold bg-red-100 text-red-800">{rejected} rejected</span>}
                  </div>
                </button>

                {/* Student rows */}
                {isOpen && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <TableHead showCompanyCol={false} />
                      <tbody className={`divide-y ${divider}`}>
                        {apps.map(app => <AppRow key={app.id} app={app} />)}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* ── FLAT TABLE ── */
        <div className={`${card} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <TableHead showCompanyCol={true} />
              <tbody className={`divide-y ${divider}`}>
                {filteredApplications.map(app => <AppRow key={app.id} app={app} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={() => setShowDetailsModal(false)} />
          <div className={`relative w-full max-w-2xl shadow-2xl ${modalBg} z-10 max-h-[90vh] flex flex-col`}>

            <div className={`flex items-center justify-between px-6 py-5 border-b ${divider} flex-shrink-0`}>
              <div>
                <h3 className={`text-lg font-bold ${txt}`}>{selectedApplication.student}</h3>
                <p className={`text-sm ${sub}`}>{selectedApplication.company} — {selectedApplication.role}</p>
              </div>
              <button onClick={() => setShowDetailsModal(false)} className={`${sub} hover:opacity-70`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-5">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['USN',         selectedApplication.usn],
                  ['Email',       selectedApplication.email || 'N/A'],
                  ['Branch',      selectedApplication.branch || 'N/A'],
                  ['CGPA',        selectedApplication.cgpa.toFixed(2)],
                  ['Year',        selectedApplication.year || 'N/A'],
                  ['Applied',     new Date(selectedApplication.appliedDate).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label} className={`${isLight ? 'bg-gray-50' : 'bg-[#252528]'} px-4 py-3`}>
                    <p className={`text-[11px] font-semibold uppercase tracking-wider ${sub} mb-0.5`}>{label}</p>
                    <p className={`text-sm font-semibold ${txt}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Current status badge */}
              <div>
                <p className={`text-xs font-semibold ${sub} uppercase tracking-wider mb-2`}>Current Status</p>
                <span className={`px-3 py-1 text-xs font-bold ${getStatusStyle(selectedApplication.status)}`}>
                  {selectedApplication.status}
                </span>
              </div>

              {/* Update status */}
              <div>
                <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Update Status</label>
                <select
                  value={selectedApplication.status}
                  onChange={(e) => handleStatusUpdate(selectedApplication.id, e.target.value)}
                  disabled={statusUpdateLoading === selectedApplication.id}
                  className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545] disabled:opacity-50`}
                >
                  {STATUS_KEYS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Remarks */}
              <div>
                <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Remarks (optional)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any remarks for the student..."
                  rows={3}
                  className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545] resize-none`}
                />
              </div>
            </div>

            <div className={`flex justify-end px-6 py-4 border-t ${divider} ${isLight ? 'bg-gray-50' : 'bg-[#252528]'} flex-shrink-0`}>
              <button
                onClick={() => setShowDetailsModal(false)}
                className={`px-5 py-2.5 border ${divider} ${txt} text-sm font-semibold hover:opacity-70 transition-opacity`}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export default ApplicationsPage;
