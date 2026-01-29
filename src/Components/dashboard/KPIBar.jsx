import { useEffect, useState } from 'react';
import { useStudent } from '../../context/StudentContext';

function KPIBar() {
  const { eligibility, fetchEligibility, profile, fetchProfile } = useStudent();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProfile(), fetchEligibility()]);
      } catch (error) {
        console.error('Failed to load KPI data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingText}>Loading academic information...</div>
      </div>
    );
  }

  if (!eligibility || !profile) {
    return (
      <div style={styles.container}>
        <div style={styles.errorText}>
          Please complete your academic profile to view eligibility status
        </div>
      </div>
    );
  }

  const isEligible = eligibility.eligible;
  const ongoingProject = eligibility.ongoingProject;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Academic & Eligibility Status</h3>

      <div style={styles.kpiGrid}>
        {/* CGPA */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>CGPA</div>
          <div style={{...styles.kpiValue, color: eligibility.cgpa >= 6.0 ? '#4CAF50' : '#f44336'}}>
            {eligibility.cgpa ? eligibility.cgpa.toFixed(2) : 'N/A'}
          </div>
          <div style={styles.kpiSubtext}>
            Min Required: {eligibility.criteria?.minCgpa || 6.0}
          </div>
        </div>

        {/* SGPA */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Current SGPA</div>
          <div style={styles.kpiValue}>
            {profile.sgpa ? profile.sgpa.toFixed(2) : 'N/A'}
          </div>
          <div style={styles.kpiSubtext}>Semester {profile.current_semester || '-'}</div>
        </div>

        {/* Backlogs */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Active Backlogs</div>
          <div style={{...styles.kpiValue, color: eligibility.activeBacklogs === 0 ? '#4CAF50' : '#f44336'}}>
            {eligibility.activeBacklogs}
          </div>
          <div style={styles.kpiSubtext}>
            Max Allowed: {eligibility.criteria?.maxBacklogs}
          </div>
        </div>

        {/* Ongoing Project */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Ongoing Project</div>
          <div style={styles.kpiValue}>
            {ongoingProject ? '✓' : '✗'}
          </div>
          <div style={styles.kpiSubtext}>
            {ongoingProject ? ongoingProject.title : 'None'}
          </div>
        </div>

        {/* Placement Status */}
        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Placement Status</div>
          <div style={{...styles.kpiValue, color: eligibility.isPlaced ? '#4CAF50' : '#2196F3'}}>
            {eligibility.isPlaced ? 'PLACED' : 'ACTIVE'}
          </div>
          <div style={styles.kpiSubtext}>
            {eligibility.isPlaced ? 'Cannot apply for drives' : 'Can apply for drives'}
          </div>
        </div>

        {/* Overall Eligibility */}
        <div style={{...styles.kpiCard, ...styles.eligibilityCard, backgroundColor: isEligible ? '#e8f5e9' : '#ffebee'}}>
          <div style={styles.kpiLabel}>Overall Eligibility</div>
          <div style={{
            ...styles.kpiValue,
            fontSize: '2rem',
            color: isEligible ? '#2e7d32' : '#c62828'
          }}>
            {isEligible ? '✓ ELIGIBLE' : '✗ NOT ELIGIBLE'}
          </div>
          <div style={styles.kpiSubtext}>
            {isEligible
              ? 'You can apply for placement drives'
              : 'Complete your profile to become eligible'}
          </div>
        </div>
      </div>

      {/* Branch and Batch Info */}
      <div style={styles.additionalInfo}>
        <span style={styles.infoItem}>
          <strong>Branch:</strong> {profile.branch || 'N/A'}
        </span>
        <span style={styles.infoItem}>
          <strong>Batch:</strong> {profile.batch_year || 'N/A'}
        </span>
        <span style={styles.infoItem}>
          <strong>USN:</strong> {profile.usn || 'N/A'}
        </span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  title: {
    margin: '0 0 20px 0',
    fontSize: '1.5rem',
    color: '#333',
    borderBottom: '2px solid #2196F3',
    paddingBottom: '10px',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  },
  kpiCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    border: '2px solid #e0e0e0',
  },
  eligibilityCard: {
    gridColumn: 'span 2',
    border: '3px solid',
  },
  kpiLabel: {
    fontSize: '0.875rem',
    color: '#666',
    marginBottom: '8px',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  kpiValue: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#333',
    margin: '8px 0',
  },
  kpiSubtext: {
    fontSize: '0.75rem',
    color: '#999',
    marginTop: '4px',
  },
  additionalInfo: {
    display: 'flex',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '16px',
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '4px',
    marginTop: '16px',
  },
  infoItem: {
    fontSize: '0.875rem',
    color: '#555',
  },
  loadingText: {
    textAlign: 'center',
    padding: '40px',
    color: '#666',
    fontSize: '1rem',
  },
  errorText: {
    textAlign: 'center',
    padding: '40px',
    color: '#f44336',
    fontSize: '1rem',
  },
};

export default KPIBar;
