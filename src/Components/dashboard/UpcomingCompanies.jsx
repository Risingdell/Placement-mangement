import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';

const PAGE_SIZE = 4;

function UpcomingCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    apiRequest('/companies/upcoming', { method: 'GET' })
      .then(res => { if (res.success) setCompanies(res.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(companies.length / PAGE_SIZE);
  const visible = companies.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Upcoming Companies
        </h3>

        {totalPages > 1 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="w-7 h-7 rounded-lg border border-[#3a3a44] bg-[#25252d] text-zinc-300 flex items-center justify-center text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2e2e38] transition-colors cursor-pointer"
              aria-label="Previous"
            >
              ‹
            </button>
            <span className="text-xs text-zinc-600 px-1 tabular-nums">
              {page + 1}/{totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="w-7 h-7 rounded-lg border border-[#3a3a44] bg-[#25252d] text-zinc-300 flex items-center justify-center text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#2e2e38] transition-colors cursor-pointer"
              aria-label="Next"
            >
              ›
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(PAGE_SIZE)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[#2f2f36] bg-[#24242b] p-4 space-y-3">
              <div className="skeleton-dark w-10 h-10 rounded-lg mx-auto" />
              <div className="skeleton-dark h-3 w-2/3 rounded mx-auto" />
              <div className="skeleton-dark h-2.5 w-1/2 rounded mx-auto" />
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-8">No upcoming companies at this time.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {visible.map(company => (
            <div
              key={company.id}
              className="rounded-xl border border-[#2f2f36] bg-[#24242b] p-4 flex flex-col items-center text-center hover:border-[#3d3d47] hover:bg-[#26262e] transition-all"
            >
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-12 h-12 rounded-xl object-contain bg-white p-1.5 border border-zinc-700 mb-3 flex-shrink-0"
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg mb-3 flex-shrink-0">
                  {company.name.charAt(0)}
                </div>
              )}
              <p className="text-sm font-semibold text-zinc-100 truncate w-full">{company.name}</p>
              <p className="text-xs text-zinc-500 mt-0.5 truncate w-full">
                {company.company_type}{company.location ? ` · ${company.location}` : ''}
              </p>
              <span className={`mt-2 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                company.company_type === 'Product'
                  ? 'bg-blue-900/40 text-blue-300'
                  : company.company_type === 'Startup'
                  ? 'bg-emerald-900/40 text-emerald-300'
                  : 'bg-orange-900/40 text-orange-300'
              }`}>
                {company.company_type}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default UpcomingCompanies;
