import { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeModeSwitch from '../common/ThemeModeSwitch';

const navSections = [
  {
    label: 'Overview',
    items: [
      {
        name: 'Dashboard',
        path: '/admin/dashboard',
        end: true,
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-4a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Management',
    items: [
      {
        name: 'Companies',
        path: '/admin/dashboard/companies',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        name: 'Students',
        path: '/admin/dashboard/students',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ),
      },
      {
        name: 'Placement Drives',
        path: '/admin/dashboard/drives',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
      {
        name: 'Applications',
        path: '/admin/dashboard/applications',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Communications',
    items: [
      {
        name: 'Messages',
        path: '/admin/dashboard/messages',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        name: 'Events',
        path: '/admin/dashboard/events',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'System',
    items: [
      {
        name: 'Authorized Emails',
        path: '/admin/dashboard/authorized-emails',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        ),
      },
      {
        name: 'Reports',
        path: '/admin/dashboard/reports',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        ),
      },
      {
        name: 'Settings',
        path: '/admin/dashboard/settings',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        ),
      },
    ],
  },
];

const PAGE_META = {
  '/admin/dashboard': {
    title: 'Dashboard',
    description: '',
  },
  '/admin/dashboard/companies': {
    title: 'Companies',
    description: 'Manage recruiters, eligibility rules, and shortlist workflows.',
  },
  '/admin/dashboard/students': {
    title: 'Students',
    description: 'Review profiles, academic status, and direct communication.',
  },
  '/admin/dashboard/drives': {
    title: 'Placement Drives',
    description: 'Create drives, manage timelines, and coordinate attendees.',
  },
  '/admin/dashboard/applications': {
    title: 'Applications',
    description: 'Track application volume, statuses, and decision flow.',
  },
  '/admin/dashboard/messages': {
    title: 'Messages',
    description: 'Send official communication and review outbound history.',
  },
  '/admin/dashboard/events': {
    title: 'Events',
    description: 'Coordinate placement events and campus engagement.',
  },
  '/admin/dashboard/reports': {
    title: 'Reports & Analytics',
    description: 'Measure placement outcomes, branch performance, and salary bands.',
  },
  '/admin/dashboard/authorized-emails': {
    title: 'Authorized Emails',
    description: 'Control access and maintain approved institutional identities.',
  },
  '/admin/dashboard/settings': {
    title: 'Settings',
    description: 'Configure portal behavior and administrative preferences.',
  },
};

function AdminDashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [adminTheme, setAdminTheme] = useState(() => {
    const saved = localStorage.getItem('admin-theme');
    return saved === 'light' ? 'light' : 'dark';
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-theme', adminTheme);
  }, [adminTheme]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const pageMeta = PAGE_META[location.pathname] || PAGE_META['/admin/dashboard'];
  const userName = user?.fullName || user?.full_name || 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();
  const isLightTheme = adminTheme === 'light';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={`${
        isLightTheme
          ? 'flex h-screen overflow-hidden bg-[#f8fafc] text-[#111827]'
          : 'admin-theme flex h-screen overflow-hidden bg-[#141416] text-[#e5e7eb]'
      }`}
    >
      {isMobileSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-label="Close sidebar backdrop"
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 h-screen transition-all duration-200 lg:static ${
          isLightTheme
            ? 'border-r border-[#d1d5db] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
            : 'border-r border-[#2e2e33] bg-[#17171a]'
        } ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[84px]' : 'w-64'}`}
      >
        <div className={`flex h-14 items-center px-4 ${isLightTheme ? 'border-b border-[#d1d5db]' : 'border-b border-[#2e2e33]'}`}>
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg border text-xs font-bold tracking-[0.2em] text-[#f7b545] ${
            isLightTheme ? 'border-[#e5e7eb] bg-[#fff7ed]' : 'border-[#3a3a40] bg-[#232328]'
          }`}>
            PM
          </div>
          {!isCollapsed && (
            <div className="ml-3 min-w-0">
              <p className="truncate text-sm font-semibold tracking-[0.18em] text-[#f7b545]">PLACEMENT</p>
              <p className={`truncate text-[11px] ${isLightTheme ? 'text-[#6b7280]' : 'text-[#71717a]'}`}>Admin Control Room</p>
            </div>
          )}
        </div>

        <nav className="flex h-[calc(100%-56px)] flex-col gap-5 overflow-y-auto px-3 py-4">
          {navSections.map((section) => (
            <div key={section.label}>
              {!isCollapsed && (
                <p className={`mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.22em] ${isLightTheme ? 'text-[#6b7280]' : 'text-[#71717a]'}`}>
                  {section.label}
                </p>
              )}
              <div className="flex flex-col gap-1.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.end}
                    title={isCollapsed ? item.name : ''}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={({ isActive }) =>
                      `group relative flex h-12 items-center rounded-md border-l-[3px] transition-all ${
                        isActive
                          ? isLightTheme
                            ? 'border-[#f7b545] bg-[rgba(247,181,69,0.14)] text-[#111827]'
                            : 'border-[#f7b545] bg-[rgba(247,181,69,0.1)] text-white'
                          : isLightTheme
                            ? 'border-transparent text-[#4b5563] hover:bg-[#f3f4f6] hover:text-[#111827]'
                            : 'border-transparent text-[#a1a1aa] hover:bg-[#232328] hover:text-white'
                      } ${isCollapsed ? 'justify-center px-2' : 'px-3'}`
                    }
                  >
                    <span className={`grid h-7 w-7 place-items-center rounded-md border ${
                      isLightTheme
                        ? 'border-[#e5e7eb] bg-[#f9fafb] text-[#374151]'
                        : 'border-[#34343a] bg-[#26262d] text-[#d4d4d8]'
                    }`}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.name}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}

          <div className={`mt-auto pt-3 ${isLightTheme ? 'border-t border-[#d1d5db]' : 'border-t border-[#2e2e33]'}`}>
            <div className={`rounded-lg border p-3 ${
              isLightTheme ? 'border-[#d1d5db] bg-[#ffffff]' : 'border-[#2f2f36] bg-[#1f1f24]'
            } ${isCollapsed ? 'text-center' : ''}`}>
              <div className={`${isCollapsed ? 'mx-auto' : ''} flex h-8 w-8 items-center justify-center rounded-full bg-[#f7b545] text-sm font-bold text-[#1a1a1f]`}>
                {userInitial}
              </div>
              {!isCollapsed && (
                <div className="mt-2 min-w-0">
                  <p className={`truncate text-[13px] font-semibold ${isLightTheme ? 'text-[#111827]' : 'text-zinc-100'}`}>{userName}</p>
                  <p className={`truncate text-[11px] ${isLightTheme ? 'text-[#6b7280]' : 'text-zinc-500'}`}>{user?.email}</p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className={`mt-2 flex w-full items-center rounded-lg px-3 py-2 text-[13px] font-medium transition-all ${
                isLightTheme
                  ? 'text-[#6b7280] hover:bg-[#fff7ed] hover:text-[#d97706]'
                  : 'text-[#a1a1aa] hover:bg-[#2a1f17] hover:text-[#f59e0b]'
              } ${
                isCollapsed ? 'justify-center' : 'gap-2.5'
              }`}
            >
              <svg className="h-4 w-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {!isCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </nav>
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className={`sticky top-0 z-30 border-b backdrop-blur ${isLightTheme ? 'border-[#d1d5db] bg-white/95' : 'border-[#2f2f34] bg-[#1a1a1e]/95'}`}>
          <div className="flex min-h-14 items-center justify-between gap-4 px-4 md:px-6">
            <div className="flex min-w-0 items-center gap-2 md:gap-4">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className={`h-9 w-9 rounded-md border bg-transparent lg:hidden ${
                  isLightTheme
                    ? 'border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]'
                    : 'border-[#3a3a40] text-[#d4d4d8] hover:bg-[#2a2a2e]'
                }`}
                aria-label="Open sidebar"
              >
                =
              </button>
              <button
                type="button"
                onClick={() => setIsCollapsed((prev) => !prev)}
                className={`hidden h-9 w-9 rounded-md border bg-transparent lg:inline-flex ${
                  isLightTheme
                    ? 'border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]'
                    : 'border-[#3a3a40] text-[#d4d4d8] hover:bg-[#2a2a2e]'
                }`}
                aria-label="Toggle sidebar width"
              >
                {isCollapsed ? '>' : '<'}
              </button>

              <div className="min-w-0">
                <p className={`truncate text-base font-semibold ${isLightTheme ? 'text-[#111827]' : 'text-zinc-100'}`}>{pageMeta.title}</p>
                <p className={`hidden truncate text-xs sm:block ${isLightTheme ? 'text-[#6b7280]' : 'text-zinc-500'}`}>{pageMeta.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className={`hidden h-9 min-w-[220px] items-center rounded-md border px-3 text-sm xl:flex ${
                isLightTheme
                  ? 'border-[#d1d5db] bg-[#f9fafb] text-[#6b7280]'
                  : 'border-[#3a3a40] bg-[#202026] text-[#9ca3af]'
              }`}>
                Search admin workspace
              </div>
              <ThemeModeSwitch theme={adminTheme} onChange={setAdminTheme} />
              <div className={`hidden rounded-md border px-3 py-2 text-[11px] font-semibold tracking-[0.18em] text-[#f7b545] md:block ${
                isLightTheme ? 'border-[#d1d5db] bg-[#fff7ed]' : 'border-[#3a3a40] bg-[#202026]'
              }`}>
                ADMIN
              </div>
              <button
                type="button"
                className={`relative h-9 rounded-md border bg-transparent px-3 text-[11px] font-semibold tracking-[0.18em] transition-colors ${
                  isLightTheme
                    ? 'border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]'
                    : 'border-[#3a3a40] text-[#d1d5db] hover:bg-[#2a2a2e]'
                }`}
                title="Notifications"
              >
                ALERTS
                <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-[#ef4444]" />
              </button>
              <div className={`flex items-center gap-2 rounded-md border bg-transparent px-2 py-1.5 ${
                isLightTheme ? 'border-[#d1d5db]' : 'border-[#3a3a40]'
              }`}>
                <div className={`flex h-7 w-7 items-center justify-center rounded-md border text-sm ${
                  isLightTheme ? 'border-[#e5e7eb] bg-[#f9fafb]' : 'border-[#444] bg-[#2e2e34]'
                }`}>
                  <span className="text-[10px] text-[#f7b545]">{userInitial}</span>
                </div>
                <span className={`hidden max-w-[140px] truncate text-sm sm:inline ${isLightTheme ? 'text-[#374151]' : 'text-[#d4d4d8]'}`}>{userName}</span>
              </div>
            </div>
          </div>
        </header>

        <section className={`sticky top-14 z-20 border-b backdrop-blur transition-all duration-200 ${isLightTheme ? 'border-[#d1d5db] bg-[#f8fafc]/95' : 'border-[#2f2f34] bg-[#17171b]/95'}`} id="info-strip">
          <div className="mx-auto grid w-full max-w-[1400px] grid-cols-2 gap-3 px-4 py-3 md:px-6 lg:grid-cols-4">
            <InfoStripCard label="Workspace" value="Admin Portal" tone="text-[#f7b545]" theme={adminTheme} />
            <InfoStripCard label="Role" value={user?.role || 'Admin'} tone={isLightTheme ? 'text-[#111827]' : 'text-zinc-100'} theme={adminTheme} />
            <InfoStripCard label="Today" value={today} tone={isLightTheme ? 'text-[#111827]' : 'text-zinc-100'} theme={adminTheme} />
            <InfoStripCard label="Mode" value="Operations" tone={isLightTheme ? 'text-emerald-600' : 'text-emerald-400'} theme={adminTheme} />
          </div>
        </section>

        <main className={`relative z-10 flex-1 overflow-auto ${
          isLightTheme
            ? 'bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.12),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.08),_transparent_30%)]'
            : 'bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.08),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(250,204,21,0.05),_transparent_30%)]'
        }`}>
          <div className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-6 md:py-8">
            <Outlet context={{ adminTheme }} />
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoStripCard({ label, value, tone, theme = 'dark' }) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${
      theme === 'light' ? 'border-[#d1d5db] bg-white' : 'border-[#2f2f34] bg-[#1f1f24]'
    }`}>
      <p className={`text-[11px] uppercase tracking-[0.08em] ${theme === 'light' ? 'text-[#6b7280]' : 'text-zinc-400'}`}>{label}</p>
      <p className={`mt-1 text-sm font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

export default AdminDashboardLayout;
