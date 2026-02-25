import { useState, useEffect } from 'react';
import { useStudent } from '../context/StudentContext';
import ProfileHeader from '../Components/profile/ProfileHeader';
import StatsCards from '../Components/profile/StatsCards';
import AcademicInfo from '../Components/profile/AcademicInfo';
import ProfileRightSidebar from '../Components/profile/ProfileRightSidebar';
import Skills from '../Components/profile/Skills';
import Projects from '../Components/profile/Projects';
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

  // Calculate generic profile completion (mock logic or reuse from dashboard)
  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = ['cgpa', 'sgpa', 'resume_url', 'photo_url', 'usn'];
    const filled = fields.filter(k => profile[k]).length;
    return Math.round((filled / fields.length) * 100);
  };
  const completion = calculateCompletion();

  const tabs = [
    { id: 'academic', label: 'Academic', component: AcademicInfo },
    { id: 'skills', label: 'Skills', component: Skills },
    { id: 'projects', label: 'Projects', component: Projects },
    { id: 'internships', label: 'Internships', component: Internships },
    { id: 'achievements', label: 'Achievements', component: Achievements },
    { id: 'resume', label: 'Resume', component: ProfessionalProfile },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  // Prepare stats data
  const stats = {
    drives: 12, // Mock data or from context
    applications: profile?.applications_count || 5,
    backlogs: profile?.active_backlogs || 0,
    eligible: eligibility?.eligible || false
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
      {/* 1. Profile Summary Strip */}
      <ProfileHeader profile={profile} completion={completion} />

      {/* 2. Quick Stats Cards */}
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Content) */}
        <div className="lg:col-span-2 space-y-6">

          {/* 3. Profile Tabs + Content — unified card, no sticky */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {/* Tab nav bar */}
            <div className="overflow-x-auto border-b border-gray-100">
              <div className="flex px-2 min-w-max">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 outline-none cursor-pointer bg-transparent ${activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content inside same card */}
            <div className="p-6 min-h-[400px]">
              {ActiveComponent && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <ActiveComponent academic={profile} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. Right Side Panel */}
        <div className="lg:col-span-1">
          <ProfileRightSidebar profile={profile} readiness={{ skills_count: 5, projects_count: 2 }} />
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
