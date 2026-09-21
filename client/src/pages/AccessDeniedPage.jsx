import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AccessDeniedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleReturn = () => {
    if (user?.role === 'DDHS') {
      navigate('/ddhs/dashboard');
    } else if (user?.role === 'DOCTOR') {
      navigate('/doctor/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '1.5rem',
      }}
    >
      <div
        className="card-base"
        style={{
          maxWidth: '480px',
          width: '100%',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
        }}
      >
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <ShieldAlert size={32} />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
          Access Restricted
        </h1>

        <p style={{ color: '#64748b', fontSize: '0.925rem', lineHeight: 1.5, margin: '0 0 1.5rem' }}>
          Your authenticated role is not authorized to access this administrative endpoint. Role-based security guards have prevented unauthorized entry.
        </p>

        <button
          type="button"
          onClick={handleReturn}
          className="btn btn-primary"
          style={{ margin: '0 auto', gap: '8px' }}
        >
          <ArrowLeft size={16} />
          <span>Return to Authorized Dashboard</span>
        </button>
      </div>
    </div>
  );
}
