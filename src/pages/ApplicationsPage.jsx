import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import applicationService from '../services/applicationService';

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
        // Refresh applications list
        await fetchApplications();
      }
    } catch (error) {
      console.error('Failed to withdraw application:', error);
      alert(error.message || 'Failed to withdraw application. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Applied: '#2196F3',
      Shortlisted: '#FF9800',
      Selected: '#4CAF50',
      Rejected: '#f44336',
      Withdrawn: '#9E9E9E',
    };
    return colors[status] || '#9E9E9E';
  };

  const filteredApplications = filterStatus === 'All'
    ? applications
    : applications.filter(a => a.current_status === filterStatus);

  // Calculate stats
  const stats = {
    total: applications.length,
    applied: applications.filter(a => a.current_status === 'Applied').length,
    shortlisted: applications.filter(a => a.current_status === 'Shortlisted').length,
    selected: applications.filter(a => a.current_status === 'Selected').length,
    rejected: applications.filter(a => a.current_status === 'Rejected').length,
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>Loading your applications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorState}>
          Failed to load applications: {error}
          <button onClick={fetchApplications} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h2 style={styles.title}>My Applications</h2>
          <p style={styles.subtitle}>Track your placement drive applications</p>
        </div>

        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>📝</span>
          <h3>No applications yet</h3>
          <p>You haven't applied to any drives yet</p>
          <button onClick={() => navigate('/drives')} style={styles.browseButton}>
            Browse Placement Drives
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>My Applications</h2>
          <p style={styles.subtitle}>Track your placement drive applications</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div style={styles.statsContainer}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.total}</div>
          <div style={styles.statLabel}>Total</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{stats.applied}</div>
          <div style={styles.statLabel}>Applied</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statValue, color: '#FF9800'}}>{stats.shortlisted}</div>
          <div style={styles.statLabel}>Shortlisted</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statValue, color: '#4CAF50'}}>{stats.selected}</div>
          <div style={styles.statLabel}>Selected</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statValue, color: '#f44336'}}>{stats.rejected}</div>
          <div style={styles.statLabel}>Rejected</div>
        </div>
      </div>

      {/* Status Filters */}
      <div style={styles.filterContainer}>
        {['All', 'Applied', 'Shortlisted', 'Selected', 'Rejected'].map(status => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            style={{
              ...styles.filterButton,
              ...(filterStatus === status ? styles.filterButtonActive : {}),
            }}
          >
            {status}
            <span style={styles.badge}>
              {status === 'All'
                ? applications.length
                : applications.filter(a => a.current_status === status).length
              }
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div style={styles.noResults}>
          <p>No {filterStatus.toLowerCase()} applications</p>
        </div>
      ) : (
        <div style={styles.applicationsGrid}>
          {filteredApplications.map(application => (
            <ApplicationCard
              key={application.id}
              application={application}
              onViewTimeline={handleViewTimeline}
              onWithdraw={handleWithdraw}
              getStatusColor={getStatusColor}
            />
          ))}
        </div>
      )}

      {/* Timeline Modal */}
      {showTimelineModal && selectedApplication && (
        <TimelineModal
          application={selectedApplication}
          onClose={() => {
            setShowTimelineModal(false);
            setSelectedApplication(null);
          }}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Withdraw Modal */}
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

// Application Card Component
const ApplicationCard = ({ application, onViewTimeline, onWithdraw, getStatusColor }) => (
  <div style={styles.applicationCard}>
    <div style={styles.cardHeader}>
      <div>
        <h3 style={styles.companyName}>{application.company_name}</h3>
        <p style={styles.jobRole}>{application.job_role}</p>
      </div>

      <div
        style={{
          ...styles.statusBadge,
          backgroundColor: getStatusColor(application.current_status),
        }}
      >
        {application.current_status}
      </div>
    </div>

    <div style={styles.cardBody}>
      <div style={styles.detailRow}>
        <span style={styles.label}>Package:</span>
        <span style={styles.value}>{application.package || 'Not disclosed'}</span>
      </div>

      <div style={styles.detailRow}>
        <span style={styles.label}>Applied On:</span>
        <span style={styles.value}>
          {new Date(application.applied_at).toLocaleDateString()}
        </span>
      </div>

      <div style={styles.detailRow}>
        <span style={styles.label}>Drive Date:</span>
        <span style={styles.value}>
          {new Date(application.drive_date).toLocaleDateString()}
        </span>
      </div>
    </div>

    <div style={styles.cardActions}>
      <button onClick={() => onViewTimeline(application)} style={styles.timelineButton}>
        View Timeline →
      </button>

      {application.can_withdraw && (
        <button onClick={() => onWithdraw(application)} style={styles.withdrawButton}>
          Withdraw
        </button>
      )}
    </div>
  </div>
);

// Timeline Modal Component
const TimelineModal = ({ application, onClose, getStatusColor }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>
          Application Timeline - {application.company_name}
        </h3>
        <button onClick={onClose} style={styles.closeButton}>×</button>
      </div>

      <div style={styles.modalBody}>
        <div style={styles.timelineContainer}>
          {application.status_history?.map((item, index) => (
            <div key={index} style={styles.timelineItem}>
              <div
                style={{
                  ...styles.timelineDot,
                  backgroundColor: getStatusColor(item.status),
                }}
              />

              <div style={styles.timelineContent}>
                <div style={styles.timelineStatus}>{item.status}</div>
                <div style={styles.timelineDate}>
                  {new Date(item.updated_at).toLocaleString()}
                </div>
                {item.remarks && (
                  <div style={styles.timelineRemarks}>{item.remarks}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.modalActions}>
        <button onClick={onClose} style={styles.closeButtonAction}>
          Close
        </button>
      </div>
    </div>
  </div>
);

// Withdraw Modal Component
const WithdrawModal = ({ application, onClose, onConfirm, withdrawing }) => (
  <div style={styles.modalOverlay} onClick={onClose}>
    <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
      <div style={styles.modalHeader}>
        <h3 style={styles.modalTitle}>Withdraw Application</h3>
        <button onClick={onClose} style={styles.closeButton}>×</button>
      </div>

      <div style={styles.modalBody}>
        <div style={styles.warningBox}>
          <strong>⚠️ Warning</strong>
          <p>You are about to withdraw your application for:</p>
          <p><strong>{application.company_name} - {application.job_role}</strong></p>
          <p>This action cannot be undone. You may not be able to apply again for this drive.</p>
        </div>

        <p style={styles.confirmText}>Are you sure you want to proceed?</p>
      </div>

      <div style={styles.modalActions}>
        <button
          onClick={onClose}
          style={styles.cancelButton}
          disabled={withdrawing}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          style={styles.confirmWithdrawButton}
          disabled={withdrawing}
        >
          {withdrawing ? 'Withdrawing...' : 'Yes, Withdraw'}
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
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px',
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  statValue: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#333',
    margin: '0 0 8px 0',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
  },
  filterContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap',
  },
  filterButton: {
    padding: '10px 20px',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
    color: '#fff',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '0.8rem',
    fontWeight: '600',
  },
  applicationsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '24px',
  },
  applicationCard: {
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
    marginBottom: '16px',
    gap: '12px',
  },
  companyName: {
    margin: '0 0 4px 0',
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#333',
  },
  jobRole: {
    margin: 0,
    fontSize: '0.95rem',
    color: '#666',
  },
  statusBadge: {
    padding: '6px 14px',
    borderRadius: '16px',
    fontSize: '0.8rem',
    fontWeight: '600',
    color: '#fff',
    whiteSpace: 'nowrap',
  },
  cardBody: {
    marginBottom: '16px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f5f5f5',
  },
  label: {
    fontSize: '0.85rem',
    color: '#999',
  },
  value: {
    fontSize: '0.95rem',
    color: '#333',
    fontWeight: '500',
  },
  cardActions: {
    display: 'flex',
    gap: '12px',
    paddingTop: '16px',
    borderTop: '1px solid #e0e0e0',
  },
  timelineButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.3s',
  },
  withdrawButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.3s',
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
  browseButton: {
    marginTop: '20px',
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '500',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    color: '#666',
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
    maxWidth: '600px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
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
  timelineContainer: {
    position: 'relative',
    paddingLeft: '40px',
  },
  timelineItem: {
    position: 'relative',
    paddingBottom: '32px',
  },
  timelineDot: {
    position: 'absolute',
    left: '-40px',
    top: '4px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: '3px solid #fff',
    boxShadow: '0 0 0 2px currentColor',
  },
  timelineContent: {
    backgroundColor: '#f9f9f9',
    padding: '16px',
    borderRadius: '6px',
  },
  timelineStatus: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '4px',
  },
  timelineDate: {
    fontSize: '0.85rem',
    color: '#999',
    marginBottom: '8px',
  },
  timelineRemarks: {
    fontSize: '0.9rem',
    color: '#555',
    lineHeight: '1.5',
  },
  warningBox: {
    backgroundColor: '#ffebee',
    border: '1px solid #f44336',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '16px',
    color: '#c62828',
  },
  confirmText: {
    fontSize: '1rem',
    fontWeight: '500',
    margin: 0,
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    padding: '20px 24px',
    borderTop: '1px solid #e0e0e0',
  },
  closeButtonAction: {
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '500',
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
  confirmWithdrawButton: {
    padding: '10px 20px',
    backgroundColor: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
};

export default ApplicationsPage;
