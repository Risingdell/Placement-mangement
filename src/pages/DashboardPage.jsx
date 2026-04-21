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
import { Skeleton, SkeletonDark } from '../Components/common/Skeleton';

const DASHBOARD_SKILLS_KEY = 'dashboard_custom_skills';

// ── Stat card icons ─────────────────────────────────────────────────────────
const IcoBriefcase = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const IcoBadge = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
  </svg>
);
const IcoCheck = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
  </svg>
);
const IcoUser = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const QUICK_ACTIONS = [
  {
    label: 'Update Profile', path: '/dashboard/profile',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  },
  {
    label: 'Browse Drives', path: '/dashboard/drives',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    label: 'Applications', path: '/dashboard/applications',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
  {
    label: 'Events', path: '/dashboard/events',
    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  },
];

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
  const Shell = isLight ? Skeleton : SkeletonDark;

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    const load = async () => {
      try {
        await Promise.all([fetchProfile(), fetchEligibility()]);
        const [appRes, rankRes, drivesRes, eventsRes] = await Promise.all([
          applicationService.getMyApplications(),
          profileService.getRanking(),
          driveService.getUpcomingDrives(),
          eventService.getUpcomingEvents(),
        ]);
        if (appRes.success)  setTotalApplications(appRes.data.length || 0);
        if (rankRes.success) setRankData(rankRes.data);
        const acts = [];
        (drivesRes?.success ? drivesRes.data || [] : []).forEach(d =>
          acts.push({ id: `drive-${d.id}`, type: 'Drive', title: `${d.company_name} - ${d.role}`, subtitle: d.ctc ? `${d.ctc} CTC` : 'CTC not disclosed', date: d.drive_date || d.registration_deadline })
        );
        (eventsRes?.success ? eventsRes.data || [] : []).forEach(e =>
          acts.push({ id: `event-${e.id}`, type: 'Event', title: e.title, subtitle: e.location || e.event_type || 'Placement activity', date: e.event_date })
        );
        acts.sort((a, b) => new Date(a.date) - new Date(b.date));
        setLatestActivity(acts.slice(0, 12));
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(DASHBOARD_SKILLS_KEY);
    if (stored) {
      try { const p = JSON.parse(stored); if (Array.isArray(p)) { setCustomSkills(p); return; } } catch {}
    }
    const init = (profile?.skills || []).slice(0, 6).map(s => s.skill_name).filter(Boolean);
    if (init.length > 0) { setCustomSkills(init); localStorage.setItem(DASHBOARD_SKILLS_KEY, JSON.stringify(init)); }
  }, [profile]);

  useEffect(() => {
    if (!profile) return;
    const fields = ['cgpa','sgpa','current_semester','tenth_percentage','twelfth_percentage','photo_url','resume_url'];
    const done = fields.filter(f => profile[f] !== null && profile[f] !== undefined && profile[f] !== '').length;
    setProfileCompletion(Math.round((done / fields.length) * 100));
  }, [profile]);

  const addCustomSkill = () => {
    const v = newSkill.trim();
    if (!v || customSkills.some(s => s.toLowerCase() === v.toLowerCase())) { setNewSkill(''); return; }
    const updated = [...customSkills, v];
    setCustomSkills(updated);
    localStorage.setItem(DASHBOARD_SKILLS_KEY, JSON.stringify(updated));
    setNewSkill('');
  };

  const removeCustomSkill = (s) => {
    const updated = customSkills.filter(x => x !== s);
    setCustomSkills(updated);
    localStorage.setItem(DASHBOARD_SKILLS_KEY, JSON.stringify(updated));
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Theme tokens
  const card    = isLight ? 'bg-white border border-[#e5e7eb] shadow-[0_6px_20px_rgba(0,0,0,0.06)]' : 'bg-[#1d1d22] border border-[#2f2f36] shadow-[0_6px_20px_rgba(0,0,0,0.25)]';
  const nested  = isLight ? 'bg-[#f8fafc] border border-[#e5e7eb]' : 'bg-[#24242b] border border-[#353540]';
  const heading = isLight ? 'text-[#111827]' : 'text-zinc-100';
  const muted   = isLight ? 'text-[#6b7280]' : 'text-zinc-400';
  const subtle  = isLight ? 'text-[#9ca3af]' : 'text-zinc-500';
  const inputCls= isLight
    ? 'border border-[#e5e7eb] bg-white text-[#111827] placeholder-[#9ca3af] focus:border-indigo-400'
    : 'border border-[#363640] bg-[#24242b] text-zinc-200 placeholder-zinc-600 focus:border-[#f7b545]';

  const statCards = [
    { label: 'Applications', value: totalApplications,                              Icon: IcoBriefcase, accent: isLight ? 'text-[#374151]' : 'text-blue-500',                                         accentBg: isLight ? 'bg-[#f3f4f6]' : 'bg-blue-900/20',    tone: isLight ? 'text-[#111827]' : 'text-zinc-100' },
    { label: 'Placement',    value: profile?.is_placed ? 'Placed' : 'In Progress',   Icon: IcoBadge,     accent: isLight ? 'text-[#374151]' : (profile?.is_placed ? 'text-emerald-500' : 'text-amber-500'), accentBg: isLight ? 'bg-[#f3f4f6]' : (profile?.is_placed ? 'bg-emerald-900/20' : 'bg-amber-900/20'),  tone: isLight ? 'text-[#111827]' : (profile?.is_placed ? 'text-emerald-400' : 'text-amber-400') },
    { label: 'Eligibility',  value: eligibility?.eligible ? 'Eligible' : 'Not Eligible', Icon: IcoCheck, accent: isLight ? 'text-[#374151]' : (eligibility?.eligible ? 'text-emerald-500' : 'text-red-500'), accentBg: isLight ? 'bg-[#f3f4f6]' : (eligibility?.eligible ? 'bg-emerald-900/20' : 'bg-red-900/20'),  tone: isLight ? 'text-[#111827]' : (eligibility?.eligible ? 'text-emerald-400' : 'text-red-400') },
    { label: 'Profile',      value: `${profileCompletion}%`,                          Icon: IcoUser,      accent: isLight ? 'text-[#374151]' : (profileCompletion >= 80 ? 'text-emerald-500' : 'text-amber-500'), accentBg: isLight ? 'bg-[#f3f4f6]' : (profileCompletion >= 80 ? 'bg-emerald-900/20' : 'bg-amber-900/20'), tone: isLight ? 'text-[#111827]' : (profileCompletion >= 80 ? 'text-emerald-400' : 'text-amber-400') },
  ];

  const percentile = rankData?.rank && rankData?.totalStudents
    ? Math.round((1 - rankData.rank / rankData.totalStudents) * 100)
    : null;

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className={`p-6 md:p-8 ${card}`}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${isLight ? 'text-indigo-500' : 'text-[#f7b545]'}`}>
              Student Portal
            </p>
            <h1 className={`mt-2 text-2xl md:text-3xl font-bold ${heading}`}>
              Welcome back, {profile?.full_name || 'Student'}
            </h1>
            <p className={`mt-1 text-sm ${muted}`}>{today}</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => navigate('/dashboard/drives')}
              className="px-5 py-2.5 text-sm font-semibold bg-[#f7b545] text-[#1a1a1f] hover:bg-[#f9c46c] transition-all hover:scale-[1.03]"
            >
              Apply for Drives →
            </button>
            <button
              onClick={() => navigate('/dashboard/profile')}
              className={`px-5 py-2.5 text-sm font-semibold border transition-all hover:scale-[1.03] ${
                isLight ? 'border-[#e5e7eb] text-[#374151] hover:bg-[#f9fafb]' : 'border-[#363640] text-zinc-200 hover:bg-[#26262e]'
              }`}
            >
              Update Profile
            </button>
          </div>
        </div>

        {profileCompletion < 100 && (
          <div className={`mt-5 flex flex-col sm:flex-row sm:items-center gap-3 p-4 ${isLight ? 'bg-amber-50 border border-amber-200' : 'bg-amber-500/10 border border-amber-500/30'}`}>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isLight ? 'text-amber-800' : 'text-amber-200'}`}>
                Profile {profileCompletion}% complete — finish it to boost eligibility
              </p>
              <div className={`mt-2 h-1.5 w-full overflow-hidden ${isLight ? 'bg-amber-200' : 'bg-amber-900/30'}`}>
                <div className="h-full bg-[#f7b545] transition-all duration-700" style={{ width: `${profileCompletion}%` }} />
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/profile')}
              className="flex-shrink-0 bg-[#f7b545] px-4 py-2 text-sm font-semibold text-[#1a1a1f] hover:bg-[#f9c46c] transition-colors"
            >
              Complete Now
            </button>
          </div>
        )}
      </section>

      {/* ── KPI stat cards ───────────────────────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? statCards.map((_, i) => <Shell key={i} className="h-28" />)
          : statCards.map(({ label, value, Icon, accent, accentBg, tone }) => (
            <div
              key={label}
              className={`${card} p-4 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.12)]`}
            >
              <div className="flex items-center justify-between">
                <p className={`text-[11px] uppercase tracking-[0.1em] font-medium ${subtle}`}>{label}</p>
                <span className={`p-1.5 ${accentBg} ${accent}`}>
                  <Icon />
                </span>
              </div>
              <p className={`text-xl font-bold ${tone}`}>{value}</p>
            </div>
          ))
        }
      </section>

      {/* ── Skills + Rank ────────────────────────────────── */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <><Shell className="h-44" /><Shell className="h-44" /></>
        ) : (
          <>
            {/* Skills */}
            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className={`text-xs uppercase tracking-wider ${subtle}`}>Dashboard Skills</p>
                  <h3 className={`text-base font-semibold mt-0.5 ${heading}`}>Your Skill Set</h3>
                </div>
                <span className={`text-xs px-2.5 py-1 font-medium ${isLight ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-900/30 text-indigo-300'}`}>
                  {customSkills.length} skills
                </span>
              </div>
              <div className="flex gap-2 mb-4">
                <input
                  value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustomSkill(); } }}
                  placeholder="Add skill (React, SQL, DSA…)"
                  className={`flex-1 min-w-0 px-3 py-2 text-sm outline-none transition-colors ${inputCls}`}
                />
                <button
                  onClick={addCustomSkill}
                  className="flex-shrink-0 bg-[#f7b545] px-4 py-2 text-sm font-semibold text-[#1a1a1f] hover:bg-[#f9c46c] transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {customSkills.length === 0 && <p className={`text-sm ${subtle}`}>No skills added yet.</p>}
                {customSkills.map(skill => (
                  <span
                    key={skill}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-all ${
                      isLight ? 'bg-[#f3f4f6] text-[#374151] border border-[#e5e7eb]' : 'bg-[#25252d] text-zinc-200 border border-[#3a3a44]'
                    }`}
                  >
                    {skill}
                    <button
                      onClick={() => removeCustomSkill(skill)}
                      className={`w-4 h-4 flex items-center justify-center bg-transparent border-none cursor-pointer text-xs leading-none ${isLight ? 'text-[#9ca3af] hover:text-red-500' : 'text-zinc-500 hover:text-red-400'}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Rank */}
            <div className={`${card} p-5`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className={`text-xs uppercase tracking-wider ${subtle}`}>Placement Rank</p>
                  <h3 className={`text-base font-semibold mt-0.5 ${heading}`}>Professional Score</h3>
                </div>
                <span className={`text-xs px-2.5 py-1 font-medium ${isLight ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'}`}>
                  Ranked
                </span>
              </div>

              <div className={`${nested} p-4`}>
                <p className={`text-sm ${muted}`}>Your current standing</p>
                <p className="mt-1 text-4xl font-extrabold text-[#f7b545]">
                  #{rankData?.rank || '—'}
                  <span className={`ml-2 text-base font-medium ${isLight ? 'text-[#4b5563]' : 'text-zinc-300'}`}>
                    of {rankData?.totalStudents || '—'}
                  </span>
                </p>

                {percentile !== null && (
                  <>
                    <p className={`mt-3 text-xs ${subtle}`}>Top {100 - percentile}% of students</p>
                    <div className={`mt-2 h-1.5 w-full overflow-hidden ${isLight ? 'bg-[#e5e7eb]' : 'bg-[#2e2e36]'}`}>
                      <div
                        className="h-full bg-[#f7b545] transition-all duration-700"
                        style={{ width: `${percentile}%` }}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { label: 'Score',      value: rankData?.score?.total ?? '—' },
                  { label: 'CGPA pts',   value: rankData?.score?.cgpa ?? '—' },
                  { label: 'Skill pts',  value: rankData?.score?.skills ?? '—' },
                ].map(({ label, value }) => (
                  <div key={label} className={`${nested} px-3 py-2 text-center`}>
                    <p className={`text-[10px] uppercase tracking-wider ${subtle}`}>{label}</p>
                    <p className={`text-sm font-bold mt-0.5 ${heading}`}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Company carousel ─────────────────────────────── */}
      <section>
        <UpcomingCompanies isLight={isLight} />
      </section>

      {/* ── Drives + Events ──────────────────────────────── */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UpcomingDrives />
        <EventsBar />
      </section>

      {/* ── Quick actions ────────────────────────────────── */}
      <section className={`${card} p-5`}>
        <h3 className={`text-base font-semibold ${heading} mb-4`}>Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(({ label, path, icon }) => (
            <button
              key={label}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-2.5 py-5 text-sm font-medium border transition-all hover:-translate-y-1 hover:shadow-md ${
                isLight
                  ? 'border-[#e5e7eb] bg-white text-[#374151] hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700'
                  : 'border-[#363640] bg-[#24242b] text-zinc-300 hover:border-[#f7b545] hover:bg-[#2a2519] hover:text-[#f7b545]'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Activity feed ────────────────────────────────── */}
      <section className={`${card} p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-base font-semibold ${heading}`}>Latest Placement Activity</h3>
          <span className={`text-xs ${subtle}`}>Drives + Events</span>
        </div>
        <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex gap-3 min-w-max pb-1">
            {loading && <><Shell className="w-64 h-24 flex-shrink-0" /><Shell className="w-64 h-24 flex-shrink-0" /><Shell className="w-64 h-24 flex-shrink-0" /></>}
            {!loading && latestActivity.length === 0 && (
              <div className={`flex flex-col items-center justify-center w-full py-10 ${subtle}`}>
                <svg className="w-10 h-10 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm">No recent placement activity</p>
              </div>
            )}
            {!loading && latestActivity.map(item => (
              <article
                key={item.id}
                className={`w-64 flex-shrink-0 p-4 border transition-all hover:-translate-y-1 ${
                  isLight ? 'bg-[#f8fafc] border-[#e5e7eb] hover:shadow-md' : 'bg-[#23232a] border-[#34343d] hover:border-[#3f3f4a]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] uppercase tracking-wider px-2.5 py-1 font-medium ${
                      item.type === 'Drive'
                        ? isLight ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        : isLight ? 'bg-sky-50 text-sky-600 border border-sky-200' : 'bg-sky-500/10 text-sky-300 border border-sky-500/30'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className={`text-[11px] ${subtle}`}>
                    {item.date ? new Date(item.date).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
                <h4 className={`text-sm font-semibold ${heading} truncate`}>{item.title}</h4>
                <p className={`text-xs mt-1 ${muted} truncate`}>{item.subtitle}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
