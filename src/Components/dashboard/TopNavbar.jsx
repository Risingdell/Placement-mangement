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
    <header style={styles.navbar}>
      <div style={styles.navbarContent}>
        {/* Left section */}
        <div style={styles.leftSection}>
          <h3 style={styles.pageTitle}>Student Dashboard</h3>
        </div>

        {/* Right section */}
        <div style={styles.rightSection}>
          {/* Inbox Icon */}
          <div
            style={styles.iconButton}
            onClick={() => navigate('/dashboard/inbox')}
            title="Inbox"
          >
            <span style={styles.icon}>📬</span>
            {unreadCount > 0 && (
              <span style={styles.badge}>{unreadCount}</span>
            )}
          </div>

          {/* Officer Availability */}
          <div style={styles.availabilityIndicator} title={isOfficerAvailable ? 'Officer Available' : 'Officer Busy'}>
            <span style={{
              ...styles.dot,
              backgroundColor: isOfficerAvailable ? '#4CAF50' : '#f44336',
            }} />
            <span style={styles.availabilityText}>
              {isOfficerAvailable ? 'Officer Available' : 'Officer Busy'}
            </span>
          </div>

          {/* User Menu */}
          <div style={styles.userMenuContainer}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={styles.userButton}
            >
              <div style={styles.avatar}>
                <span>👤</span>
              </div>
              <span style={styles.userName}>Student</span>
              <span style={styles.dropdownIcon}>▼</span>
            </button>

            {showUserMenu && (
              <div style={styles.dropdown}>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/dashboard/profile');
                  }}
                  style={styles.dropdownItem}
                >
                  My Profile
                </button>
                <div style={styles.divider} />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    handleLogout();
                  }}
                  style={{...styles.dropdownItem, color: '#f44336'}}
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

const styles = {
  navbar: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  navbarContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    maxWidth: '100%',
  },
  leftSection: {
    flex: 1,
  },
  pageTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#333',
    margin: 0,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  iconButton: {
    position: 'relative',
    padding: '8px 12px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background-color 0.3s',
    backgroundColor: 'transparent',
  },
  icon: {
    fontSize: '1.5rem',
  },
  badge: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    backgroundColor: '#f44336',
    color: '#fff',
    fontSize: '0.7rem',
    fontWeight: 'bold',
    padding: '2px 6px',
    borderRadius: '10px',
    minWidth: '18px',
    textAlign: 'center',
  },
  availabilityIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '20px',
    fontSize: '0.85rem',
  },
  dot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    animation: 'pulse 2s infinite',
  },
  availabilityText: {
    color: '#666',
    fontWeight: '500',
  },
  userMenuContainer: {
    position: 'relative',
  },
  userButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    backgroundColor: 'transparent',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#2196F3',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
  },
  userName: {
    fontSize: '0.9rem',
    fontWeight: '500',
    color: '#333',
  },
  dropdownIcon: {
    fontSize: '0.7rem',
    color: '#666',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    minWidth: '180px',
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownItem: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: 'transparent',
    border: 'none',
    textAlign: 'left',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#333',
    transition: 'background-color 0.2s',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e0e0e0',
    margin: '4px 0',
  },
};

export default TopNavbar;
