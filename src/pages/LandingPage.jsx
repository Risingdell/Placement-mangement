import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoBackground from '../Components/landing/LogoBackground';
import TiltCard from '../Components/landing/TiltCard';
import sitLogo from '../assets/image.png';
import universityLogo from '../assets/Srinivas_University_logo.gif';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f4f5]">

      {/* ── Navbar ── */}
      <header className="w-full bg-[#f8f6ef] border-b-2 border-[#d6d3d1]">
        <div className="flex items-center justify-between px-4 py-2 max-w-screen-xl mx-auto">

          {/* Left logo */}
          <img
            src={sitLogo}
            alt="Srinivas Group Logo"
            className="h-10 w-auto sm:h-12 md:h-14 object-contain bg-white border-2 border-[#d6d3d1] shadow-[4px_4px_0px_#e7d8bc] rounded p-1"
          />

          {/* Center: college name */}
          <div className="flex-1 text-center px-2">
            <span className="text-[#1f2937] font-bold tracking-widest uppercase text-xs sm:text-sm md:text-base lg:text-lg leading-tight">
              SRINIVAS INSTITUTE OF TECHNOLOGY
            </span>
          </div>

          {/* Right logo */}
          <img
            src={universityLogo}
            alt="Srinivas University Logo"
            className="h-10 w-auto sm:h-12 md:h-14 object-contain bg-white border-2 border-[#d6d3d1] shadow-[4px_4px_0px_#e7d8bc] rounded p-1"
          />
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col items-center justify-center py-10 px-4">

        {/* Role Selection Cards */}
        <div className="flex flex-wrap justify-center gap-8 sm:gap-12 max-w-5xl w-full">

          {/* Student Card */}
          <div className="neo-card neo-card-student">
            <p className="neo-card-title">STUDENT PORTAL</p>
            <div className="w-full h-[2px] bg-[#93c5fd] rounded"></div>

            <div className="w-20 h-20 bg-white border-2 border-[#c7d2fe] shadow-[3px_3px_0px_#c7d2fe] rounded flex items-center justify-center">
              <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            <p className="neo-card-subtitle">Access applications and placements</p>

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
            <div className="w-full h-[2px] bg-[#f7b545] rounded"></div>

            <div className="w-20 h-20 bg-white border-2 border-[#e7d8bc] shadow-[3px_3px_0px_#e7d8bc] rounded flex items-center justify-center">
              <svg className="w-10 h-10 text-[#d97706]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            <p className="neo-card-subtitle">Manage drives and analytics</p>

            <button onClick={() => navigate('/admin/login')} className="neo-button neo-button-admin">
              <svg className="neo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              Continue as Admin
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}

export default LandingPage;
