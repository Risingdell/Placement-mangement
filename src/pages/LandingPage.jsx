import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoBackground from '../Components/landing/LogoBackground';
import TiltCard from '../Components/landing/TiltCard';

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative">
      {/* Scene container */}
      <div className="max-w-6xl w-full mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-wide">
            SRINIVAS INSTITUTE OF TECHNOLOGY
          </h1>
          <p className="text-gray-600 text-lg">
            Select your role to continue
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="flex flex-wrap justify-center gap-10 max-w-4xl mx-auto">
          {/* Student Card */}
          <div
            onClick={() => navigate('/login')}
            className="w-72 p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 text-indigo-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student</h2>
            {/* <p className="text-sm text-gray-500 mb-6">
              Access your profile, applications, and placement opportunities
            </p> */}
            <div className="text-indigo-600 font-semibold flex items-center text-sm">
              Continue as Student
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>

          {/* Admin Card */}
          <div
            onClick={() => navigate('/admin/login')}
            className="w-72 p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col items-center text-center group"
          >
            <div className="w-16 h-16 bg-purple-50 rounded-xl flex items-center justify-center mb-6 text-purple-600">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin</h2>
            {/* <p className="text-sm text-gray-500 mb-6">
              Manage students, drives, applications, and placement analytics
            </p> */}
            <div className="text-purple-600 font-semibold flex items-center text-sm">
              Continue as Admin
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
