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
    <div className="max-w-[1400px] mx-auto p-6">
      {/* Welcome Banner */}
      <div className="neo-card !flex-row !justify-between !items-center !bg-white mb-8 p-8">
        <div>
          <h1 className="neo-title !text-4xl">
            Welcome back, {profile?.full_name?.toUpperCase() || 'STUDENT'}!
          </h1>
          <p className="neo-subtitle mt-2">{getCurrentDate().toUpperCase()}</p>
        </div>
        <div className="hidden lg:block">
          <div className="w-16 h-16 bg-[#e8e8e8] border-2 border-[#323232] rounded flex items-center justify-center text-3xl shadow-[4px_4px_0px_#323232]">
            👋
          </div>
        </div>
      </div>

      {/* KPI Bar */}
      <KPIBar />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 mt-8">
        <div className="neo-card !p-6 text-center !bg-white">
          <div className="text-4xl mb-4">📊</div>
          <div className="neo-title !text-3xl mb-1">{totalApplications}</div>
          <div className="neo-subtitle">TOTAL APPLICATIONS</div>
        </div>

        <div className="neo-card !p-6 text-center !bg-white">
          <div className="text-4xl mb-4">
            {profile?.is_placed ? '✓' : '⏳'}
          </div>
          <div className={`neo-title !text-2xl mb-1 ${profile?.is_placed ? 'text-green-600' : 'text-orange-500'}`}>
            {profile?.is_placed ? 'PLACED' : 'IN PROGRESS'}
          </div>
          <div className="neo-subtitle">PLACEMENT STATUS</div>
        </div>

        <div className="neo-card !p-6 text-center !bg-white">
          <div className="text-4xl mb-4">
            {eligibility?.eligible ? '✓' : '✗'}
          </div>
          <div className={`neo-title !text-2xl mb-1 ${eligibility?.eligible ? 'text-green-600' : 'text-red-500'}`}>
            {eligibility?.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
          </div>
          <div className="neo-subtitle">ELIGIBILITY STATUS</div>
        </div>

        <div className="neo-card !p-6 text-center !bg-white">
          <div className="text-4xl mb-4">📝</div>
          <div className={`neo-title !text-3xl mb-1 ${profileCompletion >= 80 ? 'text-green-600' : 'text-orange-500'}`}>
            {profileCompletion}%
          </div>
          <div className="neo-subtitle">PROFILE COMPLETION</div>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {profileCompletion < 100 && (
        <div className="neo-card !bg-orange-50 !border-orange-500 !flex-row !items-center !gap-6 mb-8 shadow-[4px_4px_0px_#f97316]">
          <div className="text-3xl">⚠️</div>
          <div className="flex-1">
            <p className="neo-title !text-lg !text-orange-950">COMPLETE YOUR PROFILE</p>
            <p className="neo-subtitle !text-orange-800">Your profile is {profileCompletion}% complete. Complete it to increase your placement chances.</p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            className="neo-button !w-auto bg-orange-500 !text-white hover:bg-orange-600 whitespace-nowrap"
          >
            COMPLETE NOW
          </button>
        </div>
      )}

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
        <UpcomingDrives />
        <EventsBar />
        <InboxPreview />
      </div>

      {/* Quick Actions */}
      <div className="neo-card !bg-white p-8">
        <h3 className="neo-widget-header">QUICK ACTIONS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/profile')}
            className="neo-button hover:!bg-blue-500"
          >
            <span className="text-xl">👤</span>
            UPDATE PROFILE
          </button>

          <button
            onClick={() => navigate('/drives')}
            className="neo-button hover:!bg-green-500"
          >
            <span className="text-xl">🏢</span>
            BROWSE DRIVES
          </button>

          <button
            onClick={() => navigate('/applications')}
            className="neo-button hover:!bg-orange-500"
          >
            <span className="text-xl">📋</span>
            MY APPLICATIONS
          </button>

          <button
            onClick={() => navigate('/events')}
            className="neo-button hover:!bg-purple-500"
          >
            <span className="text-xl">📅</span>
            UPCOMING EVENTS
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
