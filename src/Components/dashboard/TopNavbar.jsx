import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useStudent } from '../../context/StudentContext';
import inboxService from '../../services/inboxService';
import ThemeModeSwitch from '../common/ThemeModeSwitch';
import { resolveFileUrl } from '../../services/api';

function TopNavbar({ onToggleCollapse, onOpenMobileSidebar, isCollapsed, theme = 'dark', onThemeChange }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const { profile } = useStudent();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const avatarUrl = resolveFileUrl(profile?.photo_url);
  const userName = profile?.full_name || 'Student';

  useEffect(() => {
    let mounted = true;
    const loadUnread = async () => {
      try {
        const response = await inboxService.getUnreadCount();
        if (mounted) setUnreadCount(response.data.count || 0);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    loadUnread();
    return () => {
      mounted = false;
    };
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`${theme === 'light' ? 'bg-white/95' : 'bg-[#1a1a1e]/95'} backdrop-blur sticky top-0 z-30`}>
      <div className={`h-14 px-4 md:px-6 flex items-center justify-between gap-4 border-b ${theme === 'light' ? 'border-[#d1d5db]' : 'border-[#2f2f34]'}`}>
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <button
            onClick={onOpenMobileSidebar}
            className={`${theme === 'light' ? 'border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]' : 'border-[#3a3a40] text-[#d4d4d8] hover:bg-[#2a2a2e]'} lg:hidden h-9 w-9 bg-transparent border`}
            aria-label="Open sidebar"
          >
            =
          </button>
          <button
            onClick={onToggleCollapse}
            className={`${theme === 'light' ? 'border-[#d1d5db] text-[#374151] hover:bg-[#f3f4f6]' : 'border-[#3a3a40] text-[#d4d4d8] hover:bg-[#2a2a2e]'} hidden lg:inline-flex items-center justify-center h-9 w-9 border bg-transparent`}
            aria-label="Toggle sidebar width"
          >
            {isCollapsed ? '>' : '<'}
          </button>

        </div>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`${theme === 'light' ? 'border-[#d1d5db] bg-[#f9fafb] text-[#6b7280]' : 'border-[#3a3a40] bg-[#202026] text-[#9ca3af]'} hidden xl:flex items-center h-9 px-3 border text-sm min-w-[220px]`}>
            Search
          </div>
          <ThemeModeSwitch theme={theme} onChange={onThemeChange} />
          <button
            className={`${theme === 'light' ? 'hover:bg-[#f3f4f6] border-[#d1d5db] text-[#374151]' : 'hover:bg-[#2a2a2e] border-[#3a3a40] text-[#d1d5db]'} relative h-9 px-3 transition-colors border bg-transparent text-[11px] font-semibold tracking-wider`}
            onClick={() => navigate('/dashboard/inbox')}
            title="Inbox"
          >
            INBOX
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#ef4444] text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[16px] text-center">
                {unreadCount}
              </span>
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className={`${theme === 'light' ? 'border-[#d1d5db] hover:bg-[#f3f4f6]' : 'border-[#3a3a40] hover:bg-[#2a2a2e]'} flex items-center gap-2 px-2 py-1.5 border transition-all bg-transparent cursor-pointer`}
            >
              <div className={`${theme === 'light' ? 'bg-[#f3f4f6] border-[#d1d5db]' : 'bg-[#2e2e34] border-[#444]'} w-7 h-7 overflow-hidden border flex items-center justify-center text-sm`}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={userName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-[#a1a1aa]">USR</span>
                )}
              </div>
              <span className={`hidden sm:inline text-sm ${theme === 'light' ? 'text-[#374151]' : 'text-[#d4d4d8]'} max-w-[140px] truncate`}>
                {userName}
              </span>
              <span className={`text-xs text-[#7c7c7c] transition-transform duration-200 inline-block ${showUserMenu ? 'rotate-180' : ''}`}>^</span>
            </button>

            {showUserMenu && (
              <div className={`${theme === 'light' ? 'bg-white border-[#d1d5db]' : 'bg-[#232329] border-[#3a3a40]'} absolute top-full right-0 mt-2 w-48 border shadow-xl overflow-hidden z-50`}>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard/profile');
                  }}
                  className={`${theme === 'light' ? 'hover:bg-[#f3f4f6] text-[#374151]' : 'hover:bg-[#2f2f35] text-[#d4d4d8]'} w-full text-left px-4 py-3 text-sm transition-colors border-none bg-transparent cursor-pointer`}
                >
                  My Profile
                </button>
                <div className={`h-px ${theme === 'light' ? 'bg-[#e5e7eb]' : 'bg-[#323238]'}`} />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-[#3a2024] text-sm text-[#f87171] transition-colors border-none bg-transparent cursor-pointer"
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
