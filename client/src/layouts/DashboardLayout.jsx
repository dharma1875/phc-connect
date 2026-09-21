import { useState } from 'react';
import TopNavbar from '../components/common/TopNavbar';
import Sidebar from '../components/common/Sidebar';

export default function DashboardLayout({
  children,
  pageTitle,
  subtitle,
  headerRight,
}) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f4f7fb' }}>
      <TopNavbar
        onToggleMobileSidebar={() => setIsMobileOpen((prev) => !prev)}
        onToggleSidebar={toggleSidebar}
        isSidebarCollapsed={isSidebarCollapsed}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          isMobileOpen={isMobileOpen}
          onCloseMobile={() => setIsMobileOpen(false)}
        />

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            overflowY: 'auto',
          }}
        >
          {/* Optional Page Header Bar if pageTitle is supplied */}
          {pageTitle && (
            <div
              style={{
                backgroundColor: '#ffffff',
                borderBottom: '1px solid #e2e8f0',
                padding: '1.25rem 2rem',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2,
                  }}
                >
                  {pageTitle}
                </h1>
                {subtitle && (
                  <p
                    style={{
                      fontSize: '0.875rem',
                      color: '#64748b',
                      marginTop: '0.25rem',
                    }}
                  >
                    {subtitle}
                  </p>
                )}
              </div>

              {headerRight && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {headerRight}
                </div>
              )}
            </div>
          )}

          {/* Page Main Content */}
          <div
            style={{
              padding: '1.75rem 2rem',
              flex: 1,
              maxWidth: '1600px',
              width: '100%',
              margin: '0 auto',
            }}
            className="content-inner"
          >
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
