import { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';

function UpcomingCompanies({ isLight = false }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/companies/upcoming', { method: 'GET' })
      .then(res => { if (res.success) setCompanies(res.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const carouselCompanies = companies.length > 0
    ? [...companies, ...companies, ...companies, ...companies]
    : [];

  const cardBg    = isLight ? 'bg-white border-[#e5e7eb] hover:border-[#d1d5db] hover:bg-gray-50' : 'bg-[#24242b] border-[#2f2f36] hover:border-[#3d3d47] hover:bg-[#26262e]';
  const nameCls   = isLight ? 'text-[#111827]' : 'text-zinc-100';
  const subCls    = isLight ? 'text-gray-400'  : 'text-zinc-500';
  const wrapperBg = isLight ? 'bg-[#f3f4f6] border-[#e5e7eb]' : 'bg-[#1d1d22] border-[#2f2f36]';
  const titleCls  = isLight ? 'text-[#111827]' : 'text-zinc-100';

  return (
    <div className={`border ${wrapperBg} p-5 shadow-[0_8px_24px_rgba(0,0,0,0.1)]`}>
      <style>{`
        @keyframes slideLeft {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        .carousel-track { animation: slideLeft 30s linear infinite; }
        .carousel-track:hover { animation-play-state: paused; }

        @keyframes shimmer-dark {
          0%   { background-position: -1000px 0; }
          100% { background-position:  1000px 0; }
        }
        @keyframes shimmer-light {
          0%   { background-position: -1000px 0; }
          100% { background-position:  1000px 0; }
        }
        .shimmer-dark {
          background: linear-gradient(90deg, #24242b 0%, #2f2f38 20%, #24242b 40%, #24242b 100%);
          background-size: 1000px 100%;
          animation: shimmer-dark 3s infinite;
        }
        .shimmer-light {
          background: linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 20%, #f3f4f6 40%, #f3f4f6 100%);
          background-size: 1000px 100%;
          animation: shimmer-light 3s infinite;
        }
      `}</style>

      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${titleCls} flex items-center gap-2`}>
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Upcoming Companies
        </h3>
      </div>

      {loading ? (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`aspect-square border ${isLight ? 'border-[#e5e7eb]' : 'border-[#2f2f36]'} ${isLight ? 'shimmer-light' : 'shimmer-dark'}`}
            />
          ))}
        </div>
      ) : companies.length === 0 ? (
        <p className={`text-sm ${subCls} text-center py-8`}>No upcoming companies at this time.</p>
      ) : (
        <div className="overflow-hidden">
          <div
            className="carousel-track flex gap-3"
            style={{ width: `${carouselCompanies.length * (88 + 12)}px` }}
          >
            {carouselCompanies.map((company, idx) => (
              <div
                key={`${company.id}-${idx}`}
                className={`border ${cardBg} flex flex-col items-center justify-center text-center transition-all flex-shrink-0`}
                style={{ width: '88px', height: '88px' }}
              >
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="w-10 h-10 object-contain bg-white p-1 mb-1.5 flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold text-base mb-1.5 flex-shrink-0">
                    {company.name.charAt(0)}
                  </div>
                )}
                <p className={`text-[11px] font-semibold ${nameCls} truncate w-full px-1 leading-tight`}>
                  {company.name}
                </p>
                <span className={`mt-1 text-[9px] px-1.5 py-0.5 font-medium ${
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
        </div>
      )}
    </div>
  );
}

export default UpcomingCompanies;
