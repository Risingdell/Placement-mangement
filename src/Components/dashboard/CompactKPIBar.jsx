import { useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import { useNavigate } from 'react-router-dom';

function CompactKPIBar({ theme = 'dark' }) {
  const { profile, eligibility, fetchProfile, fetchEligibility } = useStudent();
  const navigate = useNavigate();

  useEffect(() => {
    if (profile && eligibility) return;

    const loadData = async () => {
      try {
        await Promise.all([fetchProfile(), fetchEligibility()]);
      } catch (error) {
        console.error('Failed to load KPI data:', error);
      }
    };

    loadData();
  }, [profile, eligibility, fetchProfile, fetchEligibility]);

  if (!profile || !eligibility) return null;

  const ongoingProjectsCount = eligibility.ongoingProject ? 1 : 0;
  const cgpaValue = eligibility.cgpa ? parseFloat(eligibility.cgpa).toFixed(2) : 'N/A';
  const sgpaValue = profile.sgpa ? parseFloat(profile.sgpa).toFixed(2) : 'N/A';

  const stats = [
    { label: 'CGPA', value: cgpaValue, tone: parseFloat(eligibility.cgpa) >= 6 ? 'text-emerald-400' : 'text-red-400' },
    { label: 'SGPA', value: sgpaValue, tone: 'text-zinc-100' },
    { label: 'Projects', value: `${ongoingProjectsCount} Ongoing`, tone: 'text-zinc-100', action: () => navigate('/dashboard/profile') },
    { label: 'Eligibility', value: eligibility.eligible ? 'Eligible' : 'Not Eligible', tone: eligibility.eligible ? 'text-emerald-400' : 'text-red-400' },
  ];

  return (
    <section className={`sticky top-14 z-20 backdrop-blur ${
      theme === 'light' ? 'bg-white/95' : 'bg-[#17171b]/95'
    }`}>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-3 md:px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.action}
              className={`px-4 py-3 text-left ${
                theme === 'light'
                  ? 'border border-[#d1d5db] bg-white'
                  : 'border border-[#2f2f34] bg-[#1f1f24]'
              } ${
                item.action
                  ? theme === 'light'
                    ? 'cursor-pointer hover:bg-[#f9fafb]'
                    : 'cursor-pointer hover:bg-[#26262d]'
                  : 'cursor-default'
              }`}
            >
              <p className={`text-[11px] uppercase tracking-[0.08em] ${theme === 'light' ? 'text-zinc-600' : 'text-zinc-400'}`}>{item.label}</p>
              <p className={`mt-1 text-lg font-semibold ${
                theme === 'light' && (item.tone === 'text-zinc-100') ? 'text-zinc-900' : item.tone
              }`}>{item.value}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CompactKPIBar;
