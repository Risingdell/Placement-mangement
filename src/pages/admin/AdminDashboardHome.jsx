import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/adminStatsService';
import { Skeleton, SkeletonDark } from '../../Components/common/Skeleton';

const STAT_CONFIG = [
  { key: 'total_students', label: 'Students', lightTone: 'text-[#111827]', darkTone: 'text-zinc-100' },
  { key: 'placed_students', label: 'Placed', lightTone: 'text-emerald-600', darkTone: 'text-emerald-300' },
  { key: 'eligible_students', label: 'Eligible', lightTone: 'text-sky-600', darkTone: 'text-sky-300' },
  { key: 'total_companies', label: 'Companies', lightTone: 'text-amber-600', darkTone: 'text-amber-300' },
  { key: 'total_drives', label: 'Drives', lightTone: 'text-[#111827]', darkTone: 'text-zinc-100' },
  { key: 'total_applications', label: 'Applications', lightTone: 'text-[#111827]', darkTone: 'text-zinc-100' },
];

const QUICK_ACTIONS = [
  { label: 'Add Company', path: '/admin/dashboard/companies' },
  { label: 'Create Drive', path: '/admin/dashboard/drives' },
  { label: 'Send Message', path: '/admin/dashboard/messages' },
  { label: 'View Reports', path: '/admin/dashboard/reports' },
];

function AdminDashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { adminTheme = 'dark' } = useOutletContext() || {};
  const [overall, setOverall] = useState(null);
  const [recentPlacements, setRecentPlacements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res?.success && res.data) {
          setOverall(res.data.overall || {});
          setRecentPlacements(res.data.recentPlacements || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isLightTheme = adminTheme === 'light';
  const ShellSkeleton = isLightTheme ? Skeleton : SkeletonDark;
  const val = (key) => Number(overall?.[key] ?? 0);
  const placementRate =
    val('total_students') > 0
      ? ((val('placed_students') / val('total_students')) * 100).toFixed(1)
      : '--';

  const avgCtc = overall?.avg_ctc ? `${Number(overall.avg_ctc).toFixed(2)} LPA` : 'Not available';
  const highestCtc = overall?.highest_ctc ? `${Number(overall.highest_ctc).toFixed(2)} LPA` : 'Not available';
  const adminName = user?.fullName || user?.full_name || 'Admin';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sectionCardClass = isLightTheme
    ? 'border border-[#d1d5db] bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)]'
    : 'border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]';

  const nestedCardClass = isLightTheme
    ? 'border border-[#e5e7eb] bg-[#f8fafc] p-4'
    : 'border border-[#353540] bg-[#24242b] p-4';

  const listCardClass = isLightTheme
    ? 'border border-[#e5e7eb] bg-[#f8fafc] px-4 py-3'
    : 'border border-[#34343d] bg-[#23232a] px-4 py-3';

  const mutedTextClass = isLightTheme ? 'text-[#6b7280]' : 'text-zinc-400';
  const subtleTextClass = isLightTheme ? 'text-[#9ca3af]' : 'text-zinc-500';
  const headingTextClass = isLightTheme ? 'text-[#111827]' : 'text-zinc-100';
  const secondaryButtonClass = isLightTheme
    ? 'border border-[#d1d5db] bg-white px-3 py-2 text-xs font-semibold text-[#374151] transition-colors hover:bg-[#f9fafb]'
    : 'border border-[#363640] bg-[#24242b] px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-[#2e2e37]';

  return (
    <div className="max-w-7xl space-y-8">
      <section
        className={`border p-6 md:p-8 ${
          isLightTheme
            ? 'border-[#d1d5db] bg-[linear-gradient(135deg,#ffffff_0%,#fff7ed_100%)] shadow-[0_18px_40px_rgba(15,23,42,0.08)]'
            : 'border-[#2f2f36] bg-[#1d1d22] shadow-[0_8px_24px_rgba(0,0,0,0.25)]'
        }`}
      >
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f7b545]">Admin Portal</p>
            <h1 className={`mt-2 text-2xl font-semibold md:text-3xl ${headingTextClass}`}>
              Welcome back, {adminName}
            </h1>
            <p className={`mt-2 ${mutedTextClass}`}>{today}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <SummaryPill
              label="Placement Rate"
              value={placementRate === '--' ? placementRate : `${placementRate}%`}
              tone={isLightTheme ? 'text-emerald-600' : 'text-emerald-300'}
              theme={adminTheme}
            />
            <SummaryPill
              label="Average CTC"
              value={avgCtc}
              tone={isLightTheme ? 'text-[#111827]' : 'text-zinc-100'}
              theme={adminTheme}
            />
            <SummaryPill
              label="Highest CTC"
              value={highestCtc}
              tone="text-[#f7b545]"
              theme={adminTheme}
            />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        {loading ? (
          <>
            <ShellSkeleton className="h-20" />
            <ShellSkeleton className="h-20" />
            <ShellSkeleton className="h-20" />
            <ShellSkeleton className="h-20" />
            <ShellSkeleton className="h-20" />
            <ShellSkeleton className="h-20" />
          </>
        ) : (
          STAT_CONFIG.map((item) => (
            <StatCard
              key={item.key}
              label={item.label}
              value={val(item.key).toLocaleString()}
              tone={isLightTheme ? item.lightTone : item.darkTone}
              theme={adminTheme}
            />
          ))
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={sectionCardClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`text-xs uppercase tracking-[0.2em] ${subtleTextClass}`}>Placement Summary</p>
              <h3 className={`mt-1 text-lg font-semibold ${headingTextClass}`}>Outcome snapshot</h3>
            </div>
            <span className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Live
            </span>
          </div>

          <div className={`mt-4 ${nestedCardClass}`}>
            {loading ? (
              <div className="space-y-3">
                <ShellSkeleton className="h-6 w-36" />
                <ShellSkeleton className="h-3 w-full" />
                <ShellSkeleton className="h-4 w-44" />
              </div>
            ) : (
              <>
                <p className={`text-sm ${mutedTextClass}`}>Current placement rate</p>
                <p className="mt-1 text-3xl font-bold text-[#f7b545]">
                  {placementRate}
                  <span className={`ml-2 text-base font-medium ${isLightTheme ? 'text-[#4b5563]' : 'text-zinc-300'}`}>%</span>
                </p>
                <p className={`mt-2 text-xs ${subtleTextClass}`}>
                  {val('placed_students')} placed out of {val('total_students')} registered students.
                </p>
                <div className={`mt-4 h-2 w-full overflow-hidden ${isLightTheme ? 'bg-[#e5e7eb]' : 'bg-[#2e2e36]'}`}>
                  <div
                    className="h-full bg-[#f7b545] transition-all"
                    style={{ width: `${placementRate === '--' ? 0 : placementRate}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <SummaryRow
              label="Eligible Students"
              value={loading ? '...' : val('eligible_students').toLocaleString()}
              tone={isLightTheme ? 'text-sky-600' : 'text-sky-300'}
              theme={adminTheme}
            />
            <SummaryRow
              label="Average CTC"
              value={loading ? '...' : avgCtc}
              tone={isLightTheme ? 'text-[#111827]' : 'text-zinc-100'}
              theme={adminTheme}
            />
            <SummaryRow
              label="Highest CTC"
              value={loading ? '...' : highestCtc}
              tone="text-[#f7b545]"
              theme={adminTheme}
            />
            <SummaryRow
              label="Active Operations"
              value={loading ? '...' : `${val('total_drives')} drives / ${val('total_companies')} companies`}
              tone={isLightTheme ? 'text-[#111827]' : 'text-zinc-100'}
              theme={adminTheme}
            />
          </div>
        </div>

        <div className={sectionCardClass}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-xs uppercase tracking-[0.2em] ${subtleTextClass}`}>Recent Placements</p>
              <h3 className={`mt-1 text-lg font-semibold ${headingTextClass}`}>Latest confirmed outcomes</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard/applications')}
              className={secondaryButtonClass}
            >
              View all
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {loading && (
              <>
                <ShellSkeleton className="h-16" />
                <ShellSkeleton className="h-16" />
                <ShellSkeleton className="h-16" />
              </>
            )}

            {!loading && recentPlacements.length === 0 && (
              <div className={`${listCardClass} text-center`}>
                <p className={`text-sm font-medium ${isLightTheme ? 'text-[#374151]' : 'text-zinc-300'}`}>No placements yet</p>
                <p className={`mt-1 text-xs ${subtleTextClass}`}>Confirmed placements will appear here.</p>
              </div>
            )}

            {!loading &&
              recentPlacements.slice(0, 5).map((placement, index) => (
                <article
                  key={`${placement.student_name}-${placement.company_name}-${index}`}
                  className={`flex items-center gap-3 ${listCardClass}`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(247,181,69,0.14)] text-sm font-bold text-[#f7b545]">
                    {(placement.student_name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`truncate text-sm font-semibold ${headingTextClass}`}>{placement.student_name}</p>
                    <p className={`truncate text-xs ${mutedTextClass}`}>
                      {placement.company_name} - {placement.role}
                    </p>
                  </div>
                  <span className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                    {placement.ctc ? `${placement.ctc} LPA` : 'Placed'}
                  </span>
                </article>
              ))}
          </div>
        </div>
      </section>

      <section className={sectionCardClass}>
        <h3 className={`text-lg font-semibold ${headingTextClass}`}>Quick Actions</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <ActionButton key={action.label} label={action.label} onClick={() => navigate(action.path)} theme={adminTheme} />
          ))}
        </div>
      </section>

      <section className={sectionCardClass}>
        <div className="flex items-center justify-between gap-3">
          <h3 className={`text-lg font-semibold ${headingTextClass}`}>Placement Activity Feed</h3>
          <span className={`text-xs ${subtleTextClass}`}>Recent conversions</span>
        </div>

        <div className="mt-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-3 pb-1">
            {loading && (
              <>
                <ShellSkeleton className="h-24 w-72 flex-shrink-0" />
                <ShellSkeleton className="h-24 w-72 flex-shrink-0" />
                <ShellSkeleton className="h-24 w-72 flex-shrink-0" />
              </>
            )}

            {!loading && recentPlacements.length === 0 && (
              <p className={`text-sm ${subtleTextClass}`}>No placement activity available yet.</p>
            )}

            {!loading &&
              recentPlacements.slice(0, 8).map((placement, index) => (
                <article
                  key={`${placement.student_name}-${placement.role}-${index}`}
                  className={`w-72 border p-4 ${
                    isLightTheme ? 'border-[#e5e7eb] bg-[#f8fafc]' : 'border-[#34343d] bg-[#23232a]'
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className={`border px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#f7b545] ${
                        isLightTheme ? 'border-[#f3e8c8] bg-[#fff7ed]' : 'border-[#3a3a44] bg-[#25252d]'
                      }`}
                    >
                      Placement
                    </span>
                    <span className={`text-[11px] ${subtleTextClass}`}>{placement.ctc ? `${placement.ctc} LPA` : 'Offer issued'}</span>
                  </div>
                  <h4 className={`text-sm font-semibold ${headingTextClass}`}>{placement.student_name}</h4>
                  <p className={`mt-1 text-xs ${mutedTextClass}`}>{placement.company_name}</p>
                  <p className={`mt-2 text-xs ${subtleTextClass}`}>{placement.role}</p>
                </article>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const StatCard = ({ label, value, tone, theme }) => (
  <div
    className={`border px-4 py-3 ${
      theme === 'light' ? 'border-[#d1d5db] bg-white' : 'border-[#2f2f36] bg-[#1d1d22]'
    }`}
  >
    <p className={`text-[11px] uppercase tracking-[0.08em] ${theme === 'light' ? 'text-[#6b7280]' : 'text-zinc-500'}`}>{label}</p>
    <p className={`mt-1 text-lg font-semibold md:text-xl ${tone}`}>{value}</p>
  </div>
);

const SummaryPill = ({ label, value, tone, theme }) => (
  <div
    className={`border px-4 py-2 ${
      theme === 'light' ? 'border-[#e5e7eb] bg-white' : 'border-[#34343d] bg-[#23232a]'
    }`}
  >
    <p className={`text-[10px] uppercase tracking-[0.18em] ${theme === 'light' ? 'text-[#6b7280]' : 'text-zinc-500'}`}>{label}</p>
    <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
  </div>
);

const SummaryRow = ({ label, value, tone, theme }) => (
  <div
    className={`flex items-center justify-between border px-4 py-3 text-sm ${
      theme === 'light' ? 'border-[#e5e7eb] bg-[#f8fafc]' : 'border-[#34343d] bg-[#23232a]'
    }`}
  >
    <span className={theme === 'light' ? 'text-[#6b7280]' : 'text-zinc-400'}>{label}</span>
    <span className={`font-semibold ${tone}`}>{value}</span>
  </div>
);

const ActionButton = ({ label, onClick, theme }) => (
  <button
    type="button"
    onClick={onClick}
    className={`border px-4 py-3 text-sm transition-colors ${
      theme === 'light'
        ? 'border-[#d1d5db] bg-white text-[#374151] hover:bg-[#f9fafb]'
        : 'border-[#363640] bg-[#24242b] text-zinc-200 hover:bg-[#2e2e37]'
    }`}
  >
    {label}
  </button>
);

export default AdminDashboardHome;
