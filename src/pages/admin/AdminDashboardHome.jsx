import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/adminStatsService';
import { SkeletonDark } from '../../Components/common/Skeleton';

const STAT_CONFIG = [
  { key: 'total_students', label: 'Students', tone: 'text-zinc-100' },
  { key: 'placed_students', label: 'Placed', tone: 'text-emerald-300' },
  { key: 'eligible_students', label: 'Eligible', tone: 'text-sky-300' },
  { key: 'total_companies', label: 'Companies', tone: 'text-amber-300' },
  { key: 'total_drives', label: 'Drives', tone: 'text-zinc-100' },
  { key: 'total_applications', label: 'Applications', tone: 'text-zinc-100' },
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

  return (
    <div className="max-w-7xl space-y-8">
      <section className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-6 shadow-[0_8px_24px_rgba(0,0,0,0.25)] md:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f7b545]">Admin Portal</p>
            <h1 className="mt-2 text-2xl font-semibold text-zinc-100 md:text-3xl">
              Welcome back, {adminName}
            </h1>
            <p className="mt-2 text-zinc-400">{today}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <SummaryPill label="Placement Rate" value={placementRate === '--' ? placementRate : `${placementRate}%`} tone="text-emerald-300" />
            <SummaryPill label="Average CTC" value={avgCtc} tone="text-zinc-100" />
            <SummaryPill label="Highest CTC" value={highestCtc} tone="text-[#f7b545]" />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        {loading ? (
          <>
            <SkeletonDark className="h-20 rounded-xl" />
            <SkeletonDark className="h-20 rounded-xl" />
            <SkeletonDark className="h-20 rounded-xl" />
            <SkeletonDark className="h-20 rounded-xl" />
            <SkeletonDark className="h-20 rounded-xl" />
            <SkeletonDark className="h-20 rounded-xl" />
          </>
        ) : (
          STAT_CONFIG.map((item) => (
            <StatCard key={item.key} label={item.label} value={val(item.key).toLocaleString()} tone={item.tone} />
          ))
        )}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Placement Summary</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-100">Outcome snapshot</h3>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Live
            </span>
          </div>

          <div className="mt-4 rounded-xl border border-[#353540] bg-[#24242b] p-4">
            {loading ? (
              <div className="space-y-3">
                <SkeletonDark className="h-6 w-36 rounded-lg" />
                <SkeletonDark className="h-3 w-full rounded-full" />
                <SkeletonDark className="h-4 w-44 rounded-lg" />
              </div>
            ) : (
              <>
                <p className="text-sm text-zinc-400">Current placement rate</p>
                <p className="mt-1 text-3xl font-bold text-[#f7b545]">
                  {placementRate}
                  <span className="ml-2 text-base font-medium text-zinc-300">%</span>
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                  {val('placed_students')} placed out of {val('total_students')} registered students.
                </p>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#2e2e36]">
                  <div
                    className="h-full rounded-full bg-[#f7b545] transition-all"
                    style={{ width: `${placementRate === '--' ? 0 : placementRate}%` }}
                  />
                </div>
              </>
            )}
          </div>

          <div className="mt-4 space-y-3">
            <SummaryRow label="Eligible Students" value={loading ? '...' : val('eligible_students').toLocaleString()} tone="text-sky-300" />
            <SummaryRow label="Average CTC" value={loading ? '...' : avgCtc} tone="text-zinc-100" />
            <SummaryRow label="Highest CTC" value={loading ? '...' : highestCtc} tone="text-[#f7b545]" />
            <SummaryRow label="Active Operations" value={loading ? '...' : `${val('total_drives')} drives / ${val('total_companies')} companies`} tone="text-zinc-100" />
          </div>
        </div>

        <div className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Recent Placements</p>
              <h3 className="mt-1 text-lg font-semibold text-zinc-100">Latest confirmed outcomes</h3>
            </div>
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard/applications')}
              className="rounded-lg border border-[#363640] bg-[#24242b] px-3 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-[#2e2e37]"
            >
              View all
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {loading && (
              <>
                <SkeletonDark className="h-16 rounded-xl" />
                <SkeletonDark className="h-16 rounded-xl" />
                <SkeletonDark className="h-16 rounded-xl" />
              </>
            )}

            {!loading && recentPlacements.length === 0 && (
              <div className="rounded-xl border border-[#34343d] bg-[#23232a] px-4 py-10 text-center">
                <p className="text-sm font-medium text-zinc-300">No placements yet</p>
                <p className="mt-1 text-xs text-zinc-500">Confirmed placements will appear here.</p>
              </div>
            )}

            {!loading &&
              recentPlacements.slice(0, 5).map((placement, index) => (
                <article key={`${placement.student_name}-${placement.company_name}-${index}`} className="flex items-center gap-3 rounded-xl border border-[#34343d] bg-[#23232a] px-4 py-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(247,181,69,0.14)] text-sm font-bold text-[#f7b545]">
                    {(placement.student_name || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-zinc-100">{placement.student_name}</p>
                    <p className="truncate text-xs text-zinc-400">
                      {placement.company_name} - {placement.role}
                    </p>
                  </div>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                    {placement.ctc ? `${placement.ctc} LPA` : 'Placed'}
                  </span>
                </article>
              ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <h3 className="text-lg font-semibold text-zinc-100">Quick Actions</h3>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map((action) => (
            <ActionButton key={action.label} label={action.label} onClick={() => navigate(action.path)} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold text-zinc-100">Placement Activity Feed</h3>
          <span className="text-xs text-zinc-500">Recent conversions</span>
        </div>

        <div className="mt-4 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex min-w-max gap-3 pb-1">
            {loading && (
              <>
                <SkeletonDark className="h-24 w-72 flex-shrink-0 rounded-xl" />
                <SkeletonDark className="h-24 w-72 flex-shrink-0 rounded-xl" />
                <SkeletonDark className="h-24 w-72 flex-shrink-0 rounded-xl" />
              </>
            )}

            {!loading && recentPlacements.length === 0 && (
              <p className="text-sm text-zinc-500">No placement activity available yet.</p>
            )}

            {!loading &&
              recentPlacements.slice(0, 8).map((placement, index) => (
                <article key={`${placement.student_name}-${placement.role}-${index}`} className="w-72 rounded-xl border border-[#34343d] bg-[#23232a] p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-full border border-[#3a3a44] bg-[#25252d] px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#f7b545]">
                      Placement
                    </span>
                    <span className="text-[11px] text-zinc-500">{placement.ctc ? `${placement.ctc} LPA` : 'Offer issued'}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-zinc-100">{placement.student_name}</h4>
                  <p className="mt-1 text-xs text-zinc-400">{placement.company_name}</p>
                  <p className="mt-2 text-xs text-zinc-500">{placement.role}</p>
                </article>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const StatCard = ({ label, value, tone }) => (
  <div className="rounded-xl border border-[#2f2f36] bg-[#1d1d22] px-4 py-3">
    <p className="text-[11px] uppercase tracking-[0.08em] text-zinc-500">{label}</p>
    <p className={`mt-1 text-lg font-semibold md:text-xl ${tone}`}>{value}</p>
  </div>
);

const SummaryPill = ({ label, value, tone }) => (
  <div className="rounded-full border border-[#34343d] bg-[#23232a] px-4 py-2">
    <p className="text-[10px] uppercase tracking-[0.18em] text-zinc-500">{label}</p>
    <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
  </div>
);

const SummaryRow = ({ label, value, tone }) => (
  <div className="flex items-center justify-between rounded-xl border border-[#34343d] bg-[#23232a] px-4 py-3 text-sm">
    <span className="text-zinc-400">{label}</span>
    <span className={`font-semibold ${tone}`}>{value}</span>
  </div>
);

const ActionButton = ({ label, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-lg border border-[#363640] bg-[#24242b] px-4 py-3 text-sm text-zinc-200 transition-colors hover:bg-[#2e2e37]"
  >
    {label}
  </button>
);

export default AdminDashboardHome;
