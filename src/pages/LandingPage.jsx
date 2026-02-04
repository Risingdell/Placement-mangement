import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoBackground from '../Components/landing/LogoBackground';
import TiltCard from '../Components/landing/TiltCard';

function LandingPage() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-blue-50 to-purple-50 overflow-hidden relative">
      {/* Ambient background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-white/40 to-white/60 pointer-events-none z-0" />

      {/* Background decoration - Layer 1 (slowest) */}
      <LogoBackground isActive={hoveredCard !== null} />

      {/* Scene container with perspective - Layer 2 */}
      <div className="scene max-w-6xl w-full mx-auto px-4 relative z-10">
        {/* Header - staggered entrance */}
        <div className="text-center mb-16 animate-title-entrance">
          <h1 className="text-5xl font-bold font-bitcount text-gray-900 mb-4 tracking-wide">
            SRINIVAS INSTITUTE OF TECHNOLOGY
          </h1>
          <p className="text-gray-600 text-lg animate-subtitle-entrance">
            Select your role to continue
          </p>
        </div>

        {/* Role Selection Cards - Layer 3 */}
        <div className="flex flex-wrap justify-center gap-10 max-w-4xl mx-auto">
          {/* Student Card */}
          <TiltCard
            onClick={() => navigate('/login')}
            onHoverChange={(isHovered) => setHoveredCard(isHovered ? 'student' : null)}
            cardType="student"
            className="w-72 animate-card-entrance-1"
          >
            <div className="card-content-wrapper">
              <div className="icon-layer">
                <div className="icon-container bg-gradient-to-br from-indigo-400 to-indigo-600">
                  <svg className="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
              <h2 className="card-title">Student</h2>
              <p className="card-description">
                Access your profile, applications, and placement opportunities
              </p>
              <div className="card-action">
                Continue as Student
                <svg className="action-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </TiltCard>

          {/* Admin Card */}
          <TiltCard
            onClick={() => navigate('/admin/login')}
            onHoverChange={(isHovered) => setHoveredCard(isHovered ? 'admin' : null)}
            cardType="admin"
            className="w-72 animate-card-entrance-2"
          >
            <div className="card-content-wrapper">
              <div className="icon-layer">
                <div className="icon-container bg-gradient-to-br from-purple-400 to-purple-600">
                  <svg className="icon-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h2 className="card-title">Admin</h2>
              <p className="card-description">
                Manage students, drives, applications, and placement analytics
              </p>
              <div className="card-action text-purple-600">
                Continue as Admin
                <svg className="action-arrow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </div>
          </TiltCard>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
