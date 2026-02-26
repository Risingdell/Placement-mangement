import { NavLink } from 'react-router-dom';

function Sidebar({ isCollapsed, isMobileOpen, onCloseMobile }) {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'DA', exact: true },
    { path: '/dashboard/profile', label: 'Profile', icon: 'PR' },
    { path: '/dashboard/drives', label: 'Drives', icon: 'DR' },
    { path: '/dashboard/applications', label: 'Applications', icon: 'AP' },
    { path: '/dashboard/inbox', label: 'Inbox', icon: 'IN' },
    { path: '/dashboard/events', label: 'Events', icon: 'EV' },
  ];

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
        className={`fixed lg:static top-0 left-0 z-40 h-screen bg-[#17171a] border-r border-[#2e2e33] transition-all duration-200
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'lg:w-[84px]' : 'w-64'}`}
      >
        <div className="h-14 px-4 flex items-center border-b border-[#2e2e33]">
          <h2 className={`text-sm font-semibold text-[#f7b545] tracking-wide ${isCollapsed ? 'hidden' : 'block'}`}>
            PLACEMENT
          </h2>
          <div className={`text-xs font-semibold text-[#f7b545] ${isCollapsed ? 'block mx-auto' : 'hidden'}`}>
            PM
          </div>
        </div>

        <nav className="p-3 flex flex-col gap-2 overflow-y-auto h-[calc(100%-56px)]">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `group relative h-12 flex items-center rounded-md transition-all ${
                  isActive
                    ? 'bg-[rgba(247,181,69,0.1)] text-white border-l-[3px] border-[#f7b545]'
                    : 'text-[#a1a1aa] hover:bg-[#232328] hover:text-white border-l-[3px] border-transparent'
                } ${isCollapsed ? 'justify-center px-2' : 'px-3'}`
              }
              title={isCollapsed ? item.label : ''}
            >
              <span className="text-[10px] font-bold tracking-wide text-[#d4d4d8] w-7 h-7 rounded-md bg-[#26262d] border border-[#34343a] grid place-items-center">
                {item.icon}
              </span>
              {!isCollapsed && <span className="ml-3 text-sm font-medium">{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
