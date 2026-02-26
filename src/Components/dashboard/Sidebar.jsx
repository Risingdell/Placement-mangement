import { NavLink } from 'react-router-dom';

function Sidebar() {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'DB', exact: true },
    { path: '/dashboard/profile', label: 'My Profile', icon: 'PR' },
    { path: '/dashboard/drives', label: 'Placement Drives', icon: 'DR' },
    { path: '/dashboard/applications', label: 'My Applications', icon: 'AP' },
    { path: '/dashboard/inbox', label: 'Inbox', icon: 'IN' },
    { path: '/dashboard/events', label: 'Events', icon: 'EV' },
  ];

  return (
    <aside className="hidden lg:flex w-60 bg-[#1b1b1b] text-white flex-col h-screen sticky top-0 border-r border-[#313131] z-20">
      <div className="h-14 px-5 flex items-center border-b border-[#313131]">
        <h2 className="text-lg font-semibold text-[#ffa116] m-0 tracking-tight">Student Portal</h2>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-1.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-[#2b2b2b] text-white border border-[#3a3a3a]'
                  : 'text-[#a1a1aa] hover:bg-[#262626] hover:text-white'
              }`
            }
          >
            <span className="text-xs w-4 text-center text-[#9ca3af]">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[#313131]">
        <p className="text-[11px] text-[#71717a] m-0">Placement Management v1.0.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;
