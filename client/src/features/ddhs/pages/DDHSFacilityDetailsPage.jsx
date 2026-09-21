import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../layouts/DashboardLayout';
import StatusBadge from '../../../components/common/StatusBadge';
import { SkeletonCard, SkeletonTable } from '../../../components/common/LoadingSkeleton';
import EmptyState from '../../../components/common/EmptyState';
import ErrorCard from '../../../components/common/ErrorCard';
import { ddhsService } from '../services/ddhsService';
import { alertService } from '../../alerts/services/alertService';
import {
  Building2,
  MapPin,
  Users,
  Stethoscope,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  User,
} from 'lucide-react';

export default function DDHSFacilityDetailsPage() {
  const { facilityId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError('');
      const [facilityRes, alertRes] = await Promise.all([
        ddhsService.getFacilityById(facilityId),
        alertService.getAlerts({
          facilityId,
          date: new Date().toISOString().slice(0, 10),
        }),
      ]);

      setData(facilityRes);
      setAlerts(alertRes?.alerts || []);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load facility details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [facilityId]);

  const facility = data?.facility || {};
  const doctors = data?.doctors || [];
  const serviceStatus = data?.serviceStatus;

  return (
    <DashboardLayout
      pageTitle={facility.name || 'Facility Details'}
      subtitle={`Code: ${facility.id || facilityId} &bull; ${facility.facility_type || 'PHC'} &bull; ${facility.taluk_name || ''}`}
      headerRight={
        <button
          type="button"
          onClick={() => navigate('/ddhs/facilities')}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} />
          <span>Back to Facilities</span>
        </button>
      }
    >
      {error && <ErrorCard message={error} onRetry={fetchDetails} />}

      {loading ? (
        <div>
          <SkeletonCard height="160px" />
          <div style={{ marginTop: '1.5rem' }}>
            <SkeletonTable rows={4} columns={5} />
          </div>
        </div>
      ) : (
        <>
          {/* FACILITY OVERVIEW HERO */}
          <div
            className="card-base"
            style={{
              padding: '1.75rem',
              marginBottom: '1.5rem',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
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
                  {facility.facility_type}
                </span>
                <StatusBadge
                  status={facility.status === 'ACTIVE' ? 'OPERATIONAL' : facility.status}
                  size="small"
                />
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.5rem' }}>
                {facility.name}
              </h2>
              <div style={{ fontSize: '0.875rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MapPin size={14} color="#0284c7" />
                <span>{facility.address || 'Address not specified'}</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Taluk</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {facility.taluk_name || 'N/A'}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>District</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                  {facility.district_name || 'Tamil Nadu'}
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Doctor Staffing</div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
                  {doctors.length} Assigned
                </div>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: '10px' }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Service Reporting</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>
                  <StatusBadge
                    status={serviceStatus?.submitted ? 'SUBMITTED' : 'NOT_SUBMITTED'}
                    size="small"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ASSIGNED DOCTORS SECTION */}
          <div className="card-base" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Stethoscope size={20} color="#0284c7" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Assigned Medical Officers ({doctors.length})
              </h3>
            </div>

            {doctors.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No Doctors Assigned"
                description="There are currently no medical officers assigned to this health centre."
              />
            ) : (
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Doctor Name</th>
                      <th>Doctor ID</th>
                      <th>Designation</th>
                      <th>Specialization</th>
                      <th>Contact</th>
                      <th>Today's Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doctors.map((doc) => (
                      <tr key={doc.id || doc.doctor_id}>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>
                          {doc.full_name || doc.doctor_name || doc.name}
                        </td>
                        <td style={{ fontFamily: 'monospace', color: '#64748b' }}>
                          {doc.doctor_code || doc.doctor_id || 'DOC-00' + doc.id}
                        </td>
                        <td>{doc.designation || 'Medical Officer'}</td>
                        <td>{doc.specialization || 'General Medicine'}</td>
                        <td>
                          {doc.phone ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                              <Phone size={12} color="#64748b" />
                              <span>{doc.phone}</span>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td>
                          <StatusBadge status={doc.attendance_status || 'NOT_MARKED'} size="small" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* FACILITY ALERTS SECTION */}
          <div className="card-base" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <AlertTriangle size={20} color="#dc2626" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Active Alerts for this Facility ({alerts.length})
              </h3>
            </div>

            {alerts.length === 0 ? (
              <EmptyState
                icon={CheckCircle2}
                title="No Active Alerts"
                description="This facility has no open absenteeism or operational alerts for today."
              />
            ) : (
              <div className="table-container">
                <table className="modern-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Doctor</th>
                      <th>Severity</th>
                      <th>Status</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {alerts.map((alt) => (
                      <tr key={alt.id}>
                        <td>{alt.alert_date}</td>
                        <td style={{ fontWeight: 600 }}>{alt.doctor_name || 'N/A'}</td>
                        <td>
                          <StatusBadge status={alt.severity} size="small" />
                        </td>
                        <td>
                          <StatusBadge status={alt.status} size="small" />
                        </td>
                        <td style={{ color: '#475569' }}>{alt.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
