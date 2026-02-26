import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
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
        await Promise.all([fetchProfile(), fetchEligibility()]);
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
      setProfileCompletion(Math.round((completedFields / requiredFields.length) * 100));
    }
  }, [profile]);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-7xl mx-auto">
      <section className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-6 md:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.25)] mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100">
          Welcome back, {profile?.full_name || 'Student'}
        </h1>
        <p className="text-zinc-400 mt-2">{today}</p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Applications" value={totalApplications} />
        <StatCard label="Placement" value={profile?.is_placed ? 'Placed' : 'In Progress'} tone={profile?.is_placed ? 'text-emerald-300' : 'text-amber-300'} />
        <StatCard label="Eligibility" value={eligibility?.eligible ? 'Eligible' : 'Not Eligible'} tone={eligibility?.eligible ? 'text-emerald-300' : 'text-red-300'} />
        <StatCard label="Profile" value={`${profileCompletion}%`} tone={profileCompletion >= 80 ? 'text-emerald-300' : 'text-amber-300'} />
      </section>

      {profileCompletion < 100 && (
        <section className="mb-8 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p>
            Complete your profile to improve drive eligibility. Current completion: <strong>{profileCompletion}%</strong>
          </p>
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="rounded-lg bg-[#f7b545] px-4 py-2 text-sm font-semibold text-[#1a1a1f] border-none cursor-pointer hover:bg-[#f9c46c]"
          >
            Complete Profile
          </button>
        </section>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <UpcomingDrives />
        <EventsBar />
        <InboxPreview />
      </section>

      <section className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <ActionButton label="Update Profile" onClick={() => navigate('/dashboard/profile')} />
          <ActionButton label="Browse Drives" onClick={() => navigate('/dashboard/drives')} />
          <ActionButton label="View Applications" onClick={() => navigate('/dashboard/applications')} />
          <ActionButton label="Upcoming Events" onClick={() => navigate('/dashboard/events')} />
        </div>
      </section>
    </div>
  );
}

const StatCard = ({ label, value, tone = 'text-zinc-100' }) => (
  <div className="rounded-xl border border-[#2f2f36] bg-[#1d1d22] px-4 py-3">
    <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
    <p className={`text-lg md:text-xl font-semibold mt-1 ${tone}`}>{value}</p>
  </div>
);

const ActionButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="rounded-lg border border-[#363640] bg-[#24242b] px-4 py-3 text-sm text-zinc-200 cursor-pointer hover:bg-[#2e2e37]"
  >
    {label}
  </button>
);

export default DashboardPage;
