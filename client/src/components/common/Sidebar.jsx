import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import {
  LayoutDashboard,
  Building2,
  UserCheck,
  Activity,
  AlertTriangle,
  FileBarChart2,
  Stethoscope,
  History,
  Building,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function Sidebar({
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const isDDHS = user?.role === 'DDHS';

  const ddhsItems = [
    { label: 'Dashboard', path: '/ddhs/dashboard', icon: LayoutDashboard },
    { label: 'Facilities', path: '/ddhs/facilities', icon: Building2 },
    { label: 'Attendance', path: '/ddhs/attendance', icon: UserCheck },
    { label: 'Healthcare Services', path: '/ddhs/services', icon: Activity },
    { label: 'Absenteeism Alerts', path: '/ddhs/alerts', icon: AlertTriangle },
    { label: 'Reports & Analytics', path: '/ddhs/reports', icon: FileBarChart2 },
  ];

  const doctorItems = [
    { label: 'Dashboard', path: '/doctor/dashboard', icon: LayoutDashboard },
    { label: 'Attendance', path: '/doctor/attendance', icon: UserCheck },
    { label: 'Daily Services', path: '/doctor/services', icon: Stethoscope },
    { label: 'Service History', path: '/doctor/services/history', icon: History },
    { label: 'Assigned Facility', path: '/doctor/facility', icon: Building },
    { label: 'My Profile', path: '/doctor/profile', icon: User },
  ];

  const navItems = isDDHS ? ddhsItems : doctorItems;

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully.', 'info');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0f2038',
        color: '#f8fafc',
        padding: isCollapsed ? '1.25rem 0.5rem' : '1.25rem 0.85rem',
        userSelect: 'none',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* Header / Collapse Toggle on desktop */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #1e3a5f',
          marginBottom: '1rem',
        }}
      >
        {!isCollapsed ? (
          <div>
            <div
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#38bdf8',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              {isDDHS ? 'Administration' : 'Doctor Portal'}
            </div>
            <div
              style={{
                fontSize: '0.725rem',
                color: '#94a3b8',
                marginTop: '1px',
              }}
            >
              PHC &bull; UPHC &bull; HSC
            </div>
          </div>
        ) : null}

        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          style={{
            background: '#162a45',
            border: '1px solid #234470',
            borderRadius: '8px',
            color: '#cbd5e1',
            padding: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          className="sidebar-collapse-btn"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/ddhs/dashboard' &&
              item.path !== '/doctor/dashboard' &&
              location.pathname.startsWith(item.path));

          return (
            <button
              key={item.path}
              type="button"
              onClick={() => handleNavigate(item.path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                backgroundColor: isActive ? '#0284c7' : 'transparent',
                color: isActive ? '#ffffff' : '#cbd5e1',
                border: 'none',
                borderRadius: '10px',
                fontSize: '0.9rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s ease',
                width: '100%',
                position: 'relative',
              }}
              title={isCollapsed ? item.label : undefined}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#162a45';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#cbd5e1';
                }
              }}
            >
              <Icon
                size={20}
                strokeWidth={isActive ? 2.4 : 1.8}
                color={isActive ? '#ffffff' : '#94a3b8'}
              />
              {!isCollapsed && (
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <div
                  style={{
                    position: 'absolute',
                    right: '10px',
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div
        style={{
          borderTop: '1px solid #1e3a5f',
          paddingTop: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
      >
        <button
          type="button"
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: isCollapsed ? '0.75rem 0' : '0.75rem 1rem',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            backgroundColor: '#2d1520',
            color: '#f87171',
            border: '1px solid #451a24',
            borderRadius: '10px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            width: '100%',
          }}
          title={isCollapsed ? 'Logout' : undefined}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#3f1823')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2d1520')}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          width: isCollapsed ? '72px' : '260px',
          height: 'calc(100vh - 68px)',
          position: 'sticky',
          top: '68px',
          flexShrink: 0,
          zIndex: 40,
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className="desktop-sidebar"
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop and Sidebar */}
      {isMobileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 999,
            display: 'flex',
          }}
          onClick={onCloseMobile}
        >
          <div
            style={{
              width: '280px',
              height: '100%',
              backgroundColor: '#0f2038',
              boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button inside mobile drawer */}
            <button
              type="button"
              onClick={onCloseMobile}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: '#162a45',
                border: 'none',
                borderRadius: '8px',
                color: '#ffffff',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                zIndex: 10,
              }}
            >
              <X size={20} />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
