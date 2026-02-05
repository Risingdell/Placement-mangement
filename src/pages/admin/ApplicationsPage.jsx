import { useState } from 'react';

function ApplicationsPage() {
  const [applications, setApplications] = useState([
    { id: 1, student: 'Rajesh Kumar', usn: '1MS21CS001', company: 'Google', role: 'SWE', appliedDate: '2026-02-20', status: 'Shortlisted', cgpa: 8.45 },
    { id: 2, student: 'Priya Sharma', usn: '1MS21CS002', company: 'Microsoft', role: 'SDE', appliedDate: '2026-02-18', status: 'Selected', cgpa: 9.12 },
    { id: 3, student: 'Amit Patel', usn: '1MS21CS003', company: 'Amazon', role: 'SDE-1', appliedDate: '2026-02-22', status: 'Applied', cgpa: 7.85 },
    { id: 4, student: 'Sneha Reddy', usn: '1MS21EC004', company: 'TCS', role: 'Systems Engineer', appliedDate: '2026-02-15', status: 'Rejected', cgpa: 8.92 },
  ]);

  const [filterStatus, setFilterStatus] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.usn.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' || app.status === filterStatus;
    const matchesCompany = filterCompany === '' || app.company === filterCompany;
    return matchesSearch && matchesStatus && matchesCompany;
  });

  const handleStatusUpdate = (id, newStatus) => {
    setApplications(applications.map(app =>
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'bg-blue-100 text-blue-800';
      case 'Shortlisted': return 'bg-yellow-100 text-yellow-800';
      case 'Selected': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h2 className="neo-title !text-3xl mb-1 uppercase tracking-tight">APPLICATION TRACKER</h2>
          <p className="neo-subtitle !text-[11px] font-bold opacity-60 uppercase">System Deployment Monitoring</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
        {[
          { label: 'Total Volume', count: applications.length, color: 'blue-500', emoji: '📂' },
          { label: 'New Entries', count: applications.filter(a => a.status === 'Applied').length, color: 'indigo-500', emoji: '📩' },
          { label: 'Validated', count: applications.filter(a => a.status === 'Shortlisted').length, color: 'yellow-500', emoji: '✅' },
          { label: 'Finalized', count: applications.filter(a => a.status === 'Selected').length, color: 'green-500', emoji: '✨' },
          { label: 'Rejected', count: applications.filter(a => a.status === 'Rejected').length, color: 'red-500', emoji: '🚫' }
        ].map((stat, index) => (
          <div key={index} className={`neo-card !bg-white !p-4 !gap-1 border-${stat.color} shadow-[4px_4px_0px_color(display-p3_0.5_0.5_0.5)]`}>
            <p className="neo-subtitle !text-[9px] font-bold opacity-60 uppercase">{stat.label}</p>
            <div className="flex items-center justify-between">
              <h3 className="neo-title !text-xl !mb-0">{stat.count}</h3>
              <span>{stat.emoji}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="neo-card !bg-white !p-6 mb-8 shadow-[6px_6px_0px_#d3d3d3]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
              SEARCH PERSONNEL
            </label>
            <input
              type="text"
              placeholder="NAME OR USN ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="neo-input uppercase !py-2"
            />
          </div>

          <div>
            <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
              SORT BY STATUS
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="neo-input uppercase !py-2"
            >
              <option value="">ALL STATUS LEVELS</option>
              <option value="Applied">APPLIED</option>
              <option value="Shortlisted">SHORTLISTED</option>
              <option value="Selected">SELECTED</option>
              <option value="Rejected">REJECTED</option>
            </select>
          </div>

          <div>
            <label className="neo-subtitle !text-[10px] font-bold uppercase mb-2 block text-[#323232]">
              FILTER BY ENTITY
            </label>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="neo-input uppercase !py-2"
            >
              <option value="">ALL CORPORATE PARTNERS</option>
              <option value="Google">GOOGLE</option>
              <option value="Microsoft">MICROSOFT</option>
              <option value="Amazon">AMAZON</option>
              <option value="TCS">TCS</option>
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="neo-card !bg-white !p-0 overflow-hidden mb-10 shadow-[8px_8px_0px_#d3d3d3]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#f8f8f8] border-b-2 border-[#323232]">
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Recruit Info
                </th>
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Target Entity & Role
                </th>
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Timestamp
                </th>
                <th className="px-6 py-4 text-left neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Status Tier
                </th>
                <th className="px-6 py-4 text-right neo-subtitle !text-[11px] font-bold uppercase tracking-wider text-[#323232]">
                  Operations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-[#323232] divide-dashed">
              {filteredApplications.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div>
                      <div className="neo-subtitle !text-[13px] font-bold text-[#323232]">{app.student.toUpperCase()}</div>
                      <div className="neo-subtitle !text-[10px] font-bold opacity-50 uppercase">{app.usn}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div>
                      <div className="neo-subtitle !text-[12px] font-bold text-indigo-700 uppercase">{app.company}</div>
                      <div className="neo-subtitle !text-[10px] font-bold opacity-60 uppercase">{app.role}</div>
                    </div>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap neo-subtitle !text-[11px] font-bold text-[#323232]">
                    {new Date(app.appliedDate).toLocaleDateString().toUpperCase()}
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap">
                    <select
                      value={app.status}
                      onChange={(e) => handleStatusUpdate(app.id, e.target.value)}
                      className={`neo-input !py-1 !px-2 !text-[10px] font-black border-2 shadow-[2px_2px_0px_#323232] uppercase cursor-pointer ${app.status === 'Selected' ? 'bg-green-100 border-green-600' :
                        app.status === 'Rejected' ? 'bg-red-100 border-red-600' :
                          app.status === 'Shortlisted' ? 'bg-yellow-100 border-yellow-600' :
                            'bg-blue-100 border-blue-600'
                        }`}
                    >
                      <option value="Applied">APPLIED</option>
                      <option value="Shortlisted">SHORTLISTED</option>
                      <option value="Selected">SELECTED</option>
                      <option value="Rejected">REJECTED</option>
                    </select>
                  </td>
                  <td className="px-6 py-5 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleViewDetails(app)}
                      className="neo-button !py-1 !px-3 !bg-indigo-50 !text-indigo-800 !text-[11px] !min-h-0 !border-[#4f46e5] uppercase"
                    >
                      DETAILS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="neo-card !bg-white !max-w-2xl w-full !p-8 shadow-[12px_12px_0px_#000]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="neo-title !text-2xl mb-1 uppercase tracking-tight">APPLICATION INTEL</h3>
                <p className="neo-subtitle !text-[11px] font-bold opacity-60 uppercase">Record ID: APP-2026-{selectedApplication.id}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 border-2 border-[#323232] flex items-center justify-center font-bold hover:bg-red-500 hover:text-white transition-colors"
              >
                X
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="neo-card !p-3 !bg-gray-50 !gap-0 border-[#323232]">
                  <p className="neo-subtitle !text-[9px] font-bold opacity-50 uppercase mb-1">Recruit Name</p>
                  <p className="neo-subtitle !text-[13px] font-bold uppercase">{selectedApplication.student}</p>
                </div>
                <div className="neo-card !p-3 !bg-gray-50 !gap-0 border-[#323232]">
                  <p className="neo-subtitle !text-[9px] font-bold opacity-50 uppercase mb-1">Entity Name</p>
                  <p className="neo-subtitle !text-[13px] font-bold uppercase text-indigo-700">{selectedApplication.company}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="neo-card !p-3 !bg-gray-50 !gap-0 border-[#323232]">
                  <p className="neo-subtitle !text-[9px] font-bold opacity-50 uppercase mb-1">Identification</p>
                  <p className="neo-subtitle !text-[13px] font-bold uppercase">{selectedApplication.usn}</p>
                </div>
                <div className="neo-card !p-3 !bg-gray-50 !gap-0 border-[#323232]">
                  <p className="neo-subtitle !text-[9px] font-bold opacity-50 uppercase mb-1">Operational Role</p>
                  <p className="neo-subtitle !text-[13px] font-bold uppercase">{selectedApplication.role}</p>
                </div>
              </div>
              <div className="neo-card !p-3 !bg-gray-50 !gap-0 border-[#323232]">
                <p className="neo-subtitle !text-[9px] font-bold opacity-50 uppercase mb-1">Performance (CGPA)</p>
                <p className="neo-subtitle !text-[13px] font-bold uppercase">{selectedApplication.cgpa.toFixed(2)}</p>
              </div>
              <div className="neo-card !p-3 !bg-gray-50 !gap-0 border-[#323232]">
                <p className="neo-subtitle !text-[9px] font-bold opacity-50 uppercase mb-1">Deployment State</p>
                <span className={`inline-block px-2 py-0.5 border-2 border-[#323232] text-[10px] font-black uppercase shadow-[2px_2px_0px_#323232] ${selectedApplication.status === 'Selected' ? 'bg-green-100' :
                  selectedApplication.status === 'Rejected' ? 'bg-red-100' :
                    'bg-blue-100'
                  }`}>
                  {selectedApplication.status}
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t-2 border-[#323232] border-dashed">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="neo-button !py-2 !px-8 !bg-[#323232] !text-white !min-h-0 uppercase"
              >
                CLOSE FILE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationsPage;
