import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { useStudent } from '../context/StudentContext';
import UpcomingDrives from '../Components/dashboard/UpcomingDrives';
import UpcomingCompanies from '../Components/dashboard/UpcomingCompanies';
import EventsBar from '../Components/dashboard/EventsBar';
import applicationService from '../services/applicationService';
import profileService from '../services/profileService';
import driveService from '../services/driveService';
import eventService from '../services/eventService';
import { SkeletonDark } from '../Components/common/Skeleton';

const DASHBOARD_SKILLS_KEY = 'dashboard_custom_skills';

function DashboardPage() {
  const { theme } = useOutletContext() || {};
  const isLight = theme === 'light';
  const { profile, eligibility, fetchProfile, fetchEligibility } = useStudent();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totalApplications, setTotalApplications] = useState(0);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [rankData, setRankData] = useState(null);
  const [customSkills, setCustomSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [latestActivity, setLatestActivity] = useState([]);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadDashboardData = async () => {
      try {
        await Promise.all([fetchProfile(), fetchEligibility()]);

        const [applicationsResponse, rankingResponse, upcomingDrivesRes, upcomingEventsRes] = await Promise.all([
          applicationService.getMyApplications(),
          profileService.getRanking(),
          driveService.getUpcomingDrives(),
          eventService.getUpcomingEvents(),
        ]);

        if (applicationsResponse.success) {
          setTotalApplications(applicationsResponse.data.length || 0);
        }

        if (rankingResponse.success) {
          setRankData(rankingResponse.data);
        }

        const activities = [];
        if (upcomingDrivesRes?.success) {
          (upcomingDrivesRes.data || []).forEach((drive) => {
            activities.push({
              id: `drive-${drive.id}`,
              type: 'Drive',
              title: `${drive.company_name} - ${drive.role}`,
              subtitle: drive.ctc ? `${drive.ctc} CTC` : 'CTC not disclosed',
              date: drive.drive_date || drive.registration_deadline,
            });
          });
        }

        if (upcomingEventsRes?.success) {
          (upcomingEventsRes.data || []).forEach((event) => {
            activities.push({
              id: `event-${event.id}`,
              type: 'Event',
              title: event.title,
              subtitle: event.location || event.event_type || 'Placement activity',
              date: event.event_date,
            });
          });
        }

        activities.sort((a, b) => new Date(a.date) - new Date(b.date));
        setLatestActivity(activities.slice(0, 12));
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(DASHBOARD_SKILLS_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCustomSkills(parsed);
          return;
        }
      } catch (error) {
        console.error('Failed to parse stored custom skills:', error);
      }
    }

    const initialFromProfile = (profile?.skills || []).slice(0, 6).map((s) => s.skill_name).filter(Boolean);
    if (initialFromProfile.length > 0) {
      setCustomSkills(initialFromProfile);
      localStorage.setItem(DASHBOARD_SKILLS_KEY, JSON.stringify(initialFromProfile));
    }
  }, [profile]);

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

  const addCustomSkill = () => {
    const value = newSkill.trim();
    if (!value) return;
    if (customSkills.some((skill) => skill.toLowerCase() === value.toLowerCase())) {
      setNewSkill('');
      return;
    }
    const updated = [...customSkills, value];
    setCustomSkills(updated);
    localStorage.setItem(DASHBOARD_SKILLS_KEY, JSON.stringify(updated));
    setNewSkill('');
  };

  const removeCustomSkill = (skillToRemove) => {
    const updated = customSkills.filter((skill) => skill !== skillToRemove);
    setCustomSkills(updated);
    localStorage.setItem(DASHBOARD_SKILLS_KEY, JSON.stringify(updated));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <section className="border border-[#2f2f36] bg-[#1d1d22] p-6 md:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.25)] mb-8">
        <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100">
          Welcome back, {profile?.full_name || 'Student'}
        </h1>
        <p className="text-zinc-400 mt-2">{today}</p>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonDark className="h-16" />
            <SkeletonDark className="h-16" />
            <SkeletonDark className="h-16" />
            <SkeletonDark className="h-16" />
          </>
        ) : (
          <>
            <StatCard label="Applications" value={totalApplications} />
            <StatCard label="Placement" value={profile?.is_placed ? 'Placed' : 'In Progress'} tone={profile?.is_placed ? 'text-emerald-300' : 'text-amber-300'} />
            <StatCard label="Eligibility" value={eligibility?.eligible ? 'Eligible' : 'Not Eligible'} tone={eligibility?.eligible ? 'text-emerald-300' : 'text-red-300'} />
            <StatCard label="Profile" value={`${profileCompletion}%`} tone={profileCompletion >= 80 ? 'text-emerald-300' : 'text-amber-300'} />
          </>
        )}
      </section>

      {profileCompletion < 100 && (
        <section className="mb-8 border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p>
            Complete your profile to improve drive eligibility. Current completion: <strong>{profileCompletion}%</strong>
          </p>
          <button
            onClick={() => navigate('/dashboard/profile')}
            className="bg-[#f7b545] px-4 py-2 text-sm font-semibold text-[#1a1a1f] border-none cursor-pointer hover:bg-[#f9c46c]"
          >
            Complete Profile
          </button>
        </section>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        {loading ? (
          <>
            <SkeletonDark className="h-44" />
            <SkeletonDark className="h-44" />
          </>
        ) : (
          <>
            <div className="border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-zinc-100">Custom Skills</h3>
                <span className="text-xs text-zinc-500">{customSkills.length} selected</span>
              </div>
              <div className="flex gap-2 mb-3">
                <input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCustomSkill();
                    }
                  }}
                  placeholder="Add a skill (e.g. React, SQL, DSA)"
                  className="flex-1 min-w-0 border border-[#363640] bg-[#24242b] px-3 py-2 text-sm text-zinc-200 outline-none"
                />
                <button
                  onClick={addCustomSkill}
                  className="flex-shrink-0 bg-[#f7b545] px-4 py-2 text-sm font-semibold text-[#1a1a1f] border-none cursor-pointer hover:bg-[#f9c46c] whitespace-nowrap"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {customSkills.length === 0 && <p className="text-sm text-zinc-500">No custom skills added yet.</p>}
                {customSkills.map((skill) => (
                  <span key={skill} className="inline-flex items-center gap-2 border border-[#3a3a44] bg-[#25252d] px-3 py-1 text-xs text-zinc-200">
                    {skill}
                    <button
                      onClick={() => removeCustomSkill(skill)}
                      className="text-zinc-400 hover:text-red-300 bg-transparent border-none cursor-pointer"
                    >
                      x
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-500">Placement Rank</p>
                  <h3 className="text-lg font-semibold text-zinc-100 mt-1">Professional Score Badge</h3>
                </div>
                <span className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                  Ranked
                </span>
              </div>
              <div className="mt-4 border border-[#353540] bg-[#24242b] p-4">
                <p className="text-zinc-400 text-sm">You are currently</p>
                <p className="text-2xl md:text-3xl font-bold text-[#f7b545] mt-1">
                  #{rankData?.rank || '-'} <span className="text-zinc-300 text-base font-medium">of {rankData?.totalStudents || '-'}</span>
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Score: {rankData?.score?.total ?? '-'} | CGPA pts: {rankData?.score?.cgpa ?? '-'} | Internship pts: {rankData?.score?.internships ?? '-'} | Skill pts: {rankData?.score?.skills ?? '-'}
                </p>
              </div>
            </div>
          </>
        )}
      </section>

      <section className="mb-8">
        <UpcomingCompanies isLight={isLight} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
        <UpcomingDrives />
        <EventsBar />
      </section>

      <section className="border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <ActionButton label="Update Profile" onClick={() => navigate('/dashboard/profile')} />
          <ActionButton label="Browse Drives" onClick={() => navigate('/dashboard/drives')} />
          <ActionButton label="View Applications" onClick={() => navigate('/dashboard/applications')} />
          <ActionButton label="Upcoming Events" onClick={() => navigate('/dashboard/events')} />
        </div>
      </section>

      <section className="border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)] mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-100">Latest Placement Activity</h3>
          <span className="text-xs text-zinc-500">Drives + Events</span>
        </div>

        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3 min-w-max pb-1">
            {loading && (
              <>
                <SkeletonDark className="w-72 h-24 flex-shrink-0" />
                <SkeletonDark className="w-72 h-24 flex-shrink-0" />
                <SkeletonDark className="w-72 h-24 flex-shrink-0" />
              </>
            )}
            {!loading && latestActivity.length === 0 && (
              <p className="text-sm text-zinc-500">No recent placement activity found.</p>
            )}
            {latestActivity.map((item) => (
              <article key={item.id} className="w-72 border border-[#34343d] bg-[#23232a] p-4">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] uppercase tracking-wider px-2 py-1 border ${
                    item.type === 'Drive'
                      ? 'text-amber-300 border-amber-500/30 bg-amber-500/10'
                      : 'text-sky-300 border-sky-500/30 bg-sky-500/10'
                  }`}>
                    {item.type}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    {item.date ? new Date(item.date).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-zinc-100">{item.title}</h4>
                <p className="text-xs text-zinc-400 mt-1">{item.subtitle}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const StatCard = ({ label, value, tone = 'text-zinc-100' }) => (
  <div className="border border-[#2f2f36] bg-[#1d1d22] px-4 py-3">
    <p className="text-[11px] uppercase tracking-wider text-zinc-500">{label}</p>
    <p className={`text-lg md:text-xl font-semibold mt-1 ${tone}`}>{value}</p>
  </div>
);

const ActionButton = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="border border-[#363640] bg-[#24242b] px-4 py-3 text-sm text-zinc-200 cursor-pointer hover:bg-[#2e2e37]"
  >
    {label}
  </button>
);

export default DashboardPage;
