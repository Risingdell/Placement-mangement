import { useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import { useNavigate } from 'react-router-dom';

const IcoCGPA = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);
const IcoSGPA = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
const IcoProject = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);
const IcoEligible = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

function CompactKPIBar({ theme = 'dark' }) {
  const { profile, eligibility, fetchProfile, fetchEligibility } = useStudent();
  const navigate = useNavigate();
  const isLight = theme === 'light';

  useEffect(() => {
    if (profile && eligibility) return;
    Promise.all([fetchProfile(), fetchEligibility()]).catch(() => {});
  }, [profile, eligibility, fetchProfile, fetchEligibility]);

  if (!profile || !eligibility) return null;

  const cgpa = eligibility.cgpa ? parseFloat(eligibility.cgpa).toFixed(2) : 'N/A';
  const sgpa = profile.sgpa    ? parseFloat(profile.sgpa).toFixed(2)    : 'N/A';
  const cgpaGood = parseFloat(eligibility.cgpa) >= 6;

  const stats = [
    {
      label: 'CGPA', value: cgpa,
      Icon: IcoCGPA,
      tone:      isLight ? 'text-[#374151]' : (cgpaGood ? 'text-emerald-500' : 'text-red-400'),
      iconBg:    isLight ? 'bg-[#f3f4f6]'   : (cgpaGood ? 'bg-emerald-900/30' : 'bg-red-900/30'),
      valueTone: isLight ? 'text-[#111827]' : (cgpaGood ? 'text-emerald-400' : 'text-red-400'),
    },
    {
      label: 'SGPA', value: sgpa,
      Icon: IcoSGPA,
      tone:      isLight ? 'text-[#374151]' : 'text-blue-500',
      iconBg:    isLight ? 'bg-[#f3f4f6]'   : 'bg-blue-900/30',
      valueTone: isLight ? 'text-[#111827]' : 'text-zinc-100',
    },
    {
      label: 'Projects', value: eligibility.ongoingProject ? '1 Ongoing' : '0 Ongoing',
      Icon: IcoProject,
      tone:      isLight ? 'text-[#374151]' : 'text-violet-500',
      iconBg:    isLight ? 'bg-[#f3f4f6]'   : 'bg-violet-900/30',
      valueTone: isLight ? 'text-[#111827]' : 'text-zinc-100',
      action: () => navigate('/dashboard/profile'),
    },
    {
      label: 'Eligibility', value: eligibility.eligible ? 'Eligible' : 'Not Eligible',
      Icon: IcoEligible,
      tone:      isLight ? 'text-[#374151]' : (eligibility.eligible ? 'text-emerald-500' : 'text-red-400'),
      iconBg:    isLight ? 'bg-[#f3f4f6]'   : (eligibility.eligible ? 'bg-emerald-900/30' : 'bg-red-900/30'),
      valueTone: isLight ? 'text-[#111827]' : (eligibility.eligible ? 'text-emerald-400' : 'text-red-400'),
    },
  ];

  return (
    <section className={`sticky top-14 z-20 backdrop-blur border-b ${
      isLight ? 'bg-white/95 border-[#e5e7eb]' : 'bg-[#17171b]/95 border-[#2f2f34]'
    }`}>
      <div className="mx-auto w-full max-w-[1400px] px-4 py-2.5 md:px-6">
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {stats.map(({ label, value, Icon, tone, iconBg, valueTone, action }) => (
            <button
              key={label}
              type="button"
              onClick={action}
              className={`flex items-center gap-3 px-4 py-2.5 transition-all ${
                isLight ? 'border border-[#e5e7eb] bg-white hover:border-indigo-200 hover:bg-indigo-50/50' : 'border border-[#2f2f34] bg-[#1f1f24] hover:bg-[#26262d]'
              } ${action ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span className={`p-1.5 flex-shrink-0 ${iconBg} ${tone}`}>
                <Icon />
              </span>
              <div className="text-left min-w-0">
                <p className={`text-[10px] uppercase tracking-[0.1em] ${isLight ? 'text-[#9ca3af]' : 'text-zinc-500'}`}>{label}</p>
                <p className={`text-sm font-bold truncate ${valueTone}`}>{value}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CompactKPIBar;
