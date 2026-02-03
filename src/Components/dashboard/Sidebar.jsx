import { NavLink } from 'react-router-dom';

function Sidebar() {
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊', exact: true },
    { path: '/dashboard/profile', label: 'My Profile', icon: '👤' },
    { path: '/dashboard/drives', label: 'Placement Drives', icon: '🏢' },
    { path: '/dashboard/applications', label: 'My Applications', icon: '📝' },
    { path: '/dashboard/inbox', label: 'Inbox', icon: '📬' },
    { path: '/dashboard/events', label: 'Events', icon: '📅' },
  ];

  return (
    <aside className="w-64 bg-slate-800 text-white flex flex-col h-screen sticky top-0 shadow-xl z-20">
      <div className="p-6 border-b border-slate-700">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent m-0">
          PlacementHub
        </h2>
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${isActive
                ? 'bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/10'
                : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`
            }
          >
            <span className="text-lg w-6 text-center">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-5 border-t border-slate-700">
        <div className="text-xs text-slate-400 text-center flex flex-col gap-1">
          <small>Placement Management</small>
          <small className="text-slate-500">v1.0.0</small>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
