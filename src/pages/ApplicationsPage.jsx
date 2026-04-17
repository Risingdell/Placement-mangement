import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import applicationService from '../services/applicationService';
import { SkeletonDark } from '../Components/common/Skeleton';

function ApplicationsPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [withdrawing, setWithdrawing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await applicationService.getMyApplications();
      if (response.success) {
        setApplications(response.data || []);
      } else {
        setError(response.message || 'Failed to load applications');
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
      setError(err.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleViewTimeline = (application) => {
    setSelectedApplication(application);
    setShowTimelineModal(true);
  };

  const handleWithdraw = (application) => {
    setSelectedApplication(application);
    setShowWithdrawModal(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!selectedApplication) return;
    setWithdrawing(true);
    try {
      const response = await applicationService.withdrawApplication(selectedApplication.id);
      if (response.success) {
        alert('Application withdrawn successfully');
        setShowWithdrawModal(false);
        setSelectedApplication(null);
        await fetchApplications();
      }
    } catch (error) {
      console.error('Failed to withdraw application:', error);
      alert(error.message || 'Failed to withdraw application. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusTone = (status) => {
    const tones = {
      Applied: 'text-blue-300 bg-blue-500/10 border-blue-400/30',
      Shortlisted: 'text-amber-300 bg-amber-500/10 border-amber-400/30',
      Selected: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
      Rejected: 'text-red-300 bg-red-500/10 border-red-400/30',
      Withdrawn: 'text-zinc-300 bg-zinc-500/10 border-zinc-400/30',
    };
    return tones[status] || tones.Withdrawn;
  };

  const filteredApplications =
    filterStatus === 'All'
      ? applications
      : applications.filter((a) => a.current_status === filterStatus);

  const stats = {
    total: applications.length,
    applied: applications.filter((a) => a.current_status === 'Applied').length,
    shortlisted: applications.filter((a) => a.current_status === 'Shortlisted').length,
    selected: applications.filter((a) => a.current_status === 'Selected').length,
    rejected: applications.filter((a) => a.current_status === 'Rejected').length,
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">My Applications</h2>
        <p className="text-zinc-400 mt-1">Track status and timeline of each drive you applied to.</p>
      </div>

      {loading && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border border-[#2f2f36] bg-[#1d1d22] p-5">
              <SkeletonDark className="h-6 w-2/3 mb-2" />
              <SkeletonDark className="h-4 w-1/3 mb-4" />
              <SkeletonDark className="h-4 w-full mb-2" />
              <SkeletonDark className="h-4 w-full mb-2" />
              <SkeletonDark className="h-4 w-3/4 mb-4" />
              <SkeletonDark className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          Failed to load applications: {error}
        </div>
      )}

      {!loading && !error && applications.length === 0 && (
        <div className="border border-[#2f2f36] bg-[#1d1d22] p-10 text-center">
          <p className="text-zinc-200 text-lg font-semibold">No applications yet</p>
          <p className="text-zinc-400 text-sm mt-1">Start by exploring active placement drives.</p>
          <button
            onClick={() => navigate('/dashboard/drives')}
            className="mt-5 w-full sm:w-auto bg-[#f7b545] text-[#1a1a1f] px-5 py-2.5 text-sm font-semibold border-none cursor-pointer hover:bg-[#f9c46c]"
          >
            Browse Placement Drives
          </button>
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <>
          <div className="mb-6 grid grid-cols-2 lg:grid-cols-5 gap-3">
            <StatCard label="Total" value={stats.total} />
            <StatCard label="Applied" value={stats.applied} />
            <StatCard label="Shortlisted" value={stats.shortlisted} tone="text-amber-300" />
            <StatCard label="Selected" value={stats.selected} tone="text-emerald-300" />
            <StatCard label="Rejected" value={stats.rejected} tone="text-red-300" />
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {['All', 'Applied', 'Shortlisted', 'Selected', 'Rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 border text-sm font-medium cursor-pointer ${
                  filterStatus === status
                    ? 'bg-[#f7b545] text-[#1b1b1f] border-[#f7b545]'
                    : 'bg-[#1f1f24] text-zinc-300 border-[#33333a] hover:bg-[#26262d]'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {filteredApplications.length === 0 ? (
            <div className="border border-[#2f2f36] bg-[#1d1d22] px-4 py-8 text-center text-zinc-400 text-sm">
              No {filterStatus.toLowerCase()} applications
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {filteredApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  onViewTimeline={handleViewTimeline}
                  onWithdraw={handleWithdraw}
                  getStatusTone={getStatusTone}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showTimelineModal && selectedApplication && (
        <TimelineModal
          application={selectedApplication}
          onClose={() => {
            setShowTimelineModal(false);
            setSelectedApplication(null);
          }}
          getStatusTone={getStatusTone}
        />
      )}

      {showWithdrawModal && selectedApplication && (
        <WithdrawModal
          application={selectedApplication}
          onClose={() => {
            setShowWithdrawModal(false);
            setSelectedApplication(null);
          }}
          onConfirm={handleConfirmWithdraw}
          withdrawing={withdrawing}
        />
      )}
    </div>
  );
}

const StatCard = ({ label, value, tone = 'text-zinc-100' }) => (
  <div className="border border-[#2f2f36] bg-[#1d1d22] px-4 py-3">
    <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
    <p className={`text-2xl font-semibold mt-1 ${tone}`}>{value}</p>
  </div>
);

const ApplicationCard = ({ application, onViewTimeline, onWithdraw, getStatusTone }) => (
  <article className="border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="text-xl font-semibold text-zinc-100">{application.company_name}</h3>
        <p className="text-sm text-zinc-400">{application.job_role}</p>
      </div>
      <span className={`px-2.5 py-1 text-xs border ${getStatusTone(application.current_status)}`}>
        {application.current_status}
      </span>
    </div>

    <div className="space-y-2 mb-4 text-sm">
      <Row label="Package" value={application.package || 'Not disclosed'} />
      <Row label="Applied On" value={new Date(application.applied_at).toLocaleDateString()} />
      <Row label="Drive Date" value={new Date(application.drive_date).toLocaleDateString()} />
    </div>

    <div className="border-t border-[#2c2c33] pt-4 flex gap-3">
      <button
        onClick={() => onViewTimeline(application)}
        className="flex-1 border border-[#363640] bg-[#24242b] px-4 py-2 text-sm text-zinc-200 cursor-pointer hover:bg-[#2d2d35]"
      >
        View Timeline
      </button>
      {application.can_withdraw && (
        <button
          onClick={() => onWithdraw(application)}
          className="border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300 cursor-pointer hover:bg-red-500/20"
        >
          Withdraw
        </button>
      )}
    </div>
  </article>
);

const Row = ({ label, value }) => (
  <div className="flex items-center justify-between border-b border-[#27272f] pb-2">
    <span className="text-zinc-500">{label}</span>
    <span className="text-zinc-200">{value}</span>
  </div>
);

const TimelineModal = ({ application, onClose, getStatusTone }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className="w-full max-w-2xl max-h-[85vh] overflow-auto border border-[#33333a] bg-[#1d1d22]" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2c2c33]">
        <h3 className="text-lg font-semibold text-zinc-100">Application Timeline</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 bg-transparent border-none cursor-pointer text-xl">
          x
        </button>
      </div>
      <div className="p-5 space-y-4">
        {application.status_history?.map((item, index) => (
          <div key={index} className="border border-[#34343d] bg-[#23232a] p-4">
            <div className="flex items-center justify-between gap-3">
              <span className={`px-2.5 py-1 text-xs border ${getStatusTone(item.status)}`}>{item.status}</span>
              <span className="text-xs text-zinc-500">{new Date(item.updated_at).toLocaleString()}</span>
            </div>
            {item.remarks && <p className="text-sm text-zinc-300 mt-2">{item.remarks}</p>}
          </div>
        ))}
      </div>
    </div>
  </div>
);

const WithdrawModal = ({ application, onClose, onConfirm, withdrawing }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className="w-full max-w-lg border border-[#33333a] bg-[#1d1d22]" onClick={(e) => e.stopPropagation()}>
      <div className="px-5 py-4 border-b border-[#2c2c33]">
        <h3 className="text-lg font-semibold text-zinc-100">Withdraw Application</h3>
      </div>
      <div className="p-5">
        <div className="border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">
          <p className="font-semibold mb-1">This action cannot be undone.</p>
          <p>{application.company_name} - {application.job_role}</p>
        </div>
      </div>
      <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#2c2c33]">
        <button
          onClick={onClose}
          disabled={withdrawing}
          className="border border-[#3a3a43] bg-[#24242b] px-4 py-2 text-sm text-zinc-300 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={withdrawing}
          className="border-none bg-red-500 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-red-600"
        >
          {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
        </button>
      </div>
    </div>
  </div>
);

export default ApplicationsPage;
