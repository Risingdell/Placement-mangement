import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoBackground from '../Components/landing/LogoBackground';
import TiltCard from '../Components/landing/TiltCard';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="neo-page-container">
      {/* Header */}
      <h1 className="neo-header-main">
        SRINIVAS INSTITUTE OF TECHNOLOGY
      </h1>

      {/* Role Selection Cards */}
      <div className="flex flex-wrap justify-center gap-12 max-w-5xl mx-auto">
        {/* Student Card */}
        <div className="neo-card">
          <p className="neo-card-title">
            STUDENT PORTAL
            <span></span>
          </p>
          <div className="w-full h-[2px] bg-gray-400 my-2 rounded"></div>

          <div className="w-20 h-20 bg-white border-2 border-[#323232] shadow-[3px 3px 0px #323232] rounded flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>

          <p className="neo-card-subtitle">
            Access applications and placements
          </p>

          <button
            onClick={() => navigate('/login')}
            className="neo-button"
          >
            <svg className="neo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Continue as Student
          </button>
        </div>

        {/* Admin Card */}
        <div className="neo-card">
          <p className="neo-card-title">
            ADMIN PORTAL
            <span></span>
          </p>
          <div className="w-full h-[2px] bg-gray-400 my-2 rounded"></div>

          <div className="w-20 h-20 bg-white border-2 border-[#323232] shadow-[3px 3px 0px #323232] rounded flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>

          <p className="neo-card-subtitle">
            Manage drives and analytics
          </p>

          <button
            onClick={() => navigate('/admin/login')}
            className="neo-button"
          >
            <svg className="neo-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Continue as Admin
          </button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
