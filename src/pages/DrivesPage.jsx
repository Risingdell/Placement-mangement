import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import driveService from '../services/driveService';
import applicationService from '../services/applicationService';
import { SkeletonDark } from '../Components/common/Skeleton';

const parseJsonArray = (value) => {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseEligibilityCriteria = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item));

  if (typeof value === 'object') {
    return Object.entries(value)
      .filter(([, v]) => v !== null && v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
  }

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parseEligibilityCriteria(parsed);
    } catch {
      return value.trim() ? [value.trim()] : [];
    }
  }

  return [];
};

const normalizeDrive = (drive) => {
  const allowedBranches = parseJsonArray(drive.allowed_branches);
  const allowedBatchYears = parseJsonArray(drive.allowed_batch_years || drive.batch_years);
  const criteriaList = parseEligibilityCriteria(drive.eligibility_criteria);

  return {
    ...drive,
    job_role: drive.job_role || drive.role || 'Role not specified',
    package: drive.package || drive.ctc || null,
    max_active_backlogs:
      drive.max_active_backlogs !== undefined && drive.max_active_backlogs !== null
        ? drive.max_active_backlogs
        : drive.max_backlogs,
    isEligible:
      drive.isEligible !== undefined && drive.isEligible !== null
        ? drive.isEligible
        : Boolean(drive.eligible),
    hasApplied:
      drive.hasApplied !== undefined && drive.hasApplied !== null
        ? drive.hasApplied
        : Boolean(drive.has_applied),
    applications_count:
      drive.applications_count !== undefined && drive.applications_count !== null
        ? drive.applications_count
        : (drive.total_applicants || 0),
    allowed_branches: allowedBranches,
    allowed_batch_years: allowedBatchYears,
    criteriaList,
    eligibilityReasons: drive.eligibilityReasons || drive.eligibility_reasons || null,
  };
};

function DrivesPage() {
  const { profile } = useStudent();
  const navigate = useNavigate();
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchDrives();
  }, []);

  const fetchDrives = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await driveService.getAllDrives();
      if (response.success) {
        setDrives((response.data || []).map(normalizeDrive));
      } else {
        setError(response.message || 'Failed to load drives');
      }
    } catch (err) {
      console.error('Failed to fetch drives:', err);
      setError(err.message || 'Failed to load drives');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (drive) => {
    if (!profile || !profile.cgpa || !profile.sgpa) {
      alert('Please complete your academic profile before applying');
      navigate('/dashboard/profile');
      return;
    }
    setSelectedDrive(drive);
    setShowApplyModal(true);
  };

  const handleConfirmApply = async () => {
    if (!selectedDrive) return;
    setApplying(true);
    try {
      const response = await applicationService.applyForDrive(selectedDrive.id);
      if (response.success) {
        alert('Application submitted successfully');
        setShowApplyModal(false);
        setSelectedDrive(null);
        await fetchDrives();
      }
    } catch (error) {
      console.error('Failed to apply:', error);
      alert(error.message || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const isDeadlineSoon = (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffDays = Math.ceil((deadlineDate - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return date.toLocaleDateString();
  };

  const filteredDrives = drives
    .filter((d) => (filterStatus === 'All' ? true : d.status === filterStatus))
    .filter((d) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (d.company_name || '').toLowerCase().includes(q) || (d.job_role || '').toLowerCase().includes(q);
    });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-zinc-100">Placement Drives</h2>
        <p className="text-zinc-400 mt-1">Find active opportunities and apply with one click.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', 'Active', 'Upcoming', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#f7b545] text-[#1b1b1f] border-[#f7b545]'
                  : 'bg-[#1f1f24] text-zinc-300 border-[#33333a] hover:bg-[#26262d]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search company or role"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full lg:w-80 rounded-lg border border-[#33333a] bg-[#1f1f24] px-4 py-2.5 text-sm text-zinc-100 outline-none"
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-5">
              <SkeletonDark className="h-6 w-2/3 mb-2" />
              <SkeletonDark className="h-4 w-1/3 mb-4" />
              <div className="grid grid-cols-2 gap-4 mb-4">
                <SkeletonDark className="h-10" />
                <SkeletonDark className="h-10" />
                <SkeletonDark className="h-10" />
                <SkeletonDark className="h-10" />
              </div>
              <SkeletonDark className="h-10 w-full" />
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
          Failed to load drives: {error}
        </div>
      )}

      {!loading && !error && filteredDrives.length === 0 && (
        <div className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-12 text-center">
          <p className="text-zinc-200 text-lg font-medium">No drives found</p>
          <p className="text-zinc-400 text-sm mt-1">Try changing filters or search query.</p>
        </div>
      )}

      {!loading && !error && filteredDrives.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredDrives.map((drive) => (
            <DriveCard
              key={drive.id}
              drive={drive}
              onApply={handleApply}
              isDeadlineSoon={isDeadlineSoon}
              formatDeadline={formatDeadline}
            />
          ))}
        </div>
      )}

      {showApplyModal && selectedDrive && (
        <ApplyModal
          drive={selectedDrive}
          onClose={() => {
            setShowApplyModal(false);
            setSelectedDrive(null);
          }}
          onConfirm={handleConfirmApply}
          applying={applying}
          formatDeadline={formatDeadline}
        />
      )}
    </div>
  );
}

const DriveCard = ({ drive, onApply, isDeadlineSoon, formatDeadline }) => {
  const [showEligibility, setShowEligibility] = useState(false);

  return (
    <article className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-semibold text-zinc-100">{drive.company_name}</h3>
          <p className="text-sm text-zinc-400">{drive.job_role}</p>
        </div>
        <span className={`inline-flex items-center gap-2 text-xs font-medium ${drive.isEligible ? 'text-emerald-300' : 'text-red-300'}`}>
          <span className={`h-2 w-2 rounded-full ${drive.isEligible ? 'bg-emerald-400' : 'bg-red-400'}`} />
          {drive.isEligible ? 'Eligible' : 'Not Eligible'}
        </span>
      </div>

      {drive.attendance_key && (
        <div className="mb-4 rounded-xl border border-[#6d4cf3]/30 bg-[#6d4cf3]/10 px-4 py-3">
          <p className="text-[11px] uppercase tracking-wider text-violet-300">Attendance Key</p>
          <p className="mt-1 text-lg font-semibold text-violet-200">{drive.attendance_key}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <Detail label="Package" value={drive.package || 'Not disclosed'} />
        <Detail label="Location" value={drive.location || 'TBD'} />
        <Detail
          label="Deadline"
          value={formatDeadline(drive.registration_deadline)}
          tone={isDeadlineSoon(drive.registration_deadline) ? 'text-red-300' : 'text-zinc-200'}
        />
        <Detail label="Drive Date" value={new Date(drive.drive_date).toLocaleDateString()} />
      </div>

      <button
        onClick={() => setShowEligibility((prev) => !prev)}
        className="w-full mb-4 rounded-lg border border-[#34343d] bg-[#23232a] px-3 py-2 text-left text-sm text-zinc-300 hover:bg-[#2a2a33] cursor-pointer"
      >
        {showEligibility ? 'Hide' : 'Show'} Eligibility Criteria
      </button>

      {showEligibility && (
        <div className="mb-4 rounded-lg border border-[#34343d] bg-[#23232a] p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <EligibilityItem label="Minimum CGPA" value={drive.min_cgpa ?? 'N/A'} />
            <EligibilityItem label="Maximum Active Backlogs" value={drive.max_active_backlogs ?? 'N/A'} />
            <EligibilityItem
              label="Allowed Branches"
              value={drive.allowed_branches.length > 0 ? drive.allowed_branches.join(', ') : 'All branches'}
            />
            <EligibilityItem
              label="Batch Years"
              value={drive.allowed_batch_years.length > 0 ? drive.allowed_batch_years.join(', ') : 'All batches'}
            />
          </div>

          {drive.criteriaList.length > 0 && (
            <div className="mt-3 rounded-md border border-[#3a3a43] bg-[#2b2b33] p-3">
              <p className="text-[11px] uppercase tracking-wider text-zinc-500 mb-2">Additional Criteria</p>
              <ul className="space-y-1.5 text-sm text-zinc-300">
                {drive.criteriaList.map((item, idx) => (
                  <li key={`${drive.id}-criteria-${idx}`} className="leading-relaxed">
                    • {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Array.isArray(drive.eligibilityReasons) && drive.eligibilityReasons.length > 0 && (
            <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-[11px] uppercase tracking-wider text-red-300 mb-2">Why You Are Not Eligible</p>
              <ul className="space-y-1.5 text-sm text-red-200">
                {drive.eligibilityReasons.map((reason, idx) => (
                  <li key={`${drive.id}-reason-${idx}`}>• {reason}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between border-t border-[#2c2c33] pt-4">
        <span className="text-xs text-zinc-400">{drive.applications_count || 0} applications</span>

        {drive.hasApplied ? (
          <button className="rounded-lg bg-[#1f3d2d] text-emerald-300 px-4 py-2 text-sm font-medium border border-emerald-500/30 cursor-default">
            Already Applied
          </button>
        ) : (
          <button
            onClick={() => onApply(drive)}
            disabled={!drive.isEligible || drive.status !== 'Active'}
            className={`rounded-lg px-4 py-2 text-sm font-semibold border-none ${
              drive.isEligible && drive.status === 'Active'
                ? 'bg-[#f7b545] text-[#1a1a1f] cursor-pointer hover:bg-[#f9c46c]'
                : 'bg-[#2a2a31] text-zinc-500 cursor-not-allowed'
            }`}
          >
            {drive.status === 'Active' ? 'Apply Now' : drive.status}
          </button>
        )}
      </div>
    </article>
  );
};

const Detail = ({ label, value, tone = 'text-zinc-200' }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
    <p className={`mt-1 text-sm ${tone}`}>{value}</p>
  </div>
);

const EligibilityItem = ({ label, value }) => (
  <div className="rounded-md border border-[#3a3a43] bg-[#2b2b33] px-3 py-2">
    <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
    <p className="mt-1 text-sm text-zinc-200">{value}</p>
  </div>
);

const ApplyModal = ({ drive, onClose, onConfirm, applying, formatDeadline }) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
    <div className="w-full max-w-lg rounded-2xl border border-[#33333a] bg-[#1d1d22]" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2c2c33]">
        <h3 className="text-lg font-semibold text-zinc-100">Apply for {drive.company_name}</h3>
        <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 bg-transparent border-none cursor-pointer text-xl">
          x
        </button>
      </div>

      <div className="p-5 text-sm text-zinc-300 space-y-2">
        <p><span className="text-zinc-500">Position:</span> {drive.job_role}</p>
        <p><span className="text-zinc-500">Package:</span> {drive.package || 'Not disclosed'}</p>
        <p><span className="text-zinc-500">Location:</span> {drive.location || 'TBD'}</p>
        <p><span className="text-zinc-500">Deadline:</span> {formatDeadline(drive.registration_deadline)}</p>

        <div className="mt-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-amber-200">
          <p className="font-semibold mb-1">Before submitting</p>
          <ul className="list-disc ml-4 space-y-1 text-xs">
            <li>Ensure your profile is complete and up-to-date</li>
            <li>You cannot withdraw after the deadline</li>
            <li>Verify all eligibility criteria</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-end gap-3 px-5 py-4 border-t border-[#2c2c33]">
        <button
          onClick={onClose}
          disabled={applying}
          className="rounded-lg border border-[#3a3a43] bg-[#24242b] px-4 py-2 text-sm text-zinc-300 cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={applying}
          className="rounded-lg bg-[#f7b545] text-[#1a1a1f] px-4 py-2 text-sm font-semibold border-none cursor-pointer hover:bg-[#f9c46c]"
        >
          {applying ? 'Submitting...' : 'Confirm Application'}
        </button>
      </div>
    </div>
  </div>
);

export default DrivesPage;
