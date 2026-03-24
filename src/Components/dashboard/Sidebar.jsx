import { NavLink } from 'react-router-dom';

const navSections = [
  {
    label: 'Main',
    items: [
      {
        path: '/dashboard',
        label: 'Dashboard',
        exact: true,
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-4a1 1 0 011-1h4a1 1 0 011 1v8a1 1 0 01-1 1h-4a1 1 0 01-1-1v-8z" />
          </svg>
        ),
      },
    ],
  },
  {
    label: 'Placements',
    items: [
      {
        path: '/dashboard/profile',
        label: 'Profile',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        ),
      },
      {
        path: '/dashboard/drives',
        label: 'Drives',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        ),
      },
      {
        path: '/dashboard/applications',
        label: 'Applications',
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
        path: '/dashboard/inbox',
        label: 'Inbox',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        ),
      },
      {
        path: '/dashboard/events',
        label: 'Events',
        icon: (
          <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
    ],
  },
];

function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile, theme = 'dark' }) {
  const isLightTheme = theme === 'light';

  return (
    <>
      {isMobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 bg-black/60 lg:hidden border-none"
          aria-label="Close sidebar backdrop"
        />
      )}

      <aside
        className={`fixed lg:static top-0 left-0 z-40 h-screen transition-all duration-200 ${
          isLightTheme
            ? 'border-r border-[#d1d5db] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
            : 'border-r border-[#2e2e33] bg-[#17171a]'
        } ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
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
              <p className={`truncate text-[11px] ${isLightTheme ? 'text-[#6b7280]' : 'text-[#71717a]'}`}>Student Portal</p>
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
                    end={item.exact}
                    onClick={onCloseMobile}
                    title={isCollapsed ? item.label : ''}
                    className={({ isActive }) =>
                      `group relative flex h-12 items-center rounded-md border-l-[3px] transition-all ${
                        isActive
                          ? isLightTheme
                            ? 'border-[#3b82f6] bg-[rgba(59,130,246,0.12)] text-[#111827]'
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
                    {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
