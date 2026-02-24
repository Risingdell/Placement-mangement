import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import driveService from '../services/driveService';
import applicationService from '../services/applicationService';

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
        setDrives(response.data || []);
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
    // Check if profile is complete
    if (!profile || !profile.cgpa || !profile.sgpa) {
      alert('Please complete your academic profile before applying');
      navigate('/profile');
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
        alert('Application submitted successfully!');
        setShowApplyModal(false);
        setSelectedDrive(null);
        // Refresh drives to update hasApplied status
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

  const filterDrives = () => {
    let filtered = drives;

    // Filter by status
    if (filterStatus !== 'All') {
      filtered = filtered.filter(d => d.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(d =>
        d.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.job_role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredDrives = filterDrives();

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>Loading placement drives...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorState}>
          Failed to load drives: {error}
          <button onClick={fetchDrives} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Placement Drives</h2>
          <p style={styles.subtitle}>View and apply for placement opportunities</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.statusFilters}>
          {['All', 'Active', 'Upcoming', 'Completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              style={filterStatus === status ? styles.filterActive : styles.filter}
            >
              {status}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Search by company or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Drives List */}
      {filteredDrives.length === 0 ? (
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>🏢</span>
          <h3>No drives found</h3>
          <p>
            {searchQuery
              ? `No drives matching "${searchQuery}"`
              : `No ${filterStatus.toLowerCase()} drives at this time`
            }
          </p>
        </div>
      ) : (
        <div style={styles.drivesGrid}>
          {filteredDrives.map(drive => (
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

      {/* Apply Modal */}
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

// Drive Card Component
const DriveCard = ({ drive, onApply, isDeadlineSoon, formatDeadline }) => {
  const [showEligibility, setShowEligibility] = useState(false);

  return (
    <div style={styles.driveCard}>
      {/* Header */}
      <div style={styles.cardHeader}>
        <div style={styles.cardHeaderContent}>
          <h3 style={styles.companyName}>{drive.company_name}</h3>
          <p style={styles.jobRole}>{drive.job_role}</p>
        </div>

        {/* Eligibility Badge */}
        <div
          style={{
            ...styles.eligibilityBadge,
            backgroundColor: drive.isEligible ? '#e8f5e9' : '#ffebee',
            color: drive.isEligible ? '#2e7d32' : '#c62828',
          }}
        >
          {drive.isEligible ? '✓ Eligible' : '✗ Not Eligible'}
        </div>
      </div>

      {/* Attendance Key Badge - Display if student attended this drive */}
      {drive.attendance_key && (
        <div style={{
          marginBottom: '15px',
          padding: '12px 15px',
          background: 'linear-gradient(135deg, #f3e5f5 0%, #e3f2fd 100%)',
          border: '2px solid #9c27b0',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#6a1b9a',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            🎟️ Your Attendance Key
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#4a148c',
            letterSpacing: '2px',
            fontFamily: 'monospace',
            marginBottom: '6px'
          }}>
            {drive.attendance_key}
          </div>
          <div style={{
            fontSize: '10px',
            color: '#7b1fa2',
            fontStyle: 'italic'
          }}>
            ✓ Verified Attendee - Present this key during interviews
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div style={styles.detailsGrid}>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Package</span>
          <span style={styles.detailValue}>{drive.package || 'Not disclosed'}</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Location</span>
          <span style={styles.detailValue}>{drive.location || 'TBD'}</span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Deadline</span>
          <span
            style={{
              ...styles.detailValue,
              color: isDeadlineSoon(drive.registration_deadline) ? '#f44336' : '#333',
              fontWeight: isDeadlineSoon(drive.registration_deadline) ? '600' : '400',
            }}
          >
            {formatDeadline(drive.registration_deadline)}
          </span>
        </div>
        <div style={styles.detailItem}>
          <span style={styles.detailLabel}>Drive Date</span>
          <span style={styles.detailValue}>
            {new Date(drive.drive_date).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Eligibility Criteria Toggle */}
      <button
        onClick={() => setShowEligibility(!showEligibility)}
        style={styles.toggleButton}
      >
        {showEligibility ? '▼' : '▶'} Eligibility Criteria
      </button>

      {showEligibility && (
        <div style={styles.eligibilityCriteria}>
          <ul style={styles.criteriaList}>
            <li>Minimum CGPA: {drive.min_cgpa || 'N/A'}</li>
            <li>Maximum Active Backlogs: {drive.max_active_backlogs ?? 'N/A'}</li>
            {drive.allowed_branches && (
              <li>Allowed Branches: {drive.allowed_branches.join(', ')}</li>
            )}
            {drive.allowed_batch_years && (
              <li>Batch Years: {drive.allowed_batch_years.join(', ')}</li>
            )}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div style={styles.cardActions}>
        <span style={styles.applicationsCount}>
          {drive.applications_count || 0} applications
        </span>

        {drive.hasApplied ? (
          <button style={styles.appliedButton} disabled>
            Already Applied
          </button>
        ) : (
          <button
            onClick={() => onApply(drive)}
            disabled={!drive.isEligible || drive.status !== 'Active'}
            style={
              drive.isEligible && drive.status === 'Active'
                ? styles.applyButton
                : styles.applyButtonDisabled
            }
          >
            {drive.status === 'Active' ? 'Apply Now' : drive.status}
          </button>
        )}
      </div>
    </div>
  );
};

// Apply Modal Component
const ApplyModal = ({ drive, onClose, onConfirm, applying, formatDeadline }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>Apply for {drive.company_name}</h3>
        <button onClick={onClose} style={styles.closeButton}>×</button>
      </div>

      <div style={styles.modalBody}>
        <p><strong>Position:</strong> {drive.job_role}</p>
        <p><strong>Package:</strong> {drive.package || 'Not disclosed'}</p>
        <p><strong>Location:</strong> {drive.location || 'TBD'}</p>
        <p><strong>Deadline:</strong> {formatDeadline(drive.registration_deadline)}</p>

        <div style={styles.warningBox}>
          <strong>⚠️ Important:</strong>
          <ul style={styles.warningList}>
            <li>Ensure your profile is complete and up-to-date</li>
            <li>You cannot withdraw after the deadline</li>
            <li>Make sure you meet all eligibility criteria</li>
          </ul>
        </div>

        <p style={styles.confirmText}>Are you sure you want to apply?</p>
      </div>

      <div style={styles.modalActions}>
        <button
          onClick={onClose}
          style={styles.cancelButton}
          disabled={applying}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={styles.confirmButton}
          disabled={applying}
        >
          {applying ? 'Submitting...' : 'Confirm Application'}
        </button>
      </div>
    </div>
  </div>
);

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#666',
    margin: 0,
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  statusFilters: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  filter: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s',
  },
  filterActive: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  searchInput: {
    flex: '1',
    minWidth: '250px',
    padding: '10px 16px',
    fontSize: '1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    outline: 'none',
  },
  drivesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '24px',
  },
  driveCard: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '24px',
    transition: 'all 0.3s ease',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    gap: '12px',
  },
  cardHeaderContent: {
    flex: 1,
  },
  companyName: {
    margin: '0 0 6px 0',
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#333',
  },
  jobRole: {
    margin: 0,
    fontSize: '1rem',
    color: '#666',
  },
  eligibilityBadge: {
    padding: '6px 14px',
    borderRadius: '16px',
    fontSize: '0.8rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
    marginBottom: '16px',
  },
  detailItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  detailLabel: {
    fontSize: '0.8rem',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '1rem',
    color: '#333',
    fontWeight: '500',
  },
  toggleButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#666',
    textAlign: 'left',
    marginBottom: '12px',
    transition: 'background-color 0.3s',
  },
  eligibilityCriteria: {
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '16px',
  },
  criteriaList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '0.9rem',
    color: '#555',
  },
  cardActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
  },
  applicationsCount: {
    fontSize: '0.85rem',
    color: '#999',
  },
  applyButton: {
    padding: '10px 24px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  applyButtonDisabled: {
    padding: '10px 24px',
    backgroundColor: '#e0e0e0',
    color: '#999',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  appliedButton: {
    padding: '10px 24px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'default',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  loadingState: {
    textAlign: 'center',
    padding: '80px 20px',
    fontSize: '1.1rem',
    color: '#666',
  },
  errorState: {
    textAlign: 'center',
    padding: '80px 20px',
    fontSize: '1rem',
    color: '#f44336',
  },
  retryButton: {
    marginTop: '20px',
    padding: '10px 24px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  emptyIcon: {
    fontSize: '4rem',
    display: 'block',
    marginBottom: '20px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    maxWidth: '500px',
    width: '90%',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e0e0e0',
  },
  modalTitle: {
    margin: 0,
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '2rem',
    color: '#999',
    cursor: 'pointer',
    padding: 0,
    width: '32px',
    height: '32px',
  },
  modalBody: {
    padding: '24px',
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '6px',
    padding: '16px',
    margin: '20px 0',
  },
  warningList: {
    margin: '8px 0 0 0',
    paddingLeft: '20px',
    fontSize: '0.9rem',
    color: '#856404',
  },
  confirmText: {
    fontSize: '1rem',
    fontWeight: '500',
    margin: '16px 0 0 0',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '20px 24px',
    borderTop: '1px solid #e0e0e0',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
  },
  confirmButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
};

export default DrivesPage;
