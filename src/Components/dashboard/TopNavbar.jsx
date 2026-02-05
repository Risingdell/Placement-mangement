import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import inboxService from '../../services/inboxService';

function TopNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const isOfficerAvailable = true;

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
  }, [location.pathname]); // Refresh when navigating, especially back to dashboard or inbox

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b-2 border-[#323232] sticky top-0 z-30 shadow-[0_4px_0_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center px-8 py-4">
        {/* Left section */}
        <div className="flex-1">
          <h3 className="neo-title !text-xl !mb-0 tracking-wide">STUDENT DASHBOARD</h3>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-6">
          {/* Inbox Icon */}
          <button
            className="neo-button !p-2 !w-12 !h-12 !flex items-center justify-center !min-h-0 !translate-y-0"
            onClick={() => navigate('/dashboard/inbox')}
            title="Inbox"
          >
            <span className="text-2xl leading-none">📬</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 border-2 border-[#323232] rounded shadow-[2px_2px_0px_#323232]">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Officer Availability */}
          <div
            className={`hidden md:flex items-center gap-3 px-4 py-2 border-2 border-[#323232] rounded shadow-[3px_3px_0px_#323232] bg-white`}
            title={isOfficerAvailable ? 'Officer Available' : 'Officer Busy'}
          >
            <div
              className={`w-3 h-3 rounded-full ${isOfficerAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                }`}
            />
            <span className="neo-subtitle !text-[11px] font-bold">
              OFFICER {isOfficerAvailable ? 'AVAILABLE' : 'BUSY'}
            </span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 px-4 py-2 border-2 border-[#323232] rounded bg-white hover:bg-gray-50 transition-all shadow-[3px_3px_0px_#323232] active:shadow-none active:translate-x-0.5 active:translate-y-0.5 cursor-pointer"
            >
              <div className="w-8 h-8 border-2 border-[#323232] rounded bg-blue-500 flex items-center justify-center text-white text-sm">
                <span>👤</span>
              </div>
              <span className="neo-subtitle !text-[12px] font-bold">STUDENT</span>
              <span className="text-xs">▼</span>
            </button>

            {showUserMenu && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-white border-2 border-[#323232] rounded shadow-[6px_6px_0px_#323232] overflow-hidden z-50">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard/profile');
                  }}
                  className="w-full text-left px-4 py-4 hover:bg-gray-50 text-[13px] font-bold font-['Space_Mono'] text-gray-700 transition-colors border-none bg-transparent cursor-pointer"
                >
                  MY PROFILE
                </button>
                <div className="h-0.5 bg-[#323232]" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-4 hover:bg-red-50 text-[13px] font-bold font-['Space_Mono'] text-red-600 transition-colors border-none bg-transparent cursor-pointer"
                >
                  LOGOUT
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
