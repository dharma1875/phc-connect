import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const navItems = [
  { label: 'Dashboard', to: '/doctor/dashboard' },
  { label: 'Attendance', to: '/doctor/attendance' },
  { label: 'Healthcare Services', to: '/doctor/services' },
  { label: 'Reports', to: '/doctor/reports', disabled: true },
  { label: 'Profile', to: '/doctor/profile' },
  { label: 'Logout', to: '/login', action: 'logout' },
];

function DoctorSidebar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>PHC CONNECT</div>
      <nav style={styles.nav}>
        {navItems.map((item) => {
          if (item.disabled) {
            return (
              <div key={item.label} style={{ ...styles.navItem, ...styles.disabledNavItem }}>
                {item.label}
              </div>
            );
          }

          if (item.action === 'logout') {
            return (
              <button key={item.label} type="button" onClick={handleLogout} style={{ ...styles.navItem, ...styles.logoutButton }}>
                {item.label}
              </button>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.to}
              style={({ isActive }) => ({
                ...styles.navLink,
                ...(isActive ? styles.navLinkActive : {}),
              })}
            >
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div style={styles.userBox}>{user?.name || 'Doctor'}</div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '240px',
    background: '#0f172a',
    color: '#fff',
    padding: '1.25rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  brand: {
    fontSize: '1.2rem',
    fontWeight: 700,
    marginBottom: '1.5rem',
    padding: '0.5rem 0.75rem',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  navLink: {
    color: '#dbeafe',
    textDecoration: 'none',
    padding: '0.7rem 0.8rem',
    borderRadius: '10px',
    fontWeight: 600,
  },
  navLinkActive: {
    background: '#1d4ed8',
  },
  navItem: {
    color: '#dbeafe',
    padding: '0.7rem 0.8rem',
    borderRadius: '10px',
    fontWeight: 600,
    background: 'transparent',
    border: 'none',
    textAlign: 'left',
    width: '100%',
    cursor: 'pointer',
  },
  disabledNavItem: {
    opacity: 0.45,
    cursor: 'not-allowed',
  },
  logoutButton: {
    background: '#7f1d1d',
    color: '#fff',
    marginTop: '0.25rem',
  },
  userBox: {
    marginTop: 'auto',
    background: '#1e293b',
    borderRadius: '10px',
    padding: '0.8rem',
    color: '#e2e8f0',
    textAlign: 'center',
    fontWeight: 600,
  },
};

export default DoctorSidebar;
