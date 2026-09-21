export function SkeletonLine({ width = '100%', height = '16px', style = {} }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius: '6px',
        ...style,
      }}
    />
  );
}

export function SkeletonCard({ height = '130px' }) {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '16px',
        padding: '1.25rem',
        height,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ width: '60%' }}>
          <SkeletonLine width="45%" height="14px" style={{ marginBottom: '10px' }} />
          <SkeletonLine width="70%" height="28px" />
        </div>
        <SkeletonLine width="44px" height="44px" style={{ borderRadius: '12px' }} />
      </div>
      <SkeletonLine width="35%" height="14px" />
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 5 }) {
  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLine key={i} height="20px" width={`${100 / columns}%`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          {Array.from({ length: columns }).map((_, c) => (
            <SkeletonLine key={c} height="16px" width={`${100 / columns}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}
