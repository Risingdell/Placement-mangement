import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/adminStatsService';
import { Skeleton, SkeletonDark } from '../../Components/common/Skeleton';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';

// ── Icon set ────────────────────────────────────────────────────────────────
const Icons = {
  Students: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Placed: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
    </svg>
  ),
  Eligible: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Companies: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  ),
  Drives: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Applications: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
};

const STAT_CONFIG = [
  { key: 'total_students',    label: 'Total Students',  Icon: Icons.Students,    lightTone: 'text-[#111827]',    darkTone: 'text-zinc-100',    lightBg: 'bg-slate-50',    darkBg: 'bg-[#222228]',    iconColor: 'text-slate-500' },
  { key: 'placed_students',   label: 'Placed',          Icon: Icons.Placed,      lightTone: 'text-emerald-600',  darkTone: 'text-emerald-400', lightBg: 'bg-emerald-50',  darkBg: 'bg-emerald-900/20', iconColor: 'text-emerald-500' },
  { key: 'eligible_students', label: 'Eligible',        Icon: Icons.Eligible,    lightTone: 'text-sky-600',      darkTone: 'text-sky-400',     lightBg: 'bg-sky-50',      darkBg: 'bg-sky-900/20',    iconColor: 'text-sky-500' },
  { key: 'total_companies',   label: 'Companies',       Icon: Icons.Companies,   lightTone: 'text-amber-600',    darkTone: 'text-amber-400',   lightBg: 'bg-amber-50',    darkBg: 'bg-amber-900/20',  iconColor: 'text-amber-500' },
  { key: 'total_drives',      label: 'Drives',          Icon: Icons.Drives,      lightTone: 'text-violet-600',   darkTone: 'text-violet-400',  lightBg: 'bg-violet-50',   darkBg: 'bg-violet-900/20', iconColor: 'text-violet-500' },
  { key: 'total_applications',label: 'Applications',    Icon: Icons.Applications,lightTone: 'text-rose-600',     darkTone: 'text-rose-400',    lightBg: 'bg-rose-50',     darkBg: 'bg-rose-900/20',   iconColor: 'text-rose-500' },
];

const QUICK_ACTIONS = [
  { label: 'Add Company',   path: '/admin/dashboard/companies',    icon: '🏢' },
  { label: 'Create Drive',  path: '/admin/dashboard/drives',       icon: '📋' },
  { label: 'Send Message',  path: '/admin/dashboard/messages',     icon: '✉️' },
  { label: 'View Reports',  path: '/admin/dashboard/reports',      icon: '📊' },
];

const STATUS_COLORS = {
  Applied:     '#f59e0b',
  Shortlisted: '#3b82f6',
  Selected:    '#10b981',
  Rejected:    '#ef4444',
};

const BAR_COLOR = '#f59e0b';
const BAR_COLOR_PLACED = '#10b981';

function AdminDashboardHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { adminTheme = 'dark' } = useOutletContext() || {};
  const [overall, setOverall] = useState(null);
  const [recentPlacements, setRecentPlacements] = useState([]);
  const [appStatus, setAppStatus] = useState({});
  const [branchChart, setBranchChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res?.success && res.data) {
          setOverall(res.data.overall || {});
          setRecentPlacements(res.data.recentPlacements || []);
          setAppStatus(res.data.appStatus || {});
          setBranchChart(res.data.branchChart || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const isLight = adminTheme === 'light';
  const Shell = isLight ? Skeleton : SkeletonDark;
  const val = (key) => Number(overall?.[key] ?? 0);

  const placementRate = val('total_students') > 0
    ? ((val('placed_students') / val('total_students')) * 100).toFixed(1)
    : '--';

  const avgCtc      = overall?.avg_ctc      ? `${Number(overall.avg_ctc).toFixed(2)} LPA`      : 'N/A';
  const highestCtc  = overall?.highest_ctc  ? `${Number(overall.highest_ctc).toFixed(2)} LPA`  : 'N/A';
  const adminName   = user?.fullName || user?.full_name || 'Admin';
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Chart data
  const pieData = Object.entries(STATUS_COLORS)
    .map(([name, color]) => ({ name, value: appStatus[name] || 0, color }))
    .filter(d => d.value > 0);

  const barData = branchChart.map(r => ({
    branch: r.branch,
    Total: Number(r.total),
    Placed: Number(r.placed || 0),
  }));

  // Theme tokens
  const card    = isLight ? 'border border-[#d1d5db] bg-white'        : 'border border-[#2f2f36] bg-[#1d1d22]';
  const nested  = isLight ? 'border border-[#e5e7eb] bg-[#f8fafc]'    : 'border border-[#353540] bg-[#24242b]';
  const row     = isLight ? 'border border-[#e5e7eb] bg-[#f8fafc]'    : 'border border-[#34343d] bg-[#23232a]';
  const muted   = isLight ? 'text-[#6b7280]'  : 'text-zinc-400';
  const subtle  = isLight ? 'text-[#9ca3af]'  : 'text-zinc-500';
  const heading = isLight ? 'text-[#111827]'  : 'text-zinc-100';
  const secBtn  = isLight
    ? 'border border-[#d1d5db] bg-white px-3 py-2 text-xs font-semibold text-[#374151] hover:bg-[#f9fafb] transition-colors'
    : 'border border-[#363640] bg-[#24242b] px-3 py-2 text-xs font-semibold text-zinc-200 hover:bg-[#2e2e37] transition-colors';
  const tooltipStyle = {
    backgroundColor: isLight ? '#fff'     : '#1d1d22',
    border:          isLight ? '1px solid #e5e7eb' : '1px solid #2f2f36',
    color:           isLight ? '#111827'  : '#e5e7eb',
    fontSize: 12,
    borderRadius: 0,
  };
  const axisColor = isLight ? '#9ca3af' : '#52525b';

  return (
    <div className="max-w-7xl space-y-8">

      {/* ── Hero banner ─────────────────────────────────── */}
      <section className={`border p-6 md:p-8 ${isLight
        ? 'border-[#d1d5db] bg-[linear-gradient(135deg,#ffffff_0%,#fff7ed_100%)] shadow-[0_18px_40px_rgba(15,23,42,0.08)]'
        : 'border-[#2f2f36] bg-[#1d1d22] shadow-[0_8px_24px_rgba(0,0,0,0.25)]'}`}>
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#f7b545]">Admin Portal</p>
            <h1 className={`mt-2 text-2xl font-semibold md:text-3xl ${heading}`}>
              Welcome back, {adminName}
            </h1>
            <p className={`mt-2 ${muted}`}>{today}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <SummaryPill label="Placement Rate" value={placementRate === '--' ? '--' : `${placementRate}%`} tone={isLight ? 'text-emerald-600' : 'text-emerald-300'} theme={adminTheme} />
            <SummaryPill label="Average CTC"    value={avgCtc}      tone={isLight ? 'text-[#111827]' : 'text-zinc-100'} theme={adminTheme} />
            <SummaryPill label="Highest CTC"    value={highestCtc}  tone="text-[#f7b545]" theme={adminTheme} />
          </div>
        </div>
      </section>

      {/* ── KPI cards ───────────────────────────────────── */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 2xl:grid-cols-6">
        {loading
          ? STAT_CONFIG.map((_, i) => <Shell key={i} className="h-28" />)
          : STAT_CONFIG.map((item) => (
            <StatCard
              key={item.key}
              label={item.label}
              value={val(item.key).toLocaleString()}
              Icon={item.Icon}
              iconColor={item.iconColor}
              tone={isLight ? item.lightTone : item.darkTone}
              bgAccent={isLight ? item.lightBg : item.darkBg}
              theme={adminTheme}
            />
          ))
        }
      </section>

      {/* ── Charts row ──────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-5">

        {/* Branch-wise placement bar chart (3/5) */}
        <div className={`xl:col-span-3 ${card} p-5`}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className={`text-xs uppercase tracking-[0.2em] ${subtle}`}>Branch Analytics</p>
              <h3 className={`mt-1 text-base font-semibold ${heading}`}>Placement by Branch</h3>
            </div>
            <span className={`text-[11px] px-2 py-1 border ${isLight ? 'border-[#e5e7eb] text-[#6b7280]' : 'border-[#2f2f36] text-zinc-400'}`}>
              Students
            </span>
          </div>
          {loading ? (
            <Shell className="h-52 w-full" />
          ) : barData.length === 0 ? (
            <EmptyChart label="No branch data yet" subtle={subtle} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} barCategoryGap="30%" barGap={2}>
                <XAxis dataKey="branch" tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: axisColor, fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: isLight ? '#f3f4f6' : '#1f1f26' }} />
                <Legend wrapperStyle={{ fontSize: 11, color: axisColor }} />
                <Bar dataKey="Total" fill={isLight ? '#d1d5db' : '#3f3f46'} radius={0} />
                <Bar dataKey="Placed" fill={BAR_COLOR_PLACED} radius={0} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Application status donut (2/5) */}
        <div className={`xl:col-span-2 ${card} p-5`}>
          <div className="mb-4">
            <p className={`text-xs uppercase tracking-[0.2em] ${subtle}`}>Applications</p>
            <h3 className={`mt-1 text-base font-semibold ${heading}`}>Status Distribution</h3>
          </div>
          {loading ? (
            <Shell className="h-52 w-full" />
          ) : pieData.length === 0 ? (
            <EmptyChart label="No applications yet" subtle={subtle} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, color: axisColor }}
                  formatter={(value, entry) => `${value} (${entry.payload.value})`}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      {/* ── Placement summary + Recent placements ───────── */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className={`${card} p-5`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className={`text-xs uppercase tracking-[0.2em] ${subtle}`}>Placement Summary</p>
              <h3 className={`mt-1 text-lg font-semibold ${heading}`}>Outcome Snapshot</h3>
            </div>
            <span className="border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
              Live
            </span>
          </div>
          <div className={`mt-4 ${nested} p-4`}>
            {loading ? (
              <div className="space-y-3">
                <Shell className="h-6 w-36" />
                <Shell className="h-3 w-full" />
                <Shell className="h-4 w-44" />
              </div>
            ) : (
              <>
                <p className={`text-sm ${muted}`}>Current placement rate</p>
                <p className="mt-1 text-4xl font-bold text-[#f7b545]">
                  {placementRate}<span className={`ml-1 text-lg font-medium ${isLight ? 'text-[#4b5563]' : 'text-zinc-300'}`}>%</span>
                </p>
                <p className={`mt-2 text-xs ${subtle}`}>
                  {val('placed_students')} placed out of {val('total_students')} registered students.
                </p>
                <div className={`mt-4 h-1.5 w-full overflow-hidden ${isLight ? 'bg-[#e5e7eb]' : 'bg-[#2e2e36]'}`}>
                  <div className="h-full bg-[#f7b545] transition-all duration-700"
                    style={{ width: `${placementRate === '--' ? 0 : placementRate}%` }} />
                </div>
              </>
            )}
          </div>
          <div className="mt-4 space-y-2.5">
            <SummaryRow label="Eligible Students"  value={loading ? '…' : val('eligible_students').toLocaleString()} tone={isLight ? 'text-sky-600' : 'text-sky-300'} theme={adminTheme} />
            <SummaryRow label="Average CTC"        value={loading ? '…' : avgCtc}     tone={isLight ? 'text-[#111827]' : 'text-zinc-100'} theme={adminTheme} />
            <SummaryRow label="Highest CTC"        value={loading ? '…' : highestCtc} tone="text-[#f7b545]" theme={adminTheme} />
            <SummaryRow label="Active Operations"  value={loading ? '…' : `${val('total_drives')} drives · ${val('total_companies')} companies`} tone={isLight ? 'text-[#111827]' : 'text-zinc-100'} theme={adminTheme} />
          </div>
        </div>

        <div className={`${card} p-5`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-xs uppercase tracking-[0.2em] ${subtle}`}>Recent Placements</p>
              <h3 className={`mt-1 text-lg font-semibold ${heading}`}>Latest Confirmed</h3>
            </div>
            <button type="button" onClick={() => navigate('/admin/dashboard/applications')} className={secBtn}>
              View all
            </button>
          </div>
          <div className="mt-4 space-y-2.5">
            {loading && <><Shell className="h-16" /><Shell className="h-16" /><Shell className="h-16" /></>}
            {!loading && recentPlacements.length === 0 && (
              <div className={`${row} px-4 py-6 text-center`}>
                <p className={`text-sm font-medium ${isLight ? 'text-[#374151]' : 'text-zinc-300'}`}>No placements yet</p>
                <p className={`mt-1 text-xs ${subtle}`}>Confirmed placements will appear here.</p>
              </div>
            )}
            {!loading && recentPlacements.slice(0, 5).map((p, i) => (
              <article key={i} className={`flex items-center gap-3 ${row} px-4 py-3`}>
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center bg-[rgba(247,181,69,0.14)] text-sm font-bold text-[#f7b545]">
                  {(p.student_name || 'S').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-semibold ${heading}`}>{p.student_name}</p>
                  <p className={`truncate text-xs ${muted}`}>{p.company_name} — {p.role}</p>
                </div>
                <StatusBadge status="Selected" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quick actions ───────────────────────────────── */}
      <section className={`${card} p-5`}>
        <h3 className={`text-base font-semibold ${heading} mb-4`}>Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => navigate(a.path)}
              className={`flex flex-col items-center gap-2 border py-5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-md ${
                isLight
                  ? 'border-[#d1d5db] bg-white text-[#374151] hover:border-[#f7b545] hover:bg-[#fff7ed]'
                  : 'border-[#363640] bg-[#24242b] text-zinc-200 hover:border-[#f7b545] hover:bg-[#2a2519]'
              }`}
            >
              <span className="text-2xl">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── Activity feed ───────────────────────────────── */}
      {!loading && recentPlacements.length > 0 && (
        <section className={`${card} p-5`}>
          <div className="flex items-center justify-between gap-3 mb-4">
            <h3 className={`text-base font-semibold ${heading}`}>Placement Activity Feed</h3>
            <span className={`text-xs ${subtle}`}>Recent conversions</span>
          </div>
          <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="flex min-w-max gap-3 pb-1">
              {recentPlacements.slice(0, 8).map((p, i) => (
                <article key={i} className={`w-64 border p-4 flex-shrink-0 ${isLight ? 'border-[#e5e7eb] bg-[#f8fafc]' : 'border-[#34343d] bg-[#23232a]'}`}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className={`border px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-[#f7b545] ${isLight ? 'border-[#f3e8c8] bg-[#fff7ed]' : 'border-[#3a3a44] bg-[#25252d]'}`}>
                      Placed
                    </span>
                    <span className={`text-[11px] ${subtle}`}>{p.ctc ? `${p.ctc} LPA` : 'Offer issued'}</span>
                  </div>
                  <p className={`text-sm font-semibold ${heading}`}>{p.student_name}</p>
                  <p className={`mt-1 text-xs ${muted}`}>{p.company_name}</p>
                  <p className={`mt-1 text-xs ${subtle}`}>{p.role}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, Icon, iconColor, tone, bgAccent, theme }) {
  const isLight = theme === 'light';
  return (
    <div className={`border p-4 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md ${
      isLight ? 'border-[#d1d5db] bg-white' : 'border-[#2f2f36] bg-[#1d1d22]'
    }`}>
      <div className="flex items-center justify-between">
        <p className={`text-[11px] uppercase tracking-[0.1em] ${isLight ? 'text-[#6b7280]' : 'text-zinc-500'}`}>{label}</p>
        <span className={`p-1.5 ${bgAccent} ${iconColor}`}>
          <Icon />
        </span>
      </div>
      <p className={`text-2xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

function SummaryPill({ label, value, tone, theme }) {
  const isLight = theme === 'light';
  return (
    <div className={`border px-4 py-2 ${isLight ? 'border-[#e5e7eb] bg-white' : 'border-[#34343d] bg-[#23232a]'}`}>
      <p className={`text-[10px] uppercase tracking-[0.18em] ${isLight ? 'text-[#6b7280]' : 'text-zinc-500'}`}>{label}</p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function SummaryRow({ label, value, tone, theme }) {
  const isLight = theme === 'light';
  return (
    <div className={`flex items-center justify-between border px-4 py-3 text-sm ${
      isLight ? 'border-[#e5e7eb] bg-[#f8fafc]' : 'border-[#34343d] bg-[#23232a]'
    }`}>
      <span className={isLight ? 'text-[#6b7280]' : 'text-zinc-400'}>{label}</span>
      <span className={`font-semibold ${tone}`}>{value}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Selected:    'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    Shortlisted: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    Applied:     'bg-amber-500/10 border-amber-500/30 text-amber-400',
    Rejected:    'bg-red-500/10 border-red-500/30 text-red-400',
  };
  return (
    <span className={`border px-2.5 py-0.5 text-[11px] font-semibold ${map[status] || map.Applied}`}>
      {status}
    </span>
  );
}

function EmptyChart({ label, subtle }) {
  return (
    <div className={`flex h-52 items-center justify-center text-sm ${subtle}`}>
      {label}
    </div>
  );
}

export default AdminDashboardHome;
