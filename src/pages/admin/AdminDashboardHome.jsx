import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/adminStatsService';

const STAT_CONFIG = [
  {
    key: 'total_students', label: 'Total Students', color: 'blue',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
  },
  {
    key: 'placed_students', label: 'Placed', color: 'emerald',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    key: 'eligible_students', label: 'Eligible', color: 'teal',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
  },
  {
    key: 'total_companies', label: 'Companies', color: 'violet',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  },
  {
    key: 'total_drives', label: 'Drives', color: 'amber',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
  },
  {
    key: 'total_applications', label: 'Applications', color: 'indigo',
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>,
  },
];

const COLORS = {
  blue:    { bg: 'bg-blue-50',    text: 'text-blue-600' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  teal:    { bg: 'bg-teal-50',    text: 'text-teal-600' },
  violet:  { bg: 'bg-violet-50',  text: 'text-violet-600' },
  amber:   { bg: 'bg-amber-50',   text: 'text-amber-600' },
  indigo:  { bg: 'bg-indigo-50',  text: 'text-indigo-600' },
};

const QUICK_ACTIONS = [
  { label: 'Add Company',   path: '/admin/dashboard/companies',   cls: 'bg-violet-600 hover:bg-violet-700' },
  { label: 'Create Drive',  path: '/admin/dashboard/drives',      cls: 'bg-emerald-600 hover:bg-emerald-700' },
  { label: 'Send Message',  path: '/admin/dashboard/messages',    cls: 'bg-blue-600 hover:bg-blue-700' },
  { label: 'View Reports',  path: '/admin/dashboard/reports',     cls: 'bg-amber-600 hover:bg-amber-700' },
];

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

function AdminDashboardHome() {
  const navigate = useNavigate();
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

  const val = (key) => (overall ? Number(overall[key] ?? 0) : 0);

  const placementRate = val('total_students') > 0
    ? ((val('placed_students') / val('total_students')) * 100).toFixed(1)
    : '—';

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 p-7 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-indigo-200 text-sm font-medium mb-1">Admin Portal</p>
          <h2 className="text-2xl font-bold tracking-tight">Placement Management Dashboard</h2>
          <p className="text-indigo-300 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          {!loading && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 border border-white/20 rounded-full text-sm font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                {placementRate}% Placement Rate
              </span>
              {overall?.avg_ctc && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/15 border border-white/20 rounded-full text-sm font-semibold">
                  Avg CTC: {Number(overall.avg_ctc).toFixed(1)} LPA
                </span>
              )}
            </div>
          )}
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-[0.08] pointer-events-none select-none">
          <svg className="w-44 h-44" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
          </svg>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="w-9 h-9 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-12 mt-1" />
              </div>
            ))
          : STAT_CONFIG.map((cfg) => {
              const c = COLORS[cfg.color];
              return (
                <div key={cfg.key} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider leading-tight">{cfg.label}</p>
                    <div className={`${c.bg} ${c.text} p-2 rounded-lg flex-shrink-0`}>{cfg.icon}</div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 tabular-nums">{val(cfg.key).toLocaleString()}</p>
                </div>
              );
            })}
      </div>

      {/* Bottom panels */}
      <div className="grid lg:grid-cols-5 gap-5">
        {/* Recent placements */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900">Recent Placements</h3>
            <button onClick={() => navigate('/admin/dashboard/applications')} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">
              View all →
            </button>
          </div>
          <div className="flex-1 divide-y divide-gray-50">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-14 rounded-full" />
                </div>
              ))
            ) : recentPlacements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <svg className="w-10 h-10 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm font-medium text-gray-500">No placements yet</p>
                <p className="text-xs text-gray-400 mt-0.5">Placed students will appear here</p>
              </div>
            ) : (
              recentPlacements.map((p, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-700 font-bold text-[11px]">{(p.student_name || 'S').charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.student_name}</p>
                    <p className="text-xs text-gray-500 truncate">{p.company_name} — {p.role}</p>
                  </div>
                  {p.ctc && (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">
                      {typeof p.ctc === 'number' ? `${p.ctc} LPA` : p.ctc}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right panel */}
        <div className="lg:col-span-2 space-y-4">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              {QUICK_ACTIONS.map((a) => (
                <button
                  key={a.label}
                  onClick={() => navigate(a.path)}
                  className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-white text-xs font-semibold shadow-sm hover:shadow-md transition-all ${a.cls}`}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Placement Summary</h3>
            </div>
            <div className="px-5 py-4 space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Placement Rate</span>
                    <span className="font-semibold text-gray-900">{placementRate}%</span>
                  </div>
                  {overall?.avg_ctc && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Average CTC</span>
                      <span className="font-semibold text-emerald-700">{Number(overall.avg_ctc).toFixed(2)} LPA</span>
                    </div>
                  )}
                  {overall?.highest_ctc && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Highest CTC</span>
                      <span className="font-semibold text-violet-700">{Number(overall.highest_ctc).toFixed(2)} LPA</span>
                    </div>
                  )}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                      <span>Placed</span>
                      <span>{val('placed_students')} / {val('total_students')}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${placementRate === '—' ? 0 : placementRate}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardHome;
