import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import ErrorCard from '../../components/common/ErrorCard';
import { doctorService } from '../../services/doctorService';
import {
  User,
  Building,
  ShieldCheck,
  Stethoscope,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Award,
} from 'lucide-react';

export default function DoctorProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await doctorService.getProfile();
      setProfile(data);
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load profile information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <DashboardLayout
      pageTitle="Medical Officer Profile"
      subtitle="Credentials, assigned jurisdiction, and administrative details"
    >
      {error && <ErrorCard message={error} onRetry={fetchProfile} />}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <SkeletonCard height="220px" />
          <SkeletonCard height="220px" />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* PERSONAL & PROFESSIONAL IDENTITY CARD */}
          <div className="card-base" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: '#e0f2fe',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.35rem',
                }}
              >
                {(profile?.fullName || 'Dr').charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  {profile?.fullName || 'Medical Officer'}
                </h3>
                <div style={{ fontSize: '0.825rem', color: '#0284c7', fontWeight: 700, marginTop: '2px' }}>
                  {profile?.designation || 'Medical Officer'} &bull; {profile?.specialization || 'General Medicine'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Doctor ID</span>
                <strong style={{ fontFamily: 'monospace', color: '#0f172a' }}>
                  {profile?.doctorId || 'DOC-001'}
                </strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Username</span>
                <strong style={{ color: '#0f172a' }}>{profile?.username}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Contact Phone</span>
                <strong style={{ color: '#0f172a' }}>{profile?.phone || '—'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Account Status</span>
                <StatusBadge status={profile?.accountStatus || 'ACTIVE'} size="small" />
              </div>
            </div>
          </div>

          {/* FACILITY POSTING DETAILS CARD */}
          <div className="card-base" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  backgroundColor: '#f0fdfa',
                  color: '#0d9488',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Building size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Assigned Healthcare Centre
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Current Administrative Posting
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Facility Name</span>
                <strong style={{ color: '#0f172a' }}>{profile?.facility?.name || 'Assigned PHC'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Facility Type</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: '#0284c7',
                    backgroundColor: '#e0f2fe',
                    padding: '2px 8px',
                    borderRadius: '6px',
                  }}
                >
                  {profile?.facility?.type || 'PHC'}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>Taluk</span>
                <strong style={{ color: '#0f172a' }}>{profile?.facility?.taluk || '—'}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ color: '#64748b', fontSize: '0.875rem' }}>District</span>
                <strong style={{ color: '#0f172a' }}>{profile?.facility?.district || 'Tamil Nadu'}</strong>
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <button
                type="button"
                onClick={() => navigate('/doctor/facility')}
                className="btn btn-secondary"
                style={{ width: '100%', gap: '8px' }}
              >
                <Building size={16} />
                <span>View Full Facility Details</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
