import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function TopNavbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Mock data - will be replaced with actual inbox count later
  const unreadCount = 3;
  const isOfficerAvailable = true;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="flex justify-between items-center px-6 py-4">
        {/* Left section */}
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800">Student Dashboard</h3>
        </div>

        {/* Right section */}
        <div className="flex items-center gap-5">
          {/* Inbox Icon */}
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent"
            onClick={() => navigate('/dashboard/inbox')}
            title="Inbox"
          >
            <span className="text-2xl leading-none">📬</span>
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Officer Availability */}
          <div
            className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full text-sm border border-gray-200"
            title={isOfficerAvailable ? 'Officer Available' : 'Officer Busy'}
          >
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${isOfficerAvailable ? 'bg-green-500' : 'bg-red-500'
                }`}
            />
            <span className="text-gray-600 font-medium text-xs">
              {isOfficerAvailable ? 'Officer Available' : 'Officer Busy'}
            </span>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-all bg-transparent cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm shadow-sm">
                <span>👤</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Student</span>
              <span className="text-xs text-gray-400">▼</span>
            </button>

            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard/profile');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 transition-colors border-none bg-transparent cursor-pointer"
                >
                  My Profile
                </button>
                <div className="h-px bg-gray-100" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm text-red-600 transition-colors border-none bg-transparent cursor-pointer"
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
