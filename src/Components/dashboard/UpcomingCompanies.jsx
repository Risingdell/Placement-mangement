import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest } from '../../services/api';

const CARD_W   = 170;
const CARD_GAP = 16;
const UNIT     = CARD_W + CARD_GAP;
const SPEED    = 0.45; // px per frame

const BADGE = {
  Product: { bg: '#eef2ff', color: '#4f46e5' },
  Service: { bg: '#fff7ed', color: '#ea580c' },
  Startup: { bg: '#ecfdf5', color: '#059669' },
};

function UpcomingCompanies({ isLight = false }) {
  const [companies, setCompanies]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [hovered, setHovered]       = useState(false);
  const [manualPause, setManualPause] = useState(false);

  const containerRef = useRef(null);
  const rafRef       = useRef(null);
  const scrollPos    = useRef(0);

  useEffect(() => {
    apiRequest('/companies/upcoming', { method: 'GET' })
      .then(res => { if (res.success) setCompanies(res.data || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Seamless rAF scroll — 2 copies, reset at halfway
  const isPaused = hovered || manualPause;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || companies.length === 0) return;

    const animate = () => {
      if (!isPaused) {
        scrollPos.current += SPEED;
        const half = container.scrollWidth / 2;
        if (scrollPos.current >= half) scrollPos.current = 0;
        container.scrollLeft = scrollPos.current;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [companies, isPaused]);

  const scrollBy = useCallback((dir) => {
    const container = containerRef.current;
    if (!container) return;
    setManualPause(true);
    scrollPos.current += dir * UNIT * 2;
    container.scrollTo({ left: scrollPos.current, behavior: 'smooth' });
    setTimeout(() => setManualPause(false), 1200);
  }, []);

  // Theme tokens
  const sectionBg  = isLight ? 'bg-gradient-to-b from-white to-[#f9fafb] border border-[#e5e7eb]' : 'bg-[#1d1d22] border border-[#2f2f36]';
  const titleCls   = isLight ? 'text-[#111827]' : 'text-zinc-100';
  const subtleCls  = isLight ? 'text-[#9ca3af]' : 'text-zinc-500';
  const cardBg     = isLight ? '#ffffff' : '#26262e';
  const cardBorder = isLight ? '#f0f0f5' : '#34343d';
  const nameCls    = isLight ? '#111827' : '#f4f4f5';
  const arrowBg    = isLight
    ? 'bg-white border border-[#e5e7eb] text-[#374151] hover:border-[#f7b545] hover:text-[#f7b545] shadow-md'
    : 'bg-[#26262e] border border-[#34343d] text-zinc-300 hover:border-[#f7b545] hover:text-[#f7b545] shadow-lg';

  const displayCompanies = [...companies, ...companies];

  return (
    <div className={`p-5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] ${sectionBg}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h3 className={`text-base font-semibold ${titleCls}`}>Upcoming Companies</h3>
        </div>

        {/* Arrow nav */}
        {!loading && companies.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy(-1)}
              className={`w-8 h-8 flex items-center justify-center transition-all ${arrowBg}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scrollBy(1)}
              className={`w-8 h-8 flex items-center justify-center transition-all ${arrowBg}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="flex gap-4 overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 animate-pulse"
              style={{
                width: CARD_W,
                height: 200,
                background: isLight ? '#f3f4f6' : '#2a2a32',
              }}
            />
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && companies.length === 0 && (
        <p className={`text-sm text-center py-10 ${subtleCls}`}>No upcoming companies at this time.</p>
      )}

      {/* Carousel */}
      {!loading && companies.length > 0 && (
        <div
          ref={containerRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ display: 'flex', gap: CARD_GAP }}
        >
          <div style={{ display: 'flex', gap: CARD_GAP, flexShrink: 0 }}>
            {displayCompanies.map((company, idx) => (
              <CompanyCard
                key={`${company.id}-${idx}`}
                company={company}
                cardBg={cardBg}
                cardBorder={cardBorder}
                nameCls={nameCls}
                subtleCls={subtleCls}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function CompanyCard({ company, cardBg, cardBorder, nameCls, subtleCls }) {
  const [hov, setHov] = useState(false);
  const badge = BADGE[company.company_type] || { bg: '#f3f4f6', color: '#6b7280' };

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 170,
        flexShrink: 0,
        padding: '16px 14px',
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        boxShadow: hov
          ? '0 10px 30px rgba(0,0,0,0.14)'
          : '0 4px 20px rgba(0,0,0,0.06)',
        transform: hov ? 'translateY(-6px) scale(1.03)' : 'translateY(0) scale(1)',
        transition: 'all 0.28s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Gradient top accent */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 3,
        background: 'linear-gradient(90deg, #f59e0b, #a78bfa)',
        opacity: hov ? 1 : 0.6,
        transition: 'opacity 0.28s ease',
      }} />

      {/* Logo box */}
      <div style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 4,
        marginBottom: 10,
      }}>
        {company.logo_url ? (
          <img
            src={company.logo_url}
            alt={company.name}
            style={{
              maxHeight: 42,
              maxWidth: 120,
              objectFit: 'contain',
              background: '#fff',
              padding: 4,
            }}
          />
        ) : (
          <div style={{
            width: 48,
            height: 48,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 20,
          }}>
            {company.name.charAt(0)}
          </div>
        )}
      </div>

      {/* Name */}
      <p style={{
        fontSize: 13,
        fontWeight: 600,
        color: nameCls,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        marginBottom: 8,
      }}>
        {company.name}
      </p>

      {/* Pill badge */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          fontSize: 11,
          fontWeight: 500,
          padding: '3px 10px',
          background: badge.bg,
          color: badge.color,
          letterSpacing: '0.02em',
        }}>
          {company.company_type || 'Company'}
        </span>
      </div>

      {/* Location */}
      {company.location && (
        <p style={{
          fontSize: 11,
          color: subtleCls,
          textAlign: 'center',
          marginTop: 6,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>
          {company.location}
        </p>
      )}
    </div>
  );
}

export default UpcomingCompanies;
