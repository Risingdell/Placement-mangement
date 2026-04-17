import { useNavigate } from 'react-router-dom';

function ProfileRightSidebar({ profile, readiness }) {
  const navigate = useNavigate();

  const checklist = [
    { label: 'Academic Details', completed: !!profile?.cgpa },
    { label: 'Resume Uploaded', completed: !!profile?.resume_url },
    { label: 'Skills Added', completed: (readiness?.skills_count || 0) > 0 },
    { label: 'Projects Added', completed: (readiness?.projects_count || 0) > 0 },
  ];

  const completeCount = checklist.filter((item) => item.completed).length;
  const readinessPercent = Math.round((completeCount / checklist.length) * 100);

  const upcomingDrive = {
    company: 'Infosys',
    date: 'Feb 12',
    role: 'System Engineer',
    eligibility: 'CGPA >= 7.0',
  };

  const applications = [
    { company: 'Infosys', status: 'Under Review', tone: 'text-amber-300 bg-amber-500/10 border-amber-400/30' },
    { company: 'TCS', status: 'Selected', tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30' },
  ];

  return (
    <div className="space-y-6">
      {readinessPercent < 100 && (
      <div className="bg-[#1d1d22] border border-[#2f2f36] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <h3 className="font-semibold text-zinc-100 mb-1">Placement Readiness</h3>
        <p className="text-xs text-zinc-400 mb-4">Complete all sections to unlock eligibility.</p>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span>Progress</span>
            <span className="text-zinc-200">{readinessPercent}%</span>
          </div>
          <div className="h-2 bg-[#2a2a31] overflow-hidden">
            <div
              className={`h-full ${
                readinessPercent < 40 ? 'bg-red-500' : readinessPercent < 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${readinessPercent}%` }}
            />
          </div>
        </div>

        <ul className="space-y-3 mb-4">
          {checklist.map((item, idx) => (
            <li key={idx} className="flex items-center gap-3 text-sm">
              <span
                className={`grid place-items-center w-5 h-5 text-[11px] ${
                  item.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                }`}
              >
                {item.completed ? 'Y' : 'N'}
              </span>
              <span className={item.completed ? 'text-zinc-200' : 'text-zinc-400'}>{item.label}</span>
            </li>
          ))}
        </ul>
        <button
          onClick={() => navigate('/dashboard/profile')}
          className="w-full py-2.5 bg-[#24242b] text-[#f7b545] text-sm font-medium hover:bg-[#2c2c34] transition-colors border border-[#363640] cursor-pointer"
        >
          Complete Profile
        </button>
      </div>
      )}

      <div className="bg-[#1d1d22] border border-[#2f2f36] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-zinc-100">Upcoming Drive</h3>
          <span className="text-[11px] px-2 py-1 bg-[#24242b] text-zinc-300 border border-[#34343e]">
            {upcomingDrive.date}
          </span>
        </div>
        <h4 className="text-lg font-semibold text-white">{upcomingDrive.company}</h4>
        <p className="text-sm text-zinc-400">{upcomingDrive.role}</p>
        <p className="text-xs text-zinc-500 mt-2">{upcomingDrive.eligibility}</p>
        <button
          onClick={() => navigate('/dashboard/drives')}
          className="w-full mt-4 py-2.5 bg-[#f7b545] text-[#1a1a1f] text-sm font-semibold border-none cursor-pointer hover:bg-[#f9c46c]"
        >
          View Drive
        </button>
      </div>

      <div className="bg-[#1d1d22] border border-[#2f2f36] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
        <h3 className="font-semibold text-zinc-100 mb-4 text-sm">My Applications</h3>
        <div className="space-y-3">
          {applications.map((app, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm border-b border-[#2a2a31] pb-2 last:border-0 last:pb-0">
              <span className="font-medium text-zinc-200">{app.company}</span>
              <span className={`px-2 py-1 text-xs font-medium border ${app.tone}`}>{app.status}</span>
            </div>
          ))}
        </div>
        <button
          onClick={() => navigate('/dashboard/applications')}
          className="w-full mt-4 text-xs text-zinc-400 hover:text-[#f7b545] font-medium border-none bg-transparent cursor-pointer"
        >
          View all applications
        </button>
      </div>
    </div>
  );
}

export default ProfileRightSidebar;
