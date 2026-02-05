import { NavLink } from 'react-router-dom';

function Sidebar() {
  const navItems = [
    { path: '/dashboard', label: 'DASHBOARD', icon: '📊', exact: true },
    { path: '/dashboard/profile', label: 'MY PROFILE', icon: '👤' },
    { path: '/dashboard/drives', label: 'PLACEMENT DRIVES', icon: '🏢' },
    { path: '/dashboard/applications', label: 'MY APPLICATIONS', icon: '📝' },
    { path: '/dashboard/inbox', label: 'INBOX', icon: '📬' },
    { path: '/dashboard/events', label: 'EVENTS', icon: '📅' },
  ];

  return (
    <aside className="w-72 neo-sidebar flex flex-col h-screen sticky top-0">
      <div className="p-8 border-b-2 border-[#323232] bg-white">
        <h2 className="neo-title !text-3xl m-0">
          PLACEMENT<span>HUB</span>
        </h2>
      </div>

      <nav className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `neo-nav-link ${isActive ? 'active' : ''}`
            }
          >
            <span className="text-xl w-6 text-center">{item.icon}</span>
            <span className="flex-1 tracking-wider">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t-2 border-[#323232] bg-white">
        <div className="flex flex-col gap-1 items-center">
          <small className="neo-subtitle !text-[10px] font-bold">PLACEMENT MANAGEMENT</small>
          <small className="neo-subtitle !text-[10px] opacity-50">V1.0.0</small>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
