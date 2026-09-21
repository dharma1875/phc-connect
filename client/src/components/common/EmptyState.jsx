import { FolderOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There is currently no data to display for the selected parameters.',
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px dashed #cbd5e1',
        margin: '1rem 0',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          backgroundColor: '#f1f5f9',
          color: '#64748b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
        }}
      >
        <Icon size={28} />
      </div>

      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: '#0f172a',
          marginBottom: '0.35rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.9rem',
          color: '#64748b',
          maxWidth: '380px',
          lineHeight: 1.5,
          marginBottom: actionLabel ? '1.25rem' : 0,
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn btn-secondary btn-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
