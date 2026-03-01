import { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import ProfileHeader from '../Components/profile/ProfileHeader';
import AcademicInfo from '../Components/profile/AcademicInfo';
import ProfileRightSidebar from '../Components/profile/ProfileRightSidebar';
import Skills from '../Components/profile/Skills';
import Projects from '../Components/profile/Projects';
import PortfolioLinks from '../Components/profile/PortfolioLinks';
import Internships from '../Components/profile/Internships';
import Achievements from '../Components/profile/Achievements';
import ProfessionalProfile from '../Components/profile/ProfessionalProfile';

function ProfilePage() {
  const { profile, eligibility, fetchProfile, fetchEligibility } = useStudent();
  const [activeTab, setActiveTab] = useState('academic');

  useEffect(() => {
    fetchProfile();
    fetchEligibility();
  }, []);

  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = ['cgpa', 'sgpa', 'resume_url', 'photo_url', 'usn'];
    const filled = fields.filter((k) => profile[k]).length;
    return Math.round((filled / fields.length) * 100);
  };
  const completion = calculateCompletion();

  const tabs = [
    { id: 'academic', label: 'Academic', component: AcademicInfo },
    { id: 'skills', label: 'Skills', component: Skills },
    { id: 'projects', label: 'Projects', component: Projects },
    { id: 'portfolio', label: 'Portfolio', component: PortfolioLinks },
    { id: 'internships', label: 'Internships', component: Internships },
    { id: 'achievements', label: 'Achievements', component: Achievements },
    { id: 'resume', label: 'Resume', component: ProfessionalProfile },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="max-w-7xl mx-auto py-2 animate-in fade-in duration-500 text-[#e4e4e7]">
      <ProfileHeader profile={profile} completion={completion} />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-12">
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-[#1d1d22] rounded-2xl border border-[#2f2f36] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
            <div className="w-full border-b border-[#2f2f36]">
              <div
                className="w-full overflow-visible md:overflow-x-scroll md:overflow-y-hidden md:overscroll-x-contain md:whitespace-nowrap md:[-ms-overflow-style:none] md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden"
              >
                <div className="flex flex-wrap md:inline-flex md:min-w-max gap-1 px-3 py-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3 md:px-4 py-3 md:py-4 text-xs md:text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 outline-none cursor-pointer bg-transparent ${
                        activeTab === tab.id
                          ? 'border-[#f7b545] text-[#f7b545]'
                          : 'border-transparent text-[#9ca3af] hover:text-[#f4f4f5] hover:border-[#4b5563]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 md:p-6 min-h-[420px] bg-[#1d1d22]">
              {ActiveComponent && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <ActiveComponent academic={profile} eligibility={eligibility} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4">
          <ProfileRightSidebar profile={profile} readiness={{ skills_count: 5, projects_count: 2 }} />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
