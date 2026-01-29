import { useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import { useNavigate } from 'react-router-dom';

function CompactKPIBar() {
  const { profile, eligibility, fetchProfile, fetchEligibility } = useStudent();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchProfile(), fetchEligibility()]);
      } catch (error) {
        console.error('Failed to load KPI data:', error);
      }
    };

    loadData();
  }, []);

  if (!profile || !eligibility) {
    return null; // Don't show if data not loaded
  }

  const ongoingProjectsCount = eligibility.ongoingProject ? 1 : 0;
  const isEligible = eligibility.eligible;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* CGPA */}
        <div style={styles.kpiItem}>
          <span style={styles.label}>CGPA</span>
          <span style={{
            ...styles.value,
            color: eligibility.cgpa >= 6.0 ? '#4CAF50' : '#f44336'
          }}>
            {eligibility.cgpa ? eligibility.cgpa.toFixed(2) : 'N/A'}
          </span>
        </div>

        <div style={styles.divider} />

        {/* SGPA */}
        <div style={styles.kpiItem}>
          <span style={styles.label}>SGPA</span>
          <span style={styles.value}>
            {profile.sgpa ? profile.sgpa.toFixed(2) : 'N/A'}
          </span>
        </div>

        <div style={styles.divider} />

        {/* Ongoing Projects */}
        <div
          style={{...styles.kpiItem, cursor: 'pointer'}}
          onClick={() => navigate('/dashboard/profile')}
          title="Click to view profile"
        >
          <span style={styles.label}>Projects</span>
          <span style={styles.value}>
            {ongoingProjectsCount} Ongoing
          </span>
        </div>

        <div style={styles.divider} />

        {/* Eligibility Badge */}
        <div style={styles.kpiItem}>
          <div style={{
            ...styles.badge,
            backgroundColor: isEligible ? '#4CAF50' : '#f44336',
          }}>
            {isEligible ? '✓ Eligible' : '✗ Not Eligible'}
          </div>
        </div>

        <div style={styles.divider} />

        {/* Placement Status */}
        <div style={styles.kpiItem}>
          <div style={{
            ...styles.badge,
            backgroundColor: eligibility.isPlaced ? '#2196F3' : '#FF9800',
          }}>
            {eligibility.isPlaced ? 'Placed' : 'Active'}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: '73px', // Below the navbar
    zIndex: 99,
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px 24px',
    gap: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    flexWrap: 'wrap',
  },
  kpiItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    minWidth: '100px',
  },
  label: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  value: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    width: '1px',
    height: '40px',
    backgroundColor: '#e0e0e0',
  },
  badge: {
    padding: '6px 16px',
    borderRadius: '16px',
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#fff',
    whiteSpace: 'nowrap',
  },
};

export default CompactKPIBar;
