import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import KPIBar from '../Components/dashboard/KPIBar';
import UpcomingDrives from '../Components/dashboard/UpcomingDrives';
import EventsBar from '../Components/dashboard/EventsBar';
import InboxPreview from '../Components/dashboard/InboxPreview';
import applicationService from '../services/applicationService';

function DashboardPage() {
  const { profile, eligibility, fetchProfile, fetchEligibility } = useStudent();
  const navigate = useNavigate();
  const [totalApplications, setTotalApplications] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch profile and eligibility
        await Promise.all([fetchProfile(), fetchEligibility()]);

        // Fetch application count
        const applicationsResponse = await applicationService.getMyApplications();
        if (applicationsResponse.success) {
          setTotalApplications(applicationsResponse.data.length || 0);
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [fetchProfile, fetchEligibility]);

  // Calculate profile completion percentage
  useEffect(() => {
    if (profile) {
      const requiredFields = [
        'cgpa',
        'sgpa',
        'current_semester',
        'tenth_percentage',
        'twelfth_percentage',
        'photo_url',
        'resume_url',
      ];

      const completedFields = requiredFields.filter(
        (field) => profile[field] !== null && profile[field] !== undefined && profile[field] !== ''
      ).length;

      const completion = Math.round((completedFields / requiredFields.length) * 100);
      setProfileCompletion(completion);
    }
  }, [profile]);

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div style={styles.container}>
      {/* Welcome Banner */}
      <div style={styles.welcomeBanner}>
        <div>
          <h1 style={styles.welcomeTitle}>
            Welcome back, {profile?.full_name || 'Student'}!
          </h1>
          <p style={styles.welcomeDate}>{getCurrentDate()}</p>
        </div>
      </div>

      {/* KPI Bar */}
      <KPIBar />

      {/* Quick Stats */}
      <div style={styles.quickStats}>
        <div style={styles.statCard}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statValue}>{totalApplications}</div>
          <div style={styles.statLabel}>Total Applications</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            {profile?.is_placed ? '✓' : '⏳'}
          </div>
          <div
            style={{
              ...styles.statValue,
              color: profile?.is_placed ? '#4CAF50' : '#FF9800',
            }}
          >
            {profile?.is_placed ? 'Placed' : 'In Progress'}
          </div>
          <div style={styles.statLabel}>Placement Status</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>
            {eligibility?.eligible ? '✓' : '✗'}
          </div>
          <div
            style={{
              ...styles.statValue,
              color: eligibility?.eligible ? '#4CAF50' : '#f44336',
            }}
          >
            {eligibility?.eligible ? 'Eligible' : 'Not Eligible'}
          </div>
          <div style={styles.statLabel}>Eligibility Status</div>
        </div>

        <div style={styles.statCard}>
          <div style={styles.statIcon}>📝</div>
          <div
            style={{
              ...styles.statValue,
              color: profileCompletion >= 80 ? '#4CAF50' : '#FF9800',
            }}
          >
            {profileCompletion}%
          </div>
          <div style={styles.statLabel}>Profile Completion</div>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {profileCompletion < 100 && (
        <div style={styles.alertBox}>
          <div style={styles.alertIcon}>⚠️</div>
          <div style={styles.alertContent}>
            <strong>Complete your profile</strong> to increase your chances of getting placed.
            Your profile is {profileCompletion}% complete.
          </div>
          <button
            onClick={() => navigate('/profile')}
            style={styles.alertButton}
          >
            Complete Profile
          </button>
        </div>
      )}

      {/* Widgets Grid */}
      <div style={styles.widgetsGrid}>
        <UpcomingDrives />
        <EventsBar />
        <InboxPreview />
      </div>

      {/* Quick Actions */}
      <div style={styles.quickActions}>
        <h3 style={styles.quickActionsTitle}>Quick Actions</h3>
        <div style={styles.actionButtons}>
          <button
            onClick={() => navigate('/profile')}
            style={{
              ...styles.actionButton,
              backgroundColor: '#2196F3',
            }}
          >
            <span style={styles.actionButtonIcon}>👤</span>
            Update Profile
          </button>

          <button
            onClick={() => navigate('/drives')}
            style={{
              ...styles.actionButton,
              backgroundColor: '#4CAF50',
            }}
          >
            <span style={styles.actionButtonIcon}>🏢</span>
            Browse Drives
          </button>

          <button
            onClick={() => navigate('/applications')}
            style={{
              ...styles.actionButton,
              backgroundColor: '#FF9800',
            }}
          >
            <span style={styles.actionButtonIcon}>📋</span>
            View Applications
          </button>

          <button
            onClick={() => navigate('/events')}
            style={{
              ...styles.actionButton,
              backgroundColor: '#9C27B0',
            }}
          >
            <span style={styles.actionButtonIcon}>📅</span>
            Upcoming Events
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '20px',
  },
  welcomeBanner: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    padding: '32px',
    borderRadius: '12px',
    marginBottom: '24px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  welcomeTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    margin: '0 0 8px 0',
  },
  welcomeDate: {
    fontSize: '1rem',
    opacity: 0.9,
    margin: 0,
  },
  quickStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: '#fff',
    padding: '24px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    textAlign: 'center',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  statIcon: {
    fontSize: '2rem',
    marginBottom: '12px',
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#333',
    margin: '8px 0',
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
  },
  alertBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderRadius: '8px',
    padding: '16px 20px',
    marginBottom: '24px',
  },
  alertIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  alertContent: {
    flex: 1,
    color: '#856404',
    fontSize: '0.95rem',
  },
  alertButton: {
    backgroundColor: '#ffc107',
    color: '#000',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    whiteSpace: 'nowrap',
  },
  widgetsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  quickActions: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  quickActionsTitle: {
    margin: '0 0 20px 0',
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 24px',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  },
  actionButtonIcon: {
    fontSize: '1.5rem',
  },
};

export default DashboardPage;
