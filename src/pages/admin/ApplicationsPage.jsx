import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import { getAdminApplications, updateApplicationStatus } from '../../services/applicationService';

function ApplicationsPage() {
  const { adminTheme, setIsModalOpen } = useOutletContext() || {};
  const isLight = adminTheme !== 'dark';

  const card    = isLight ? 'bg-white border border-gray-200 shadow-sm'  : 'bg-[#1e1e22] border border-[#2f2f34]';
  const txt     = isLight ? 'text-gray-900'   : 'text-[#e8e8ed]';
  const sub     = isLight ? 'text-gray-500'   : 'text-[#8e8e93]';
  const inp     = isLight ? 'bg-white border-gray-300 text-gray-900'     : 'bg-[#2a2a2f] border-[#3f3f46] text-[#e8e8ed]';
  const modalBg = isLight ? 'bg-white'        : 'bg-[#1e1e22]';
  const divider = isLight ? 'border-gray-200' : 'border-[#2f2f34]';
  const theadBg = isLight ? 'bg-gray-50'      : 'bg-[#252528]';
  const rowHov  = isLight ? 'hover:bg-gray-50' : 'hover:bg-[#28282c]';
  const overlay = isLight ? 'bg-gray-900/50'  : 'bg-black/60';

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(null);
  const [remarks, setRemarks] = useState('');

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
          year: app.year
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
        setApplications(applications.map(app => app.id === id ? { ...app, status: newStatus } : app));
        setRemarks('');
        alert('Application status updated successfully!');
      } else {
        alert(response.message || 'Failed to update status');
      }
    } catch {
      alert('Error updating application status');
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const STATUS_STYLES = {
    Applied:              'bg-blue-100 text-blue-800',
    Shortlisted:          'bg-yellow-100 text-yellow-800',
    'Exam Scheduled':     'bg-purple-100 text-purple-800',
    'Interview Scheduled':'bg-indigo-100 text-indigo-800',
    Selected:             'bg-emerald-100 text-emerald-800',
    Rejected:             'bg-red-100 text-red-800',
  };
  const getStatusStyle = (s) => STATUS_STYLES[s] || 'bg-gray-100 text-gray-700';

  const uniqueCompanies = [...new Set(applications.map(a => a.company).filter(Boolean))];

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.usn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus  = filterStatus  === '' || app.status  === filterStatus;
    const matchesCompany = filterCompany === '' || app.company === filterCompany;
    return matchesSearch && matchesStatus && matchesCompany;
  });

  const stats = [
    { label: 'Total',       count: applications.length,                                      color: txt },
    { label: 'Applied',     count: applications.filter(a => a.status === 'Applied').length,  color: 'text-blue-600' },
    { label: 'Shortlisted', count: applications.filter(a => a.status === 'Shortlisted').length, color: 'text-yellow-600' },
    { label: 'Selected',    count: applications.filter(a => a.status === 'Selected').length, color: 'text-emerald-600' },
    { label: 'Rejected',    count: applications.filter(a => a.status === 'Rejected').length, color: 'text-red-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${txt}`}>Applications Management</h2>
        <p className={`${sub} mt-1`}>View and manage all student applications</p>
      </div>

      {/* Error */}
      {error && (
        <div className={`border ${isLight ? 'bg-red-50 border-red-200' : 'bg-red-950/30 border-red-900/50'} px-4 py-3 flex items-center justify-between gap-3`}>
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={fetchApplications} className="text-sm font-semibold text-red-600 underline">Retry</button>
        </div>
      )}

      {/* Stats Cards */}
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
              placeholder="Search by name or USN..."
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
              {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s}</option>)}
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

      {/* Applications Table */}
      <div className={`${card} overflow-hidden`}>
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin h-8 w-8 border-b-2 border-[#f7b545]" style={{ borderRadius: '50%' }} />
            <p className={`mt-3 text-sm ${sub}`}>Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className={`p-8 text-center text-sm ${sub}`}>No applications found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={`${theadBg} border-b ${divider}`}>
                <tr>
                  {['Student', 'Company & Role', 'Applied Date', 'CGPA', 'Status', 'Actions'].map((h, i) => (
                    <th key={h} className={`px-6 py-3 text-xs font-semibold ${sub} uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${divider}`}>
                {filteredApplications.map((app) => (
                  <tr key={app.id} className={`${rowHov} transition-colors`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${txt}`}>{app.student}</div>
                      <div className={`text-xs ${sub}`}>{app.usn}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${txt}`}>{app.company}</div>
                      <div className={`text-xs ${sub}`}>{app.role}</div>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${txt}`}>
                      {new Date(app.appliedDate).toLocaleDateString()}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${txt}`}>
                      {app.cgpa.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                        disabled={statusUpdateLoading === app.id}
                        className={`px-2.5 py-1 text-xs font-semibold border-0 cursor-pointer ${getStatusStyle(app.status)} disabled:opacity-50`}
                      >
                        {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => { setSelectedApplication(app); setShowDetailsModal(true); }}
                        className="text-indigo-500 hover:text-indigo-700 inline-flex items-center text-sm font-medium"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className={`absolute inset-0 ${overlay} backdrop-blur-sm`} onClick={() => setShowDetailsModal(false)} />
          <div className={`relative w-full max-w-2xl shadow-2xl ${modalBg} z-10 max-h-[90vh] flex flex-col`}>
            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-5 border-b ${divider} flex-shrink-0`}>
              <h3 className={`text-lg font-bold ${txt}`}>Application Details</h3>
              <button onClick={() => setShowDetailsModal(false)} className={`${sub} hover:opacity-70 transition-opacity`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-5 overflow-y-auto flex-1 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['Student Name', selectedApplication.student],
                  ['USN',          selectedApplication.usn],
                  ['Email',        selectedApplication.email || 'N/A'],
                  ['Branch',       selectedApplication.branch || 'N/A'],
                  ['CGPA',         selectedApplication.cgpa.toFixed(2)],
                  ['Year',         selectedApplication.year || 'N/A'],
                  ['Company',      selectedApplication.company],
                  ['Role',         selectedApplication.role],
                  ['Applied Date', new Date(selectedApplication.appliedDate).toLocaleDateString()],
                ].map(([label, value]) => (
                  <div key={label}>
                    <p className={`text-xs ${sub} mb-0.5`}>{label}</p>
                    <p className={`text-sm font-semibold ${txt}`}>{value}</p>
                  </div>
                ))}
                <div>
                  <p className={`text-xs ${sub} mb-0.5`}>Status</p>
                  <span className={`px-2.5 py-0.5 text-xs font-semibold ${getStatusStyle(selectedApplication.status)}`}>
                    {selectedApplication.status}
                  </span>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Update Status</label>
                <select
                  value={selectedApplication.status}
                  onChange={(e) => {
                    handleStatusUpdate(selectedApplication.id, e.target.value);
                    setShowDetailsModal(false);
                  }}
                  className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545]`}
                >
                  {Object.keys(STATUS_STYLES).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${txt} mb-1.5`}>Remarks (Optional)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any remarks or instructions for the student..."
                  rows={3}
                  className={`w-full px-4 py-2.5 border ${inp} text-sm outline-none focus:border-[#f7b545] resize-none`}
                />
              </div>
            </div>

            <div className={`flex justify-end px-6 py-5 border-t ${divider} ${isLight ? 'bg-gray-50' : 'bg-[#252528]'} flex-shrink-0`}>
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
