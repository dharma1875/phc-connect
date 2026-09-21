import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  UserCheck,
  AlertTriangle,
  ArrowRight,
  Lock,
  User,
  Sparkles,
} from 'lucide-react';

const portalOptions = [
  {
    label: 'DDHS Administration',
    value: 'DDHS',
    subtitle: 'District Healthcare Monitoring',
    icon: ShieldCheck,
  },
  {
    label: 'Doctor Portal',
    value: 'DOCTOR',
    subtitle: 'Attendance & Daily Reports',
    icon: Stethoscope,
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [portal, setPortal] = useState('DDHS');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login({ username: username.trim(), password: password.trim() });
      showToast(`Welcome back, ${user.name || user.username}!`, 'success');

      if (user.role === 'DDHS') {
        navigate('/ddhs/dashboard');
      } else if (user.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/login');
      }
    } catch (loginError) {
      setError(loginError.message || 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  const autofillDemo = (role) => {
    if (role === 'DDHS') {
      setPortal('DDHS');
      setUsername('ddhs.admin');
      setPassword('ddhs@123');
      setError('');
    } else {
      setPortal('DOCTOR');
      setUsername('dr.raman');
      setPassword('doctor@123');
      setError('');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        backgroundColor: '#0a1628',
      }}
    >
      {/* Left Column: Healthcare Presentation & Branding */}
      <div
        style={{
          flex: '1 1 50%',
          background: 'linear-gradient(145deg, #091424 0%, #0f2038 50%, #162a45 100%)',
          padding: '3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
        }}
        className="login-brand-panel"
      >
        {/* Subtle decorative background circles */}
        <div
          style={{
            position: 'absolute',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(2, 132, 199, 0.15) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(13, 148, 136, 0.12) 0%, transparent 70%)',
            bottom: '-150px',
            left: '-150px',
            pointerEvents: 'none',
          }}
        />

        {/* Brand Header */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '0.75rem' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
              }}
            >
              <Activity size={28} color="#ffffff" strokeWidth={2.4} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', margin: 0 }}>
                PHC CONNECT
              </h1>
              <div style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Health Services Administration & Monitoring
              </div>
            </div>
          </div>

          <p style={{ color: '#94a3b8', fontSize: '1rem', maxWidth: '480px', marginTop: '1.25rem', lineHeight: 1.6 }}>
            Centralized digital governance platform for Primary Health Centres (PHC), Upgraded Primary Health Centres (UPHC), and Health Sub-Centres (HSC).
          </p>
        </div>

        {/* Feature Highlights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', margin: '2.5rem 0', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(2, 132, 199, 0.2)',
                color: '#38bdf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <UserCheck size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>
                Real-Time Attendance Monitoring
              </div>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '2px' }}>
                Instant doctor check-in tracking with automated late and absence flagging.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(13, 148, 136, 0.2)',
                color: '#2dd4bf',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Stethoscope size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>
                Healthcare Service Reporting
              </div>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '2px' }}>
                Daily structured reporting for OPD, ANC, PNC, child immunizations, and labs.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>
                Automated Absenteeism Alerts
              </div>
              <div style={{ fontSize: '0.825rem', color: '#94a3b8', marginTop: '2px' }}>
                Severity-graded exception alerts with full administrative acknowledgement and resolution history.
              </div>
            </div>
          </div>
        </div>

        {/* Footer Trust Badges */}
        <div
          style={{
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#64748b',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="#38bdf8" />
            <span>Encrypted Authentication &middot; Role-Based Access</span>
          </div>
          <div>Smart India Hackathon &middot; Demo</div>
        </div>
      </div>

      {/* Right Column: Interactive Login Form */}
      <div
        style={{
          flex: '1 1 50%',
          backgroundColor: '#f8fafc',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2.5rem 2rem',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 12px 36px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
            padding: '2.5rem 2.25rem',
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              System Sign In
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.35rem' }}>
              Select your authorization portal to continue
            </p>
          </div>

          {/* Role Portal Selector */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginBottom: '1.75rem',
            }}
          >
            {portalOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = portal === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setPortal(opt.value);
                    setError('');
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.85rem 0.5rem',
                    borderRadius: '12px',
                    border: `2px solid ${isSelected ? '#0284c7' : '#e2e8f0'}`,
                    backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                    color: isSelected ? '#0284c7' : '#475569',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Icon size={22} color={isSelected ? '#0284c7' : '#64748b'} />
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, marginTop: '6px' }}>
                    {opt.value}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                    {opt.value === 'DDHS' ? 'Administration' : 'Doctor Portal'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick autofill chips for evaluation demo */}
          <div
            style={{
              backgroundColor: '#f1f5f9',
              borderRadius: '10px',
              padding: '0.75rem',
              marginBottom: '1.5rem',
              fontSize: '0.8rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontWeight: 600, marginBottom: '6px' }}>
              <Sparkles size={14} color="#0284c7" />
              <span>Quick Demo Sign-In Credentials:</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => autofillDemo('DDHS')}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0369a1',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                DDHS (Admin)
              </button>
              <button
                type="button"
                onClick={() => autofillDemo('DOCTOR')}
                style={{
                  flex: 1,
                  padding: '5px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #cbd5e1',
                  color: '#0f766e',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Dr. Raman (Doctor)
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Username / Doctor ID */}
            <div>
              <label
                htmlFor="username"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                {portal === 'DDHS' ? 'DDHS Username' : 'Doctor ID / Username'}
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={portal === 'DDHS' ? 'e.g. ddhs.admin' : 'e.g. dr.raman'}
                  className="input-control"
                  style={{ paddingLeft: '2.4rem' }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.4rem',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#94a3b8',
                  }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your security password"
                  className="input-control"
                  style={{ paddingLeft: '2.4rem', paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  backgroundColor: '#fee2e2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '0.65rem 0.85rem',
                  color: '#b91c1c',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg"
              style={{
                width: '100%',
                marginTop: '0.5rem',
                gap: '8px',
                fontSize: '1rem',
              }}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In as {portal}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
