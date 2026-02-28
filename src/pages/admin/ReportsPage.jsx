import { useState, useEffect } from 'react';
import {
  getDashboardStats,
  getBranchWiseStats,
  getCompanyWiseStats,
  getSalaryAnalysis,
  getApplicationTrends,
} from '../../services/adminStatsService';

function Skeleton({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'branch',   label: 'Branch-wise' },
  { id: 'company',  label: 'Company-wise' },
  { id: 'salary',   label: 'Salary Analysis' },
];

function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [overall, setOverall] = useState(null);
  const [branchStats, setBranchStats] = useState([]);
  const [companyStats, setCompanyStats] = useState([]);
  const [salaryStats, setSalaryStats] = useState(null);
  const [appTrends, setAppTrends] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      const [dash, branch, company, salary, trends] = await Promise.allSettled([
        getDashboardStats(),
        getBranchWiseStats(),
        getCompanyWiseStats(),
        getSalaryAnalysis(),
        getApplicationTrends(),
      ]);
      if (dash.status === 'fulfilled')    setOverall(dash.value?.data?.overall || null);
      if (branch.status === 'fulfilled')  setBranchStats(Array.isArray(branch.value?.data) ? branch.value.data : []);
      if (company.status === 'fulfilled') setCompanyStats(Array.isArray(company.value?.data) ? company.value.data : []);
      if (salary.status === 'fulfilled')  setSalaryStats(salary.value?.data || null);
      if (trends.status === 'fulfilled')  setAppTrends(Array.isArray(trends.value?.data) ? trends.value.data : []);
      setLoading(false);
    };
    fetchAll();
  }, []);

  const placementRate = overall?.total_students > 0
    ? ((overall.placed_students / overall.total_students) * 100).toFixed(1)
    : '—';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Reports & Analytics</h2>
        <p className="text-sm text-gray-500 mt-0.5">Real-time placement statistics and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Students',    key: 'total_students',   color: 'blue',    fmt: v => Number(v).toLocaleString() },
          { label: 'Placed Students',   key: 'placed_students',  color: 'emerald', fmt: v => Number(v).toLocaleString() },
          { label: 'Average CTC',       key: 'avg_ctc',          color: 'violet',  fmt: v => `${Number(v).toFixed(2)} LPA` },
          { label: 'Highest CTC',       key: 'highest_ctc',      color: 'amber',   fmt: v => `${Number(v).toFixed(2)} LPA` },
        ].map(({ label, key, color, fmt }) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
            {loading
              ? <Skeleton className="h-7 w-16 mt-2" />
              : <p className={`text-2xl font-bold mt-1 tabular-nums text-${color}-600`}>
                  {overall?.[key] ? fmt(overall[key]) : '—'}
                </p>
            }
          </div>
        ))}
      </div>

      {/* Tabbed Panel */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Tab Bar */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-5 py-3.5 text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                activeTab === t.id
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Placement Rate */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Placement Rate
                  </p>
                  {loading ? (
                    <Skeleton className="h-12 w-24" />
                  ) : (
                    <>
                      <p className="text-4xl font-bold text-gray-900 tabular-nums">{placementRate}%</p>
                      <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${placementRate === '—' ? 0 : placementRate}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        {overall
                          ? `${overall.placed_students} of ${overall.total_students} students placed`
                          : ''}
                      </p>
                    </>
                  )}
                </div>

                {/* Quick metrics */}
                <div className="bg-gray-50 rounded-xl p-5">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">
                    Key Metrics
                  </p>
                  {loading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex justify-between">
                          <Skeleton className="h-4 w-28" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {[
                        { label: 'Average CTC',   value: overall?.avg_ctc     ? `${Number(overall.avg_ctc).toFixed(2)} LPA`     : '—', color: 'text-violet-600' },
                        { label: 'Highest CTC',   value: overall?.highest_ctc ? `${Number(overall.highest_ctc).toFixed(2)} LPA` : '—', color: 'text-emerald-600' },
                        { label: 'Total Drives',  value: overall?.total_drives    || '—', color: 'text-blue-600' },
                        { label: 'Companies',     value: overall?.total_companies || '—', color: 'text-indigo-600' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{label}</span>
                          <span className={`font-bold tabular-nums ${color}`}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Application Trends */}
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              ) : appTrends.length > 0 ? (
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-3">Application Trends</p>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          {['Period', 'Applications', 'Selected', 'Selection Rate'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {appTrends.map((row, i) => {
                          const apps = row.total_applications || row.applications || 0;
                          const sel  = row.selected || row.placed || 0;
                          const rate = row.selection_rate || (apps > 0 ? ((sel / apps) * 100).toFixed(1) : 0);
                          return (
                            <tr key={i} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-700">{row.period || row.month || row.date}</td>
                              <td className="px-4 py-3 font-medium text-gray-900 tabular-nums">{apps}</td>
                              <td className="px-4 py-3 font-medium text-emerald-700 tabular-nums">{sel}</td>
                              <td className="px-4 py-3">
                                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                                  {rate}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-center text-gray-400 py-6">No trend data available yet</p>
              )}
            </div>
          )}

          {/* ── Branch-wise ── */}
          {activeTab === 'branch' && (
            <div>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-3 w-28" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : branchStats.length === 0 ? (
                <p className="text-sm text-center text-gray-400 py-12">No branch data available</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['Branch', 'Total Students', 'Placed', 'Placement %', 'Avg CTC'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {branchStats.map((row, i) => {
                        const rate = row.total_students > 0
                          ? ((row.placed_students / row.total_students) * 100).toFixed(1)
                          : '0';
                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-semibold text-gray-900">{row.branch}</td>
                            <td className="px-4 py-3 text-gray-600 tabular-nums">{row.total_students}</td>
                            <td className="px-4 py-3 font-medium text-emerald-700 tabular-nums">{row.placed_students}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${rate}%` }} />
                                </div>
                                <span className="text-xs font-medium text-gray-600 tabular-nums">{rate}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-medium text-violet-700">
                              {row.avg_ctc ? `${Number(row.avg_ctc).toFixed(2)} LPA` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Company-wise ── */}
          {activeTab === 'company' && (
            <div>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
              ) : companyStats.length === 0 ? (
                <p className="text-sm text-center text-gray-400 py-12">No company data available</p>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        {['Company', 'Offers', 'Avg CTC', 'Highest CTC', 'Drives'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {companyStats.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-semibold text-gray-900">{row.company_name}</td>
                          <td className="px-4 py-3 font-medium text-gray-900 tabular-nums">
                            {row.total_offers || row.placed || 0}
                          </td>
                          <td className="px-4 py-3 font-medium text-violet-700">
                            {row.avg_ctc ? `${Number(row.avg_ctc).toFixed(2)} LPA` : '—'}
                          </td>
                          <td className="px-4 py-3 font-semibold text-emerald-700">
                            {row.highest_ctc ? `${Number(row.highest_ctc).toFixed(2)} LPA` : '—'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 tabular-nums">
                            {row.total_drives || row.drives || 1}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── Salary Analysis ── */}
          {activeTab === 'salary' && (
            <div className="space-y-5">
              {loading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-4">
                      <Skeleton className="h-3 w-24 mb-2" />
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : salaryStats ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Average CTC',     value: salaryStats.avg_ctc,     color: 'text-violet-600',  lpa: true },
                      { label: 'Median CTC',       value: salaryStats.median_ctc,  color: 'text-indigo-600',  lpa: true },
                      { label: 'Highest CTC',      value: salaryStats.highest_ctc, color: 'text-emerald-600', lpa: true },
                      { label: 'Lowest CTC',       value: salaryStats.lowest_ctc,  color: 'text-amber-600',   lpa: true },
                      { label: 'Total Packages',   value: salaryStats.total_offers, color: 'text-blue-600',   lpa: false },
                    ].filter(s => s.value !== undefined && s.value !== null).map(({ label, value, color, lpa }) => (
                      <div key={label} className="bg-gray-50 rounded-xl p-4">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
                        <p className={`text-2xl font-bold mt-2 tabular-nums ${color}`}>
                          {lpa ? `${Number(value).toFixed(2)} LPA` : value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {salaryStats.distribution?.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-900 mb-3">CTC Distribution</p>
                      <div className="space-y-2.5">
                        {salaryStats.distribution.map((band, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm">
                            <span className="text-gray-600 w-28 flex-shrink-0 text-xs">{band.range}</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full transition-all"
                                style={{ width: `${band.percentage || 0}%` }}
                              />
                            </div>
                            <span className="text-gray-500 w-24 text-right text-xs tabular-nums">
                              {band.count} ({band.percentage || 0}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-center text-gray-400 py-12">No salary data available yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportsPage;
