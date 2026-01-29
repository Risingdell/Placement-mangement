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
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <h2 style={styles.logo}>PlacementHub</h2>
      </div>

      <nav style={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.exact}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {}),
            })}
          >
            <span style={styles.icon}>{item.icon}</span>
            <span style={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={styles.sidebarFooter}>
        <div style={styles.footerText}>
          <small>Placement Management</small>
          <small style={styles.version}>v1.0.0</small>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#1e293b',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    position: 'sticky',
    top: 0,
    boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
  },
  sidebarHeader: {
    padding: '24px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  logo: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
    margin: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  nav: {
    flex: 1,
    padding: '20px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    overflowY: 'auto',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#cbd5e1',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
  },
  navItemActive: {
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
    color: '#fff',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)',
  },
  icon: {
    fontSize: '1.2rem',
    width: '24px',
    textAlign: 'center',
  },
  label: {
    flex: 1,
  },
  sidebarFooter: {
    padding: '20px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
  },
  footerText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '0.75rem',
    color: '#94a3b8',
    textAlign: 'center',
  },
  version: {
    color: '#64748b',
  },
};

export default Sidebar;
