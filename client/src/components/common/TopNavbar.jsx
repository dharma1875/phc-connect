import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../context/ToastContext';
import { alertService } from '../../features/alerts/services/alertService';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Building,
  ShieldCheck,
  Stethoscope,
  Activity,
} from 'lucide-react';

export default function TopNavbar({ onToggleMobileSidebar, onToggleSidebar, isSidebarCollapsed }) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [alertCount, setAlertCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const profileRef = useRef(null);

  const isDDHS = user?.role === 'DDHS';
  const roleTitle = isDDHS ? 'DDHS' : 'Doctor';
  const roleSubtitle = isDDHS
    ? 'Health Services Administration'
    : 'Healthcare Provider';

  useEffect(() => {
    // Fetch real active alerts count for DDHS
    if (isDDHS) {
      let isMounted = true;
      alertService
        .getSummary()
        .then((data) => {
          if (isMounted) {
            setAlertCount(Number(data?.open) || 0);
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    }
  }, [isDDHS]);

  // Click outside listener for profile dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Successfully logged out.', 'info');
      navigate('/login');
    } catch {
      navigate('/login');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (isDDHS) {
      navigate(`/ddhs/facilities?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/doctor/services');
    }
  };

  const userInitial = (user?.username || user?.name || (isDDHS ? 'D' : 'M'))
    .charAt(0)
    .toUpperCase();

  return (
    <header
      style={{
        height: '68px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
      }}
    >
      {/* Left: Mobile hamburger & Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          type="button"
          onClick={onToggleMobileSidebar}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent',
            border: 'none',
            color: '#475569',
            cursor: 'pointer',
            padding: '6px',
            borderRadius: '8px',
          }}
          className="mobile-hamburger"
          aria-label="Open mobile navigation"
        >
          <Menu size={22} />
        </button>

        <div
          onClick={() => navigate(isDDHS ? '/ddhs/dashboard' : '/doctor/dashboard')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(2, 132, 199, 0.3)',
            }}
          >
            <Activity size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                color: '#0f172a',
                lineHeight: 1.1,
              }}
            >
              PHC CONNECT
            </div>
            <div
              style={{
                fontSize: '0.675rem',
                fontWeight: 600,
                color: '#0284c7',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              Healthcare Monitoring
            </div>
          </div>
        </div>
      </div>

      {/* Middle: Search input */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          flex: 1,
          maxWidth: '440px',
          margin: '0 1.5rem',
          position: 'relative',
        }}
        className="nav-search-form"
      >
        <Search
          size={16}
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#94a3b8',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            isDDHS
              ? 'Search facilities, doctors, taluks...'
              : 'Search healthcare records...'
          }
          style={{
            width: '100%',
            padding: '0.55rem 0.85rem 0.55rem 2.25rem',
            borderRadius: '999px',
            border: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            fontSize: '0.875rem',
            outline: 'none',
            transition: 'all 0.15s ease',
          }}
          onFocus={(e) => {
            e.target.style.backgroundColor = '#ffffff';
            e.target.style.borderColor = '#0284c7';
            e.target.style.boxShadow = '0 0 0 3px rgba(2, 132, 199, 0.12)';
          }}
          onBlur={(e) => {
            e.target.style.backgroundColor = '#f8fafc';
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
          }}
        />
      </form>

      {/* Right: Notifications & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Alerts Bell (for DDHS, navigates to /ddhs/alerts) */}
        {isDDHS && (
          <button
            type="button"
            onClick={() => navigate('/ddhs/alerts')}
            title="Absenteeism Alerts"
            style={{
              position: 'relative',
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#475569',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <Bell size={18} />
            {alertCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: '999px',
                  padding: '1px 6px',
                  lineHeight: '14px',
                  border: '2px solid #ffffff',
                }}
              >
                {alertCount}
              </span>
            )}
          </button>
        )}

        {/* Profile Dropdown */}
        <div ref={profileRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: profileOpen ? '#f1f5f9' : 'transparent',
              border: '1px solid transparent',
              borderRadius: '12px',
              padding: '4px 8px 4px 4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: isDDHS ? '#1e3a5f' : '#0d9488',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(15, 23, 42, 0.08)',
              }}
            >
              {userInitial}
            </div>

            <div style={{ textAlign: 'left', display: 'none' }} className="nav-profile-text">
              <div
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: 1.2,
                }}
              >
                {user?.name || user?.username || (isDDHS ? 'DDHS Administrator' : 'Doctor')}
              </div>
              <div
                style={{
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  color: isDDHS ? '#0369a1' : '#0f766e',
                }}
              >
                {roleTitle} &bull; {roleSubtitle}
              </div>
            </div>

            <ChevronDown size={15} color="#64748b" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '260px',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '14px',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
                padding: '0.65rem',
                zIndex: 100,
                animation: 'fadeIn 0.15s ease',
              }}
            >
              <div
                style={{
                  padding: '0.65rem 0.75rem',
                  borderBottom: '1px solid #f1f5f9',
                  marginBottom: '0.5rem',
                }}
              >
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.925rem' }}>
                  {user?.name || user?.username}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  Role: <strong style={{ color: '#0284c7' }}>{roleTitle}</strong>
                </div>
                <div
                  style={{
                    display: 'inline-block',
                    marginTop: '6px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: isDDHS ? '#e0f2fe' : '#ccfbf1',
                    color: isDDHS ? '#0369a1' : '#0f766e',
                  }}
                >
                  {roleSubtitle}
                </div>
              </div>

              {!isDDHS && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/doctor/profile');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.55rem 0.75rem',
                      border: 'none',
                      borderRadius: '8px',
                      background: 'transparent',
                      color: '#334155',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <User size={16} color="#64748b" />
                    <span>My Profile</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileOpen(false);
                      navigate('/doctor/facility');
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.55rem 0.75rem',
                      border: 'none',
                      borderRadius: '8px',
                      background: 'transparent',
                      color: '#334155',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Building size={16} color="#64748b" />
                    <span>Assigned Facility</span>
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  handleLogout();
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.55rem 0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  background: 'transparent',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  marginTop: '4px',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '8px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <LogOut size={16} color="#dc2626" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
