import { useEffect } from 'react';
import { useStudent } from '../../context/StudentContext';
import { useNavigate } from 'react-router-dom';

function CompactKPIBar() {
  const { profile, eligibility, fetchProfile, fetchEligibility } = useStudent();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchProfile(), fetchEligibility()]);
      } catch (error) {
        console.error('Failed to load KPI data:', error);
      }
    };

    loadData();
  }, []);

  if (!profile || !eligibility) {
    return null; // Don't show if data not loaded
  }

  const ongoingProjectsCount = eligibility.ongoingProject ? 1 : 0;
  const isEligible = eligibility.eligible;

  return (
    <div className="bg-white border-b-2 border-[#323232] sticky top-[73px] z-20 shadow-[0_4px_0_#e8e8e8]">
      <div className="max-w-[1400px] mx-auto px-6 py-3 flex flex-wrap items-center justify-center gap-6">
        {/* CGPA */}
        <div className="flex flex-col items-center">
          <span className="neo-subtitle !text-[10px] font-bold">CGPA</span>
          <span className={`neo-title !text-lg !mb-0 ${parseFloat(eligibility.cgpa) >= 6.0 ? 'text-green-600' : 'text-red-500'}`}>
            {eligibility.cgpa ? parseFloat(eligibility.cgpa).toFixed(2) : 'N/A'}
          </span>
        </div>

        <div className="w-0.5 h-8 bg-[#323232] opacity-10" />

        {/* SGPA */}
        <div className="flex flex-col items-center">
          <span className="neo-subtitle !text-[10px] font-bold">SGPA</span>
          <span className="neo-title !text-lg !mb-0">
            {profile.sgpa ? parseFloat(profile.sgpa).toFixed(2) : 'N/A'}
          </span>
        </div>

        <div className="w-0.5 h-8 bg-[#323232] opacity-10" />

        {/* Ongoing Projects */}
        <div
          className="flex flex-col items-center cursor-pointer hover:bg-gray-50 px-2 rounded"
          onClick={() => navigate('/dashboard/profile')}
        >
          <span className="neo-subtitle !text-[10px] font-bold">PROJECTS</span>
          <span className="neo-title !text-lg !mb-0">
            {ongoingProjectsCount} ONGOING
          </span>
        </div>

        <div className="w-0.5 h-8 bg-[#323232] opacity-10" />

        {/* Eligibility Badge */}
        <div
          className={`px-4 py-1 border-2 border-[#323232] rounded text-[11px] font-bold shadow-[2px_2px_0px_#323232] ${isEligible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
        >
          {isEligible ? '✓ ELIGIBLE' : '✗ INELIGIBLE'}
        </div>

        <div className="w-0.5 h-8 bg-[#323232] opacity-10" />

        {/* Placement Status */}
        <div
          className={`px-4 py-1 border-2 border-[#323232] rounded text-[11px] font-bold shadow-[2px_2px_0px_#323232] ${eligibility.isPlaced ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}
        >
          {eligibility.isPlaced ? 'PLACED' : 'ACTIVE'}
        </div>
      </div>
    </div>
  );
}

export default CompactKPIBar;
