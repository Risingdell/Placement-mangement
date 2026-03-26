import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';

function UpcomingCompanies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await apiRequest('/companies/upcoming', { method: 'GET' });
        if (res.success) setCompanies(res.data || []);
      } catch (err) {
        console.error('Failed to load upcoming companies:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  return (
    <div className="rounded-2xl border border-[#2f2f36] bg-[#1d1d22] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      <h3 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        Upcoming Companies
      </h3>

      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-lg bg-zinc-700" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-zinc-700 rounded w-2/3" />
                <div className="h-2.5 bg-zinc-800 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-6">No upcoming companies at this time.</p>
      ) : (
        <div className="space-y-3">
          {companies.map((company) => (
            <div key={company.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#26262d] transition-colors">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="w-10 h-10 rounded-lg object-contain bg-white p-1 border border-zinc-700 flex-shrink-0"
                />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {company.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-100 truncate">{company.name}</p>
                <p className="text-xs text-zinc-500">
                  {company.company_type}
                  {company.location ? ` · ${company.location}` : ''}
                </p>
              </div>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                company.company_type === 'Product'
                  ? 'bg-blue-900/40 text-blue-300'
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
