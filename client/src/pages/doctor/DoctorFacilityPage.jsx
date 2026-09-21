import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import { SkeletonCard } from '../../components/common/LoadingSkeleton';
import ErrorCard from '../../components/common/ErrorCard';
import { doctorService } from '../../services/doctorService';
import {
  Building2,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Users,
  Compass,
} from 'lucide-react';

export default function DoctorFacilityPage() {
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchFacility = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await doctorService.getFacility();
      setFacility(data);
    } catch (fetchError) {
      setError(fetchError.message || 'Unable to load facility details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacility();
  }, []);

  return (
    <DashboardLayout
      pageTitle="Assigned Healthcare Facility"
      subtitle="Jurisdiction, geographical posting, and operational facility status"
    >
      {error && <ErrorCard message={error} onRetry={fetchFacility} />}

      {loading ? (
        <SkeletonCard height="240px" />
      ) : (
        <div className="card-base" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '14px',
                backgroundColor: '#e0f2fe',
                color: '#0284c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Building2 size={26} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {facility?.name || 'Healthcare Centre'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
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
                  {facility?.facilityType || 'PHC'}
                </span>
                <StatusBadge status={facility?.status || 'ACTIVE'} size="small" />
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
              backgroundColor: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>District</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {facility?.district || 'Tamil Nadu'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Taluk</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {facility?.taluk || '—'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Physical Address</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                {facility?.address || 'Primary Health Centre Campus'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Operational Status</div>
              <div style={{ marginTop: '4px' }}>
                <StatusBadge status="OPERATIONAL" size="small" />
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
