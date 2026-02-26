import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import inboxService from '../../services/inboxService';

const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const apiOrigin = apiBase.replace(/\/api\/?$/, '');
  return `${apiOrigin}${url.startsWith('/') ? '' : '/'}${url}`;
};

function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { profile } = useStudent();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const avatarUrl = resolveMediaUrl(profile?.photo_url);
  const userName = profile?.full_name || 'Student';

  const quickLinks = [
    { to: '/dashboard', label: 'Dashboard', exact: true },
    { to: '/dashboard/drives', label: 'Drives' },
    { to: '/dashboard/applications', label: 'Applications' },
    { to: '/dashboard/profile', label: 'Profile' },
  ];

  const fetchUnreadCount = async () => {
    try {
      const response = await inboxService.getUnreadCount();
      setUnreadCount(response.data.count || 0);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-[#1f1f1f]/95 backdrop-blur border-b border-[#323232] sticky top-0 z-30">
      <div className="h-14 px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-5 min-w-0">
          <div className="text-[#ffa116] text-lg font-semibold tracking-tight">PlacementHub</div>
          <nav className="flex items-center gap-1 overflow-x-auto max-w-[48vw] scrollbar-thin">
            {quickLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.exact}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-sm transition-colors ${
                    isActive
                      ? 'text-white bg-[#2c2c2c]'
                      : 'text-[#b4b4b4] hover:text-white hover:bg-[#2a2a2a]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            className="relative p-2 rounded-md hover:bg-[#2a2a2a] transition-colors cursor-pointer border-none bg-transparent text-[#d1d5db]"
            onClick={() => navigate('/dashboard/inbox')}
            title="Inbox"
          >
            <span className="text-[11px] font-semibold tracking-wider leading-none">INBOX</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-[#3a3a3a] hover:bg-[#2a2a2a] transition-all bg-transparent cursor-pointer"
            >
              <div className="w-7 h-7 rounded-md overflow-hidden bg-[#2e2e2e] border border-[#444] flex items-center justify-center text-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-[#a1a1aa]">USR</span>
                )}
              </div>
              <span className="hidden sm:inline text-sm text-[#d4d4d8] max-w-[140px] truncate">
                {userName}
              </span>
              <span className="text-xs text-[#7c7c7c]">v</span>
            </button>

            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#232323] border border-[#3a3a3a] rounded-lg shadow-xl overflow-hidden z-50">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard/profile');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#2f2f2f] text-sm text-[#d4d4d8] transition-colors border-none bg-transparent cursor-pointer"
                >
                  My Profile
                </button>
                <div className="h-px bg-[#323232]" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#3a2020] text-sm text-[#f87171] transition-colors border-none bg-transparent cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
