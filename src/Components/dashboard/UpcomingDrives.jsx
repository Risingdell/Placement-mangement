import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import driveService from '../../services/driveService';

function UpcomingDrives() {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUpcomingDrives = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await driveService.getUpcomingDrives();
        if (response.success) {
          setDrives(response.data || []);
        } else {
          setError(response.message || 'Failed to load upcoming drives');
        }
      } catch (err) {
        console.error('Failed to fetch upcoming drives:', err);
        setError(err.message || 'Failed to load upcoming drives');
      } finally {
        setLoading(false);
      }
    };

    loadUpcomingDrives();
  }, []);

  const formatDeadline = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `${diffDays} days left`;
    return date.toLocaleDateString();
  };

  const isDeadlineSoon = (deadline) => {
    const date = new Date(deadline);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Upcoming Placement Drives</h3>
        <div style={styles.loadingText}>Loading upcoming drives...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Upcoming Placement Drives</h3>
        <div style={styles.errorText}>
          {error}
        </div>
      </div>
    );
  }

  if (drives.length === 0) {
    return (
      <div style={styles.container}>
        <h3 style={styles.title}>Upcoming Placement Drives</h3>
        <div style={styles.emptyState}>
          <span style={styles.emptyIcon}>ðŸ¢</span>
          <p style={styles.emptyText}>No upcoming drives at this time</p>
          <p style={styles.emptySubtext}>Check back later for new opportunities</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Upcoming Placement Drives</h3>
        <button
          onClick={() => navigate('/dashboard/drives')}
          style={styles.viewAllLink}
        >
          View All â†’
        </button>
      </div>

      <div style={styles.drivesList}>
        {drives.map((drive) => (
          <div
            key={drive.id}
            style={styles.driveCard}
            onClick={() => navigate('/dashboard/drives')}
          >
            <div style={styles.driveHeader}>
              <div>
                <h4 style={styles.companyName}>{drive.company_name}</h4>
                <p style={styles.jobRole}>{drive.job_role}</p>
              </div>
              <div
                style={{
                  ...styles.eligibilityBadge,
                  backgroundColor: drive.eligible ? '#e8f5e9' : '#ffebee',
                  color: drive.eligible ? '#2e7d32' : '#c62828',
                }}
              >
                {drive.eligible ? 'âœ“ Eligible' : 'âœ— Ineligible'}
              </div>
            </div>

            <div style={styles.driveDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Package:</span>
                <span style={styles.detailValue}>{drive.package || 'N/A'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Deadline:</span>
                <span
                  style={{
                    ...styles.detailValue,
                    color: isDeadlineSoon(drive.application_deadline)
                      ? '#f44336'
                      : '#666',
                    fontWeight: isDeadlineSoon(drive.application_deadline)
                      ? '600'
                      : '400',
                  }}
                >
                  {formatDeadline(drive.application_deadline)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => navigate('/dashboard/drives')}
        style={styles.viewAllButton}
      >
        View All Drives
      </button>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#333',
  },
  viewAllLink: {
    background: 'none',
    border: 'none',
    color: '#2196F3',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    padding: '4px 8px',
    transition: 'color 0.3s',
  },
  drivesList: {
    flex: 1,
    overflowY: 'auto',
    marginBottom: '16px',
  },
  driveCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    ':hover': {
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    },
  },
  driveHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  },
  companyName: {
    margin: '0 0 4px 0',
    fontSize: '1.1rem',
    fontWeight: '600',
    color: '#333',
  },
  jobRole: {
    margin: 0,
    fontSize: '0.9rem',
    color: '#666',
  },
  eligibilityBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
  },
  driveDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: '0.85rem',
    color: '#999',
  },
  detailValue: {
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
  },
  viewAllButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#2196F3',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  loadingText: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#999',
    fontSize: '0.95rem',
  },
  errorText: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#f44336',
    fontSize: '0.95rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  emptyIcon: {
    fontSize: '3rem',
    display: 'block',
    marginBottom: '16px',
  },
  emptyText: {
    margin: '0 0 8px 0',
    color: '#666',
    fontSize: '1rem',
    fontWeight: '500',
  },
  emptySubtext: {
    margin: 0,
    color: '#999',
    fontSize: '0.9rem',
  },
};

export default UpcomingDrives;

