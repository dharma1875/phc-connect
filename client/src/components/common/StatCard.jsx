export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = 'primary',
  onClick,
}) {
  const tones = {
    primary: {
      bgIcon: '#e0f2fe',
      iconColor: '#0284c7',
      accentColor: '#0284c7',
      badgeBg: '#f0f9ff',
      badgeColor: '#0369a1',
    },
    teal: {
      bgIcon: '#ccfbf1',
      iconColor: '#0d9488',
      accentColor: '#0d9488',
      badgeBg: '#f0fdfa',
      badgeColor: '#0f766e',
    },
    success: {
      bgIcon: '#dcfce7',
      iconColor: '#16a34a',
      accentColor: '#16a34a',
      badgeBg: '#f0fdf4',
      badgeColor: '#15803d',
    },
    warning: {
      bgIcon: '#fef3c7',
      iconColor: '#d97706',
      accentColor: '#d97706',
      badgeBg: '#fffbeb',
      badgeColor: '#b45309',
    },
    danger: {
      bgIcon: '#fee2e2',
      iconColor: '#dc2626',
      accentColor: '#dc2626',
      badgeBg: '#fef2f2',
      badgeColor: '#b91c1c',
    },
    neutral: {
      bgIcon: '#f1f5f9',
      iconColor: '#475569',
      accentColor: '#475569',
      badgeBg: '#f8fafc',
      badgeColor: '#475569',
    },
  };

  const currentTone = tones[tone] || tones.primary;

  return (
    <div
      onClick={onClick}
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem 1.4rem',
        boxShadow: '0 2px 4px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      className={onClick ? 'card-hover' : ''}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
        <div>
          <span
            style={{
              fontSize: '0.775rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b',
              display: 'block',
              marginBottom: '0.35rem',
            }}
          >
            {title}
          </span>
          <div
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: '#0f172a',
              lineHeight: 1.1,
              fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
            }}
          >
            {value}
          </div>
        </div>

        {Icon && (
          <div
            style={{
              backgroundColor: currentTone.bgIcon,
              color: currentTone.iconColor,
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Icon size={22} />
          </div>
        )}
      </div>

      {subtitle && (
        <div
          style={{
            fontSize: '0.825rem',
            fontWeight: 600,
            color: currentTone.badgeColor,
            backgroundColor: currentTone.badgeBg,
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            alignSelf: 'flex-start',
            marginTop: '0.2rem',
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
}
