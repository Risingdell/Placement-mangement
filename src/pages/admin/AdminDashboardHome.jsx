import { useState, useEffect } from 'react';

function AdminDashboardHome() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalCompanies: 0,
    activeDrives: 0,
    placedStudents: 0,
    pendingApplications: 0,
    upcomingEvents: 0
  });

  // Mock data - replace with API call
  useEffect(() => {
    // TODO: Fetch real stats from API
    setStats({
      totalStudents: 245,
      totalCompanies: 18,
      activeDrives: 5,
      placedStudents: 89,
      pendingApplications: 127,
      upcomingEvents: 8
    });
  }, []);

  const statCards = [
    {
      name: 'Total Students',
      value: stats.totalStudents,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      name: 'Total Companies',
      value: stats.totalCompanies,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      name: 'Active Drives',
      value: stats.activeDrives,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      name: 'Placed Students',
      value: stats.placedStudents,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-indigo-500 to-indigo-600',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600'
    },
    {
      name: 'Pending Applications',
      value: stats.pendingApplications,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    },
    {
      name: 'Upcoming Events',
      value: stats.upcomingEvents,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="neo-card !bg-white !p-10 border-indigo-600 shadow-[8px_8px_0px_#4f46e5]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="neo-title !text-4xl mb-4 tracking-tight">WELCOME, COMMANDER.</h2>
            <p className="neo-subtitle !text-lg font-bold opacity-70">
              PLACEMENT SYSTEM OPERATIONS HUB — ALL SYSTEMS NOMINAL.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 border-4 border-[#323232] rounded flex items-center justify-center bg-indigo-50 shadow-[4px_4px_0px_#323232]">
              <span className="text-5xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="neo-card !bg-white !p-6 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="neo-subtitle !text-[11px] font-bold opacity-60 uppercase mb-1">{stat.name}</p>
                <h3 className="neo-title !text-4xl !mb-0">{stat.value}</h3>
              </div>
              <div className="w-14 h-14 border-2 border-[#323232] rounded flex items-center justify-center bg-[#f0f0f0] shadow-[3px_3px_0px_#323232]">
                <div className="text-[#323232]">
                  {stat.icon}
                </div>
              </div>
            </div>
            <div className="mt-2">
              <div className="h-4 bg-[#f0f0f0] border-2 border-[#323232] rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 border-r-2 border-[#323232]"
                  style={{ width: '70%' }}
                ></div>
              </div>
              <div className="mt-2 text-right">
                <span className="neo-subtitle !text-[10px] font-bold opacity-50 uppercase leading-none">TARGET REACHED: 70%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="neo-card !bg-white !p-8">
          <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#323232] border-dashed">
            <h3 className="neo-widget-header !mb-0">RECENT SYSTEM LOGS</h3>
            <button className="neo-button !py-1 !px-4 !text-[11px] !min-h-0 uppercase font-bold !bg-indigo-50 hover:!bg-indigo-100">
              FETCH ALL
            </button>
          </div>
          <div className="space-y-4">
            {[
              { action: 'NEW STUDENT REGISTERED', time: '2 MIN AGO', icon: '👤' },
              { action: 'COMPANY DRIVE CREATED', time: '15 MIN AGO', icon: '🏢' },
              { action: 'APPLICATION SUBMITTED', time: '1 HOUR AGO', icon: '📄' },
              { action: 'STUDENT PROFILE UPDATED', time: '2 HOURS AGO', icon: '✏️' }
            ].map((activity, index) => (
              <div key={index} className="neo-list-item !py-4 transition-colors">
                <div className="text-2xl mr-4">{activity.icon}</div>
                <div className="flex-1">
                  <p className="neo-subtitle !text-[13px] font-bold">{activity.action}</p>
                  <p className="neo-subtitle !text-[10px] font-bold opacity-50">{activity.time}</p>
                </div>
                <div className="bg-green-500 w-2 h-2 rounded-full shadow-[1px_1px_0px_#323232]"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="neo-card !bg-white !p-8">
          <h3 className="neo-widget-header mb-8 pb-4 border-b-2 border-[#323232] border-dashed">QUICK OPERATIONS</h3>
          <div className="grid grid-cols-2 gap-6">
            <button className="neo-button !flex-col !gap-3 !h-auto !py-8 bg-purple-50 hover:bg-purple-100">
              <span className="text-3xl">🏢</span>
              <span className="font-['Space_Mono'] font-bold text-xs">ADD COMPANY</span>
            </button>
            <button className="neo-button !flex-col !gap-3 !h-auto !py-8 bg-blue-50 hover:bg-blue-100">
              <span className="text-3xl">🚀</span>
              <span className="font-['Space_Mono'] font-bold text-xs">CREATE DRIVE</span>
            </button>
            <button className="neo-button !flex-col !gap-3 !h-auto !py-8 bg-green-50 hover:bg-green-100">
              <span className="text-3xl">✉️</span>
              <span className="font-['Space_Mono'] font-bold text-xs">SEND MESSAGE</span>
            </button>
            <button className="neo-button !flex-col !gap-3 !h-auto !py-8 bg-orange-50 hover:bg-orange-100">
              <span className="text-3xl">📝</span>
              <span className="font-['Space_Mono'] font-bold text-xs">REPORTS HUB</span>
            </button>
          </div>

          <div className="mt-8 p-6 bg-[#f8f8f8] border-2 border-[#323232] rounded-lg border-dashed">
            <p className="neo-subtitle !text-[11px] font-bold text-center opacity-60 italic">
              DASHBOARD VERSION 4.2.0 • INDUSTRIAL EDITION
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardHome;
