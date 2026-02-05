import { useEffect, useState } from 'react';
import { useStudent } from '../../context/StudentContext';

function KPIBar() {
  const { eligibility, fetchEligibility, profile, fetchProfile } = useStudent();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchProfile(), fetchEligibility()]);
      } catch (error) {
        console.error('Failed to load KPI data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="neo-card !bg-white p-8 text-center mb-6">
        <div className="neo-subtitle animate-pulse">LOADING ACADEMIC INFORMATION...</div>
      </div>
    );
  }

  if (!eligibility || !profile) {
    return (
      <div className="neo-card !bg-white p-8 text-center border-red-500 shadow-[4px_4px_0px_#ef4444] mb-6">
        <div className="neo-subtitle text-red-600 font-bold">
          PLEASE COMPLETE YOUR ACADEMIC PROFILE TO VIEW ELIGIBILITY STATUS
        </div>
      </div>
    );
  }

  const isEligible = eligibility.eligible;
  const ongoingProject = eligibility.ongoingProject;

  return (
    <div className="neo-card !bg-white p-8 mb-8">
      <h3 className="neo-widget-header">ACADEMIC & ELIGIBILITY STATUS</h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {/* CGPA */}
        <div className="neo-card !p-4 !bg-[#f8f8f8] text-center !gap-1">
          <div className="neo-subtitle !text-[11px]">CGPA</div>
          <div className={`neo-title !text-2xl ${parseFloat(eligibility.cgpa) >= 6.0 ? 'text-green-600' : 'text-red-500'}`}>
            {eligibility.cgpa ? parseFloat(eligibility.cgpa).toFixed(2) : 'N/A'}
          </div>
          <div className="neo-subtitle !text-[10px] opacity-70">
            MIN: {eligibility.criteria?.minCgpa || 6.0}
          </div>
        </div>

        {/* SGPA */}
        <div className="neo-card !p-4 !bg-[#f8f8f8] text-center !gap-1">
          <div className="neo-subtitle !text-[11px]">CURRENT SGPA</div>
          <div className="neo-title !text-2xl">
            {profile.sgpa ? parseFloat(profile.sgpa).toFixed(2) : 'N/A'}
          </div>
          <div className="neo-subtitle !text-[10px] opacity-70">SEM {profile.current_semester || '-'}</div>
        </div>

        {/* Backlogs */}
        <div className="neo-card !p-4 !bg-[#f8f8f8] text-center !gap-1">
          <div className="neo-subtitle !text-[11px]">ACTIVE BACKLOGS</div>
          <div className={`neo-title !text-2xl ${eligibility.activeBacklogs === 0 ? 'text-green-600' : 'text-red-500'}`}>
            {eligibility.activeBacklogs}
          </div>
          <div className="neo-subtitle !text-[10px] opacity-70">
            MAX: {eligibility.criteria?.maxBacklogs}
          </div>
        </div>

        {/* Ongoing Project */}
        <div className="neo-card !p-4 !bg-[#f8f8f8] text-center !gap-1">
          <div className="neo-subtitle !text-[11px]">PROJECT</div>
          <div className="neo-title !text-2xl">
            {ongoingProject ? '✓' : '✗'}
          </div>
          <div className="neo-subtitle !text-[10px] opacity-70 truncate" title={ongoingProject ? ongoingProject.title : 'None'}>
            {ongoingProject ? ongoingProject.title.toUpperCase() : 'NONE'}
          </div>
        </div>

        {/* Placement Status */}
        <div className="neo-card !p-4 !bg-[#f8f8f8] text-center !gap-1">
          <div className="neo-subtitle !text-[11px]">STATUS</div>
          <div className={`neo-title !text-2xl ${eligibility.isPlaced ? 'text-green-600' : 'text-blue-500'}`}>
            {eligibility.isPlaced ? 'PLACED' : 'ACTIVE'}
          </div>
          <div className="neo-subtitle !text-[10px] opacity-70">
            {eligibility.isPlaced ? 'LOCKED' : 'OPEN'}
          </div>
        </div>

        {/* Overall Eligibility */}
        <div className={`neo-card !p-4 text-center !gap-1 col-span-2 lg:col-span-1 ${isEligible ? '!bg-green-50 !border-green-600 !shadow-[4px_4px_0px_#16a34a]' : '!bg-red-50 !border-red-600 !shadow-[4px_4px_0px_#dc2626]'}`}>
          <div className="neo-subtitle !text-[11px]">ELIGIBILITY</div>
          <div className={`neo-title !text-xl ${isEligible ? 'text-green-700' : 'text-red-700'}`}>
            {isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}
          </div>
          <div className="neo-subtitle !text-[10px] opacity-70">OFFICIAL STATUS</div>
        </div>
      </div>

      {/* Branch and Batch Info */}
      <div className="flex flex-wrap justify-between items-center p-4 bg-[#f8f8f8] border-2 border-[#323232] rounded gap-4">
        <div className="flex items-center gap-2">
          <span className="neo-subtitle !text-[11px] font-bold">BRANCH:</span>
          <span className="neo-subtitle !text-[13px] text-[#323232]">{profile.branch?.toUpperCase() || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="neo-subtitle !text-[11px] font-bold">BATCH:</span>
          <span className="neo-subtitle !text-[13px] text-[#323232]">{profile.batch_year || 'N/A'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="neo-subtitle !text-[11px] font-bold">USN:</span>
          <span className="neo-subtitle !text-[13px] text-[#323232]">{profile.usn?.toUpperCase() || 'N/A'}</span>
        </div>
      </div>
    </div>
  );
}

export default KPIBar;
