import { AlertCircle, RotateCcw } from 'lucide-react';

export default function ErrorCard({
  title = 'Unable to load data',
  message = 'A network or server error occurred while retrieving this information. Please check your connection and try again.',
  onRetry,
}) {
  return (
    <div
      style={{
        backgroundColor: '#fff1f2',
        border: '1px solid #fecdd3',
        borderRadius: '16px',
        padding: '1.5rem',
        margin: '1.25rem 0',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: '#ffe4e6',
          color: '#e11d48',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <AlertCircle size={22} />
      </div>

      <div style={{ flex: 1 }}>
        <h4 style={{ margin: '0 0 0.35rem', fontSize: '1rem', fontWeight: 700, color: '#9f1239' }}>
          {title}
        </h4>
        <p style={{ margin: '0 0 0.85rem', fontSize: '0.9rem', color: '#be123c', lineHeight: 1.4 }}>
          {message}
        </p>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: '#e11d48',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '0.45rem 0.9rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
            <span>Retry</span>
          </button>
        )}
      </div>
    </div>
  );
}
