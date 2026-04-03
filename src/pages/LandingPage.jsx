import { useNavigate } from 'react-router-dom';
import sitLogo from '../assets/image.png';
import universityLogo from '../assets/Srinivas_University_logo.gif';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page-root min-h-screen flex flex-col">

      {/* ── Navbar ── */}
      <header className="landing-navbar w-full">
        <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto">
          <img
            src={sitLogo}
            alt="Srinivas Group Logo"
            className="h-10 w-auto sm:h-12 md:h-14 object-contain bg-white border-2 border-[#e2e8f0] shadow-md rounded-lg p-1"
          />
          <div className="flex-1 text-center px-2">
            <span className="text-[#1a1a2e] font-extrabold tracking-widest uppercase text-xs sm:text-sm md:text-base lg:text-lg leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
              SRINIVAS INSTITUTE OF TECHNOLOGY
            </span>
          </div>
          <img
            src={universityLogo}
            alt="Srinivas University Logo"
            className="h-10 w-auto sm:h-12 md:h-14 object-contain bg-white border-2 border-[#e2e8f0] shadow-md rounded-lg p-1"
          />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col items-center justify-center py-8 px-4">

        {/* Hero label */}
        <div className="landing-hero text-center mb-8">
          <div className="landing-hero-badge">
            <span className="landing-hero-badge-dot" />
            Placement Portal Active
          </div>
          <h2 className="landing-hero-title mt-4">Welcome to the Placement Portal</h2>
          <p className="landing-hero-subtitle">Select your role to continue</p>
        </div>

        {/* Cards */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 max-w-5xl w-full">

          {/* Student Card */}
          <div className="neo-card neo-card-student">
            <p className="neo-card-title">STUDENT PORTAL</p>
            <div className="neo-card-divider-student" />

            <div className="neo-card-icon-box neo-card-icon-box-student">
              <svg className="w-9 h-9 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <p className="neo-card-subtitle">Browse placement drives, track applications, and manage your profile</p>

            <button onClick={() => navigate('/login')} className="neo-button neo-button-student">
              <svg className="neo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Continue as Student
            </button>
          </div>

          {/* Admin Card */}
          <div className="neo-card neo-card-admin">
            <p className="neo-card-title">ADMIN PORTAL</p>
            <div className="neo-card-divider-admin" />

            <div className="neo-card-icon-box neo-card-icon-box-admin">
              <svg className="w-9 h-9 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <p className="neo-card-subtitle">Manage placement drives, review applications, and access analytics</p>

            <button onClick={() => navigate('/admin/login')} className="neo-button neo-button-admin">
              <svg className="neo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Continue as Admin
            </button>
          </div>

        </div>

        <p className="landing-footer-label">© 2025 Srinivas Institute of Technology · Placement Cell</p>
      </main>
    </div>
  );
}

export default LandingPage;
